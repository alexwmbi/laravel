<?php

namespace App\Enums;

enum DetailAccountingStatus: string
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
        // richiesto: aperta=verde, pagata=rosso, parziale=giallo
        return match ($this) {
            self::APERTA   => 'green',
            self::PAGATA   => 'red',
            self::PARZIALE => 'yellow',
        };
    }
}
