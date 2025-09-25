<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attach extends Model
{
    use HasFactory;

    protected $fillable = ['fileurl','filename','work','client','work_id'];


    public function work()
    {
        return $this->belongsTo(related: Work::class);
    }
}
