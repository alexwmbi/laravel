<?php

namespace App\Enums;

enum PaymentType: string
{
    case BONIFICO = 'bonifico';
    case RIBA     = 'riba';
    case CONTANTI = 'contanti';
    case ASSEGNO  = 'assegno';

    public function label(): string
    {
        return match ($this) {
            self::BONIFICO => 'Bonifico',
            self::RIBA     => 'Ri.Ba.',
            self::CONTANTI => 'Contanti',
            self::ASSEGNO  => 'Assegno',
        };
    }
}
