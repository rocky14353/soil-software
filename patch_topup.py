import re

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Total lines: {len(lines)}')
print(f'Line 1717: {repr(lines[1716].rstrip())}')
print(f'Line 1941: {repr(lines[1940].rstrip())}')

new_block = """\
    // Helper: re-read delivered nutrients for a stage from its current fertilizers
    const getStageDelivered = (idx) => {
        const s = recommendations[idx];
        let n = 0, p = 0, k = 0;
        if (s && s.fertilizers) {
            s.fertilizers.forEach(f => {
                n += f.nContributed || 0;
                p += f.pContributed || 0;
                k += f.kContributed || 0;
            });
        }
        return { n, p, k };
    };

    // Build list of valid stage indices
    const stageIndices = recommendations
        .map((s, i) => i)
        .filter(i => i < nPerSplit.length && recommendations[i] && recommendations[i].fertilizers);

    // \u2500\u2500 PASS 1: N top-up \u2014 most N-underfilled stage first \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (globalRemainingN > 0.1) {
        const nOrder = [...stageIndices].sort((a, b) => {
            const defA = (nPerSplit[a] || 0) - getStageDelivered(a).n;
            const defB = (nPerSplit[b] || 0) - getStageDelivered(b).n;
            return defB - defA; // descending: largest deficit first
        });

        for (const stageIdx of nOrder) {
            if (globalRemainingN <= 0.1) break;

            const stage = recommendations[stageIdx];
            const delivered = getStageDelivered(stageIdx);
            const deliveredN = delivered.n;
            const stageTargetN = nPerSplit[stageIdx] || 0;

            // Skip stages already at or above their target
            if (deliveredN >= stageTargetN) continue;

            const nHeadroom = Math.max(0, stageTargetN * 1.12 - deliveredN);
            if (nHeadroom <= 0.5) continue;

            const stageTargets  = { n: stageTargetN, p: pPerSplit[stageIdx] || 0, k: kPerSplit[stageIdx] || 0 };
            const deliveredBefore = { n: deliveredN, p: delivered.p, k: delivered.k };

            let nFertilizer = selectNFertilizer(Math.min(nHeadroom, globalRemainingN), preferences, sStatus, phStatus);
            if (!nFertilizer) nFertilizer = 'Urea';

            const nToAdd = Math.min(nHeadroom, globalRemainingN, stageTargetN * 1.12 - deliveredN);
            if (nToAdd <= 0.1) continue;

            const nKgs    = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
            const rounded = roundToBag(nKgs);

            if (rounded.kgs <= 0) {
                console.log(`[${combinationName}-topup] Stage ${stageIdx} N: Skipped - rounded qty = ${rounded.kgs.toFixed(2)} kg`);
                continue;
            }

            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            if (deliveredN + actualNutrients.n <= stageTargetN * 1.12 &&
                globalDelivered.n + actualNutrients.n <= totalNRequired) {
                const fertilizerObj = {
                    name: nFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                };
                console.log(`[${combinationName}-topup] Stage ${stageIdx} N: headroom=${nHeadroom.toFixed(2)}, globalRemaining=${globalRemainingN.toFixed(2)}, chosenTopUp=${nToAdd.toFixed(2)}, roundedQty=${rounded.kgs.toFixed(2)}, actualN=${actualNutrients.n.toFixed(2)}`);
                if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-N`)) {
                    globalDelivered.n += actualNutrients.n;
                    globalRemainingN   = Math.max(0, totalNRequired - globalDelivered.n);
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} N: ACCEPTED - new globalRemaining=${globalRemainingN.toFixed(2)}`);
                } else {
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} N: REJECTED - constraint violation`);
                }
            } else {
                console.log(`[${combinationName}-topup] Stage ${stageIdx} N: REJECTED - would exceed stage cap or global quota`);
            }
        }
    }

    // \u2500\u2500 PASS 2: P top-up \u2014 most P-underfilled stage first (Panicle forbidden) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (globalRemainingP > 0.1) {
        const pOrder = [...stageIndices]
            .filter(i => i !== 2) // Panicle: P application forbidden
            .sort((a, b) => {
                const defA = (pPerSplit[a] || 0) - getStageDelivered(a).p;
                const defB = (pPerSplit[b] || 0) - getStageDelivered(b).p;
                return defB - defA;
            });

        for (const stageIdx of pOrder) {
            if (globalRemainingP <= 0.1) break;

            const stage = recommendations[stageIdx];
            const delivered = getStageDelivered(stageIdx);
            const deliveredP = delivered.p;
            const stageTargetP = pPerSplit[stageIdx] || 0;

            // Skip stages already at or above their target
            if (deliveredP >= stageTargetP) continue;

            const pHeadroom = Math.max(0, stageTargetP * 1.12 - deliveredP);
            if (pHeadroom <= 0.1) continue;

            const stageTargets  = { n: nPerSplit[stageIdx] || 0, p: stageTargetP, k: kPerSplit[stageIdx] || 0 };
            const deliveredBefore = { n: delivered.n, p: deliveredP, k: delivered.k };

            const pToAdd = Math.min(pHeadroom, globalRemainingP, stageTargetP * 1.12 - deliveredP);
            if (pToAdd <= 0.1) continue;

            const sspKgs  = (pToAdd / 16) * 100;
            const rounded = roundToBag(sspKgs);

            if (rounded.kgs <= 0) {
                console.log(`[${combinationName}-topup] Stage ${stageIdx} P: Skipped - rounded qty = ${rounded.kgs.toFixed(2)} kg`);
                continue;
            }

            const actualP = (rounded.kgs * 16) / 100;
            const actualS = (rounded.kgs * 12) / 100;
            if (deliveredP + actualP <= stageTargetP * 1.12 &&
                globalDelivered.p + actualP <= totalPRequired) {
                const fertilizerObj = {
                    name: 'SSP',
                    kgs: rounded.kgs,
                    bags: rounded.kgs / 50,
                    fullBags: Math.floor(rounded.kgs / 50),
                    remainder: rounded.kgs % 50,
                    nContributed: 0,
                    pContributed: actualP,
                    kContributed: 0,
                    sContributed: actualS
                };
                console.log(`[${combinationName}-topup] Stage ${stageIdx} P: headroom=${pHeadroom.toFixed(2)}, globalRemaining=${globalRemainingP.toFixed(2)}, chosenTopUp=${pToAdd.toFixed(2)}, roundedQty=${rounded.kgs.toFixed(2)}, actualP=${actualP.toFixed(2)}`);
                if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-P`)) {
                    globalDelivered.p += actualP;
                    globalRemainingP   = Math.max(0, totalPRequired - globalDelivered.p);
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P: ACCEPTED - new globalRemaining=${globalRemainingP.toFixed(2)}`);
                } else {
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P: REJECTED - constraint violation`);
                }
            } else {
                console.log(`[${combinationName}-topup] Stage ${stageIdx} P: REJECTED - would exceed stage cap or global quota`);
            }
        }
    }

    // \u2500\u2500 PASS 3: K top-up \u2014 most K-underfilled stage first (Tillering forbidden) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (globalRemainingK > 0.1) {
        const kOrder = [...stageIndices]
            .filter(i => i !== 1) // Tillering: K application forbidden
            .sort((a, b) => {
                const defA = (kPerSplit[a] || 0) - getStageDelivered(a).k;
                const defB = (kPerSplit[b] || 0) - getStageDelivered(b).k;
                return defB - defA;
            });

        for (const stageIdx of kOrder) {
            if (globalRemainingK <= 0.1) break;

            const stage = recommendations[stageIdx];
            const delivered = getStageDelivered(stageIdx);
            const deliveredK = delivered.k;
            const stageTargetK = kPerSplit[stageIdx] || 0;

            // Skip stages already at or above their target
            if (deliveredK >= stageTargetK) continue;

            const kHeadroom = Math.max(0, stageTargetK * 1.12 - deliveredK);
            if (kHeadroom <= 0.5) continue;

            const stageTargets  = { n: nPerSplit[stageIdx] || 0, p: pPerSplit[stageIdx] || 0, k: stageTargetK };
            const deliveredBefore = { n: delivered.n, p: delivered.p, k: deliveredK };

            const kFertName = selectKFertilizer(Math.min(kHeadroom, globalRemainingK), preferences, sStatus, phStatus) || 'SOP';
            const kToAdd    = Math.min(kHeadroom, globalRemainingK, stageTargetK * 1.12 - deliveredK);
            if (kToAdd <= 0.1) continue;

            const kKgs    = convertK2OToStraight(kToAdd, kFertName.toLowerCase());
            const rounded = roundToBag(kKgs);

            if (rounded.kgs <= 0) {
                console.log(`[${combinationName}-topup] Stage ${stageIdx} K: Skipped - rounded qty = ${rounded.kgs.toFixed(2)} kg`);
                continue;
            }

            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertName);
            if (deliveredK + actualNutrients.k <= stageTargetK * 1.12 &&
                globalDelivered.k + actualNutrients.k <= totalKRequired) {
                const fertilizerObj = {
                    name: kFertName,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                };
                console.log(`[${combinationName}-topup] Stage ${stageIdx} K: headroom=${kHeadroom.toFixed(2)}, globalRemaining=${globalRemainingK.toFixed(2)}, chosenTopUp=${kToAdd.toFixed(2)}, roundedQty=${rounded.kgs.toFixed(2)}, actualK=${actualNutrients.k.toFixed(2)}`);
                if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-K`)) {
                    globalDelivered.k += actualNutrients.k;
                    globalRemainingK   = Math.max(0, totalKRequired - globalDelivered.k);
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} K: ACCEPTED - new globalRemaining=${globalRemainingK.toFixed(2)}`);
                } else {
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} K: REJECTED - constraint violation`);
                }
            } else {
                console.log(`[${combinationName}-topup] Stage ${stageIdx} K: REJECTED - would exceed stage cap or global quota`);
            }
        }
    }
"""

# Replace lines 1717-1941 (0-indexed 1716-1940 inclusive)
before = lines[:1716]
after  = lines[1941:]   # keep blank line at 1942 and everything after

new_lines = before + [new_block + '\n'] + after

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Done. New total lines: {len(new_lines)}')




