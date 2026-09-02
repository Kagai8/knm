<?php

namespace App\Enums;

enum MatterStage: string
{
    case Instruction = 'instruction';
    case Engagement = 'engagement';
    case ActiveWork = 'active_work';
    case Closure = 'closure';
    case Archive = 'archive';

    public function label(): string
    {
        return match ($this) {
            self::Instruction => 'Instruction',
            self::Engagement => 'Engagement',
            self::ActiveWork => 'Active Work',
            self::Closure => 'Closure',
            self::Archive => 'Archive',
        };
    }

    /**
     * Tailwind classes for stage badges in the UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Instruction => 'bg-blue-50 border-blue-200 text-blue-700',
            self::Engagement => 'bg-indigo-50 border-indigo-200 text-indigo-700',
            self::ActiveWork => 'bg-emerald-50 border-emerald-200 text-emerald-700',
            self::Closure => 'bg-purple-50 border-purple-200 text-purple-700',
            self::Archive => 'bg-slate-100 border-slate-300 text-slate-600',
        };
    }

    /**
     * Sequential position in the lifecycle (for stepper UI and validation).
     */
    public function position(): int
    {
        return match ($this) {
            self::Instruction => 1,
            self::Engagement => 2,
            self::ActiveWork => 3,
            self::Closure => 4,
            self::Archive => 5,
        };
    }

    /**
     * The next stage in the lifecycle (null if already archived).
     */
    public function next(): ?self
    {
        return match ($this) {
            self::Instruction => self::Engagement,
            self::Engagement => self::ActiveWork,
            self::ActiveWork => self::Closure,
            self::Closure => self::Archive,
            self::Archive => null,
        };
    }

    /**
     * Is this matter still actively being worked on?
     */
    public function isActive(): bool
    {
        return in_array($this, [self::Instruction, self::Engagement, self::ActiveWork], true);
    }

    /**
     * Has this matter reached its end?
     */
    public function isFinal(): bool
    {
        return $this === self::Archive;
    }
}
