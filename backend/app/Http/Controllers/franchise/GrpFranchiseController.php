<?php

namespace App\Http\Controllers\franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GrpFranchise;

class GrpFranchiseController extends Controller
{
       public function create(Request $request){
       $validatedData = $request->validate([
        'nom' => 'required|string',
       
    ]);
    $grpFranchise=GrpFranchise::create([
        'nom' => $validatedData['nom'],
        
        
    ]);

    return response()->json(['message' => 'grpFranchise has been created successfully'], 200);
    }

    public function update(Request $request){
       $validatedData = $request->validate([
        'nom' => 'sometimes|string',
        
    ]);
    $grpFranchise=GrpFranchise::update($validatedData);

    return response()->json(['message' => 'grpFranchise has been updated successfully'], 200);
    }

     public function delete($id){
         $grpFranchise = GrpFranchise::where('id', $id )->first();
    if (!$grpFranchise) {
        return response()->json(['message' => 'grpFranchise not found'], 404);
    }
    $grpFranchise->delete();
    return response()->json(['message' => 'grpFranchise has been deleted successfully'], 200);
    }

    public function getGrpFranchises(Request $request){
        $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $grpFranchises = GrpFranchise::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['grpFranchises' => $grpFranchises], 200);
    }
}
