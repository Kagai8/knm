<?php

namespace App\Enums;

enum MatchConfidence: string
{
    case Exact = 'exact';
    case High = 'high';
    case Medium = 'medium';
    case Low = 'low';

    public function label(): string
    {
        return match ($this) {
            self::Exact => 'Exact Match',
            self::High => 'High Confidence',
            self::Medium => 'Medium Confidence',
            self::Low => 'Low Confidence',
        };
    }

    /**
     * Tailwind classes for confidence badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Exact => 'bg-red-50 border-red-200 text-red-700',
            self::High => 'bg-orange-50 border-orange-200 text-orange-700',
            self::Medium => 'bg-amber-50 border-amber-200 text-amber-700',
            self::Low => 'bg-slate-100 border-slate-300 text-slate-600',
        };
    }

    /**
     * Sort priority — higher confidence appears first in results.
     */
    public function priority(): int
    {
        return match ($this) {
            self::Exact => 4,
            self::High => 3,
            self::Medium => 2,
            self::Low => 1,
        };
    }
}
