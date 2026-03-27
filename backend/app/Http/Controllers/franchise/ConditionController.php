<?php

namespace App\Http\Controllers\franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Condition;

class ConditionController extends Controller
{
    public function create(Request $request){
        $validatedData =$request->validate([
        'nom'=>'required|string',
        'condition'=>'required|array',
        'condition.max'=>'nullable|integer',
        'condition.plafond'=>'nullable|numeric',
        'condition.dure'=>'nullable|string',
    ]);
    $condition=Condition::create([
        'nom' => $validatedData['nom'],
        'condition' => $validatedData['condition'],
        
    ]);

    return response()->json(['message' => 'condition has been created successfully'], 200);
    }
       public function update(Request $request, $id)
{
    $condition = Condition::find($id);

    if (!$condition) {
        return response()->json(['message' => 'condition not found'], 404);
    }

   $validatedData = $validatedData = $request->validate([
        'nom'=>'sometimes|string',
        'condition'=>'sometimes|array',
        'condition.max'=>'nullable|integer',
        'condition.plafond'=>'nullable|numeric',
        'condition.dure'=>'nullable|string',
    ]);

    // Update simple fields
    $condition->fill($validatedData);

  

    $condition->save();

    return response()->json([
        'message' => 'condition has been updated successfully',
        'condition'  => $condition
    ]);
}

public function delete($id){
     $condition = Condition::find($id);

        if (!$condition) {
            return response()->json(['message' => 'condition not found'], 404);
        }

        $condition->delete();

        return response()->json(['message' => 'condition has been deleted successfully']);
}

public function getConditions(Request $request){
    $perPage = $request->get('per_page', 10);
    $query   = $request->get('q');
    $conditions = Condition::query()
        ->when($query, function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['conditions' => $conditions], 200);
}
}
