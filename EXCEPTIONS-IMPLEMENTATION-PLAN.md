# Exceptions Implementation Plan

## ✅ Completed

1. **Condition 1**: N Classification (OC fallback) - ✅ Already implemented
2. **Condition 7**: Paddy K Split 50/50 - ✅ Already implemented
3. **Condition 8**: Paddy N Equal Splits - ✅ **JUST FIXED** - Changed to 33.33/33.33/33.33 for all paddy
4. **Condition 5**: Paddy P Split 70/30 - ✅ **JUST FIXED** - Changed from 60/40 to 70/30

## 🔄 In Progress

5. **Condition 4**: SSP Always at Basal
   - Need to remove SSP from stage 2 applications
   - Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2 instead

6. **Condition 6**: High P at Basal, Low P at 2nd Stage
   - Created `selectP2O5Fertilizer()` helper function
   - Need to integrate into all combination functions

## ❌ Still To Do

7. **Condition 3**: 100% P Basal = SSP Only
   - Check if P is 100% at basal
   - If yes, use SSP exclusively

8. **Condition 9**: Auto-Select SSP or High P for Basal
   - When no preference specified, auto-select SSP or high P fertilizer

9. **Condition 2**: P Calculated First
   - Verify P is always calculated before N and K adjustments

10. **Condition 10**: Hectare Conversion
    - Verify hectare input handling

## Implementation Strategy

### Priority 1: Fix SSP Usage (Conditions 3, 4)
- Remove SSP from all stage 2 applications
- Use SSP only at basal
- When P is 100% basal, use SSP exclusively

### Priority 2: Implement High P / Low P Logic (Condition 6)
- Use `selectP2O5Fertilizer()` in all combination functions
- High P (14-35-14) at basal
- Low P (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2

### Priority 3: Auto-Selection (Condition 9)
- Add logic to auto-select SSP or high P when no preference











