<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientDetail extends Model
{
    use HasFactory;
//name	surname	tel	cod_fiscale	address1	addres2	addres3	addres4	addres5	addres6	note1	tel	cell	contact3	                                email	email2	note2	sex	note3										note4		percentage	aliquota	bonifico	giorni	note5	note6	note7	note8	note9
    protected $fillable = ['name', 'surname','cod_fiscale','address1','addres2','addres3','addres4','addres5','addres6','note1','tel','cell','contact3','email','email2','note2','sex','note3','note4','percentage','aliquota','bonifico','giorni','note5','note6','note7','note8','note9','client_id'];
    
}

