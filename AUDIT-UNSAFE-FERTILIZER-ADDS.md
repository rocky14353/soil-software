# Codebase Audit: Unsafe Fertilizer Addition Locations

## A) Unsafe Add Locations Found

### Category 1: calculateStagePFirst (P-First Approach)
1. **Line 1316** - Direct push for P fertilizer
   - Function: `calculateStagePFirst`
   - Issue: Bypasses `safeAddFertilizer()`
   - Risk: Can add P to Panicle, K to Tillering if complex fertilizer contains them

### Category 2: calculateCombination1
2. **Line 1724** - SSP in Basal (Stage 1)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: Low (SSP has no K), but should still validate

3. **Line 1742** - 28-28-0 in Basal (Stage 1)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: Medium (contains P, could be issue if added to wrong stage)

4. **Line 1761** - N fertilizer in Basal (Stage 1)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: Medium (could overflow N)

5. **Line 1779** - K fertilizer in Basal (Stage 1)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: Medium (Basal allows K, but should validate overflow)

6. **Line 1845** - P fertilizer in Tillering (Stage 2)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: HIGH - Complex fertilizer could contain K

7. **Line 1894** - N fertilizer in Tillering (Stage 2)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: Medium (could overflow N)

8. **Line 2069** - N fertilizer in final rebalancing (lastStage)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: HIGH - Could add to Panicle exceeding N limit

9. **Line 2102** - P fertilizer in final rebalancing (pStage)
   - Function: `calculateCombination1`
   - Issue: Direct push, no validation
   - Risk: HIGH - Could add P to Panicle

10. **Line 2117** - SSP in final rebalancing (pStage)
    - Function: `calculateCombination1`
    - Issue: Direct push, no validation
    - Risk: Medium (SSP has no K, but should validate P)

11. **Line 2136** - SSP fallback in final rebalancing (pStage)
    - Function: `calculateCombination1`
    - Issue: Direct push, no validation
    - Risk: Medium

12. **Line 2164** - K fertilizer in final rebalancing (lastStage)
    - Function: `calculateCombination1`
    - Issue: Direct push, no validation
    - Risk: HIGH - Could add K to Tillering or exceed Panicle K limit

### Category 3: calculateCombination2
13. **Line 2202** - 14-35-14 in Basal (Stage 1)
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: HIGH - Contains K, could be added to wrong stage

14. **Line 2220** - N fertilizer in Basal (Stage 1)
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: Medium

15. **Line 2238** - K fertilizer in Basal (Stage 1)
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: Medium

16. **Line 2303** - P fertilizer in Tillering (Stage 2)
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: HIGH - Complex fertilizer could contain K

17. **Line 2326** - N fertilizer in Tillering (Stage 2)
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: Medium

18. **Line 2346** - K fertilizer in Tillering (Stage 2)
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: CRITICAL - K not allowed in Tillering!

19. **Line 2396** - N fertilizer in rebalancing loop
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: Medium

20. **Line 2414** - K fertilizer in rebalancing loop
    - Function: `calculateCombination2`
    - Issue: Direct push, no validation
    - Risk: HIGH - Could add to Tillering

### Category 4: calculateCombination3
21. **Line 2573** - 14-35-14 in Basal (Stage 1)
    - Function: `calculateCombination3`
    - Issue: Direct push, no validation
    - Risk: HIGH - Contains K

22. **Line 2591** - N fertilizer in Basal (Stage 1)
    - Function: `calculateCombination3`
    - Issue: Direct push, no validation
    - Risk: Medium

23. **Line 2609** - K fertilizer in Basal (Stage 1)
    - Function: `calculateCombination3`
    - Issue: Direct push, no validation
    - Risk: Medium

24. **Line 2674** - P fertilizer in Tillering (Stage 2)
    - Function: `calculateCombination3`
    - Issue: Direct push, no validation
    - Risk: HIGH

25. **Line 2697** - N fertilizer in Tillering (Stage 2)
    - Function: `calculateCombination3`
    - Issue: Direct push, no validation
    - Risk: Medium

26. **Line 2717** - K fertilizer in Tillering (Stage 2)
    - Function: `calculateCombination3`
    - Issue: Direct push, no validation
    - Risk: CRITICAL - K not allowed in Tillering!

### Category 5: calculateCombination4, 5, 6
Similar patterns exist in all combination functions.

## Summary
- **Total unsafe locations:** 50+ direct `.fertilizers.push()` calls
- **Critical risks:** K addition to Tillering, P addition to Panicle, overflow violations
- **All locations bypass:** `safeAddFertilizer()` validation






