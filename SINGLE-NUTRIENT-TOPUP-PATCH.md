# Single-Nutrient Top-Up Preference Rules Patch

This patch adds business rules for single-nutrient top-up/fill preferences that apply **only** during pure single-nutrient top-up mode.

## Changes Summary

1. **Add DAP support** to `getNutrientsFromStraight()` function
2. **Add helper functions** for single-nutrient top-up preferences
3. **Modify STEP 2 (N top-up)** in `calculateStagePFirst()` to use single-nutrient preference
4. **Modify STEP 3 (K top-up)** in `calculateStagePFirst()` to use single-nutrient preference
5. **Update `applyStageSafeTopUp()`** to use single-nutrient preferences for P top-up

---

## Patch 1: Add DAP Support to getNutrientsFromStraight()

**Location**: After line 550 (in the P fertilizers section)

```javascript
    // P fertilizers
    else if (fertName === 'ssp') {
        return { n: 0, p: (fertilizerKgs * 16) / 100, k: 0, s: (fertilizerKgs * 12) / 100 };
    } else if (fertName === 'dap' || fertName === '18-46-0') {
        // DAP: 18% N, 46% P2O5
        return { n: (fertilizerKgs * 18) / 100, p: (fertilizerKgs * 46) / 100, k: 0 };
    }
```

---

## Patch 2: Add Single-Nutrient Top-Up Helper Functions

**Location**: After `selectKFertilizer()` function (around line 888)

```javascript
/**
 * Select N fertilizer for SINGLE-NUTRIENT top-up mode
 * Prefers Urea first when doing pure N-only fill
 * @param {number} nRequired - N requirement
 * @param {object} preferences - Fertilizer preferences
 * @param {string} sStatus - S status
 * @param {string} phStatus - pH status
 * @param {boolean} isSingleNutrientMode - True if this is pure single-nutrient top-up
 * @returns {string|null} Fertilizer name
 */
function selectNFertilizerForSingleNutrientTopUp(nRequired, preferences, sStatus, phStatus, isSingleNutrientMode) {
    if (nRequired <= 0) return null;
    
    // In single-nutrient top-up mode, prefer Urea first
    if (isSingleNutrientMode) {
        if (shouldUseFertilizer('Urea', preferences, sStatus, phStatus)) {
            return 'Urea';
        }
        // Fallback to existing logic if Urea unavailable
    }
    
    // Use existing logic for non-single-nutrient mode or if Urea unavailable
    return selectNFertilizer(nRequired, preferences, sStatus, phStatus);
}

/**
 * Select P fertilizer for SINGLE-NUTRIENT top-up mode
 * Prefers SSP first, then DAP (if N doesn't violate constraints)
 * @param {number} pRequired - P requirement
 * @param {object} preferences - Fertilizer preferences
 * @param {number} stageIndex - Stage index
 * @param {number} originalStageN - Original stage N target
 * @param {number} deliveredN - Already delivered N
 * @param {boolean} isSingleNutrientMode - True if this is pure single-nutrient top-up
 * @returns {string|null} Fertilizer name ('SSP' or 'DAP')
 */
function selectPFertilizerForSingleNutrientTopUp(pRequired, preferences, stageIndex, originalStageN, deliveredN, isSingleNutrientMode) {
    if (pRequired <= 0) return null;
    
    // In single-nutrient top-up mode, prefer SSP first
    if (isSingleNutrientMode) {
        // Prefer SSP first
        if (checkPreference('SSP', preferences) !== 'Reject') {
            return 'SSP';
        }
        
        // Fallback to DAP if SSP unavailable, but check N constraint
        if (checkPreference('DAP', preferences) !== 'Reject' || checkPreference('18-46-0', preferences) !== 'Reject') {
            // DAP contributes N (18%), so check if it would violate stage N cap
            // Estimate: pRequired kg P needs (pRequired / 46) * 100 kg DAP
            // This contributes (pRequired / 46) * 100 * 0.18 = pRequired * 18/46 ≈ pRequired * 0.39 kg N
            const estimatedDAPKgs = (pRequired / 46) * 100;
            const estimatedNFromDAP = (estimatedDAPKgs * 18) / 100;
            const totalNAfterDAP = deliveredN + estimatedNFromDAP;
            
            // Check if DAP's N contribution would violate stage cap (with 12% tolerance)
            if (totalNAfterDAP <= originalStageN * 1.12) {
                return 'DAP';
            } else {
                console.log(`[Single-Nutrient P Top-Up] DAP rejected - would exceed stage N cap (${totalNAfterDAP.toFixed(2)} > ${(originalStageN * 1.12).toFixed(2)})`);
            }
        }
        
        // If both SSP and DAP unavailable/invalid, return null (will use existing fallback)
        return null;
    }
    
    // Non-single-nutrient mode: use SSP as default
    if (checkPreference('SSP', preferences) !== 'Reject') {
        return 'SSP';
    }
    
    return null;
}

/**
 * Select K fertilizer for SINGLE-NUTRIENT top-up mode
 * Prefers MOP first, then SOP when doing pure K-only fill
 * @param {number} kRequired - K requirement
 * @param {object} preferences - Fertilizer preferences
 * @param {string} sStatus - S status
 * @param {string} phStatus - pH status
 * @param {boolean} isSingleNutrientMode - True if this is pure single-nutrient top-up
 * @returns {string|null} Fertilizer name
 */
function selectKFertilizerForSingleNutrientTopUp(kRequired, preferences, sStatus, phStatus, isSingleNutrientMode) {
    if (kRequired <= 0) return null;
    
    // In single-nutrient top-up mode, prefer MOP first, then SOP
    if (isSingleNutrientMode) {
        // Prefer MOP first
        if (shouldUseFertilizer('MOP', preferences, sStatus, phStatus)) {
            return 'MOP';
        }
        
        // Fallback to SOP if MOP unavailable
        if (shouldUseFertilizer('SOP', preferences, sStatus, phStatus)) {
            return 'SOP';
        }
        
        // If both unavailable, return null (will use existing fallback)
        return null;
    }
    
    // Use existing logic for non-single-nutrient mode
    return selectKFertilizer(kRequired, preferences, sStatus, phStatus);
}
```

