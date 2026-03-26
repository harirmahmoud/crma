<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adherent extends Model
{
    protected $fillable=[
        'nom',
        'prenom',
        'date_naissance',
        
    ];
}
