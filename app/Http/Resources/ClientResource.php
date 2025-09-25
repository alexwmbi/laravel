<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        //protected $fillable = ['name', 'surname','cod_fiscale','address1','addres2','addres3','addres4','addres5','addres6','note1','tel','cell','contact3','email','email2','note2','sex','note3','note4','percentage','aliquota','bonifico','giorni','note5','note6','note7','note8','note9','client_id'];
 
        return [
            "id"=> $this->id,
            "name"=> $this->name,
            "surname"=> $this->surname,
            "cod_fiscale"=> $this->cod_fiscale,
            "piva" => $this->piva,
            "address1"=> $this->address1,
            "address2"=> $this->address2,
            "address3"=> $this->address3,
            "address4"=> $this->address4,
            "address5"=> $this->address5,
            "address6"=> $this->address6,
            "note1"=> $this->note1,
            "tel"=> $this->tel,
            "cell"=> $this->cell,
            "contact"=> $this->contact, 
            "contact3"=> $this->contact3,
            "email"=> $this->email,
            "email2"=> $this->email2,
            "note2"=> $this->note2,
            "sex"=> $this->sex,
            "note3"=> $this->note3,
            "note4"=> $this->note4,
            "percentage"=> $this->percentage,
            "aliquota"=> $this->aliquota,
            "bonifico"=> $this->bonifico,
            "giorni"=> $this->giorni,
            "note5"=> $this->note5,
            "note6"=> $this->note6,
            "note7"=> $this->note7,
            "note8"=> $this->note8,
            "note9"=> $this->note9,

 //protected $fillable = ['name', 'surname','cod_fiscale','address1','addres2','addres3',
 //'addres4','addres5','addres6','note1','tel','cell','contact3','email','email2',
 //'note2','sex','note3','note4','percentage','aliquota','bonifico','giorni','note5'
 //,'note6','note7','note8','note9','client_id'];
 
            
        ];
    }
}
