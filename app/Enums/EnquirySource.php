<?php

namespace App\Enums;

enum EnquirySource: string
{
    case WebForm = 'web_form';
    case Phone = 'phone';
    case Email = 'email';
    case WalkIn = 'walk_in';
    case Referral = 'referral';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::WebForm => 'Website Form',
            self::Phone => 'Phone Call',
            self::Email => 'Email',
            self::WalkIn => 'Walk-In',
            self::Referral => 'Referral',
            self::Other => 'Other',
        };
    }

    /**
     * A short description shown in tooltips or detail views.
     */
    public function description(): string
    {
        return match ($this) {
            self::WebForm => 'Submitted via the public contact form',
            self::Phone => 'Captured from a phone conversation',
            self::Email => 'Received via email correspondence',
            self::WalkIn => 'Client visited the office in person',
            self::Referral => 'Referred by an existing client or partner',
            self::Other => 'Other source not specified',
        };
    }
}
