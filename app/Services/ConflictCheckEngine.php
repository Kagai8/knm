<?php

namespace App\Services;

use App\Enums\ConflictResolution;
use App\Enums\MatchConfidence;
use App\Models\Client;
use App\Models\ConflictCheckResult;
use App\Models\Contact;
use App\Models\Enquiry;
use App\Models\Matter;
use Illuminate\Support\Collection;

class ConflictCheckEngine
{
    /**
     * Run a full conflict check for the given enquiry.
     * Returns all matches found (or an empty collection if clean).
     */
    public function check(Enquiry $enquiry): Collection
    {
        // Clear any previous results for this enquiry
        $enquiry->conflictResults()->delete();

        $matches = collect();

        // Search across all three entity types
        $matches = $matches->merge($this->checkClients($enquiry));
        $matches = $matches->merge($this->checkContacts($enquiry));
        $matches = $matches->merge($this->checkMatters($enquiry));

        // Update the enquiry's conflict status
        $enquiry->update([
            'conflict_status' => $matches->isEmpty() ? 'cleared' : 'flagged',
        ]);

        return $matches;
    }

    /**
     * Search for matching clients.
     */
    private function checkClients(Enquiry $enquiry): Collection
    {
        $matches = collect();

        $clients = Client::query()
            ->where(function ($q) use ($enquiry) {
                if ($enquiry->name) {
                    $q->orWhere('name', 'ilike', "%{$enquiry->name}%");
                }
                if ($enquiry->email) {
                    $q->orWhere('email', 'ilike', $enquiry->email);
                }
                if ($enquiry->phone) {
                    $q->orWhere('phone', 'ilike', $enquiry->phone);
                }
                if ($enquiry->id_number) {
                    $q->orWhere('id_number', 'ilike', $enquiry->id_number);
                }
                if ($enquiry->company_name) {
                    $q->orWhere('company_name', 'ilike', "%{$enquiry->company_name}%");
                }
                if ($enquiry->company_registration) {
                    $q->orWhere('company_registration', 'ilike', $enquiry->company_registration);
                }
            })
            ->get();

        foreach ($clients as $client) {
            $confidence = $this->calculateConfidence($enquiry, $client->name, $client->email, $client->id_number);

            $matches->push(ConflictCheckResult::create([
                'enquiry_id' => $enquiry->id,
                'matched_type' => Client::class,
                'matched_id' => $client->id,
                'matched_name' => $client->name,
                'match_confidence' => $confidence,
                'resolution' => ConflictResolution::Pending,
            ]));
        }

        return $matches;
    }

    /**
     * Search for matching contacts.
     */
    private function checkContacts(Enquiry $enquiry): Collection
    {
        $matches = collect();

        $contacts = Contact::query()
            ->where(function ($q) use ($enquiry) {
                if ($enquiry->name) {
                    $q->orWhere('name', 'ilike', "%{$enquiry->name}%");
                }
                if ($enquiry->email) {
                    $q->orWhere('email', 'ilike', $enquiry->email);
                }
                if ($enquiry->phone) {
                    $q->orWhere('phone', 'ilike', $enquiry->phone);
                }
                if ($enquiry->company_name) {
                    $q->orWhere('company_name', 'ilike', "%{$enquiry->company_name}%");
                }
            })
            ->get();

        foreach ($contacts as $contact) {
            $confidence = $this->calculateConfidence($enquiry, $contact->name, $contact->email);

            $matches->push(ConflictCheckResult::create([
                'enquiry_id' => $enquiry->id,
                'matched_type' => Contact::class,
                'matched_id' => $contact->id,
                'matched_name' => $contact->name,
                'match_confidence' => $confidence,
                'resolution' => ConflictResolution::Pending,
            ]));
        }

        return $matches;
    }

    /**
     * Search for matching matters.
     */
    private function checkMatters(Enquiry $enquiry): Collection
    {
        $matches = collect();

        $matters = Matter::query()
            ->where(function ($q) use ($enquiry) {
                if ($enquiry->name) {
                    $q->orWhere('title', 'ilike', "%{$enquiry->name}%");
                }
                if ($enquiry->company_name) {
                    $q->orWhere('title', 'ilike', "%{$enquiry->company_name}%");
                }
            })
            ->get();

        foreach ($matters as $matter) {
            $confidence = MatchConfidence::Medium;

            $matches->push(ConflictCheckResult::create([
                'enquiry_id' => $enquiry->id,
                'matched_type' => Matter::class,
                'matched_id' => $matter->id,
                'matched_name' => $matter->title,
                'match_confidence' => $confidence,
                'resolution' => ConflictResolution::Pending,
            ]));
        }

        return $matches;
    }

    /**
     * Calculate match confidence based on how the enquiry matches the record.
     */
    private function calculateConfidence(Enquiry $enquiry, ?string $name, ?string $email = null, ?string $idNumber = null): MatchConfidence
    {
        // Exact match on unique identifiers
        if ($enquiry->email && $email && strtolower($enquiry->email) === strtolower($email)) {
            return MatchConfidence::Exact;
        }

        if ($enquiry->id_number && $idNumber && $enquiry->id_number === $idNumber) {
            return MatchConfidence::Exact;
        }

        // High confidence on normalized name match
        if ($enquiry->name && $name) {
            $normalizedEnquiry = $this->normalize($enquiry->name);
            $normalizedMatch = $this->normalize($name);

            if ($normalizedEnquiry === $normalizedMatch) {
                return MatchConfidence::High;
            }

            // Medium confidence on partial match
            if (str_contains($normalizedMatch, $normalizedEnquiry) || str_contains($normalizedEnquiry, $normalizedMatch)) {
                return MatchConfidence::Medium;
            }
        }

        return MatchConfidence::Low;
    }

    /**
     * Normalize a string for comparison (lowercase, trim, remove extra spaces).
     */
    private function normalize(string $value): string
    {
        return strtolower(trim(preg_replace('/\s+/', ' ', $value)));
    }
}