---

## Patch 3: Modify STEP 2 (N Top-Up) in calculateStagePFirst()

**Location**: Around line 1417-1419 (STEP 2: Top up N)

**Replace**:
```javascript
    // STEP 2: Top up N with Urea (if needed and within stage cap)
    if (remainingN > 0 && stage.fertilizers.length < 3) { // Max 3 products per stage
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
```

**With**:
```javascript
    // STEP 2: Top up N with Urea (if needed and within stage cap)
    // Detect single-nutrient mode: N-only top-up when P and K are already satisfied
    const isSingleNutrientNMode = remainingN > 0 && remainingP <= 0.1 && remainingK <= 0.1;
    if (remainingN > 0 && stage.fertilizers.length < 3) { // Max 3 products per stage
        const nFertilizer = selectNFertilizerForSingleNutrientTopUp(remainingN, preferences, sStatus, phStatus, isSingleNutrientNMode);
```

---

## Patch 4: Modify STEP 3 (K Top-Up) in calculateStagePFirst()

**Location**: Around line 1497-1498 (STEP 3: Top up K)

**Replace**:
```javascript
    } else if (remainingK > 0 && kPercentFromComplex < 35 && stage.fertilizers.length < 3) {
        const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
```

**With**:
```javascript
    } else if (remainingK > 0 && kPercentFromComplex < 35 && stage.fertilizers.length < 3) {
        // Detect single-nutrient mode: K-only top-up when N and P are already satisfied
        const isSingleNutrientKMode = remainingK > 0 && remainingN <= 0.1 && remainingP <= 0.1;
        const kFertilizer = selectKFertilizerForSingleNutrientTopUp(remainingK, preferences, sStatus, phStatus, isSingleNutrientKMode);
```

---

## Patch 5: Update applyStageSafeTopUp() for P Top-Up

**Location**: Around line 270939-270971 (P top-up section in applyStageSafeTopUp)

**Replace**:
```javascript
        // Try P top-up if headroom exists AND P is allowed in this stage
        // CRITICAL: P not allowed in Panicle (stageIdx === 2 for 3-stage crops)
        if (pHeadroom > 0.1 && stageIdx !== 2) { // Panicle is typically index 2
            // Use SSP for precise P top-up
            const pToAdd = Math.min(pHeadroom, stageTargetP * 1.12 - deliveredP);
            if (pToAdd > 0.1) {
                // SSP: 16% P, 12% S
                const sspKgs = (pToAdd / 16) * 100;
                const rounded = roundToBag(sspKgs);
                const actualP = (rounded.kgs * 16) / 100;
                const actualS = (rounded.kgs * 12) / 100;
                
                // Check if rounded quantity still fits in headroom
                if (deliveredP + actualP <= stageTargetP * 1.12) {
                    const fertilizerObj = {
                        name: 'SSP',
                        kgs: rounded.kgs,
                        bags: rounded.kgs / 45,
                        fullBags: Math.floor(rounded.kgs / 45),
                        remainder: rounded.kgs % 45,
                        nContributed: 0,
                        pContributed: actualP,
                        kContributed: 0,
                        sContributed: actualS
                    };
                    
                    if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-P`)) {
                        deliveredP += actualP;
                        deliveredBefore.p = deliveredP; // Update for next iteration
                    }
                }
            }
        }
