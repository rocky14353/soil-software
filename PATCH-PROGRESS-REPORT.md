# Stage-Cap Enforcement Patch Progress Report

## A) Exact Locations Patched

### calculateCombination1 ✅ COMPLETE
1. **Basal Stage (lines 1776-1811)**: All direct `.push()` replaced with `safeAddFertilizer()`
2. **Stage 2 Rebalancing (lines 1822-1832)**: Changed to use original stage targets
3. **Stage 2 P Addition (lines 1869-1901)**: Uses `safeAddFertilizer()` with deliveredBefore tracking
4. **Stage 2 N Addition (lines 1942-1974)**: Capped to stage limit, uses `safeAddFertilizer()`
5. **Stage 2 Validation (after line 2038)**: Added validation checks
6. **Stage 3+ Rebalancing (lines 2042-2055)**: Uses original targets

### calculateCombination2 ✅ COMPLETE
1. **Basal Stage (lines 2423-2469)**: All direct `.push()` replaced with `safeAddFertilizer()`
2. **Stage 2 Rebalancing (lines 2490-2501)**: Changed to use original stage targets
3. **Stage 2 P Addition (lines 2514-2538)**: Uses `safeAddFertilizer()` with deliveredBefore tracking
4. **Stage 2 N Addition (lines 2540-2595)**: Capped to stage limit, uses `safeAddFertilizer()`
5. **Stage 2 Validation (after line 2654)**: Added validation checks
6. **Stage 3+ Rebalancing (lines 2657-2725)**: Uses original targets with `safeAddFertilizer()`

### calculateCombination3-6 ⚠️ PENDING
Same pattern needs to be applied.

## B) Patch Diffs

### Pattern 1: Basal Stage - Replace Direct Push
```javascript
// BEFORE:
stage1.fertilizers.push({ name: 'Gromor 14-35-14', ... });

// AFTER:
const fertilizerObj = { name: 'Gromor 14-35-14', ... };
const stageTargets = { n: basalN, p: basalP, k: basalK };
const deliveredBefore = { n: 0, p: 0, k: 0 };
safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combinationX-basal-14-35-14');
```

### Pattern 2: Stage 2 Rebalancing - Use Original Targets
```javascript
// BEFORE:
const adjustedStage2N = remainingStages > 0 ? remainingNTotal / remainingStages : nPerSplit[1];
const adjustedStage2P = (pPerSplit[1] || 0) > 0 ? remainingPTotal : 0;
const topN = Math.max(0, adjustedStage2N);

// AFTER:
const originalStage2N = nPerSplit[1] || 0;
const originalStage2P = pPerSplit[1] || 0;
const originalStage2K = kPerSplit[1] || 0;
const topN = originalStage2N;
const stage2P = originalStage2P;
const topK = originalStage2K;
```

### Pattern 3: Stage 2 N Addition - Cap to Stage Limit
```javascript
// BEFORE:
const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
stage2.fertilizers.push({ ... });

// AFTER:
let stage2DeliveredN = 0;
stage2.fertilizers.forEach(fert => { stage2DeliveredN += fert.nContributed || 0; });
const maxAllowedN = topN - stage2DeliveredN;
const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
if (nToAdd > 0) {
    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
    // ... use safeAddFertilizer
}
```

## C) Remaining Direct Adds Still Unsafe

### calculateCombination3
- Basal: lines 2976, 2994, 3012 (direct pushes)
- Stage 2: lines 3036, 3059 (direct pushes)

### calculateCombination4
- Basal: lines 3447, 3471, 3490, 3506 (direct pushes)
- Stage 2: line 3574 (direct push)

### calculateCombination5
- Basal: lines 3909, 3927 (direct pushes)
- Stage 2: lines 3992, 4015 (direct pushes)

### calculateCombination6
- Basal: lines 4402, 4420, 4440 (direct pushes)
- Stage 2: lines 4505, 4528 (direct pushes)

## D) Test Execution

A test HTML file `test-regression-output.html` has been created. Open it in a browser to see actual output.

## E) Regression Output

**Expected:**
- Basal: N=16, P=22.4, K=10.5
- Tillering: N=16, P=9.6, K=0
- Panicle: N=16, P=0, K=10.5

**Actual output will be shown when test-regression-output.html is opened in browser.**






