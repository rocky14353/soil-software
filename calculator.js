window.classifyNitrogenByOC = function classifyNitrogenByOC(organicCarbon, nitrogen) {
    // Priority: Use Nitrogen value if provided, otherwise use Organic Carbon
    if (nitrogen !== null && nitrogen !== undefined && !isNaN(nitrogen) && nitrogen > 0) {
        // Classify based on Nitrogen value (kg/acre)
        // Thresholds: Low < 113, Medium 113-226, High > 226
        if (nitrogen < 113) return 'low';
        if (nitrogen <= 226) return 'medium';
        return 'high';
    }
    
    // Fall back to Organic Carbon if Nitrogen not available
    if (organicCarbon < 0.5) return 'low';
    if (organicCarbon <= 0.75) return 'medium';
    return 'high';
}

window.classifyPhosphorus = function classifyPhosphorus(p2o5) {
    if (p2o5 < 10) return 'low';
    if (p2o5 <= 24) return 'medium';
    return 'high';
}

window.classifyPotassium = function classifyPotassium(k2o) {
    if (k2o < 58) return 'low';
    if (k2o <= 138) return 'medium';
    return 'high';
}

window.classifySulfur = function classifySulfur(sulfur) {
    if (!sulfur || sulfur < 10) return 'low';
    if (sulfur <= 15) return 'medium';
    return 'high';
}

window.classifyPh = function classifyPh(ph) {
    if (!ph || ph === 0) return null;
    
    if (ph <= 5.5) return 'stronglyAcidic';
    if (ph >= 5.6 && ph <= 6.0) return 'mediumAcidic';
    if (ph >= 6.1 && ph <= 6.5) return 'slightlyAcidic';
    if (ph >= 6.6 && ph <= 7.3) return 'neutral';
    if (ph >= 7.4 && ph <= 7.8) return 'slightlyAlkaline';
    if (ph >= 7.9 && ph <= 8.4) return 'moderatelyAlkaline';
    if (ph >= 8.5) return 'highlyAlkaline';
    
    return null;
}

window.classifyEC = function classifyEC(ec) {
    if (!ec || ec === 0) return null;
    if (ec < 0.5) return 'low';
    if (ec <= 2.0) return 'medium';
    return 'high';
}

window.classifyCalcium = function classifyCalcium(ca) {
    if (!ca || ca === 0) return null;
    if (ca < 2.0) return 'deficiency';
    return 'sufficiency';
}

window.classifyMagnesium = function classifyMagnesium(mg) {
    if (!mg || mg === 0) return null;
    if (mg < 1.0) return 'deficiency';
    return 'sufficiency';
}

window.classifyZinc = function classifyZinc(zn) {
    if (!zn || zn === 0) return null;
    if (zn < 1.5) return 'deficiency';
    return 'sufficiency';
}

window.classifyBoron = function classifyBoron(boron) {
    if (!boron || boron === 0) return null;
    if (boron < 0.5) return 'deficiency';
    return 'sufficiency';
}

window.classifyManganese = function classifyManganese(mn) {
    if (!mn || mn === 0) return null;
    if (mn < 2.0) return 'deficiency';
    return 'sufficiency';
}

window.classifyIron = function classifyIron(fe) {
    if (!fe || fe === 0) return null;
    if (fe < 4.5) return 'deficiency';
    return 'sufficiency';
}

window.classifyCopper = function classifyCopper(cu) {
    if (!cu || cu === 0) return null;
    if (cu < 0.3) return 'deficiency';
    return 'sufficiency';
}

window.classifyMolybdenum = function classifyMolybdenum(mo) {
    if (!mo || mo === 0) return null;
    if (mo < 0.15) return 'deficiency';
    return 'sufficiency';
}

window.classifyChlorine = function classifyChlorine(cl) {
    if (!cl || cl === 0) return null;
    if (cl < 20) return 'deficiency';
    return 'sufficiency';
}

window.getPhRecommendations = function getPhRecommendations(phClassification) {
    if (!phClassification) return null;
    
    const recommendations = {
        stronglyAcidic: {
            title: "Strongly Acidic Soil (pH ≤ 5.5)",
            advisory: "Apply agricultural lime (CaCO3) to raise pH. Recommended: 2-4 tons/acre of lime before planting. Consider using basic fertilizers like Calcium Ammonium Nitrate (C.A.N).",
            priority: "high"
        },
        mediumAcidic: {
            title: "Medium Acidic Soil (pH 5.6-6.0)",
            advisory: "Moderate liming recommended: 1-2 tons/acre of lime. Consider using neutral or basic fertilizers.",
            priority: "medium"
        },
        slightlyAcidic: {
            title: "Slightly Acidic Soil (pH 6.1-6.5)",
            advisory: "Optimal for most crops. Minor liming may be beneficial: 0.5-1 ton/acre if needed.",
            priority: "low"
        },
        neutral: {
            title: "Neutral Soil (pH 6.6-7.3)",
            advisory: "Optimal pH range for most crops. No pH correction needed. Continue regular fertilization practices.",
            priority: "none"
        },
        slightlyAlkaline: {
            title: "Slightly Alkaline Soil (pH 7.4-7.8)",
            advisory: "Generally acceptable for most crops. Monitor for micronutrient availability. Consider using acid-forming fertilizers if needed.",
            priority: "low"
        },
        moderatelyAlkaline: {
            title: "Moderately Alkaline Soil (pH 7.9-8.4)",
            advisory: "Apply gypsum (CaSO4) or sulfur to lower pH if needed: 1-2 tons/acre. Use acid-forming fertilizers. Monitor micronutrient deficiencies (especially Fe, Zn, Mn).",
            priority: "medium"
        },
        highlyAlkaline: {
            title: "Highly Alkaline Soil (pH ≥ 8.5)",
            advisory: "Problematic soil. Apply gypsum (2-4 tons/acre) or elemental sulfur before planting. Use acid-forming fertilizers. Expect micronutrient deficiencies - consider foliar applications of Fe, Zn, Mn. Consider soil amendments and organic matter addition.",
            priority: "high"
        }
    };
    
    return recommendations[phClassification] || null;
}

window.getCropKey = function getCropKey(crop, season) {
    if (crop.toLowerCase().includes('paddy')) {
        return season === 'Kharif' ? 'PADDY-KHARIF' : 'PADDY-RABI';
    }
    return crop.toUpperCase().replace(/\s+/g, '-');
}

window.getLocationBasedRecommendation = function getLocationBasedRecommendation(crop, season, location, fieldType, nStatus, pStatus, kStatus) {
    const cropKey = getCropKey(crop, season);
    
    // Try to find in location-crop-recommendations
    if (locationCropRecommendations[cropKey] && locationCropRecommendations[cropKey][location]) {
        const rec = locationCropRecommendations[cropKey][location];
        return {
            n: rec.nStatus[nStatus] || rec.normal.n,
            p: rec.pStatus[pStatus] || rec.normal.p,
            k: rec.kStatus[kStatus] || rec.normal.k,
            gromorByPStatus: rec.gromorByPStatus
        };
    }
    
    // Try fieldType-based lookup (works for MAIZE which has fieldType keys)
    const ftKey = (fieldType || 'Irrigated').toLowerCase();
    if (locationCropRecommendations[cropKey] && locationCropRecommendations[cropKey][ftKey]) {
        const rec = locationCropRecommendations[cropKey][ftKey];
        if (rec.nStatus || rec.pStatus || rec.kStatus) {
            return {
                n: rec.nStatus[nStatus] || rec.normal.n,
                p: rec.pStatus[pStatus] || rec.normal.p,
                k: rec.kStatus[kStatus] || rec.normal.k,
                gromorByPStatus: rec.gromorByPStatus
            };
        }
    }
    
    // Fallback to crop master data
    const cropData = getCropData(crop, season, fieldType);
    if (cropData) {
        return {
            n: cropData.n,
            p: cropData.p,
            k: cropData.k,
            gromorByPStatus: null
        };
    }
    
    return null;
}

window.classifyNutrient = function classifyNutrient(value, nutrient) {
    const thresholds = {
        nitrogen: { low: 150, high: 400 },
        phosphorus: { low: 12, high: 35 },
        potassium: { low: 80, high: 250 }
    };
    
    const threshold = thresholds[nutrient.toLowerCase()];
    if (!threshold) return 'medium';
    
    if (value < threshold.low) return 'low';
    if (value > threshold.high) return 'high';
    return 'medium';
}

window.interpolateFromTable = function interpolateFromTable(table, value, key) {
    if (!table || table.length === 0) return 0;
    
    // Find exact match or interpolate
    for (let i = 0; i < table.length; i++) {
        if (table[i][key] >= value) {
            if (i === 0) return table[0].dose || table[0].qty || 0;
            
            // Interpolate between previous and current
            const prev = table[i - 1];
            const curr = table[i];
            const prevVal = prev[key];
            const currVal = curr[key];
            const prevDose = prev.dose || prev.qty || 0;
            const currDose = curr.dose || curr.qty || 0;
            
            if (currVal === prevVal) return currDose;
            
            const ratio = (value - prevVal) / (currVal - prevVal);
            return prevDose + (currDose - prevDose) * ratio;
        }
    }
    
    // Extrapolate from last value
    const last = table[table.length - 1];
    const factor = value / last[key];
    return (last.dose || last.qty || 0) * factor;
}

