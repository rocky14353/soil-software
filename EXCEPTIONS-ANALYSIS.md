# Soil Testing Software - Exceptions Analysis

## Condition-by-Condition Analysis

### ✅ Condition 1: N Classification (OC fallback)
**Requirement:** When Nitrogen data is not filled in, then Organic Carbon (OC) value has to be taken for calculating N is low or medium or high.

**Status:** ✅ **IMPLEMENTED**
- Function `classifyNitrogenByOC()` already has fallback logic
- Uses OC if N is not provided or invalid

---

### ⚠️ Condition 2: P Calculated First
**Requirement:** Once the recommended dose of N,P and K is arrived based on soil test data, for the stage wise fertiliser dose calculation - First P has to be arrived because some complex fertilisers like 14-35-14, 28-28-0 and 20-20-0-13 contains N and K and Sulphur also along with P.

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- Currently P is calculated first in combination functions
- But need to verify it's always done before N and K adjustments

---

### ❌ Condition 3: 100% P Basal = SSP Only
**Requirement:** If you want to recommend 100% P as basal, then you have to consider 1st only exclusive P fertiliser like SSP (Single Super Phosphate).

**Status:** ❌ **NOT IMPLEMENTED**
- Current logic doesn't check if P is 100% basal
- Doesn't automatically use SSP for 100% basal P

---

### ❌ Condition 4: SSP Always at Basal
**Requirement:** If you are selecting SSP as one of the two P fertilisers (SSP and 14-35-14 and SSP and 28-28-0 or 20-20-0-13) for basal and 2nd dose- Then you should recommend SSP as 1st basal only. Because it contains only P and it may be available in Powder form, so application in 2nd dose practically difficult, since crop will be 30 days old.

**Status:** ❌ **NOT IMPLEMENTED**
- SSP is currently used at stage 2 (tillering) for paddy
- Should be moved to basal only when SSP is selected

---

### ⚠️ Condition 5: Paddy P Split 70/30 or 60/40
**Requirement:** When you are selecting 2 P containing fertilisers for crops like Paddy, better to divide total P recommendation into 70% basal and 30% as 2nd dose. Otherwise 60% and 40% is also OK. Because P is mostly needed for roots and at early crop stage.

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- Currently using 60/40 split for paddy
- Should change to 70/30 for better root development

---

### ❌ Condition 6: High P at Basal, Low P at 2nd Stage
**Requirement:** If you are recommending 2 P containing fertilisers in 2 stages, always choose high P containing fertiliser as basal stage( like DAP 18-46-0, 14-35-14) and low P containing fertilisers for 2nd stage (20-20-0-13, 16-20-0-13 and 28-28-0 or 24-24-0)

**Status:** ❌ **NOT IMPLEMENTED**
- Current logic doesn't prioritize high P fertilizers at basal
- Need to add logic to select high P (14-35-14) at basal, low P (20-20-0-13, 16-20-0-13, 28-28-0) at 2nd stage

---

### ✅ Condition 7: Paddy K Split 50/50
**Requirement:** Coming to the K recommendation- For Paddy 50% as basal and 50% as 3rd stage I:e panicle initiation stage.

**Status:** ✅ **IMPLEMENTED**
- Paddy K split is already 50% basal, 50% panicle

---

### ❌ Condition 8: Paddy N Equal Splits (33.33% each)
**Requirement:** For Paddy irrespective of season Kharif or Rabi Nitrogen in 3 equal splits. I may wary + or – 10%, based on the N containing P fertiliser.

**Status:** ❌ **NOT IMPLEMENTED**
- Currently using 25/50/25 split for paddy
- Should be 33.33/33.33/33.33 (equal splits)

---

### ❌ Condition 9: Auto-Select SSP or High P for Basal
**Requirement:** If farmer do not ask for choice of fertiliser, then Basal dose should be exclusive P fertiliser like SSP or high P containing complex fertiliser like DAP (18-46-0) or 14-35-14 etc should be taken automatically.

**Status:** ❌ **NOT IMPLEMENTED**
- Auto-selection doesn't prioritize SSP or high P fertilizers
- Need to add logic for automatic basal selection

---

### ⚠️ Condition 10: Unit Conversion (Hectare to Acre)
**Requirement:** Usually in India all recommendations are given per acre basis. In abroad may be hectares. One hectare is equal to 2.471 acres. This is the conversion factor for all masters of N,P,K low , medium and high values and fertiliser recommendations. If hectare is selected in place of acre, recommendation should be calculated 2.471 times.

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- Conversion factor 2.471 is in the code
- But need to verify if hectare input is properly handled

---

## Summary

| Condition | Status | Priority |
|-----------|--------|----------|
| 1. N Classification (OC fallback) | ✅ Done | - |
| 2. P Calculated First | ⚠️ Partial | Medium |
| 3. 100% P Basal = SSP | ❌ Missing | High |
| 4. SSP Always at Basal | ❌ Missing | High |
| 5. Paddy P Split 70/30 | ⚠️ Partial | Medium |
| 6. High P at Basal, Low P at 2nd | ❌ Missing | High |
| 7. Paddy K Split 50/50 | ✅ Done | - |
| 8. Paddy N Equal Splits | ❌ Missing | High |
| 9. Auto-Select SSP/High P | ❌ Missing | Medium |
| 10. Hectare Conversion | ⚠️ Partial | Low |

**Total:** 2 ✅ Done, 4 ⚠️ Partial, 4 ❌ Missing











