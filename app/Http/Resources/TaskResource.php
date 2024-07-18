<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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
            "code"=> $this->code,
            "category"=> $this->category,
            "materials"=> $this->materials,
            "hours"=> $this->hours,
            "description"=> $this->description,
            "note"=> $this->note,
            "workers"=>$this->workers,
            "starting_date"=> (new Carbon ($this->starting_date))->format('d-m-Y'),
            "due_date"=> (new Carbon ($this->due_date))->format('d-m-Y'),

        ];
    }
}
