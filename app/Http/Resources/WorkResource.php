<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkResource extends JsonResource
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
            "name"=> $this->name,
            "status"=> $this->status,
            "note"=> $this->note,
            "starting_date"=> $this->starting_date,
            "due_date"=> $this->due_date,
            "created_at"=> (new Carbon ($this->created_at))->format('d-m-Y'),
            "client"=> new ClientResource( $this->client),           

        ];
    }
}
