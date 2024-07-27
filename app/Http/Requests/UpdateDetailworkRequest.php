<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDetailworkRequest extends FormRequest
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
           
            "code" => ['string','max:255', 'nullable'],
            "worker_id" => ['string', 'nullable'],
            "hours" => ['numeric', 'nullable'],
            "client" => ['string', 'nullable'],
            "work" => ['string', 'nullable'],
            "task" => ['string', 'nullable'],
            "note" => ['string', 'nullable'],
            "status" => ['string', 'nullable'],
            "starting_date" => ['string', 'nullable'],
            "end_date" => ['string', 'nullable'],
        ];
    }
}
