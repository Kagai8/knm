<?php

namespace App\Http\Controllers\Private\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Guard: only super admins or users with users.manage may touch this controller.
     */
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::UsersManage),
            403
        );
    }

    /**
     * Build the shared props for the users page.
     */
    private function buildProps(Request $request): array
    {
        $search = $request->query('search');
        $sort = $request->query('sort', 'name');
        $direction = $request->query('direction', 'asc');

        $query = User::query()
            ->where(function ($q) {
                $q->whereNotNull('role_id')->orWhere('is_super_admin', true);
            })
            ->with('assignedRole');

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhereHas('assignedRole', fn ($q) => $q->where('name', 'ilike', "%{$search}%"));
            });
        }

        // Sort
        $allowedSorts = ['name', 'email', 'created_at', 'role'];
        if ($sort === 'role') {
            $query->join('roles', 'users.role_id', '=', 'roles.id')
                  ->orderBy('roles.name', $direction === 'desc' ? 'desc' : 'asc')
                  ->select('users.*');
        } elseif (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        return [
            'users' => $query->get(),
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'currentUserId' => auth()->id(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ];
    }

    /**
     * Show the user management workspace.
     */
    public function index(Request $request): Response
    {
        $this->guard();

        return Inertia::render('private/admin/Users', $this->buildProps($request));
    }

    /**
     * Create a new staff user.
     */
    public function store(Request $request)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role_id' => ['required', 'exists:roles,id'],
            'is_super_admin' => ['boolean'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'is_super_admin' => $validated['is_super_admin'] ?? false,
        ]);

        return redirect()->route('admin.users.index');
    }

    /**
     * Update an existing staff user.
     */
    public function update(Request $request, User $user)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role_id' => ['required', 'exists:roles,id'],
            'is_super_admin' => ['boolean'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        // Prevent self-lockout: you cannot strip your own super admin flag
        if ($user->id === auth()->id()) {
            $validated['is_super_admin'] = true;
        }

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'is_super_admin' => $validated['is_super_admin'] ?? false,
        ]);

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('admin.users.index');
    }

    /**
     * Disable a user (soft-disable: prevents login, preserves history).
     */
    public function disable(User $user)
    {
        $this->guard();

        // Cannot disable yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot disable your own account.');
        }

        $user->update(['is_disabled' => true]);

        return redirect()->route('admin.users.index');
    }

    /**
     * Enable a previously disabled user.
     */
    public function enable(User $user)
    {
        $this->guard();

        $user->update(['is_disabled' => false]);

        return redirect()->route('admin.users.index');
    }


    /**
     * Delete a user permanently (blocked if they have assignments).
     */
    public function destroy(User $user)
    {
        $this->guard();

        // Cannot delete yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Check for enquiry assignments
        $hasEnquiryAssignments = \App\Models\Enquiry::where('assigned_triager_id', $user->id)
            ->orWhere('assigned_partner_id', $user->id)
            ->orWhere('created_by_id', $user->id)
            ->exists();

        // Check for matter assignments (lead advocate or team member)
        $hasMatterAssignments = \App\Models\Matter::where('lead_advocate_id', $user->id)
            ->orWhereHas('team', fn ($q) => $q->where('users.id', $user->id))
            ->exists();

        if ($hasEnquiryAssignments || $hasMatterAssignments) {
            return back()->with('error', 'Cannot delete user: they have assigned enquiries or matters. Disable the account instead.');
        }

        $user->delete();

        return redirect()->route('admin.users.index');
    }
}
