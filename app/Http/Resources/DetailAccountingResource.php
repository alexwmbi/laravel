<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailAccountingResource extends JsonResource
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
            "id" => $this->id,
            "accountingId" => $this->accountingId,
            "stato" => $this->stato,
            "modalitaPagamento" => $this->modalitaPagamento,
            "dataScadenzaPagamento" => $this->dataScadenzaPagamento,
            "importoPagamento" => $this->importoPagamento,
            "note" => $this->note,
           

        ];
    }
}
