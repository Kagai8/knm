<?php

namespace App\Models;

use App\Enums\Permission;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'is_super_admin',
        'is_disabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_super_admin' => 'boolean',
            'is_disabled' => 'boolean',
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Dynamic role relationship                                           */
    /* ------------------------------------------------------------------ */

    /**
     * The user's dynamic role (from the roles table).
     */
    public function assignedRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /* ------------------------------------------------------------------ */
    /* Authorization                                                       */
    /* ------------------------------------------------------------------ */

    /**
     * Super admin bypasses every permission check.
     */
    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin;
    }

    /**
     * Does this user hold the given capability?
     * Super admin always passes. Otherwise check the dynamic role's grants.
     */
    public function hasPermission(Permission|string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $key = $permission instanceof Permission ? $permission->value : $permission;

        return $this->assignedRole?->hasPermission($key) ?? false;
    }

    /* ------------------------------------------------------------------ */
    /* Product boundary (staff vs client portal)                           */
    /* ------------------------------------------------------------------ */

    public function isStaff(): bool
    {
        // Staff is anyone who isn't a Super Admin bypass AND has a dynamic role that isn't "Client"
        return $this->isSuperAdmin() || ($this->assignedRole !== null && $this->assignedRole->name !== 'Client');
    }

    /* ------------------------------------------------------------------ */
    /* Scopes                                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Scope to users whose role holds the given permission.
     *
     * Usage: User::withPermission('enquiries.triage')->get()
     */
    public function scopeWithPermission($query, string $permissionKey)
    {
        return $query->whereNotNull('role_id')
            ->whereHas('assignedRole.permissionRows', function ($q) use ($permissionKey) {
                $q->where('permission', $permissionKey);
            });
    }

        /**
     * The matter role this user has on a specific matter (via pivot).
     */
    public function matterRole(): BelongsTo
    {
        return $this->belongsTo(MatterRole::class, 'matter_role_id');
    }

        /**
     * Calendar events this user is booked for.
     */
    public function calendarEvents(): BelongsToMany
    {
        return $this->belongsToMany(CalendarEvent::class, 'calendar_event_attendees', 'user_id', 'calendar_event_id')
            ->withTimestamps();
    }
}