window.selectP2O5Fertilizer = function selectP2O5Fertilizer(p2o5Kgs, stage, preferences, pStatus, locationRec) {
    const isBasal = stage === 'Basal' || stage.toLowerCase().includes('basal');
    const isFinal = stage === 'Final' || stage.toLowerCase().includes('final');
    
    // Evaluate all available fertilizers and pick the one with least excess
    const candidates = [];
    
    // For Final stage, prefer SSP (most precise for small deficits)
    if (isFinal) {
        if (checkPreference('SSP', preferences) !== 'Reject') {
            try {
                const sspKgs = (p2o5Kgs / 16) * 100; // SSP has 16% P
                const rounded = roundToBagUp(sspKgs, 50); // Round UP for final rebalancing
                const actualP = (rounded.kgs * 16) / 100;
                const excessP = Math.max(0, actualP - p2o5Kgs);
                const score = excessP * 2.0; // SSP is very precise
                candidates.push({ product: 'SSP', method: 'straight', score, kgs: rounded.kgs, nutrients: { n: 0, p: actualP, k: 0, s: (rounded.kgs * 12) / 100 } });
            } catch (e) {
                // Skip if calculation fails
            }
        }
        // Also consider Gromor products for Final stage
        const gromorOptions = ['14-35-14', '28-28-0', '20-20-0-13', '16-20-0-13'];
        for (const product of gromorOptions) {
            if (checkPreference(product, preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(p2o5Kgs, product, pStatus, locationRec);
                    const rounded = roundToBagUp(kgs, 50); // Round UP for final rebalancing
                    const nutrients = getNutrientsFromGromor(rounded.kgs, product);
                    const actualP = nutrients.p;
                    const excessP = Math.max(0, actualP - p2o5Kgs);
                    const bonusN = nutrients.n;
                    const bonusK = nutrients.k;
                    const score = (excessP * 2.0) - (bonusN * 0.2) - (bonusK * 0.15);
                    candidates.push({ product, method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {
                    // Skip if conversion fails
                }
            }
        }
    } else if (isBasal) {
        // Basal: Evaluate high P fertilizers and SSP
        const gromorOptions = ['14-35-14', '28-28-0', '10-26-26'];
        for (const product of gromorOptions) {
            if (checkPreference(product, preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(p2o5Kgs, product, pStatus, locationRec);
                    const rounded = roundToBag(kgs);
                    const nutrients = getNutrientsFromGromor(rounded.kgs, product);
                    const actualP = nutrients.p;
                    const excessP = Math.max(0, actualP - p2o5Kgs);
                    const bonusN = nutrients.n; // Bonus N from complex fertilizer
                    const bonusK = nutrients.k; // Bonus K from complex fertilizer
                    // Score: lower is better (prefer less excess P, but bonus for N/K)
                    // Penalize excess P more, reward bonus N/K less
                    const score = (excessP * 2.0) - (bonusN * 0.2) - (bonusK * 0.15);
                    candidates.push({ product, method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {
                    // Skip if conversion fails
                }
            }
        }
        
        // Evaluate SSP (exclusive P, no N/K bonus but very precise)
        if (checkPreference('SSP', preferences) !== 'Reject') {
            try {
                const sspKgs = (p2o5Kgs / 16) * 100; // SSP has 16% P
                const rounded = roundToBag(sspKgs);
                const actualP = (rounded.kgs * 16) / 100;
                const excessP = Math.max(0, actualP - p2o5Kgs);
                // SSP is very precise, score based on excess only (no bonus N/K)
                const score = excessP * 2.0; // Same penalty weight as Gromor
                candidates.push({ product: 'SSP', method: 'straight', score, kgs: rounded.kgs, nutrients: { n: 0, p: actualP, k: 0, s: (rounded.kgs * 12) / 100 } });
            } catch (e) {
                // Skip if calculation fails
            }
        }
    } else {
        // 2nd Stage: Evaluate low P fertilizers (SSP excluded - powder form, difficult to apply)
        const gromorOptions = ['20-20-0-13', '16-20-0-13', '28-28-0'];
        for (const product of gromorOptions) {
            if (checkPreference(product, preferences) !== 'Reject') {
                try {
                    const kgs = convertP2O5ToGromorDirect(p2o5Kgs, product, pStatus, locationRec);
                    const rounded = roundToBag(kgs);
                    const nutrients = getNutrientsFromGromor(rounded.kgs, product);
                    const actualP = nutrients.p;
                    const excessP = Math.max(0, actualP - p2o5Kgs);
                    const bonusN = nutrients.n; // Bonus N from complex fertilizer
                    const bonusK = nutrients.k; // Bonus K from complex fertilizer
                    // Score: lower is better (prefer less excess P, but bonus for N/K)
                    const score = (excessP * 2.0) - (bonusN * 0.2) - (bonusK * 0.15);
                    candidates.push({ product, method: 'gromor', score, kgs: rounded.kgs, nutrients });
                } catch (e) {
                    // Skip if conversion fails
                }
            }
        }
    }
    
    // Select candidate with best (lowest) score
    if (candidates.length > 0) {
        candidates.sort((a, b) => a.score - b.score);
        const best = candidates[0];
        return { product: best.product, method: best.method };
    }
    
    // Fallback to original logic if no candidates
    if (isBasal) {
        if (checkPreference('14-35-14', preferences) !== 'Reject') {
            return { product: '14-35-14', method: 'gromor' };
        }
        if (checkPreference('SSP', preferences) !== 'Reject') {
            return { product: 'SSP', method: 'straight' };
        }
        if (checkPreference('28-28-0', preferences) !== 'Reject') {
            return { product: '28-28-0', method: 'gromor' };
        }
    } else {
        if (checkPreference('20-20-0-13', preferences) !== 'Reject') {
            return { product: '20-20-0-13', method: 'gromor' };
        }
        if (checkPreference('16-20-0-13', preferences) !== 'Reject') {
            return { product: '16-20-0-13', method: 'gromor' };
        }
        if (checkPreference('28-28-0', preferences) !== 'Reject') {
            return { product: '28-28-0', method: 'gromor' };
        }
    }
    
    // Final fallback
    return { product: '28-28-0', method: 'gromor' };
}

window.convertP2O5ToGromor = function convertP2O5ToGromor(p2o5Kgs, product) {
    const table = fertilizerConversion.p2o5ToGromor[product];
    if (!table) {
        // Fallback calculation
        const productData = fertilizerConversion.fertilizerProducts[product];
        if (!productData || productData.p === 0) return 0;
        return (p2o5Kgs / productData.p) * 100;
    }
    
    return interpolateFromTable(table, p2o5Kgs, 'p2o5');
}

window.getNutrientsFromGromor = function getNutrientsFromGromor(doseKgs, product) {
    const productData = fertilizerConversion.fertilizerProducts[product];
    if (!productData) return { n: 0, p: 0, k: 0 };
    
    return {
        n: (doseKgs * productData.n) / 100,
        p: (doseKgs * productData.p) / 100,
        k: (doseKgs * productData.k) / 100
    };
}

window.getNutrientsFromStraight = function getNutrientsFromStraight(fertilizerKgs, fertilizer) {
    const fertName = fertilizer.toLowerCase();
    
    // First try to get from fertilizerProducts (preferred method)
    const productData = fertilizerConversion.fertilizerProducts[fertName];
    if (productData) {
        return {
            n: (fertilizerKgs * productData.n) / 100,
            p: (fertilizerKgs * productData.p) / 100,
            k: (fertilizerKgs * productData.k) / 100,
            s: productData.s ? (fertilizerKgs * productData.s) / 100 : 0
        };
    }
    
    // Fallback to hardcoded values for backward compatibility (should not be needed)
    // N fertilizers
    if (fertName === 'urea') {
        return { n: (fertilizerKgs * 46) / 100, p: 0, k: 0 };
    } else if (fertName === 'as' || fertName === 'a.s') {
        return { n: (fertilizerKgs * 21) / 100, p: 0, k: 0, s: (fertilizerKgs * 24) / 100 };
    } else if (fertName === 'can' || fertName === 'c.a.n') {
        return { n: (fertilizerKgs * 25) / 100, p: 0, k: 0 };
    }
    // K fertilizers
    else if (fertName === 'mop') {
        return { n: 0, p: 0, k: (fertilizerKgs * 60) / 100 };
    } else if (fertName === 'sop') {
        return { n: 0, p: 0, k: (fertilizerKgs * 50) / 100, s: (fertilizerKgs * 18) / 100 };
    }
    // P fertilizers
    else if (fertName === 'ssp') {
        return { n: 0, p: (fertilizerKgs * 16) / 100, k: 0, s: (fertilizerKgs * 12) / 100 };
    } else if (fertName === 'dap' || fertName === '18-46-0') {
        // DAP: 18% N, 46% P2O5
        return { n: (fertilizerKgs * 18) / 100, p: (fertilizerKgs * 46) / 100, k: 0 };
    }
    
    return { n: 0, p: 0, k: 0 };
}

window.convertNToStraight = function convertNToStraight(nKgs, fertilizer) {
    const fertKey = fertilizer.toLowerCase().replace(/\./g, ''); // normalize: A.S -> as
    const table = fertilizerConversion.nToStraight[fertKey];
    if (!table) {
        // Fallback calculation
        const factor = fertilizerConversion.conversionFactors[fertKey];
        return nKgs * (factor || 2.2);
    }
    
    return interpolateFromTable(table, nKgs, 'n');
}

window.convertK2OToStraight = function convertK2OToStraight(k2oKgs, fertilizer) {
    const table = fertilizerConversion.k2oToStraight[fertilizer];
    if (!table) {
        // Fallback calculation
        const factor = fertilizerConversion.conversionFactors[fertilizer];
        return k2oKgs * (factor || 1.7);
    }
    
    return interpolateFromTable(table, k2oKgs, 'k2o');
}

window.roundToBagPrecise = function roundToBagPrecise(kgs, bagSize = 50, roundUp = false) {
    // Return exact quantity — no rounding to bag sizes
    // The output will tell the farmer the exact kg and approximate bag fraction
    const bags = kgs / bagSize;
    const displayKgs = Math.round(kgs * 10) / 10; // Round to 1 decimal for display
    return {
        kgs: kgs,                          // Exact kg (no rounding)
        bags: bags,
        fullBags: Math.floor(bags),         // Integer bags
        remainder: kgs % bagSize,
        label: `${displayKgs} kg (~${bags.toFixed(2)} bags)`,  // Show exact + bag fraction
        original: kgs
    };
}

window.roundToBag = function roundToBag(kgs, bagSize = 50) {
    // Return exact quantity — no rounding to bag sizes
    // The farmer will be told the exact kg with fractional bag count
    if (kgs <= 0) return { kgs: 0, label: '0 kg', bags: 0, fullBags: 0, remainder: 0, original: kgs };
    const bags = kgs / bagSize;
    const displayKgs = Math.round(kgs * 10) / 10;
    return {
        kgs: kgs,
        label: `${displayKgs} kg (~${bags.toFixed(2)} bags)`,
        bags: bags,
        fullBags: Math.floor(bags),
        remainder: kgs % bagSize,
        original: kgs
    };
}

window.roundToBagUp = function roundToBagUp(kgs, bagSize = 45) {
    // Return exact quantity — no rounding to bag sizes
    // The farmer will be told the exact kg with fractional bag count
    if (kgs <= 0) return { kgs: 0, label: '0 kg', bags: 0, original: kgs };
    const bags = kgs / bagSize;
    const displayKgs = Math.round(kgs * 10) / 10;
    return {
        kgs: kgs,
        label: `${displayKgs} kg (~${bags.toFixed(2)} bags)`,
        bags: bags,
        fullBags: Math.floor(bags),
        remainder: kgs % bagSize,
        original: kgs
    };
}

window.roundToBagSmart = function roundToBagSmart(kgs, bagSize = 45, minRequired = null, tolerance = 0.10) {
    // No bag-size rounding needed — roundToBag returns exact quantities
    // The display handles the bag fraction for the farmer
    return roundToBag(kgs, bagSize);
}

window.checkPreference = function checkPreference(fertilizer, preferences) {
    const prefKey = `pref_${fertilizer}`;
    const pref = preferences[prefKey] || 'Optional';
    return pref;
}

window.fertilizerContainsSulfur = function fertilizerContainsSulfur(fertilizer) {
    const sulfurFertilizers = ['A.S', 'SOP', '20-20-0-13', '16-20-0-13'];
    return sulfurFertilizers.includes(fertilizer) || fertilizer.includes('20-0-13') || fertilizer.includes('16-20-0');
}

window.fertilizerIsAcidifying = function fertilizerIsAcidifying(fertilizer) {
    const acidifyingFertilizers = ['Urea', 'A.S'];
    return acidifyingFertilizers.includes(fertilizer);
}

window.fertilizerIsNeutral = function fertilizerIsNeutral(fertilizer) {
    const neutralFertilizers = ['C.A.N'];
    return neutralFertilizers.includes(fertilizer);
}

window.shouldPreferFertilizerForS = function shouldPreferFertilizerForS(fertilizer, sStatus) {
    if (!sStatus) return true; // No preference if S status unknown
    
    const hasSulfur = fertilizerContainsSulfur(fertilizer);
    
    if (sStatus === 'low') {
        // Prefer sulfur-containing fertilizers if S is low
        return hasSulfur;
    } else if (sStatus === 'high') {
        // Avoid sulfur-containing fertilizers if S is high
        return !hasSulfur;
    }
    // Medium S: no preference
    return true;
}

window.shouldPreferFertilizerForPh = function shouldPreferFertilizerForPh(fertilizer, phStatus) {
    if (!phStatus) return true; // No preference if pH status unknown
    
    const isAcidifying = fertilizerIsAcidifying(fertilizer);
    const isNeutral = fertilizerIsNeutral(fertilizer);
    const hasSulfur = fertilizerContainsSulfur(fertilizer);
    
    // Acidic soils: prefer neutral/basic fertilizers
    if (phStatus === 'stronglyAcidic' || phStatus === 'mediumAcidic' || phStatus === 'slightlyAcidic') {
        if (isNeutral) return true; // Prefer C.A.N
        if (isAcidifying) return false; // Avoid Urea, A.S
    }
    
    // Alkaline soils: prefer acidifying and sulfur-containing fertilizers
    if (phStatus === 'moderatelyAlkaline' || phStatus === 'highlyAlkaline') {
        if (isAcidifying || hasSulfur) return true; // Prefer Urea, A.S, sulfur fertilizers
    }
    
    // Neutral and slightly alkaline: no strong preference
    return true;
}

window.shouldUseFertilizer = function shouldUseFertilizer(fertilizer, preferences, sStatus, phStatus) {
    // First check user preferences
    if (checkPreference(fertilizer, preferences) === 'Reject') return false;
    if (checkPreference(fertilizer, preferences) === 'Mandatory') return true;
    
    // Then check S status preference
    if (!shouldPreferFertilizerForS(fertilizer, sStatus)) {
        // Don't reject, but lower priority (only reject if user explicitly rejects)
        return false;
    }
    
    // Then check pH preference
    if (!shouldPreferFertilizerForPh(fertilizer, phStatus)) {
        // Don't reject, but lower priority
        return false;
    }
    
    return true;
}

window.selectNFertilizer = function selectNFertilizer(nRequired, preferences, sStatus, phStatus) {
    if (nRequired <= 0) return null;
    
    // Priority order based on S and pH
    const candidates = [];
    
    // If S is low, prefer A.S (contains 24% S)
    if (sStatus === 'low') {
        if (shouldUseFertilizer('A.S', preferences, sStatus, phStatus)) {
            candidates.push({name: 'A.S', priority: 1});
        }
    }
    
    // If pH is acidic, prefer C.A.N (neutral, less acidifying)
    if (phStatus === 'stronglyAcidic' || phStatus === 'mediumAcidic' || phStatus === 'slightlyAcidic') {
        if (shouldUseFertilizer('C.A.N', preferences, sStatus, phStatus)) {
            candidates.push({name: 'C.A.N', priority: 1});
        }
    }
    
    // If pH is alkaline, prefer Urea or A.S (acid-forming)
    if (phStatus === 'moderatelyAlkaline' || phStatus === 'highlyAlkaline') {
        if (shouldUseFertilizer('Urea', preferences, sStatus, phStatus)) {
            candidates.push({name: 'Urea', priority: 1});
        }
        if (shouldUseFertilizer('A.S', preferences, sStatus, phStatus)) {
            candidates.push({name: 'A.S', priority: 1});
        }
    }
    
    // Default to Urea if no specific preference
    if (shouldUseFertilizer('Urea', preferences, sStatus, phStatus)) {
        candidates.push({name: 'Urea', priority: 2});
    }
    if (shouldUseFertilizer('C.A.N', preferences, sStatus, phStatus)) {
        candidates.push({name: 'C.A.N', priority: 2});
    }
    if (shouldUseFertilizer('A.S', preferences, sStatus, phStatus)) {
        candidates.push({name: 'A.S', priority: 2});
    }
    
    // Select highest priority candidate
    if (candidates.length > 0) {
        candidates.sort((a, b) => a.priority - b.priority);
        return candidates[0].name;
    }
    
    return 'Urea'; // Fallback
}

window.selectKFertilizer = function selectKFertilizer(kRequired, preferences, sStatus, phStatus) {
    if (kRequired <= 0) return null;
    
    // If S is low, prefer SOP (contains 18% S) to supply sulfur
    if (sStatus === 'low' && shouldUseFertilizer('SOP', preferences, sStatus, phStatus)) {
        return 'SOP';
    }
    
    // Default to MOP (cheaper, higher K concentration 60% vs 50%)
    if (shouldUseFertilizer('MOP', preferences, sStatus, phStatus)) {
        return 'MOP';
    }
    if (shouldUseFertilizer('SOP', preferences, sStatus, phStatus)) {
        return 'SOP';
    }
    
    return 'MOP'; // Fallback
}

window.selectNFertilizerForSingleNutrientTopUp = function selectNFertilizerForSingleNutrientTopUp(nRequired, preferences, sStatus, phStatus, isSingleNutrientMode) {
    if (nRequired <= 0) return null;
    
    // In single-nutrient top-up mode, prefer Urea first
    if (isSingleNutrientMode) {
        if (shouldUseFertilizer('Urea', preferences, sStatus, phStatus)) {
            return 'Urea';
        }
        // Fallback to existing logic if Urea unavailable
    }
    
    // Use existing logic for non-single-nutrient mode or if Urea unavailable
    return selectNFertilizer(nRequired, preferences, sStatus, phStatus);
}

window.selectPFertilizerForSingleNutrientTopUp = function selectPFertilizerForSingleNutrientTopUp(pRequired, preferences, stageIndex, originalStageN, deliveredN, isSingleNutrientMode) {
    if (pRequired <= 0) return null;
    
    // In single-nutrient top-up mode, prefer SSP first
    if (isSingleNutrientMode) {
        // Prefer SSP first
        if (checkPreference('SSP', preferences) !== 'Reject') {
            return 'SSP';
        }
        
        // Fallback to DAP if SSP unavailable, but check N constraint
        if (checkPreference('DAP', preferences) !== 'Reject' || checkPreference('18-46-0', preferences) !== 'Reject') {
            // DAP contributes N (18%), so check if it would violate stage N cap
            // Estimate: pRequired kg P needs (pRequired / 46) * 100 kg DAP
            // This contributes (pRequired / 46) * 100 * 0.18 = pRequired * 18/46 ≈ pRequired * 0.39 kg N
            const estimatedDAPKgs = (pRequired / 46) * 100;
            const estimatedNFromDAP = (estimatedDAPKgs * 18) / 100;
            const totalNAfterDAP = deliveredN + estimatedNFromDAP;
            
            // Check if DAP's N contribution would violate stage cap (with 12% tolerance)
            if (totalNAfterDAP <= originalStageN * 1.12) {
                return 'DAP';
            } else {
                console.log(`[Single-Nutrient P Top-Up] DAP rejected - would exceed stage N cap (${totalNAfterDAP.toFixed(2)} > ${(originalStageN * 1.12).toFixed(2)})`);
            }
        }
        
        // If both SSP and DAP unavailable/invalid, return null (will use existing fallback)
        return null;
    }
    
    // Non-single-nutrient mode: use SSP as default
    if (checkPreference('SSP', preferences) !== 'Reject') {
        return 'SSP';
    }
    
    return null;
}

window.selectKFertilizerForSingleNutrientTopUp = function selectKFertilizerForSingleNutrientTopUp(kRequired, preferences, sStatus, phStatus, isSingleNutrientMode) {
    if (kRequired <= 0) return null;
    
    // In single-nutrient top-up mode, prefer MOP first, then SOP
    if (isSingleNutrientMode) {
        // Prefer MOP first
        if (shouldUseFertilizer('MOP', preferences, sStatus, phStatus)) {
            return 'MOP';
        }
        
        // Fallback to SOP if MOP unavailable
        if (shouldUseFertilizer('SOP', preferences, sStatus, phStatus)) {
            return 'SOP';
        }
        
        // If both unavailable, return null (will use existing fallback)
        return null;
    }
    
    // Use existing logic for non-single-nutrient mode
    return selectKFertilizer(kRequired, preferences, sStatus, phStatus);
}

window.getCropData = function getCropData(cropName, season, fieldType) {
    const crop = cropsData[cropName];
    if (!crop) return null;
    
    const fieldTypeKey = (fieldType || 'Irrigated').toLowerCase();
    const seasonKey = (season || 'Rabi').toLowerCase();
    
    return crop[fieldTypeKey]?.[seasonKey] || crop[fieldTypeKey]?.['rabi'] || null;
}

window.calculateConstrainedQuantity = function calculateConstrainedQuantity(fertilizerName, stagePRequired, stageNRequired, stageKRequired,
                                     stageIndex, pStatus, locationRec) {
    // Get fertilizer composition
    const productData = fertilizerConversion.fertilizerProducts[fertilizerName];
    if (!productData) {
        console.warn(`[Multi-Constraint] Fertilizer ${fertilizerName} not found in fertilizerProducts`);
        return null;
    }
    
    // 1. Check stage restrictions
    if (stageIndex === 1 && productData.k > 0) {
        console.log(`[Multi-Constraint] Rejecting ${fertilizerName}: K not allowed in Tillering stage (K=${productData.k}%)`);
        return null; // K not allowed in Tillering
    }
    if (stageIndex === 2 && productData.p > 0) {
        console.log(`[Multi-Constraint] Rejecting ${fertilizerName}: P not allowed in Panicle stage (P=${productData.p}%)`);
        return null; // P not allowed in Panicle
    }
    
    // 2. Calculate quantity limits from each nutrient
    const quantityFromP = convertP2O5ToGromorDirect(stagePRequired, fertilizerName, pStatus, locationRec);
    
    // STRICT: Calculate MAXIMUM quantity allowed from N limit (N must NOT exceed stageNRequired)
    let quantityFromN = Infinity;
    if (productData.n > 0 && stageNRequired > 0) {
        quantityFromN = (stageNRequired / productData.n) * 100;
    }
    
    // STRICT: Calculate MAXIMUM quantity allowed from K limit
    let quantityFromK = Infinity;
    if (productData.k > 0 && stageKRequired > 0 && stageIndex !== 1) {
        quantityFromK = (stageKRequired / productData.k) * 100;
    }
    
    // 3. Find minimum valid quantity (must satisfy ALL constraints - N is the most restrictive)
    const limits = [];
    if (quantityFromN !== Infinity) limits.push(quantityFromN); // N limit is CRITICAL
    if (quantityFromP > 0) limits.push(quantityFromP);
    if (quantityFromK !== Infinity) limits.push(quantityFromK);
    
    if (limits.length === 0) return null;
    const minQuantity = Math.min(...limits);
    
    // 4. Validate: ensure P is satisfied AND N/K limits are respected
    const nutrients = getNutrientsFromGromor(minQuantity, fertilizerName);
    
    // STRICT: N must NOT exceed limit
    if (nutrients.n > stageNRequired) {
        return null;
    }
    
    // STRICT: K must NOT exceed limit
    if (stageIndex !== 1 && nutrients.k > stageKRequired) {
        return null;
    }
    
    // If P not satisfied, try rounding up ONLY if it doesn't violate N/K limits
    if (nutrients.p < stagePRequired * 0.95) {
        const roundedUp = roundToBagPrecise(minQuantity, 50, true);
        const nutrientsUp = getNutrientsFromGromor(roundedUp.kgs, fertilizerName);
        
        // STRICT: Check N/K limits BEFORE accepting rounded up quantity
        if (nutrientsUp.n > stageNRequired) {
            return null;
        }
        if (stageIndex !== 1 && nutrientsUp.k > stageKRequired) {
            return null;
        }
        
        if (nutrientsUp.p >= stagePRequired * 0.95) {
            return { quantity: roundedUp.kgs, nutrients: nutrientsUp, valid: true };
        }
        
        return null;
    }
    
    // Round to bag size
    const rounded = roundToBagPrecise(minQuantity, 50, true);
    const roundedNutrients = getNutrientsFromGromor(rounded.kgs, fertilizerName);
    
    // STRICT FINAL VALIDATION: No N/K overflow allowed after rounding
    if (roundedNutrients.n > stageNRequired) {
        console.warn(`[Multi-Constraint] ${fertilizerName}: Rounded quantity causes N overflow - REJECTED`);
        return null;
    }
    if (stageIndex !== 1 && roundedNutrients.k > stageKRequired) {
        console.warn(`[Multi-Constraint] ${fertilizerName}: Rounded quantity causes K overflow - REJECTED`);
        return null;
    }
    
    return { quantity: rounded.kgs, nutrients: roundedNutrients, valid: true };
}

window.isFertilizerAllowedInStage = function isFertilizerAllowedInStage(fertilizer, stageIndex, stageTargets, deliveredNutrients, tolerance = 0.12) {
    const restrictions = {
        k: stageIndex === 1 ? 0 : undefined, // Tillering: K=0
        p: stageIndex === 2 ? 0 : undefined  // Panicle: P=0
    };
    
    // Extract nutrient contributions from fertilizer object
    const fertN = fertilizer.nContributed || fertilizer.n || 0;
    const fertP = fertilizer.pContributed || fertilizer.p || 0;
    const fertK = fertilizer.kContributed || fertilizer.k || 0;
    
    // Check disallowed nutrients (hard rules - no tolerance)
    if (restrictions.k === 0 && fertK > 0.01) {
        return { allowed: false, reason: 'K not allowed in Tillering stage' };
    }
    if (restrictions.p === 0 && fertP > 0.01) {
        return { allowed: false, reason: 'P not allowed in Panicle stage' };
    }
    
    // CRITICAL: Check overflow for ALL nutrients (N, P, K) - enforce stage caps
    const totalNAfter = (deliveredNutrients.n || 0) + fertN;
    const stageNCap = (stageTargets.n || 0) * (1 + tolerance);
    if (totalNAfter > stageNCap) {
        return { allowed: false, reason: `N overflow: ${totalNAfter.toFixed(2)} > ${stageNCap.toFixed(2)} (stage target: ${(stageTargets.n || 0).toFixed(2)})` };
    }
    
    // CRITICAL: Check P overflow (was missing!)
    const totalPAfter = (deliveredNutrients.p || 0) + fertP;
    const stagePCap = (stageTargets.p || 0) * (1 + tolerance);
    if (stageIndex !== 2 && totalPAfter > stagePCap) { // Panicle already checked above
        return { allowed: false, reason: `P overflow: ${totalPAfter.toFixed(2)} > ${stagePCap.toFixed(2)} (stage target: ${(stageTargets.p || 0).toFixed(2)})` };
    }
    
    // Check K overflow
    const totalKAfter = (deliveredNutrients.k || 0) + fertK;
    const stageKCap = (stageTargets.k || 0) * (1 + tolerance);
    if (stageIndex !== 1 && totalKAfter > stageKCap) { // Tillering already checked above
        return { allowed: false, reason: `K overflow: ${totalKAfter.toFixed(2)} > ${stageKCap.toFixed(2)} (stage target: ${(stageTargets.k || 0).toFixed(2)})` };
    }
    
    return { allowed: true, reason: '' };
}

window.safeAddFertilizer = function safeAddFertilizer(stage, fertilizer, stageIndex, stageTargets, deliveredNutrients, passName) {
    const fertN = fertilizer.nContributed || fertilizer.n || 0;
    const fertP = fertilizer.pContributed || fertilizer.p || 0;
    const fertK = fertilizer.kContributed || fertilizer.k || 0;
    
    const fertilizerForCheck = {
        n: fertN,
        p: fertP,
        k: fertK
    };
    
    const check = isFertilizerAllowedInStage(fertilizerForCheck, stageIndex, stageTargets, deliveredNutrients);
    
    // Debug log
    const stageNames = ['Basal', 'Tillering', 'Panicle'];
    const stageName = stageNames[stageIndex] || `Stage ${stageIndex}`;
    console.log(`[${passName}] Stage ${stageIndex} (${stageName}): Attempting to add ${fertilizer.name || 'fertilizer'}`);
    console.log(`  Qty: ${fertilizer.kgs?.toFixed(2) || 'N/A'} kg`);
    console.log(`  Nutrients: N=${fertN.toFixed(2)}, P=${fertP.toFixed(2)}, K=${fertK.toFixed(2)}`);
    console.log(`  Stage remaining: N=${((stageTargets.n || 0) - (deliveredNutrients.n || 0)).toFixed(2)}, P=${((stageTargets.p || 0) - (deliveredNutrients.p || 0)).toFixed(2)}, K=${((stageTargets.k || 0) - (deliveredNutrients.k || 0)).toFixed(2)}`);
    console.log(`  Allowed: ${check.allowed ? 'YES' : 'NO'} - ${check.reason || 'OK'}`);
    
    if (!check.allowed) {
        console.error(`[${passName}] REJECTED: ${check.reason}`);
        return false;
    }
    
    stage.fertilizers.push(fertilizer);
    console.log(`[${passName}] ADDED: ${fertilizer.name || 'fertilizer'}`);
    return true;
}

window.scoreFertilizerCandidate = function scoreFertilizerCandidate(candidate, stagePRequired, stageNRequired, stageKRequired, stageIndex) {
    const nutrients = candidate.nutrients;
    
    // REJECT if N/K overflow (should not happen if calculateConstrainedQuantity works correctly)
    if (nutrients.n > stageNRequired) {
        return 100000; // Reject - N overflow
    }
    if (stageIndex !== 1 && nutrients.k > stageKRequired) {
        return 100000; // Reject - K overflow
    }
    if (stageIndex === 1 && nutrients.k > 0.01) {
        return 100000; // Reject - K in Tillering
    }
    
    // P must be satisfied
    if (nutrients.p < stagePRequired * 0.95) {
        return -1000; // Heavy penalty for not satisfying P
    }
    
    // Score: minimize excess P, maximize N/K utilization within limits
    const excessP = Math.max(0, nutrients.p - stagePRequired);
    const nUtilization = nutrients.n / stageNRequired; // Higher is better (up to 1.0)
    const kUtilization = (stageIndex !== 1 && stageKRequired > 0) ? nutrients.k / stageKRequired : 0;
    
    // Lower score = better
    return excessP * 2.0 - (nUtilization * 0.1) - (kUtilization * 0.1);
}

window.applyStageSafeTopUp = function applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, combinationName) {
    if (!recommendations || recommendations.length === 0) return;
    
    // Calculate total required nutrients
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    
    // Helper function to compute global delivered totals
    const computeGlobalDelivered = () => {
        let globalN = 0, globalP = 0, globalK = 0;
        recommendations.forEach(stage => {
            if (stage && stage.fertilizers) {
                stage.fertilizers.forEach(fert => {
                    globalN += fert.nContributed || 0;
                    globalP += fert.pContributed || 0;
                    globalK += fert.kContributed || 0;
                });
            }
        });
        return { n: globalN, p: globalP, k: globalK };
    };
    
    // Compute initial global delivered and remaining
    let globalDelivered = computeGlobalDelivered();
    let globalRemainingN = Math.max(0, totalNRequired - globalDelivered.n);
    let globalRemainingP = Math.max(0, totalPRequired - globalDelivered.p);
    let globalRemainingK = Math.max(0, totalKRequired - globalDelivered.k);
    
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

    // ── PASS 1: N top-up — most N-underfilled stage first ───────────────────────────────
    if (globalRemainingN > 0.1) {
        const nOrder = [...stageIndices].sort((a, b) => {
            // Relative fill shortfall: stages further below target (as %) come first.
            // Stages above target get a negative shortfall → pushed to end (strong penalty).
            const tA = nPerSplit[a] || 0;
            const tB = nPerSplit[b] || 0;
            const defA = tA > 0 ? (tA - getStageDelivered(a).n) / tA : 0;
            const defB = tB > 0 ? (tB - getStageDelivered(b).n) / tB : 0;
            return defB - defA; // descending: most-underfilled (by %) first
        });

        for (const stageIdx of nOrder) {
            if (globalRemainingN <= 0.1) break;

            const stage = recommendations[stageIdx];
            const delivered = getStageDelivered(stageIdx);
            const deliveredN = delivered.n;
            const stageTargetN = nPerSplit[stageIdx] || 0;

            // Skip stages already at or above their target
            if (deliveredN >= stageTargetN * 0.98) continue; // skip if within 2% of target

            const nHeadroom = Math.max(0, stageTargetN * 1.12 - deliveredN);
            if (nHeadroom <= 0.5) continue;

            const stageTargets  = { n: stageTargetN, p: pPerSplit[stageIdx] || 0, k: kPerSplit[stageIdx] || 0 };
            const deliveredBefore = { n: deliveredN, p: delivered.p, k: delivered.k };

            // Detect single-nutrient mode: N-only top-up when P and K are already satisfied
            const pHeadroom = Math.max(0, (pPerSplit[stageIdx] || 0) * 1.12 - delivered.p);
            const kHeadroom = Math.max(0, (kPerSplit[stageIdx] || 0) * 1.12 - delivered.k);
            const isSingleNutrientNMode = nHeadroom > 0.5 && pHeadroom <= 0.1 && kHeadroom <= 0.5;
            
            let nFertilizer = selectNFertilizerForSingleNutrientTopUp(Math.min(nHeadroom, globalRemainingN), preferences, sStatus, phStatus, isSingleNutrientNMode);
            if (!nFertilizer) nFertilizer = 'Urea';

            const nToAdd = Math.min(nHeadroom, globalRemainingN, stageTargetN * 1.12 - deliveredN);
            if (nToAdd <= 0.1) continue;

            const nKgs    = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
            let rounded = roundToBag(nKgs);
            const actualNutrientsFrom = (qty) => getNutrientsFromStraight(qty, nFertilizer);
            
            // No floor-down fallback needed — roundToBag returns exact quantities
            // (bag rounding is handled in the display only)

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

    // ── PASS 2: P top-up — most P-underfilled stage first (Panicle forbidden) ──────────
    if (globalRemainingP > 0.1) {
        const pOrder = [...stageIndices]
            .filter(i => i !== 2) // Panicle: P application forbidden
            .sort((a, b) => {
                const tA = pPerSplit[a] || 0;
                const tB = pPerSplit[b] || 0;
                const defA = tA > 0 ? (tA - getStageDelivered(a).p) / tA : 0;
                const defB = tB > 0 ? (tB - getStageDelivered(b).p) / tB : 0;
                return defB - defA; // most-underfilled (by %) first; above-target → negative → last
            });

        for (const stageIdx of pOrder) {
            if (globalRemainingP <= 0.1) break;

            const stage = recommendations[stageIdx];
            const delivered = getStageDelivered(stageIdx);
            const deliveredP = delivered.p;
            const stageTargetP = pPerSplit[stageIdx] || 0;

            // Skip stages already at or above their target
            if (deliveredP >= stageTargetP * 0.98) continue; // skip if within 2% of target

            const pHeadroom = Math.max(0, stageTargetP * 1.12 - deliveredP);
            if (pHeadroom <= 0.1) continue;

            // For Basal stage: if a complex Gromor fertilizer (14-35-14, 28-28-0, 10-26-26)
            // already provides P, prefer that single source over also adding SSP/DAP.
            if (stageIdx === 0) {
                const hasComplexPFertilizer = stage.fertilizers.some(f =>
                    f.name && (f.name.includes('28-28-0') || f.name.includes('14-35-14') || f.name.includes('10-26-26')) &&
                    (f.pContributed || 0) > 0.01
                );
                if (hasComplexPFertilizer) {
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P: Skipped - single Gromor P source preferred at Basal`);
                    continue;
                }
            }

            const stageTargets  = { n: nPerSplit[stageIdx] || 0, p: stageTargetP, k: kPerSplit[stageIdx] || 0 };
            const deliveredBefore = { n: delivered.n, p: deliveredP, k: delivered.k };

            // Detect single-nutrient mode: P-only top-up when N and K are already satisfied
            const nHeadroom = Math.max(0, (nPerSplit[stageIdx] || 0) * 1.12 - delivered.n);
            const kHeadroom = Math.max(0, (kPerSplit[stageIdx] || 0) * 1.12 - delivered.k);
            const isSingleNutrientPMode = pHeadroom > 0.1 && nHeadroom <= 0.5 && kHeadroom <= 0.5;

            const pToAdd = Math.min(pHeadroom, globalRemainingP, stageTargetP * 1.12 - deliveredP);
            if (pToAdd <= 0.1) continue;

            // Use single-nutrient preference: SSP first, then DAP
            const pFertilizer = selectPFertilizerForSingleNutrientTopUp(
                pToAdd, preferences, stageIdx, stageTargets.n, delivered.n, isSingleNutrientPMode
            );

            if (pFertilizer === 'SSP') {
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
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P (SSP): headroom=${pHeadroom.toFixed(2)}, globalRemaining=${globalRemainingP.toFixed(2)}, chosenTopUp=${pToAdd.toFixed(2)}, roundedQty=${rounded.kgs.toFixed(2)}, actualP=${actualP.toFixed(2)}`);
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
            } else if (pFertilizer === 'DAP') {
                // DAP: 18% N, 46% P2O5
                const dapKgs = (pToAdd / 46) * 100;
                const rounded = roundToBag(dapKgs);

                if (rounded.kgs <= 0) {
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P: Skipped - rounded qty = ${rounded.kgs.toFixed(2)} kg`);
                    continue;
                }

                const actualP = (rounded.kgs * 46) / 100;
                const actualN = (rounded.kgs * 18) / 100;
                
                // Check if rounded quantity fits in headroom and doesn't violate N cap
                if (deliveredP + actualP <= stageTargetP * 1.12 &&
                    delivered.n + actualN <= stageTargets.n * 1.12 &&
                    globalDelivered.p + actualP <= totalPRequired &&
                    globalDelivered.n + actualN <= totalNRequired) {
                    const fertilizerObj = {
                        name: 'DAP',
                        kgs: rounded.kgs,
                        bags: rounded.kgs / 50,
                        fullBags: Math.floor(rounded.kgs / 50),
                        remainder: rounded.kgs % 50,
                        nContributed: actualN,
                        pContributed: actualP,
                        kContributed: 0
                    };
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P (DAP): headroom=${pHeadroom.toFixed(2)}, globalRemaining=${globalRemainingP.toFixed(2)}, chosenTopUp=${pToAdd.toFixed(2)}, roundedQty=${rounded.kgs.toFixed(2)}, actualP=${actualP.toFixed(2)}, actualN=${actualN.toFixed(2)}`);
                    if (safeAddFertilizer(stage, fertilizerObj, stageIdx, stageTargets, deliveredBefore, `${combinationName}-topup-P`)) {
                        globalDelivered.p += actualP;
                        globalDelivered.n += actualN;
                        globalRemainingP = Math.max(0, totalPRequired - globalDelivered.p);
                        globalRemainingN = Math.max(0, totalNRequired - globalDelivered.n);
                        console.log(`[${combinationName}-topup] Stage ${stageIdx} P: ACCEPTED - new globalRemaining P=${globalRemainingP.toFixed(2)}, N=${globalRemainingN.toFixed(2)}`);
                    } else {
                        console.log(`[${combinationName}-topup] Stage ${stageIdx} P: REJECTED - constraint violation`);
                    }
                } else {
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P: REJECTED - would exceed stage cap or global quota`);
                }
            } else {
                // Fallback: use SSP if no preference selected
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
                    console.log(`[${combinationName}-topup] Stage ${stageIdx} P (SSP fallback): headroom=${pHeadroom.toFixed(2)}, globalRemaining=${globalRemainingP.toFixed(2)}, chosenTopUp=${pToAdd.toFixed(2)}, roundedQty=${rounded.kgs.toFixed(2)}, actualP=${actualP.toFixed(2)}`);
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
    }

    // ── PASS 3: K top-up — most K-underfilled stage first (Tillering forbidden) ───────────
    if (globalRemainingK > 0.1) {
        const kOrder = [...stageIndices]
            .filter(i => i !== 1) // Tillering: K application forbidden
            .sort((a, b) => {
                // Relative shortfall: naturally enforces 50/50 K split preference —
                // if Basal and Panicle have equal targets, the one with lower fill % goes first.
                const tA = kPerSplit[a] || 0;
                const tB = kPerSplit[b] || 0;
                const defA = tA > 0 ? (tA - getStageDelivered(a).k) / tA : 0;
                const defB = tB > 0 ? (tB - getStageDelivered(b).k) / tB : 0;
                return defB - defA;
            });

        for (const stageIdx of kOrder) {
            if (globalRemainingK <= 0.1) break;

            const stage = recommendations[stageIdx];
            const delivered = getStageDelivered(stageIdx);
            const deliveredK = delivered.k;
            const stageTargetK = kPerSplit[stageIdx] || 0;

            // Skip stages already at or above their target
            if (deliveredK >= stageTargetK * 0.98) continue; // skip if within 2% of target

            const kHeadroom = Math.max(0, stageTargetK * 1.12 - deliveredK);
            if (kHeadroom <= 0.5) continue;

            const stageTargets  = { n: nPerSplit[stageIdx] || 0, p: pPerSplit[stageIdx] || 0, k: stageTargetK };
            const deliveredBefore = { n: delivered.n, p: delivered.p, k: deliveredK };

            // Detect single-nutrient mode: K-only top-up when N and P are already satisfied
            const nHeadroom = Math.max(0, (nPerSplit[stageIdx] || 0) * 1.12 - delivered.n);
            const pHeadroom = Math.max(0, (pPerSplit[stageIdx] || 0) * 1.12 - delivered.p);
            const isSingleNutrientKMode = kHeadroom > 0.5 && nHeadroom <= 0.5 && pHeadroom <= 0.1;
            
            const kFertName = selectKFertilizerForSingleNutrientTopUp(Math.min(kHeadroom, globalRemainingK), preferences, sStatus, phStatus, isSingleNutrientKMode) || 'SOP';
            const kToAdd    = Math.min(kHeadroom, globalRemainingK, stageTargetK * 1.12 - deliveredK);
            if (kToAdd <= 0.1) continue;

            const kKgs    = convertK2OToStraight(kToAdd, kFertName.toLowerCase());
            let rounded = roundToBag(kKgs);

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


    // Helper: correct bag size per fertilizer (Urea = 45 kg, all others = 50 kg)
    const getBagSize = (name) => /urea/i.test(name) ? 45 : 50;

    // Merge duplicate same-fertilizer rows and fix bag counts within each stage
    recommendations.forEach(stage => {
        if (!stage || !stage.fertilizers) return;

        // Remove any 0 kg rows before merging (belt-and-suspenders)
        stage.fertilizers = stage.fertilizers.filter(f => f.kgs > 0);

        const merged = {};
        const mergedList = [];

        stage.fertilizers.forEach(fert => {
            const key = fert.name.toLowerCase();
            if (merged[key]) {
                // Merge: accumulate quantities and nutrients
                merged[key].kgs          += fert.kgs;
                merged[key].nContributed  = (merged[key].nContributed || 0) + (fert.nContributed || 0);
                merged[key].pContributed  = (merged[key].pContributed || 0) + (fert.pContributed || 0);
                merged[key].kContributed  = (merged[key].kContributed || 0) + (fert.kContributed || 0);
                merged[key].sContributed  = (merged[key].sContributed || 0) + (fert.sContributed || 0);
            } else {
                // First occurrence - clone the object
                merged[key] = {
                    ...fert,
                    kgs:          fert.kgs,
                    nContributed: fert.nContributed || 0,
                    pContributed: fert.pContributed || 0,
                    kContributed: fert.kContributed || 0,
                    sContributed: fert.sContributed || 0
                };
            }
        });

        // Recalculate bags using correct bag size per fertilizer, then push non-zero rows
        Object.values(merged).forEach(fert => {
            if (fert.kgs > 0) {
                const bs          = getBagSize(fert.name);
                fert.bags         = fert.kgs / bs;
                fert.fullBags     = Math.floor(fert.bags);
                fert.remainder    = fert.kgs % bs;
                const _bagCount    = +(fert.bags.toFixed(2));
                fert.label        = `${+(fert.kgs.toFixed(2))} kg (${_bagCount} ${_bagCount === 1 ? 'bag' : 'bags'})`;
                mergedList.push(fert);
            }
        });

        stage.fertilizers = mergedList;
    });
}

window.convertP2O5ToGromorDirect = function convertP2O5ToGromorDirect(p2o5Required, product, p2o5Status, locationRec) {
    // Calculate actual Gromor quantity from P requirement using conversion table
    const table = fertilizerConversion.p2o5ToGromor[product];
    if (!table) {
        // Fallback: calculate from product percentage
        const productData = fertilizerConversion.fertilizerProducts[product];
        if (!productData || productData.p === 0) return 0;
        return (p2o5Required / productData.p) * 100;
    }
    
    // Use conversion table to get exact quantity for required P2O5
    let calculatedDose = interpolateFromTable(table, p2o5Required, 'p2o5');
    
    // Check against location table maximum (if available) - this is a reference, not exact
    if (locationRec && locationRec.gromorByPStatus && locationRec.gromorByPStatus[p2o5Status]) {
        const productKey = product.replace(/-/g, '-');
        const maxFromTable = locationRec.gromorByPStatus[p2o5Status][productKey];
        
        // If calculated exceeds maximum, use maximum (safety check)
        if (maxFromTable && calculatedDose > maxFromTable * 1.2) {
            // Allow 20% tolerance, but log if significantly over
            console.warn(`Calculated dose ${calculatedDose} exceeds table max ${maxFromTable} for ${product}`);
        }
    }
    
    return calculatedDose;
}

window.calculateCombination1 = function calculateCombination1(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus) {
    const recommendations = [];
    
    // EXCEPTION 2: Calculate P first because complex fertilizers contain N, K, and S along with P
    // Stage 1: Basal Application
    const basalP = pPerSplit[0] || 0; // P at basal (70% for paddy, 100% for others)
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    // EXCEPTION 3: If 100% P is at basal, use SSP only
    const totalP = pPerSplit.reduce((sum, p) => sum + p, 0);
    const is100PercentBasalP = Math.abs(basalP - totalP) < 0.01;
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
    let remainingN = basalN;
    let remainingK = basalK;
    
    if (is100PercentBasalP && checkPreference('SSP', preferences) !== 'Reject') {
        // EXCEPTION 3: 100% P basal = SSP only
        const sspKgs = (basalP / 16) * 100; // SSP is 16% P2O5
        const rounded = roundToBag(sspKgs);
        const actualNutrients = getNutrientsFromStraight(rounded.kgs, 'SSP');
        stage1.fertilizers.push({
            name: 'SSP',
            kgs: rounded.kgs,
            ...rounded,
            nContributed: 0,
            pContributed: actualNutrients.p,
            kContributed: 0
        });
    } else {
        // EXCEPTION 6 & 9: Use high P fertilizer at basal, or auto-select SSP/high P
        // Apply 28-28-0 for basal (high P fertilizer)
        const gromor28280 = convertP2O5ToGromor(basalP, '28-28-0');
        const rounded28280 = roundToBag(gromor28280);
        // CRITICAL FIX: Calculate nutrients from ROUNDED quantity, not unrounded
        const actualNutrients28280 = getNutrientsFromGromor(rounded28280.kgs, '28-28-0');
        remainingN = Math.max(0, basalN - actualNutrients28280.n);
        
        if (checkPreference('28-28-0', preferences) !== 'Reject' && gromor28280 > 0) {
            const fertilizerObj = {
                name: 'Gromor 28-28-0',
                kgs: rounded28280.kgs,
                ...rounded28280,
                nContributed: actualNutrients28280.n,
                pContributed: (rounded28280.kgs * 28) / 100, // Actual P from rounded quantity
                kContributed: 0
            };
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: 0, p: 0, k: 0 };
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination1-basal-28-28-0');
        }
    }
    
    // Select N fertilizer based on S and pH status - USE safeAddFertilizer
    if (remainingN > 0) {
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
        if (nFertilizer) {
            const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
            // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
            const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: nFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k || 0
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination1-basal-N')) {
                remainingN = Math.max(0, basalN - (stage1DeliveredN + actualNutrients.n));
            }
        }
    }
    
    // Select K fertilizer based on S and pH status - USE safeAddFertilizer
    if (basalK > 0) {
        const kFertilizer = selectKFertilizer(basalK, preferences, sStatus, phStatus);
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(basalK, kFertilizer.toLowerCase());
            const rounded = roundToBagUp(kKgs, 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: kFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination1-basal-K');
        }
    }
    
    // Calculate actual N, P, K delivered in Stage 1
    let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
    stage1.fertilizers.forEach(fert => {
        cumulativeN += fert.nContributed || 0;
        cumulativeP += fert.pContributed || 0;
        cumulativeK += fert.kContributed || 0;
    });
    
    // Calculate total N, P, K required and remaining
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
    const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
    const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
    const remainingStages = nPerSplit.length - 1;
    
    recommendations.push(stage1);
    
    // Stage 2: First Top Dressing - USE ORIGINAL STAGE TARGETS (not adjusted/remaining)
    if (nPerSplit.length > 1) {
        // CRITICAL FIX: Use ORIGINAL stage targets, NOT adjusted/remaining values
        // Stage targets are PRIMARY - we must solve each stage against its original quota
        // Rebalancing should only happen if a stage is infeasible, not by default
        const originalStage2N = nPerSplit[1] || 0;
        const originalStage2P = pPerSplit[1] || 0;
        const originalStage2K = kPerSplit[1] || 0;
        
        // Calculate what's already delivered in Stage 1
        let stage1DeliveredN = 0;
        let stage1DeliveredP = 0;
        let stage1DeliveredK = 0;
        stage1.fertilizers.forEach(fert => {
            stage1DeliveredN += fert.nContributed || 0;
            stage1DeliveredP += fert.pContributed || 0;
            stage1DeliveredK += fert.kContributed || 0;
        });
        
        // Stage 2 targets are the ORIGINAL split targets, not adjusted
        // If Stage 1 under-delivered, that's a separate issue to handle later
        const topN = originalStage2N;
        const topK = originalStage2K;
        const stage2P = originalStage2P;
        
        const stage2 = {
            stage: cropData.splits.n.stages[1],
            fertilizers: []
        };
        
        let remainingN = topN;
        let remainingK = topK;
        
        // OPTIMIZED: STEP 1 - FIRST fulfill P requirement (if any)
        // EXCEPTION 2: P calculated first because P fertilizers contain N, K, and S
        // EXCEPTION 4 & 6: Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2
        // SSP should NOT be used at stage 2 (powder form, difficult to apply at 30 days)
        if (stage2P > 0) {
            const pFertilizer = selectP2O5Fertilizer(stage2P, 'at Tillering', preferences, pStatus, locationRec);
            
            // CRITICAL: Check if pFertilizer is not null before accessing its properties
            if (pFertilizer && pFertilizer.method === 'gromor') {
                const gromorKgs = convertP2O5ToGromorDirect(stage2P, pFertilizer.product, pStatus, locationRec);
                const nutrients = getNutrientsFromGromor(gromorKgs, pFertilizer.product);
                const rounded = roundToBag(gromorKgs);
                
                // Calculate actual nutrients from rounded quantity
                const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                
                // CRITICAL: Validate complex P fertilizer doesn't contain K when adding to Tillering
                const fertilizerObj = {
                    name: `Gromor ${pFertilizer.product}`,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p, // CRITICAL: Use actual P from rounded quantity, not required
                    kContributed: actualNutrients.k || 0
                };
                
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                const stageTargets = { n: topN, p: stage2P, k: topK };
                const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                
                if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination1-stage2-P')) {
                    // Adjust remaining N and K after P fertilizer
                    remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    remainingK = Math.max(0, topK - (stage2DeliveredK + actualNutrients.k));
                } else {
                    console.error(`[Combination1] Failed to add P fertilizer to Tillering - constraint violation!`);
                    // Don't adjust remaining if rejected
                }
            } else if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                // Fallback: If no Gromor product available or all rejected, use SSP (mandatory to meet P requirement)
                // Even though SSP is not ideal at Stage 2, meeting P requirement is critical
                if (checkPreference('SSP', preferences) !== 'Reject') {
                    const sspKgs = (stage2P / 16) * 100; // SSP has 16% P
                    const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                    const actualP = (rounded.kgs * 16) / 100;
                    const actualS = (rounded.kgs * 12) / 100;
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
                    
                    // Calculate delivered nutrients so far in stage2
                    let stage2DeliveredN = 0;
                    let stage2DeliveredP = 0;
                    let stage2DeliveredK = 0;
                    stage2.fertilizers.forEach(fert => {
                        stage2DeliveredN += fert.nContributed || 0;
                        stage2DeliveredP += fert.pContributed || 0;
                        stage2DeliveredK += fert.kContributed || 0;
                    });
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination1-stage2-P-fallback')) {
                        // SSP doesn't contribute N or K, so remainingN and remainingK stay the same
                    }
                }
            }
        }
        
        // STEP 2: THEN fulfill remaining N requirement with Urea (or other N fertilizer)
        if (remainingN > 0) {
            const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                // CRITICAL: Cap N addition to respect stage limit
                const maxAllowedN = topN - stage2DeliveredN;
                const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
                
                if (nToAdd > 0) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination1-stage2-N')) {
                        remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    }
                }
            }
        }
        
        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (stageIndex === 1)
        // CRITICAL: K must be 0 in Tillering stage - skip K addition
        // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
        if (remainingK > 0.5) {
            // CRITICAL FIX: Stage 2 is Tillering (index 1) - K not allowed
            const stage2Index = 1; // Tillering stage
            if (stage2Index === 1) {
                console.warn(`[Combination1] Stage 2 (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
                // Do not add K fertilizer in Tillering stage
            } else {
                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
                if (kFertilizer) {
                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
                    // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                    const rounded = roundToBag(kKgs);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                    
                    const fertilizerObj = {
                        name: kFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n || 0,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k
                    };
                    
                    // Calculate delivered nutrients so far in stage2
                    let stage2DeliveredN = 0;
                    let stage2DeliveredP = 0;
                    let stage2DeliveredK = 0;
                    stage2.fertilizers.forEach(fert => {
                        stage2DeliveredN += fert.nContributed || 0;
                        stage2DeliveredP += fert.pContributed || 0;
                        stage2DeliveredK += fert.kContributed || 0;
                    });
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    // Use safeAddFertilizer to enforce constraints
                    safeAddFertilizer(stage2, fertilizerObj, stage2Index, stageTargets, deliveredBefore, 'combination1-stage2-K');
                }
            }
        }
        
        // Update cumulative N, P, K after Stage 2
        stage2.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        recommendations.push(stage2);
    }
    
    // Stage 3+: Additional top dressings - USE ORIGINAL STAGE TARGETS (no rebalancing)
    for (let i = 2; i < nPerSplit.length; i++) {
        // STRICT: Use original stage targets (no rebalancing to compensate for earlier deficits)
        const stageN = nPerSplit[i] || 0; // Original N target (1/3 rule)
        const stageP = pPerSplit[i] || 0; // Original P split (0 for Panicle)
        const stageK = kPerSplit[i] || 0; // Original K split (50% for Panicle)
        
        if (stageN <= 0 && stageK <= 0 && stageP <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        let deliveredN = 0;
        let deliveredP = 0;
        let deliveredK = 0;
        
        const stageTargets = { n: stageN, p: stageP, k: stageK };
        
        // Select N fertilizer based on S and pH status
        if (stageN > 0) {
            const nFertilizer = selectNFertilizer(stageN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                const nKgs = convertNToStraight(stageN, nFertilizer.toLowerCase());
                const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                
                const fertilizerObj = {
                    name: nFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                };
                
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'rebalancing-N')) {
                    deliveredN += actualNutrients.n;
                }
            }
        }
        
        // Select K fertilizer based on S and pH status
        // CRITICAL: Check if stage is Tillering (i === 1) - K not allowed
        if (stageK > 0 && i !== 1) {
            const kFertilizer = selectKFertilizer(stageK, preferences, sStatus, phStatus);
            if (kFertilizer) {
                const kKgs = convertK2OToStraight(stageK, kFertilizer.toLowerCase());
                const rounded = roundToBagUp(kKgs, 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                
                const fertilizerObj = {
                    name: kFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                };
                
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'rebalancing-K')) {
                    deliveredK += actualNutrients.k;
                }
            }
        }
        
        // Update cumulative N, P, K after each stage
        stage.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    // FINAL REBALANCING: If total N, P, K are still below minimum, add to appropriate stage
    // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
    const minRequiredN = totalNRequired * 0.88; // 12% tolerance
    const minRequiredP = totalPRequired * 0.88;
    const minRequiredK = totalKRequired * 0.88;
    
    if (recommendations.length > 0) {
        // For Paddy: P should be at Stage 2 (tillering), not Stage 3
        // Find Stage 2 (index 1) if it exists, otherwise use last stage
        const stage2Index = recommendations.findIndex(s => s.stage && s.stage.toLowerCase().includes('tillering'));
        const pStage = stage2Index >= 0 ? recommendations[stage2Index] : recommendations[recommendations.length - 1];
        const lastStage = recommendations[recommendations.length - 1];
        
        // Add N deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeN < minRequiredN) {
            const deficit = totalNRequired - cumulativeN; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // Calculate already delivered nutrients in lastStage
            let lastStageDeliveredN = 0;
            let lastStageDeliveredP = 0;
            let lastStageDeliveredK = 0;
            lastStage.fertilizers.forEach(fert => {
                lastStageDeliveredN += fert.nContributed || 0;
                lastStageDeliveredP += fert.pContributed || 0;
                lastStageDeliveredK += fert.kContributed || 0;
            });
            
            // Check if we can add N without exceeding stage limit
            const maxAllowedN = originalStageN - lastStageDeliveredN;
            const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
            
            if (nToAdd > 0) {
                // Try to get N fertilizer, but if preferences reject all, use Urea anyway (mandatory)
                let nFertilizer = selectNFertilizer(nToAdd, preferences, sStatus, phStatus);
                if (!nFertilizer) {
                    // Fallback: Use Urea if all others are rejected (mandatory to meet minimum)
                    nFertilizer = 'Urea';
                }
                if (nFertilizer) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL: Always round UP to ensure we meet minimum (never round down)
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                    const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                    
                    if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
                        cumulativeN += actualNutrients.n;
                    } else {
                        console.warn(`[Combination1 Final Rebalancing] Cannot add N to lastStage (${lastStage.stage}) - would violate stage constraints`);
                    }
                }
            } else {
                console.warn(`[Combination1 Final Rebalancing] Cannot add N deficit (${deficit.toFixed(2)} kg) to lastStage - would exceed stage N limit (${originalStageN.toFixed(2)} kg)`);
            }
        }
        
        // Add P deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
        if (cumulativeP < minRequiredP) {
            const deficit = totalPRequired - cumulativeP; // Use full requirement, not just 88%
            
            // Determine which stage is pStage (should be Stage 2/Tillering for Paddy)
            const pStageIndex = stage2Index >= 0 ? 1 : recommendations.length - 1;
            const originalStageN = nPerSplit[pStageIndex] || 0;
            const originalStageP = pPerSplit[pStageIndex] || 0;
            const originalStageK = kPerSplit[pStageIndex] || 0;
            
            // CRITICAL: P not allowed in Panicle (stageIndex === 2)
            if (pStageIndex === 2) {
                console.warn(`[Combination1 Final Rebalancing] Cannot add P to pStage (${pStage.stage}) - P not allowed in Panicle stage`);
            } else {
                // Calculate already delivered nutrients in pStage
                let pStageDeliveredN = 0;
                let pStageDeliveredP = 0;
                let pStageDeliveredK = 0;
                pStage.fertilizers.forEach(fert => {
                    pStageDeliveredN += fert.nContributed || 0;
                    pStageDeliveredP += fert.pContributed || 0;
                    pStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add P without exceeding stage limit
                const maxAllowedP = originalStageP - pStageDeliveredP;
                const pToAdd = Math.min(deficit, maxAllowedP > 0 ? maxAllowedP : 0);
                
                if (pToAdd > 0) {
                    // Try to add P through appropriate fertilizer
                    let pFertilizer = selectP2O5Fertilizer(pToAdd, 'Final', preferences, pStatus, locationRec);
                    // If no Gromor product available or rejected, use SSP as fallback (MANDATORY to meet minimum)
                    if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                        // MANDATORY: Use SSP even if rejected - meeting minimum is required
                        pFertilizer = { product: 'SSP', method: 'straight' };
                    }
                    
                    // Always add P fertilizer (mandatory to meet minimum)
                    // CRITICAL: Add to Stage 2 (tillering) for Paddy, not Stage 3
                    if (pFertilizer) {
                        if (pFertilizer && pFertilizer.method === 'gromor') {
                            const gromorKgs = convertP2O5ToGromorDirect(pToAdd, pFertilizer.product, pStatus, locationRec);
                            const rounded = roundToBagUp(gromorKgs, 50); // Round UP to ensure minimum
                            const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                            
                            const fertilizerObj = {
                                name: `Gromor ${pFertilizer.product}`,
                                kgs: rounded.kgs,
                                ...rounded,
                                nContributed: actualNutrients.n,
                                pContributed: actualNutrients.p,
                                kContributed: actualNutrients.k || 0
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P')) {
                                cumulativeP += actualNutrients.p;
                            }
                        } else if (pFertilizer.method === 'straight' && pFertilizer.product === 'SSP') {
                            // SSP: 16% P, 12% S
                            const sspKgs = (pToAdd / 16) * 100;
                            const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                            const actualP = (rounded.kgs * 16) / 100;
                            const actualS = (rounded.kgs * 12) / 100;
                            
                            const fertilizerObj = {
                                name: 'SSP',
                                kgs: rounded.kgs,
                                bags: rounded.kgs / 45,
                                fullBags: Math.floor(rounded.kgs / 45),
                                remainder: rounded.kgs % 45,
                                nContributed: 0,
                                pContributed: actualP,
                                kContributed: 0,
                                sContributed: actualS
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P-SSP')) {
                                cumulativeP += actualP;
                            }
                        }
                    }
                } else {
                    console.warn(`[Combination1 Final Rebalancing] Cannot add P deficit (${deficit.toFixed(2)} kg) to pStage - would exceed stage P limit (${originalStageP.toFixed(2)} kg)`);
                }
            }
        }
        
        // Add K deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeK < minRequiredK) {
            const deficit = totalKRequired - cumulativeK; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // CRITICAL: K not allowed in Tillering (stageIndex === 1)
            if (lastStageIndex === 1) {
                console.warn(`[Combination1 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - K not allowed in Tillering stage`);
            } else {
                // Calculate already delivered nutrients in lastStage
                let lastStageDeliveredN = 0;
                let lastStageDeliveredP = 0;
                let lastStageDeliveredK = 0;
                lastStage.fertilizers.forEach(fert => {
                    lastStageDeliveredN += fert.nContributed || 0;
                    lastStageDeliveredP += fert.pContributed || 0;
                    lastStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add K without exceeding stage limit
                const maxAllowedK = originalStageK - lastStageDeliveredK;
                const kToAdd = Math.min(deficit, maxAllowedK > 0 ? maxAllowedK : 0);
                
                if (kToAdd > 0) {
                    let kFertilizer = selectKFertilizer(kToAdd, preferences, sStatus, phStatus);
                    // Fallback: Use MOP if all others are rejected (mandatory to meet minimum)
                    if (!kFertilizer) {
                        kFertilizer = 'MOP';
                    }
                    if (kFertilizer) {
                        const kKgs = convertK2OToStraight(kToAdd, kFertilizer.toLowerCase());
                        const rounded = roundToBagUp(kKgs, 50);
                        const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                        
                        const fertilizerObj = {
                            name: kFertilizer,
                            kgs: rounded.kgs,
                            ...rounded,
                            nContributed: actualNutrients.n || 0,
                            pContributed: actualNutrients.p || 0,
                            kContributed: actualNutrients.k
                        };
                        
                        const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                        const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                        
                        if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-K')) {
                            cumulativeK += actualNutrients.k;
                        } else {
                            console.warn(`[Combination1 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - would violate stage constraints`);
                        }
                    }
                } else {
                    console.warn(`[Combination1 Final Rebalancing] Cannot add K deficit (${deficit.toFixed(2)} kg) to lastStage - would exceed stage K limit (${originalStageK.toFixed(2)} kg)`);
                }
            }
        }
    }
    
    // STAGE-SAFE TOP-UP PASS: Fill remaining headroom in each stage
    applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combination1');
    
    return recommendations;
}

window.calculateCombination2 = function calculateCombination2(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus) {
    const recommendations = [];
    
    // Stage 1: Basal with 14-35-14
    const basalP = pPerSplit[0] || 0; // P at basal (60% for paddy, 100% for others)
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    const gromor143514 = convertP2O5ToGromor(basalP, '14-35-14');
    const rounded143514 = roundToBag(gromor143514);
    // CRITICAL FIX: Calculate nutrients from ROUNDED quantity, not unrounded
    const actualNutrients143514 = getNutrientsFromGromor(rounded143514.kgs, '14-35-14');
    let remainingN = Math.max(0, basalN - actualNutrients143514.n);
    let remainingK = Math.max(0, basalK - actualNutrients143514.k);
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
    if (checkPreference('14-35-14', preferences) !== 'Reject' && gromor143514 > 0) {
        const fertilizerObj = {
            name: 'Gromor 14-35-14',
            kgs: rounded143514.kgs,
            ...rounded143514,
            nContributed: actualNutrients143514.n,
            pContributed: (rounded143514.kgs * 35) / 100, // Actual P from rounded quantity
            kContributed: actualNutrients143514.k
        };
        const stageTargets = { n: basalN, p: basalP, k: basalK };
        const deliveredBefore = { n: 0, p: 0, k: 0 };
        safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination2-basal-14-35-14');
    }
    
    // Select N fertilizer based on S and pH status - USE safeAddFertilizer
    if (remainingN > 0) {
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
        if (nFertilizer) {
            const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
            // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
            const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: nFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k || 0
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination2-basal-N')) {
                remainingN = Math.max(0, basalN - (stage1DeliveredN + actualNutrients.n));
            }
        }
    }
    
    // Select K fertilizer based on S and pH status - USE safeAddFertilizer
    if (remainingK > 0) {
        const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
            const rounded = roundToBagUp(kKgs, 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: kFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination2-basal-K');
        }
    }
    
    // Calculate actual N, P, K delivered in Stage 1
    let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
    stage1.fertilizers.forEach(fert => {
        cumulativeN += fert.nContributed || 0;
        cumulativeP += fert.pContributed || 0;
        cumulativeK += fert.kContributed || 0;
    });
    
    // Calculate total N, P, K required and remaining
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
    const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
    const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
    const remainingStages = nPerSplit.length - 1;
    
    recommendations.push(stage1);
    
    // Stage 2: First Top - USE ORIGINAL STAGE TARGETS (not adjusted/remaining)
    // EXCEPTION 2: P calculated first because P fertilizers contain N, K, and S
    if (nPerSplit.length > 1) {
        // CRITICAL FIX: Use ORIGINAL stage targets, NOT adjusted/remaining values
        // Stage targets are PRIMARY - we must solve each stage against its original quota
        const originalStage2N = nPerSplit[1] || 0;
        const originalStage2P = pPerSplit[1] || 0;
        const originalStage2K = kPerSplit[1] || 0;
        
        const topN = originalStage2N;
        const topK = originalStage2K;
        const stage2P = originalStage2P;
        
        const stage2 = {
            stage: cropData.splits.n.stages[1],
            fertilizers: []
        };
        
        let remainingN = topN;
        let remainingK = topK;
        
        // STEP 1: FIRST fulfill P requirement (if any)
        // EXCEPTION 4 & 6: Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2
        // SSP should NOT be used at stage 2 (powder form, difficult to apply at 30 days)
        if (stage2P > 0) {
            const pFertilizer = selectP2O5Fertilizer(stage2P, 'at Tillering', preferences, pStatus, locationRec);
            
            if (pFertilizer && pFertilizer.method === 'gromor') {
                const gromorKgs = convertP2O5ToGromorDirect(stage2P, pFertilizer.product, pStatus, locationRec);
                const nutrients = getNutrientsFromGromor(gromorKgs, pFertilizer.product);
                const rounded = roundToBag(gromorKgs);
                
                // Calculate actual nutrients from rounded quantity
                const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                const fertilizerObj = {
                    name: `Gromor ${pFertilizer.product}`,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p, // CRITICAL: Use actual P from rounded quantity, not required
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: topN, p: stage2P, k: topK };
                const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                
                if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination2-stage2-P')) {
                    // Adjust remaining N and K after P fertilizer
                    remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    remainingK = Math.max(0, topK - (stage2DeliveredK + actualNutrients.k));
                } else {
                    console.error(`[Combination2] Failed to add P fertilizer to Tillering - constraint violation!`);
                }
            }
        }
        
        // STEP 2: THEN fulfill remaining N requirement with Urea (or other N fertilizer)
        if (remainingN > 0) {
            const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                // CRITICAL: Cap N addition to respect stage limit
                const maxAllowedN = topN - stage2DeliveredN;
                const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
                
                if (nToAdd > 0) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination3-stage2-N')) {
                        remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    }
                }
            }
        }
        
        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (stageIndex === 1)
        // CRITICAL: K must be 0 in Tillering stage - skip K addition
        // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
        if (remainingK > 0.5) {
            // CRITICAL FIX: Stage 2 is Tillering (index 1) - K not allowed
            const stage2Index = 1; // Tillering stage
            if (stage2Index === 1) {
                const comboName = 'Combination';
                console.warn(`[${comboName}] Stage 2 (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
                // Do not add K fertilizer in Tillering stage
            } else {
                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
                if (kFertilizer) {
                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
                    // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                    const rounded = roundToBag(kKgs);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                    
                    const fertilizerObj = {
                        name: kFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n || 0,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k
                    };
                    
                    // Calculate delivered nutrients so far in stage2
                    let stage2DeliveredN = 0;
                    let stage2DeliveredP = 0;
                    let stage2DeliveredK = 0;
                    stage2.fertilizers.forEach(fert => {
                        stage2DeliveredN += fert.nContributed || 0;
                        stage2DeliveredP += fert.pContributed || 0;
                        stage2DeliveredK += fert.kContributed || 0;
                    });
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    // Use safeAddFertilizer to enforce constraints
                    const comboName = 'combination';
                    safeAddFertilizer(stage2, fertilizerObj, stage2Index, stageTargets, deliveredBefore, `${comboName}-stage2-K`);
                }
            }
        }
        
        // Update cumulative N, P, K after Stage 2
        stage2.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        // CRITICAL: Validate Stage 2 against original targets
        let stage2FinalN = 0;
        let stage2FinalP = 0;
        let stage2FinalK = 0;
        stage2.fertilizers.forEach(fert => {
            stage2FinalN += fert.nContributed || 0;
            stage2FinalP += fert.pContributed || 0;
            stage2FinalK += fert.kContributed || 0;
        });
        
        const stage2NCap = topN * 1.12; // 12% tolerance
        const stage2PCap = stage2P * 1.12;
        const stage2KCap = topK * 1.12;
        
        if (stage2FinalN > stage2NCap) {
            console.error(`[Combination2] Stage 2 (Tillering) N OVERFLOW: ${stage2FinalN.toFixed(2)} > ${stage2NCap.toFixed(2)} (target: ${topN.toFixed(2)})`);
        }
        if (stage2FinalP > stage2PCap) {
            console.error(`[Combination2] Stage 2 (Tillering) P OVERFLOW: ${stage2FinalP.toFixed(2)} > ${stage2PCap.toFixed(2)} (target: ${stage2P.toFixed(2)})`);
        }
        if (stage2FinalK > 0.01) {
            console.error(`[Combination2] Stage 2 (Tillering) K VIOLATION: ${stage2FinalK.toFixed(2)} > 0 (K not allowed in Tillering)`);
        }
        
        recommendations.push(stage2);
    }
    
    // Additional stages - USE ORIGINAL STAGE TARGETS (no rebalancing)
    for (let i = 2; i < nPerSplit.length; i++) {
        // STRICT: Use original stage targets (no rebalancing to compensate for earlier deficits)
        const stageN = nPerSplit[i] || 0; // Original N target (1/3 rule)
        const stageP = pPerSplit[i] || 0; // Original P split (0 for Panicle)
        const stageK = kPerSplit[i] || 0; // Original K split (50% for Panicle)
        
        if (stageN <= 0 && stageK <= 0 && stageP <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        let deliveredN = 0;
        let deliveredP = 0;
        let deliveredK = 0;
        
        // Select N fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageN > 0) {
            const nFertilizer = selectNFertilizer(stageN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                const nKgs = convertNToStraight(stageN, nFertilizer.toLowerCase());
                // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                
                const fertilizerObj = {
                    name: nFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination2-stage3+-N')) {
                    deliveredN += actualNutrients.n;
                }
            }
        }
        
        // Select K fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageK > 0) {
            const kFertilizer = selectKFertilizer(stageK, preferences, sStatus, phStatus);
            if (kFertilizer) {
                const kKgs = convertK2OToStraight(stageK, kFertilizer.toLowerCase());
                const rounded = roundToBagUp(kKgs, 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                
                const fertilizerObj = {
                    name: kFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination2-stage3+-K')) {
                    deliveredK += actualNutrients.k;
                }
            }
        }
        
        // Update cumulative N, P, K after each stage
        stage.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    // FINAL REBALANCING: If total N, P, K are still below minimum, add to appropriate stage
    // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
    const minRequiredN = totalNRequired * 0.88; // 12% tolerance
    const minRequiredP = totalPRequired * 0.88;
    const minRequiredK = totalKRequired * 0.88;
    
    if (recommendations.length > 0) {
        // For Paddy: P should be at Stage 2 (tillering), not Stage 3
        // Find Stage 2 (index 1) if it exists, otherwise use last stage
        const stage2Index = recommendations.findIndex(s => s.stage && s.stage.toLowerCase().includes('tillering'));
        const pStage = stage2Index >= 0 ? recommendations[stage2Index] : recommendations[recommendations.length - 1];
        const lastStage = recommendations[recommendations.length - 1];
        
        // Add N deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeN < minRequiredN) {
            const deficit = totalNRequired - cumulativeN; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // Calculate already delivered nutrients in lastStage
            let lastStageDeliveredN = 0;
            let lastStageDeliveredP = 0;
            let lastStageDeliveredK = 0;
            lastStage.fertilizers.forEach(fert => {
                lastStageDeliveredN += fert.nContributed || 0;
                lastStageDeliveredP += fert.pContributed || 0;
                lastStageDeliveredK += fert.kContributed || 0;
            });
            
            // Check if we can add N without exceeding stage limit
            const maxAllowedN = originalStageN - lastStageDeliveredN;
            const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
            
            if (nToAdd > 0) {
                // Try to get N fertilizer, but if preferences reject all, use Urea anyway (mandatory)
                let nFertilizer = selectNFertilizer(nToAdd, preferences, sStatus, phStatus);
                if (!nFertilizer) {
                    // Fallback: Use Urea if all others are rejected (mandatory to meet minimum)
                    nFertilizer = 'Urea';
                }
                if (nFertilizer) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL: Always round UP to ensure we meet minimum (never round down)
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                    const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                    
                    if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
                        cumulativeN += actualNutrients.n;
                    }
                }
            }
        }
        
        // Add P deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
        if (cumulativeP < minRequiredP) {
            const deficit = totalPRequired - cumulativeP; // Use full requirement, not just 88%
            
            // Determine which stage is pStage (should be Stage 2/Tillering for Paddy)
            const pStageIndex = stage2Index >= 0 ? 1 : recommendations.length - 1;
            const originalStageN = nPerSplit[pStageIndex] || 0;
            const originalStageP = pPerSplit[pStageIndex] || 0;
            const originalStageK = kPerSplit[pStageIndex] || 0;
            
            // CRITICAL: P not allowed in Panicle (stageIndex === 2)
            if (pStageIndex === 2) {
                console.warn(`[Combination2 Final Rebalancing] Cannot add P to pStage (${pStage.stage}) - P not allowed in Panicle stage`);
            } else {
                // Calculate already delivered nutrients in pStage
                let pStageDeliveredN = 0;
                let pStageDeliveredP = 0;
                let pStageDeliveredK = 0;
                pStage.fertilizers.forEach(fert => {
                    pStageDeliveredN += fert.nContributed || 0;
                    pStageDeliveredP += fert.pContributed || 0;
                    pStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add P without exceeding stage limit
                const maxAllowedP = originalStageP - pStageDeliveredP;
                const pToAdd = Math.min(deficit, maxAllowedP > 0 ? maxAllowedP : 0);
                
                if (pToAdd > 0) {
                    // Try to add P through appropriate fertilizer
                    let pFertilizer = selectP2O5Fertilizer(pToAdd, 'Final', preferences, pStatus, locationRec);
                    // If no Gromor product available or rejected, use SSP as fallback (MANDATORY to meet minimum)
                    if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                        // MANDATORY: Use SSP even if rejected - meeting minimum is required
                        pFertilizer = { product: 'SSP', method: 'straight' };
                    }
                    
                    // Always add P fertilizer (mandatory to meet minimum)
                    // CRITICAL: Add to Stage 2 (tillering) for Paddy, not Stage 3
                    if (pFertilizer) {
                        if (pFertilizer && pFertilizer.method === 'gromor') {
                            const gromorKgs = convertP2O5ToGromorDirect(pToAdd, pFertilizer.product, pStatus, locationRec);
                            const rounded = roundToBagUp(gromorKgs, 50); // Round UP to ensure minimum
                            const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                            
                            const fertilizerObj = {
                                name: `Gromor ${pFertilizer.product}`,
                                kgs: rounded.kgs,
                                ...rounded,
                                nContributed: actualNutrients.n,
                                pContributed: actualNutrients.p,
                                kContributed: actualNutrients.k || 0
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P')) {
                                cumulativeP += actualNutrients.p;
                            }
                        } else if (pFertilizer.method === 'straight' && pFertilizer.product === 'SSP') {
                            // SSP: 16% P, 12% S
                            const sspKgs = (pToAdd / 16) * 100;
                            const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                            const actualP = (rounded.kgs * 16) / 100;
                            const actualS = (rounded.kgs * 12) / 100;
                            
                            const fertilizerObj = {
                                name: 'SSP',
                                kgs: rounded.kgs,
                                bags: rounded.kgs / 45,
                                fullBags: Math.floor(rounded.kgs / 45),
                                remainder: rounded.kgs % 45,
                                nContributed: 0,
                                pContributed: actualP,
                                kContributed: 0,
                                sContributed: actualS
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P-SSP')) {
                                cumulativeP += actualP;
                            }
                        }
                    }
                }
            }
        }
        
        // Add K deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeK < minRequiredK) {
            const deficit = totalKRequired - cumulativeK; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // CRITICAL: K not allowed in Tillering (stageIndex === 1)
            if (lastStageIndex === 1) {
                console.warn(`[Combination2 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - K not allowed in Tillering stage`);
            } else {
                // Calculate already delivered nutrients in lastStage
                let lastStageDeliveredN = 0;
                let lastStageDeliveredP = 0;
                let lastStageDeliveredK = 0;
                lastStage.fertilizers.forEach(fert => {
                    lastStageDeliveredN += fert.nContributed || 0;
                    lastStageDeliveredP += fert.pContributed || 0;
                    lastStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add K without exceeding stage limit
                const maxAllowedK = originalStageK - lastStageDeliveredK;
                const kToAdd = Math.min(deficit, maxAllowedK > 0 ? maxAllowedK : 0);
                
                if (kToAdd > 0) {
                    let kFertilizer = selectKFertilizer(kToAdd, preferences, sStatus, phStatus);
                    // Fallback: Use MOP if all others are rejected (mandatory to meet minimum)
                    if (!kFertilizer) {
                        kFertilizer = 'MOP';
                    }
                    if (kFertilizer) {
                        const kKgs = convertK2OToStraight(kToAdd, kFertilizer.toLowerCase());
                        const rounded = roundToBagUp(kKgs, 50);
                        const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                        
                        const fertilizerObj = {
                            name: kFertilizer,
                            kgs: rounded.kgs,
                            ...rounded,
                            nContributed: actualNutrients.n || 0,
                            pContributed: actualNutrients.p || 0,
                            kContributed: actualNutrients.k
                        };
                        
                        const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                        const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                        
                        if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-K')) {
                            cumulativeK += actualNutrients.k;
                        }
                    }
                }
            }
        }
    }
    
    // STAGE-SAFE TOP-UP PASS: Fill remaining headroom in each stage
    applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combination2');
    
    return recommendations;
}

window.calculateCombination3 = function calculateCombination3(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus) {
    const recommendations = [];
    
    // Stage 1: Basal with 14-35-14
    const basalP = pPerSplit[0] || 0; // P at basal (60% for paddy, 100% for others)
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    const gromor143514 = convertP2O5ToGromorDirect(basalP, '14-35-14', pStatus, locationRec);
    const rounded143514 = roundToBag(gromor143514);
    // CRITICAL FIX: Calculate nutrients from ROUNDED quantity, not unrounded
    const actualNutrients143514 = getNutrientsFromGromor(rounded143514.kgs, '14-35-14');
    let remainingN = Math.max(0, basalN - actualNutrients143514.n);
    let remainingK = Math.max(0, basalK - actualNutrients143514.k);
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
    if (checkPreference('14-35-14', preferences) !== 'Reject' && gromor143514 > 0) {
        const fertilizerObj = {
            name: 'Gromor 14-35-14',
            kgs: rounded143514.kgs,
            ...rounded143514,
            nContributed: actualNutrients143514.n,
            pContributed: (rounded143514.kgs * 35) / 100, // Actual P from rounded quantity
            kContributed: actualNutrients143514.k
        };
        const stageTargets = { n: basalN, p: basalP, k: basalK };
        const deliveredBefore = { n: 0, p: 0, k: 0 };
        safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination3-basal-14-35-14');
    }
    
    // Select N fertilizer based on S and pH status - USE safeAddFertilizer
    if (remainingN > 0) {
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
        if (nFertilizer) {
            const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
            // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
            const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: nFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k || 0
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination3-basal-N')) {
                remainingN = Math.max(0, basalN - (stage1DeliveredN + actualNutrients.n));
            }
        }
    }
    
    // Select K fertilizer based on S and pH status - USE safeAddFertilizer
    if (remainingK > 0) {
        const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
            const rounded = roundToBagUp(kKgs, 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: kFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination3-basal-K');
        }
    }
    
    // Calculate actual N, P, K delivered in Stage 1
    let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
    stage1.fertilizers.forEach(fert => {
        cumulativeN += fert.nContributed || 0;
        cumulativeP += fert.pContributed || 0;
        cumulativeK += fert.kContributed || 0;
    });
    
    // Calculate total N, P, K required and remaining
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
    const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
    const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
    const remainingStages = nPerSplit.length - 1;
    
    recommendations.push(stage1);
    
    // Stage 2: First Top - USE ORIGINAL STAGE TARGETS (not adjusted/remaining)
    // EXCEPTION 2: P calculated first because P fertilizers contain N, K, and S
    if (nPerSplit.length > 1) {
        // CRITICAL FIX: Use ORIGINAL stage targets, NOT adjusted/remaining values
        // Stage targets are PRIMARY - we must solve each stage against its original quota
        const originalStage2N = nPerSplit[1] || 0;
        const originalStage2P = pPerSplit[1] || 0;
        const originalStage2K = kPerSplit[1] || 0;
        
        const topN = originalStage2N;
        const topK = originalStage2K;
        const stage2P = originalStage2P;
        
        const stage2 = {
            stage: cropData.splits.n.stages[1],
            fertilizers: []
        };
        
        let remainingN = topN;
        let remainingK = topK;
        
        // STEP 1: FIRST fulfill P requirement (if any)
        // EXCEPTION 4 & 6: Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2
        // SSP should NOT be used at stage 2 (powder form, difficult to apply at 30 days)
        if (stage2P > 0) {
            const pFertilizer = selectP2O5Fertilizer(stage2P, 'at Tillering', preferences, pStatus, locationRec);
            
            if (pFertilizer && pFertilizer.method === 'gromor') {
                const gromorKgs = convertP2O5ToGromorDirect(stage2P, pFertilizer.product, pStatus, locationRec);
                const nutrients = getNutrientsFromGromor(gromorKgs, pFertilizer.product);
                const rounded = roundToBag(gromorKgs);
                
                // Calculate actual nutrients from rounded quantity
                const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                const fertilizerObj = {
                    name: `Gromor ${pFertilizer.product}`,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p, // CRITICAL: Use actual P from rounded quantity, not required
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: topN, p: stage2P, k: topK };
                const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                
                if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination3-stage2-P')) {
                    // Adjust remaining N and K after P fertilizer
                    remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    remainingK = Math.max(0, topK - (stage2DeliveredK + actualNutrients.k));
                } else {
                    console.error(`[Combination2] Failed to add P fertilizer to Tillering - constraint violation!`);
                }
            }
        }
        
        // STEP 2: THEN fulfill remaining N requirement with Urea (or other N fertilizer)
        if (remainingN > 0) {
            const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                // CRITICAL: Cap N addition to respect stage limit
                const maxAllowedN = topN - stage2DeliveredN;
                const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
                
                if (nToAdd > 0) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination3-stage2-N')) {
                        remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    }
                }
            }
        }
        
        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (stageIndex === 1)
        // CRITICAL: K must be 0 in Tillering stage - skip K addition
        // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
        if (remainingK > 0.5) {
            // CRITICAL FIX: Stage 2 is Tillering (index 1) - K not allowed
            const stage2Index = 1; // Tillering stage
            if (stage2Index === 1) {
                const comboName = 'Combination';
                console.warn(`[${comboName}] Stage 2 (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
                // Do not add K fertilizer in Tillering stage
            } else {
                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
                if (kFertilizer) {
                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
                    // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                    const rounded = roundToBag(kKgs);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                    
                    const fertilizerObj = {
                        name: kFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n || 0,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k
                    };
                    
                    // Calculate delivered nutrients so far in stage2
                    let stage2DeliveredN = 0;
                    let stage2DeliveredP = 0;
                    let stage2DeliveredK = 0;
                    stage2.fertilizers.forEach(fert => {
                        stage2DeliveredN += fert.nContributed || 0;
                        stage2DeliveredP += fert.pContributed || 0;
                        stage2DeliveredK += fert.kContributed || 0;
                    });
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    // Use safeAddFertilizer to enforce constraints
                    const comboName = 'combination';
                    safeAddFertilizer(stage2, fertilizerObj, stage2Index, stageTargets, deliveredBefore, `${comboName}-stage2-K`);
                }
            }
        }
        
        // Update cumulative N, P, K after Stage 2
        stage2.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        // CRITICAL: Validate Stage 2 against original targets
        let stage2FinalN = 0;
        let stage2FinalP = 0;
        let stage2FinalK = 0;
        stage2.fertilizers.forEach(fert => {
            stage2FinalN += fert.nContributed || 0;
            stage2FinalP += fert.pContributed || 0;
            stage2FinalK += fert.kContributed || 0;
        });
        
        const stage2NCap = topN * 1.12; // 12% tolerance
        const stage2PCap = stage2P * 1.12;
        const stage2KCap = topK * 1.12;
        
        if (stage2FinalN > stage2NCap) {
            console.error(`[Combination3] Stage 2 (Tillering) N OVERFLOW: ${stage2FinalN.toFixed(2)} > ${stage2NCap.toFixed(2)} (target: ${topN.toFixed(2)})`);
        }
        if (stage2FinalP > stage2PCap) {
            console.error(`[Combination3] Stage 2 (Tillering) P OVERFLOW: ${stage2FinalP.toFixed(2)} > ${stage2PCap.toFixed(2)} (target: ${stage2P.toFixed(2)})`);
        }
        if (stage2FinalK > 0.01) {
            console.error(`[Combination3] Stage 2 (Tillering) K VIOLATION: ${stage2FinalK.toFixed(2)} > 0 (K not allowed in Tillering)`);
        }
        
        recommendations.push(stage2);
    }
    
    // Additional stages - USE ORIGINAL STAGE TARGETS (no rebalancing)
    for (let i = 2; i < nPerSplit.length; i++) {
        // STRICT: Use original stage targets (no rebalancing to compensate for earlier deficits)
        const stageN = nPerSplit[i] || 0; // Original N target (1/3 rule)
        const stageP = pPerSplit[i] || 0; // Original P split (0 for Panicle)
        const stageK = kPerSplit[i] || 0; // Original K split (50% for Panicle)
        
        if (stageN <= 0 && stageK <= 0 && stageP <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        let deliveredN = 0;
        let deliveredP = 0;
        let deliveredK = 0;
        
        // Select N fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageN > 0) {
            const nFertilizer = selectNFertilizer(stageN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                const nKgs = convertNToStraight(stageN, nFertilizer.toLowerCase());
                // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                
                const fertilizerObj = {
                    name: nFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination3-stage3+-N')) {
                    deliveredN += actualNutrients.n;
                }
            }
        }
        
        // Select K fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageK > 0) {
            const kFertilizer = selectKFertilizer(stageK, preferences, sStatus, phStatus);
            if (kFertilizer) {
                const kKgs = convertK2OToStraight(stageK, kFertilizer.toLowerCase());
                const rounded = roundToBagUp(kKgs, 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                
                const fertilizerObj = {
                    name: kFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination3-stage3+-K')) {
                    deliveredK += actualNutrients.k;
                }
            }
        }
        
        // Update cumulative N, P, K after each stage
        stage.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    // FINAL REBALANCING: If total N, P, K are still below minimum, add to appropriate stage
    // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
    const minRequiredN = totalNRequired * 0.88; // 12% tolerance
    const minRequiredP = totalPRequired * 0.88;
    const minRequiredK = totalKRequired * 0.88;
    
    if (recommendations.length > 0) {
        // For Paddy: P should be at Stage 2 (tillering), not Stage 3
        // Find Stage 2 (index 1) if it exists, otherwise use last stage
        const stage2Index = recommendations.findIndex(s => s.stage && s.stage.toLowerCase().includes('tillering'));
        const pStage = stage2Index >= 0 ? recommendations[stage2Index] : recommendations[recommendations.length - 1];
        const lastStage = recommendations[recommendations.length - 1];
        
        // Add N deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeN < minRequiredN) {
            const deficit = totalNRequired - cumulativeN; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // Calculate already delivered nutrients in lastStage
            let lastStageDeliveredN = 0;
            let lastStageDeliveredP = 0;
            let lastStageDeliveredK = 0;
            lastStage.fertilizers.forEach(fert => {
                lastStageDeliveredN += fert.nContributed || 0;
                lastStageDeliveredP += fert.pContributed || 0;
                lastStageDeliveredK += fert.kContributed || 0;
            });
            
            // Check if we can add N without exceeding stage limit
            const maxAllowedN = originalStageN - lastStageDeliveredN;
            const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
            
            if (nToAdd > 0) {
                // Try to get N fertilizer, but if preferences reject all, use Urea anyway (mandatory)
                let nFertilizer = selectNFertilizer(nToAdd, preferences, sStatus, phStatus);
                if (!nFertilizer) {
                    // Fallback: Use Urea if all others are rejected (mandatory to meet minimum)
                    nFertilizer = 'Urea';
                }
                if (nFertilizer) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL: Always round UP to ensure we meet minimum (never round down)
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                    const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                    
                    if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
                        cumulativeN += actualNutrients.n;
                    }
                }
            }
        }
        
        // Add P deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
        if (cumulativeP < minRequiredP) {
            const deficit = totalPRequired - cumulativeP; // Use full requirement, not just 88%
            
            // Determine which stage is pStage (should be Stage 2/Tillering for Paddy)
            const pStageIndex = stage2Index >= 0 ? 1 : recommendations.length - 1;
            const originalStageN = nPerSplit[pStageIndex] || 0;
            const originalStageP = pPerSplit[pStageIndex] || 0;
            const originalStageK = kPerSplit[pStageIndex] || 0;
            
            // CRITICAL: P not allowed in Panicle (stageIndex === 2)
            if (pStageIndex === 2) {
                console.warn(`[Combination3 Final Rebalancing] Cannot add P to pStage (${pStage.stage}) - P not allowed in Panicle stage`);
            } else {
                // Calculate already delivered nutrients in pStage
                let pStageDeliveredN = 0;
                let pStageDeliveredP = 0;
                let pStageDeliveredK = 0;
                pStage.fertilizers.forEach(fert => {
                    pStageDeliveredN += fert.nContributed || 0;
                    pStageDeliveredP += fert.pContributed || 0;
                    pStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add P without exceeding stage limit
                const maxAllowedP = originalStageP - pStageDeliveredP;
                const pToAdd = Math.min(deficit, maxAllowedP > 0 ? maxAllowedP : 0);
                
                if (pToAdd > 0) {
                    // Try to add P through appropriate fertilizer
                    let pFertilizer = selectP2O5Fertilizer(pToAdd, 'Final', preferences, pStatus, locationRec);
                    // If no Gromor product available or rejected, use SSP as fallback (MANDATORY to meet minimum)
                    if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                        // MANDATORY: Use SSP even if rejected - meeting minimum is required
                        pFertilizer = { product: 'SSP', method: 'straight' };
                    }
                    
                    // Always add P fertilizer (mandatory to meet minimum)
                    // CRITICAL: Add to Stage 2 (tillering) for Paddy, not Stage 3
                    if (pFertilizer) {
                        if (pFertilizer && pFertilizer.method === 'gromor') {
                            const gromorKgs = convertP2O5ToGromorDirect(pToAdd, pFertilizer.product, pStatus, locationRec);
                            const rounded = roundToBagUp(gromorKgs, 50); // Round UP to ensure minimum
                            const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                            
                            const fertilizerObj = {
                                name: `Gromor ${pFertilizer.product}`,
                                kgs: rounded.kgs,
                                ...rounded,
                                nContributed: actualNutrients.n,
                                pContributed: actualNutrients.p,
                                kContributed: actualNutrients.k || 0
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P')) {
                                cumulativeP += actualNutrients.p;
                            }
                        } else if (pFertilizer.method === 'straight' && pFertilizer.product === 'SSP') {
                            // SSP: 16% P, 12% S
                            const sspKgs = (pToAdd / 16) * 100;
                            const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                            const actualP = (rounded.kgs * 16) / 100;
                            const actualS = (rounded.kgs * 12) / 100;
                            
                            const fertilizerObj = {
                                name: 'SSP',
                                kgs: rounded.kgs,
                                bags: rounded.kgs / 45,
                                fullBags: Math.floor(rounded.kgs / 45),
                                remainder: rounded.kgs % 45,
                                nContributed: 0,
                                pContributed: actualP,
                                kContributed: 0,
                                sContributed: actualS
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P-SSP')) {
                                cumulativeP += actualP;
                            }
                        }
                    }
                }
            }
        }
        
        // Add K deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeK < minRequiredK) {
            const deficit = totalKRequired - cumulativeK; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // CRITICAL: K not allowed in Tillering (stageIndex === 1)
            if (lastStageIndex === 1) {
                console.warn(`[Combination3 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - K not allowed in Tillering stage`);
            } else {
                // Calculate already delivered nutrients in lastStage
                let lastStageDeliveredN = 0;
                let lastStageDeliveredP = 0;
                let lastStageDeliveredK = 0;
                lastStage.fertilizers.forEach(fert => {
                    lastStageDeliveredN += fert.nContributed || 0;
                    lastStageDeliveredP += fert.pContributed || 0;
                    lastStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add K without exceeding stage limit
                const maxAllowedK = originalStageK - lastStageDeliveredK;
                const kToAdd = Math.min(deficit, maxAllowedK > 0 ? maxAllowedK : 0);
                
                if (kToAdd > 0) {
                    let kFertilizer = selectKFertilizer(kToAdd, preferences, sStatus, phStatus);
                    // Fallback: Use MOP if all others are rejected (mandatory to meet minimum)
                    if (!kFertilizer) {
                        kFertilizer = 'MOP';
                    }
                    if (kFertilizer) {
                        const kKgs = convertK2OToStraight(kToAdd, kFertilizer.toLowerCase());
                        const rounded = roundToBagUp(kKgs, 50);
                        const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                        
                        const fertilizerObj = {
                            name: kFertilizer,
                            kgs: rounded.kgs,
                            ...rounded,
                            nContributed: actualNutrients.n || 0,
                            pContributed: actualNutrients.p || 0,
                            kContributed: actualNutrients.k
                        };
                        
                        const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                        const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                        
                        if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-K')) {
                            cumulativeK += actualNutrients.k;
                        }
                    }
                }
            }
        }
    }
    
    // STAGE-SAFE TOP-UP PASS: Fill remaining headroom in each stage
    applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combination3');
    
    return recommendations;
}

window.calculateCombination4 = function calculateCombination4(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus) {
    const recommendations = [];
    
    // Stage 1: Basal with 28-28-0
    const basalP = pPerSplit[0] || 0; // P at basal (60% for paddy, 100% for others)
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    const gromor28280 = convertP2O5ToGromor(basalP, '28-28-0');
    // Note: remainingN will be recalculated after rounding
    let remainingN = basalN;
    let remainingK = Math.max(0, basalK);
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
    if (checkPreference('28-28-0', preferences) !== 'Reject' && gromor28280 > 0) {
        const rounded28280 = roundToBag(gromor28280);
        // CRITICAL FIX: Calculate nutrients from ROUNDED quantity, not unrounded
        const actualNutrients28280 = getNutrientsFromGromor(rounded28280.kgs, '28-28-0');
        
        const fertilizerObj = {
            name: 'Gromor 28-28-0',
            kgs: rounded28280.kgs,
            ...rounded28280,
            nContributed: actualNutrients28280.n,
            pContributed: (rounded28280.kgs * 28) / 100, // Actual P from rounded quantity
            kContributed: 0
        };
        const stageTargets = { n: basalN, p: basalP, k: basalK };
        const deliveredBefore = { n: 0, p: 0, k: 0 };
        if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination4-basal-28-28-0')) {
            // Recalculate remainingN based on ACTUAL nutrients from rounded quantity
            remainingN = Math.max(0, basalN - actualNutrients28280.n);
        }
    }
    
    // Use 10-26-26 for K if needed - USE safeAddFertilizer
    if (remainingK > 0 && checkPreference('10-26-26', preferences) !== 'Reject') {
        // Use 10-26-26 for partial K requirement
        const partialK = remainingK * 0.5;
        const partialP = partialK * 1.0; // 10-26-26 has 26% P, use K requirement as guide
        const gromor102626 = convertP2O5ToGromorDirect(partialP, '10-26-26', pStatus, locationRec);
        // Note: nutrients will be calculated from rounded quantity
        
        if (gromor102626 > 0) {
            const rounded102626 = roundToBag(gromor102626);
            // CRITICAL FIX: Calculate nutrients from ROUNDED quantity
            const actualNutrients102626 = getNutrientsFromGromor(rounded102626.kgs, '10-26-26');
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: 'Gromor 10-26-26',
                kgs: rounded102626.kgs,
                ...rounded102626,
                nContributed: actualNutrients102626.n,
                pContributed: (rounded102626.kgs * 26) / 100, // Actual P from rounded quantity
                kContributed: actualNutrients102626.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination4-basal-10-26-26')) {
                // Recalculate remainingN and remainingK based on ACTUAL nutrients
                remainingN = Math.max(0, remainingN - actualNutrients102626.n);
                const finalRemainingK = Math.max(0, remainingK - actualNutrients102626.k);
                // Update remainingK for MOP calculation
                remainingK = finalRemainingK;
            }
        }
        
        if (remainingK > 0 && checkPreference('MOP', preferences) !== 'Reject') {
            const mopKgs = convertK2OToStraight(remainingK, 'mop');
            const rounded = roundToBagUp(mopKgs);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, 'mop');
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: 'MOP',
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination4-basal-MOP');
        }
    }
    
    if (remainingN > 0 && checkPreference('Urea', preferences) !== 'Reject') {
        const ureaKgs = convertNToStraight(remainingN, 'urea');
        // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
        const rounded = roundToBagUp(ureaKgs);
        const actualNutrients = getNutrientsFromStraight(rounded.kgs, 'urea');
        
        // Calculate delivered nutrients so far in stage1
        let stage1DeliveredN = 0;
        let stage1DeliveredP = 0;
        let stage1DeliveredK = 0;
        stage1.fertilizers.forEach(fert => {
            stage1DeliveredN += fert.nContributed || 0;
            stage1DeliveredP += fert.pContributed || 0;
            stage1DeliveredK += fert.kContributed || 0;
        });
        
        const fertilizerObj = {
            name: 'Urea',
            kgs: rounded.kgs,
            ...rounded,
            nContributed: actualNutrients.n,
            pContributed: actualNutrients.p || 0,
            kContributed: actualNutrients.k || 0
        };
        
        const stageTargets = { n: basalN, p: basalP, k: basalK };
        const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
        
        if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination4-basal-Urea')) {
            remainingN = Math.max(0, basalN - (stage1DeliveredN + actualNutrients.n));
        }
    }
    
    // Calculate actual N, P, K delivered in Stage 1
    let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
    stage1.fertilizers.forEach(fert => {
        cumulativeN += fert.nContributed || 0;
        cumulativeP += fert.pContributed || 0;
        cumulativeK += fert.kContributed || 0;
    });
    
    // Calculate total N, P, K required and remaining
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
    const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
    const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
    const remainingStages = nPerSplit.length - 1;
    
    recommendations.push(stage1);
    
    // Additional stages - USE ORIGINAL STAGE TARGETS (no rebalancing)
    // EXCEPTION 2: P calculated first because P fertilizers contain N, K, and S
    for (let i = 1; i < nPerSplit.length; i++) {
        // STRICT: Use original stage targets (no rebalancing to compensate for earlier deficits)
        const stageN = nPerSplit[i] || 0; // Original N target (1/3 rule)
        const stageP = pPerSplit[i] || 0; // Original P split (40% for Tillering, 0 for Panicle)
        const stageK = kPerSplit[i] || 0; // Original K split (0 for Tillering, 50% for Panicle)
        
        if (stageN <= 0 && stageK <= 0 && stageP <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        let remainingN = stageN;
        let remainingK = stageK;
        let deliveredN = 0;
        let deliveredP = 0;
        let deliveredK = 0;
        
        // STEP 1: FIRST fulfill P requirement (if any)
        // EXCEPTION 4 & 6: Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2
        // SSP should NOT be used at stage 2 (powder form, difficult to apply at 30 days)
        if (i === 1 && stageP > 0) {
            const pFertilizer = selectP2O5Fertilizer(stageP, 'at Tillering', preferences, pStatus, locationRec);
            
            if (pFertilizer && pFertilizer.method === 'gromor') {
                const gromorKgs = convertP2O5ToGromorDirect(stageP, pFertilizer.product, pStatus, locationRec);
                const nutrients = getNutrientsFromGromor(gromorKgs, pFertilizer.product);
                const rounded = roundToBag(gromorKgs);
                
                // Calculate actual nutrients from rounded quantity
                const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                
                const fertilizerObj = {
                    name: `Gromor ${pFertilizer.product}`,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p, // Use actual P from rounded quantity
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination4-stage2-P')) {
                    deliveredN += actualNutrients.n;
                    deliveredP += actualNutrients.p;
                    deliveredK += actualNutrients.k || 0;
                    // Adjust remaining N and K after P fertilizer
                    remainingN = Math.max(0, stageN - deliveredN);
                    remainingK = Math.max(0, stageK - deliveredK);
                } else {
                    console.error(`[Combination4] Failed to add P fertilizer to Stage ${i} - constraint violation!`);
                }
            }
        }
        
        // STEP 2: THEN fulfill remaining N requirement with Urea (or other N fertilizer)
        if (remainingN > 0) {
            const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                // Recalculate delivered nutrients
                deliveredN = 0;
                deliveredP = 0;
                deliveredK = 0;
                stage.fertilizers.forEach(fert => {
                    deliveredN += fert.nContributed || 0;
                    deliveredP += fert.pContributed || 0;
                    deliveredK += fert.kContributed || 0;
                });
                
                // CRITICAL: Cap N addition to respect stage limit
                const maxAllowedN = stageN - deliveredN;
                const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
                
                if (nToAdd > 0) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: stageN, p: stageP, k: stageK };
                    const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                    
                    if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination4-stage-N')) {
                        deliveredN += actualNutrients.n;
                    }
                }
            }
        }
        
        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (i === 1)
        // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
        if (remainingK > 0.5) {
            // CRITICAL: K not allowed in Tillering (i === 1)
            if (i === 1) {
                console.warn(`[Combination4] Stage ${i} (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
            } else {
                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
                if (kFertilizer) {
                    // Recalculate delivered nutrients
                    deliveredN = 0;
                    deliveredP = 0;
                    deliveredK = 0;
                    stage.fertilizers.forEach(fert => {
                        deliveredN += fert.nContributed || 0;
                        deliveredP += fert.pContributed || 0;
                        deliveredK += fert.kContributed || 0;
                    });
                    
                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
                    // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                    const rounded = roundToBag(kKgs);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                    
                    const fertilizerObj = {
                        name: kFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n || 0,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k
                    };
                    
                    const stageTargets = { n: stageN, p: stageP, k: stageK };
                    const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                    
                    safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination4-stage-K');
                }
            }
        }
        
        // CRITICAL: Validate Stage 2 (i === 1) against original targets
        if (i === 1) {
            let stage2FinalN = 0;
            let stage2FinalP = 0;
            let stage2FinalK = 0;
            stage.fertilizers.forEach(fert => {
                stage2FinalN += fert.nContributed || 0;
                stage2FinalP += fert.pContributed || 0;
                stage2FinalK += fert.kContributed || 0;
            });
            
            const stage2NCap = stageN * 1.12; // 12% tolerance
            const stage2PCap = stageP * 1.12;
            const stage2KCap = stageK * 1.12;
            
            if (stage2FinalN > stage2NCap) {
                console.error(`[Combination4] Stage 2 (Tillering) N OVERFLOW: ${stage2FinalN.toFixed(2)} > ${stage2NCap.toFixed(2)} (target: ${stageN.toFixed(2)})`);
            }
            if (stage2FinalP > stage2PCap) {
                console.error(`[Combination4] Stage 2 (Tillering) P OVERFLOW: ${stage2FinalP.toFixed(2)} > ${stage2PCap.toFixed(2)} (target: ${stageP.toFixed(2)})`);
            }
            if (stage2FinalK > 0.01) {
                console.error(`[Combination4] Stage 2 (Tillering) K VIOLATION: ${stage2FinalK.toFixed(2)} > 0 (K not allowed in Tillering)`);
            }
        }
        
        // Update cumulative N, P, K after each stage
        stage.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    // FINAL REBALANCING: If total N, P, K are still below minimum, add to appropriate stage
    // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
    const minRequiredN = totalNRequired * 0.88; // 12% tolerance
    const minRequiredP = totalPRequired * 0.88;
    const minRequiredK = totalKRequired * 0.88;
    
    if (recommendations.length > 0) {
        // For Paddy: P should be at Stage 2 (tillering), not Stage 3
        // Find Stage 2 (index 1) if it exists, otherwise use last stage
        const stage2Index = recommendations.findIndex(s => s.stage && s.stage.toLowerCase().includes('tillering'));
        const pStage = stage2Index >= 0 ? recommendations[stage2Index] : recommendations[recommendations.length - 1];
        const lastStage = recommendations[recommendations.length - 1];
        
        // Add N deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeN < minRequiredN) {
            const deficit = totalNRequired - cumulativeN; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // Calculate already delivered nutrients in lastStage
            let lastStageDeliveredN = 0;
            let lastStageDeliveredP = 0;
            let lastStageDeliveredK = 0;
            lastStage.fertilizers.forEach(fert => {
                lastStageDeliveredN += fert.nContributed || 0;
                lastStageDeliveredP += fert.pContributed || 0;
                lastStageDeliveredK += fert.kContributed || 0;
            });
            
            // Check if we can add N without exceeding stage limit
            const maxAllowedN = originalStageN - lastStageDeliveredN;
            const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
            
            if (nToAdd > 0) {
                // Try to get N fertilizer, but if preferences reject all, use Urea anyway (mandatory)
                let nFertilizer = selectNFertilizer(nToAdd, preferences, sStatus, phStatus);
                if (!nFertilizer) {
                    // Fallback: Use Urea if all others are rejected (mandatory to meet minimum)
                    nFertilizer = 'Urea';
                }
                if (nFertilizer) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL: Always round UP to ensure we meet minimum (never round down)
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                    const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                    
                    if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
                        cumulativeN += actualNutrients.n;
                    }
                }
            }
        }
        
        // Add P deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
        if (cumulativeP < minRequiredP) {
            const deficit = totalPRequired - cumulativeP; // Use full requirement, not just 88%
            
            // Determine which stage is pStage (should be Stage 2/Tillering for Paddy)
            const pStageIndex = stage2Index >= 0 ? 1 : recommendations.length - 1;
            const originalStageN = nPerSplit[pStageIndex] || 0;
            const originalStageP = pPerSplit[pStageIndex] || 0;
            const originalStageK = kPerSplit[pStageIndex] || 0;
            
            // CRITICAL: P not allowed in Panicle (stageIndex === 2)
            if (pStageIndex === 2) {
                console.warn(`[Combination4 Final Rebalancing] Cannot add P to pStage (${pStage.stage}) - P not allowed in Panicle stage`);
            } else {
                // Calculate already delivered nutrients in pStage
                let pStageDeliveredN = 0;
                let pStageDeliveredP = 0;
                let pStageDeliveredK = 0;
                pStage.fertilizers.forEach(fert => {
                    pStageDeliveredN += fert.nContributed || 0;
                    pStageDeliveredP += fert.pContributed || 0;
                    pStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add P without exceeding stage limit
                const maxAllowedP = originalStageP - pStageDeliveredP;
                const pToAdd = Math.min(deficit, maxAllowedP > 0 ? maxAllowedP : 0);
                
                if (pToAdd > 0) {
                    // Try to add P through appropriate fertilizer
                    let pFertilizer = selectP2O5Fertilizer(pToAdd, 'Final', preferences, pStatus, locationRec);
                    // If no Gromor product available or rejected, use SSP as fallback (MANDATORY to meet minimum)
                    if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                        // MANDATORY: Use SSP even if rejected - meeting minimum is required
                        pFertilizer = { product: 'SSP', method: 'straight' };
                    }
                    
                    // Always add P fertilizer (mandatory to meet minimum)
                    // CRITICAL: Add to Stage 2 (tillering) for Paddy, not Stage 3
                    if (pFertilizer) {
                        if (pFertilizer && pFertilizer.method === 'gromor') {
                            const gromorKgs = convertP2O5ToGromorDirect(pToAdd, pFertilizer.product, pStatus, locationRec);
                            const rounded = roundToBagUp(gromorKgs, 50); // Round UP to ensure minimum
                            const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                            
                            const fertilizerObj = {
                                name: `Gromor ${pFertilizer.product}`,
                                kgs: rounded.kgs,
                                ...rounded,
                                nContributed: actualNutrients.n,
                                pContributed: actualNutrients.p,
                                kContributed: actualNutrients.k || 0
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P')) {
                                cumulativeP += actualNutrients.p;
                            }
                        } else if (pFertilizer.method === 'straight' && pFertilizer.product === 'SSP') {
                            // SSP: 16% P, 12% S
                            const sspKgs = (pToAdd / 16) * 100;
                            const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                            const actualP = (rounded.kgs * 16) / 100;
                            const actualS = (rounded.kgs * 12) / 100;
                            
                            const fertilizerObj = {
                                name: 'SSP',
                                kgs: rounded.kgs,
                                bags: rounded.kgs / 45,
                                fullBags: Math.floor(rounded.kgs / 45),
                                remainder: rounded.kgs % 45,
                                nContributed: 0,
                                pContributed: actualP,
                                kContributed: 0,
                                sContributed: actualS
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P-SSP')) {
                                cumulativeP += actualP;
                            }
                        }
                    }
                }
            }
        }
        
        // Add K deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeK < minRequiredK) {
            const deficit = totalKRequired - cumulativeK; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // CRITICAL: K not allowed in Tillering (stageIndex === 1)
            if (lastStageIndex === 1) {
                console.warn(`[Combination4 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - K not allowed in Tillering stage`);
            } else {
                // Calculate already delivered nutrients in lastStage
                let lastStageDeliveredN = 0;
                let lastStageDeliveredP = 0;
                let lastStageDeliveredK = 0;
                lastStage.fertilizers.forEach(fert => {
                    lastStageDeliveredN += fert.nContributed || 0;
                    lastStageDeliveredP += fert.pContributed || 0;
                    lastStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add K without exceeding stage limit
                const maxAllowedK = originalStageK - lastStageDeliveredK;
                const kToAdd = Math.min(deficit, maxAllowedK > 0 ? maxAllowedK : 0);
                
                if (kToAdd > 0) {
                    let kFertilizer = selectKFertilizer(kToAdd, preferences, sStatus, phStatus);
                    // Fallback: Use MOP if all others are rejected (mandatory to meet minimum)
                    if (!kFertilizer) {
                        kFertilizer = 'MOP';
                    }
                    if (kFertilizer) {
                        const kKgs = convertK2OToStraight(kToAdd, kFertilizer.toLowerCase());
                        const rounded = roundToBagUp(kKgs, 50);
                        const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                        
                        const fertilizerObj = {
                            name: kFertilizer,
                            kgs: rounded.kgs,
                            ...rounded,
                            nContributed: actualNutrients.n || 0,
                            pContributed: actualNutrients.p || 0,
                            kContributed: actualNutrients.k
                        };
                        
                        const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                        const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                        
                        if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-K')) {
                            cumulativeK += actualNutrients.k;
                        }
                    }
                }
            }
        }
    }
    
    // STAGE-SAFE TOP-UP PASS: Fill remaining headroom in each stage
    applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combination4');
    
    return recommendations;
}

window.calculateCombination5 = function calculateCombination5(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus) {
    const recommendations = [];
    
    // Stage 1: Basal with 28-28-0
    const basalP = pPerSplit[0] || 0; // P at basal (60% for paddy, 100% for others)
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    const gromor28280 = convertP2O5ToGromorDirect(basalP, '28-28-0', pStatus, locationRec);
    const rounded28280 = roundToBag(gromor28280);
    // CRITICAL FIX: Calculate nutrients from ROUNDED quantity, not unrounded
    const actualNutrients28280 = getNutrientsFromGromor(rounded28280.kgs, '28-28-0');
    let remainingN = Math.max(0, basalN - actualNutrients28280.n);
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
        if (checkPreference('28-28-0', preferences) !== 'Reject' && gromor28280 > 0) {
            const fertilizerObj = {
                name: 'Gromor 28-28-0',
                kgs: rounded28280.kgs,
                ...rounded28280,
                nContributed: actualNutrients28280.n,
                pContributed: (rounded28280.kgs * 28) / 100, // Actual P from rounded quantity
                kContributed: 0
            };
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: 0, p: 0, k: 0 };
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination5-basal-28-28-0');
        }
    
    // Select N fertilizer based on S and pH status - USE safeAddFertilizer
    if (remainingN > 0) {
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
        if (nFertilizer) {
            const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
            // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
            const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: nFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k || 0
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination5-basal-N')) {
                remainingN = Math.max(0, basalN - (stage1DeliveredN + actualNutrients.n));
            }
        }
    }
    
    // Select K fertilizer based on S and pH status - USE safeAddFertilizer
    if (basalK > 0) {
        const kFertilizer = selectKFertilizer(basalK, preferences, sStatus, phStatus);
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(basalK, kFertilizer.toLowerCase());
            const rounded = roundToBagUp(kKgs, 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: kFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination5-basal-K');
        }
    }
    
    // Calculate actual N, P, K delivered in Stage 1
    let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
    stage1.fertilizers.forEach(fert => {
        cumulativeN += fert.nContributed || 0;
        cumulativeP += fert.pContributed || 0;
        cumulativeK += fert.kContributed || 0;
    });
    
    // Calculate total N, P, K required and remaining
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
    const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
    const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
    const remainingStages = nPerSplit.length - 1;
    
    recommendations.push(stage1);
    
    // Stage 2: First Top - USE ORIGINAL STAGE TARGETS (not adjusted/remaining)
    // EXCEPTION 2: P calculated first because P fertilizers contain N, K, and S
    if (nPerSplit.length > 1) {
        // CRITICAL FIX: Use ORIGINAL stage targets, NOT adjusted/remaining values
        // Stage targets are PRIMARY - we must solve each stage against its original quota
        const originalStage2N = nPerSplit[1] || 0;
        const originalStage2P = pPerSplit[1] || 0;
        const originalStage2K = kPerSplit[1] || 0;
        
        const topN = originalStage2N;
        const topK = originalStage2K;
        const stage2P = originalStage2P;
        
        const stage2 = {
            stage: cropData.splits.n.stages[1],
            fertilizers: []
        };
        
        let remainingN = topN;
        let remainingK = topK;
        
        // STEP 1: FIRST fulfill P requirement (if any)
        // EXCEPTION 4 & 6: Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2
        // SSP should NOT be used at stage 2 (powder form, difficult to apply at 30 days)
        if (stage2P > 0) {
            const pFertilizer = selectP2O5Fertilizer(stage2P, 'at Tillering', preferences, pStatus, locationRec);
            
            if (pFertilizer && pFertilizer.method === 'gromor') {
                const gromorKgs = convertP2O5ToGromorDirect(stage2P, pFertilizer.product, pStatus, locationRec);
                const nutrients = getNutrientsFromGromor(gromorKgs, pFertilizer.product);
                const rounded = roundToBag(gromorKgs);
                
                // Calculate actual nutrients from rounded quantity
                const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                const fertilizerObj = {
                    name: `Gromor ${pFertilizer.product}`,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p, // CRITICAL: Use actual P from rounded quantity, not required
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: topN, p: stage2P, k: topK };
                const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                
                if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination5-stage2-P')) {
                    // Adjust remaining N and K after P fertilizer
                    remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    remainingK = Math.max(0, topK - (stage2DeliveredK + actualNutrients.k));
                } else {
                    console.error(`[Combination5] Failed to add P fertilizer to Tillering - constraint violation!`);
                }
            }
        }
        
        // STEP 2: THEN fulfill remaining N requirement with Urea (or other N fertilizer)
        if (remainingN > 0) {
            const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                // CRITICAL: Cap N addition to respect stage limit
                const maxAllowedN = topN - stage2DeliveredN;
                const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
                
                if (nToAdd > 0) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination5-stage2-N')) {
                        remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    }
                }
            }
        }
        
        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (stageIndex === 1)
        // CRITICAL: K must be 0 in Tillering stage - skip K addition
        // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
        if (remainingK > 0.5) {
            // CRITICAL FIX: Stage 2 is Tillering (index 1) - K not allowed
            const stage2Index = 1; // Tillering stage
            if (stage2Index === 1) {
                const comboName = 'Combination';
                console.warn(`[${comboName}] Stage 2 (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
                // Do not add K fertilizer in Tillering stage
            } else {
                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
                if (kFertilizer) {
                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
                    // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                    const rounded = roundToBag(kKgs);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                    
                    const fertilizerObj = {
                        name: kFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n || 0,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k
                    };
                    
                    // Calculate delivered nutrients so far in stage2
                    let stage2DeliveredN = 0;
                    let stage2DeliveredP = 0;
                    let stage2DeliveredK = 0;
                    stage2.fertilizers.forEach(fert => {
                        stage2DeliveredN += fert.nContributed || 0;
                        stage2DeliveredP += fert.pContributed || 0;
                        stage2DeliveredK += fert.kContributed || 0;
                    });
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    // Use safeAddFertilizer to enforce constraints
                    const comboName = 'combination';
                    safeAddFertilizer(stage2, fertilizerObj, stage2Index, stageTargets, deliveredBefore, `${comboName}-stage2-K`);
                }
            }
        }
        
        // CRITICAL: Validate Stage 2 against original targets
        let stage2FinalN = 0;
        let stage2FinalP = 0;
        let stage2FinalK = 0;
        stage2.fertilizers.forEach(fert => {
            stage2FinalN += fert.nContributed || 0;
            stage2FinalP += fert.pContributed || 0;
            stage2FinalK += fert.kContributed || 0;
        });
        
        const stage2NCap = topN * 1.12; // 12% tolerance
        const stage2PCap = stage2P * 1.12;
        const stage2KCap = topK * 1.12;
        
        if (stage2FinalN > stage2NCap) {
            console.error(`[Combination5] Stage 2 (Tillering) N OVERFLOW: ${stage2FinalN.toFixed(2)} > ${stage2NCap.toFixed(2)} (target: ${topN.toFixed(2)})`);
        }
        if (stage2FinalP > stage2PCap) {
            console.error(`[Combination5] Stage 2 (Tillering) P OVERFLOW: ${stage2FinalP.toFixed(2)} > ${stage2PCap.toFixed(2)} (target: ${stage2P.toFixed(2)})`);
        }
        if (stage2FinalK > 0.01) {
            console.error(`[Combination5] Stage 2 (Tillering) K VIOLATION: ${stage2FinalK.toFixed(2)} > 0 (K not allowed in Tillering)`);
        }
        
        // Update cumulative N, P, K after Stage 2
        stage2.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        recommendations.push(stage2);
    }
    
    // Additional stages - USE ORIGINAL STAGE TARGETS (no rebalancing)
    for (let i = 2; i < nPerSplit.length; i++) {
        // STRICT: Use original stage targets (no rebalancing to compensate for earlier deficits)
        const stageN = nPerSplit[i] || 0; // Original N target (1/3 rule)
        const stageP = pPerSplit[i] || 0; // Original P split (0 for Panicle)
        const stageK = kPerSplit[i] || 0; // Original K split (50% for Panicle)
        
        if (stageN <= 0 && stageK <= 0 && stageP <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        let deliveredN = 0;
        let deliveredP = 0;
        let deliveredK = 0;
        
        // Select N fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageN > 0) {
            const nFertilizer = selectNFertilizer(stageN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                const nKgs = convertNToStraight(stageN, nFertilizer.toLowerCase());
                // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                
                const fertilizerObj = {
                    name: nFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination5-stage3+-N')) {
                    deliveredN += actualNutrients.n;
                }
            }
        }
        
        // Select K fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageK > 0) {
            const kFertilizer = selectKFertilizer(stageK, preferences, sStatus, phStatus);
            if (kFertilizer) {
                const kKgs = convertK2OToStraight(stageK, kFertilizer.toLowerCase());
                const rounded = roundToBagUp(kKgs, 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                
                const fertilizerObj = {
                    name: kFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination5-stage3+-K')) {
                    deliveredK += actualNutrients.k;
                }
            }
        }
        
        // Update cumulative N, P, K after each stage
        stage.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    // FINAL REBALANCING: If total N, P, K are still below minimum, add to appropriate stage
    // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
    const minRequiredN = totalNRequired * 0.88; // 12% tolerance
    const minRequiredP = totalPRequired * 0.88;
    const minRequiredK = totalKRequired * 0.88;
    
    if (recommendations.length > 0) {
        // For Paddy: P should be at Stage 2 (tillering), not Stage 3
        // Find Stage 2 (index 1) if it exists, otherwise use last stage
        const stage2Index = recommendations.findIndex(s => s.stage && s.stage.toLowerCase().includes('tillering'));
        const pStage = stage2Index >= 0 ? recommendations[stage2Index] : recommendations[recommendations.length - 1];
        const lastStage = recommendations[recommendations.length - 1];
        
        // Add N deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeN < minRequiredN) {
            const deficit = totalNRequired - cumulativeN; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // Calculate already delivered nutrients in lastStage
            let lastStageDeliveredN = 0;
            let lastStageDeliveredP = 0;
            let lastStageDeliveredK = 0;
            lastStage.fertilizers.forEach(fert => {
                lastStageDeliveredN += fert.nContributed || 0;
                lastStageDeliveredP += fert.pContributed || 0;
                lastStageDeliveredK += fert.kContributed || 0;
            });
            
            // Check if we can add N without exceeding stage limit
            const maxAllowedN = originalStageN - lastStageDeliveredN;
            const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
            
            if (nToAdd > 0) {
                // Try to get N fertilizer, but if preferences reject all, use Urea anyway (mandatory)
                let nFertilizer = selectNFertilizer(nToAdd, preferences, sStatus, phStatus);
                if (!nFertilizer) {
                    // Fallback: Use Urea if all others are rejected (mandatory to meet minimum)
                    nFertilizer = 'Urea';
                }
                if (nFertilizer) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL: Always round UP to ensure we meet minimum (never round down)
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                    const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                    
                    if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
                        cumulativeN += actualNutrients.n;
                    }
                }
            }
        }
        
        // Add P deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
        if (cumulativeP < minRequiredP) {
            const deficit = totalPRequired - cumulativeP; // Use full requirement, not just 88%
            
            // Determine which stage is pStage (should be Stage 2/Tillering for Paddy)
            const pStageIndex = stage2Index >= 0 ? 1 : recommendations.length - 1;
            const originalStageN = nPerSplit[pStageIndex] || 0;
            const originalStageP = pPerSplit[pStageIndex] || 0;
            const originalStageK = kPerSplit[pStageIndex] || 0;
            
            // CRITICAL: P not allowed in Panicle (stageIndex === 2)
            if (pStageIndex === 2) {
                console.warn(`[Combination5 Final Rebalancing] Cannot add P to pStage (${pStage.stage}) - P not allowed in Panicle stage`);
            } else {
                // Calculate already delivered nutrients in pStage
                let pStageDeliveredN = 0;
                let pStageDeliveredP = 0;
                let pStageDeliveredK = 0;
                pStage.fertilizers.forEach(fert => {
                    pStageDeliveredN += fert.nContributed || 0;
                    pStageDeliveredP += fert.pContributed || 0;
                    pStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add P without exceeding stage limit
                const maxAllowedP = originalStageP - pStageDeliveredP;
                const pToAdd = Math.min(deficit, maxAllowedP > 0 ? maxAllowedP : 0);
                
                if (pToAdd > 0) {
                    // Try to add P through appropriate fertilizer
                    let pFertilizer = selectP2O5Fertilizer(pToAdd, 'Final', preferences, pStatus, locationRec);
                    // If no Gromor product available or rejected, use SSP as fallback (MANDATORY to meet minimum)
                    if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                        // MANDATORY: Use SSP even if rejected - meeting minimum is required
                        pFertilizer = { product: 'SSP', method: 'straight' };
                    }
                    
                    // Always add P fertilizer (mandatory to meet minimum)
                    // CRITICAL: Add to Stage 2 (tillering) for Paddy, not Stage 3
                    if (pFertilizer) {
                        if (pFertilizer && pFertilizer.method === 'gromor') {
                            const gromorKgs = convertP2O5ToGromorDirect(pToAdd, pFertilizer.product, pStatus, locationRec);
                            const rounded = roundToBagUp(gromorKgs, 50); // Round UP to ensure minimum
                            const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                            
                            const fertilizerObj = {
                                name: `Gromor ${pFertilizer.product}`,
                                kgs: rounded.kgs,
                                ...rounded,
                                nContributed: actualNutrients.n,
                                pContributed: actualNutrients.p,
                                kContributed: actualNutrients.k || 0
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P')) {
                                cumulativeP += actualNutrients.p;
                            }
                        } else if (pFertilizer.method === 'straight' && pFertilizer.product === 'SSP') {
                            // SSP: 16% P, 12% S
                            const sspKgs = (pToAdd / 16) * 100;
                            const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                            const actualP = (rounded.kgs * 16) / 100;
                            const actualS = (rounded.kgs * 12) / 100;
                            
                            const fertilizerObj = {
                                name: 'SSP',
                                kgs: rounded.kgs,
                                bags: rounded.kgs / 45,
                                fullBags: Math.floor(rounded.kgs / 45),
                                remainder: rounded.kgs % 45,
                                nContributed: 0,
                                pContributed: actualP,
                                kContributed: 0,
                                sContributed: actualS
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P-SSP')) {
                                cumulativeP += actualP;
                            }
                        }
                    }
                }
            }
        }
        
        // Add K deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeK < minRequiredK) {
            const deficit = totalKRequired - cumulativeK; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // CRITICAL: K not allowed in Tillering (stageIndex === 1)
            if (lastStageIndex === 1) {
                console.warn(`[Combination5 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - K not allowed in Tillering stage`);
            } else {
                // Calculate already delivered nutrients in lastStage
                let lastStageDeliveredN = 0;
                let lastStageDeliveredP = 0;
                let lastStageDeliveredK = 0;
                lastStage.fertilizers.forEach(fert => {
                    lastStageDeliveredN += fert.nContributed || 0;
                    lastStageDeliveredP += fert.pContributed || 0;
                    lastStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add K without exceeding stage limit
                const maxAllowedK = originalStageK - lastStageDeliveredK;
                const kToAdd = Math.min(deficit, maxAllowedK > 0 ? maxAllowedK : 0);
                
                if (kToAdd > 0) {
                    let kFertilizer = selectKFertilizer(kToAdd, preferences, sStatus, phStatus);
                    // Fallback: Use MOP if all others are rejected (mandatory to meet minimum)
                    if (!kFertilizer) {
                        kFertilizer = 'MOP';
                    }
                    if (kFertilizer) {
                        const kKgs = convertK2OToStraight(kToAdd, kFertilizer.toLowerCase());
                        const rounded = roundToBagUp(kKgs, 50);
                        const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                        
                        const fertilizerObj = {
                            name: kFertilizer,
                            kgs: rounded.kgs,
                            ...rounded,
                            nContributed: actualNutrients.n || 0,
                            pContributed: actualNutrients.p || 0,
                            kContributed: actualNutrients.k
                        };
                        
                        const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                        const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                        
                        if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-K')) {
                            cumulativeK += actualNutrients.k;
                        }
                    }
                }
            }
        }
    }
    
    // STAGE-SAFE TOP-UP PASS: Fill remaining headroom in each stage
    applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combination5');
    
    return recommendations;
}

