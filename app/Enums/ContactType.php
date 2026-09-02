<?php

namespace App\Enums;

enum ContactType: string
{
    case OpposingParty = 'opposing_party';
    case Witness = 'witness';
    case Expert = 'expert';
    case Court = 'court';
    case Judge = 'judge';
    case Government = 'government';
    case CoCounsel = 'co_counsel';
    case Beneficiary = 'beneficiary';
    case Guarantor = 'guarantor';
    case Medical = 'medical';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::OpposingParty => 'Opposing Party',
            self::Witness => 'Witness',
            self::Expert => 'Expert',
            self::Court => 'Court / Registry',
            self::Judge => 'Judge / Magistrate',
            self::Government => 'Government Agency',
            self::CoCounsel => 'Co-Counsel',
            self::Beneficiary => 'Beneficiary',
            self::Guarantor => 'Guarantor / Surety',
            self::Medical => 'Medical Professional',
            self::Other => 'Other',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::OpposingParty => 'bg-red-50 border-red-200 text-red-700',
            self::Witness => 'bg-blue-50 border-blue-200 text-blue-700',
            self::Expert => 'bg-indigo-50 border-indigo-200 text-indigo-700',
            self::Court => 'bg-purple-50 border-purple-200 text-purple-700',
            self::Judge => 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
            self::Government => 'bg-amber-50 border-amber-200 text-amber-700',
            self::CoCounsel => 'bg-teal-50 border-teal-200 text-teal-700',
            self::Beneficiary => 'bg-pink-50 border-pink-200 text-pink-700',
            self::Guarantor => 'bg-orange-50 border-orange-200 text-orange-700',
            self::Medical => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::Other => 'bg-slate-100 border-slate-300 text-slate-600',
        };
    }

    public function isConflictRelevant(): bool
    {
        return in_array($this, [self::OpposingParty, self::Witness], true);
    }
}
