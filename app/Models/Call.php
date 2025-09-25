<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Call extends Model
{
    use HasFactory;

    protected $fillable = ['oggetto', 'note', 'tipo', 'urgenza', 'note2', 'cliente', 'data', 'stato', 'modulo', 'cantiere', 'work_id', 'work_name', 'client_id'];

}
