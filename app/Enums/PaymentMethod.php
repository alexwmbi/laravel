<?php

namespace App\Enums;

/**
 * Modalità pagamento FatturaPA (MP01..MP22)
 * https://www.fatturapa.gov.it/  (codifiche ufficiali)
 */
enum PaymentMethod: string
{
    case MP01 = 'MP01'; // Contanti
    case MP02 = 'MP02'; // Assegno
    case MP03 = 'MP03'; // Assegno circolare
    case MP04 = 'MP04'; // Contanti presso Tesoreria
    case MP05 = 'MP05'; // Bonifico
    case MP06 = 'MP06'; // Vaglia cambiario
    case MP07 = 'MP07'; // Bollettino bancario
    case MP08 = 'MP08'; // Carta di pagamento
    case MP09 = 'MP09'; // RID
    case MP10 = 'MP10'; // RID utenze
    case MP11 = 'MP11'; // RID veloce
    case MP12 = 'MP12'; // Ri.Ba.
    case MP13 = 'MP13'; // MAV
    case MP14 = 'MP14'; // Quietanza erario
    case MP15 = 'MP15'; // Giroconto su contabilità speciale
    case MP16 = 'MP16'; // Domiciliazione bancaria
    case MP17 = 'MP17'; // Domiciliazione postale
    case MP18 = 'MP18'; // Bollettino postale
    case MP19 = 'MP19'; // SEPA Direct Debit
    case MP20 = 'MP20'; // SEPA Direct Debit CORE
    case MP21 = 'MP21'; // SEPA Direct Debit B2B
    case MP22 = 'MP22'; // Trattenuta su somme già riscosse

    /** Etichetta “umana” per la UI */
    public function label(): string
    {
        return match ($this) {
            self::MP01 => 'Contanti',
            self::MP02 => 'Assegno',
            self::MP03 => 'Assegno circolare',
            self::MP04 => 'Contanti (Tesoreria)',
            self::MP05 => 'Bonifico',
            self::MP06 => 'Vaglia cambiario',
            self::MP07 => 'Bollettino bancario',
            self::MP08 => 'Carta di pagamento',
            self::MP09 => 'RID',
            self::MP10 => 'RID utenze',
            self::MP11 => 'RID veloce',
            self::MP12 => 'Ri.Ba.',
            self::MP13 => 'MAV',
            self::MP14 => 'Quietanza erario',
            self::MP15 => 'Giroconto (cont. speciale)',
            self::MP16 => 'Domiciliazione bancaria',
            self::MP17 => 'Domiciliazione postale',
            self::MP18 => 'Bollettino postale',
            self::MP19 => 'SEPA Direct Debit',
            self::MP20 => 'SEPA Direct Debit CORE',
            self::MP21 => 'SEPA Direct Debit B2B',
            self::MP22 => 'Trattenuta su somme riscosse',
        };
    }

    /**
     * Permette input "liberi" dalla UI (bonifico/riba/contanti/assegno)
     * e li mappa al codice MP corretto.
     */
    public static function fromLoose(?string $value): ?self
    {
        if ($value === null) return null;
        $v = trim(mb_strtolower($value));

        return match ($v) {
            'bonifico'   => self::MP05,
            'riba', 'ri.ba', 'ri.ba.', 'ri ba' => self::MP12,
            'contanti'   => self::MP01,
            'assegno'    => self::MP02,
            // Se già mi arriva un MPxx valido:
            'mp01' => self::MP01, 'mp02' => self::MP02, 'mp03' => self::MP03, 'mp04' => self::MP04,
            'mp05' => self::MP05, 'mp06' => self::MP06, 'mp07' => self::MP07, 'mp08' => self::MP08,
            'mp09' => self::MP09, 'mp10' => self::MP10, 'mp11' => self::MP11, 'mp12' => self::MP12,
            'mp13' => self::MP13, 'mp14' => self::MP14, 'mp15' => self::MP15, 'mp16' => self::MP16,
            'mp17' => self::MP17, 'mp18' => self::MP18, 'mp19' => self::MP19, 'mp20' => self::MP20,
            'mp21' => self::MP21, 'mp22' => self::MP22,
            default => null,
        };
    }
}
