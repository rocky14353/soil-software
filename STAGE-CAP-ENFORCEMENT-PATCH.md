# Stage Cap Enforcement Patch Report

## A) Exact Bug Locations Causing Basal->Tillering Quota Leakage

### Bug 1: Rebalancing Uses Global Remaining Instead of Original Stage Targets
**Location**: `calculateCombination1`, lines 1824-1832
**Problem**: 
- `adjustedStage2P = (pPerSplit[1] || 0) > 0 ? remainingPTotal : 0` uses ALL remaining P from global totals
- If Basal P allocation fails or is skipped, ALL remaining P gets dumped into Tillering
- `adjustedStage2N = remainingNTotal / remainingStages` distributes global N deficit across remaining stages

**Fix**: Use ORIGINAL stage targets (`nPerSplit[1]`, `pPerSplit[1]`, `kPerSplit[1]`) instead of adjusted/remaining values.

### Bug 2: Missing P Overflow Check in `isFertilizerAllowedInStage()`
**Location**: `script.js`, line 961-992
**Problem**: 
- Function only checks N and K overflow, but NOT P overflow
- Allows P to exceed stage targets without rejection

**Fix**: Added P overflow check with stage cap enforcement.

### Bug 3: Basal Stage Uses Direct `.push()` Bypassing Validation
**Location**: `calculateCombination1`, lines 1784-1809
**Problem**: 
- Basal N and K fertilizers use direct `.push()` instead of `safeAddFertilizer()`
- Bypasses stage cap validation

**Fix**: Replaced with `safeAddFertilizer()` calls.

### Bug 4: Stage 2 N Addition Doesn't Cap to Stage Limit
**Location**: `calculateCombination1`, lines 1952-1974
**Problem**: 
- N fertilizer addition doesn't check if it would exceed `topN` (Stage 2 N target)
- Can add unlimited N to Tillering

**Fix**: Added `maxAllowedN` calculation and cap `nToAdd` before conversion.

## B) Minimal Patch Diffs

### Patch 1: Fix `isFertilizerAllowedInStage()` - Add P Overflow Check
```javascript
// BEFORE: Missing P overflow check
const totalKAfter = (deliveredNutrients.k || 0) + fertK;
if (stageIndex !== 1 && totalKAfter > stageTargets.k * (1 + tolerance)) {
    return { allowed: false, reason: `K overflow...` };
}
return { allowed: true, reason: '' };

// AFTER: Added P overflow check
// CRITICAL: Check P overflow (was missing!)
const totalPAfter = (deliveredNutrients.p || 0) + fertP;
const stagePCap = (stageTargets.p || 0) * (1 + tolerance);
if (stageIndex !== 2 && totalPAfter > stagePCap) {
    return { allowed: false, reason: `P overflow: ${totalPAfter.toFixed(2)} > ${stagePCap.toFixed(2)} (stage target: ${(stageTargets.p || 0).toFixed(2)})` };
}
```

### Patch 2: Fix Rebalancing to Use Original Stage Targets
```javascript
// BEFORE: Uses adjusted/remaining values
const adjustedStage2N = remainingStages > 0 ? remainingNTotal / remainingStages : nPerSplit[1];
const adjustedStage2P = (pPerSplit[1] || 0) > 0 ? remainingPTotal : 0;
const topN = Math.max(0, adjustedStage2N);
const stage2P = Math.max(0, adjustedStage2P);

// AFTER: Uses original stage targets
const originalStage2N = nPerSplit[1] || 0;
const originalStage2P = pPerSplit[1] || 0;
const originalStage2K = kPerSplit[1] || 0;
const topN = originalStage2N;
const stage2P = originalStage2P;
const topK = originalStage2K;
```

### Patch 3: Fix Basal Stage to Use `safeAddFertilizer()`
```javascript
// BEFORE: Direct push
stage1.fertilizers.push({
    name: nFertilizer,
    kgs: rounded.kgs,
    ...rounded,
    nContributed: actualNutrients.n,
    ...
});

// AFTER: Use safeAddFertilizer
let stage1DeliveredN = 0;
let stage1DeliveredP = 0;
let stage1DeliveredK = 0;
stage1.fertilizers.forEach(fert => {
    stage1DeliveredN += fert.nContributed || 0;
    stage1DeliveredP += fert.pContributed || 0;
    stage1DeliveredK += fert.kContributed || 0;
});

const fertilizerObj = { ... };
const stageTargets = { n: basalN, p: basalP, k: basalK };
const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination1-basal-N');
```

