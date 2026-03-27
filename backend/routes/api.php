<?php

use Illuminate\Support\Facades\Route;
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/assures',[App\Http\Controllers\personne\AssureController::class, 'getAssures']);
    Route::post('/assures',[App\Http\Controllers\personne\AssureController::class, 'create']);
    Route::put('/assures/{id}',[App\Http\Controllers\personne\AssureController::class, 'update']);
    Route::delete('/assures/{id}',[App\Http\Controllers\personne\AssureController::class, 'delete']);

    Route::get('/adherent',[App\Http\Controllers\personne\AdheherentController::class, 'getAdherents']);
    Route::post('/adherent',[App\Http\Controllers\personne\AdheherentController::class, 'create']);
    Route::put('/adherent/{id}',[App\Http\Controllers\personne\AdheherentController::class, 'update']);
    Route::delete('/adherent/{id}',[App\Http\Controllers\personne\AdheherentController::class, 'delete']);

    Route::get('/beneficiare',[App\Http\Controllers\personne\BeneficiareController::class, 'getBeneficiares']);
    Route::post('/beneficiare',[App\Http\Controllers\personne\BeneficiareController::class, 'create']);
    Route::put('/beneficiare/{id}',[App\Http\Controllers\personne\BeneficiareController::class, 'update']);
    Route::delete('/beneficiare/{id}',[App\Http\Controllers\personne\BeneficiareController::class, 'delete']);
    
    Route::get('/franchise',[App\Http\Controllers\franchise\FranchiseController::class, 'getFranchises']);
    Route::post('/franchise',[App\Http\Controllers\franchise\FranchiseController::class, 'create']);
    Route::put('/franchise/{id}',[App\Http\Controllers\franchise\FranchiseController::class, 'update']);
    Route::delete('/franchise/{id}',[App\Http\Controllers\franchise\FranchiseController::class, 'delete']);

    Route::get('/condition',[App\Http\Controllers\franchise\ConditionController::class, 'getConditions']);
    Route::post('/condition',[App\Http\Controllers\franchise\ConditionController::class, 'create']);
    Route::put('/condition/{id}',[App\Http\Controllers\franchise\ConditionController::class, 'update']);
    Route::delete('/condition/{id}',[App\Http\Controllers\franchise\ConditionController::class, 'delete']);

    Route::get('/grpFranchise',[App\Http\Controllers\franchise\GrpFranchiseController::class, 'getGrpFranchises']);
    Route::post('/grpFranchise',[App\Http\Controllers\franchise\GrpFranchiseController::class, 'create']);
    Route::put('/grpFranchise/{id}',[App\Http\Controllers\franchise\GrpFranchiseController::class, 'update']);
    Route::delete('/grpFranchise/{id}',[App\Http\Controllers\franchise\GrpFranchiseController::class, 'delete']);

    Route::get('/piece',[App\Http\Controllers\cas\PieceController::class, 'getPiece']);
    Route::post('/piece',[App\Http\Controllers\cas\PieceController::class, 'create']);
    Route::put('/piece/{id}',[App\Http\Controllers\cas\PieceController::class, 'update']);
    Route::delete('/piece/{id}',[App\Http\Controllers\cas\PieceController::class, 'delete']);

    Route::get('/cas',[App\Http\Controllers\cas\CasController::class, 'getCas']);
    Route::post('/cas',[App\Http\Controllers\cas\CasController::class, 'create']);
    Route::put('/cas/{id}',[App\Http\Controllers\cas\CasController::class, 'update']);
    Route::delete('/cas/{id}',[App\Http\Controllers\cas\CasController::class, 'delete']);
});
