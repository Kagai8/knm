<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'quincykagai@kaadvocates.co.ke'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'), // Change this immediately after first login
                'role_id' => \App\Models\Role::where('name', 'Super Admin')->first()->id, 'is_super_admin' => true,
                'title' => 'Super Admin',
            ]
        );
    }
}
