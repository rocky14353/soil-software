/**
 * Allocation Engine Module
 * Handles constraint-aware stage-wise fertilizer allocation
 */

/**
 * Calculate constrained quantity for a fertilizer given stage targets
 * Uses minimum limit approach to ensure no overflow
 */
function calculateConstrainedQuantityNew(fertilizer, stageTargets, restrictions, pStatus, locationRec) {
    const { n, p, k } = fertilizer;
    
    // Check stage restrictions
    if (restrictions.k === 0 && k > 0) {
        return null; // K not allowed
    }
    if (restrictions.p === 0 && p > 0) {
        return null; // P not allowed
    }
    
    // Calculate quantity limits from each nutrient
    const limits = [];
    
    // Limit from P requirement
    if (p > 0 && stageTargets.p > 0) {
        const quantityFromP = convertP2O5ToGromorDirect(stageTargets.p, fertilizer.name, pStatus, locationRec);
        if (quantityFromP > 0) limits.push(quantityFromP);
    }
    
    // Limit from N requirement (CRITICAL - must not exceed)
    if (n > 0 && stageTargets.n > 0) {
        const quantityFromN = (stageTargets.n / n) * 100;
        limits.push(quantityFromN);
    }
    
    // Limit from K requirement
    if (k > 0 && stageTargets.k > 0 && restrictions.k !== 0) {
        const quantityFromK = (stageTargets.k / k) * 100;
        limits.push(quantityFromK);
    }
    
    if (limits.length === 0) return null;
    
    // Use minimum limit (ensures no overflow)
    const minQuantity = Math.min(...limits);
    
    // Validate nutrients at minimum quantity
    const nutrients = getNutrientsFromGromor(minQuantity, fertilizer.name);
    
    // STRICT: N must NOT exceed limit
    if (nutrients.n > stageTargets.n) {
        return null;
    }
    
    // STRICT: K must NOT exceed limit
    if (restrictions.k !== 0 && nutrients.k > stageTargets.k) {
        return null;
    }
    
    // If P not satisfied, try rounding up ONLY if it doesn't violate N/K limits
    if (nutrients.p < stageTargets.p * 0.95) {
        const roundedUp = roundToBagPrecise(minQuantity, 50, true);
        const nutrientsUp = getNutrientsFromGromor(roundedUp.kgs, fertilizer.name);
        
        // STRICT: Check N/K limits BEFORE accepting rounded up quantity
        if (nutrientsUp.n > stageTargets.n) {
            return null;
        }
        if (restrictions.k !== 0 && nutrientsUp.k > stageTargets.k) {
            return null;
        }
        
        if (nutrientsUp.p >= stageTargets.p * 0.95) {
            return { quantity: roundedUp.kgs, nutrients: nutrientsUp, valid: true };
        }
        
        return null;
    }
    
    // Round to bag size
    const rounded = roundToBagPrecise(minQuantity, 50, true);
    const roundedNutrients = getNutrientsFromGromor(rounded.kgs, fertilizer.name);
    
    // STRICT FINAL VALIDATION: No N/K overflow allowed after rounding
    if (roundedNutrients.n > stageTargets.n) {
        return null;
    }
    if (restrictions.k !== 0 && roundedNutrients.k > stageTargets.k) {
        return null;
    }
    
    return { quantity: rounded.kgs, nutrients: roundedNutrients, valid: true };
}

/**
 * Score a fertilizer candidate for selection
 * Lower score = better candidate
 */
function scoreCandidate(candidate, stageTargets, stageIndex) {
    const nutrients = candidate.nutrients;
    
    // REJECT if N/K overflow
    if (nutrients.n > stageTargets.n) {
        return 100000; // Reject - N overflow
    }
    if (stageIndex !== 1 && nutrients.k > stageTargets.k) {
        return 100000; // Reject - K overflow
    }
    if (stageIndex === 1 && nutrients.k > 0.01) {
        return 100000; // Reject - K in Tillering
    }
    
    // P must be satisfied
    if (nutrients.p < stageTargets.p * 0.95) {
        return -1000; // Heavy penalty for not satisfying P
    }
    
    // Score: minimize excess P, maximize N/K utilization within limits
    const excessP = Math.max(0, nutrients.p - stageTargets.p);
    const nUtilization = stageTargets.n > 0 ? nutrients.n / stageTargets.n : 0; // Higher is better (up to 1.0)
    const kUtilization = (stageIndex !== 1 && stageTargets.k > 0) ? nutrients.k / stageTargets.k : 0;
    
    // Lower score = better
    return excessP * 2.0 - (nUtilization * 0.1) - (kUtilization * 0.1);
}

