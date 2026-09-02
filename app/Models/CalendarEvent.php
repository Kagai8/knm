<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'starts_at',
        'ends_at',
        'is_all_day',
        'location',
        'calendar_event_type_id',
        'matter_id',
        'client_id',
        'owner_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_all_day' => 'boolean',
        ];
    }

    /**
     * The type of this event (court hearing, meeting, etc.).
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(CalendarEventType::class, 'calendar_event_type_id');
    }

    /**
     * The matter this event is linked to (if any).
     */
    public function matter(): BelongsTo
    {
        return $this->belongsTo(Matter::class);
    }

    /**
     * The client this event is linked to (if any).
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * The staff member who owns this event.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Is this a deadline-type event?
     */
    public function isDeadline(): bool
    {
        return $this->type?->is_deadline === true;
    }

    /**
     * Is this an all-day event?
     */
    public function isAllDay(): bool
    {
        return $this->is_all_day;
    }
}
