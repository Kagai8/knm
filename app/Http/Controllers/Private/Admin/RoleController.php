<?php

namespace App\Http\Controllers\Private\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Guard: only super admins or users with settings.manage may touch this controller.
     */
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::SettingsManage),
            403
        );
    }

    /**
     * Build the shared props for the roles page.
     */
    private function buildProps(Request $request): array
    {
        $search = $request->query('search');
        $sort = $request->query('sort', 'name');
        $direction = $request->query('direction', 'asc');

        $query = Role::withCount('users');

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Sort
        $allowedSorts = ['name', 'users_count', 'created_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $roles = $query->get();

        $formattedPermissions = [];
        foreach (Permission::grouped() as $group => $permissions) {
            $formattedPermissions[$group] = array_map(fn($p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ], $permissions);
        }

        $rolePermissions = [];
        foreach ($roles as $role) {
            $rolePermissions[$role->id] = RolePermission::permissionsFor($role);
        }

        return [
            'roles' => $roles,
            'groupedPermissions' => $formattedPermissions,
            'rolePermissions' => $rolePermissions,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ];
    }

    /**
     * Show the role management workspace and permission matrix.
     */
    public function index(Request $request): Response
    {
        $this->guard();

        return Inertia::render('private/admin/Roles', $this->buildProps($request));
    }

    /**
     * Create a new dynamic role.
     */
    public function store(Request $request)
    {
        $this->guard();

        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'description' => ['nullable', 'string'],
        ]);

        Role::create($request->only('name', 'description'));

        return redirect()->route('admin.roles.index');
    }

    /**
     * Update the permission matrix for a specific role.
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $this->guard();

        $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role->syncPermissions($request->permissions);

        return redirect()->route('admin.roles.index');
    }

    /**
     * Delete a role permanently (blocked if users are assigned).
     */
    public function destroy(Role $role)
    {
        $this->guard();

        // Check if any users have this role
        if ($role->users()->exists()) {
            return back()->with('error', 'Cannot delete role: users are currently assigned to it. Reassign them first.');
        }

        // Delete all permission grants for this role
        $role->permissionRows()->delete();
        Cache::forget('role_permissions:' . $role->id);

        // Delete the role
        $role->delete();

        return redirect()->route('admin.roles.index');
    }
}
