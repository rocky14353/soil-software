/**
 * Fertilizer Catalog Module
 * Provides structured fertilizer catalog with tags, classifications, and stage eligibility rules
 */

let fertilizerCatalog = null;
let fertilizerConversionData = null;

/**
 * Initialize fertilizer catalog from conversion data
 */
async function initializeFertilizerCatalog() {
    if (fertilizerCatalog) return fertilizerCatalog;
    
    // Load fertilizer conversion data (assumes it's already loaded in script.js)
    if (!fertilizerConversion || !fertilizerConversion.fertilizerProducts) {
        throw new Error('Fertilizer conversion data not loaded');
    }
    
    fertilizerConversionData = fertilizerConversion;
    const products = fertilizerConversion.fertilizerProducts;
    
    const catalog = {
        single: [],
        complex: [],
        all: []
    };
    
    // Process each fertilizer
    for (const [name, composition] of Object.entries(products)) {
        const fertilizer = classifyFertilizer(name, composition);
        catalog.all.push(fertilizer);
        
        if (fertilizer.type === 'single') {
            catalog.single.push(fertilizer);
        } else {
            catalog.complex.push(fertilizer);
        }
    }
    
    fertilizerCatalog = catalog;
    return catalog;
}

/**
 * Classify a fertilizer and generate tags
 */
function classifyFertilizer(name, composition) {
    const { n, p, k, s } = composition;
    const hasN = n > 0;
    const hasP = p > 0;
    const hasK = k > 0;
    const hasS = s > 0;
    
    // Determine type
    const nutrientCount = [hasN, hasP, hasK].filter(Boolean).length;
    const type = nutrientCount === 1 ? 'single' : 'complex';
    
    // Determine group
    let group = '';
    if (type === 'single') {
        if (hasN) group = 'N-only';
        else if (hasP) group = 'P-only';
        else if (hasK) group = 'K-only';
    } else {
        if (hasN && hasP && hasK) group = 'NPK';
        else if (hasN && hasP) group = 'NP';
        else if (hasN && hasK) group = 'NK';
        else if (hasP && hasK) group = 'PK';
    }
    
    // Generate tags
    const tags = [];
    
    // Type tags
    if (type === 'single') {
        tags.push('single-fertilizer');
        if (hasN) tags.push('n-only', 'top-dressing-friendly');
        if (hasP) tags.push('p-only');
        if (hasK) tags.push('k-only');
    } else {
        tags.push('complex-fertilizer');
        if (hasN) tags.push('contains-n');
        if (hasP) tags.push('p-containing');
        if (hasK) tags.push('contains-k');
        if (hasS) tags.push('contains-s');
    }
    
    // P-specific tags
    if (hasP) {
        const pRatio = p / (n + p + k || 1);
        if (pRatio > 0.4) {
            tags.push('p-heavy');
            // Check N burden
            if (n > 0) {
                const nToPRatio = n / p;
                if (nToPRatio < 0.3) tags.push('p-heavy-low-n-burden');
                else if (nToPRatio < 0.7) tags.push('p-heavy-medium-n-burden');
                else tags.push('p-heavy-high-n-burden');
            } else {
                tags.push('p-heavy-no-n-burden');
            }
        } else if (pRatio > 0.25) {
            tags.push('balanced-np');
        }
        
        // Stage restriction: P not allowed in Panicle
        tags.push('avoid-panicle');
    }
    
    // K-specific tags
    if (hasK) {
        tags.push('k-containing');
        // Stage restriction: K not allowed in Tillering
        tags.push('avoid-tillering');
        
        if (hasN) tags.push('k-with-n-burden');
        if (hasP) tags.push('k-with-p-burden');
    } else {
        tags.push('k-free');
    }
    
    // N-specific tags
    if (hasN && !hasP && !hasK) {
        tags.push('n-only');
    }
    
    // Determine allowed stages
    const allowedStages = [];
    if (!hasK) allowedStages.push('basal', 'tillering', 'panicle');
    else allowedStages.push('basal', 'panicle'); // K not allowed in tillering
    
    if (!hasP) {
        // P-free fertilizers can be used in all stages
    } else {
        // P-containing fertilizers cannot be used in Panicle
        const panicleIndex = allowedStages.indexOf('panicle');
        if (panicleIndex >= 0) allowedStages.splice(panicleIndex, 1);
    }
    
    // Stage restrictions object
    const stageRestrictions = {};
    if (hasK) {
        stageRestrictions.tillering = { reason: 'K not allowed in Tillering stage' };
    }
    if (hasP) {
        stageRestrictions.panicle = { reason: 'P not allowed in Panicle stage' };
    }
    
    // Generate notes
    const notes = [];
    if (hasP && hasK) {
        notes.push('Contains both P and K - use carefully to avoid stage restrictions');
    }
    if (hasP && !hasK) {
        notes.push('Useful for P in stages where K must remain zero');
    }
    if (hasK && !hasP) {
        notes.push('Useful for K in stages where P is not needed');
    }
    if (type === 'single' && hasN) {
        notes.push('Top-dressing friendly - can be applied at any stage');
    }
    
    return {
        name: name,
        displayName: name.includes('-') ? `Gromor ${name}` : name.toUpperCase(),
        n: n,
        p: p,
        k: k,
        s: s || 0,
        type: type,
        group: group,
        tags: tags,
        allowedStages: allowedStages,
        stageRestrictions: stageRestrictions,
        notes: notes.join('; '),
        composition: composition
    };
}

