<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySettings extends Model
{
    use HasFactory;

    protected $fillable = [
        // Firm identity
        'firm_name',
        'firm_code',
        'tagline',
        'email',
        'phone',
        'address',
        'po_box',
        'business_hours',
        'website',
        'footer_disclaimer',

        // Social media & web presence
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
        'tiktok_url',
        'youtube_url',
        'whatsapp_number',
        'google_business_url',

        // Branding
        'logo_path',
        'primary_color',
        'secondary_color',

        // Legal & financial
        'registration_number',
        'tax_pin',
        'vat_number',
        'jurisdiction',
        'currency',
        'bank_name',
        'bank_account_number',
        'bank_branch',
        'swift_code',

        // File number format
        'file_number_format',
        'file_number_sequence_length',
    ];

    /**
     * Get the singleton company settings record.
     * Creates it if it doesn't exist (shouldn't happen after migration, but safe).
     */
    public static function current(): self
    {
        return static::first() ?? static::create([
            'firm_name' => 'K&A Advocates',
            'firm_code' => 'KAA',
        ]);
    }
}