/**
 * Solve a single stage with hard caps
 */
function solveStage(stageIndex, stageTargets, restrictions, catalog, preferences, pStatus, nStatus, kStatus, sStatus, phStatus, locationRec, cropData) {
    const stageRemaining = { ...stageTargets };
    const fertilizers = [];
    const auditTrail = [];
    
    let deliveredN = 0;
    let deliveredP = 0;
    let deliveredK = 0;
    
    // Step 1: Select complex fertilizer for P (if needed and allowed)
    if (stageRemaining.p > 0 && restrictions.p !== 0) {
        const candidates = filterByStage(catalog.complex, stageIndex, restrictions);
        const preferredCandidates = filterByPreference(candidates, preferences);
        const pCandidates = filterByNutrient(preferredCandidates.length > 0 ? preferredCandidates : candidates, 'p', 20);
        
        const evaluatedCandidates = [];
        
        for (const fert of pCandidates) {
            const constrained = calculateConstrainedQuantityNew(fert, stageRemaining, restrictions, pStatus, locationRec);
            if (constrained && constrained.valid) {
                const score = scoreCandidate({ nutrients: constrained.nutrients }, stageTargets, stageIndex);
                evaluatedCandidates.push({
                    fertilizer: fert,
                    quantity: constrained.quantity,
                    nutrients: constrained.nutrients,
                    score: score
                });
            }
        }
        
        if (evaluatedCandidates.length > 0) {
            // Select best candidate (lowest score)
            evaluatedCandidates.sort((a, b) => a.score - b.score);
            const best = evaluatedCandidates[0];
            
            // Add to stage
            const fertilizerName = best.fertilizer.displayName || best.fertilizer.name;
            const bagSize = 50;
            const bags = best.quantity / bagSize;
            
            fertilizers.push({
                name: fertilizerName,
                kgs: best.quantity,
                bags: bags,
                fullBags: Math.floor(bags),
                remainder: best.quantity % bagSize,
                nContributed: best.nutrients.n,
                pContributed: best.nutrients.p,
                kContributed: best.nutrients.k,
                sContributed: best.nutrients.s || 0
            });
            
            deliveredN += best.nutrients.n;
            deliveredP += best.nutrients.p;
            deliveredK += best.nutrients.k;
            
            stageRemaining.n = Math.max(0, stageTargets.n - deliveredN);
            stageRemaining.p = Math.max(0, stageTargets.p - deliveredP);
            stageRemaining.k = Math.max(0, stageTargets.k - deliveredK);
            
            auditTrail.push({
                step: 'P fertilizer selection',
                candidates: evaluatedCandidates.length,
                selected: {
                    fertilizer: fertilizerName,
                    quantity: best.quantity,
                    reason: `Best score: ${best.score.toFixed(2)}`
                },
                constraints: {
                    nLimit: stageTargets.n,
                    pLimit: stageTargets.p,
                    kLimit: stageTargets.k
                },
                result: best.nutrients
            });
        } else if (stageRemaining.p > 0) {
            // Fallback to SSP if no complex fertilizer found
            const sspKgs = (stageRemaining.p / 16) * 100;
            const rounded = roundToBagPrecise(sspKgs, 50, true);
            const actualP = (rounded.kgs * 16) / 100;
            
            fertilizers.push({
                name: 'SSP',
                kgs: rounded.kgs,
                bags: rounded.bags,
                fullBags: rounded.fullBags,
                remainder: rounded.remainder,
                nContributed: 0,
                pContributed: actualP,
                kContributed: 0,
                sContributed: (rounded.kgs * 12) / 100
            });
            
            deliveredP += actualP;
            stageRemaining.p = Math.max(0, stageTargets.p - deliveredP);
        }
    }
    
    // Step 2: Top up N with single fertilizers (within stage cap)
    if (stageRemaining.n > 0 && fertilizers.length < 3) {
        const nFertilizers = getSingleFertilizers().filter(f => f.n > 0);
        const preferredN = filterByPreference(nFertilizers, preferences);
        const nFertilizer = preferredN.length > 0 ? preferredN[0] : nFertilizers[0];
        
        if (nFertilizer) {
            const nKgs = convertNToStraight(stageRemaining.n, nFertilizer.name.toLowerCase());
            const bagSize = nFertilizer.name.toLowerCase() === 'urea' ? 45 : 50;
            const rounded = roundToBagPrecise(nKgs, bagSize, true);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer.name);
            
            // Constraint check
            if (deliveredN + actualNutrients.n <= stageTargets.n) {
                fertilizers.push({
                    name: nFertilizer.displayName || nFertilizer.name,
                    kgs: rounded.kgs,
                    bags: rounded.bags,
                    fullBags: rounded.fullBags,
                    remainder: rounded.remainder,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                });
                
                deliveredN += actualNutrients.n;
                stageRemaining.n = Math.max(0, stageTargets.n - deliveredN);
            } else {
                // Cap to stage limit
                const maxAllowedN = stageTargets.n - deliveredN;
                if (maxAllowedN > 0) {
                    const cappedKgs = convertNToStraight(maxAllowedN, nFertilizer.name.toLowerCase());
                    const cappedRounded = roundToBagPrecise(cappedKgs, bagSize, true);
                    const cappedNutrients = getNutrientsFromStraight(cappedRounded.kgs, nFertilizer.name);
                    
                    fertilizers.push({
                        name: nFertilizer.displayName || nFertilizer.name,
                        kgs: cappedRounded.kgs,
                        bags: cappedRounded.bags,
                        fullBags: cappedRounded.fullBags,
                        remainder: cappedRounded.remainder,
                        nContributed: cappedNutrients.n,
                        pContributed: cappedNutrients.p || 0,
                        kContributed: cappedNutrients.k || 0
                    });
                    
                    deliveredN += cappedNutrients.n;
                    stageRemaining.n = Math.max(0, stageTargets.n - deliveredN);
                }
            }
        }
    }
    
    // Step 3: Top up K with single fertilizers (if allowed and within stage cap)
    if (restrictions.k !== 0 && stageRemaining.k > 0 && fertilizers.length < 3) {
        const kFertilizers = getSingleFertilizers().filter(f => f.k > 0);
        const preferredK = filterByPreference(kFertilizers, preferences);
        const kFertilizer = preferredK.length > 0 ? preferredK[0] : kFertilizers[0];
        
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(stageRemaining.k, kFertilizer.name.toLowerCase());
            const bagSize = 50;
            const rounded = roundToBagPrecise(kKgs, bagSize, false);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer.name);
            
            // Constraint check
            if (deliveredK + actualNutrients.k <= stageTargets.k) {
                fertilizers.push({
                    name: kFertilizer.displayName || kFertilizer.name,
                    kgs: rounded.kgs,
                    bags: rounded.bags,
                    fullBags: rounded.fullBags,
                    remainder: rounded.remainder,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                });
                
                deliveredK += actualNutrients.k;
                stageRemaining.k = Math.max(0, stageTargets.k - deliveredK);
            }
        }
    }
    
    // Validate stage result
    const validation = validateStageResult(
        { deliveredN, deliveredP, deliveredK },
        stageTargets,
        restrictions
    );
    
    return {
        fertilizers,
        deliveredN,
        deliveredP,
        deliveredK,
        remainingN: stageRemaining.n,
        remainingP: stageRemaining.p,
        remainingK: stageRemaining.k,
        auditTrail,
        validation
    };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateConstrainedQuantityNew,
        scoreCandidate,
        solveStage
    };
}






