<?php

namespace App\Models;

use App\Enums\MatterStage;
use App\Enums\MatterStatus;
use App\Models\MatterStatusHistory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Matter extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_number',
        'title',
        'client_id',
        'practice_area_id',
        'stage',
        'status',
        'description',
        'lead_advocate_id',
        'opened_at',
        'closed_at',
        'archived_at',
        'created_from_enquiry_id',
    ];

    protected function casts(): array
    {
        return [
            'stage' => MatterStage::class,
            'status' => MatterStatus::class,
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Relationships                                                       */
    /* ------------------------------------------------------------------ */

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function practiceArea(): BelongsTo
    {
        return $this->belongsTo(PracticeArea::class);
    }

    public function leadAdvocate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_advocate_id');
    }

    public function createdFromEnquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class, 'created_from_enquiry_id');
    }

    /**
     * Staff assigned to this matter, with their role on the pivot.
     */
    public function team(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'matter_team')
                    ->withPivot(['matter_role_id', 'assigned_at'])
                    ->withTimestamps();
    }

    /**
     * Contacts involved in this matter (opposing parties, witnesses, etc.)
     */
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'matter_contacts')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Chronological stage change history.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(MatterStatusHistory::class)->orderBy('created_at');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    public function isActive(): bool
    {
        return $this->status->isWorkable() && $this->stage->isActive();
    }

    public function isArchived(): bool
    {
        return $this->status === MatterStatus::Archived || $this->stage->isFinal();
    }
}
