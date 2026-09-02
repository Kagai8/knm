<?php

namespace App\Models;

use App\Enums\Permission;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class RolePermission extends Model
{
    public $timestamps = false;

    protected $table = 'permission_role';

    protected $fillable = [
        'role_id',
        'permission',
    ];

    protected function casts(): array
    {
        return [
            'permission' => Permission::class,
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn (self $rp) => Cache::forget('role_permissions:' . $rp->role_id));
        static::deleted(fn (self $rp) => Cache::forget('role_permissions:' . $rp->role_id));
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public static function grant(Role $role, Permission $permission): void
    {
        static::firstOrCreate([
            'role_id' => $role->id,
            'permission' => $permission->value,
        ]);
    }

    public static function revoke(Role $role, Permission $permission): void
    {
        static::where('role_id', $role->id)
            ->where('permission', $permission->value)
            ->delete();
    }

    public static function permissionsFor(Role $role): array
    {
        return Cache::rememberForever(
            'role_permissions:' . $role->id,
            fn () => static::where('role_id', $role->id)
                ->pluck('permission')
                ->map(fn ($p) => $p instanceof Permission ? $p->value : $p)
                ->all()
        );
    }
}
