<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Enquiry;
use App\Models\Matter;
use Illuminate\Support\Facades\DB;

class EnquiryConversionService
{
    public function __construct(
        protected FileNumberGenerator $fileNumbers,
    ) {}

    /**
     * Convert an approved enquiry into a formal matter.
     * Returns the newly created matter.
     */
    public function convert(Enquiry $enquiry, ?int $leadAdvocateId = null): Matter
    {
        if (! $enquiry->canBeConverted()) {
            throw new \RuntimeException(
                "Enquiry #{$enquiry->id} cannot be converted. Current status: {$enquiry->status->value}"
            );
        }

        return DB::transaction(function () use ($enquiry, $leadAdvocateId) {
            // 1. Find or create the client from the enquiry details
            $client = $this->findOrCreateClient($enquiry);

            // 2. Resolve the practice area (from the enquiry, or fall back to first active)
            $practiceArea = $enquiry->practiceArea
                ?? \App\Models\PracticeArea::where('is_active', true)->first();

            // 3. Generate a unique file number
            $fileNumber = $this->fileNumbers->generate($practiceArea);

            // 4. Create the matter
            $matter = Matter::create([
                'file_number' => $fileNumber,
                'title' => $enquiry->name . ' — ' . ($practiceArea->name ?? 'General'),
                'client_id' => $client->id,
                'practice_area_id' => $practiceArea->id,
                'lead_advocate_id' => $leadAdvocateId,
                'description' => $enquiry->description ?? null,
                'created_from_enquiry_id' => $enquiry->id,
                'stage' => 'instruction',
                'status' => 'open',
                'opened_at' => now(),
            ]);

            // 5. Mark the enquiry as converted and link it to the matter
            $enquiry->update([
                'status' => 'converted',
                'converted_to_matter_id' => $matter->id,
            ]);

            return $matter;
        });
    }

    /**
     * Find an existing client by email / id_number / company registration,
     * or create a new one from the enquiry details.
     */
    protected function findOrCreateClient(Enquiry $enquiry): Client
    {
        // Try to match an existing client on unique identifiers first
        $client = null;

        if ($enquiry->email) {
            $client = Client::where('email', 'ilike', $enquiry->email)->first();
        }

        if (! $client && $enquiry->id_number) {
            $client = Client::where('id_number', $enquiry->id_number)->first();
        }

        if (! $client && $enquiry->company_registration) {
            $client = Client::where('company_registration', $enquiry->company_registration)->first();
        }

        // If no match, create a fresh client record
        if (! $client) {
            $client = Client::create([
                'name' => $enquiry->name,
                'email' => $enquiry->email,
                'phone' => $enquiry->phone,
                'id_number' => $enquiry->id_number,
                'company_name' => $enquiry->company_name,
                'company_registration' => $enquiry->company_registration,
                'status' => 'active',
            ]);
        }

        return $client;
    }
}
