<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'created_by_id',
        'notify_client',
        'source_event_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_all_day' => 'boolean',
            'notify_client' => 'boolean',
        ];
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(CalendarEventType::class, 'calendar_event_type_id');
    }

    public function matter(): BelongsTo
    {
        return $this->belongsTo(Matter::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * The staff member who is booked for this event.
     * It appears on THEIR "My Calendar".
     */
    public function attendee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'attendee_id');
    }


    /**
     * ALL staff members booked for this event (multi-attendee).
     * It appears on EACH of their "My Calendar" views.
     */
    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'calendar_event_attendees', 'calendar_event_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * The staff member who created this event (audit trail).
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * The event that auto-generated this one via a deadline rule (null = manually created).
     */
    public function sourceEvent(): BelongsTo
    {
        return $this->belongsTo(CalendarEvent::class, 'source_event_id');
    }

    public function isDeadline(): bool
    {
        return $this->type?->is_deadline === true;
    }

    public function isAllDay(): bool
    {
        return $this->is_all_day;
    }


}
