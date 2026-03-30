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
    /**
     * Compute the real accumulated frais_engage from actual Cas records.
     * exclude_cas_id: when updating a cas, exclude it so we don't count it twice.
     */
    private function getAccumulatedFrais($beneficiare_id, $condition_id, $dure, $exclude_num_quitance = null)
    {
        $query = Cas::join('franchises', 'cas.franchise_id', '=', 'franchises.id')
            ->where('cas.beneficiare_id', $beneficiare_id)
            ->where('franchises.condition_id', $condition_id);

        if ($exclude_num_quitance) {
            $query->where('cas.num_quitance', '!=', $exclude_num_quitance);
        }

        // Filter by period
        if ($dure === 'mois') {
            $query->whereYear('cas.created_at', now()->year)
                  ->whereMonth('cas.created_at', now()->month);
        } elseif ($dure === 'anne') {
            $query->whereYear('cas.created_at', now()->year);
        }

        return (float) $query->sum('cas.frais_engage');
    }

    private function calculateTotalAndHandleCondition($validatedData, $exclude_num_quitance = null)
    {
        $franchise = Franchise::where('id', $validatedData['franchise_id'])->first();
        $condition_id = $franchise->condition_id ?? null;
        $condition = $condition_id ? Condition::where('id', $condition_id)->first() : null;

        $statusmax = true;
        $statusplafond = true;

        $dure = $condition ? ($condition->condition['dure'] ?? '') : '';
        $limitMax = $condition ? ($condition->condition['max'] ?? null) : null;
        $limitPlafond = $condition ? ($condition->condition['plafond'] ?? null) : null;

        // Compute accumulated frais from actual Cas records (no stored state)
        $accumulatedFrais = $condition_id
            ? $this->getAccumulatedFrais($validatedData['beneficiare_id'], $condition_id, $dure, $exclude_num_quitance)
            : 0;

        $accumulatedCount = $condition_id
            ? Cas::join('franchises', 'cas.franchise_id', '=', 'franchises.id')
                ->where('cas.beneficiare_id', $validatedData['beneficiare_id'])
                ->where('franchises.condition_id', $condition_id)
                ->when($exclude_num_quitance, fn($q) => $q->where('cas.num_quitance', '!=', $exclude_num_quitance))
                ->when($dure === 'mois', fn($q) => $q->whereYear('cas.created_at', now()->year)->whereMonth('cas.created_at', now()->month))
                ->when($dure === 'anne', fn($q) => $q->whereYear('cas.created_at', now()->year))
                ->count()
            : 0;

        

        // Check plafond and compute reimbursable
        $reimbursable = (float) $validatedData['frais_engage'];
        if ($limitPlafond !== null) {
            if ($accumulatedFrais + $validatedData['frais_engage'] > $limitPlafond) {
                $statusplafond = false;
                $reimbursable = max(0, $limitPlafond - $accumulatedFrais);
            }
        }

        // Apply franchise deduction
        $total = 0;
        if ($reimbursable > 0) {
            if (isset($franchise->franchise) && $franchise->franchise > 0) {
                $total = max(0, $reimbursable - $franchise->franchise);
            } elseif (isset($franchise->pourcentage) && $franchise->pourcentage > 0) {
                $total = max(0, $reimbursable - ($reimbursable * ($franchise->pourcentage / 100)));
            } else {
                $total = $reimbursable;
            }
        }

        // Check max
        if ($limitMax !== null && ($accumulatedCount + 1) > $limitMax) {
            $statusmax = false;
            $total=0;
        }

        // Update condBeneficiaire as a lightweight tracking record (not used for accumulation)
        if ($condition_id) {
            $condBeneficiaire = CondBeneficiare::firstOrNew([
                'beneficiare_id' => $validatedData['beneficiare_id'],
                'condition_id'   => $condition_id,
            ]);
            $condBeneficiaire->status = $statusmax && $statusplafond;
            $condBeneficiaire->condition = [
                'max'    => $accumulatedCount + 1,
                'plafond' => $accumulatedFrais + $validatedData['frais_engage'],
                'date'   => now()->format('m-Y'),
            ];
            $condBeneficiaire->save();
        }

        return [
            'total'         => max(0, $total),
            'statusmax'     => $statusmax,
            'statusplafond' => $statusplafond,
        ];
    }

    private function reverseCondition($cas)
    {
        $franchise = Franchise::where('id', $cas->franchise_id)->first();
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

    private function checkStatusMaxAndPlafond($validatedData, $exclude_num_quitance = null)
    {
        $franchise = Franchise::where('id', $validatedData['franchise_id'])->first();
        if (!$franchise || !$franchise->condition_id) {
            return ['statusmax' => true, 'statusplafond' => true];
        }

        $condition = Condition::where('id', $franchise->condition_id)->first();
        if (!$condition) {
            return ['statusmax' => true, 'statusplafond' => true];
        }

        $dure = $condition->condition['dure'] ?? '';
        $limitMax = $condition->condition['max'] ?? null;
        $limitPlafond = $condition->condition['plafond'] ?? null;

        $accumulatedFrais = $this->getAccumulatedFrais(
            $validatedData['beneficiare_id'],
            $franchise->condition_id,
            $dure,
            $exclude_num_quitance
        );

        $accumulatedCount = Cas::join('franchises', 'cas.franchise_id', '=', 'franchises.id')
            ->where('cas.beneficiare_id', $validatedData['beneficiare_id'])
            ->where('franchises.condition_id', $franchise->condition_id)
            ->when($exclude_num_quitance, fn($q) => $q->where('cas.num_quitance', '!=', $exclude_num_quitance))
            ->when($dure === 'mois', fn($q) => $q->whereYear('cas.created_at', now()->year)->whereMonth('cas.created_at', now()->month))
            ->when($dure === 'anne', fn($q) => $q->whereYear('cas.created_at', now()->year))
            ->count();

        $statusmax = true;
        $statusplafond = true;

        if ($limitMax !== null && ($accumulatedCount + 1) > $limitMax) {
            $statusmax = false;
        }

        if ($limitPlafond !== null && ($accumulatedFrais + $validatedData['frais_engage']) > $limitPlafond) {
            $statusplafond = false;
        }

        return ['statusmax' => $statusmax, 'statusplafond' => $statusplafond];
    }

    public function create(Request $request)
    {
        $validatedData = $request->validate([
            
            'date' => 'required|date',
            'assure_id' => 'required|numeric',
            'beneficiare_id' => 'required|numeric',
            'frais_engage' => 'required|numeric',
            'franchise_id' => 'required|numeric',
            'piece_id' => 'sometimes|nullable|numeric',
            'force_create' => 'sometimes|boolean',
        ]);

        $check = $this->checkStatusMaxAndPlafond($validatedData);
        $forceCreate = $request->input('force_create', false);

        if (!$forceCreate) {
            if (!$check['statusmax']) {
                return response()->json([
                    'message' => 'Le nombre maximum de cas a été atteint pour cette condition.',
                    'requires_force' => true
                ], 400);
            }
            if (!$check['statusplafond']) {
                return response()->json([
                    'message' => 'Le plafond de frais a été dépassé pour cette condition.',
                    'requires_force' => true
                ], 400);
            }
        }

        $calculated = $this->calculateTotalAndHandleCondition($validatedData);

        
        $num = Cas::whereYear('date', now()->year)->count();
        $num_quitance = $num + 1 . '/' . now()->year;

        $casData = collect($validatedData)->except('force_create')->toArray();
        $casData['total'] = $calculated['total'];
        $casData['status'] = $calculated['statusmax'] && $calculated['statusplafond'];
        $casData['num_quitance'] = $num_quitance;

        $cas = Cas::create($casData);

        return response()->json(['message' => 'Cas has been created successfully', 'cas' => $cas], 200);
    }

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'num_quitance' => 'sometimes|string',
            'date' => 'sometimes|date',
            'assure_id' => 'sometimes|numeric',
            'beneficiare_id' => 'sometimes|numeric',
            'frais_engage' => 'sometimes|numeric',
            'franchise_id' => 'sometimes|numeric',
            'piece_id' => 'sometimes|nullable|numeric',
            'force_create' => 'sometimes|boolean',
        ]);

        // Look up by route parameter
        $casId = $request->route('id');
        $cas = Cas::where('num_quitance', $casId)->first();
        
        if (!$cas) {
            return response()->json(['message' => 'Cas not found'], 404);
        }

        // Merge new data over the existing Cas
        $newData = array_merge($cas->toArray(), $validatedData);

        // Check limits — exclude this Cas from accumulated count since we're replacing it
        $check = $this->checkStatusMaxAndPlafond($newData, $casId);
        $forceCreate = $request->input('force_create', false);

        if (!$forceCreate) {
            if (!$check['statusmax']) {
                return response()->json([
                    'message' => 'Le nombre maximum de cas a été atteint.',
                    'requires_force' => true
                ], 400);
            }
            if (!$check['statusplafond']) {
                return response()->json([
                    'message' => 'Le plafond de frais a été dépassé.',
                    'requires_force' => true
                ], 400);
            }
        }

        // Calculate new total — also exclude this Cas from accumulation
        $calculated = $this->calculateTotalAndHandleCondition($newData, $casId);

        $updatePayload = collect($validatedData)->except('force_create')->toArray();
        $updatePayload['total'] = $calculated['total'];
        $updatePayload['status'] = $calculated['statusmax'] && $calculated['statusplafond'];

        $cas->update($updatePayload);

        return response()->json(['message' => 'Cas has been updated successfully', 'cas' => $cas], 200);
    }

    public function delete($id)
    {
        $cas = Cas::where('num_quitance', $id)->first();
        
        if (!$cas) {
            return response()->json(['message' => 'Cas not found'], 404);
        }

        // Reverse effect before deleting
        $this->reverseCondition($cas);
        $cas->delete();

        return response()->json(['message' => 'Cas has been deleted successfully'], 200);
    }

    public function getCas(Request $request){
        $perPage = $request->get('per_page', 10);
        $query   = $request->get('q');
        $cas = Cas::query()
            ->when($query, function ($q) use ($query) {
                $q->where('num_quitance', 'like', "%{$query}%");
            })
            ->paginate($perPage);
        return response()->json(['cas' => $cas], 200);
    }
}
