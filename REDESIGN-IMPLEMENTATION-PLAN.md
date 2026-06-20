# Redesign Implementation Plan

## Implementation Steps

### Phase 1: New Rounding Functions ✅
- Create `roundToBagPrecise()` - uses 2.5kg and 5kg steps, chooses more precise
- Create `roundToBagMidpoint()` - uses midpoint tolerance rule
- Update bag sizes: Urea = 45kg, Others = 50kg
- Round UP for P/N, nearest for K

### Phase 2: P-First Core Logic ✅
- Create `calculateStagePFirst()` - new core function
- P status-based fertilizer selection
- Account for N/K from complex fertilizer
- Top up deficits with straight fertilizers
- K threshold logic (35-40% rule)

### Phase 3: Tolerance & Compensation ✅
- Stage-wise ±10% tolerance
- Overall max 5% excess, no deficit
- Stage compensation logic (+10%/-10% preferred)

### Phase 4: Product Minimization ✅
- Max 3 products per stage
- Fertilizer reuse optimization (if soil allows)

### Phase 5: Update All Combinations ✅
- Replace old logic with new P-first logic
- Test and validate

---

## New Function Structure

```javascript
// New P-first calculation function
function calculateStagePFirst(stageIndex, stagePRequired, stageNRequired, stageKRequired, 
                              pStatus, nStatus, kStatus, preferences, sStatus, phStatus, 
                              locationRec, cropData) {
    // 1. Select complex fertilizer for P (based on P status)
    // 2. Calculate N/K from complex fertilizer
    // 3. Calculate remaining N/K needs
    // 4. Check K threshold (35-40% rule)
    // 5. Top up N with Urea if needed
    // 6. Top up K with MOP if needed (and threshold allows)
    // 7. Round to bag sizes (P/N UP, K nearest)
    // 8. Return stage recommendation
}
```

---

## P Status Rules

### LOW P (< 10 kg/acre):
- Apply full crop requirement
- Use high-P fertilizers (SSP, 14-35-14, DAP)
- Prefer complex fertilizers

### MEDIUM P (10-24 kg/acre):
- Apply full crop requirement
- Use balanced fertilizers (28-28-0, 20-20-0-13)

### HIGH P (> 24 kg/acre):
- Apply reduced amount (crop removal only)
- Use P-free or low-P fertilizers
- Switch to P-free in later stages

---

## Implementation Order

1. ✅ New rounding functions
2. ✅ P status-based fertilizer selection
3. ✅ P-first stage calculation
4. ✅ Tolerance system
5. ✅ Update all 6 combinations
6. ✅ Testing











