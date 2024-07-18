<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{

    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            
            "id"=> $this->id,
            "cod_art"=> $this->cod_art,
            "cod_prod"=> $this->cod_prod,
            "name_prod"=> $this->name_prod,
            "desc"=> $this->desc,
            "um"=> $this->um,
            "note"=> $this->note,
            "priece"=> $this->priece,
            "iva"=> $this->iva,
            
        ];
    }
}
