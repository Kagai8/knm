<?php

namespace App\Http\Controllers\Private\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\PracticeArea;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeAreaController extends Controller
{
    /**
     * Guard: only super admins or users with practice_areas.manage may touch this controller.
     */
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::PracticeAreasManage),
            403
        );
    }

    /**
     * List all practice areas with search, sorting, and usage counts.
     */
    public function index(Request $request): Response
    {
        $this->guard();

        $search = $request->query('search');
        $sort = $request->query('sort', 'name');
        $direction = $request->query('direction', 'asc');

        $query = PracticeArea::query()
            ->with('divisionHead')
            ->withCount(['enquiries', 'matters']);

        // Search across name, code, and description
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Sorting (only allow safe columns)
        $allowedSorts = ['name', 'code', 'created_at', 'enquiries_count', 'matters_count'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        return Inertia::render('private/admin/PracticeAreas', [
            'practiceAreas' => $query->get(),
            // Division heads = partners (users who can approve matters)
            'divisionHeads' => User::withPermission(Permission::MattersApprove->value)
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Create a new practice area.
     */
    public function store(Request $request)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:practice_areas,name'],
            'code' => ['required', 'string', 'max:10', 'unique:practice_areas,code'],
            'description' => ['nullable', 'string'],
            'division_head_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
        ]);

        PracticeArea::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? null,
            'division_head_id' => $validated['division_head_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.practice-areas.index');
    }

    /**
     * Update an existing practice area.
     */
    public function update(Request $request, PracticeArea $practiceArea)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:practice_areas,name,' . $practiceArea->id],
            'code' => ['required', 'string', 'max:10', 'unique:practice_areas,code,' . $practiceArea->id],
            'description' => ['nullable', 'string'],
            'division_head_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
        ]);

        $practiceArea->update([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? null,
            'division_head_id' => $validated['division_head_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.practice-areas.index');
    }

    /**
     * Delete a practice area permanently.
     * Blocked if any enquiries or matters reference it — deactivate instead.
     */
    public function destroy(PracticeArea $practiceArea)
    {
        $this->guard();

        $enquiriesCount = $practiceArea->enquiries()->count();
        $mattersCount = $practiceArea->matters()->count();

        if ($enquiriesCount > 0 || $mattersCount > 0) {
            return back()->with('error', "Cannot delete: {$practiceArea->name} is used by {$enquiriesCount} enquiries and {$mattersCount} matters. Deactivate it instead.");
        }

        $practiceArea->delete();

        return redirect()->route('admin.practice-areas.index');
    }
}
