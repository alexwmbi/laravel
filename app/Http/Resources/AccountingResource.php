<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\DetailAccountingResource;

class AccountingResource extends JsonResource
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
        'id'                     => $this->id,
        'Progressivo'            => $this->Progressivo,
        'ProgressivoInvio'       => $this->ProgressivoInvio,
        'FornitoreNome'          => $this->FornitoreNome,
        'Numero'                 => $this->Numero,
        'Data'                   => $this->Data,
        'ImportoTotaleDocumento' => $this->ImportoTotaleDocumento,
        'Stato'                  => $this->Stato,
        'TipoDocumento'          => $this->TipoDocumento,   // ⬅️ importante
        'detail_accounting'      => DetailAccountingResource::collection($this->whenLoaded('detailAccounting')),
    ];
    }
}
