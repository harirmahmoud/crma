<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Franchise extends Model
{
    protected $fillable=[
        'nom',
        'franchise',
        'grp_franchise_id',
        'condition_id',
        'pourcentage'
    ];
}
