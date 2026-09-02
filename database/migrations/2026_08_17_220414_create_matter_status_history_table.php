<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matter_status_history', function (Blueprint $table) {
            $table->id();

            // The matter this history belongs to
            $table->foreignId('matter_id')->constrained()->cascadeOnDelete();

            // Where it came from (null on initial creation)
            $table->string('stage_from')->nullable();

            // Where it moved to
            $table->string('stage_to');

            // Who made the change
            $table->foreignId('changed_by_id')->nullable()->constrained('users')->nullOnDelete();

            // Optional explanation for the change
            $table->text('notes')->nullable();

            $table->timestamps();

            // Chronological lookups per matter
            $table->index(['matter_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_status_history');
    }
};
