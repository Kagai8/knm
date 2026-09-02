<?php

namespace App\Services;

use App\Enums\MatterStage;
use App\Models\Matter;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MatterStageService
{
    /**
     * Advance a matter to its next lifecycle stage.
     */
    public function advance(Matter $matter, User $by, ?string $notes = null): Matter
    {
        $next = $matter->stage->next();

        if (! $next) {
            throw new \RuntimeException(
                "Matter {$matter->file_number} is already at the final stage."
            );
        }

        return $this->moveTo($matter, $next, $by, $notes);
    }

    /**
     * Move a matter to a specific stage, with full audit logging.
     */
    public function moveTo(Matter $matter, MatterStage $stage, User $by, ?string $notes = null): Matter
    {
        if ($matter->stage === $stage) {
            return $matter; // Nothing to do
        }

        return DB::transaction(function () use ($matter, $stage, $by, $notes) {
            $from = $matter->stage;

            // Write the audit trail first
            $matter->statusHistory()->create([
                'stage_from' => $from->value,
                'stage_to' => $stage->value,
                'changed_by_id' => $by->id,
                'notes' => $notes,
            ]);

            // Apply lifecycle timestamps based on the destination stage
            $matter->stage = $stage;

            if ($stage->value === 'active_work' && ! $matter->opened_at) {
                $matter->opened_at = now();
            }

            if ($stage->value === 'closure') {
                $matter->closed_at = now();
                $matter->status = 'closed';
            }

            if ($stage->value === 'archive') {
                $matter->archived_at = now();
                $matter->status = 'archived';
            }

            // Reopening from closure/archive puts it back to open
            if (in_array($from->value, ['closure', 'archive'], true) && $stage->isActive()) {
                $matter->status = 'open';
            }

            $matter->save();

            return $matter;
        });
    }
}
