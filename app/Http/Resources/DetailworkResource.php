<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailworkResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    // protected $fillable = ['name', 'code' , 'worker_id' , 'hours' , 'client' ,
     // 'work' , 'task' , 'note' , 'status' ,'starting_date','end_date'];

    public function toArray(Request $request): array
    
    {

        return  [
            "id"=> $this->id,
            "name"=> $this->name,
            "code"=> $this->code,
            "worker_id"=> $this->worker_id,
            "hours"=> $this->hours,
            "client"=> $this->client,
            "work"=> $this->work,
            "task"=> $this->task,
            "note"=> $this->note,
            "status"=> $this->status,
            "starting_date"=> $this->starting_date,
            "end_date"=> $this->end_date,
            
        ];
    }


}
