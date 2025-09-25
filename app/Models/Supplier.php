<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    //protected $fillable = ['name','code','email','contact','fax','address','piva','note'];
protected $fillable = ['cfcditta','tipocf','codcf',	'ragsoccf',	'domicilio','capcf','cittacf','provcf','codfis','pivacf','telef','fax','addbol','codban','sconto1','sconto2','sconto3','codpag','codese','codliscf','civacf','speinc','speince','cognome','nome','perfis','sesso','datanas','provnas','codcon','partite','scadenze','mese2es','giornosc','numaut','dataaut','numpro','tipocli','ragsocfa','indirifa','cittafa','provfa','capfa','ragsocri','indiriri','cittari','provri','capri','fatemail','indemailf','indemaile','indemailo','indemailp','indemailg','perrit','cfcodiban','numdoc','flagraee','tipoca','flagra','cccodtri','indpec'];
    public function materials()
    {
        return $this->belongsToMany(Material::class);
    }
}


