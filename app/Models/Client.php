<?php

namespace App\Models;

use App\Enums\ClientStatus;
use App\Models\Matter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'email',
        'phone',
        'id_number',
        'company_name',
        'company_registration',
        'tax_pin',
        'vat_number',
        'address',
        'website',
        'industry',
        'notes',
        'created_by_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => ClientStatus::class,
        ];
    }


    /**
     * The staff member who created this client.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * All matters for this client.
     */
    public function matters(): HasMany
    {
        return $this->hasMany(Matter::class);
    }

    /**
     * Matters that are still open.
     */
    public function openMatters(): HasMany
    {
        return $this->matters()->where('status', 'open');
    }

    /**
     * Is this client a company (vs individual)?
     */
    public function isCompany(): bool
    {
        return $this->type === 'company';
    }

    /**
     * Get the display name (company_name for companies, name for individuals).
     */
    public function displayName(): string
    {
        return $this->isCompany() && $this->company_name
            ? $this->company_name
            : $this->name;
    }

        /**
     * Chronological history of status changes.
     */
    public function statusChanges()
    {
        return $this->hasMany(ClientStatusChange::class)->latest();
    }

        /**
     * Enquiries associated with this client (matched by email, ID number, or company registration).
     */
    public function enquiries()
    {
        $identifiers = array_filter([
            'email' => $this->email,
            'id_number' => $this->id_number,
            'company_registration' => $this->company_registration,
        ]);

        // If the client has no identifiers, return an empty query so we don't accidentally fetch all enquiries
        if (empty($identifiers)) {
            return \App\Models\Enquiry::whereRaw('1 = 0');
        }

        return \App\Models\Enquiry::query()->where(function ($q) use ($identifiers) {
            foreach ($identifiers as $column => $value) {
                if ($column === 'email') {
                    $q->orWhere('email', 'ilike', $value);
                } else {
                    $q->orWhere($column, $value);
                }
            }
        });
    }

        /**
     * The user account linked to this client (for portal login).
     * One user per client for now; extend to hasMany if multi-contact needed.
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class);
    }

}
