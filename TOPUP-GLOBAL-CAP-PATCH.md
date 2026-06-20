# Top-Up Pass Global Cap Patch - Summary

## Problem
The top-up pass was overshooting total N (50.3 vs required 48.0 = +2.3 kg excess) because it was only checking stage headroom, not global remaining quotas.

## Solution
Added global remaining nutrient tracking and dual capping (stage headroom AND global remaining).

## Patch Details

### A) Patch Location
- **Function**: `applyStageSafeTopUp()` (lines 1686-1900)
- **Key Changes**:
  1. Calculate total required N/P/K from `nPerSplit`, `pPerSplit`, `kPerSplit`
  2. Track global delivered totals across all stages
  3. Calculate global remaining = total required - global delivered
  4. Cap each top-up by `min(stageHeadroom, globalRemaining)`
  5. Skip 0.00 kg fertilizers
  6. Add debug logs for each top-up attempt

### B) Minimal Patch Diff

**Before:**
```javascript
const nToAdd = Math.min(nHeadroom, stageTargetN * 1.12 - deliveredN);
```

**After:**
```javascript
// Calculate global totals
const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
let globalDelivered = computeGlobalDelivered();
let globalRemainingN = Math.max(0, totalNRequired - globalDelivered.n);

// Cap by BOTH stage headroom AND global remaining
const nToAdd = Math.min(nHeadroom, globalRemainingN, stageTargetN * 1.12 - deliveredN);

// After successful addition:
globalDelivered.n += actualNutrients.n;
globalRemainingN = Math.max(0, totalNRequired - globalDelivered.n);
```

### C) Why It Prevents N Overshoot

1. **Dual Capping**: Each top-up is capped by `min(stageHeadroom, globalRemaining)`, preventing additions beyond global quota
2. **Global Tracking**: After each successful addition, global delivered and remaining are recomputed
3. **Early Termination**: Top-up attempts stop when `globalRemaining <= 0.1`
4. **Conservative Rounding**: Uses `roundToBag()` (nearest) instead of `roundToBagUp()` to minimize overshoot

**Example:**
- Stage 1 headroom = 2.5 kg, global remaining = 5.6 kg → can add up to 2.5 kg
- After adding 2.5 kg: global remaining = 3.1 kg
- Stage 2 headroom = 1.3 kg, global remaining = 3.1 kg → can add up to 1.3 kg
- After adding 1.3 kg: global remaining = 1.8 kg
- Stage 3 headroom = 1.8 kg, global remaining = 1.8 kg → can add up to 1.8 kg
- After adding 1.8 kg: global remaining = 0 kg → stops

### D) Safety Guarantees

✅ **Tillering K = 0**: Explicit check `stageIdx !== 1` prevents K addition
✅ **Panicle P = 0**: Explicit check `stageIdx !== 2` prevents P addition
✅ **Stage caps**: All additions validated against `stageTarget * 1.12`
✅ **Global quota**: All additions validated against `totalRequired * 1.12`
✅ **No 0.00 kg rows**: Skip if `rounded.kgs <= 0`
✅ **No quota leakage**: Each stage only fills its own headroom

### E) Debug Logs Added

For each top-up attempt:
- Stage index
- Nutrient (N/P/K)
- Stage headroom
- Global remaining
- Chosen top-up amount
- Rounded quantity
- Actual nutrient contribution
- Accepted/rejected status and reason

Example log:
```
[combination1-topup] Stage 0 N: headroom=2.53, globalRemaining=5.60, chosenTopUp=2.50, roundedQty=11.90, actualN=2.50
[combination1-topup] Stage 0 N: ACCEPTED - new globalRemaining=3.10
```






