<?php

namespace App\Models;

use App\Enums\MatterStage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatterStatusHistory extends Model
{
    use HasFactory;

    // Laravel would normally guess "matter_status_histories", so we explicitly set the table name.
    protected $table = 'matter_status_history';

    protected $fillable = [
        'matter_id',
        'stage_from',
        'stage_to',
        'changed_by_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'stage_from' => MatterStage::class,
            'stage_to' => MatterStage::class,
        ];
    }

    /**
     * The matter this history entry belongs to.
     */
    public function matter(): BelongsTo
    {
        return $this->belongsTo(Matter::class);
    }

    /**
     * The staff member who made the stage transition.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_id');
    }
}
