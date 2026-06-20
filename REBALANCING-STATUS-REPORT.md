# Rebalancing Logic Status - All 6 Combinations

## ✅ Current Status

| Combination | Cumulative Tracking | Stage Adjustment | Final Rebalancing | Status |
|-------------|---------------------|-----------------|-------------------|--------|
| **Combination 1** | ✅ Line 794 | ✅ Line 909-921 | ✅ Line 977-1050 | ✅ **COMPLETE** |
| **Combination 2** | ✅ Line 1122 | ✅ Line 1237-1249 | ✅ Line 1305-1377 | ✅ **COMPLETE** |
| **Combination 3** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ **MISSING** |
| **Combination 4** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ **MISSING** |
| **Combination 5** | ❌ Missing* | ❌ Missing* | ✅ Line 1997-2064 | ⚠️ **PARTIAL** |
| **Combination 6** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ **MISSING** |

*Note: Combination 5 has final rebalancing but references `cumulativeN`, `cumulativeP`, `cumulativeK` that are never initialized after Stage 1.

## 🔍 Detailed Analysis

### ✅ Combination 1 (28-28-0 + 20-20-0)
- **Line 794**: `let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;`
- **Line 795-799**: Calculates cumulative after Stage 1
- **Line 802-806**: Calculates totals and remaining
- **Line 809-811**: Adjusts Stage 2 targets
- **Line 900-904**: Updates cumulative after Stage 2
- **Line 909-921**: Rebalances Stage 3+ targets
- **Line 977-1050**: Final rebalancing if below minimum

### ✅ Combination 2 (14-35-14 + 20-20-0)
- **Line 1122**: `let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;`
- **Line 1123-1127**: Calculates cumulative after Stage 1
- **Line 1130-1134**: Calculates totals and remaining
- **Line 1137-1139**: Adjusts Stage 2 targets
- **Line 1227-1231**: Updates cumulative after Stage 2
- **Line 1237-1249**: Rebalances Stage 3+ targets
- **Line 1305-1377**: Final rebalancing if below minimum

### ❌ Combination 3 (14-35-14 + 28-28-0)
- **Line 1448**: `recommendations.push(stage1);` - No cumulative tracking
- **Line 1450-1534**: Stage 2 uses original `nPerSplit[1]` (no adjustment)
- **Line 1536-1588**: Stage 3+ uses original `nPerSplit[i]` (no adjustment)
- **Line 1590**: `return recommendations;` - No final rebalancing

### ❌ Combination 4 (28-28-0 + 10-26-26)
- **Line 1685**: `recommendations.push(stage1);` - No cumulative tracking
- **Line 1689-1775**: Stages use original `nPerSplit[i]` (no adjustment)
- **Line 1777**: `return recommendations;` - No final rebalancing

### ⚠️ Combination 5 (28-28-0 + 16-20-0)
- **Line 1848**: `recommendations.push(stage1);` - No cumulative tracking after Stage 1
- **Line 1850-1934**: Stage 2 uses original `nPerSplit[1]` (no adjustment)
- **Line 1936-1995**: Stage 3+ uses original `nPerSplit[i]` (no adjustment)
- **Line 1985-1990**: Updates cumulative (but never initialized!)
- **Line 1997-2064**: Final rebalancing exists but won't work (cumulative not initialized)

### ❌ Combination 6 (14-35-14 + 16-20-0)
- **Line 2140**: `recommendations.push(stage1);` - No cumulative tracking
- **Line 2142-2226**: Stage 2 uses original `nPerSplit[1]` (no adjustment)
- **Line 2228-2282**: Stage 3+ uses original `nPerSplit[i]` (no adjustment)
- **Line 2284**: `return recommendations;` - No final rebalancing

## 🎯 Required Fixes

### For Combinations 3, 4, 5, 6:
1. **Add cumulative tracking after Stage 1**
2. **Calculate totals and remaining**
3. **Adjust Stage 2 targets based on Stage 1 actual delivery**
4. **Update cumulative after Stage 2**
5. **Adjust Stage 3+ targets based on cumulative delivery**
6. **Add final rebalancing if below minimum (88% threshold)**

## 📋 Implementation Pattern

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











