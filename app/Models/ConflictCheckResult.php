<?php

namespace App\Models;

use App\Enums\ConflictResolution;
use App\Enums\MatchConfidence;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ConflictCheckResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'enquiry_id',
        'matched_type',
        'matched_id',
        'matched_name',
        'match_confidence',
        'resolution',
        'resolution_notes',
        'resolved_by_id',
    ];

    protected function casts(): array
    {
        return [
            'match_confidence' => MatchConfidence::class,
            'resolution' => ConflictResolution::class,
        ];
    }

    /**
     * The enquiry this match belongs to.
     */
    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    /**
     * The staff member who reviewed and resolved this match.
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_id');
    }

    /**
     * The actual record that matched — a Client, Contact, or Matter.
     */
    public function matched(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Has this match been reviewed yet?
     */
    public function isPending(): bool
    {
        return $this->resolution === ConflictResolution::Pending;
    }
}