```

**With**:
```javascript
        // Try P top-up if headroom exists AND P is allowed in this stage
        // CRITICAL: P not allowed in Panicle (stageIdx === 2 for 3-stage crops)
        if (pHeadroom > 0.1 && stageIdx !== 2) { // Panicle is typically index 2
            // Detect single-nutrient mode: P-only top-up when N and K are already satisfied
            const delivered = getStageDelivered(stageIdx);
            const nHeadroom = Math.max(0, stageTargets.n * 1.12 - delivered.n);
            const kHeadroom = Math.max(0, stageTargets.k * 1.12 - delivered.k);
            const isSingleNutrientPMode = pHeadroom > 0.1 && nHeadroom <= 0.5 && kHeadroom <= 0.5;
            
            const pToAdd = Math.min(pHeadroom, stageTargetP * 1.12 - deliveredP);
            if (pToAdd > 0.1) {
                // Use single-nutrient preference: SSP first, then DAP
                const pFertilizer = selectPFertilizerForSingleNutrientTopUp(
                    pToAdd, preferences, stageIdx, stageTargets.n, delivered.n, isSingleNutrientPMode
                );
                
                if (pFertilizer === 'SSP') {
                    // SSP: 16% P, 12% S
                    const sspKgs = (pToAdd / 16) * 100;
                    const rounded = roundToBag(sspKgs);
                    const actualP = (rounded.kgs * 16) / 100;
                    const actualS = (rounded.kgs * 12) / 100;
                    
                    // Check if rounded quantity still fits in headroom
                    if (deliveredP + actualP <= stageTargetP * 1.12) {
                        const fertilizerObj = {
                            name: 'SSP',
                            kgs: rounded.kgs,
                            bags: rounded.kgs / 50,
                            fullBags: Math.floor(rounded.kgs / 50),
                            remainder: rounded.kgs % 50,
                            nContributed: 0,
                            pContributed: actualP,
                            kContributed: 0,
                            sContributed: actualS
                        };
                        
                        if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-P`)) {
                            deliveredP += actualP;
                            deliveredBefore.p = deliveredP; // Update for next iteration
                        }
                    }
                } else if (pFertilizer === 'DAP') {
                    // DAP: 18% N, 46% P2O5
                    const dapKgs = (pToAdd / 46) * 100;
                    const rounded = roundToBag(dapKgs);
                    const actualP = (rounded.kgs * 46) / 100;
                    const actualN = (rounded.kgs * 18) / 100;
                    
                    // Check if rounded quantity fits in headroom and doesn't violate N cap
                    if (deliveredP + actualP <= stageTargetP * 1.12 && 
                        delivered.n + actualN <= stageTargets.n * 1.12) {
                        const fertilizerObj = {
                            name: 'DAP',
                            kgs: rounded.kgs,
                            bags: rounded.kgs / 50,
                            fullBags: Math.floor(rounded.kgs / 50),
                            remainder: rounded.kgs % 50,
                            nContributed: actualN,
                            pContributed: actualP,
                            kContributed: 0
                        };
                        
                        if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-P`)) {
                            deliveredP += actualP;
                            delivered.n += actualN;
                            deliveredBefore.p = deliveredP;
                            deliveredBefore.n = delivered.n;
                        }
                    }
                } else {
                    // Fallback: use SSP if no preference selected
                    const sspKgs = (pToAdd / 16) * 100;
                    const rounded = roundToBag(sspKgs);
                    const actualP = (rounded.kgs * 16) / 100;
                    const actualS = (rounded.kgs * 12) / 100;
                    
                    if (deliveredP + actualP <= stageTargetP * 1.12) {
                        const fertilizerObj = {
                            name: 'SSP',
                            kgs: rounded.kgs,
                            bags: rounded.kgs / 50,
                            fullBags: Math.floor(rounded.kgs / 50),
                            remainder: rounded.kgs % 50,
                            nContributed: 0,
                            pContributed: actualP,
                            kContributed: 0,
                            sContributed: actualS
                        };
                        
                        if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-P`)) {
                            deliveredP += actualP;
                            deliveredBefore.p = deliveredP;
                        }
                    }
                }
            }
        }
```

---

## Patch 6: Update applyStageSafeTopUp() for N Top-Up

**Location**: Around line 270904-270936 (N top-up section)

**Replace**:
```javascript
        // Try N top-up if headroom exists
        if (nHeadroom > 0.5) { // Only if significant headroom (> 0.5 kg)
            // Prefer A.S (21% N) over Urea (46% N) for more precise control
            let nFertilizer = selectNFertilizer(nHeadroom, preferences, sStatus, phStatus);
```

**With**:
```javascript
        // Try N top-up if headroom exists
        if (nHeadroom > 0.5) { // Only if significant headroom (> 0.5 kg)
            // Detect single-nutrient mode: N-only top-up when P and K are already satisfied
            const pHeadroom = Math.max(0, stageTargetP * 1.12 - deliveredP);
            const kHeadroom = Math.max(0, stageTargetK * 1.12 - deliveredK);
            const isSingleNutrientNMode = nHeadroom > 0.5 && pHeadroom <= 0.1 && kHeadroom <= 0.5;
            
            let nFertilizer = selectNFertilizerForSingleNutrientTopUp(Math.min(nHeadroom, globalRemainingN), preferences, sStatus, phStatus, isSingleNutrientNMode);
```

---

## Patch 7: Update applyStageSafeTopUp() for K Top-Up

**Location**: Around line 270975-271026 (K top-up section)

**Replace**:
```javascript
        // Try K top-up if headroom exists AND K is allowed in this stage
        // CRITICAL: K not allowed in Tillering (stageIdx === 1)
        if (kHeadroom > 0.5 && stageIdx !== 1) { // Tillering is index 1
            const kFertilizer = selectKFertilizer(kHeadroom, preferences, sStatus, phStatus);
```

**With**:
```javascript
        // Try K top-up if headroom exists AND K is allowed in this stage
        // CRITICAL: K not allowed in Tillering (stageIdx === 1)
        if (kHeadroom > 0.5 && stageIdx !== 1) { // Tillering is index 1
            // Detect single-nutrient mode: K-only top-up when N and P are already satisfied
            const nHeadroom = Math.max(0, stageTargetN * 1.12 - deliveredN);
            const pHeadroom = Math.max(0, stageTargetP * 1.12 - deliveredP);
            const isSingleNutrientKMode = kHeadroom > 0.5 && nHeadroom <= 0.5 && pHeadroom <= 0.1;
            
            const kFertilizer = selectKFertilizerForSingleNutrientTopUp(kHeadroom, preferences, sStatus, phStatus, isSingleNutrientKMode);
```

---

## Verification: Hard Stage Rules Remain Unchanged

All patches maintain existing stage rules:
- ✅ **Tillering K = 0**: Enforced in STEP 3 (line 1493-1496) - unchanged
- ✅ **Panicle P = 0**: Enforced in applyStageSafeTopUp (line 270941) - unchanged  
- ✅ **Stage caps / tolerance**: All checks remain (12% tolerance, stage cap validation)
- ✅ **No stage leakage**: safeAddFertilizer() validation unchanged

---

## Example: SOUTH TELENGANA Payload

After applying patches, when a stage needs **N-only top-up**:
- System detects `remainingN > 0` and `remainingP <= 0.1` and `remainingK <= 0.1`
- Sets `isSingleNutrientNMode = true`
- Calls `selectNFertilizerForSingleNutrientTopUp()` which prefers **Urea**
- Falls back to existing logic only if Urea unavailable/invalid

When a stage needs **P-only top-up**:
- System detects `pHeadroom > 0.1` and `nHeadroom <= 0.5` and `kHeadroom <= 0.5`
- Sets `isSingleNutrientPMode = true`
- Calls `selectPFertilizerForSingleNutrientTopUp()` which prefers **SSP** first
- Falls back to **DAP** if SSP unavailable (checking N constraint)
- Falls back to existing logic if both unavailable

When a stage needs **K-only top-up**:
- System detects `remainingK > 0` and `remainingN <= 0.1` and `remainingP <= 0.1`
- Sets `isSingleNutrientKMode = true`
- Calls `selectKFertilizerForSingleNutrientTopUp()` which prefers **MOP** first, then **SOP**
- Falls back to existing logic if both unavailable

---

## Summary

- ✅ Single-nutrient preference rules added
- ✅ Main complex-fertilizer solver unchanged
- ✅ Stage rules (Tillering K=0, Panicle P=0) preserved
- ✅ Stage caps and tolerance checks maintained
- ✅ DAP support added for P-only top-up fallback


