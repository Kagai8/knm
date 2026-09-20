<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationParticipant extends Model
{
    protected $table = 'conversation_participants';

    protected $fillable = [
        'conversation_id',
        'user_id',
        'joined_at',
        'muted_until',
        'last_read_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'muted_until' => 'datetime',
            'last_read_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Admin control: is this user currently muted in this conversation?
     */
    public function isMuted(): bool
    {
        return $this->muted_until !== null && $this->muted_until->isFuture();
    }
}