<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_role', function (Blueprint $table) {
            $table->id();

            // The role this grant belongs to
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();

            // A capability key from App\Enums\Permission (coming in 4.3)
            $table->string('permission');

            $table->timestamps();

            // A role can't hold the same permission twice
            $table->unique(['role_id', 'permission']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_role');
    }
};
