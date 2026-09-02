<?php

namespace App\Enums;

enum ConflictResolution: string
{
    case Pending = 'pending';
    case FalsePositive = 'false_positive';
    case ActualConflict = 'actual_conflict';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending Review',
            self::FalsePositive => 'False Positive',
            self::ActualConflict => 'Actual Conflict',
        };
    }

    /**
     * Tailwind classes for resolution badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'bg-amber-50 border-amber-200 text-amber-700',
            self::FalsePositive => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::ActualConflict => 'bg-red-50 border-red-200 text-red-700',
        };
    }

    /**
     * Has this result been reviewed by a human?
     */
    public function isResolved(): bool
    {
        return $this !== self::Pending;
    }

    /**
     * Does this result block the enquiry from proceeding?
     */
    public function isBlocking(): bool
    {
        return $this === self::ActualConflict;
    }
}
