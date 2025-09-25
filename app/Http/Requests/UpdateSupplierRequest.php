<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
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
           
 "cfcditta" => ['string','max:255', 'nullable'] ,  "tipocf" => ['string','max:255', 'nullable'] ,  "codcf" => ['string','max:255', 'nullable'] ,  "ragsoccf" => ['string','max:255', 'nullable'] ,  "domicilio" => ['string','max:255', 'nullable'] ,  "capcf" => ['string','max:255', 'nullable'] ,  "cittacf" => ['string','max:255', 'nullable'] ,  "provcf" => ['string','max:255', 'nullable'] ,  "codfis" => ['string','max:255', 'nullable'] ,  "pivacf" => ['string','max:255', 'nullable'] ,  "telef" => ['string','max:255', 'nullable'] ,  "fax" => ['string','max:255', 'nullable'] ,  "addbol" => ['string','max:255', 'nullable'] ,  "codban" => ['string','max:255', 'nullable'] ,  "sconto1" => ['string','max:255', 'nullable'] ,  "sconto2" => ['string','max:255', 'nullable'] ,  "sconto3" => ['string','max:255', 'nullable'] ,  "codpag" => ['string','max:255', 'nullable'] ,  "codese" => ['string','max:255', 'nullable'] ,  "codliscf" => ['string','max:255', 'nullable'] ,  "civacf" => ['string','max:255', 'nullable'] ,  "speinc" => ['string','max:255', 'nullable'] ,  "speince" => ['string','max:255', 'nullable'] ,  "cognome" => ['string','max:255', 'nullable'] ,  "nome" => ['string','max:255', 'nullable'] ,  "perfis" => ['string','max:255', 'nullable'] ,  "sesso" => ['string','max:255', 'nullable'] ,  "datanas" => ['string','max:255', 'nullable'] ,  "provnas" => ['string','max:255', 'nullable'] ,  "codcon" => ['string','max:255', 'nullable'] ,  "partite" => ['string','max:255', 'nullable'] ,  "scadenze" => ['string','max:255', 'nullable'] ,  "mese2es" => ['string','max:255', 'nullable'] ,  "giornosc" => ['string','max:255', 'nullable'] ,  "numaut" => ['string','max:255', 'nullable'] ,  "dataaut" => ['string','max:255', 'nullable'] ,  "numpro" => ['string','max:255', 'nullable'] ,  "tipocli" => ['string','max:255', 'nullable'] ,  "ragsocfa" => ['string','max:255', 'nullable'] ,  "indirifa" => ['string','max:255', 'nullable'] ,  "cittafa" => ['string','max:255', 'nullable'] ,  "provfa" => ['string','max:255', 'nullable'] ,  "capfa" => ['string','max:255', 'nullable'] ,  "ragsocri" => ['string','max:255', 'nullable'] ,  "indiriri" => ['string','max:255', 'nullable'] ,  "cittari" => ['string','max:255', 'nullable'] ,  "provri" => ['string','max:255', 'nullable'] ,  "capri" => ['string','max:255', 'nullable'] ,  "fatemail" => ['string','max:255', 'nullable'] ,  "indemailf" => ['string','max:255', 'nullable'] ,  "indemaile" => ['string','max:255', 'nullable'] ,  "indemailo" => ['string','max:255', 'nullable'] ,  "indemailp" => ['string','max:255', 'nullable'] ,  "indemailg" => ['string','max:255', 'nullable'] ,  "perrit" => ['string','max:255', 'nullable'] ,  "cfcodiban" => ['string','max:255', 'nullable'] ,  "numdoc" => ['string','max:255', 'nullable'] ,  "flagraee" => ['string','max:255', 'nullable'] ,  "tipoca" => ['string','max:255', 'nullable'] ,  "flagra" => ['string','max:255', 'nullable'] ,  "cccodtri" => ['string','max:255', 'nullable'] ,  "indpec" => ['string','max:255', 'nullable'] , 
 

        ];
    }
}
