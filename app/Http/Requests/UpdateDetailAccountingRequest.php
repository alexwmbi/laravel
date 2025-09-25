<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDetailAccountingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
           
            "accountingId" => ['string','max:255', 'nullable'],
            "stato" => ['string','max:255', 'nullable'],
            "modalitaPagamento" => ['string','max:255', 'nullable'],
            "dataScadenzaPagamento" => ['string','max:255', 'nullable'],
            "importoPagamento" => ['string','max:255', 'nullable'],
            "note" => ['string','max:255', 'nullable'],
        ];
    }
}
