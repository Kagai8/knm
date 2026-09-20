<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'title',
        'is_group',
        'matter_id',
        'created_by_id',
    ];

    protected function casts(): array
    {
        return [
            'is_group' => 'boolean',
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Relationships                                                       */
    /* ------------------------------------------------------------------ */

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function matter(): BelongsTo
    {
        return $this->belongsTo(Matter::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['joined_at', 'muted_until', 'last_read_at'])
            ->withTimestamps();
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * The most recent message in this conversation (eager-load safe, one per conversation).
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latest();
    }

    /**
     * Check if a user is a participant in this conversation.
     */
    public function hasParticipant(User $user): bool
    {
        return $this->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Check if a user is muted in this conversation.
     */
    public function isUserMuted(User $user): bool
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();

        if (!$participant || !$participant->pivot->muted_until) {
            return false;
        }

        $mutedUntil = $participant->pivot->muted_until instanceof \Carbon\Carbon
            ? $participant->pivot->muted_until
            : \Carbon\Carbon::parse($participant->pivot->muted_until);

        return $mutedUntil->isFuture();
    }

    /**
     * Get unread message count for a user.
     */
    public function unreadCount(User $user): int
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();
        if (!$participant) return 0;

        $lastRead = $participant->pivot->last_read_at;

        return $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->when($lastRead, fn ($q) => $q->where('created_at', '>', $lastRead))
            ->count();
    }
}
