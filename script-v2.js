// Master Data - Load from JSON files
let cropsData = {};
let fertilizerConversion = {};
let locationsData = {};
let soilTestClassification = {};
let locationCropRecommendations = {};

// Load data files
async function loadData() {
    try {
        const cropsResponse = await fetch('data/crops.json');
        cropsData = await cropsResponse.json();
        
        const conversionResponse = await fetch('data/fertilizer-conversion.json');
        fertilizerConversion = await conversionResponse.json();
        
        const locationsResponse = await fetch('data/locations.json');
        locationsData = await locationsResponse.json();
        
        const soilTestResponse = await fetch('data/soil-test-classification.json');
        soilTestClassification = await soilTestResponse.json();
        
        const locationCropResponse = await fetch('data/location-crop-recommendations.json');
        locationCropRecommendations = await locationCropResponse.json();
        
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Initialize data on page load
loadData();

// Classify Nitrogen - Prefers Nitrogen value if available, otherwise uses Organic Carbon (from Data 3)
function classifyNitrogenByOC(organicCarbon, nitrogen) {
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

// Classify Phosphorus (P2O5) - kg/acre
function classifyPhosphorus(p2o5) {
    if (p2o5 < 10) return 'low';
    if (p2o5 <= 24) return 'medium';
    return 'high';
}

// Classify Potassium (K2O) - kg/acre
function classifyPotassium(k2o) {
    if (k2o < 58) return 'low';
    if (k2o <= 138) return 'medium';
    return 'high';
}

// Classify Sulfur - ppm
function classifySulfur(sulfur) {
    if (!sulfur || sulfur < 10) return 'low';
    if (sulfur <= 15) return 'medium';
    return 'high';
}

// Get crop key for lookup (handles Paddy specially)
function getCropKey(crop, season) {
    if (crop.toLowerCase().includes('paddy')) {
        return season === 'Kharif' ? 'PADDY-KHARIF' : 'PADDY-RABI';
    }
    return crop.toUpperCase().replace(/\s+/g, '-');
}

// Get location-wise recommendation based on soil test status
function getLocationBasedRecommendation(crop, season, location, fieldType, nStatus, pStatus, kStatus) {
    const cropKey = getCropKey(crop, season);
    
    // Try location-based lookup first (PADDY crops: PADDY-KHARIF -> GODAVARI DELTA)
    if (locationCropRecommendations[cropKey] && locationCropRecommendations[cropKey][location]) {
        const rec = locationCropRecommendations[cropKey][location];
        return {
            n: rec.nStatus[nStatus] || rec.normal.n,
            p: rec.pStatus[pStatus] || rec.normal.p,
            k: rec.kStatus[kStatus] || rec.normal.k,
            gromorByPStatus: rec.gromorByPStatus
        };
    }
    
    // Try fieldType-based lookup (MAIZE: MAIZE -> irrigated/rainfed)
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

// Get crop data (fallback)
function getCropData(cropName, season, fieldType) {
    const crop = cropsData[cropName];
    if (!crop) return null;
    
    const fieldTypeKey = (fieldType || 'Irrigated').toLowerCase();
    const seasonKey = (season || 'Rabi').toLowerCase();
    
    return crop[fieldTypeKey]?.[seasonKey] || crop[fieldTypeKey]?.['rabi'] || null;
}

// Interpolate from conversion table
function interpolateFromTable(table, value, key) {
    if (!table || table.length === 0) return 0;
    
    for (let i = 0; i < table.length; i++) {
        if (table[i][key] >= value) {
            if (i === 0) return table[0].dose || table[0].qty || 0;
            
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
    
    const last = table[table.length - 1];
    const factor = value / last[key];
    return (last.dose || last.qty || 0) * factor;
}

// Convert P2O5 to Gromor product using direct lookup from location data
function convertP2O5ToGromorDirect(p2o5Status, product, locationRec) {
    if (locationRec && locationRec.gromorByPStatus && locationRec.gromorByPStatus[p2o5Status]) {
        const productKey = product.replace(/-/g, '-');
        return locationRec.gromorByPStatus[p2o5Status][productKey] || 0;
    }
    
    // Fallback to conversion table
    const table = fertilizerConversion.p2o5ToGromor[product];
    if (!table) return 0;
    
    // Use a representative P2O5 value for the status
    let p2o5Value = 12; // Medium
    if (p2o5Status === 'low') p2o5Value = 8;
    if (p2o5Status === 'high') p2o5Value = 30;
    
    return interpolateFromTable(table, p2o5Value, 'p2o5');
}

// Get N and K from Gromor product
function getNutrientsFromGromor(doseKgs, product) {
    const productData = fertilizerConversion.fertilizerProducts[product];
    if (!productData) return { n: 0, k: 0 };

    return {
        n: (doseKgs * productData.n) / 100,
        k: (doseKgs * productData.k) / 100
    };
}

// Calculate actual nutrients from straight fertilizer quantity (after rounding to bags)
function getNutrientsFromStraight(fertilizerKgs, fertilizer) {
    const fertName = fertilizer.toLowerCase().replace(/\./g, '').replace(/\s/g, '');
    const productData = fertilizerConversion.fertilizerProducts &&
                        (fertilizerConversion.fertilizerProducts[fertName] ||
                         fertilizerConversion.fertilizerProducts[fertilizer.toLowerCase()]);
    if (productData) {
        return {
            n: (fertilizerKgs * productData.n) / 100,
            p: (fertilizerKgs * productData.p) / 100,
            k: (fertilizerKgs * productData.k) / 100,
            s: productData.s ? (fertilizerKgs * productData.s) / 100 : 0
        };
    }
    if (fertName === 'urea')      return { n: (fertilizerKgs * 46) / 100, p: 0, k: 0, s: 0 };
    if (fertName === 'as')        return { n: (fertilizerKgs * 21) / 100, p: 0, k: 0, s: (fertilizerKgs * 24) / 100 };
    if (fertName === 'can')       return { n: (fertilizerKgs * 25) / 100, p: 0, k: 0, s: 0 };
    if (fertName === 'mop')       return { n: 0, p: 0, k: (fertilizerKgs * 60) / 100, s: 0 };
    if (fertName === 'sop')       return { n: 0, p: 0, k: (fertilizerKgs * 50) / 100, s: (fertilizerKgs * 18) / 100 };
    if (fertName === 'ssp')       return { n: 0, p: (fertilizerKgs * 16) / 100, k: 0, s: (fertilizerKgs * 12) / 100 };
    return { n: 0, p: 0, k: 0, s: 0 };
}

// Convert N to straight fertilizer
function convertNToStraight(nKgs, fertilizer) {
    const table = fertilizerConversion.nToStraight[fertilizer];
    if (!table) {
        const factor = fertilizerConversion.conversionFactors[fertilizer];
        return nKgs * (factor || 2.2);
    }
    
    return interpolateFromTable(table, nKgs, 'n');
}

// Convert K2O to straight fertilizer
function convertK2OToStraight(k2oKgs, fertilizer) {
    const table = fertilizerConversion.k2oToStraight[fertilizer];
    if (!table) {
        const factor = fertilizerConversion.conversionFactors[fertilizer];
        return k2oKgs * (factor || 1.7);
    }
    
    return interpolateFromTable(table, k2oKgs, 'k2o');
}

// Round to nearest bag fraction
function roundToBag(kgs, bagSize = 50) {
    const fullBag = Math.round(kgs / bagSize);
    const halfBag = Math.round(kgs / (bagSize / 2)) * 0.5;
    const quarterBag = Math.round(kgs / (bagSize / 4)) * 0.25;
    
    const options = [
        { value: fullBag * bagSize, label: `${fullBag} bag(s)`, bags: fullBag },
        { value: halfBag * bagSize, label: `${halfBag} bag(s)`, bags: halfBag },
        { value: quarterBag * bagSize, label: `${quarterBag} bag(s)`, bags: quarterBag }
    ];
    
    const nearest = options.reduce((prev, curr) => {
        return Math.abs(curr.value - kgs) < Math.abs(prev.value - kgs) ? curr : prev;
    });
    
    return {
        kgs: nearest.value,
        bags: nearest.bags,
        label: nearest.label,
        original: kgs
    };
}

// Check fertilizer preference
function checkPreference(fertilizer, preferences) {
    const prefKey = `pref_${fertilizer}`;
    return preferences[prefKey] || 'Optional';
}

// Calculate recommendations for Combination 1: 28-28-0 (basal) + 20-20-0 (1st top) + Urea + MOP
function calculateCombination1(cropData, nPerSplit, kPerSplit, pTotal, pStatus, locationRec, preferences) {
    const recommendations = [];
    
    // Stage 1: Basal Application
    const basalP = pTotal;
    const basalN = nPerSplit[0];
    const basalK = kPerSplit[0] || 0;
    
    // Get 28-28-0 dose based on P status
    const gromor28280 = convertP2O5ToGromorDirect(pStatus, '28-28-0', locationRec);
    const rounded28280 = roundToBag(gromor28280);
    const actualNutrients28280 = getNutrientsFromGromor(rounded28280.kgs, '28-28-0');
    const remainingN = Math.max(0, basalN - actualNutrients28280.n);
    
    const stage1 = {
        stage: cropData.splits.n.stages[0],
        fertilizers: []
    };
    
    if (checkPreference('28-28-0', preferences) !== 'Reject' && rounded28280.kgs > 0) {
        stage1.fertilizers.push({
            name: 'Gromor 28-28-0',
            kgs: rounded28280.kgs,
            ...rounded28280,
            nContributed: actualNutrients28280.n,
            pContributed: (rounded28280.kgs * 28) / 100,
            kContributed: actualNutrients28280.k
        });
    }

    if (remainingN > 0 && checkPreference('Urea', preferences) !== 'Reject') {
        const ureaKgs = convertNToStraight(remainingN, 'urea');
        const roundedUrea1 = roundToBag(ureaKgs);
        if (roundedUrea1.kgs > 0) {
            const actualUreaN1 = getNutrientsFromStraight(roundedUrea1.kgs, 'Urea');
            stage1.fertilizers.push({
                name: 'Urea',
                kgs: roundedUrea1.kgs,
                ...roundedUrea1,
                nContributed: actualUreaN1.n,
                pContributed: 0,
                kContributed: 0
            });
        }
    }

    if (basalK > 0 && checkPreference('MOP', preferences) !== 'Reject') {
        const mopKgs = convertK2OToStraight(basalK, 'mop');
        const roundedMop1 = roundToBag(mopKgs);
        if (roundedMop1.kgs > 0) {
            const actualMopK1 = getNutrientsFromStraight(roundedMop1.kgs, 'MOP');
            stage1.fertilizers.push({
                name: 'MOP',
                kgs: roundedMop1.kgs,
                ...roundedMop1,
                nContributed: 0,
                pContributed: 0,
                kContributed: actualMopK1.k
            });
        }
    }
    
    recommendations.push(stage1);
    
    // Stage 2: First Top Dressing
    if (nPerSplit.length > 1) {
        const topN = nPerSplit[1];
        
        const gromor20200 = convertP2O5ToGromorDirect(pStatus, '20-20-0-13', locationRec) * 0.5;
        const rounded20200 = roundToBag(gromor20200);
        const actualNutrients20200 = getNutrientsFromGromor(rounded20200.kgs, '20-20-0-13');
        const remainingTopN = Math.max(0, topN - actualNutrients20200.n);
        
        const stage2 = {
            stage: cropData.splits.n.stages[1],
            fertilizers: []
        };
        
        if (checkPreference('20-20-0-13', preferences) !== 'Reject' && rounded20200.kgs > 0) {
            stage2.fertilizers.push({
                name: 'Gromor 20-20-0-13',
                kgs: rounded20200.kgs,
                ...rounded20200,
                nContributed: actualNutrients20200.n,
                pContributed: (rounded20200.kgs * 20) / 100,
                kContributed: 0
            });
        }
        
        if (remainingTopN > 0 && checkPreference('Urea', preferences) !== 'Reject') {
            const ureaKgs = convertNToStraight(remainingTopN, 'urea');
            const roundedUrea2 = roundToBag(ureaKgs);
            if (roundedUrea2.kgs > 0) {
                const actualUreaN2 = getNutrientsFromStraight(roundedUrea2.kgs, 'Urea');
                stage2.fertilizers.push({
                    name: 'Urea',
                    kgs: roundedUrea2.kgs,
                    ...roundedUrea2,
                    nContributed: actualUreaN2.n,
                    pContributed: 0,
                    kContributed: 0
                });
            }
        }

        // K is NOT allowed at Tillering — skip MOP for Stage 2

        recommendations.push(stage2);
    }
    
    // Additional stages
    for (let i = 2; i < nPerSplit.length; i++) {
        const stageN = nPerSplit[i];
        const stageK = kPerSplit[i] || 0;
        
        if (stageN <= 0 && stageK <= 0) continue;
        
        const stage = {
            stage: cropData.splits.n.stages[i] || `Stage ${i + 1}`,
            fertilizers: []
        };
        
        if (stageN > 0 && checkPreference('Urea', preferences) !== 'Reject') {
            const ureaKgs = convertNToStraight(stageN, 'urea');
            const roundedUreaS = roundToBag(ureaKgs);
            if (roundedUreaS.kgs > 0) {
                const actualUreaNS = getNutrientsFromStraight(roundedUreaS.kgs, 'Urea');
                stage.fertilizers.push({
                    name: 'Urea',
                    kgs: roundedUreaS.kgs,
                    ...roundedUreaS,
                    nContributed: actualUreaNS.n,
                    pContributed: 0,
                    kContributed: 0
                });
            }
        }

        if (stageK > 0 && checkPreference('MOP', preferences) !== 'Reject') {
            const mopKgs = convertK2OToStraight(stageK, 'mop');
            const roundedMopS = roundToBag(mopKgs);
            if (roundedMopS.kgs > 0) {
                const actualMopKS = getNutrientsFromStraight(roundedMopS.kgs, 'MOP');
                stage.fertilizers.push({
                    name: 'MOP',
                    kgs: roundedMopS.kgs,
                    ...roundedMopS,
                    nContributed: 0,
                    pContributed: 0,
                    kContributed: actualMopKS.k
                });
            }
        }
        
        if (stage.fertilizers.length > 0) {
            recommendations.push(stage);
        }
    }
    
    return recommendations;
}

// Similar functions for other combinations (Combination 2-6)
// ... (keeping similar structure but using pStatus and locationRec)

// Main calculation function - COMPLETELY REWRITTEN
function calculateRecommendations(formData) {
    const crop = formData.crop;
    const organicCarbon = parseFloat(formData.organicCarbon);
    const nitrogen = parseFloat(formData.nitrogen); // Already in kg/acre
    const phosphorus = parseFloat(formData.phosphorus); // Already in kg/acre (P2O5)
    const potassium = parseFloat(formData.potassium); // Already in kg/acre (K2O)
    const season = formData.season || 'Rabi';
    const fieldType = formData.fieldType || 'Irrigated';
    const location = formData.location;
    const sulfur = parseFloat(formData.sulfur) || 0;
    const ph = parseFloat(formData.ph) || 0;

    // Step 1: Classify soil test status
    // Nitrogen: Prefer nitrogen value if available, otherwise use organic carbon
    const nStatus = classifyNitrogenByOC(organicCarbon, nitrogen);
    const pStatus = classifyPhosphorus(phosphorus);
    const kStatus = classifyPotassium(potassium);
    const sStatus = classifySulfur(sulfur);
    
    // Step 2: Get location-based recommendations
    const locationRec = getLocationBasedRecommendation(
        crop, season, location, fieldType, nStatus, pStatus, kStatus
    );
    
    if (!locationRec) {
        throw new Error(`Recommendation data not found for: ${crop} (${season}, ${fieldType}, ${location})`);
    }
    
    // Step 3: Get recommended NPK values
    const recommendedN = locationRec.n;
    const recommendedP = locationRec.p;
    const recommendedK = locationRec.k;
    
    // Step 4: Get split schedule from crop data
    const cropData = getCropData(crop, season, fieldType);
    if (!cropData || !cropData.splits) {
        throw new Error(`Split schedule not found for: ${crop}`);
    }
    
    const nSplits = cropData.splits.n;
    const kSplits = cropData.splits.k;
    
    // Step 5: Calculate per-split requirements
    const nPerSplit = nSplits.ratios.map(ratio => recommendedN * ratio);
    const kPerSplit = kSplits.ratios.map(ratio => recommendedK * ratio);
    
    // Step 6: Determine combination
    let combination = formData.gromorCombination;
    if (!combination && location && locationsData.locationPreferences) {
        const locationPref = locationsData.locationPreferences[location];
        if (locationPref) {
            combination = locationPref.preferredCombination.toString();
        }
    }
    combination = combination || '1';
    
    // Step 7: Get fertilizer preferences
    const preferences = {};
    const form = document.getElementById('soilTestForm');
    const prefInputs = form.querySelectorAll('[name^="pref_"]');
    prefInputs.forEach(input => {
        preferences[input.name] = input.value;
    });
    
    // Step 8: Calculate based on combination
    let recommendations;
    switch (combination) {
        case '1':
            recommendations = calculateCombination1(cropData, nPerSplit, kPerSplit, recommendedP, pStatus, locationRec, preferences);
            break;
        // Add cases 2-6 with similar logic
        default:
            recommendations = calculateCombination1(cropData, nPerSplit, kPerSplit, recommendedP, pStatus, locationRec, preferences);
    }
    
    // Step 9: Nutrient Analysis
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
        }
    };
    
    // Get combination info
    const combinationInfo = locationsData.combinations?.[combination] || {
        name: `Combination ${combination}`,
        description: 'Gromor fertilizer combination'
    };
    
    return {
        recommendations,
        nutrientAnalysis,
        crop,
        season,
        fieldType,
        location,
        combination: combinationInfo,
        soilTestStatus: { nStatus, pStatus, kStatus, sStatus },
        totals: {
            n: recommendedN,
            p: recommendedP,
            k: recommendedK
        },
        recommendedBasedOn: {
            nStatus,
            pStatus,
            kStatus
        }
    };
}

// Display results
function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    let html = `
        <div class="recommendation-card">
            <h3>Recommendation Summary</h3>
            <p><strong>Crop:</strong> ${results.crop}</p>
            <p><strong>Season:</strong> ${results.season || 'Not specified'}</p>
            <p><strong>Field Type:</strong> ${results.fieldType || 'Not specified'}</p>
            ${results.location ? `<p><strong>Location:</strong> ${results.location}</p>` : ''}
        </div>
        
        <div class="recommendation-card">
            <h3>Soil Test Status</h3>
            <p><strong>N Status:</strong> ${results.soilTestStatus.nStatus.toUpperCase()} (based on OC)</p>
            <p><strong>P Status:</strong> ${results.soilTestStatus.pStatus.toUpperCase()}</p>
            <p><strong>K Status:</strong> ${results.soilTestStatus.kStatus.toUpperCase()}</p>
            <p><strong>Recommended NPK (kg/acre):</strong> N=${results.totals.n}, P=${results.totals.p}, K=${results.totals.k}</p>
        </div>
        
        <div class="combination-info">
            <h4>Selected Gromor Combination</h4>
            <p><strong>${results.combination.name}</strong></p>
            <p>${results.combination.description}</p>
        </div>
        
        <div class="recommendation-card">
            <h3>Stage-wise Fertilizer Application</h3>
    `;
    
    results.recommendations.forEach((stage, index) => {
        html += `
            <div class="stage-header">Stage ${index + 1}: ${stage.stage}</div>
        `;
        
        if (stage.fertilizers.length === 0) {
            html += `<p style="padding: 10px; color: #666;">No fertilizers required for this stage.</p>`;
        } else {
            stage.fertilizers.forEach(fert => {
                html += `
                    <div class="fertilizer-item">
                        <span class="fertilizer-name">${fert.name}</span>
                        <span class="fertilizer-details">
                            <strong>${fert.kgs.toFixed(2)} kgs</strong> (${fert.label})
                        </span>
                    </div>
                `;
            });
        }
    });
    
    html += `</div>`;
    
    // Nutrient Analysis
    html += `
        <div class="recommendation-card">
            <h3>Nutrient Analysis (kg/acre)</h3>
            <div class="nutrient-analysis">
    `;
    
    Object.entries(results.nutrientAnalysis).forEach(([nutrient, data]) => {
        if (!data.value && nutrient !== 'sulfur') return;
        const className = data.status || data.classification;
        const unit = nutrient === 'sulfur' ? 'ppm' : 'kg/acre';
        html += `
            <div class="nutrient-item ${className}">
                <strong>${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}</strong><br>
                ${data.value || 'N/A'} ${unit}<br>
                <span style="text-transform: uppercase; font-weight: 600;">${data.status || data.classification}</span>
            </div>
        `;
    });
    
    html += `</div></div>`;
    
    // Summary Statistics
    html += `
        <div class="recommendation-card">
            <h3>Total Requirements (per acre)</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-value">${results.totals.n.toFixed(1)}</div>
                    <div class="stat-label">N (kg/acre)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${results.totals.p.toFixed(1)}</div>
                    <div class="stat-label">P (kg/acre)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${results.totals.k.toFixed(1)}</div>
                    <div class="stat-label">K (kg/acre)</div>
                </div>
            </div>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Form submission handler
document.getElementById('soilTestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Wait for data to load
    if (Object.keys(cropsData).length === 0) {
        await loadData();
    }
    
    const formData = {
        crop: document.getElementById('crop').value,
        organicCarbon: document.getElementById('organicCarbon').value,
        nitrogen: document.getElementById('nitrogen').value,
        phosphorus: document.getElementById('phosphorus').value,
        potassium: document.getElementById('potassium').value,
        season: document.getElementById('season').value,
        fieldType: document.getElementById('fieldType').value,
        location: document.getElementById('location').value,
        sulfur: document.getElementById('sulfur').value,
        ph: document.getElementById('ph').value,
        gromorCombination: document.getElementById('gromorCombination').value
    };
    
    try {
        const results = calculateRecommendations(formData);
        displayResults(results);
    } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
    }
});


