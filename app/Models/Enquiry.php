<?php

namespace App\Models;

use App\Enums\EnquirySource;
use App\Enums\EnquiryStatus;
use App\Enums\PreferredContact;
use App\Models\ConflictCheckResult;
use App\Models\Matter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Enquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'id_number',
        'company_name',
        'company_registration',
        'preferred_contact',
        'source',
        'status',
        'practice_area_id',
        'assigned_triager_id',
        'assigned_partner_id',
        'conflict_status',
        'conflict_notes',
        'rejection_reason',
        'converted_to_matter_id',
        'created_by_id',
    ];

    protected function casts(): array
    {
        return [
            'preferred_contact' => PreferredContact::class,
            'source' => EnquirySource::class,
            'status' => EnquiryStatus::class,
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Relationships                                                       */
    /* ------------------------------------------------------------------ */

    public function practiceArea(): BelongsTo
    {
        return $this->belongsTo(PracticeArea::class);
    }

    public function assignedTriager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_triager_id');
    }

    public function assignedPartner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_partner_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function convertedToMatter(): BelongsTo
    {
        return $this->belongsTo(Matter::class, 'converted_to_matter_id');
    }

    /**
     * The matter this enquiry spawned (via matters.created_from_enquiry_id).
     */
    public function matter(): HasOne
    {
        return $this->hasOne(Matter::class, 'created_from_enquiry_id');
    }

    /**
     * Individual conflict check matches for this enquiry.
     */
    public function conflictResults(): HasMany
    {
        return $this->hasMany(ConflictCheckResult::class);
    }

    /* ------------------------------------------------------------------ */
    /* Convenience helpers                                                 */
    /* ------------------------------------------------------------------ */

    public function isOpen(): bool
    {
        return $this->status->isOpen();
    }

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    public function canBeConverted(): bool
    {
        return $this->status->isConvertible();
    }
}
