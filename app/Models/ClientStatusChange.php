<?php

namespace App\Models;

use App\Enums\ClientStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientStatusChange extends Model
{
    protected $fillable = [
        'client_id',
        'from_status',
        'to_status',
        'changed_by_id',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'from_status' => ClientStatus::class,
            'to_status' => ClientStatus::class,
        ];
    }

    /**
     * The client whose status changed.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * The staff member who made the change.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_id');
    }
}
