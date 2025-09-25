<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
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
            'cfcditta' => $this->cfcditta,
            'tipocf' => $this->tipocf,
            'codcf' => $this->codcf,
            'ragsoccf' => $this->ragsoccf,
            'domicilio' => $this->domicilio,
            'capcf' => $this->capcf,
            'cittacf' => $this->cittacf,
            'provcf' => $this->provcf,
            'codfis' => $this->codfis,
            'pivacf' => $this->pivacf,
            'telef' => $this->telef,
            'fax' => $this->fax,
            'addbol' => $this->addbol,
            'codban' => $this->codban,
            'sconto1' => $this->sconto1,
            'sconto2' => $this->sconto2,
            'sconto3'  => $this->sconto3,
            'codpag'  => $this->codpag,
            'codese'  => $this->codese,
            'codliscf'  => $this->codliscf,
            'civacf'  => $this->civacf,
            'speinc'  => $this->speinc,
            'speince'  => $this->speince,
            'cognome'  => $this->cognome,
            'nome'  => $this->nome,
            'perfis' => $this->perfis,
            'sesso' => $this->sesso,
            'datanas' => $this->datanas,
            'provnas' => $this->provnas,
            'codcon' => $this->codcon,
            'partite' => $this->partite,
            'scadenze' => $this->scadenze,
            'mese2es' => $this->mese2es,
            'giornosc' => $this->giornosc,
            'numaut' => $this->numaut,
            'dataaut' => $this->dataaut,
            'numpro' => $this->numpro,
            'tipocli' => $this->tipocli,
            'ragsocfa' => $this->ragsocfa,
            'indirifa' => $this->indirifa,
            'cittafa' => $this->cittafa,
            'provfa' => $this->provfa,
            'capfa' => $this->capfa,
            'ragsocri' => $this->ragsocri,
            'indiriri' => $this->indiriri,
            'cittari' => $this->cittari,
            'provri' => $this->provri,
            'capri' => $this->capri,
            'fatemail' => $this->fatemail,
            'indemailf' => $this->indemailf,
            'indemaile' => $this->indemaile,
            'indemailo' => $this->indemailo,
            'indemailp' => $this->indemailp,
            'indemailg' => $this->indemailg,
            'perrit' => $this->perrit,
            'cfcodiban' => $this->cfcodiban,
            'numdoc' => $this->numdoc,
            'flagraee' => $this->flagraee,
            'tipoca' => $this->tipoca,
            'flagra' => $this->flagra,
            'cccodtri' => $this->cccodtri,
            'indpec' => $this->indpec,

        ];
    }
}