### Patch 4: Cap Stage 2 N Addition to Stage Limit
```javascript
// BEFORE: No cap check
const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
const rounded = roundToBagUp(nKgs);
// ... add fertilizer

// AFTER: Cap to stage limit
let stage2DeliveredN = 0;
stage2.fertilizers.forEach(fert => {
    stage2DeliveredN += fert.nContributed || 0;
});

const maxAllowedN = topN - stage2DeliveredN;
const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);

if (nToAdd > 0) {
    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
    // ... add fertilizer
}
```

## C) Why the Patch Fixes the Issue

1. **Original Stage Targets**: By using `nPerSplit[1]`, `pPerSplit[1]`, `kPerSplit[1]` instead of `remainingNTotal / remainingStages`, each stage is solved against its ORIGINAL quota. This prevents Basal deficits from being dumped into Tillering.

2. **P Overflow Check**: Adding P overflow validation ensures that Tillering P cannot exceed its target (9.6 kg) even if global P deficit exists.

3. **Basal Validation**: Using `safeAddFertilizer()` for Basal ensures that Basal N/P/K allocations are validated against Basal targets, preventing silent failures.

4. **N Cap Enforcement**: Capping Stage 2 N addition to `topN - stage2DeliveredN` ensures Tillering N cannot exceed 16 kg (+ tolerance).

5. **Stage Priority**: Each stage is now solved independently against its original targets, preserving stage priority (Basal first, then Tillering, then Panicle).

## D) Updated Tests for Stage Cap Enforcement

### Test 1: Tillering N <= 16 (+ tolerance)
```javascript
function testTilleringNCap() {
    const result = calculateRecommendations(testPayload);
    const tillering = result.stageRecommendations.find(s => s.stage.includes('Tillering'));
    const tilleringN = tillering.fertilizers.reduce((sum, f) => sum + (f.nContributed || 0), 0);
    assert(tilleringN <= 16 * 1.12, `Tillering N ${tilleringN} exceeds cap ${16 * 1.12}`);
}
```

### Test 2: Tillering P <= 9.6 (+ tolerance)
```javascript
function testTilleringPCap() {
    const result = calculateRecommendations(testPayload);
    const tillering = result.stageRecommendations.find(s => s.stage.includes('Tillering'));
    const tilleringP = tillering.fertilizers.reduce((sum, f) => sum + (f.pContributed || 0), 0);
    assert(tilleringP <= 9.6 * 1.12, `Tillering P ${tilleringP} exceeds cap ${9.6 * 1.12}`);
}
```

### Test 3: Basal Should Not Be Skipped for P
```javascript
function testBasalPNotSkipped() {
    const result = calculateRecommendations(testPayload);
    const basal = result.stageRecommendations.find(s => s.stage.includes('Basal'));
    const basalP = basal.fertilizers.reduce((sum, f) => sum + (f.pContributed || 0), 0);
    assert(basalP > 0, `Basal P should not be 0 when target is 22.4 kg`);
    assert(basalP >= 22.4 * 0.88, `Basal P ${basalP} is below minimum ${22.4 * 0.88}`);
}
```

## E) Expected Regression Output After Patch

### Input: N=48, P=32, K=21

### Expected Output:
- **Basal**: N=16 (±12%), P=22.4 (±12%), K=10.5 (±12%)
- **Tillering**: N=16 (±12%), P=9.6 (±12%), K=0 (strict)
- **Panicle**: N=16 (±12%), P=0 (strict), K=10.5 (±12%)

### Key Validations:
1. ✅ Basal P > 0 (not skipped)
2. ✅ Tillering N <= 16 * 1.12 = 17.92
3. ✅ Tillering P <= 9.6 * 1.12 = 10.75
4. ✅ Tillering K = 0 (strict)
5. ✅ Panicle P = 0 (strict)
6. ✅ No nutrient quota leakage between stages






