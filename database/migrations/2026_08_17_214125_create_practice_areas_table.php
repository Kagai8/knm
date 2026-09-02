<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('practice_areas', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Conveyancing & Financial Services"
            $table->string('code')->unique(); // e.g., "CV" (used in file numbers)
            $table->text('description')->nullable();

            // The partner who leads this division (nullable in case it's vacant)
            $table->foreignId('division_head_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_areas');
    }
};
