<?php

namespace App\Http\Controllers\franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Franchise;

class FranchiseController extends Controller
{
    public function create(Request $request){
        $request->validate([
        'nom' => 'required|string',
        'franchise'=>'required|string',
        'grp_franchise_id'=>'required|string',
        'condition_id'=>'required|string',
       
    ]);
    $franchise=Franchise::create([
        'nom' => $validatedData['nom'],
        'franchise' => $validatedData['franchise'],
        'grp_franchise_id' => $validatedData['grp_franchise_id'],
        'condition_id' => $validatedData['condition_id'],
    ]);

    return response()->json(['message' => 'franchise has been created successfully'], 200);
    }

    public function update(Request $request){
        $request->validate([
        'nom' => 'sometimes|string',
        'franchise' => 'sometimes|string',
        'grp_franchise_id' => 'sometimes|string',
        'condition_id' => 'sometimes|string',
        
    ]);
    $franchise=Franchise::update($validatedData);

    return response()->json(['message' => 'franchise has been updated successfully'], 200);
    }

     public function deleteUser($id){
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
