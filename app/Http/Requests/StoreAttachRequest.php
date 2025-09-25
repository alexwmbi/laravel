<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttachRequest extends FormRequest
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

            //'fileurl','work','client','work_id'

          /*   "fileurl" => ['string','required'],
            "work" => ['string', 'required'],
            "work_id" => ['string', 'required'],
            "client" => ['string','required'],
             */
            
        ];
    }
}
