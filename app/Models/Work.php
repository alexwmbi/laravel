<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'status','note','starting_date','due_date'];

    public function clients()
    {
        return $this->belongsToMany(Client::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }


}
