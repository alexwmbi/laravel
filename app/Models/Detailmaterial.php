<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Detailmaterial extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code' , 'material_id' , 'priece' ,'quantity','um' , 'aug', 'iva', 'tot' ,'client' , 'work' , 'task' , 'note' , 'status' ,'starting_date','end_date' ];


    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class);
    }
}
