# Rebalancing Logic Applied to All 6 Combinations

## ✅ Status

- ✅ **Combination 1**: Fully implemented with N, P, K rebalancing
- ✅ **Combination 2**: Fully implemented with N, P, K rebalancing
- ⚠️ **Combination 3**: Needs implementation
- ⚠️ **Combination 4**: Needs implementation
- ⚠️ **Combination 5**: Needs implementation
- ⚠️ **Combination 6**: Needs implementation

## Implementation Pattern

For each combination, add:

1. **After Stage 1**: Calculate cumulative N, P, K
2. **Calculate Totals**: totalNRequired, totalPRequired, totalKRequired
3. **Stage 2**: Adjust targets based on Stage 1 actual delivery
4. **Update Cumulative**: After Stage 2
5. **Stage 3+**: Adjust targets based on cumulative delivery
6. **Final Rebalancing**: Add deficits to last stage if below minimum

## Code Pattern

```javascript
// After Stage 1
let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
stage1.fertilizers.forEach(fert => {
    cumulativeN += fert.nContributed || 0;
    cumulativeP += fert.pContributed || 0;
    cumulativeK += fert.kContributed || 0;
});

const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
const remainingStages = nPerSplit.length - 1;

// Stage 2 - Adjust targets
const adjustedStage2N = remainingStages > 0 ? remainingNTotal / remainingStages : nPerSplit[1];
const adjustedStage2P = remainingStages > 0 ? remainingPTotal / remainingStages : (pPerSplit[1] || 0);
const adjustedStage2K = remainingStages > 0 ? remainingKTotal / remainingStages : (kPerSplit[1] || 0);

// After Stage 2 - Update cumulative
stage2.fertilizers.forEach(fert => {
    cumulativeN += fert.nContributed || 0;
    cumulativeP += fert.pContributed || 0;
    cumulativeK += fert.kContributed || 0;
});

// Stage 3+ - Adjust targets
const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
const remainingStagesCount = nPerSplit.length - i;
const adjustedStageN = remainingStagesCount > 0 ? remainingNTotal / remainingStagesCount : nPerSplit[i];

// Final Rebalancing
const minRequiredN = totalNRequired * 0.88;
if (cumulativeN < minRequiredN) {
    // Add deficit to last stage
}
```











