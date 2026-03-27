<?php

namespace App\Http\Controllers\personne;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Assure;

class AssureController extends Controller
{
    public function create(Request $request){
        $validatedData =$request->validate([
        'nom' => 'required|string',
        
    ]);
    $assure=Assure::create([
        'nom' => $validatedData['nom'],
    ]);

    return response()->json(['message' => 'assure has been created successfully'], 200);
    }

    public function update(Request $request){
        $validatedData =$request->validate([
        'nom' => 'required|string',
        
    ]);
    $assure=Assure::update([
        'nom' => $validatedData['nom'],
    ]);

    return response()->json(['message' => 'assure has been updated successfully'], 200);
    }

     public function deleteUser($id){
         $assure = Assure::where('id', $id )->first();
    if (!$assure) {
        return response()->json(['message' => 'assure not found'], 404);
    }
    $assure->delete();
    return response()->json(['message' => 'assure has been deleted successfully'], 200);
    }

    public function getAssures(Request $request){
        $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $assures = Assure::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['assures' => $assures], 200);
    }
}
