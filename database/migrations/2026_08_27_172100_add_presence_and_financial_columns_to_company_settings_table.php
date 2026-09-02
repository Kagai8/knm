<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            // Social media & web presence
            $table->string('facebook_url')->nullable()->after('website');
            $table->string('twitter_url')->nullable()->after('facebook_url');
            $table->string('instagram_url')->nullable()->after('twitter_url');
            $table->string('linkedin_url')->nullable()->after('instagram_url');
            $table->string('tiktok_url')->nullable()->after('linkedin_url');
            $table->string('youtube_url')->nullable()->after('tiktok_url');
            $table->string('whatsapp_number')->nullable()->after('youtube_url');
            $table->string('google_business_url')->nullable()->after('whatsapp_number');

            // Extended business info
            $table->string('tagline')->nullable()->after('firm_name');
            $table->string('po_box')->nullable()->after('address');
            $table->string('business_hours')->nullable()->after('po_box');
            $table->text('footer_disclaimer')->nullable()->after('business_hours');

            // Financial (used later by billing / invoices)
            $table->string('currency', 10)->default('KES')->after('jurisdiction');
            $table->string('vat_number')->nullable()->after('tax_pin');
            $table->string('bank_name')->nullable()->after('vat_number');
            $table->string('bank_account_number')->nullable()->after('bank_name');
            $table->string('bank_branch')->nullable()->after('bank_account_number');
            $table->string('swift_code')->nullable()->after('bank_branch');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url',
                'tiktok_url', 'youtube_url', 'whatsapp_number', 'google_business_url',
                'tagline', 'po_box', 'business_hours', 'footer_disclaimer',
                'currency', 'vat_number', 'bank_name', 'bank_account_number',
                'bank_branch', 'swift_code',
            ]);
        });
    }
};
