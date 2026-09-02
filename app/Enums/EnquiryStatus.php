<?php

namespace App\Enums;

enum EnquiryStatus: string
{
    case New = 'new';
    case Triaged = 'triaged';
    case ConflictChecking = 'conflict_checking';
    case ConflictCleared = 'conflict_cleared';
    case ConflictFlagged = 'conflict_flagged';
    case PartnerReviewing = 'partner_reviewing';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Converted = 'converted';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Triaged => 'Triaged',
            self::ConflictChecking => 'Conflict Check In Progress',
            self::ConflictCleared => 'Conflict Cleared',
            self::ConflictFlagged => 'Conflict Flagged',
            self::PartnerReviewing => 'Partner Review',
            self::Approved => 'Approved',
            self::Rejected => 'Rejected',
            self::Converted => 'Converted to Matter',
        };
    }

    /**
     * Tailwind classes for status badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::New => 'bg-blue-50 border-blue-200 text-blue-700',
            self::Triaged => 'bg-indigo-50 border-indigo-200 text-indigo-700',
            self::ConflictChecking => 'bg-amber-50 border-amber-200 text-amber-700',
            self::ConflictCleared => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::ConflictFlagged => 'bg-red-50 border-red-200 text-red-700',
            self::PartnerReviewing => 'bg-purple-50 border-purple-200 text-purple-700',
            self::Approved => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::Rejected => 'bg-slate-100 border-slate-300 text-slate-600',
            self::Converted => 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#891920]',
        };
    }

    /**
     * Is this enquiry still active in the pipeline?
     */
    public function isOpen(): bool
    {
        return ! in_array($this, [self::Rejected, self::Converted], true);
    }

    /**
     * Has this enquiry reached a final state?
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::Rejected, self::Converted], true);
    }

    /**
     * Can this enquiry be converted to a matter?
     */
    public function isConvertible(): bool
    {
        return $this === self::Approved;
    }
}
