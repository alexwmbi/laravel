<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDetailworkRequest extends FormRequest
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
            "hours" => ['decmal', 'nullable'],
            "client" => ['client', 'nullable'],
            "work" => ['work', 'nullable'],
            "task" => ['task', 'nullable'],
            "note" => ['note', 'nullable'],
            "status" => ['status', 'nullable'],
            "starting_date" => ['starting_date', 'nullable'],
            "end_date" => ['end_date', 'nullable'],
            
        ];
    }
}
