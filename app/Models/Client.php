<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    //protected $fillable = ['name', 'contact','address','piva','note'];
    protected $fillable = ['name', 'surname','cod_fiscale','piva','address1','address2','address3','address4','address5','address6','note1','tel','cell','contact','contact3','email','email2','note2','sex','note3','note4','percentage','aliquota','bonifico','giorni','note5','note6','note7','note8','note9','client_id'];
    
    public function works()
    {
        return $this->belongsToMany(Work::class);
    }
}

