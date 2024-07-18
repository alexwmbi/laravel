<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailTaskWorker extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code' , 'worker_id' , 'hours' , 'client' , 'work' , 'task' , 'note' , 'status' ,'starting_date','end_date'];

    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    public function workers()
    {
        return $this->belongsToMany(Worker::class);
    }

}
