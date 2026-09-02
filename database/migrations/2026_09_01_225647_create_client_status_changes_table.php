<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_status_changes', function (Blueprint $table) {
            $table->id();

            // The client whose status changed
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();

            // Previous status (nullable — the first "created" entry has no prior status)
            $table->string('from_status')->nullable();

            // New status
            $table->string('to_status');

            // Who made the change
            $table->foreignId('changed_by_id')->nullable()->constrained('users')->nullOnDelete();

            // Optional reason (e.g., "Client moved overseas" or "Project completed")
            $table->text('reason')->nullable();

            $table->timestamps();

            // Fast lookup: "show me all status changes for client #42"
            $table->index(['client_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_status_changes');
    }
};
