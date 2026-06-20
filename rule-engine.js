/**
 * Rule Engine Module
 * Handles stage split rules, restrictions, unit normalization, and validation
 */

/**
 * Calculate stage targets based on total nutrients and crop splits
 * @param {number} totalN - Total N requirement (kg/acre)
 * @param {number} totalP - Total P requirement (kg/acre)
 * @param {number} totalK - Total K requirement (kg/acre)
 * @param {object} cropData - Crop data with split information
 * @returns {object} Stage targets for each stage
 */
function calculateStageTargets(totalN, totalP, totalK, cropData) {
    // Default splits (for Paddy and most crops)
    // N: 1/3 per stage (equal split)
    // P: 60% Basal, 40% Tillering, 0% Panicle
    // K: 50% Basal, 0% Tillering, 50% Panicle
    
    const nSplits = cropData?.splits?.n?.percentages || [33.33, 33.33, 33.34];
    const pSplits = cropData?.splits?.p?.percentages || [60, 40, 0];
    const kSplits = cropData?.splits?.k?.percentages || [50, 0, 50];
    
    const stages = cropData?.splits?.n?.stages || ['Basal', 'at Tillering', 'at Panicle'];
    
    const targets = {};
    
    for (let i = 0; i < stages.length; i++) {
        targets[i] = {
            stageIndex: i,
            stageName: stages[i],
            n: (totalN * nSplits[i]) / 100,
            p: (totalP * pSplits[i]) / 100,
            k: (totalK * kSplits[i]) / 100
        };
    }
    
    return targets;
}

/**
 * Get stage restrictions for a given stage index
 * @param {number} stageIndex - Stage index (0=Basal, 1=Tillering, 2=Panicle)
 * @returns {object} Restrictions object with nutrient limits and reasons
 */
function getStageRestrictions(stageIndex) {
    const restrictions = {};
    
    // Tillering (stageIndex === 1): K must be 0
    if (stageIndex === 1) {
        restrictions.k = 0;
        restrictions.reason = 'K not allowed in Tillering stage';
    }
    
    // Panicle (stageIndex === 2): P must be 0
    if (stageIndex === 2) {
        restrictions.p = 0;
        restrictions.reason = 'P not allowed in Panicle stage';
    }
    
    return restrictions;
}

/**
 * Check if a fertilizer is allowed in a specific stage
 * @param {object} fertilizer - Fertilizer object from catalog
 * @param {number} stageIndex - Stage index
 * @param {object} restrictions - Additional restrictions (optional)
 * @returns {object} { allowed: boolean, reason: string }
 */
function isFertilizerAllowedInStage(fertilizer, stageIndex, restrictions = {}) {
    const stageNames = ['basal', 'tillering', 'panicle'];
    const stageName = stageNames[stageIndex];
    
    if (!stageName) {
        return { allowed: false, reason: `Invalid stage index: ${stageIndex}` };
    }
    
    // Check stage restrictions from fertilizer catalog
    if (fertilizer.stageRestrictions && fertilizer.stageRestrictions[stageName]) {
        return {
            allowed: false,
            reason: fertilizer.stageRestrictions[stageName].reason
        };
    }
    
    // Check allowed stages
    if (fertilizer.allowedStages && !fertilizer.allowedStages.includes(stageName)) {
        return {
            allowed: false,
            reason: `Fertilizer not allowed in ${stageName} stage`
        };
    }
    
    // Check additional restrictions
    if (restrictions.k === 0 && fertilizer.k > 0) {
        return {
            allowed: false,
            reason: 'K not allowed in this stage'
        };
    }
    
    if (restrictions.p === 0 && fertilizer.p > 0) {
        return {
            allowed: false,
            reason: 'P not allowed in this stage'
        };
    }
    
    return { allowed: true, reason: '' };
}

/**
 * Normalize nutrients from one unit to another
 * @param {number} value - Nutrient value
 * @param {string} fromUnit - Source unit ('P', 'P2O5', 'K', 'K2O')
 * @param {string} toUnit - Target unit ('P', 'P2O5', 'K', 'K2O')
 * @returns {{ value: number, valid: boolean, error?: string }} Normalized value with validity flag
 */