/**
 * Filter fertilizers by stage
 */
function filterByStage(fertilizers, stageIndex, restrictions = {}) {
    const stageNames = ['basal', 'tillering', 'panicle'];
    const stageName = stageNames[stageIndex];
    
    if (!stageName) return [];
    
    return fertilizers.filter(fert => {
        // Check if fertilizer is explicitly restricted for this stage
        if (fert.stageRestrictions && fert.stageRestrictions[stageName]) {
            return false;
        }
        
        // Check if fertilizer is in allowed stages
        if (fert.allowedStages && !fert.allowedStages.includes(stageName)) {
            return false;
        }
        
        // Apply additional restrictions
        if (restrictions.k === 0 && fert.k > 0) {
            return false; // K not allowed
        }
        if (restrictions.p === 0 && fert.p > 0) {
            return false; // P not allowed
        }
        
        return true;
    });
}

/**
 * Filter fertilizers by nutrient
 */
function filterByNutrient(fertilizers, nutrient, minPercent = 0) {
    return fertilizers.filter(fert => {
        const percent = fert[nutrient.toLowerCase()] || 0;
        return percent >= minPercent;
    });
}

/**
 * Filter fertilizers by preference
 */
function filterByPreference(fertilizers, preferences) {
    return fertilizers.filter(fert => {
        const pref = checkPreference(fert.name, preferences);
        return pref !== 'Reject';
    });
}

/**
 * Get fertilizer by name
 */
function getFertilizerByName(name) {
    if (!fertilizerCatalog) {
        throw new Error('Fertilizer catalog not initialized');
    }
    
    return fertilizerCatalog.all.find(f => 
        f.name.toLowerCase() === name.toLowerCase() ||
        f.displayName.toLowerCase() === name.toLowerCase()
    );
}

/**
 * Get all single fertilizers
 */
function getSingleFertilizers() {
    if (!fertilizerCatalog) {
        throw new Error('Fertilizer catalog not initialized');
    }
    return fertilizerCatalog.single;
}

/**
 * Get all complex fertilizers
 */
function getComplexFertilizers() {
    if (!fertilizerCatalog) {
        throw new Error('Fertilizer catalog not initialized');
    }
    return fertilizerCatalog.complex;
}

/**
 * Get fertilizers by group
 */
function getFertilizersByGroup(group) {
    if (!fertilizerCatalog) {
        throw new Error('Fertilizer catalog not initialized');
    }
    return fertilizerCatalog.all.filter(f => f.group === group);
}

/**
 * Get fertilizers by tag
 */
function getFertilizersByTag(tag) {
    if (!fertilizerCatalog) {
        throw new Error('Fertilizer catalog not initialized');
    }
    return fertilizerCatalog.all.filter(f => f.tags.includes(tag));
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeFertilizerCatalog,
        classifyFertilizer,
        filterByStage,
        filterByNutrient,
        filterByPreference,
        getFertilizerByName,
        getSingleFertilizers,
        getComplexFertilizers,
        getFertilizersByGroup,
        getFertilizersByTag
    };
}






