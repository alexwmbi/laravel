<?php

namespace App\Casts;

use App\Enums\AccountingStatus;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class AccountingStatusCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes): ?AccountingStatus
    {
        if ($value === null) return null;
        // accetta "Aperta", "aperta", "APERtA", ecc.
        return AccountingStatus::from(strtolower((string)$value));
    }

    public function set($model, string $key, $value, array $attributes): ?string
    {
        if ($value === null) return null;

        // puoi passare sia enum che stringa; salviamo in minuscolo
        return $value instanceof AccountingStatus
            ? $value->value
            : strtolower((string)$value);
    }
}
