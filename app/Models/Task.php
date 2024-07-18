<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code','category','materials','hours','description','note','work_id','starting_date','due_date'];
 /*  name code materials hours description note work_id workers starting_date due_date created_at updated_at */


    public function materials()
    {
        return $this->belongsToMany(Material::class);
    }

    public function works()
    {
        return $this->belongsToMany(Work::class);
    }
    
    public function workers()
    {
        return $this->belongsToMany(Worker::class);
    }

    public function detailworkers()
    {
        return $this->belongsToMany(Detailwork::class);
    }

    public function detailmaterials()
    {
        return $this->belongsToMany(Detailmaterial::class);
    }
}
