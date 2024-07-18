<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaterialRequest extends FormRequest
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
            "cod_art" => ['required','max:255'],
            "cod_prod" =>['string','max:255', 'nullable'],
            "name_prod" =>['string','max:255', 'nullable'],
            "desc" =>['string', 'nullable'],
            "um" =>['string','max:255', 'nullable'],
            "priece" =>['string', 'nullable'],
            "iva" =>['string', 'nullable'],
        ];
    }
}
