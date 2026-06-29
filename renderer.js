window.displayResults = function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    let html = '';
    
    // STEP 1: Nutrient Analysis (at the top)
    html += `
        <div class="recommendation-card">
            <h3>Nutrient Analysis</h3>
            <div class="nutrient-analysis">
    `;
    
    // Define units for each nutrient
    const nutrientUnits = {
        nitrogen: 'kg/acre',
        phosphorus: 'kg/acre',
        potassium: 'kg/acre',
        sulfur: 'ppm',
        ph: '',
        ec: 'dS/m',
        calcium: 'cmol/kg',
        magnesium: 'cmol/kg',
        zinc: 'ppm',
        boron: 'ppm',
        manganese: 'ppm',
        iron: 'ppm',
        copper: 'ppm',
        molybdenum: 'ppm',
        chlorine: 'ppm'
    };
    
    // Define display names
    const nutrientNames = {
        nitrogen: 'Nitrogen',
        phosphorus: 'Phosphorus',
        potassium: 'Potassium',
        sulfur: 'Sulfur',
        ph: 'pH',
        ec: 'EC',
        calcium: 'Calcium',
        magnesium: 'Magnesium',
        zinc: 'Zinc',
        boron: 'Boron',
        manganese: 'Manganese',
        iron: 'Iron',
        copper: 'Copper',
        molybdenum: 'Molybdenum',
        chlorine: 'Chlorine'
    };
    
    Object.entries(results.nutrientAnalysis).forEach(([nutrient, data]) => {
        // Skip if no value and not a special case (sulfur, ph, ec can be 0)
        if (!data.value && data.value !== 0 && nutrient !== 'sulfur' && nutrient !== 'ph' && nutrient !== 'ec') return;
        
        const className = data.status || data.classification;
        const unit = nutrientUnits[nutrient] || '';
        const displayName = nutrientNames[nutrient] || nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
        
        let displayValue = data.value || 'N/A';
        if (displayValue !== 'N/A' && (nutrient === 'ph' || nutrient === 'ec')) {
            displayValue = parseFloat(displayValue).toFixed(2);
        } else if (displayValue !== 'N/A' && (nutrient === 'zinc' || nutrient === 'boron' || nutrient === 'copper' || nutrient === 'molybdenum')) {
            displayValue = parseFloat(displayValue).toFixed(2);
        } else if (displayValue !== 'N/A' && (nutrient === 'manganese' || nutrient === 'iron' || nutrient === 'chlorine')) {
            displayValue = parseFloat(displayValue).toFixed(1);
        } else if (displayValue !== 'N/A' && nutrient === 'ph') {
            displayValue = parseFloat(displayValue).toFixed(1);
        }
        
        let classificationText = data.status || data.classification || 'N/A';
        if (nutrient === 'ph' && classificationText && classificationText !== 'N/A') {
            // Format pH classification text (e.g., "stronglyAcidic" -> "Strongly Acidic")
            classificationText = classificationText.replace(/([A-Z])/g, ' $1').trim();
            classificationText = classificationText.charAt(0).toUpperCase() + classificationText.slice(1);
        } else if (['calcium', 'magnesium', 'zinc', 'boron', 'manganese', 'iron', 'copper', 'molybdenum', 'chlorine'].includes(nutrient)) {
            // For micronutrients and secondary nutrients, use Deficiency/Sufficiency
            if (classificationText === 'low' || classificationText === 'deficiency') {
                classificationText = 'Deficiency';
            } else if (classificationText === 'high' || classificationText === 'sufficiency') {
                classificationText = 'Sufficiency';
            } else if (classificationText && classificationText !== 'N/A') {
                classificationText = classificationText.charAt(0).toUpperCase() + classificationText.slice(1);
            }
        } else if (nutrient !== 'ph' && classificationText && classificationText !== 'N/A') {
            classificationText = classificationText.toUpperCase();
        }
        
        html += `
            <div class="nutrient-item ${className}">
                <strong>${displayName}</strong><br>
                ${displayValue}${unit ? ' ' + unit : ''}<br>
                <span style="text-transform: ${nutrient === 'ph' ? 'none' : 'uppercase'}; font-weight: 600;">${classificationText}</span>
            </div>
        `;
    });
    
    html += `</div></div>`;
    
    // pH Recommendations (if available) - right after Nutrient Analysis
    if (results.phRecommendations) {
        const phRec = results.phRecommendations;
        const priorityClass = phRec.priority === 'high' ? 'high' : phRec.priority === 'medium' ? 'medium' : 'low';
        html += `
        <div class="recommendation-card" style="border-left: 4px solid ${phRec.priority === 'high' ? '#e74c3c' : phRec.priority === 'medium' ? '#f39c12' : '#3498db'};">
            <h3>${phRec.title}</h3>
            <div class="ph-advisory" style="padding: 15px; background: ${phRec.priority === 'high' ? '#fee' : phRec.priority === 'medium' ? '#fff8e1' : '#e3f2fd'}; border-radius: 5px; margin-top: 10px;">
                <p style="margin: 0; line-height: 1.6; color: #333;">
                    <strong>Recommendation:</strong> ${phRec.advisory}
                </p>
            </div>
        </div>
        `;
    }
    
    // STEP 2: Total Requirements (after Nutrient Analysis)
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
            
            ${results.calculationSteps ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #3498db;">
                <h4 style="margin-top: 0; color: #2c3e50;">📊 Calculation Steps</h4>
                <div style="margin-top: 15px;">
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #27ae60;">Step 1: ${results.calculationSteps.step1.title}</strong>
                        <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 3px;">
                            <div><strong>Base Recommendation:</strong> N=${results.calculationSteps.step1.baseRecommendation.n} kg, P=${results.calculationSteps.step1.baseRecommendation.p} kg, K=${results.calculationSteps.step1.baseRecommendation.k} kg/acre</div>
                            <div style="margin-top: 8px;"><strong>Adjustments:</strong></div>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>N: ${results.calculationSteps.step1.adjustments.n.value > 0 ? '+' : ''}${results.calculationSteps.step1.adjustments.n.value.toFixed(1)} kg - ${results.calculationSteps.step1.adjustments.n.reason}</li>
                                <li>P: ${results.calculationSteps.step1.adjustments.p.value > 0 ? '+' : ''}${results.calculationSteps.step1.adjustments.p.value.toFixed(1)} kg - ${results.calculationSteps.step1.adjustments.p.reason}</li>
                                <li>K: ${results.calculationSteps.step1.adjustments.k.value > 0 ? '+' : ''}${results.calculationSteps.step1.adjustments.k.value.toFixed(1)} kg - ${results.calculationSteps.step1.adjustments.k.reason}</li>
                            </ul>
                            <div style="margin-top: 8px;"><strong>Final Recommendation:</strong> N=${results.calculationSteps.step1.finalRecommendation.n} kg, P=${results.calculationSteps.step1.finalRecommendation.p} kg, K=${results.calculationSteps.step1.finalRecommendation.k} kg/acre</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #27ae60;">Step 2: ${results.calculationSteps.step2.title}</strong>
                        <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 3px;">
                            <div><strong>Selected:</strong> ${results.calculationSteps.step2.selectedFertilizer}</div>
                            <div style="margin-top: 5px;"><strong>Reason:</strong> ${results.calculationSteps.step2.reason}</div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${results.nutrientComparison ? `
            <div style="margin-top: 20px; padding: 15px; background: #fff8e1; border-radius: 5px; border-left: 4px solid #ff9800;">
                <h4 style="margin-top: 0; color: #2c3e50;">📋 Available vs Required Comparison</h4>
                <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Nutrient</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Available (kg/acre)</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Required (kg/acre)</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Adjustment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>N</strong></td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.nutrientComparison.available.n.toFixed(1)}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.nutrientComparison.required.n.toFixed(1)}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ${results.nutrientComparison.adjustment.n > 0 ? '#27ae60' : results.nutrientComparison.adjustment.n < 0 ? '#e74c3c' : '#666'};">
                                ${results.nutrientComparison.adjustment.n > 0 ? '+' : ''}${results.nutrientComparison.adjustment.n.toFixed(1)} kg
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>P</strong></td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.nutrientComparison.available.p.toFixed(1)}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.nutrientComparison.required.p.toFixed(1)}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ${results.nutrientComparison.adjustment.p > 0 ? '#27ae60' : results.nutrientComparison.adjustment.p < 0 ? '#e74c3c' : '#666'};">
                                ${results.nutrientComparison.adjustment.p > 0 ? '+' : ''}${results.nutrientComparison.adjustment.p.toFixed(1)} kg
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>K</strong></td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.nutrientComparison.available.k.toFixed(1)}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.nutrientComparison.required.k.toFixed(1)}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ${results.nutrientComparison.adjustment.k > 0 ? '#27ae60' : results.nutrientComparison.adjustment.k < 0 ? '#e74c3c' : '#666'};">
                                ${results.nutrientComparison.adjustment.k > 0 ? '+' : ''}${results.nutrientComparison.adjustment.k.toFixed(1)} kg
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <strong>Adjustment Reasons:</strong><br>
                    • N: ${results.nutrientComparison.reason.n}<br>
                    • P: ${results.nutrientComparison.reason.p}<br>
                    • K: ${results.nutrientComparison.reason.k}
                </div>
            </div>
            ` : ''}
            ${results.optimizationInfo && results.optimizationInfo.excess ? `
            <div style="margin-top: 15px; padding: 12px; background: ${results.optimizationInfo.excess.withinTolerance ? '#e8f5e9' : '#fff3e0'}; border-radius: 5px; border-left: 3px solid ${results.optimizationInfo.excess.withinTolerance ? '#4caf50' : '#ff9800'};">
                <h4 style="margin: 0 0 10px 0; font-size: 0.95em;">Optimization Result</h4>
                <div style="font-size: 0.85em; line-height: 1.6;">
                    <div><strong>Total Delivered:</strong> N: ${results.optimizationInfo.excess.totalN.toFixed(1)} kg, P: ${results.optimizationInfo.excess.totalP.toFixed(1)} kg, K: ${results.optimizationInfo.excess.totalK.toFixed(1)} kg</div>
                    <div><strong>Excess:</strong> N: ${results.optimizationInfo.excess.excessN.toFixed(1)} kg (${results.optimizationInfo.excess.excessNPercent.toFixed(1)}%), 
                    P: ${results.optimizationInfo.excess.excessP.toFixed(1)} kg (${results.optimizationInfo.excess.excessPPercent.toFixed(1)}%), 
                    K: ${results.optimizationInfo.excess.excessK.toFixed(1)} kg (${results.optimizationInfo.excess.excessKPercent.toFixed(1)}%)</div>
                    <div style="margin-top: 5px; font-weight: 600; color: ${results.optimizationInfo.excess.withinTolerance ? '#2e7d32' : '#e65100'};">
                        ${results.optimizationInfo.excess.withinTolerance ? '✓ Within 10% tolerance' : '⚠ Exceeds 10% tolerance - best available solution'}
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    // STEP 3: Recommendation Summary and Combination Info
    html += `
        <div class="recommendation-card">
            <h3>Recommendation Summary</h3>
            <p><strong>Crop:</strong> ${results.crop}</p>
            <p><strong>Season:</strong> ${results.season || 'Not specified'}</p>
            <p><strong>Field Type:</strong> ${results.fieldType || 'Not specified'}</p>
            ${results.location ? `<p><strong>Location:</strong> ${results.location}</p>` : ''}
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
        // Get expected and actual NPK for this stage
        const expected = results.expectedNPKPerStage[index];
        const actual = results.actualNPKPerStage[index];
        
        html += `
            <div class="stage-header">Stage ${index + 1}: ${stage.stage}</div>
        `;
        
        // Display NPK breakdown for this stage
        if (expected && actual) {
            html += `
                <div style="background: #f8f9fa; padding: 12px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #3498db;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.9em;">
                        <div>
                            <strong style="color: #27ae60;">N (kg/acre):</strong><br>
                            Expected: ${expected.expectedN.toFixed(2)} (${(expected.nRatio * 100).toFixed(0)}%)<br>
                            Actual: <strong>${actual.actualN.toFixed(2)}</strong>
                            ${Math.abs(actual.actualN - expected.expectedN) > 0.1 ? 
                                `<span style="color: ${actual.actualN < expected.expectedN ? '#e74c3c' : '#27ae60'};">
                                    (${actual.actualN > expected.expectedN ? '+' : ''}${(actual.actualN - expected.expectedN).toFixed(2)})
                                </span>` : 
                                '<span style="color: #27ae60;">✓</span>'}
                        </div>
                        <div>
                            <strong style="color: #e67e22;">P (kg/acre):</strong><br>
                            Expected: ${expected.expectedP.toFixed(2)}<br>
                            Actual: <strong>${actual.actualP.toFixed(2)}</strong>
                            ${Math.abs(actual.actualP - expected.expectedP) > 0.1 ? 
                                `<span style="color: ${actual.actualP < expected.expectedP ? '#e74c3c' : '#27ae60'};">
                                    (${actual.actualP > expected.expectedP ? '+' : ''}${(actual.actualP - expected.expectedP).toFixed(2)})
                                </span>` : 
                                '<span style="color: #27ae60;">✓</span>'}
                        </div>
                        <div>
                            <strong style="color: #8e44ad;">K (kg/acre):</strong><br>
                            Expected: ${expected.expectedK.toFixed(2)} ${expected.kRatio > 0 ? `(${(expected.kRatio * 100).toFixed(0)}%)` : ''}<br>
                            Actual: <strong>${actual.actualK.toFixed(2)}</strong>
                            ${expected.kRatio > 0 && Math.abs(actual.actualK - expected.expectedK) > 0.1 ? 
                                `<span style="color: ${actual.actualK < expected.expectedK ? '#e74c3c' : '#27ae60'};">
                                    (${actual.actualK > expected.expectedK ? '+' : ''}${(actual.actualK - expected.expectedK).toFixed(2)})
                                </span>` : 
                                expected.kRatio > 0 ? '<span style="color: #27ae60;">✓</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (stage.fertilizers.length === 0) {
            html += `<p style="padding: 10px; color: #666;">No fertilizers required for this stage.</p>`;
        } else {
            stage.fertilizers.forEach(fert => {
                html += `
                    <div class="fertilizer-item">
                        <span class="fertilizer-name">${fert.name}</span>
                        <span class="fertilizer-details">
                            <strong>${fert.label || fert.kgs.toFixed(2) + ' kg'}</strong>
                        </span>
                    </div>
                `;
            });
        }
    });
    
    html += `</div>`;
    
    // Micronutrient Recommendations — placed AFTER fertilizer table (not at top)
    if (results.micronutrientRecommendations && results.micronutrientRecommendations.length > 0) {
        html += `
        <div class="recommendation-card" style="border-left: 4px solid #8e44ad;">
            <h3>🌱 Micronutrient & Soil Amendment Recommendations</h3>
        `;
        results.micronutrientRecommendations.forEach(rec => {
            const priorityColor = rec.priority === 'high' ? '#e74c3c' : rec.priority === 'medium' ? '#f39c12' : '#3498db';
            html += `
            <div style="margin-top: 15px; padding: 15px; background: #f3e5f5; border-radius: 5px; border-left: 4px solid ${priorityColor};">
                <h4 style="margin: 0 0 8px 0; color: #6a1b9a;">${rec.nutrient}</h4>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><strong>Condition:</strong> ${rec.condition}</p>
                <p style="margin: 8px 0; line-height: 1.6; color: #333;">${rec.recommendation}</p>
                <div style="margin-top: 10px; display: flex; gap: 20px; flex-wrap: wrap;">
                    <span style="background: #e1bee7; padding: 4px 12px; border-radius: 12px; font-size: 0.85em;"><strong>Dose:</strong> ${rec.dose}</span>
                    <span style="background: #e1bee7; padding: 4px 12px; border-radius: 12px; font-size: 0.85em;"><strong>Timing:</strong> ${rec.timing}</span>
                </div>
            </div>
            `;
        });
        html += `</div>`;
    }
    
    // "+ More" button to expand additional details
    html += `
        <div style="text-align: center; margin: 20px 0;">
            <button id="moreDetailsBtn" onclick="toggleMoreDetails()" style="background: none; border: 2px dashed #3498db; color: #3498db; padding: 10px 30px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 600;">
                + Add More
            </button>
        </div>
        <div id="moreDetailsSection" style="display: none;">
    `;
    
    // ENHANCEMENT: Nutrient Contribution Table (Excel format)
    if (results.nutrientContributionTable && results.nutrientContributionTable.length > 0) {
        html += `
            <div class="recommendation-card">
                <h3>📊 Nutrient Contribution Table (Excel Format)</h3>
        `;
        
        results.nutrientContributionTable.forEach((stageData, idx) => {
            html += `
                <div style="margin-top: ${idx > 0 ? '30px' : '0'};">
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">Stage: ${stageData.stage}</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em;">
                        <thead>
                            <tr style="background: #3498db; color: white;">
                                <th style="padding: 10px; text-align: left; border: 1px solid #2980b9;">Fertilizer</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #2980b9;">Qty (kg)</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #2980b9;">N (kg)</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #2980b9;">P (kg)</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #2980b9;">K (kg)</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #2980b9;">S (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            stageData.fertilizers.forEach(fert => {
                html += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>${fert.name}</strong></td>
                        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${fert.qty.toFixed(1)}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${fert.n.toFixed(2)}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${fert.p.toFixed(2)}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${fert.k.toFixed(2)}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${fert.s.toFixed(2)}</td>
                    </tr>
                `;
            });
            
            html += `
                            <tr style="background: #ecf0f1; font-weight: bold;">
                                <td style="padding: 8px; border: 1px solid #ddd;">Total</td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${stageData.fertilizers.reduce((sum, f) => sum + f.qty, 0).toFixed(1)}</td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${stageData.totals.n.toFixed(2)}</td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${stageData.totals.p.toFixed(2)}</td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${stageData.totals.k.toFixed(2)}</td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${stageData.totals.s.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // ENHANCEMENT: Balance Tracking
    if (results.balanceTracking) {
        html += `
            <div class="recommendation-card">
                <h3>⚖️ Balance Tracking (Remaining Nutrients)</h3>
                <div style="margin-top: 15px;">
                    <div style="padding: 12px; background: #e3f2fd; border-radius: 5px; margin-bottom: 10px;">
                        <strong>Initial Balance:</strong> N=${results.balanceTracking.initial.n.toFixed(2)} kg, P=${results.balanceTracking.initial.p.toFixed(2)} kg, K=${results.balanceTracking.initial.k.toFixed(2)} kg
                    </div>
        `;
        
        if (results.balanceTracking.afterBasal) {
            const bal = results.balanceTracking.afterBasal;
            const isComplete = Math.abs(bal.n) < 0.1 && Math.abs(bal.p) < 0.1 && Math.abs(bal.k) < 0.1;
            html += `
                    <div style="padding: 12px; background: ${isComplete ? '#e8f5e9' : '#fff3e0'}; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid ${isComplete ? '#4caf50' : '#ff9800'};">
                        <strong>After Basal Application:</strong><br>
                        N Balance: <span style="color: ${bal.n < -0.1 ? '#e74c3c' : bal.n > 0.1 ? '#27ae60' : '#666'};">${bal.n.toFixed(2)} kg</span> ${Math.abs(bal.n) < 0.1 ? '✓' : ''}<br>
                        P Balance: <span style="color: ${bal.p < -0.1 ? '#e74c3c' : bal.p > 0.1 ? '#27ae60' : '#666'};">${bal.p.toFixed(2)} kg</span> ${Math.abs(bal.p) < 0.1 ? '✓' : ''}<br>
                        K Balance: <span style="color: ${bal.k < -0.1 ? '#e74c3c' : bal.k > 0.1 ? '#27ae60' : '#666'};">${bal.k.toFixed(2)} kg</span> ${Math.abs(bal.k) < 0.1 ? '✓' : ''}
                    </div>
            `;
        }
        
        if (results.balanceTracking.afterTop1) {
            const bal = results.balanceTracking.afterTop1;
            const isComplete = Math.abs(bal.n) < 0.1 && Math.abs(bal.p) < 0.1 && Math.abs(bal.k) < 0.1;
            html += `
                    <div style="padding: 12px; background: ${isComplete ? '#e8f5e9' : '#fff3e0'}; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid ${isComplete ? '#4caf50' : '#ff9800'};">
                        <strong>After 1st Top Dressing:</strong><br>
                        N Balance: <span style="color: ${bal.n < -0.1 ? '#e74c3c' : bal.n > 0.1 ? '#27ae60' : '#666'};">${bal.n.toFixed(2)} kg</span> ${Math.abs(bal.n) < 0.1 ? '✓' : ''}<br>
                        P Balance: <span style="color: ${bal.p < -0.1 ? '#e74c3c' : bal.p > 0.1 ? '#27ae60' : '#666'};">${bal.p.toFixed(2)} kg</span> ${Math.abs(bal.p) < 0.1 ? '✓' : ''}<br>
                        K Balance: <span style="color: ${bal.k < -0.1 ? '#e74c3c' : bal.k > 0.1 ? '#27ae60' : '#666'};">${bal.k.toFixed(2)} kg</span> ${Math.abs(bal.k) < 0.1 ? '✓' : ''}
                    </div>
            `;
        }
        
        if (results.balanceTracking.afterTop2) {
            const bal = results.balanceTracking.afterTop2;
            const isComplete = Math.abs(bal.n) < 0.1 && Math.abs(bal.p) < 0.1 && Math.abs(bal.k) < 0.1;
            html += `
                    <div style="padding: 12px; background: ${isComplete ? '#e8f5e9' : '#fff3e0'}; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid ${isComplete ? '#4caf50' : '#ff9800'};">
                        <strong>After 2nd Top Dressing:</strong><br>
                        N Balance: <span style="color: ${bal.n < -0.1 ? '#e74c3c' : bal.n > 0.1 ? '#27ae60' : '#666'};">${bal.n.toFixed(2)} kg</span> ${Math.abs(bal.n) < 0.1 ? '✓' : ''}<br>
                        P Balance: <span style="color: ${bal.p < -0.1 ? '#e74c3c' : bal.p > 0.1 ? '#27ae60' : '#666'};">${bal.p.toFixed(2)} kg</span> ${Math.abs(bal.p) < 0.1 ? '✓' : ''}<br>
                        K Balance: <span style="color: ${bal.k < -0.1 ? '#e74c3c' : bal.k > 0.1 ? '#27ae60' : '#666'};">${bal.k.toFixed(2)} kg</span> ${Math.abs(bal.k) < 0.1 ? '✓' : ''}
                    </div>
            `;
        }
        
        html += `</div></div>`;
    }
    
    // ENHANCEMENT: Remarks/Notes
    if (results.remarks && results.remarks.length > 0) {
        html += `
            <div class="recommendation-card">
                <h3>📝 Remarks & Notes</h3>
                <ul style="line-height: 1.8;">
        `;
        results.remarks.forEach(remark => {
            html += `<li style="margin-bottom: 8px;">${remark}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // Close the "+ More" section div
    html += `</div>`;
    
    resultsContent.innerHTML = html;
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Toggle "+ More" details section
window.toggleMoreDetails = function toggleMoreDetails() {
    const section = document.getElementById('moreDetailsSection');
    const btn = document.getElementById('moreDetailsBtn');
    if (section && btn) {
        const isHidden = section.style.display === 'none';
        section.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? '- Show Less' : '+ Add More';
        btn.style.borderColor = isHidden ? '#27ae60' : '#3498db';
        btn.style.color = isHidden ? '#27ae60' : '#3498db';
    }
}