function normalizeNutrients(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return { value, valid: true };
    
    // P to P2O5 conversion: P2O5 = P * 2.29
    if (fromUnit === 'P' && toUnit === 'P2O5') {
        return { value: value * 2.29, valid: true };
    }
    // P2O5 to P conversion: P = P2O5 / 2.29
    if (fromUnit === 'P2O5' && toUnit === 'P') {
        return { value: value / 2.29, valid: true };
    }
    
    // K to K2O conversion: K2O = K * 1.205
    if (fromUnit === 'K' && toUnit === 'K2O') {
        return { value: value * 1.205, valid: true };
    }
    // K2O to K conversion: K = K2O / 1.205
    if (fromUnit === 'K2O' && toUnit === 'K') {
        return { value: value / 1.205, valid: true };
    }
    
    return { value, valid: false, error: `Unknown unit conversion: ${fromUnit} to ${toUnit}` };
}

/**
 * Get tolerance rules for stage-wise and global validation
 * @returns {object} Tolerance configuration
 */
function getToleranceRules() {
    return {
        stageWise: {
            n: { min: 0.90, max: 1.10 }, // ±10% tolerance
            p: { min: 0.95, max: 1.15 },  // -5% to +15% tolerance
            k: { min: 0.90, max: 1.10 }   // ±10% tolerance
        },
        global: {
            n: { min: 0.95, max: 1.05 }, // -5% to +5% tolerance
            p: { min: 0.95, max: 1.05 },
            k: { min: 0.95, max: 1.05 }
        }
    };
}

/**
 * Validate a single stage result against targets and restrictions.
 * Uses proper tolerance upper bounds instead of hard-capping at target.
 * @param {object} result - Stage result with delivered nutrients
 * @param {object} targets - Stage targets {n, p, k}
 * @param {object} restrictions - Stage restrictions {k: 0, p: 0, ...}
 * @returns {object} Validation result { passed, warnings, errors, ratios }
 */
function validateStageResult(result, targets, restrictions) {
    const tolerance = getToleranceRules().stageWise;
    const validation = {
        passed: true,
        warnings: [],
        errors: [],
        ratios: {}
    };
    
    // Check N
    if (result.deliveredN !== undefined) {
        const nRatio = targets.n > 0 ? result.deliveredN / targets.n : 0;
        validation.ratios.n = nRatio;
        
        // Use upper tolerance bound — N up to 10% over target is fine
        const nUpper = targets.n * tolerance.n.max;
        if (result.deliveredN > nUpper) {
            validation.passed = false;
            validation.errors.push(`N overflow: ${result.deliveredN.toFixed(2)} > ${nUpper.toFixed(2)} kg (10% tolerance exceeded)`);
        } else if (result.deliveredN > targets.n) {
            // Within tolerance but above target — warn, don't error
            validation.warnings.push(`N slight over-delivery: ${result.deliveredN.toFixed(2)} > ${targets.n.toFixed(2)} kg (within 10% tolerance)`);
        } else if (nRatio < tolerance.n.min) {
            validation.warnings.push(`N under-delivery: ${result.deliveredN.toFixed(2)} < ${(targets.n * tolerance.n.min).toFixed(2)} kg`);
        }
    }
    
    // Check P
    if (result.deliveredP !== undefined) {
        validation.ratios.p = targets.p > 0 ? result.deliveredP / targets.p : 0;
        
        if (restrictions.p === 0 && result.deliveredP > 0.01) {
            validation.passed = false;
            validation.errors.push(`P violation: ${result.deliveredP.toFixed(2)} kg delivered but P not allowed`);
        } else if (targets.p > 0) {
            const pRatio = result.deliveredP / targets.p;
            
            // Use upper tolerance bound — P up to 15% over target is fine
            const pUpper = targets.p * tolerance.p.max;
            if (result.deliveredP > pUpper) {
                validation.passed = false;
                validation.errors.push(`P overflow: ${result.deliveredP.toFixed(2)} > ${pUpper.toFixed(2)} kg (15% tolerance exceeded)`);
            } else if (pRatio < tolerance.p.min) {
                validation.warnings.push(`P under-delivery: ${result.deliveredP.toFixed(2)} < ${(targets.p * tolerance.p.min).toFixed(2)} kg`);
            }
        }
    }
    
    // Check K
    if (result.deliveredK !== undefined) {
        const kRatio = targets.k > 0 ? result.deliveredK / targets.k : 0;
        validation.ratios.k = kRatio;
        
        if (restrictions.k === 0 && result.deliveredK > 0.01) {
            validation.passed = false;
            validation.errors.push(`K violation: ${result.deliveredK.toFixed(2)} kg delivered but K not allowed`);
        } else if (targets.k > 0) {
            // Use upper tolerance bound — K up to 10% over target is fine
            const kUpper = targets.k * tolerance.k.max;
            if (result.deliveredK > kUpper) {
                validation.passed = false;
                validation.errors.push(`K overflow: ${result.deliveredK.toFixed(2)} > ${kUpper.toFixed(2)} kg (10% tolerance exceeded)`);
            } else if (result.deliveredK > targets.k) {
                validation.warnings.push(`K slight over-delivery: ${result.deliveredK.toFixed(2)} > ${targets.k.toFixed(2)} kg (within 10% tolerance)`);
            } else if (kRatio < tolerance.k.min) {
                validation.warnings.push(`K under-delivery: ${result.deliveredK.toFixed(2)} < ${(targets.k * tolerance.k.min).toFixed(2)} kg`);
            }
        }
    }
    
    return validation;
}

