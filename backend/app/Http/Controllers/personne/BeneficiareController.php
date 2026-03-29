<?php

namespace App\Http\Controllers\personne;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Beneficiare;

class BeneficiareController extends Controller
{
     public function create(Request $request){
        $validatedData =$request->validate([
        'nom' => 'required|string',
        'prenom'=>'required|string',
        'date_naissance'=>'required|date',
        'lien'=>'required|string',
        'adherent_id'=>'required|integer',
    ]);
    $beneficiare=Beneficiare::create([
        'nom' => $validatedData['nom'],
        'prenom' => $validatedData['prenom'],
        'date_naissance' => $validatedData['date_naissance'],
        'lien' => $validatedData['lien'],
        'adherent_id' => $validatedData['adherent_id'],
    ]);

    return response()->json(['message' => 'beneficiare has been created successfully'], 200);
    }

    public function update(Request $request){
      $validatedData =  $request->validate([
        'nom' => 'sometimes|string',
        'prenom'=>'sometimes|string',
        'date_naissance'=>'sometimes|date',
        'lien'=>'sometimes|string',
        'adherent_id'=>'sometimes|string',
    ]);
    $beneficiare=Beneficiare::update($validatedData);

    return response()->json(['message' => 'beneficiare has been updated successfully'], 200);
    }

     public function delete($id){
         $beneficiare = Beneficiare::where('id', $id )->first();
    if (!$beneficiare) {
        return response()->json(['message' => 'beneficiare not found'], 404);
    }
    $beneficiare->delete();
    return response()->json(['message' => 'beneficiare has been deleted successfully'], 200);
    }

    public function getBeneficiares(Request $request){
        $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $beneficiares = Beneficiare::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['beneficiares' => $beneficiares], 200);
    }
}
