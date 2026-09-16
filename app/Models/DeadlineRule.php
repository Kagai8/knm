<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeadlineRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'calendar_event_type_id',
        'title_template',
        'offset_days',
        'is_all_day',
        'follow_up_type_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'offset_days' => 'integer',
            'is_all_day' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The event type that triggers this rule.
     */
    public function triggerType(): BelongsTo
    {
        return $this->belongsTo(CalendarEventType::class, 'calendar_event_type_id');
    }

    /**
     * The event type assigned to generated deadlines (null = same as trigger).
     */
    public function followUpType(): BelongsTo
    {
        return $this->belongsTo(CalendarEventType::class, 'follow_up_type_id');
    }

    /**
     * Human-readable offset, e.g. "3 days before" / "2 days after".
     */
    public function offsetLabel(): string
    {
        $days = abs($this->offset_days);
        $unit = $days === 1 ? 'day' : 'days';

        if ($this->offset_days === 0) {
            return 'Same day';
        }

        return $this->offset_days < 0
            ? "{$days} {$unit} before"
            : "{$days} {$unit} after";
    }
}
