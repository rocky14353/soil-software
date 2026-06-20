# Potassium Excess Fix - Combination 6

## Problem:
- **Required K**: 16 kg/acre
- **Delivered K**: 27.9 kg/acre  
- **Excess**: 11.9 kg (74.5%) ❌

## Root Cause:
1. **`roundToBagUp()` function** always rounds UP to nearest bag
2. When remaining K is small (e.g., 0.125 kg), it calculates MOP needed
3. Then rounds UP to 11.25 kg (0.25 bag) → delivers 6.75 kg K instead of 0.125 kg!
4. This happens at multiple stages, causing massive excess

## Example Calculation:
- **Stage 1 (Basal)**: Required 8 kg K
  - 14-35-14 provides: 56.25 kg × 14% = 7.875 kg K
  - Remaining: 8 - 7.875 = **0.125 kg**
  - MOP needed: 0.125 ÷ 0.60 = 0.208 kg
  - **Rounded UP**: 11.25 kg (0.25 bag) → **6.75 kg K** ❌
  - Total: 7.875 + 6.75 = **14.625 kg** (should be 8 kg!)

- **Stage 3 (Panicle)**: Required 8 kg K
  - MOP needed: 8 ÷ 0.60 = 13.33 kg
  - **Rounded UP**: 22.5 kg (0.5 bag) → **13.5 kg K** ❌
  - Total delivered: 14.625 + 13.5 = **28.125 kg** (should be 16 kg!)

## Solution Applied:

### 1. Changed `roundToBagUp` to `roundToBag` for Potassium
- **Before**: Always rounds UP (causes excess)
- **After**: Rounds to nearest (minimizes excess)

### 2. Added Threshold Check
- **Before**: Adds MOP if `remainingK > 0`
- **After**: Only adds MOP if `remainingK > 0.5 kg`
- Prevents adding MOP for tiny remaining amounts

### 3. Changes Made in Combination 6:
- **Stage 1 (Basal)**: `if (remainingK > 0.5)` + `roundToBag()`
- **Stage 2 (Tillering)**: `if (topK > 0.5)` + `roundToBag()`
- **Stage 3 (Panicle)**: `if (stageK > 0.5)` + `roundToBag()`

## Expected Result:
- **Required K**: 16 kg/acre
- **Expected Delivered**: ~16-18 kg/acre (within 10% tolerance)
- **Excess**: < 10% ✅

## Code Changes:
```javascript
// Before:
if (remainingK > 0) {
    const rounded = roundToBagUp(kKgs); // Always rounds UP
}

// After:
if (remainingK > 0.5) { // Threshold check
    const rounded = roundToBag(kKgs); // Rounds to nearest
}
```

## Files Modified:
- ✅ `script.js` - Combination 6 function (`calculateCombination6`)












