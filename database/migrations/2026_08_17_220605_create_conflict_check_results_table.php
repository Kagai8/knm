<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conflict_check_results', function (Blueprint $table) {
            $table->id();

            // The enquiry this check belongs to
            $table->foreignId('enquiry_id')->constrained()->cascadeOnDelete();

            // What kind of record matched: client / contact / matter
            $table->string('matched_type');

            // The id of the matched record
            $table->unsignedBigInteger('matched_id');

            // Snapshot of the matched name at check time (for the audit trail)
            $table->string('matched_name');

            // How strong the match is: exact / high / medium / low
            $table->string('match_confidence');

            // How the triager resolved it: pending / false_positive / actual_conflict
            $table->string('resolution')->default('pending');

            $table->text('resolution_notes')->nullable();

            // Who reviewed and resolved it
            $table->foreignId('resolved_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // Look up all results for an enquiry
            $table->index('enquiry_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conflict_check_results');
    }
};
