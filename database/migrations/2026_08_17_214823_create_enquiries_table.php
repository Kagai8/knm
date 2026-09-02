<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();

            // Prospect's basic details
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('id_number')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_registration')->nullable();

            // How they want to be contacted: phone / email / either
            $table->string('preferred_contact')->default('either');

            // Where it came from: web_form / phone / email / walk_in / referral
            $table->string('source')->default('web_form');

            // Pipeline status (App\Enums\EnquiryStatus)
            $table->string('status')->default('new');

            // Practice area identified during triage (nullable until triaged)
            $table->foreignId('practice_area_id')->nullable()->constrained()->nullOnDelete();

            // Who triages it, and which partner reviews it
            $table->foreignId('assigned_triager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_partner_id')->nullable()->constrained('users')->nullOnDelete();

            // Conflict check outcome: pending / cleared / flagged
            $table->string('conflict_status')->default('pending');
            $table->text('conflict_notes')->nullable();

            // If rejected, why — kept visible permanently for the record
            $table->text('rejection_reason')->nullable();

            // Once approved & converted, points at the matter.
            // (No constraint here — the matters table is created next, which points back at us.)
            $table->foreignId('converted_to_matter_id')->nullable();

            // Staff member who captured it (null for web form submissions)
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // Handy filters for the list page
            $table->index('status');
            $table->index('source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
