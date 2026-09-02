<?php

namespace App\Models;

use App\Enums\ContactType;
use App\Models\Matter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'company_name',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'type' => ContactType::class,
        ];
    }

    /**
     * Matters this contact is involved in (opposing party, witness, etc.)
     */
    public function matters(): BelongsToMany
    {
        return $this->belongsToMany(Matter::class, 'matter_contacts')
                    ->withPivot('role')
                    ->withTimestamps();
    }
}
