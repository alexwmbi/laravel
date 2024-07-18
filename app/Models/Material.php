<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = ['cod_art', 'cod_prod','name_prod','desc','um','priece','iva'];
  
    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    public function detailmaterials()
    {
        return $this->belongsToMany(DetailTaskMaterial::class);
    }


}
