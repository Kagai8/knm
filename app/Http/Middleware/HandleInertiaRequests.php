<?php

namespace App\Http\Middleware;

use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role_label' => $user->assignedRole?->name ?? 'Client',
                    'is_super_admin' => (bool) $user->is_super_admin,

                    // The critical addition: resolved permission keys for the frontend
                    'permissions' => $this->resolvePermissions($user),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Resolve the permission keys for the given user.
     * Super admin gets all permissions (wildcard '*').
     * Otherwise, pull from the permission_role pivot via the RolePermission model.
     */
    private function resolvePermissions($user): array
    {
        if ($user->is_super_admin) {
            return ['*']; // Wildcard: can do everything
        }

        if (! $user->role_id) {
            return []; // No role = no permissions
        }

        // Use the cached helper we built in Phase 4
        return RolePermission::permissionsFor($user->assignedRole);
    }
}
