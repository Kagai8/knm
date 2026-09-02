<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Type: individual or company (explicit, not implicit)
            $table->string('type')->default('individual')->after('id');

            // CRM notes
            $table->text('notes')->nullable()->after('status');

            // Audit trail
            $table->foreignId('created_by_id')->nullable()->after('notes')->constrained('users')->nullOnDelete();

            // Billing fields (ready for Section E)
            $table->string('tax_pin')->nullable()->after('company_registration');
            $table->string('vat_number')->nullable()->after('tax_pin');

            // Company fields
            $table->string('website')->nullable()->after('address');
            $table->string('industry')->nullable()->after('website');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['created_by_id']);
            $table->dropColumn([
                'type',
                'notes',
                'created_by_id',
                'tax_pin',
                'vat_number',
                'website',
                'industry',
            ]);
        });
    }
};
