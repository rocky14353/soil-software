/**
 * Output Formatter Module
 * Generates structured output for stage plans, audit trails, and validation reports
 */

/**
 * Format stage plan object
 */
function formatStagePlan(stageIndex, stageName, targets, result, validation) {
    return {
        stageIndex: stageIndex,
        stageName: stageName,
        targets: {
            n: targets.n,
            p: targets.p,
            k: targets.k
        },
        fertilizers: result.fertilizers || [],
        delivered: {
            n: result.deliveredN || 0,
            p: result.deliveredP || 0,
            k: result.deliveredK || 0
        },
        remaining: {
            n: result.remainingN || 0,
            p: result.remainingP || 0,
            k: result.remainingK || 0
        },
        validation: validation || { passed: true, warnings: [], errors: [] },
        auditTrail: result.auditTrail || []
    };
}

/**
 * Format global summary
 */
function formatGlobalSummary(totalRequired, stagePlans) {
    const totalDelivered = {
        n: 0,
        p: 0,
        k: 0
    };
    
    stagePlans.forEach(plan => {
        totalDelivered.n += plan.delivered.n;
        totalDelivered.p += plan.delivered.p;
        totalDelivered.k += plan.delivered.k;
    });
    
    const validation = {
        passed: true,
        warnings: [],
        errors: [],
        deficits: {},
        excesses: {}
    };
    
    // Check deficits
    if (totalDelivered.n < totalRequired.n) {
        validation.passed = false;
        validation.deficits.n = totalRequired.n - totalDelivered.n;
        validation.errors.push(`N deficit: ${validation.deficits.n.toFixed(2)} kg`);
    }
    if (totalDelivered.p < totalRequired.p) {
        validation.passed = false;
        validation.deficits.p = totalRequired.p - totalDelivered.p;
        validation.errors.push(`P deficit: ${validation.deficits.p.toFixed(2)} kg`);
    }
    if (totalDelivered.k < totalRequired.k) {
        validation.passed = false;
        validation.deficits.k = totalRequired.k - totalDelivered.k;
        validation.errors.push(`K deficit: ${validation.deficits.k.toFixed(2)} kg`);
    }
    
    // Check excesses (5% tolerance)
    const tolerance = 0.05;
    if (totalDelivered.n > totalRequired.n * (1 + tolerance)) {
        validation.excesses.n = totalDelivered.n - totalRequired.n * (1 + tolerance);
        validation.warnings.push(`N excess: ${validation.excesses.n.toFixed(2)} kg (exceeds 5% tolerance)`);
    }
    if (totalDelivered.p > totalRequired.p * (1 + tolerance)) {
        validation.excesses.p = totalDelivered.p - totalRequired.p * (1 + tolerance);
        validation.warnings.push(`P excess: ${validation.excesses.p.toFixed(2)} kg (exceeds 5% tolerance)`);
    }
    if (totalDelivered.k > totalRequired.k * (1 + tolerance)) {
        validation.excesses.k = totalDelivered.k - totalRequired.k * (1 + tolerance);
        validation.warnings.push(`K excess: ${validation.excesses.k.toFixed(2)} kg (exceeds 5% tolerance)`);
    }
    
    // Check stage validations
    stagePlans.forEach(plan => {
        if (!plan.validation.passed) {
            validation.passed = false;
            validation.errors.push(`Stage ${plan.stageIndex} (${plan.stageName}): ${plan.validation.errors.join(', ')}`);
        }
        if (plan.validation.warnings.length > 0) {
            validation.warnings.push(`Stage ${plan.stageIndex} (${plan.stageName}): ${plan.validation.warnings.join(', ')}`);
        }
    });
    
    return {
        totalRequired: totalRequired,
        totalDelivered: totalDelivered,
        stagePlans: stagePlans,
        validation: validation
    };
}

/**
 * Format infeasibility report
 */
function formatInfeasibilityReport(stageIndex, stageName, requiredNutrients, blockingRules, rejectedFertilizers) {
    return {
        stageIndex: stageIndex,
        stageName: stageName,
        requiredNutrients: requiredNutrients,
        blockingRules: blockingRules,
        rejectedFertilizers: rejectedFertilizers,
        message: `Stage ${stageIndex} (${stageName}) is infeasible: ${blockingRules.join(', ')}`
    };
}

/**
 * Format audit trail entry
 */
function formatAuditTrailEntry(step, candidates, selected, constraints, result) {
    return {
        step: step,
        timestamp: new Date().toISOString(),
        candidates: candidates,
        selected: selected,
        constraints: constraints,
        result: result
    };
}

/**
 * Format nutrient contribution table (Excel-style)
 */
function formatNutrientContributionTable(stagePlans) {
    const tables = [];
    
    stagePlans.forEach(plan => {
        const table = {
            stage: plan.stageName,
            rows: []
        };
        
        plan.fertilizers.forEach(fert => {
            table.rows.push({
                fertilizer: fert.name,
                quantity: fert.kgs,
                n: fert.nContributed || 0,
                p: fert.pContributed || 0,
                k: fert.kContributed || 0,
                s: fert.sContributed || 0
            });
        });
        
        // Add total row
        const totals = {
            fertilizer: 'Total',
            quantity: table.rows.reduce((sum, r) => sum + r.quantity, 0),
            n: table.rows.reduce((sum, r) => sum + r.n, 0),
            p: table.rows.reduce((sum, r) => sum + r.p, 0),
            k: table.rows.reduce((sum, r) => sum + r.k, 0),
            s: table.rows.reduce((sum, r) => sum + r.s, 0)
        };
        table.rows.push(totals);
        
        tables.push(table);
    });
    
    return tables;
}

/**
 * Format balance tracking (remaining nutrients after each stage)
 */
function formatBalanceTracking(stagePlans, totalRequired) {
    const tracking = [];
    
    let remainingN = totalRequired.n;
    let remainingP = totalRequired.p;
    let remainingK = totalRequired.k;
    
    tracking.push({
        stage: 'Initial',
        remainingN: remainingN,
        remainingP: remainingP,
        remainingK: remainingK
    });
    
    stagePlans.forEach(plan => {
        remainingN -= plan.delivered.n;
        remainingP -= plan.delivered.p;
        remainingK -= plan.delivered.k;
        
        tracking.push({
            stage: plan.stageName,
            remainingN: Math.max(0, remainingN),
            remainingP: Math.max(0, remainingP),
            remainingK: Math.max(0, remainingK)
        });
    });
    
    return tracking;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatStagePlan,
        formatGlobalSummary,
        formatInfeasibilityReport,
        formatAuditTrailEntry,
        formatNutrientContributionTable,
        formatBalanceTracking
    };
}






