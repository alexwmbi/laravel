<?php

namespace App\Casts;

use App\Enums\PaymentMethod;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use ValueError;

class PaymentMethodCast implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?PaymentMethod
    {
        if ($value === null || $value === '') {
            return null;
        }

        // Se in DB c'è già MPxx corretto, uso from()
        try {
            return PaymentMethod::from($value);
        } catch (ValueError $e) {
            // Se in DB (o da import) c'è "bonifico/riba/..." mappo in MPxx
            return PaymentMethod::fromLoose($value);
        }
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value instanceof PaymentMethod) {
            return $value->value; // salva MPxx
        }

        if ($value === null || $value === '') {
            return null;
        }

        // Accetta sia "bonifico" che "MP05"
        $enum = PaymentMethod::fromLoose($value);
        return $enum?->value; // salva MPxx canonico
    }
}
