<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use Illuminate\Database\Seeder;

class MigrateRolesSeeder extends Seeder
{
    public function run(): void
    {
        foreach (UserRole::cases() as $enum) {
            Role::firstOrCreate(
                ['name' => $enum->label()],
                ['description' => 'Seeded from UserRole enum']
            );
        }
    }
}
