<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CalendarEventType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'color',
        'is_deadline',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_deadline' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

        /**
     * All calendar events that use this type.
     */
    public function events()
    {
        return $this->hasMany(CalendarEvent::class, 'calendar_event_type_id');
    }
}
