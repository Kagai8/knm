<?php

namespace App\Enums;

enum PreferredContact: string
{
    case Phone = 'phone';
    case Email = 'email';
    case Either = 'either';

    public function label(): string
    {
        return match ($this) {
            self::Phone => 'Phone',
            self::Email => 'Email',
            self::Either => 'Either',
        };
    }
}
