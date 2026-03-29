<?php

namespace App\Http\Controllers\franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Franchise;

class FranchiseController extends Controller
{
    public function create(Request $request){
       $validatedData = $request->validate([
        'nom' => 'required|string',
        'franchise'=> 'sometimes|nullable|numeric',
        'pourcentage'=> 'sometimes|nullable|numeric',
        'grp_franchise_id'=>'required|numeric',
        'condition_id'=>'required|numeric',
       
    ]);
    
    $franchise=Franchise::create([
        'nom' => $validatedData['nom'],
        'franchise' => $validatedData['franchise'] ?? 0,
        'pourcentage' => $validatedData['pourcentage'] ?? 0,
        'grp_franchise_id' => $validatedData['grp_franchise_id'],
        'condition_id' => $validatedData['condition_id'],
    ]);

    return response()->json(['message' => 'franchise has been created successfully', 'franchise' => $franchise], 200);
    }

    public function update(Request $request, $id = null){
       $validatedData = $request->validate([
        'nom' => 'sometimes|string',
        'franchise' => 'sometimes|nullable|numeric',
        'pourcentage'=> 'sometimes|nullable|numeric',
        'grp_franchise_id' => 'sometimes|numeric',
        'condition_id' => 'sometimes|numeric',
    ]);
    
    $franchiseId = $id ?? $request->id;
    $franchise = Franchise::find($franchiseId);
    
    if (!$franchise) {
        return response()->json(['message' => 'franchise not found'], 404);
    }

    // Explicitly handle updating, fallback to 0 if passing a null payload for these fields
    if ($request->has('franchise')) $franchise->franchise = $validatedData['franchise'] ?? 0;
    if ($request->has('pourcentage')) $franchise->pourcentage = $validatedData['pourcentage'] ?? 0;
    if (isset($validatedData['nom'])) $franchise->nom = $validatedData['nom'];
    if (isset($validatedData['grp_franchise_id'])) $franchise->grp_franchise_id = $validatedData['grp_franchise_id'];
    if (isset($validatedData['condition_id'])) $franchise->condition_id = $validatedData['condition_id'];

    $franchise->save();

    return response()->json(['message' => 'franchise has been updated successfully', 'franchise' => $franchise], 200);
    }

     public function delete($id){
         $franchise = Franchise::where('id', $id )->first();
    if (!$franchise) {
        return response()->json(['message' => 'franchise not found'], 404);
    }
    $franchise->delete();
    return response()->json(['message' => 'franchise has been deleted successfully'], 200);
    }

    public function getFranchises(Request $request){
        $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $franchises = Franchise::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['franchises' => $franchises], 200);
    }

}
