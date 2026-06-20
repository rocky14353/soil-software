# Stage-Cap Enforcement Patches Applied to All Combinations

## Status Summary

### ✅ calculateCombination1
- [x] Original stage targets in rebalancing
- [x] Basal uses safeAddFertilizer
- [x] Stage 2 uses original targets
- [x] Stage 2 P uses safeAddFertilizer
- [x] Stage 2 N capped to stage limit
- [x] Stage 2 validation after completion

### ✅ calculateCombination2
- [x] Original stage targets in rebalancing
- [x] Basal uses safeAddFertilizer
- [x] Stage 2 uses original targets
- [x] Stage 2 P uses safeAddFertilizer
- [x] Stage 2 N capped to stage limit
- [x] Stage 2 validation after completion
- [x] Stage 3+ uses original targets with safeAddFertilizer

### ⚠️ calculateCombination3-6
- [ ] Need same patches as Combination2

## Exact Locations Patched in calculateCombination2

1. **Basal Stage (lines 2423-2469)**:
   - Replaced direct `.push()` for 14-35-14 with `safeAddFertilizer()`
   - Replaced direct `.push()` for N fertilizer with `safeAddFertilizer()`
   - Replaced direct `.push()` for K fertilizer with `safeAddFertilizer()`

2. **Stage 2 Rebalancing (lines 2490-2501)**:
   - Changed from `adjustedStage2N = remainingNTotal / remainingStages` to `topN = originalStage2N`
   - Changed from `adjustedStage2P = remainingPTotal` to `stage2P = originalStage2P`
   - Changed from `adjustedStage2K = remainingKTotal / remainingStages` to `topK = originalStage2K`

3. **Stage 2 P Addition (lines 2514-2538)**:
   - Replaced direct `.push()` with `safeAddFertilizer()` with deliveredBefore tracking

4. **Stage 2 N Addition (lines 2540-2595)**:
   - Added `maxAllowedN` calculation to cap N to stage limit
   - Replaced direct `.push()` with `safeAddFertilizer()`

5. **Stage 2 Validation (after line 2654)**:
   - Added validation checks for N/P overflow and K violation

6. **Stage 3+ Rebalancing (lines 2657-2725)**:
   - Changed from adjusted targets to original targets
   - Replaced direct `.push()` with `safeAddFertilizer()`

## Remaining Work

Same patches need to be applied to:
- calculateCombination3
- calculateCombination4
- calculateCombination5
- calculateCombination6






