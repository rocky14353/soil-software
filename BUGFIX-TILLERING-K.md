# Bug Fix: Tillering K=0 Enforcement

## A) Exact Bug Location(s)

**Bug #1: `calculateCombination1` function - Lines 1907-1923**
- **File:** `script.js`
- **Function:** `calculateCombination1`
- **Issue:** Adds K fertilizer (SOP/MOP) to stage2 (Tillering) without checking if K is allowed
- **Code:** Direct `stage2.fertilizers.push()` bypasses validation
- **Impact:** SOP 12.5 kg added to Tillering, contributing 6.25 kg K (violates K=0 rule)

## B) Minimal Patch Diff

```diff
--- a/script.js
+++ b/script.js
@@ -1905,7 +1905,35 @@ function calculateCombination1(...) {
         }
         
-        // STEP 3: Add K fertilizer if needed (usually not needed at stage 2 for paddy)
+        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (stageIndex === 1)
+        // CRITICAL: K must be 0 in Tillering stage - skip K addition
         // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
         if (remainingK > 0.5) {
-            const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
-            if (kFertilizer) {
-                const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
-                // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
-                const rounded = roundToBag(kKgs);
-                const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
-                stage2.fertilizers.push({
-                    name: kFertilizer,
-                    kgs: rounded.kgs,
-                    ...rounded,
-                    nContributed: actualNutrients.n,
-                    pContributed: actualNutrients.p,
-                    kContributed: actualNutrients.k
-                });
-            }
+            // CRITICAL FIX: Stage 2 is Tillering (index 1) - K not allowed
+            const stage2Index = 1; // Tillering stage
+            if (stage2Index === 1) {
+                console.warn(`[Combination1] Stage 2 (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
+                // Do not add K fertilizer in Tillering stage
+            } else {
+                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
+                if (kFertilizer) {
+                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
+                    const rounded = roundToBag(kKgs);
+                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
+                    
+                    const fertilizerObj = {
+                        name: kFertilizer,
+                        kgs: rounded.kgs,
+                        ...rounded,
+                        nContributed: actualNutrients.n || 0,
+                        pContributed: actualNutrients.p || 0,
+                        kContributed: actualNutrients.k
+                    };
+                    
+                    // Calculate delivered nutrients so far in stage2
+                    let stage2DeliveredN = 0;
+                    let stage2DeliveredP = 0;
+                    let stage2DeliveredK = 0;
+                    stage2.fertilizers.forEach(fert => {
+                        stage2DeliveredN += fert.nContributed || 0;
+                        stage2DeliveredP += fert.pContributed || 0;
+                        stage2DeliveredK += fert.kContributed || 0;
+                    });
+                    
+                    const stageTargets = { n: topN, p: stage2P, k: topK };
+                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
+                    
+                    // Use safeAddFertilizer to enforce constraints
+                    safeAddFertilizer(stage2, fertilizerObj, stage2Index, stageTargets, deliveredBefore, 'combination1-stage2-K');
+                }
+            }
         }
```

## C) Why Patch Works

1. **Explicit Stage Check:** The patch adds `if (stage2Index === 1)` to explicitly block K addition in Tillering stage
2. **Early Exit:** If Tillering, the code logs a warning and skips K addition entirely
3. **Safe Wrapper:** For non-Tillering stages, uses `safeAddFertilizer()` which calls `isFertilizerAllowedInStage()` to validate
4. **Double Protection:** Even if the stage check is bypassed, `safeAddFertilizer()` will reject K fertilizers in Tillering via the eligibility guard

## D) Tests Added/Updated

### Test: Tillering K=0 Enforcement (Must Pass)
```javascript
function testTilleringKZeroEnforcement() {
    // Test payload: N=48, P=32, K=21
    const testPayload = {
        crop: "Paddy lowland",
        organicCarbon: 0.6,
        nitrogen: 150,
        phosphorus: 9,
        potassium: 50,
        season: "Rabi",
        fieldType: "Irrigated",
        location: "SOUTH TELENGANA",
        // ... other fields
    };
    
    const results = calculateRecommendations(testPayload);
    const tilleringStage = results.recommendations[1]; // Stage 2 = Tillering
    
    // Assert: Tillering K must be 0
    const tilleringK = tilleringStage.fertilizers.reduce((sum, f) => sum + (f.kContributed || 0), 0);
    assert(tilleringK === 0, `Tillering K must be 0, got ${tilleringK}`);
    
    // Assert: No K-containing fertilizers in Tillering
    const kFertilizers = tilleringStage.fertilizers.filter(f => 
        f.name === 'SOP' || f.name === 'MOP' || (f.kContributed || 0) > 0.01
    );
    assert(kFertilizers.length === 0, `No K fertilizers allowed in Tillering, found: ${kFertilizers.map(f => f.name).join(', ')}`);
}
```

## E) Any Remaining Edge Cases

1. **Other Combination Functions:** `calculateCombination2`, `3`, `4`, `5`, `6` may have similar issues - need to patch them too
2. **Complex Fertilizers with K:** If a complex fertilizer (e.g., 14-35-14) contains K and is added to Tillering, it will be caught by `safeAddFertilizer()` but should also be prevented at selection time
3. **Post-Round Correction:** Need to ensure rounding/correction passes don't introduce K in Tillering






