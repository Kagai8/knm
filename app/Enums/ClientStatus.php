<?php

namespace App\Enums;

enum ClientStatus: string
{
    case Prospect = 'prospect';
    case Active = 'active';
    case Dormant = 'dormant';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Prospect => 'Prospect',
            self::Active => 'Active',
            self::Dormant => 'Dormant',
            self::Archived => 'Archived',
        };
    }

    /**
     * Tailwind classes for status badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Prospect => 'bg-blue-50 border-blue-200 text-blue-700',
            self::Active => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::Dormant => 'bg-amber-50 border-amber-200 text-amber-700',
            self::Archived => 'bg-slate-100 border-slate-300 text-slate-600',
        };
    }

    /**
     * Can new matters be opened for this client?
     */
    public function canOpenMatters(): bool
    {
        return in_array($this, [self::Prospect, self::Active, self::Dormant], true);
    }

    /**
     * Has this client been formally archived?
     */
    public function isArchived(): bool
    {
        return $this === self::Archived;
    }
}
