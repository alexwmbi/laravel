<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
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
            /*  name code materials hours description note work_id workers starting_date due_date created_at updated_at */

            "name" => ['string', 'max:255', 'nullable'],
            "code" => ['string', 'max:255', 'nullable'],
            "category" => ['string', 'max:255', 'nullable'],
            "materials" => ['string', 'max:255', 'nullable'],
            "hours" => ['decimal', 'max:255', 'nullable'],
            "note" => ['string', 'nullable'],
            "description" => ['string', 'nullable'],
            "work_id" => ['string', 'max:255', 'nullable'],
            "workers" => ['string', 'max:255', 'nullable'],
            "starting_date" => ['string', 'max:255', 'nullable'],
            "due_date" => ['string', 'max:255', 'nullable'],
        ];
    }
}
