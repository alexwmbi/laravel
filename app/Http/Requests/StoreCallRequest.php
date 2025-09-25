<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCallRequest extends FormRequest
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

        // "oggetto" => ['string','max:255', 'nullable'],
        return [
            
            "oggetto" => ['string', 'max:255', 'nullable'],
            "note" => ['string', 'max:255', 'nullable'],
            "tipo" => ['string', 'max:255', 'nullable'],
            "urgenza" => ['string', 'max:255', 'nullable'],
            "note2" => ['string', 'max:255', 'nullable'],
            "cliente" => ['string', 'max:255', 'nullable'],
            "data" => ['string', 'max:255', 'nullable'],
            "stato" => ['string', 'max:255', 'nullable'],
            "modulo" => ['string', 'max:255', 'nullable'],
            "cantiere" => ['string', 'max:255', 'nullable'],
            "work_id" => ['string', 'max:255', 'nullable'],
            "work_name" => ['string', 'max:255', 'nullable'],
            "client_id" => ['string', 'max:255', 'nullable'],
        ];

        
    }
}
