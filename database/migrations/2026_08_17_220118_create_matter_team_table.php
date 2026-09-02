<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matter_team', function (Blueprint $table) {
            $table->id();

            // The matter
            $table->foreignId('matter_id')->constrained()->cascadeOnDelete();

            // The staff member assigned
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Their role on this matter (dynamic, from matter_roles)
            $table->foreignId('matter_role_id')->constrained()->restrictOnDelete();

            // When they were assigned
            $table->timestamp('assigned_at')->nullable();

            $table->timestamps();

            // Prevent the same person being assigned the same role twice on one matter
            $table->unique(['matter_id', 'user_id', 'matter_role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_team');
    }
};
