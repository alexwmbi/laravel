<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDetailmaterialRequest extends FormRequest
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
        return  [
           
            "name" =>  ['string','max:255', 'nullable'],	
            "code" =>  ['string','max:255', 'nullable'],
            "material_id" =>  ['string','max:255', 'nullable'],
            "priece" =>  ['numeric', 'nullable'],	
            "aug" =>  ['numeric','max:255', 'nullable'],	
            "quantity" =>  ['numeric', 'nullable'],	
            "um" =>  ['string','max:255', 'nullable'],
            "iva" =>  ['string','max:255', 'nullable'],
            "client" =>  ['string','max:255', 'nullable'],
            "work" =>  ['string','max:255', 'nullable'],
            "task" => ['string','max:255', 'nullable'],
            "note" =>  ['string','max:255', 'nullable'],
            "starting_date" =>  ['string','max:255', 'nullable'],
            "end_date" =>  ['string','max:255', 'nullable'],
            "created_at" =>  ['string','max:255', 'nullable']
            
        ];
            
    }
}
