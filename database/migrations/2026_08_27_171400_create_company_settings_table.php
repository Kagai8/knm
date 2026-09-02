<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();

            // Firm identity
            $table->string('firm_name')->default('K&A Advocates');
            $table->string('firm_code', 10)->default('KAA');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();

            // Branding
            $table->string('logo_path')->nullable();
            $table->string('primary_color', 7)->default('#891920');
            $table->string('secondary_color', 7)->default('#D4AF37');

            // Legal
            $table->string('registration_number')->nullable();
            $table->string('tax_pin')->nullable();
            $table->string('jurisdiction')->default('Kenya');

            // File number format (future flexibility)
            $table->string('file_number_format')->default('{firm_code}/{practice_code}/{year}/{sequence}');
            $table->integer('file_number_sequence_length')->default(3);

            $table->timestamps();
        });

        // Insert the default settings record
        \App\Models\CompanySettings::create([
            'firm_name' => 'K&A Advocates',
            'firm_code' => 'KAA',
            'email' => 'info@knmadvocates.co.ke',
            'phone' => '+254 20 123 4567',
            'address' => "Westlands Business Hub\n5th Floor, Waiyaki Way\nNairobi, Kenya",
            'website' => 'https://knmadvocates.co.ke',
            'jurisdiction' => 'Kenya',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
