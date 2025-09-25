<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CallResource extends JsonResource
{

    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        //['oggetto', 'note', 'tipo', 'urgenza', 'note2', 'cliente', 'data', 'stato', 'modulo', 'cantiere', 'work_id', 'work_name', 'client_id'];


        
            return [
                "id"=> $this->id,
                "oggetto" => $this->oggetto,
                "note" => $this->note,
                "tipo" => $this->tipo,
                "urgenza" => $this->urgenza,
                "note2" => $this->note2,
                "cliente" => $this->cliente,
                "data" => $this->data,
                "stato" => $this->stato,
                "modulo" => $this->modulo,
                "cantiere" => $this->cantiere,
                "work_id" => $this->work_id,
                "work_name" => $this->work_name,
                "client_id" => $this->client_id,
            ];
            
       

        //return parent::toArray($request);
    }
}
