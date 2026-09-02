<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case Partner = 'partner';
    case Advocate = 'advocate';
    case Triager = 'triager';
    case AdminStaff = 'admin_staff';
    case Client = 'client';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Partner => 'Partner',
            self::Advocate => 'Advocate',
            self::Triager => 'Intake Triager',
            self::AdminStaff => 'Admin Staff',
            self::Client => 'Client',
        };
    }

    /**
     * Tailwind classes for role badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::SuperAdmin => 'bg-red-50 border-red-200 text-red-700',
            self::Partner => 'bg-purple-50 border-purple-200 text-purple-700',
            self::Advocate => 'bg-blue-50 border-blue-200 text-blue-700',
            self::Triager => 'bg-amber-50 border-amber-200 text-amber-700',
            self::AdminStaff => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::Client => 'bg-slate-100 border-slate-300 text-slate-600',
        };
    }

    /**
     * Can this user access the private staff workspace?
     */
    public function isStaff(): bool
    {
        return $this !== self::Client;
    }

    /**
     * Is this user part of firm management (can approve matters, see financials)?
     */
    public function isManagement(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Partner], true);
    }
}
