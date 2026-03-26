<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Beneficiare extends Model
{
    protected $fillable=[
        'nom',
        'prenom',
        'date_naissance',
        'adherent_id',
        'lien'
    ];
}
