<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // return false;
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
            "surname" => ['string','max:255', 'nullable'],
            "cod_fiscale" => ['string','max:255', 'nullable'],
            "piva" => ['string','max:255', 'nullable'],
            "address1" =>  ['string','max:255', 'nullable'],
            "address2" => ['string','max:255', 'nullable'],
            "address3" =>  ['string','max:255', 'nullable'],
            "address4" =>  ['string','max:255', 'nullable'],
            "address5" =>  ['string','max:255', 'nullable'],
            "address6" =>  ['string','max:255', 'nullable'],
            "note1" =>  ['string','max:255', 'nullable'],
            "tel" =>  ['string','max:255', 'nullable'],
            "cell" =>  ['string','max:255', 'nullable'],
            "contact" =>  ['string','max:255', 'nullable'],
            "contact3" =>  ['string','max:255', 'nullable'],
            "email" =>  ['string','max:255', 'nullable'],
            "email2" =>  ['string','max:255', 'nullable'],
            "note2" =>  ['string','max:255', 'nullable'],
            "sex" =>  ['string','max:255', 'nullable'],
            "note3" =>  ['string','max:255', 'nullable'],
            "note4" =>  ['string','max:255', 'nullable'],
            "percentage" =>  ['string','max:255', 'nullable'],
            "aliquota" =>  ['string','max:255', 'nullable'],
            "bonifico" =>  ['string','max:255', 'nullable'],
            "giorni" =>  ['string','max:255', 'nullable'],
            "note5" =>  ['string','max:255', 'nullable'],
            "note6" =>  ['string','max:255', 'nullable'],
            "note7" =>  ['string','max:255', 'nullable'],
            "note8" =>  ['string','max:255', 'nullable'],
            "note9" =>  ['string','max:255', 'nullable'],

            

 //protected $fillable = ['name', 'surname','cod_fiscale','address1','address2','address3',
 //'address4','address5','address6','note1','tel','cell','contact','contact3','email','email2',
 //'note2','sex','note3','note4','percentage','aliquota','bonifico','giorni','note5','note6',
 //'note7','note8','note9','client_id'];
              
        ];
    }
}
