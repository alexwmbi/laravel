<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'contact','address','piva','note'];
    public function works()
    {
        return $this->belongsToMany(Work::class);
    }
}

