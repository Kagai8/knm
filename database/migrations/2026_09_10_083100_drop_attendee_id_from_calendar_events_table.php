<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropForeign(['attendee_id']);
            $table->dropColumn('attendee_id');
        });
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->foreignId('attendee_id')->nullable()->constrained('users')->cascadeOnDelete();
        });

        // Restore from pivot (first attendee per event)
        DB::statement('
            UPDATE calendar_events ce
            SET attendee_id = (
                SELECT cea.user_id
                FROM calendar_event_attendees cea
                WHERE cea.calendar_event_id = ce.id
                ORDER BY cea.id
                LIMIT 1
            )
        ');
    }
};
