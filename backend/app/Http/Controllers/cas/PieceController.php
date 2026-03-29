<?php

namespace App\Http\Controllers\cas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Piece;

class PieceController extends Controller
{
     public function create(Request $request){
       $validatedData = $request->validate([
        'nom' => 'sometimes|nullable|string',
        'type'=>'required|string',
        'description'=>'sometimes|nullable|string',
    ]);
    $piece=Piece::create([
        'nom' => $validatedData['nom'] ?? null,
        'type' => $validatedData['type'],
        'description' => $validatedData['description'] ?? null,
        
    ]);

    return response()->json(['message' => 'piece has been created successfully', 'piece' => $piece], 200);
    }

    public function update(Request $request, $id = null){
       $validatedData = $request->validate([
        'nom' => 'sometimes|nullable|string',
        'type'=>'sometimes|string',
        'description'=>'sometimes|nullable|string',
    ]);
    
    $pieceId = $id ?? $request->id;
    $piece = Piece::find($pieceId);
    if (!$piece) return response()->json(['message' => 'piece not found'], 404);
    
    $piece->update($validatedData);

    return response()->json(['message' => 'piece has been updated successfully', 'piece' => $piece], 200);
    }

     public function delete($id){
         $piece = Piece::where('id', $id )->first();
    if (!$piece) {
        return response()->json(['message' => 'piece not found'], 404);
    }
    $piece->delete();

    return response()->json(['message' => 'piece has been deleted successfully'], 200);
    }
     public function getPiece(Request $request){
    $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $piece = Piece::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['piece' => $piece], 200);
    }
}
