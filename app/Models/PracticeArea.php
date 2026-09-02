<?php

namespace App\Models;

use App\Models\Enquiry;
use App\Models\Matter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'division_head_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * The partner who leads this division.
     */
    public function divisionHead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'division_head_id');
    }

    /**
     * Enquiries routed to this division.
     */
    public function enquiries(): HasMany
    {
        return $this->hasMany(Enquiry::class);
    }

    /**
     * Matters opened in this division.
     */
    public function matters(): HasMany
    {
        return $this->hasMany(Matter::class);
    }
}
