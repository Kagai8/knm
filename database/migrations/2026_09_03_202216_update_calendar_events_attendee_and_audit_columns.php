<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Drop the old FK, rename owner_id -> attendee_id
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->renameColumn('owner_id', 'attendee_id');
        });

        // 2) Re-add FK on attendee, add audit + notification columns
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->foreign('attendee_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('notify_client')->default(false);
        });

        // 3) Backfill: historically the creator was always the attendee
        DB::update('UPDATE calendar_events SET created_by_id = attendee_id');
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropForeign(['attendee_id']);
            $table->dropForeign(['created_by_id']);
            $table->dropColumn(['created_by_id', 'notify_client']);
            $table->renameColumn('attendee_id', 'owner_id');
        });

        Schema::table('calendar_events', function (Blueprint $table) {
            $table->foreign('owner_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
