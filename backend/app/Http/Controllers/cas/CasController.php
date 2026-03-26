<?php

namespace App\Http\Controllers\cas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cas;
use App\Models\CondBeneficiare;
use App\Models\Franchise;
use App\Models\Condition;

class CasController extends Controller
{
    private function calculateTotalAndHandleCondition($validatedData)
    {
        $franchise = Franchise::where('franchise_id', $validatedData['franchise_id'])->first();
        $condition_id = $franchise->condition_id ?? null;
        $condition = $condition_id ? Condition::where('id', $condition_id)->first() : null;
        
        $condBeneficiaire = null;
        if ($condition_id) {
            $condBeneficiaire = CondBeneficiare::where('beneficiare_id', $validatedData['beneficiare_id'])
                ->where('condition_id', $condition_id)
                ->first();
        }

        $statusmax = true;
        $statusplafond = true;
        
        $now = now()->format('m-Y');
        
        if ($condBeneficiaire && $condition) {
            $cond = $condBeneficiaire->condition;
            if (!isset($cond['date'])) $cond['date'] = $now;
            
            [$monthnow, $yearnow] = explode('-', $now);
            $dateParts = explode('-', $cond['date']);
            $month = $dateParts[0] ?? $monthnow;
            $year = $dateParts[1] ?? $yearnow;
            
            $dure = $condition->condition['dure'] ?? '';
            if (($dure == "anne" && $year != $yearnow) || ($dure == "mois" && $month != $monthnow)) {
                $cond['date'] = $now;
                $cond['plafond'] = 0;
                $cond['max'] = 0;
            }
            
            $condBeneficiaire->condition = $cond;
        }

        $accumulatedMax = $condBeneficiaire ? ($condBeneficiaire->condition['max'] ?? 0) : 0;
        $accumulatedPlafond = $condBeneficiaire ? ($condBeneficiaire->condition['plafond'] ?? 0) : 0;

        // Check max
        if ($condition && isset($condition->condition['max'])) {
            if ($accumulatedMax + 1 > $condition->condition['max']) {
                $statusmax = false;
            }
        }

        // Check plafond
        $reimbursable = (float) $validatedData['frais_engage'];
        if ($condition && isset($condition->condition['plafond'])) {
            if ($accumulatedPlafond + $validatedData['frais_engage'] > $condition->condition['plafond']) {
                $statusplafond = false;
                $reimbursable = max(0, $condition->condition['plafond'] - $accumulatedPlafond);
            }
        }

        $total = 0;
        if ($statusmax && $reimbursable > 0) {
            if (isset($franchise->franchise) && $franchise->franchise > 0) {
                $total = $reimbursable - $franchise->franchise;
            } else {
                $pourcentage = $franchise->pourcentage ?? 0;
                $total = $reimbursable * $pourcentage;
            }
        }
        $total = max(0, $total);

        // Save CondBeneficiaire changes
        if ($condition_id) {
            if ($condBeneficiaire) {
                $cond = $condBeneficiaire->condition;
                $cond['max'] = $accumulatedMax + 1;
                $cond['plafond'] = $accumulatedPlafond + $validatedData['frais_engage'];
                $condBeneficiaire->condition = $cond;
                $condBeneficiaire->save();
            } else {
                CondBeneficiare::create([
                    'condition_id'   => $condition_id,
                    'beneficiare_id' => $validatedData['beneficiare_id'],
                    'status'         => true,
                    'condition'      => [
                        'max' => 1,
                        'plafond' => $validatedData['frais_engage'],
                        'date' => $now,
                    ],
                ]);
            }
        }

        return [
            'total' => $total,
            'statusmax' => $statusmax,
            'statusplafond' => $statusplafond
        ];
    }

    private function reverseCondition($cas)
    {
        $franchise = Franchise::where('franchise_id', $cas->franchise_id)->first();
        if (!$franchise || !$franchise->condition_id) return;
        
        $condBeneficiaire = CondBeneficiare::where('beneficiare_id', $cas->beneficiare_id)
            ->where('condition_id', $franchise->condition_id)
            ->first();
            
        if ($condBeneficiaire) {
            $cond = $condBeneficiaire->condition;
            if (isset($cond['max'])) {
                $cond['max'] = max(0, (int)$cond['max'] - 1);
            }
            if (isset($cond['plafond'])) {
                $cond['plafond'] = max(0, (float)$cond['plafond'] - $cas->frais_engage);
            }
            $condBeneficiaire->condition = $cond;
            $condBeneficiaire->save();
        }
    }

    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'required|string',
            'date' => 'required|date',
            'assure_id' => 'required|string',
            'adherent_id' => 'required|string',
            'beneficiare_id' => 'required|string',
            'frais_engage' => 'required|numeric',
            'franchise_id' => 'required|string',
            'piece_id' => 'required|string',
        ]);

        $calculated = $this->calculateTotalAndHandleCondition($validatedData);

        $casData = $validatedData;
        $casData['total'] = $calculated['total'];
        $casData['status'] = $calculated['statusmax'] && $calculated['statusplafond'];

        $cas = Cas::create($casData);

        return response()->json(['message' => 'Cas has been created successfully', 'cas' => $cas], 200);
    }

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'sometimes|string',
            'date' => 'sometimes|date',
            'assure_id' => 'sometimes|string',
            'adherent_id' => 'sometimes|string',
            'beneficiare_id' => 'sometimes|string',
            'frais_engage' => 'sometimes|numeric',
            'franchise_id' => 'sometimes|string',
            'piece_id' => 'sometimes|string',
        ]);

        $casId = $validatedData['id'] ?? $request->id;
        $cas = Cas::where('id', $casId)->first();
        
        if (!$cas) {
            return response()->json(['message' => 'Cas not found'], 404);
        }

        // Reverse old effect
        $this->reverseCondition($cas);

        // Update with new data to calculate new totals
        $newData = array_merge($cas->toArray(), $validatedData);
        $calculated = $this->calculateTotalAndHandleCondition($newData);

        $validatedData['total'] = $calculated['total'];
        $validatedData['status'] = $calculated['statusmax'] && $calculated['statusplafond'];

        $cas->update($validatedData);

        return response()->json(['message' => 'Cas has been updated successfully', 'cas' => $cas], 200);
    }

    public function delete($id)
    {
        $cas = Cas::where('id', $id)->first();
        
        if (!$cas) {
            return response()->json(['message' => 'Cas not found'], 404);
        }

        // Reverse effect before deleting
        $this->reverseCondition($cas);
        $cas->delete();

        return response()->json(['message' => 'Cas has been deleted successfully'], 200);
    }
}
