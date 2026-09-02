<?php

namespace App\Enums;

enum MatterStatus: string
{
    case Open = 'open';
    case Closed = 'closed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::Closed => 'Closed',
            self::Archived => 'Archived',
        };
    }

    /**
     * Tailwind classes for status badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Open => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::Closed => 'bg-slate-100 border-slate-300 text-slate-600',
            self::Archived => 'bg-slate-50 border-slate-200 text-slate-400',
        };
    }

    /**
     * Can this matter still receive work (documents, time, messages)?
     */
    public function isWorkable(): bool
    {
        return $this === self::Open;
    }
}
