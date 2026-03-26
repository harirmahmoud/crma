<?php

namespace App\Http\Controllers\cas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Piece;

class PieceController extends Controller
{
     public function create(Request $request){
        $request->validate([
        'nom' => 'required|string',
        'type'=>'required|string',
        'description'=>'required|string',
    ]);
    $piece=Piece::create([
        'nom' => $validatedData['nom'],
        'type' => $validatedData['type'],
        'decription' => $validatedData['decription'],
        
    ]);

    return response()->json(['message' => 'piece has been created successfully'], 200);
    }

    public function update(Request $request){
        $request->validate([
        'nom' => 'sometimes|string',
        'type'=>'sometimes|string',
        'description'=>'sometimes|string',
    ]);
    $piece=Piece::update($validatedData);

    return response()->json(['message' => 'piece has been updated successfully'], 200);
    }

     public function deleteUser($id){
         $piece = Piece::where('id', $id )->first();
    if (!$piece) {
        return response()->json(['message' => 'piece not found'], 404);
    }
    $piece->delete();
    return response()->json(['message' => 'piece has been deleted successfully'], 200);
    }
}
