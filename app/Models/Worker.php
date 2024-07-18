<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code'];

    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    public function detailmaterials()
    {
        return $this->belongsToMany(DetailTaskMaterial::class);
    }

    
}
