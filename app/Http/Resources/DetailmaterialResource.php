<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailmaterialResource extends JsonResource
{

    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return  [
            "id"=> $this->id,
            "name" => $this-> name,	
            "code" => $this-> code,	
            "material_id" => $this-> material_id,	
            "priece" => $this-> priece,		
            "aug" => $this-> aug,		
            "quantity" => $this-> quantity,	
            "um" => $this-> um,	
            "iva" => $this-> iva,	
            "client" => $this-> client,	
            "work" => $this-> work,	
            "task" => $this-> task,	
            "note" => $this-> note,	
            "starting_date" => $this-> starting_date,	
            "end_date" => $this-> end_date,	
            "created_at" => $this-> created_at
        ];
            
    }
}