/**
 * Validate the global (across all stages) nutrient delivery.
 * Sums delivered N/P/K across all stage results and checks against
 * global ±5% tolerance of total required.
 * @param {Array<object>} stageResults - Array of stage result objects { deliveredN, deliveredP, deliveredK }
 * @param {object} totalRequired - { n, p, k } total required per acre
 * @returns {object} Validation result { passed, warnings, errors, totals }
 */
function validateGlobalDelivery(stageResults, totalRequired) {
    const tolerance = getToleranceRules().global;
    const validation = {
        passed: true,
        warnings: [],
        errors: [],
        totals: { n: 0, p: 0, k: 0 },
        ratios: { n: 0, p: 0, k: 0 }
    };
    
    // Sum delivered across all stages
    for (const r of stageResults) {
        validation.totals.n += (r.deliveredN || 0);
        validation.totals.p += (r.deliveredP || 0);
        validation.totals.k += (r.deliveredK || 0);
    }
    
    // Compute ratios
    validation.ratios.n = totalRequired.n > 0 ? validation.totals.n / totalRequired.n : 0;
    validation.ratios.p = totalRequired.p > 0 ? validation.totals.p / totalRequired.p : 0;
    validation.ratios.k = totalRequired.k > 0 ? validation.totals.k / totalRequired.k : 0;
    
    // Check N
    const nUpper = totalRequired.n * tolerance.n.max;
    const nLower = totalRequired.n * tolerance.n.min;
    if (validation.totals.n > nUpper) {
        validation.passed = false;
        validation.errors.push(`Global N overflow: ${validation.totals.n.toFixed(2)} > ${nUpper.toFixed(2)} kg (5% tolerance exceeded)`);
    } else if (validation.totals.n < nLower) {
        validation.passed = false;
        validation.errors.push(`Global N deficit: ${validation.totals.n.toFixed(2)} < ${nLower.toFixed(2)} kg (5% tolerance exceeded)`);
    }
    
    // Check P
    const pUpper = totalRequired.p * tolerance.p.max;
    const pLower = totalRequired.p * tolerance.p.min;
    if (validation.totals.p > pUpper) {
        validation.passed = false;
        validation.errors.push(`Global P overflow: ${validation.totals.p.toFixed(2)} > ${pUpper.toFixed(2)} kg (5% tolerance exceeded)`);
    } else if (validation.totals.p < pLower) {
        validation.passed = false;
        validation.errors.push(`Global P deficit: ${validation.totals.p.toFixed(2)} < ${pLower.toFixed(2)} kg (5% tolerance exceeded)`);
    }
    
    // Check K
    const kUpper = totalRequired.k * tolerance.k.max;
    const kLower = totalRequired.k * tolerance.k.min;
    if (validation.totals.k > kUpper) {
        validation.passed = false;
        validation.errors.push(`Global K overflow: ${validation.totals.k.toFixed(2)} > ${kUpper.toFixed(2)} kg (5% tolerance exceeded)`);
    } else if (validation.totals.k < kLower) {
        validation.passed = false;
        validation.errors.push(`Global K deficit: ${validation.totals.k.toFixed(2)} < ${kLower.toFixed(2)} kg (5% tolerance exceeded)`);
    }
    
    return validation;
}

// Export functions for browser (globalThis) and Node.js (module.exports)
if (typeof globalThis !== 'undefined') {
    globalThis.calculateStageTargets = calculateStageTargets;
    globalThis.getStageRestrictions = getStageRestrictions;
    globalThis.isFertilizerAllowedInStage = isFertilizerAllowedInStage;
    globalThis.normalizeNutrients = normalizeNutrients;
    globalThis.getToleranceRules = getToleranceRules;
    globalThis.validateStageResult = validateStageResult;
    globalThis.validateGlobalDelivery = validateGlobalDelivery;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateStageTargets,
        getStageRestrictions,
        isFertilizerAllowedInStage,
        normalizeNutrients,
        getToleranceRules,
        validateStageResult,
        validateGlobalDelivery
    };
}
