<?php

namespace App\Http\Controllers\franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Condition;

class ConditionController extends Controller
{
    public function create(Request $request){
        $request->validate([
        'condition'=>'required|array',
        'condition.max'=>'nullable|number',
        'condition.plafond'=>'nullable|double',
        'condition.dure'=>'nullable|string',
    ]);
    $condition=Condition::create([
        'condition' => $validatedData['condition'],
        
    ]);

    return response()->json(['message' => 'condition has been created successfully'], 200);
    }
       public function updateFarend(Request $request, $id)
{
    $condition = Condition::find($id);

    if (!$condition) {
        return response()->json(['message' => 'condition not found'], 404);
    }

    $validatedData = $request->validate([
        'condition'=>'sometimes|array',
        'condition.max'=>'nullable|number',
        'condition.plafond'=>'nullable|double',
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
            $q->where('condition', 'like', "%{$query}%");
        })
        ->paginate($perPage);
        return response()->json(['conditions' => $conditions], 200);
}
}
