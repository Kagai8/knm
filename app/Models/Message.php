<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'parent_id',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Relationships                                                       */
    /* ------------------------------------------------------------------ */

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Message::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    /**
     * Users who have read this message (blue checkmarks).
     */
    public function readBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_reads')
            ->withPivot('read_at');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Check if this message has a file attachment.
     */
    public function hasAttachment(): bool
    {
        return !empty($this->file_path);
    }

    /**
     * Get the full URL to the attached file.
     */
    public function fileUrl(): ?string
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    /**
     * Format file size for display (e.g., "1.5 MB").
     */
    public function formattedFileSize(): ?string
    {
        if (!$this->file_size) return null;

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $i = 0;

        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }

        return round($size, 2) . ' ' . $units[$i];
    }

    /**
     * Check if this is a reply to another message.
     */
    public function isReply(): bool
    {
        return !is_null($this->parent_id);
    }


    /**
     * Has a specific user read this message?
     */
    public function isReadBy(User $user): bool
    {
        return $this->readBy()->where('users.id', $user->id)->exists();
    }

    /**
     * Payload shape used by the thread UI (bubbles, receipts, attachments).
     */
    public function toThreadPayload(User $viewer): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'sender' => ['id' => $this->sender->id, 'name' => $this->sender->name],
            'is_mine' => $this->sender_id === $viewer->id,
            'created_at' => $this->created_at->toIso8601String(),
            'file' => $this->hasAttachment() ? [
                'url' => $this->fileUrl(),
                'name' => $this->file_name,
                'size' => $this->formattedFileSize(),
                'type' => $this->file_type,
            ] : null,
            'parent' => $this->parent ? [
                'id' => $this->parent->id,
                'body' => $this->parent->body,
                'sender' => ['id' => $this->parent->sender->id, 'name' => $this->parent->sender->name],
            ] : null,
            'read_by' => $this->readBy->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'read_at' => $u->pivot->read_at,
            ]),
        ];
    }

}
