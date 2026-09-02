<?php

namespace App\Http\Controllers\Private;

use App\Enums\MatterStage;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Matter;
use App\Services\MatterStageService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MatterStageController extends Controller
{
    public function __construct(
        protected MatterStageService $stageService
    ) {}

    /**
     * Advance the matter to its next lifecycle stage.
     * The service enforces rules, sets timestamps, and writes the audit trail.
     */
    public function advance(Request $request, Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersUpdate),
            403
        );

        $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->stageService->advance(
            matter: $matter,
            by: auth()->user(),
            notes: $request->notes,
        );

        return back()->with('success', "Matter advanced to {$matter->fresh()->stage->label()}.");
    }

    /**
     * Move the matter to a specific stage.
     * Used for partner overrides, corrections, or reopening from archive.
     */
    public function moveTo(Request $request, Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersUpdate),
            403
        );

        $validated = $request->validate([
            'stage' => ['required', Rule::enum(MatterStage::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $stage = MatterStage::from($validated['stage']);

        $this->stageService->moveTo(
            matter: $matter,
            stage: $stage,
            by: auth()->user(),
            notes: $validated['notes'] ?? null,
        );

        return back()->with('success', "Matter moved to {$stage->label()}.");
    }
}
