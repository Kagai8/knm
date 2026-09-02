<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('description')->nullable();

            // When it happens
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->boolean('is_all_day')->default(false);

            // Optional location (e.g., "Milimani Court Room 3", "Zoom")
            $table->string('location')->nullable();

            // The type of event (court hearing, meeting, deadline, etc.)
            $table->foreignId('calendar_event_type_id')
                ->constrained()
                ->restrictOnDelete();

            // Optional link to a matter
            $table->foreignId('matter_id')->nullable()->constrained()->nullOnDelete();

            // Optional link to a client
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();

            // Who owns this event (for own-vs-all permissions)
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            // Indexes for common queries
            $table->index(['starts_at', 'ends_at']);
            $table->index('owner_id');
            $table->index('matter_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
