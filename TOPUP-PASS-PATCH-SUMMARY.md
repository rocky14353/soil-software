# Stage-Safe Top-Up Pass - Implementation Summary

## Overview
Added a final **stage-safe top-up pass** after normal allocation and rounding to improve quota closure while maintaining all stage constraints.

## Patch Location
- **Function**: `applyStageSafeTopUp()` (lines 1686-1840)
- **Integration**: Added before `return recommendations;` in all `calculateCombinationX` functions (1-6)

## Algorithm

### For Each Stage:
1. **Calculate delivered nutrients** from existing fertilizers
2. **Get original stage targets** from `nPerSplit[i]`, `pPerSplit[i]`, `kPerSplit[i]`
3. **Calculate headroom** (remaining capacity before stage cap with 12% tolerance):
   - `nHeadroom = stageTargetN * 1.12 - deliveredN`
   - `pHeadroom = stageTargetP * 1.12 - deliveredP`
   - `kHeadroom = stageTargetK * 1.12 - deliveredK`

### N Top-Up (if headroom > 0.5 kg):
- Select N fertilizer (A.S preferred, Urea fallback)
- Cap quantity by headroom
- Round to nearest bag (not up) to avoid overshoot
- Validate with `safeAddFertilizer()` before adding
- Update delivered values after successful addition

### P Top-Up (if headroom > 0.1 kg AND stage is not Panicle):
- **CRITICAL**: Skip if `stageIdx === 2` (Panicle - P not allowed)
- Use SSP (16% P, 12% S) for precise top-up
- Cap by headroom, round, validate with `safeAddFertilizer()`

### K Top-Up (if headroom > 0.5 kg AND stage is not Tillering):
- **CRITICAL**: Skip if `stageIdx === 1` (Tillering - K not allowed)
- Select K fertilizer (SOP/MOP based on preferences)
- Cap by headroom, round, validate with `safeAddFertilizer()`

## Safety Guarantees

✅ **Stage caps enforced**: All additions validated against `stageTarget * 1.12`
✅ **Tillering K = 0**: Explicit check `stageIdx !== 1` prevents K in Tillering
✅ **Panicle P = 0**: Explicit check `stageIdx !== 2` prevents P in Panicle
✅ **No quota leakage**: Each stage only fills its own headroom
✅ **All additions validated**: Every fertilizer addition goes through `safeAddFertilizer()`

## Expected Improvement

For the SOUTH TELENGANA regression case:
- **Before**: N deficit ≈ 5.6 kg, P deficit ≈ 0.1 kg, K deficit ≈ 1.0 kg
- **After**: Should close most/all of N deficit using stage headroom across all 3 stages
- **Stage headroom available**: 
  - Basal N ≈ 2.53 kg
  - Tillering N ≈ 1.28 kg
  - Panicle N ≈ 1.83 kg
  - **Total N headroom ≈ 5.64 kg** (matches leftover N)

## Integration Points

All combination functions now call:
```javascript
applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combinationX');
```

Before the final `return recommendations;` statement.

## Testing

1. **Quota closure test**: Verify leftover N/P/K reduced vs previous result
2. **Stage cap test**: Verify no stage exceeds its target + 12% tolerance
3. **Tillering K test**: Verify Tillering K still = 0
4. **Panicle P test**: Verify Panicle P still = 0
5. **Stage ownership test**: Verify no quota moved between stages






