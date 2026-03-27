<?php

namespace App\Http\Controllers\personne;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adherent;

class AdheherentController extends Controller
{
     public function create(Request $request){
       $validatedData = $request->validate([
        'id' => 'required|integer',
        'nom' => 'required|string',
        'prenom'=>'required|string',
        'date_naissance'=>'required|date',

    ]);
    $adherent=Adherent::create([
        'id' => $validatedData['id'],
        'nom' => $validatedData['nom'],
        'prenom' => $validatedData['prenom'],
        'date_naissance' => $validatedData['date_naissance'],
    ]);

    return response()->json(['message' => 'adherent has been created successfully'], 200);
    }

    public function update(Request $request){
       $validatedData = $request->validate([
        'id' => 'sometimes|integer',
        'nom' => 'sometimes|string',
        'prenom'=>'sometimes|string',
        'date_naissance'=>'sometimes|date',
    ]);
    $adherent=Adherent::update($validatedData);

    return response()->json(['message' => 'adherent has been updated successfully'], 200);
    }

     public function deleteUser($id){
         $adherent = Adherent::where('id', $id )->first();
    if (!$adherent) {
        return response()->json(['message' => 'adherent not found'], 404);
    }
    $adherent->delete();
    return response()->json(['message' => 'adherent has been deleted successfully'], 200);
    }

    public function getAdherents(Request $request){
        $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $adherents = Adherent::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['adherents' => $adherents], 200);
    }
}
