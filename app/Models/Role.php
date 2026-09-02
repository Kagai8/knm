<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Staff members holding this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Raw permission grant rows for this role.
     */
    public function permissionRows(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    /**
     * The permission keys this role holds.
     */
    public function permissionKeys(): array
    {
        return $this->permissionRows()->pluck('permission')
            ->map(fn ($p) => $p instanceof \App\Enums\Permission ? $p->value : $p)
            ->all();
    }

    /**
     * Does this role hold the given capability?
     */
    public function hasPermission(string $key): bool
    {
        return in_array($key, $this->permissionKeys(), true);
    }

    /**
     * Replace this role's permissions with the given keys.
     * Manually clears the cache because bulk delete() bypasses model events.
     */
    public function syncPermissions(array $keys): void
    {
        $this->permissionRows()->delete();
        Cache::forget('role_permissions:' . $this->id);

        if (! empty($keys)) {
            $this->permissionRows()->createMany(
                array_map(fn (string $key) => ['permission' => $key], $keys)
            );
        }
    }
}