window.calculateCombination6 = function calculateCombination6(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus) {
    const recommendations = [];
    
    // Stage 1: Basal with 14-35-14
    const basalP = pPerSplit[0] || 0; // P at basal (60% for paddy, 100% for others)
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    const gromor143514 = convertP2O5ToGromorDirect(basalP, '14-35-14', pStatus, locationRec);
    const rounded143514 = roundToBag(gromor143514);
    // CRITICAL FIX: Calculate nutrients from ROUNDED quantity, not unrounded
    const actualNutrients143514 = getNutrientsFromGromor(rounded143514.kgs, '14-35-14');
    let remainingN = Math.max(0, basalN - actualNutrients143514.n);
    let remainingK = Math.max(0, basalK - actualNutrients143514.k);
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
    if (checkPreference('14-35-14', preferences) !== 'Reject' && gromor143514 > 0) {
        const fertilizerObj = {
            name: 'Gromor 14-35-14',
            kgs: rounded143514.kgs,
            ...rounded143514,
            nContributed: actualNutrients143514.n,
            pContributed: (rounded143514.kgs * 35) / 100, // Actual P from rounded quantity
            kContributed: actualNutrients143514.k
        };
        const stageTargets = { n: basalN, p: basalP, k: basalK };
        const deliveredBefore = { n: 0, p: 0, k: 0 }; // Initial state for first fertilizer
        safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination6-basal-14-35-14');
    }
    
    // Select N fertilizer based on S and pH status
    if (remainingN > 0) {
        const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
        if (nFertilizer) {
            const nKgs = convertNToStraight(remainingN, nFertilizer.toLowerCase());
            // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
            const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: nFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k || 0
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            if (safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination6-basal-N')) {
                remainingN = Math.max(0, basalN - (stage1DeliveredN + actualNutrients.n));
            }
        }
    }
    
    // Select K fertilizer based on S and pH status
    // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
    if (remainingK > 0.5) {
        const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
        if (kFertilizer) {
            const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
            // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
            const rounded = roundToBag(kKgs);
            const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
            
            // Calculate delivered nutrients so far in stage1
            let stage1DeliveredN = 0;
            let stage1DeliveredP = 0;
            let stage1DeliveredK = 0;
            stage1.fertilizers.forEach(fert => {
                stage1DeliveredN += fert.nContributed || 0;
                stage1DeliveredP += fert.pContributed || 0;
                stage1DeliveredK += fert.kContributed || 0;
            });
            
            const fertilizerObj = {
                name: kFertilizer,
                kgs: rounded.kgs,
                ...rounded,
                nContributed: actualNutrients.n || 0,
                pContributed: actualNutrients.p || 0,
                kContributed: actualNutrients.k
            };
            
            const stageTargets = { n: basalN, p: basalP, k: basalK };
            const deliveredBefore = { n: stage1DeliveredN, p: stage1DeliveredP, k: stage1DeliveredK };
            
            safeAddFertilizer(stage1, fertilizerObj, 0, stageTargets, deliveredBefore, 'combination6-basal-K');
        }
    }
    
    // Calculate actual N, P, K delivered in Stage 1
    let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
    stage1.fertilizers.forEach(fert => {
        cumulativeN += fert.nContributed || 0;
        cumulativeP += fert.pContributed || 0;
        cumulativeK += fert.kContributed || 0;
    });
    
    // Calculate total N, P, K required and remaining
    const totalNRequired = nPerSplit.reduce((sum, n) => sum + n, 0);
    const totalPRequired = pPerSplit.reduce((sum, p) => sum + p, 0);
    const totalKRequired = kPerSplit.reduce((sum, k) => sum + k, 0);
    const remainingNTotal = Math.max(0, totalNRequired - cumulativeN);
    const remainingPTotal = Math.max(0, totalPRequired - cumulativeP);
    const remainingKTotal = Math.max(0, totalKRequired - cumulativeK);
    const remainingStages = nPerSplit.length - 1;
    
    recommendations.push(stage1);
    
    // Stage 2: First Top - USE ORIGINAL STAGE TARGETS (not adjusted/remaining)
    // EXCEPTION 2: P calculated first because P fertilizers contain N, K, and S
    if (nPerSplit.length > 1) {
        // CRITICAL FIX: Use ORIGINAL stage targets, NOT adjusted/remaining values
        // Stage targets are PRIMARY - we must solve each stage against its original quota
        const originalStage2N = nPerSplit[1] || 0;
        const originalStage2P = pPerSplit[1] || 0;
        const originalStage2K = kPerSplit[1] || 0;
        
        const topN = originalStage2N;
        const topK = originalStage2K;
        const stage2P = originalStage2P;
        
        const stage2 = {
            stage: cropData.splits.n.stages[1],
            fertilizers: []
        };
        
        let remainingN = topN;
        let remainingK = topK;
        
        // STEP 1: FIRST fulfill P requirement (if any)
        // EXCEPTION 4 & 6: Use low P fertilizers (20-20-0-13, 16-20-0-13, 28-28-0) at stage 2
        // SSP should NOT be used at stage 2 (powder form, difficult to apply at 30 days)
        if (stage2P > 0) {
            const pFertilizer = selectP2O5Fertilizer(stage2P, 'at Tillering', preferences, pStatus, locationRec);
            
            if (pFertilizer && pFertilizer.method === 'gromor') {
                const gromorKgs = convertP2O5ToGromorDirect(stage2P, pFertilizer.product, pStatus, locationRec);
                const nutrients = getNutrientsFromGromor(gromorKgs, pFertilizer.product);
                const rounded = roundToBag(gromorKgs);
                
                // Calculate actual nutrients from rounded quantity
                const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                const fertilizerObj = {
                    name: `Gromor ${pFertilizer.product}`,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p, // CRITICAL: Use actual P from rounded quantity, not required
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: topN, p: stage2P, k: topK };
                const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                
                if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination6-stage2-P')) {
                    // Adjust remaining N and K after P fertilizer
                    remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    remainingK = Math.max(0, topK - (stage2DeliveredK + actualNutrients.k));
                } else {
                    console.error(`[Combination2] Failed to add P fertilizer to Tillering - constraint violation!`);
                }
            }
        }
        
        // STEP 2: THEN fulfill remaining N requirement with Urea (or other N fertilizer)
        if (remainingN > 0) {
            const nFertilizer = selectNFertilizer(remainingN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                // Calculate delivered nutrients so far in stage2
                let stage2DeliveredN = 0;
                let stage2DeliveredP = 0;
                let stage2DeliveredK = 0;
                stage2.fertilizers.forEach(fert => {
                    stage2DeliveredN += fert.nContributed || 0;
                    stage2DeliveredP += fert.pContributed || 0;
                    stage2DeliveredK += fert.kContributed || 0;
                });
                
                // CRITICAL: Cap N addition to respect stage limit
                const maxAllowedN = topN - stage2DeliveredN;
                const nToAdd = Math.min(remainingN, maxAllowedN > 0 ? maxAllowedN : 0);
                
                if (nToAdd > 0) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    if (safeAddFertilizer(stage2, fertilizerObj, 1, stageTargets, deliveredBefore, 'combination2-stage2-N')) {
                        remainingN = Math.max(0, topN - (stage2DeliveredN + actualNutrients.n));
                    }
                }
            }
        }
        
        // STEP 3: Add K fertilizer if needed - BUT K NOT ALLOWED IN TILLERING (stageIndex === 1)
        // CRITICAL: K must be 0 in Tillering stage - skip K addition
        // Only add K if remainingK is significant (> 0.5 kg) to avoid excessive rounding
        if (remainingK > 0.5) {
            // CRITICAL FIX: Stage 2 is Tillering (index 1) - K not allowed
            const stage2Index = 1; // Tillering stage
            if (stage2Index === 1) {
                const comboName = 'Combination';
                console.warn(`[${comboName}] Stage 2 (Tillering): K remaining=${remainingK.toFixed(2)} but K not allowed in Tillering - skipping K addition`);
                // Do not add K fertilizer in Tillering stage
            } else {
                const kFertilizer = selectKFertilizer(remainingK, preferences, sStatus, phStatus);
                if (kFertilizer) {
                    const kKgs = convertK2OToStraight(remainingK, kFertilizer.toLowerCase());
                    // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                    const rounded = roundToBag(kKgs);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                    
                    const fertilizerObj = {
                        name: kFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n || 0,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k
                    };
                    
                    // Calculate delivered nutrients so far in stage2
                    let stage2DeliveredN = 0;
                    let stage2DeliveredP = 0;
                    let stage2DeliveredK = 0;
                    stage2.fertilizers.forEach(fert => {
                        stage2DeliveredN += fert.nContributed || 0;
                        stage2DeliveredP += fert.pContributed || 0;
                        stage2DeliveredK += fert.kContributed || 0;
                    });
                    
                    const stageTargets = { n: topN, p: stage2P, k: topK };
                    const deliveredBefore = { n: stage2DeliveredN, p: stage2DeliveredP, k: stage2DeliveredK };
                    
                    // Use safeAddFertilizer to enforce constraints
                    const comboName = 'combination';
                    safeAddFertilizer(stage2, fertilizerObj, stage2Index, stageTargets, deliveredBefore, `${comboName}-stage2-K`);
                }
            }
        }
        
        // CRITICAL: Validate Stage 2 against original targets
        let stage2FinalN = 0;
        let stage2FinalP = 0;
        let stage2FinalK = 0;
        stage2.fertilizers.forEach(fert => {
            stage2FinalN += fert.nContributed || 0;
            stage2FinalP += fert.pContributed || 0;
            stage2FinalK += fert.kContributed || 0;
        });
        
        const stage2NCap = topN * 1.12; // 12% tolerance
        const stage2PCap = stage2P * 1.12;
        const stage2KCap = topK * 1.12;
        
        if (stage2FinalN > stage2NCap) {
            console.error(`[Combination2] Stage 2 (Tillering) N OVERFLOW: ${stage2FinalN.toFixed(2)} > ${stage2NCap.toFixed(2)} (target: ${topN.toFixed(2)})`);
        }
        if (stage2FinalP > stage2PCap) {
            console.error(`[Combination2] Stage 2 (Tillering) P OVERFLOW: ${stage2FinalP.toFixed(2)} > ${stage2PCap.toFixed(2)} (target: ${stage2P.toFixed(2)})`);
        }
        if (stage2FinalK > 0.01) {
            console.error(`[Combination2] Stage 2 (Tillering) K VIOLATION: ${stage2FinalK.toFixed(2)} > 0 (K not allowed in Tillering)`);
        }
        
        // Update cumulative N, P, K after Stage 2
        stage2.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        recommendations.push(stage2);
    }
    
    // Additional stages - USE ORIGINAL STAGE TARGETS (no rebalancing)
    for (let i = 2; i < nPerSplit.length; i++) {
        // STRICT: Use original stage targets (no rebalancing to compensate for earlier deficits)
        const stageN = nPerSplit[i] || 0; // Original N target (1/3 rule)
        const stageP = pPerSplit[i] || 0; // Original P split (0 for Panicle)
        const stageK = kPerSplit[i] || 0; // Original K split (50% for Panicle)
        
        if (stageN <= 0 && stageK <= 0 && stageP <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        let deliveredN = 0;
        let deliveredP = 0;
        let deliveredK = 0;
        
        // Select N fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageN > 0) {
            const nFertilizer = selectNFertilizer(stageN, preferences, sStatus, phStatus);
            if (nFertilizer) {
                const nKgs = convertNToStraight(stageN, nFertilizer.toLowerCase());
                // CRITICAL FIX: Use roundToBagUp for N to ensure minimum requirements are met
                const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                
                const fertilizerObj = {
                    name: nFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k || 0
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination6-stage3+-N')) {
                    deliveredN += actualNutrients.n;
                }
            }
        }
        
        // Select K fertilizer based on S and pH status - USE safeAddFertilizer
        if (stageK > 0.5) {
            const kFertilizer = selectKFertilizer(stageK, preferences, sStatus, phStatus);
            if (kFertilizer) {
                const kKgs = convertK2OToStraight(stageK, kFertilizer.toLowerCase());
                // Use roundToBag (rounds to nearest) instead of roundToBagUp to minimize excess
                const rounded = roundToBag(kKgs);
                const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                
                const fertilizerObj = {
                    name: kFertilizer,
                    kgs: rounded.kgs,
                    ...rounded,
                    nContributed: actualNutrients.n || 0,
                    pContributed: actualNutrients.p || 0,
                    kContributed: actualNutrients.k
                };
                
                const stageTargets = { n: stageN, p: stageP, k: stageK };
                const deliveredBefore = { n: deliveredN, p: deliveredP, k: deliveredK };
                
                if (safeAddFertilizer(stage, fertilizerObj, i, stageTargets, deliveredBefore, 'combination6-stage3+-K')) {
                    deliveredK += actualNutrients.k;
                }
            }
        }
        
        // Update cumulative N, P, K after each stage
        stage.fertilizers.forEach(fert => {
            cumulativeN += fert.nContributed || 0;
            cumulativeP += fert.pContributed || 0;
            cumulativeK += fert.kContributed || 0;
        });
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    // FINAL REBALANCING: If total N, P, K are still below minimum, add to appropriate stage
    // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
    const minRequiredN = totalNRequired * 0.88; // 12% tolerance
    const minRequiredP = totalPRequired * 0.88;
    const minRequiredK = totalKRequired * 0.88;
    
    if (recommendations.length > 0) {
        // For Paddy: P should be at Stage 2 (tillering), not Stage 3
        // Find Stage 2 (index 1) if it exists, otherwise use last stage
        const stage2Index = recommendations.findIndex(s => s.stage && s.stage.toLowerCase().includes('tillering'));
        const pStage = stage2Index >= 0 ? recommendations[stage2Index] : recommendations[recommendations.length - 1];
        const lastStage = recommendations[recommendations.length - 1];
        
        // Add N deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeN < minRequiredN) {
            const deficit = totalNRequired - cumulativeN; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // Calculate already delivered nutrients in lastStage
            let lastStageDeliveredN = 0;
            let lastStageDeliveredP = 0;
            let lastStageDeliveredK = 0;
            lastStage.fertilizers.forEach(fert => {
                lastStageDeliveredN += fert.nContributed || 0;
                lastStageDeliveredP += fert.pContributed || 0;
                lastStageDeliveredK += fert.kContributed || 0;
            });
            
            // Check if we can add N without exceeding stage limit
            const maxAllowedN = originalStageN - lastStageDeliveredN;
            const nToAdd = Math.min(deficit, maxAllowedN > 0 ? maxAllowedN : 0);
            
            if (nToAdd > 0) {
                // Try to get N fertilizer, but if preferences reject all, use Urea anyway (mandatory)
                let nFertilizer = selectNFertilizer(nToAdd, preferences, sStatus, phStatus);
                if (!nFertilizer) {
                    // Fallback: Use Urea if all others are rejected (mandatory to meet minimum)
                    nFertilizer = 'Urea';
                }
                if (nFertilizer) {
                    const nKgs = convertNToStraight(nToAdd, nFertilizer.toLowerCase());
                    // CRITICAL: Always round UP to ensure we meet minimum (never round down)
                    const rounded = roundToBagUp(nKgs, nFertilizer && nFertilizer.toLowerCase() === 'urea' ? 45 : 50);
                    const actualNutrients = getNutrientsFromStraight(rounded.kgs, nFertilizer);
                    
                    const fertilizerObj = {
                        name: nFertilizer,
                        kgs: rounded.kgs,
                        ...rounded,
                        nContributed: actualNutrients.n,
                        pContributed: actualNutrients.p || 0,
                        kContributed: actualNutrients.k || 0
                    };
                    
                    const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                    const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                    
                    if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-N')) {
                        cumulativeN += actualNutrients.n;
                    }
                }
            }
        }
        
        // Add P deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        // CRITICAL: For Paddy, P should be added to Stage 2 (tillering), not Stage 3
        if (cumulativeP < minRequiredP) {
            const deficit = totalPRequired - cumulativeP; // Use full requirement, not just 88%
            
            // Determine which stage is pStage (should be Stage 2/Tillering for Paddy)
            const pStageIndex = stage2Index >= 0 ? 1 : recommendations.length - 1;
            const originalStageN = nPerSplit[pStageIndex] || 0;
            const originalStageP = pPerSplit[pStageIndex] || 0;
            const originalStageK = kPerSplit[pStageIndex] || 0;
            
            // CRITICAL: P not allowed in Panicle (stageIndex === 2)
            if (pStageIndex === 2) {
                console.warn(`[Combination6 Final Rebalancing] Cannot add P to pStage (${pStage.stage}) - P not allowed in Panicle stage`);
            } else {
                // Calculate already delivered nutrients in pStage
                let pStageDeliveredN = 0;
                let pStageDeliveredP = 0;
                let pStageDeliveredK = 0;
                pStage.fertilizers.forEach(fert => {
                    pStageDeliveredN += fert.nContributed || 0;
                    pStageDeliveredP += fert.pContributed || 0;
                    pStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add P without exceeding stage limit
                const maxAllowedP = originalStageP - pStageDeliveredP;
                const pToAdd = Math.min(deficit, maxAllowedP > 0 ? maxAllowedP : 0);
                
                if (pToAdd > 0) {
                    // Try to add P through appropriate fertilizer
                    let pFertilizer = selectP2O5Fertilizer(pToAdd, 'Final', preferences, pStatus, locationRec);
                    // If no Gromor product available or rejected, use SSP as fallback (MANDATORY to meet minimum)
                    if (!pFertilizer || (pFertilizer.method === 'gromor' && checkPreference(pFertilizer.product, preferences) === 'Reject')) {
                        // MANDATORY: Use SSP even if rejected - meeting minimum is required
                        pFertilizer = { product: 'SSP', method: 'straight' };
                    }
                    
                    // Always add P fertilizer (mandatory to meet minimum)
                    // CRITICAL: Add to Stage 2 (tillering) for Paddy, not Stage 3
                    if (pFertilizer) {
                        if (pFertilizer && pFertilizer.method === 'gromor') {
                            const gromorKgs = convertP2O5ToGromorDirect(pToAdd, pFertilizer.product, pStatus, locationRec);
                            const rounded = roundToBagUp(gromorKgs, 50); // Round UP to ensure minimum
                            const actualNutrients = getNutrientsFromGromor(rounded.kgs, pFertilizer.product);
                            
                            const fertilizerObj = {
                                name: `Gromor ${pFertilizer.product}`,
                                kgs: rounded.kgs,
                                ...rounded,
                                nContributed: actualNutrients.n,
                                pContributed: actualNutrients.p,
                                kContributed: actualNutrients.k || 0
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P')) {
                                cumulativeP += actualNutrients.p;
                            }
                        } else if (pFertilizer.method === 'straight' && pFertilizer.product === 'SSP') {
                            // SSP: 16% P, 12% S
                            const sspKgs = (pToAdd / 16) * 100;
                            const rounded = roundToBagUp(sspKgs, 50); // Round UP to ensure minimum
                            const actualP = (rounded.kgs * 16) / 100;
                            const actualS = (rounded.kgs * 12) / 100;
                            
                            const fertilizerObj = {
                                name: 'SSP',
                                kgs: rounded.kgs,
                                bags: rounded.kgs / 45,
                                fullBags: Math.floor(rounded.kgs / 45),
                                remainder: rounded.kgs % 45,
                                nContributed: 0,
                                pContributed: actualP,
                                kContributed: 0,
                                sContributed: actualS
                            };
                            
                            const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                            const deliveredBefore = { n: pStageDeliveredN, p: pStageDeliveredP, k: pStageDeliveredK };
                            
                            if (safeAddFertilizer(pStage, fertilizerObj, pStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-P-SSP')) {
                                cumulativeP += actualP;
                            }
                        }
                    }
                }
            }
        }
        
        // Add K deficit if needed - BUT CHECK STAGE CONSTRAINTS FIRST
        // Target full requirement (not just 88%) to account for rounding down
        if (cumulativeK < minRequiredK) {
            const deficit = totalKRequired - cumulativeK; // Use full requirement, not just 88%
            
            // Determine which stage is lastStage and get its original targets
            const lastStageIndex = recommendations.length - 1;
            const originalStageN = nPerSplit[lastStageIndex] || 0;
            const originalStageP = pPerSplit[lastStageIndex] || 0;
            const originalStageK = kPerSplit[lastStageIndex] || 0;
            
            // CRITICAL: K not allowed in Tillering (stageIndex === 1)
            if (lastStageIndex === 1) {
                console.warn(`[Combination6 Final Rebalancing] Cannot add K to lastStage (${lastStage.stage}) - K not allowed in Tillering stage`);
            } else {
                // Calculate already delivered nutrients in lastStage
                let lastStageDeliveredN = 0;
                let lastStageDeliveredP = 0;
                let lastStageDeliveredK = 0;
                lastStage.fertilizers.forEach(fert => {
                    lastStageDeliveredN += fert.nContributed || 0;
                    lastStageDeliveredP += fert.pContributed || 0;
                    lastStageDeliveredK += fert.kContributed || 0;
                });
                
                // Check if we can add K without exceeding stage limit
                const maxAllowedK = originalStageK - lastStageDeliveredK;
                const kToAdd = Math.min(deficit, maxAllowedK > 0 ? maxAllowedK : 0);
                
                if (kToAdd > 0) {
                    let kFertilizer = selectKFertilizer(kToAdd, preferences, sStatus, phStatus);
                    // Fallback: Use MOP if all others are rejected (mandatory to meet minimum)
                    if (!kFertilizer) {
                        kFertilizer = 'MOP';
                    }
                    if (kFertilizer) {
                        const kKgs = convertK2OToStraight(kToAdd, kFertilizer.toLowerCase());
                        const rounded = roundToBagUp(kKgs, 50);
                        const actualNutrients = getNutrientsFromStraight(rounded.kgs, kFertilizer);
                        
                        const fertilizerObj = {
                            name: kFertilizer,
                            kgs: rounded.kgs,
                            ...rounded,
                            nContributed: actualNutrients.n || 0,
                            pContributed: actualNutrients.p || 0,
                            kContributed: actualNutrients.k
                        };
                        
                        const stageTargets = { n: originalStageN, p: originalStageP, k: originalStageK };
                        const deliveredBefore = { n: lastStageDeliveredN, p: lastStageDeliveredP, k: lastStageDeliveredK };
                        
                        if (safeAddFertilizer(lastStage, fertilizerObj, lastStageIndex, stageTargets, deliveredBefore, 'final-rebalancing-K')) {
                            cumulativeK += actualNutrients.k;
                        }
                    }
                }
            }
        }
    }
    
    // STAGE-SAFE TOP-UP PASS: Fill remaining headroom in each stage
    applyStageSafeTopUp(recommendations, nPerSplit, pPerSplit, kPerSplit, preferences, sStatus, phStatus, pStatus, locationRec, 'combination6');
    
    return recommendations;
}

window.optimizeCombination = function optimizeCombination(cropData, nPerSplit, kPerSplit, pPerSplit, recommendedP, recommendedN, recommendedK, 
                              pStatus, locationRec, preferences, sStatus, phStatus, location, nStatus, kStatus) {
    // NEW REDESIGN: Use P-first complete system instead of old combination functions
    // Use provided nStatus and kStatus, or defaults
    const finalNStatus = nStatus || 'medium';
    const finalKStatus = kStatus || 'medium';
    
    try {
        // DEBUG: Log input parameters
        console.log('[P-First] Starting calculation:', {
            totalPRequired: pPerSplit.reduce((sum, p) => sum + p, 0),
            pPerSplit: pPerSplit,
            pStatus: pStatus,
            nStatus: finalNStatus,
            kStatus: finalKStatus
        });
        
        // Use new P-first complete system
        const recommendations = calculatePFirstComplete(
            cropData, nPerSplit, kPerSplit, pPerSplit,
            pStatus, finalNStatus, finalKStatus, preferences,
            sStatus, phStatus, locationRec
        );
        
        // DEBUG: Log recommendations structure
        console.log('[P-First] Recommendations received:', recommendations.length, 'stages');
        recommendations.forEach((stage, idx) => {
            console.log(`[P-First] Stage ${idx} (${stage.stage}): ${stage.fertilizers.length} fertilizers`);
            stage.fertilizers.forEach(fert => {
                console.log(`  - ${fert.name}: P=${fert.pContributed || 0}, N=${fert.nContributed || 0}, K=${fert.kContributed || 0}`);
            });
        });
        
        // Calculate totals and excess
        let totalN = 0, totalP = 0, totalK = 0;
        recommendations.forEach(stage => {
            stage.fertilizers.forEach(fert => {
                totalN += fert.nContributed || 0;
                totalP += fert.pContributed || 0;
                totalK += fert.kContributed || 0;
            });
        });
        
        // DEBUG: Log totals
        console.log('[P-First] Totals calculated:', { totalN, totalP, totalK, requiredN: recommendedN, requiredP: recommendedP, requiredK: recommendedK });
        
        const excessN = Math.max(0, totalN - recommendedN);
        const excessP = Math.max(0, totalP - recommendedP);
        const excessK = Math.max(0, totalK - recommendedK);
        const deficitN = Math.max(0, recommendedN - totalN);
        const deficitP = Math.max(0, recommendedP - totalP);
        const deficitK = Math.max(0, recommendedK - totalK);
        
        const excessNPercent = recommendedN > 0 ? (excessN / recommendedN) * 100 : 0;
        const excessPPercent = recommendedP > 0 ? (excessP / recommendedP) * 100 : 0;
        const excessKPercent = recommendedK > 0 ? (excessK / recommendedK) * 100 : 0;
        
        const deficitNPercent = recommendedN > 0 ? (deficitN / recommendedN) * 100 : 0;
        const deficitPPercent = recommendedP > 0 ? (deficitP / recommendedP) * 100 : 0;
        const deficitKPercent = recommendedK > 0 ? (deficitK / recommendedK) * 100 : 0;
        
        // Check if meets minimum (88% threshold for validation)
        const minRequiredN = recommendedN * 0.88;
        const minRequiredP = recommendedP * 0.88;
        const minRequiredK = recommendedK * 0.88;
        const meetsMinimum = totalN >= minRequiredN && totalP >= minRequiredP && totalK >= minRequiredK;
        
        // Check overall tolerance (max 5% excess, no deficit)
        const overallTolerance = 0.05; // 5%
        const withinTolerance = excessNPercent <= (overallTolerance * 100) && 
                               excessPPercent <= (overallTolerance * 100) && 
                               excessKPercent <= (overallTolerance * 100) &&
                               deficitNPercent === 0 && deficitPPercent === 0 && deficitKPercent === 0;
        
        // Calculate score (penalize deficits and excess)
        const score = (deficitNPercent * 10.0) + (deficitPPercent * 10.0) + (deficitKPercent * 10.0) +
                     (excessNPercent * 1.0) + (excessPPercent * 2.0) + (excessKPercent * 1.0);
        
        return {
            bestCombination: 'P-First', // New system identifier
            bestRecommendations: recommendations,
            score: score,
            excess: {
                excessN: excessN,
                excessP: excessP,
                excessK: excessK,
                excessNPercent: excessNPercent,
                excessPPercent: excessPPercent,
                excessKPercent: excessKPercent,
                deficitN: deficitN,
                deficitP: deficitP,
                deficitK: deficitK,
                deficitNPercent: deficitNPercent,
                deficitPPercent: deficitPPercent,
                deficitKPercent: deficitKPercent,
                meetsMinimum: meetsMinimum,
                withinTolerance: withinTolerance,
                totalN: totalN,
                totalP: totalP,
                totalK: totalK
            }
        };
    } catch (error) {
        console.warn('Error in P-first calculation:', error);
        // Fallback to old system if new one fails
        return optimizeCombinationOld(cropData, nPerSplit, kPerSplit, pPerSplit, recommendedP, recommendedN, recommendedK, 
                                      pStatus, locationRec, preferences, sStatus, phStatus, location);
    }
}

window.optimizeCombinationOld = function optimizeCombinationOld(cropData, nPerSplit, kPerSplit, pPerSplit, recommendedP, recommendedN, recommendedK, 
                              pStatus, locationRec, preferences, sStatus, phStatus, location) {
    const combinations = ['1', '2', '3', '4', '5', '6'];
    const tolerance = 0.10; // 10% tolerance for excess nutrients
    
    let bestScore = Infinity;
    let bestCombination = '1';
    let bestRecommendations = null;
    let bestExcess = null;
    
    // Try each combination
    for (const comb of combinations) {
        let recommendations;
        try {
            switch (comb) {
                case '1':
                    recommendations = calculateCombination1(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                    break;
                case '2':
                    recommendations = calculateCombination2(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                    break;
                case '3':
                    recommendations = calculateCombination3(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                    break;
                case '4':
                    recommendations = calculateCombination4(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                    break;
                case '5':
                    recommendations = calculateCombination5(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                    break;
                case '6':
                    recommendations = calculateCombination6(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                    break;
            }
            
            // Calculate total nutrients delivered
            let totalN = 0, totalP = 0, totalK = 0;
            recommendations.forEach(stage => {
                stage.fertilizers.forEach(fert => {
                    totalN += fert.nContributed || 0;
                    totalP += fert.pContributed || 0;
                    totalK += fert.kContributed || 0;
                });
            });
            
            // Calculate excess (only count over-application, not under-application)
            const excessN = Math.max(0, totalN - recommendedN);
            const excessP = Math.max(0, totalP - recommendedP);
            const excessK = Math.max(0, totalK - recommendedK);
            
            // Calculate deficit (under-application) - heavily penalize
            const deficitN = Math.max(0, recommendedN - totalN);
            const deficitP = Math.max(0, recommendedP - totalP);
            const deficitK = Math.max(0, recommendedK - totalK);
            
            // Calculate percentage excess
            const excessNPercent = recommendedN > 0 ? (excessN / recommendedN) * 100 : 0;
            const excessPPercent = recommendedP > 0 ? (excessP / recommendedP) * 100 : 0;
            const excessKPercent = recommendedK > 0 ? (excessK / recommendedK) * 100 : 0;
            
            // Calculate percentage deficit (under-application)
            const deficitNPercent = recommendedN > 0 ? (deficitN / recommendedN) * 100 : 0;
            const deficitPPercent = recommendedP > 0 ? (deficitP / recommendedP) * 100 : 0;
            const deficitKPercent = recommendedK > 0 ? (deficitK / recommendedK) * 100 : 0;
            
            // Check minimum requirements (must be at least 88% of recommended, with 12% tolerance)
            const minRequiredN = recommendedN * (1 - tolerance);
            const minRequiredP = recommendedP * (1 - tolerance);
            const minRequiredK = recommendedK * (1 - tolerance);
            const meetsMinimum = totalN >= minRequiredN && totalP >= minRequiredP && totalK >= minRequiredK;
            
            // Check if within tolerance (all excesses <= 10%)
            const withinTolerance = excessNPercent <= (tolerance * 100) && 
                                   excessPPercent <= (tolerance * 100) && 
                                   excessKPercent <= (tolerance * 100);
            
            // Calculate score: heavily penalize deficits, then penalize excess
            // Deficit penalty is 10x more severe than excess penalty
            const score = (deficitNPercent * 10.0) + (deficitPPercent * 20.0) + (deficitKPercent * 10.0) +
                         (excessNPercent * 1.0) + (excessPPercent * 2.0) + (excessKPercent * 1.0);
            
            // Prefer combinations that meet minimum requirements first
            // Then prefer combinations within tolerance, then by lowest score
            const isBetter = meetsMinimum ? 
                (withinTolerance ? 
                    (bestScore === Infinity || score < bestScore || !bestExcess || bestExcess.withinTolerance === false || !bestExcess.meetsMinimum) :
                    (bestScore === Infinity || (!bestExcess || !bestExcess.withinTolerance || !bestExcess.meetsMinimum) && score < bestScore)) :
                (bestScore === Infinity || (!bestExcess || !bestExcess.meetsMinimum) && score < bestScore);
            
            if (isBetter) {
                bestScore = score;
                bestCombination = comb;
                bestRecommendations = recommendations;
                bestExcess = {
                    excessN: excessN,
                    excessP: excessP,
                    excessK: excessK,
                    excessNPercent: excessNPercent,
                    excessPPercent: excessPPercent,
                    excessKPercent: excessKPercent,
                    deficitN: deficitN,
                    deficitP: deficitP,
                    deficitK: deficitK,
                    deficitNPercent: deficitNPercent,
                    deficitPPercent: deficitPPercent,
                    deficitKPercent: deficitKPercent,
                    meetsMinimum: meetsMinimum,
                    withinTolerance: withinTolerance,
                    totalN: totalN,
                    totalP: totalP,
                    totalK: totalK
                };
            }
        } catch (error) {
            console.warn(`Error calculating combination ${comb}:`, error);
            // Continue with next combination
        }
    }
    
    // If no valid combination found, use combination 1 as fallback
    if (!bestRecommendations) {
        bestCombination = '1';
        bestRecommendations = calculateCombination1(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
    }
    
    return {
        bestCombination: bestCombination,
        bestRecommendations: bestRecommendations,
        score: bestScore,
        excess: bestExcess
    };
}

window.calculateRecommendations = function calculateRecommendations(formData) {
    const crop = formData.crop;
    const organicCarbon = parseFloat(formData.organicCarbon);
    const nitrogen = formData.nitrogen !== null && formData.nitrogen !== undefined && formData.nitrogen !== '' 
        ? parseFloat(formData.nitrogen) : null; // Already in kg/acre, null if not provided
    const phosphorus = parseFloat(formData.phosphorus); // Already in kg/acre (P2O5)
    const potassium = parseFloat(formData.potassium); // Already in kg/acre (K2O)
    const season = formData.season || 'Rabi';
    const fieldType = formData.fieldType || 'Irrigated';
    const location = formData.location;
    const sulfur = parseFloat(formData.sulfur) || 0;
    const ph = parseFloat(formData.ph) || 0;
    const gromorCombination = formData.gromorCombination;
    
    // Additional parameters
    const soilType = formData.soilType || '';
    const ec = parseFloat(formData.ec) || 0;
    const calcium = parseFloat(formData.calcium) || 0;
    const magnesium = parseFloat(formData.magnesium) || 0;
    const zinc = parseFloat(formData.zinc) || 0;
    const boron = parseFloat(formData.boron) || 0;
    const manganese = parseFloat(formData.manganese) || 0;
    const iron = parseFloat(formData.iron) || 0;
    const copper = parseFloat(formData.copper) || 0;
    const molybdenum = parseFloat(formData.molybdenum) || 0;
    const chlorine = parseFloat(formData.chlorine) || 0;
    
    // Step 1: Classify soil test status
    // Nitrogen: Prefer nitrogen value if available, otherwise use organic carbon
    const nStatus = classifyNitrogenByOC(organicCarbon, nitrogen);
    const pStatus = classifyPhosphorus(phosphorus);
    const kStatus = classifyPotassium(potassium);
    const sStatus = classifySulfur(sulfur);
    const phStatus = classifyPh(ph);
    const ecStatus = classifyEC(ec);
    const caStatus = classifyCalcium(calcium);
    const mgStatus = classifyMagnesium(magnesium);
    const znStatus = classifyZinc(zinc);
    const bStatus = classifyBoron(boron);
    const mnStatus = classifyManganese(manganese);
    const feStatus = classifyIron(iron);
    const cuStatus = classifyCopper(copper);
    const moStatus = classifyMolybdenum(molybdenum);
    const clStatus = classifyChlorine(chlorine);
    
    // Step 2: Get location-based recommendations (MANDATORY)
    const locationRec = getLocationBasedRecommendation(
        crop, season, location, fieldType, nStatus, pStatus, kStatus
    );
    
    // MANDATORY: Location-based recommendations must be found
    if (!locationRec) {
        const cropKey = getCropKey(crop, season);
        throw new Error(`MANDATORY: Location-based recommendation data not found for: ${crop} (${season}) in location: ${location}. Please ensure location-crop-recommendations data exists for "${cropKey}" and location "${location}".`);
    }
    
    // Get crop data for split schedules
    const cropData = getCropData(crop, season, fieldType);
    if (!cropData) {
        throw new Error(`Crop data not found for: ${crop} (${season}, ${fieldType})`);
    }
    
    // Step 3: Get recommended NPK values from location-based data (MANDATORY - no fallback)
    // Location-based recommendations are MANDATORY and must be used
    const recommendedN = locationRec.n;
    const recommendedP = locationRec.p;
    const recommendedK = locationRec.k;
    
    // VALIDATION: Ensure recommendations are valid numbers
    if (isNaN(recommendedN) || isNaN(recommendedP) || isNaN(recommendedK)) {
        throw new Error(`MANDATORY VALIDATION FAILED: Invalid recommendation values. N: ${recommendedN}, P: ${recommendedP}, K: ${recommendedK}. Location: ${location}, Crop: ${crop}, Season: ${season}`);
    }
    
    // VALIDATION: Ensure recommendations are positive
    if (recommendedN < 0 || recommendedP < 0 || recommendedK < 0) {
        throw new Error(`MANDATORY VALIDATION FAILED: Negative recommendation values detected. N: ${recommendedN}, P: ${recommendedP}, K: ${recommendedK}`);
    }
    
    // Get split schedule
    let nSplits = cropData.splits.n;
    const kSplits = cropData.splits.k;
    let pSplits = cropData.splits.p;
    
    // EXCEPTION 8: For Paddy crops (irrespective of season Kharif or Rabi), Nitrogen in 3 equal splits
    // May vary + or - 10% based on N containing P fertiliser
    if (crop.toLowerCase().includes('paddy') || crop === 'Paddy lowland' || crop === 'Paddy Upland' || crop === 'Paddy Mediumland') {
        // Override N splits to be equal (1/3 each) for all paddy crops
        if (nSplits.count === 3) {
            nSplits = {
                ...nSplits,
                ratios: [1/3, 1/3, 1/3] // Equal splits: 33.33%, 33.33%, 33.33%
            };
        }
    }
    
    // EXCEPTION 5: For Paddy crops: P split 70% stage 1, 30% stage 2 (better for root development)
    // Otherwise 60% and 40% is also OK, but 70/30 is preferred
    if (crop.toLowerCase().includes('paddy') || crop === 'Paddy lowland' || crop === 'Paddy Upland' || crop === 'Paddy Mediumland') {
        if (!pSplits || !pSplits.ratios) {
            // Default P split for paddy: 70% basal, 30% at tillering (preferred for root development)
            pSplits = {
                count: 2,
                ratios: [0.7, 0.3],
                stages: ["Basal", "at Tillering"]
            };
        } else if (pSplits.ratios && pSplits.ratios.length === 2) {
            // Update existing paddy P splits to 70/30 if currently 60/40
            if (Math.abs(pSplits.ratios[0] - 0.6) < 0.01 && Math.abs(pSplits.ratios[1] - 0.4) < 0.01) {
                pSplits = {
                    ...pSplits,
                    ratios: [0.7, 0.3]
                };
            }
        }
    } else if (!pSplits) {
        // For non-paddy crops, P is applied 100% at basal if not specified
        pSplits = {
            count: 1,
            ratios: [1.0],
            stages: ["Basal"]
        };
    }
    
    // Calculate per-split requirements
    const nPerSplit = nSplits.ratios.map(ratio => recommendedN * ratio);
    const pPerSplitRaw = pSplits.ratios.map(ratio => recommendedP * ratio);
    const kPerSplitRaw = kSplits.ratios.map(ratio => recommendedK * ratio);
    
    // DEBUG: Log P split calculation
    console.log('[DEBUG] P Split Calculation:', {
        recommendedP: recommendedP,
        pSplits: pSplits,
        pPerSplitRaw: pPerSplitRaw,
        nSplitsStages: nSplits.stages,
        pSplitsStages: pSplits.stages
    });
    
    // Map P splits to N stages by matching stage names
    const pPerSplit = nSplits.stages.map((nStage, nIndex) => {
        const pIndex = pSplits.stages.findIndex(pStage => pStage === nStage);
        const value = pIndex >= 0 ? pPerSplitRaw[pIndex] : 0;
        console.log(`[DEBUG] Mapping P split: Stage ${nIndex} (${nStage}) -> P index ${pIndex} -> ${value.toFixed(2)} kg`);
        return value;
    });
    
    console.log('[DEBUG] Final pPerSplit array:', pPerSplit);
    
    // Map K splits to N stages by matching stage names (not indices)
    // This handles cases where K has fewer stages than N (e.g., K at Basal and Panicle, but N at Basal, Tillering, Panicle)
    const kPerSplit = nSplits.stages.map((nStage, nIndex) => {
        const kIndex = kSplits.stages.findIndex(kStage => kStage === nStage);
        return kIndex >= 0 ? kPerSplitRaw[kIndex] : 0;
    });
    
    // Get fertilizer preferences — use passed-in value if available (testable),
    // otherwise read from DOM for normal browser form submissions.
    const preferences = (formData && formData.preferences) ? { ...formData.preferences } : (() => {
        const prefs = {};
        const form = document.getElementById('soilTestForm');
        if (form) {
            form.querySelectorAll('[name^="pref_"]').forEach(input => {
                prefs[input.name] = input.value;
            });
        }
        return prefs;
    })();
    
    // Optimization: Evaluate all combinations and select the best one
    // Only optimize if combination is auto-selected or not specified
    let combination = gromorCombination;
    let recommendations;
    let optimizationInfo = null; // Initialize to null
    
    if (!combination || combination === 'Auto-select based on Location' || combination === '') {
        // Optimize: Try all combinations and select the best
        optimizationInfo = optimizeCombination(
            cropData, nPerSplit, kPerSplit, pPerSplit, recommendedP, recommendedN, recommendedK,
            pStatus, locationRec, preferences, sStatus, phStatus, location
        );
        combination = optimizationInfo.bestCombination;
        recommendations = optimizationInfo.bestRecommendations;
    } else {
        // Use specified combination
        if (location && locationsData.locationPreferences) {
            const locationPref = locationsData.locationPreferences[location];
            if (locationPref && !combination) {
                combination = locationPref.preferredCombination.toString();
            }
        }
        combination = combination || '1';
        
        // Calculate based on combination
        switch (combination) {
            case '1':
                recommendations = calculateCombination1(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                break;
            case '2':
                recommendations = calculateCombination2(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                break;
            case '3':
                recommendations = calculateCombination3(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                break;
            case '4':
                recommendations = calculateCombination4(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                break;
            case '5':
                recommendations = calculateCombination5(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                break;
            case '6':
                recommendations = calculateCombination6(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
                break;
            default:
                recommendations = calculateCombination1(cropData, nPerSplit, kPerSplit, pPerSplit, pStatus, locationRec, preferences, sStatus, phStatus);
        }
    }
    
    // Nutrient Analysis (using soil test status)
    const nutrientAnalysis = {
        nitrogen: {
            value: nitrogen,
            status: nStatus,
            classification: nStatus
        },
        phosphorus: {
            value: phosphorus,
            status: pStatus,
            classification: pStatus
        },
        potassium: {
            value: potassium,
            status: kStatus,
            classification: kStatus
        },
        sulfur: {
            value: sulfur,
            status: sStatus,
            classification: sStatus
        },
        ph: {
            value: ph,
            status: phStatus,
            classification: phStatus
        },
        ec: {
            value: ec,
            status: ecStatus,
            classification: ecStatus
        },
        calcium: {
            value: calcium,
            status: caStatus,
            classification: caStatus
        },
        magnesium: {
            value: magnesium,
            status: mgStatus,
            classification: mgStatus
        },
        zinc: {
            value: zinc,
            status: znStatus,
            classification: znStatus
        },
        boron: {
            value: boron,
            status: bStatus,
            classification: bStatus
        },
        manganese: {
            value: manganese,
            status: mnStatus,
            classification: mnStatus
        },
        iron: {
            value: iron,
            status: feStatus,
            classification: feStatus
        },
        copper: {
            value: copper,
            status: cuStatus,
            classification: cuStatus
        },
        molybdenum: {
            value: molybdenum,
            status: moStatus,
            classification: moStatus
        },
        chlorine: {
            value: chlorine,
            status: clStatus,
            classification: clStatus
        }
    };
    
    // Get pH-based recommendations
    const phRecommendations = getPhRecommendations(phStatus);
    
    // Get combination info
    let combinationInfo = locationsData.combinations?.[combination] || {
        name: `Combination ${combination}`,
        description: 'Gromor fertilizer combination'
    };

    // Override name with the actual Gromor products used in the recommendation
    // (selectP2O5Fertilizer picks dynamically, so the static JSON name may not match)
    {
        const gromorProductsUsed = [];
        const seen = new Set();
        recommendations.forEach(stage => {
            (stage.fertilizers || []).forEach(fert => {
                if (fert.name && fert.name.startsWith('Gromor ')) {
                    const product = fert.name.replace('Gromor ', '');
                    if (!seen.has(product)) {
                        seen.add(product);
                        gromorProductsUsed.push(product);
                    }
                }
            });
        });
        if (gromorProductsUsed.length > 0) {
            combinationInfo = { ...combinationInfo, name: gromorProductsUsed.join(' + ') };
        } else {
            // No Gromor products used — build name from ALL distinct fertilizers used
            const allFerts = [];
            const seenFerts = new Set();
            recommendations.forEach(stage => {
                (stage.fertilizers || []).forEach(fert => {
                    if (fert.name && !seenFerts.has(fert.name)) {
                        seenFerts.add(fert.name);
                        allFerts.push(fert.name);
                    }
                });
            });
            if (allFerts.length > 0) {
                combinationInfo = { ...combinationInfo, name: allFerts.join(' + ') };
            }
        }
    }

    // ============================================================================
    // ENHANCEMENT: Calculation Steps Tracking (for Excel format transparency)
    // ============================================================================
    
    // Get base recommendations (normal) for comparison
    const cropKey = getCropKey(crop, season);
    let baseRecommendation = {n: recommendedN, p: recommendedP, k: recommendedK};
    if (locationCropRecommendations[cropKey] && locationCropRecommendations[cropKey][location]) {
        const rec = locationCropRecommendations[cropKey][location];
        baseRecommendation = {
            n: rec.normal?.n || recommendedN,
            p: rec.normal?.p || recommendedP,
            k: rec.normal?.k || recommendedK
        };
    } else if (locationCropRecommendations[cropKey]) {
        // Also check fieldType-based path (e.g. MAIZE stores data under "irrigated" not location name)
        const ftKey = (fieldType || 'Irrigated').toLowerCase();
        const rec = locationCropRecommendations[cropKey][ftKey];
        if (rec && rec.normal) {
            baseRecommendation = {
                n: rec.normal?.n || recommendedN,
                p: rec.normal?.p || recommendedP,
                k: rec.normal?.k || recommendedK
            };
        }
    }
    
    // Calculate adjustments
    const nAdjustment = recommendedN - baseRecommendation.n;
    const pAdjustment = recommendedP - baseRecommendation.p;
    const kAdjustment = recommendedK - baseRecommendation.k;
    
    // Helper function to get adjustment reason
    function getAdjustmentReason(nutrient, status) {
        if (status === 'low') {
            return `${nutrient.toUpperCase()}-Low: Add ${nutrient === 'n' ? nAdjustment : nutrient === 'p' ? pAdjustment : kAdjustment} kg to base recommendation`;
        } else if (status === 'high') {
            return `${nutrient.toUpperCase()}-High: Subtract ${Math.abs(nutrient === 'n' ? nAdjustment : nutrient === 'p' ? pAdjustment : kAdjustment)} kg from base recommendation`;
        } else {
            return `${nutrient.toUpperCase()}-Medium: No adjustment (use base recommendation)`;
        }
    }
    
    // Step 1: Required Nutrients Based on Soil Test
    const calculationSteps = {
        step1: {
            title: "Required Nutrients Based on Soil Test",
            baseRecommendation: baseRecommendation,
            adjustments: {
                n: {
                    value: nAdjustment,
                    reason: getAdjustmentReason('n', nStatus)
                },
                p: {
                    value: pAdjustment,
                    reason: getAdjustmentReason('p', pStatus)
                },
                k: {
                    value: kAdjustment,
                    reason: getAdjustmentReason('k', kStatus)
                }
            },
            finalRecommendation: {
                n: recommendedN,
                p: recommendedP,
                k: recommendedK
            }
        },
        step2: {
            title: "Complex Fertilizer Selection",
            selectedFertilizer: combinationInfo.name || `Combination ${combination}`,
            quantity: null, // Will be calculated from recommendations
            reason: `Selected based on location preference (${location}) and P status (${pStatus})`
        },
        step3: {
            title: "Stage-wise Application",
            stages: recommendations
        }
    };
    
    // ============================================================================
    // ENHANCEMENT: Balance Tracking
    // ============================================================================
    function calculateBalanceTracking(recommendations, recommendedNPK) {
        const balanceTracking = {
            initial: {...recommendedNPK},
            afterBasal: {...recommendedNPK},
            afterTop1: {...recommendedNPK},
            afterTop2: {...recommendedNPK}
        };
        
        let cumulativeN = 0, cumulativeP = 0, cumulativeK = 0;
        
        recommendations.forEach((stage, index) => {
            stage.fertilizers.forEach(fert => {
                cumulativeN += fert.nContributed || 0;
                cumulativeP += fert.pContributed || 0;
                cumulativeK += fert.kContributed || 0;
            });
            
            const balance = {
                n: recommendedNPK.n - cumulativeN,
                p: recommendedNPK.p - cumulativeP,
                k: recommendedNPK.k - cumulativeK
            };
            
            if (index === 0) {
                balanceTracking.afterBasal = balance;
            } else if (index === 1) {
                balanceTracking.afterTop1 = balance;
            } else if (index === 2) {
                balanceTracking.afterTop2 = balance;
            }
        });
        
        return balanceTracking;
    }
    
    const balanceTracking = calculateBalanceTracking(recommendations, {
        n: recommendedN,
        p: recommendedP,
        k: recommendedK
    });
    
    // ============================================================================
    // ENHANCEMENT: Apply minimum fertilizer threshold (Issue #18)
    // ============================================================================
    // If any fertilizer grade has qty < 5 kg in a stage, shift its nutrients to
    // the same fertilizer in the last available stage for practical application.
    const MIN_FERTILIZER_QTY = 5;
    function applyMinFertilizerThreshold(recommendations) {
        for (let s = 0; s < recommendations.length - 1; s++) {
            const stage = recommendations[s];
            const fertilizersToRemove = [];
            
            for (let f = stage.fertilizers.length - 1; f >= 0; f--) {
                const fert = stage.fertilizers[f];
                const qty = fert.kgs || 0;
                
                if (qty > 0 && qty < MIN_FERTILIZER_QTY) {
                    const fertName = fert.name;
                    const fertN = fert.nContributed || 0;
                    const fertP = fert.pContributed || 0;
                    const fertK = fert.kContributed || 0;
                    
                    // Find the same fertilizer in a later stage
                    let targetStage = null;
                    let targetFertIndex = -1;
                    
                    for (let ts = s + 1; ts < recommendations.length; ts++) {
                        const laterStage = recommendations[ts];
                        for (let tf = 0; tf < laterStage.fertilizers.length; tf++) {
                            if (laterStage.fertilizers[tf].name === fertName) {
                                targetStage = laterStage;
                                targetFertIndex = tf;
                                break;
                            }
                        }
                        if (targetStage) break;
                    }
                    
                    if (targetStage && targetFertIndex >= 0) {
                        // Add to the same fertilizer in the target stage
                        const targetFert = targetStage.fertilizers[targetFertIndex];
                        targetFert.kgs = (targetFert.kgs || 0) + qty;
                        targetFert.nContributed = (targetFert.nContributed || 0) + fertN;
                        targetFert.pContributed = (targetFert.pContributed || 0) + fertP;
                        targetFert.kContributed = (targetFert.kContributed || 0) + fertK;
                        
                        // Remove from current stage
                        stage.fertilizers.splice(f, 1);
                        console.log(`[MinThreshold] Moved ${qty.toFixed(2)} kg ${fertName} from stage ${s} to stage ${targetStage.stageName || s+1}`);
                    } else {
                        // No later stage with same fertilizer - keep it but log a note
                        console.log(`[MinThreshold] Keeping ${qty.toFixed(2)} kg ${fertName} in stage ${s} - no later stage with same fertilizer`);
                    }
                }
            }
        }
    }
    
    applyMinFertilizerThreshold(recommendations);
    
    // ============================================================================
    // ENHANCEMENT: Nutrient Contribution Table
    // ============================================================================
    function buildNutrientContributionTable(recommendations) {
        return recommendations.map(stage => {
            const fertilizers = stage.fertilizers.map(fert => ({
                name: fert.name,
                qty: fert.kgs,
                n: fert.nContributed || 0,
                p: fert.pContributed || 0,
                k: fert.kContributed || 0,
                s: fert.sContributed || 0
            }));
            
            const totals = fertilizers.reduce((acc, fert) => ({
                n: acc.n + fert.n,
                p: acc.p + fert.p,
                k: acc.k + fert.k,
                s: acc.s + fert.s
            }), {n: 0, p: 0, k: 0, s: 0});
            
            return {
                stage: stage.stage,
                fertilizers,
                totals
            };
        });
    }
    
    const nutrientContributionTable = buildNutrientContributionTable(recommendations);
    
    // ============================================================================
    // ENHANCEMENT: Nutrient Comparison (Available vs Required)
    // ============================================================================
    const nutrientComparison = {
        available: {
            n: nitrogen || 0,
            p: phosphorus || 0,
            k: potassium || 0
        },
        required: {
            n: recommendedN,
            p: recommendedP,
            k: recommendedK
        },
        adjustment: {
            n: nAdjustment,
            p: pAdjustment,
            k: kAdjustment
        },
        reason: {
            n: getAdjustmentReason('n', nStatus),
            p: getAdjustmentReason('p', pStatus),
            k: getAdjustmentReason('k', kStatus)
        }
    };
    
    // ============================================================================
    // ENHANCEMENT: Remarks/Notes Generation
    // ============================================================================
    const remarks = [];
    
    // Add remarks based on adjustments
    if (Math.abs(pAdjustment) > 0.1) {
        const percentChange = ((pAdjustment / baseRecommendation.p) * 100).toFixed(1);
        remarks.push(`P ${percentChange > 0 ? '+' : ''}${percentChange}% ${percentChange > 0 ? 'more' : 'less'} than base recommendation due to ${pStatus} soil P status`);
    }
    if (Math.abs(nAdjustment) > 0.1) {
        const percentChange = ((nAdjustment / baseRecommendation.n) * 100).toFixed(1);
        remarks.push(`N ${percentChange > 0 ? '+' : ''}${percentChange}% ${percentChange > 0 ? 'more' : 'less'} than base recommendation due to ${nStatus} soil N status`);
    }
    if (Math.abs(kAdjustment) > 0.1) {
        const percentChange = ((kAdjustment / baseRecommendation.k) * 100).toFixed(1);
        remarks.push(`K ${percentChange > 0 ? '+' : ''}${percentChange}% ${percentChange > 0 ? 'more' : 'less'} than base recommendation due to ${kStatus} soil K status`);
    }
    
    // Add remarks for fertilizer selection
    if (pStatus === 'low' && nStatus === 'high') {
        remarks.push('If high P and Low N, then high phosphate containing Fert like DAP(18-46-0) or 14-35-14');
    }
    
    // Calculate expected NPK per stage based on split ratios
    const expectedNPKPerStage = [];
    for (let i = 0; i < nPerSplit.length; i++) {
        const nStage = nSplits.stages[i];
        const kIndex = cropData.splits.k.stages.findIndex(kStage => kStage === nStage);
        const kRatio = kIndex >= 0 ? cropData.splits.k.ratios[kIndex] : 0;
        
        // Calculate expected P per stage (60% basal, 40% tillering for paddy)
        const pIndex = pSplits.stages.findIndex(pStage => pStage === nStage);
        const expectedP = pIndex >= 0 ? pPerSplitRaw[pIndex] : 0;
        
        expectedNPKPerStage.push({
            stage: nStage,
            expectedN: nPerSplit[i],
            expectedP: expectedP, // P split based on crop (60/40 for paddy, 100% basal for others)
            expectedK: kPerSplit[i] || 0,
            nRatio: nSplits.ratios[i], // Use the modified nSplits ratios
            kRatio: kRatio
        });
    }
    
    // Calculate actual NPK delivered per stage from fertilizers
    const actualNPKPerStage = recommendations.map((stage, index) => {
        let actualN = 0, actualP = 0, actualK = 0;
        stage.fertilizers.forEach(fert => {
            actualN += fert.nContributed || 0;
            actualP += fert.pContributed || 0;
            actualK += fert.kContributed || 0;
        });
        return {
            stage: stage.stage,
            actualN: actualN,
            actualP: actualP,
            actualK: actualK
        };
    });
    
    // MANDATORY VALIDATION: Calculate total nutrients delivered
    let totalDeliveredN = 0, totalDeliveredP = 0, totalDeliveredK = 0;
    recommendations.forEach(stage => {
        stage.fertilizers.forEach(fert => {
            totalDeliveredN += fert.nContributed || 0;
            totalDeliveredP += fert.pContributed || 0;
            totalDeliveredK += fert.kContributed || 0;
        });
    });
    
    // MANDATORY VALIDATION: Ensure minimum requirements are met (allow 12% tolerance for bag rounding)
    // Increased to 12% to account for rounding to bag sizes (45kg bags can cause small deficits)
    const tolerance = 0.12; // 12% tolerance for rounding to bag sizes (more realistic for 45kg bags)
    const minRequiredN = recommendedN * (1 - tolerance);
    const minRequiredP = recommendedP * (1 - tolerance);
    const minRequiredK = recommendedK * (1 - tolerance);
    
    const validationErrors = [];
    if (totalDeliveredN < minRequiredN) {
        validationErrors.push(`MANDATORY VALIDATION FAILED: Nitrogen delivery (${totalDeliveredN.toFixed(2)} kg/acre) is below minimum required (${minRequiredN.toFixed(2)} kg/acre). Required: ${recommendedN} kg/acre`);
    }
    if (totalDeliveredP < minRequiredP) {
        validationErrors.push(`MANDATORY VALIDATION FAILED: Phosphorus delivery (${totalDeliveredP.toFixed(2)} kg/acre) is below minimum required (${minRequiredP.toFixed(2)} kg/acre). Required: ${recommendedP} kg/acre`);
    }
    if (totalDeliveredK < minRequiredK) {
        validationErrors.push(`MANDATORY VALIDATION FAILED: Potassium delivery (${totalDeliveredK.toFixed(2)} kg/acre) is below minimum required (${minRequiredK.toFixed(2)} kg/acre). Required: ${recommendedK} kg/acre`);
    }
    
    // Add validation remarks (now that validationErrors is declared)
    if (validationErrors.length === 0) {
        remarks.push('All nutrient requirements met within tolerance limits');
    } else {
        remarks.push(`Validation: ${validationErrors.length} issue(s) detected - please review recommendations`);
    }
    
    // If validation fails, attach warnings but still return the recommendation
    if (validationErrors.length > 0) {
        const validationWarning = `Nutrient delivery shortfall detected:\n${validationErrors.join('\n')}\n` +
                        `Delivered: N=${totalDeliveredN.toFixed(2)}, P=${totalDeliveredP.toFixed(2)}, K=${totalDeliveredK.toFixed(2)} kg/acre`;
        remarks.push(validationWarning);
        console.warn('[Validation] ' + validationWarning);
    }
    
    return {
        recommendations,
        nutrientAnalysis,
        crop,
        season,
        fieldType,
        location,
        combination: combinationInfo,
        soilTestStatus: { nStatus, pStatus, kStatus, sStatus, phStatus, ecStatus, caStatus, mgStatus, znStatus, bStatus, mnStatus, feStatus, cuStatus, moStatus, clStatus, soilType },
        phRecommendations: phRecommendations,
        recommendedNPK: {
            n: recommendedN,
            p: recommendedP,
            k: recommendedK
        },
        deliveredNPK: {
            n: totalDeliveredN,
            p: totalDeliveredP,
            k: totalDeliveredK
        },
        validation: {
            passed: validationErrors.length === 0,
            errors: validationErrors,
            tolerance: tolerance * 100
        },
        totals: {
            n: recommendedN,
            p: recommendedP,
            k: recommendedK
        },
        expectedNPKPerStage: expectedNPKPerStage,
        actualNPKPerStage: actualNPKPerStage,
        splitRatios: {
            n: nSplits.ratios, // Use the modified nSplits ratios (may be overridden for SOUTH TELENGANA)
            k: cropData.splits.k.ratios,
            nStages: nSplits.stages,
            kStages: cropData.splits.k.stages
        },
        recommendedBasedOn: {
            nStatus,
            pStatus,
            kStatus
        },
        optimizationInfo: optimizationInfo,
        // ENHANCEMENT: New fields for Excel format transparency
        calculationSteps: calculationSteps,
        balanceTracking: balanceTracking,
        nutrientContributionTable: nutrientContributionTable,
        nutrientComparison: nutrientComparison,
        remarks: remarks
    };
}