<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkerResource extends JsonResource
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
            "name" => $this->name,
            "code" => $this->code,
            "status" => $this->status,
            "starting_date" => (new Carbon ($this->starting_date))->format('d-m-Y'),
            "due_date" => (new Carbon ($this->due_date))->format('d-m-Y'),
            "note" => $this->note,

        ];
    }
}
