<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_event_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Same person can't be listed twice on one event
            $table->unique(['calendar_event_id', 'user_id']);
        });

        // Backfill: every existing event's attendee becomes a pivot row
        DB::statement('
            INSERT INTO calendar_event_attendees (calendar_event_id, user_id, created_at, updated_at)
            SELECT id, attendee_id, NOW(), NOW()
            FROM calendar_events
            WHERE attendee_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_attendees');
    }
};
