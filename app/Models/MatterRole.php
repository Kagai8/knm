<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MatterRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Matters where this role is assigned.
     */
    public function matters(): BelongsToMany
    {
        return $this->belongsToMany(Matter::class, 'matter_team')
                    ->withPivot('user_id')
                    ->withTimestamps();
    }
}
