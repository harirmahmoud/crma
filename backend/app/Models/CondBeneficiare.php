<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CondBeneficiare extends Model
{
     protected $fillable=[
        "id",
    "condition_id",
    "beneficiare_id",
    "condition",
    "status",
    ];

    protected $casts = [
    'condition' => 'array',
];
    
}
