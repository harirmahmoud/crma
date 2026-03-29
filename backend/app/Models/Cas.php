<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cas extends Model
{
    protected $primaryKey = 'num_quitance';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable=[
        'num_quitance',
        'date',
        'assure_id',
        'beneficiare_id',
        'frais_engage',
        'franchise_id',
        'piece_id',
        'status',
        'total'
    ];
}
