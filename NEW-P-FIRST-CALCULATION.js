// NEW P-FIRST CALCULATION LOGIC
// This is the core function that implements the new P-first recommendation logic

/**
 * Calculate fertilizer recommendation for a single stage using P-first approach
 * 
 * @param {number} stageIndex - Stage index (0=Basal, 1=Tillering, 2=Panicle, etc.)
 * @param {number} stagePRequired - P requirement for this stage (kg/acre)
 * @param {number} stageNRequired - N requirement for this stage (kg/acre)
 * @param {number} stageKRequired - K requirement for this stage (kg/acre)
 * @param {string} pStatus - P status: 'low', 'medium', 'high'
 * @param {string} nStatus - N status: 'low', 'medium', 'high'
 * @param {string} kStatus - K status: 'low', 'medium', 'high'
 * @param {object} preferences - Fertilizer preferences
 * @param {string} sStatus - S status
 * @param {string} phStatus - pH status
 * @param {object} locationRec - Location recommendations
 * @param {object} cropData - Crop data with splits
 * @param {string} stageName - Stage name (e.g., "Basal", "at Tillering")
 * @returns {object} Stage recommendation with fertilizers
 */
function calculateStagePFirst(stageIndex, stagePRequired, stageNRequired, stageKRequired,
                               pStatus, nStatus, kStatus, preferences, sStatus, phStatus,
                               locationRec, cropData, stageName) {
    const stage = {
        stage: stageName,
        fertilizers: []
    };
    
    let remainingN = stageNRequired;
    let remainingK = stageKRequired;
    let deliveredP = 0;
    let deliveredN = 0;
    let deliveredK = 0;
    
    // STEP 1: Select complex fertilizer for P (P-FIRST APPROACH)
    // Based on P status: LOW = high-P fertilizers, MEDIUM = balanced, HIGH = low-P or P-free
    let pFertilizer = null;
    let pFertilizerKgs = 0;
    let pFertilizerNutrients = { n: 0, p: 0, k: 0, s: 0 };
    
    if (stagePRequired > 0 && stageIndex < 2) { // P only at Basal and Tillering, not Stage 3+
        // Select fertilizer based on P status
        if (pStatus === 'low') {
            // LOW P: Use high-P fertilizers (SSP, 14-35-14, DAP)
            // Prefer complex fertilizers for bonus N/K
            const candidates = [];
            
            // Try 14-35-14 (high P, provides N and K)
            if (checkPreference('14-35-14', preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(stagePRequired, '14-35-14', pStatus, locationRec);
                    const rounded = roundToBagPrecise(kgs, 50, true); // Round UP for P
                    const nutrients = getNutrientsFromGromor(rounded.kgs, '14-35-14');
                    const excessP = Math.max(0, nutrients.p - stagePRequired);
                    const score = (excessP * 2.0) - (nutrients.n * 0.2) - (nutrients.k * 0.15);
                    candidates.push({ product: '14-35-14', method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {}
            }
            
            // Try SSP (precise P, no N/K)
            if (checkPreference('SSP', preferences) !== 'Reject' && stageIndex === 0) { // SSP only at basal
                try {
                    const sspKgs = (stagePRequired / 16) * 100;
                    const rounded = roundToBagPrecise(sspKgs, 50, true);
                    const actualP = (rounded.kgs * 16) / 100;
                    const excessP = Math.max(0, actualP - stagePRequired);
                    const score = excessP * 2.0;
                    candidates.push({ product: 'SSP', method: 'straight', score, kgs: rounded.kgs, 
                                     nutrients: { n: 0, p: actualP, k: 0, s: (rounded.kgs * 12) / 100 } });
                } catch (e) {}
            }
            
            // Try 28-28-0 (balanced, provides N)
            if (checkPreference('28-28-0', preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(stagePRequired, '28-28-0', pStatus, locationRec);
                    const rounded = roundToBagPrecise(kgs, 50, true);
                    const nutrients = getNutrientsFromGromor(rounded.kgs, '28-28-0');
                    const excessP = Math.max(0, nutrients.p - stagePRequired);
                    const score = (excessP * 2.0) - (nutrients.n * 0.2);
                    candidates.push({ product: '28-28-0', method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {}
            }
            
            // Select best candidate (lowest score = best)
            if (candidates.length > 0) {
                candidates.sort((a, b) => a.score - b.score);
                const best = candidates[0];
                pFertilizer = best;
                pFertilizerKgs = best.kgs;
                pFertilizerNutrients = best.nutrients;
            }
            
        } else if (pStatus === 'medium') {
            // MEDIUM P: Use balanced fertilizers (28-28-0, 20-20-0-13)
            const candidates = [];
            
            // Try 28-28-0
            if (checkPreference('28-28-0', preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(stagePRequired, '28-28-0', pStatus, locationRec);
                    const rounded = roundToBagPrecise(kgs, 50, true);
                    const nutrients = getNutrientsFromGromor(rounded.kgs, '28-28-0');
                    const excessP = Math.max(0, nutrients.p - stagePRequired);
                    const score = (excessP * 2.0) - (nutrients.n * 0.2);
                    candidates.push({ product: '28-28-0', method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {}
            }
            
            // Try 20-20-0-13 (for stage 2)
            if (stageIndex === 1 && checkPreference('20-20-0-13', preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(stagePRequired, '20-20-0-13', pStatus, locationRec);
                    const rounded = roundToBagPrecise(kgs, 50, true);
                    const nutrients = getNutrientsFromGromor(rounded.kgs, '20-20-0-13');
                    const excessP = Math.max(0, nutrients.p - stagePRequired);
                    const score = (excessP * 2.0) - (nutrients.n * 0.2);
                    candidates.push({ product: '20-20-0-13', method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {}
            }
            
            if (candidates.length > 0) {
                candidates.sort((a, b) => a.score - b.score);
                const best = candidates[0];
                pFertilizer = best;
                pFertilizerKgs = best.kgs;
                pFertilizerNutrients = best.nutrients;
            }
            
        } else if (pStatus === 'high') {
            // HIGH P: Use P-free or low-P fertilizers
            // If stage needs P, use minimal low-P fertilizer, otherwise skip P
            if (stagePRequired > 0) {
                // Try low-P fertilizers only
                if (checkPreference('16-20-0-13', preferences) !== 'Reject') {
                    try {
                        const kgs = convertP2O5ToGromorDirect(stagePRequired, '16-20-0-13', pStatus, locationRec);
                        const rounded = roundToBagPrecise(kgs, 50, true);
                        const nutrients = getNutrientsFromGromor(rounded.kgs, '16-20-0-13');
                        pFertilizer = { product: '16-20-0-13', method: 'gromor', kgs: rounded.kgs, nutrients };
                        pFertilizerKgs = rounded.kgs;
                        pFertilizerNutrients = nutrients;
                    } catch (e) {}
                }
            }
            // If no P fertilizer selected, we'll skip P (soil already has high P)
        }
        
        // Add P fertilizer to stage if selected
        if (pFertilizer) {
            const fertilizerName = pFertilizer.method === 'gromor' 
                ? `Gromor ${pFertilizer.product}` 
                : pFertilizer.product;
            
            const bagSize = pFertilizer.product === 'SSP' ? 50 : 50; // All non-Urea = 50kg
            const bags = pFertilizerKgs / bagSize;
            
            stage.fertilizers.push({
                name: fertilizerName,
                kgs: pFertilizerKgs,
                bags: bags,
                fullBags: Math.floor(bags),
                remainder: pFertilizerKgs % bagSize,
                nContributed: pFertilizerNutrients.n,
                pContributed: pFertilizerNutrients.p,
                kContributed: pFertilizerNutrients.k,
                sContributed: pFertilizerNutrients.s || 0
            });
            
            deliveredP += pFertilizerNutrients.p;
            deliveredN += pFertilizerNutrients.n;
            deliveredK += pFertilizerNutrients.k;
            
            // Adjust remaining N and K
            remainingN = Math.max(0, stageNRequired - pFertilizerNutrients.n);
            remainingK = Math.max(0, stageKRequired - pFertilizerNutrients.k);
        }
    }
    
    // STEP 2: Top up N with Urea (if needed)
    if (remainingN > 0 && stage.fertilizers.length < 3) { // Max 3 products per stage
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
        if (nFertilizer) {
            const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
            const bagSize = nFertilizer === 'Urea' ? 45 : 50; // Urea = 45kg, others = 50kg
            const rounded = roundToBagPrecise(nKgs, bagSize, true); // Round UP for N
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            
            stage.fertilizers.push({
                name: nFertilizer,
                kgs: rounded.kgs,
                bags: rounded.bags,
                fullBags: rounded.fullBags,
                remainder: rounded.remainder,
                nContributed: actualNutrients.n,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k || 0
            });
            
            deliveredN += actualNutrients.n;
            remainingN = Math.max(0, remainingN - actualNutrients.n);
        }
    }
    
    // STEP 3: Top up K with MOP/SOP (if needed and threshold allows)
    // K threshold rule: If complex fertilizer already provides 35-40% of stage K, don't add MOP
    const kFromComplex = deliveredK;
    const kPercentFromComplex = stageKRequired > 0 ? (kFromComplex / stageKRequired) * 100 : 0;
    
    if (remainingK > 0 && kPercentFromComplex < 35 && stage.fertilizers.length < 3) {
        const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
            const bagSize = 50; // K fertilizers = 50kg
            const rounded = roundToBagPrecise(kKgs, bagSize, false); // Round to nearest for K
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
            
            stage.fertilizers.push({
                name: kFertilizer,
                kgs: rounded.kgs,
                bags: rounded.bags,
                fullBags: rounded.fullBags,
                remainder: rounded.remainder,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            });
            
            deliveredK += actualNutrients.k;
        }
    }
    
    // Calculate totals
    const totalN = deliveredN;
    const totalP = deliveredP;
    const totalK = deliveredK;
    
    return {
        stage: stage,
        deliveredN: totalN,
        deliveredP: totalP,
        deliveredK: totalK,
        remainingN: Math.max(0, stageNRequired - totalN),
        remainingP: Math.max(0, stagePRequired - totalP),
        remainingK: Math.max(0, stageKRequired - totalK)
    };
}











