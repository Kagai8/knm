<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deadline_rules', function (Blueprint $table) {
            $table->id();

            // The event type that triggers this rule (e.g. Court Hearing)
            $table->foreignId('calendar_event_type_id')->constrained()->cascadeOnDelete();

            // Title template for the generated deadline. Supports {title} placeholder.
            $table->string('title_template');

            // Days relative to the trigger event. Negative = before, positive = after.
            $table->integer('offset_days');

            // Should the generated deadline be an all-day event?
            $table->boolean('is_all_day')->default(true);

            // Optional: which event type the generated deadline should use.
            // Null = use the trigger event's type.
            $table->foreignId('follow_up_type_id')->nullable()->constrained('calendar_event_types')->nullOnDelete();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // Lineage tracking: which event auto-generated this one (prevents rule chains)
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->foreignId('source_event_id')->nullable()->constrained('calendar_events')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropForeign(['source_event_id']);
            $table->dropColumn('source_event_id');
        });

        Schema::dropIfExists('deadline_rules');
    }
};
