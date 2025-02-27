<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkRequest extends FormRequest
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
            "name" => ['required','max:255'],
            "status" => ['nullable', Rule::in(['active', 'archived'])],
            "note" => ['string', 'nullable'],
            'starting_date' => ['nullable', 'max:255'],
            'due_date' => ['nullable', 'max:255']
        ];
    }
}
