# Rebalancing Logic - Complete Status Report

## ✅ Current Status (After Fixes)

| Combination | Cumulative Init | Stage 2 Adjust | Stage 3+ Adjust | Final Rebalancing | Status |
|-------------|----------------|----------------|-----------------|-------------------|--------|
| **Combination 1** | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETE** |
| **Combination 2** | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETE** |
| **Combination 3** | ✅ **FIXED** | ✅ | ✅ | ✅ | ✅ **COMPLETE** |
| **Combination 4** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing | ❌ **MISSING** |
| **Combination 5** | ❌ Missing* | ❌ Missing* | ❌ Missing* | ✅ Exists | ⚠️ **PARTIAL** |
| **Combination 6** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing | ❌ **MISSING** |

*Note: Combination 5 has final rebalancing code but references uninitialized variables.

## 📋 What Each Combination Needs

### ✅ Combination 1 (28-28-0 + 20-20-0)
- **Status**: ✅ Complete
- **Lines**: 794-1050

### ✅ Combination 2 (14-35-14 + 20-20-0)
- **Status**: ✅ Complete
- **Lines**: 1122-1377

### ✅ Combination 3 (14-35-14 + 28-28-0)
- **Status**: ✅ **JUST FIXED** - Added cumulative initialization
- **Lines**: 1447-1683

### ❌ Combination 4 (28-28-0 + 10-26-26)
- **Status**: ❌ Needs full rebalancing
- **Missing**: All rebalancing logic
- **Lines**: 1686-1778

### ⚠️ Combination 5 (28-28-0 + 16-20-0)
- **Status**: ⚠️ Has final rebalancing but missing initialization
- **Missing**: Cumulative initialization after Stage 1, Stage 2 adjustment, Stage 3+ adjustment
- **Lines**: 1781-2067

### ❌ Combination 6 (14-35-14 + 16-20-0)
- **Status**: ❌ Needs full rebalancing
- **Missing**: All rebalancing logic
- **Lines**: 2070-2285

## 🎯 Remaining Work

1. **Combination 4**: Add complete rebalancing logic
2. **Combination 5**: Add cumulative initialization and stage adjustments
3. **Combination 6**: Add complete rebalancing logic

## 📝 Implementation Pattern (Reference)

All combinations should follow this pattern:

```javascript
// After Stage 1 (before recommendations.push(stage1))
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

// Stage 3+ - Rebalance
const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
const remainingStagesCount = nPerSplit.length - i;
const adjustedStageN = remainingStagesCount > 0 ? remainingNTotal / remainingStagesCount : nPerSplit[i];

// Final rebalancing
const minRequiredN = totalNRequired * 0.88;
if (cumulativeN < minRequiredN) {
    // Add deficit to last stage
}
```











