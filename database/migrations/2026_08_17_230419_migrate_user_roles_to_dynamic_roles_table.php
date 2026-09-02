<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add the new columns
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('role')->constrained('roles')->nullOnDelete();
            $table->boolean('is_super_admin')->default(false)->after('role_id');
        });

        // 2. Map existing users.role strings to role_ids
        User::whereNotNull('role')->chunk(100, function ($users) {
            foreach ($users as $user) {
                // Extract the string value from the UserRole enum
                $roleValue = $user->role->value;

                // Find the matching Role model by label
                $role = Role::where('name', $this->enumToLabel($roleValue))->first();

                if ($role) {
                    $user->update([
                        'role_id' => $role->id,
                        'is_super_admin' => $roleValue === 'super_admin',
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'is_super_admin']);
        });
    }

    /**
     * Convert UserRole enum value to its label (matching Role.name)
     */
    private function enumToLabel(string $enumValue): string
    {
        $map = [
            'super_admin' => 'Super Admin',
            'senior_advocate' => 'Senior Advocate',
            'senior_associate_advocate' => 'Senior Associate Advocate',
            'senior_legal_assistant' => 'Senior Legal Assistant',
            'legal_assistant' => 'Legal Assistant',
            'it_administrator' => 'IT Administrator',
            'administrative_assistant' => 'Administrative Assistant',
            'client' => 'Client',
        ];

        return $map[$enumValue] ?? ucfirst(str_replace('_', ' ', $enumValue));
    }
};
