<?php

namespace App\Http\Controllers\Private\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\MatterRole;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MatterRoleController extends Controller
{
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MatterRolesManage),
            403
        );
    }

    public function index(Request $request): Response
    {
        $this->guard();

        $roles = MatterRole::query()
            ->orderBy('name')
            ->get()
            ->map(fn (MatterRole $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'code' => $role->code,
                'is_active' => $role->is_active,
                'matters_count' => $role->matters()->count(),
            ]);

        return Inertia::render('private/admin/MatterRoles', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:matter_roles,name'],
            'is_active' => ['required', 'boolean'],
        ]);

        // Auto-generate the machine code from the name (e.g., "Lead Advocate" -> "lead_advocate")
        $validated['code'] = Str::snake(Str::lower($validated['name']));

        MatterRole::create($validated);

        return back()->with('success', 'Matter role created.');
    }

    public function update(Request $request, MatterRole $matterRole)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:matter_roles,name,' . $matterRole->id],
            'is_active' => ['required', 'boolean'],
        ]);

        $matterRole->update($validated);

        return back()->with('success', 'Matter role updated.');
    }

    public function destroy(MatterRole $matterRole)
    {
        $this->guard();

        if ($matterRole->matters()->exists()) {
            return back()->with('error', "Cannot delete \"{$matterRole->name}\": it is currently assigned to team members. Deactivate it instead.");
        }

        $matterRole->delete();

        return back()->with('success', 'Matter role deleted.');
    }
}
