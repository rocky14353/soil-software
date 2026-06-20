/**
 * Template for patching final rebalancing sections in calculateCombination2-6
 * This shows the pattern to apply to all combination functions
 */

// PATTERN FOR FINAL REBALANCING N:
// Replace:
//   lastStage.fertilizers.push({...});
//   cumulativeN += actualNutrients.n;
// With:
//   const lastStageIndex = recommendations.length - 1;
//   const originalStageN = nPerSplit[lastStageIndex] || 0;
//   const originalStageP = pPerSplit[lastStageIndex] || 0;
//   const originalStageK = kPerSplit[lastStageIndex] || 0;
//   let lastStageDeliveredN = 0, lastStageDeliveredP = 0, lastStageDeliveredK = 0;
//   lastStage.fertilizers.forEach(fert => {
//       lastStageDeliveredN += fert.nContributed || 0;
//       lastStageDeliveredP += fert.pContributed || 0;
//       lastStageDeliveredK += fert.kContributed || 0;
//   });
//   const maxAllowedN = originalStageN - lastStageDeliveredN;
//   const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
//   if (nToAdd > 0) {
//       const fertilizerObj = {...};
//       const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
//       const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
//       if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
//           cumulativeN += actualNutrients.n;
//       }
//   }

// PATTERN FOR FINAL REBALANCING P:
// Similar pattern but check pStageIndex !== 2 (Panicle)

// PATTERN FOR FINAL REBALANCING K:
// Similar pattern but check lastStageIndex !== 1 (Tillering)






