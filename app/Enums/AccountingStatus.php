<?php

namespace App\Enums;

enum AccountingStatus: string
{
    case APERTA   = 'aperta';
    case PAGATA   = 'pagata';
    case PARZIALE = 'parziale';

    public function label(): string
    {
        return match ($this) {
            self::APERTA   => 'Aperta',
            self::PAGATA   => 'Pagata',
            self::PARZIALE => 'Parzialmente pagata',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::APERTA   => 'green',
            self::PAGATA   => 'red',
            self::PARZIALE => 'yellow',
        };
    }
}
