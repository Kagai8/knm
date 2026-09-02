<?php

namespace App\Providers;

use App\Enums\Permission;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Dynamic Gates — one Gate per Permission enum case.
        |--------------------------------------------------------------------------
        |
        | This means adding a new permission to the Permission enum automatically
        | makes it available as a Gate. No manual Gate::define() calls needed.
        |
        */
        foreach (Permission::cases() as $permission) {
            Gate::define($permission->value, fn ($user) => $user->hasPermission($permission));
        }

        /*
        |--------------------------------------------------------------------------
        | Super Admin bypass — already handled in hasPermission(), but we also
        | register a before() hook so Gates return true immediately without
        | hitting the DB/cache for Super Admin users.
        |--------------------------------------------------------------------------
        */
        Gate::before(function ($user, $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });
    }
}
