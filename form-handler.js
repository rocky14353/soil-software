window.handleFormSubmission = function handleFormSubmission() {
    _runFormSubmission().catch(function(err) {
        console.error('[handleFormSubmission] Unhandled error:', err);
        alert('❌ Unexpected error: ' + (err.message || err));
    });
}

window._runFormSubmission = async function _runFormSubmission() {
    const btn = document.getElementById('getRecommendationBtn');
    const originalText = btn ? btn.textContent : 'Get Recommendation';

    // Show loading state immediately so user knows button worked
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Processing...'; }

    try {
        // Get form reference
        const form = document.getElementById('soilTestForm');
        if (!form) throw new Error('Form not found on page');
        
        // Wait for crop/location data to load
        if (Object.keys(cropsData).length === 0) {
            await loadData();
        }
        
        // Read all form values
        const formData = {
            crop:             document.getElementById('crop').value,
            organicCarbon:    document.getElementById('organicCarbon').value,
            nitrogen:         document.getElementById('nitrogen').value,
            phosphorus:       document.getElementById('phosphorus').value,
            potassium:        document.getElementById('potassium').value,
            season:           document.getElementById('season').value,
            fieldType:        document.getElementById('fieldType').value,
            location:         document.getElementById('location').value,
            sulfur:           document.getElementById('sulfur').value,
            ph:               document.getElementById('ph').value,
            gromorCombination:document.getElementById('gromorCombination').value,
            soilType:         document.getElementById('soilType').value,
            ec:               document.getElementById('ec').value,
            calcium:          document.getElementById('calcium').value,
            magnesium:        document.getElementById('magnesium').value,
            zinc:             document.getElementById('zinc').value,
            boron:            document.getElementById('boron').value,
            manganese:        document.getElementById('manganese').value,
            iron:             document.getElementById('iron').value,
            copper:           document.getElementById('copper').value,
            molybdenum:       document.getElementById('molybdenum').value,
            chlorine:         document.getElementById('chlorine').value
        };
        
        // Read fertilizer preferences
        const preferences = {};
        form.querySelectorAll('[name^="pref_"]').forEach(input => {
            preferences[input.name.replace('pref_', '')] = input.value;
        });
        formData.preferences = preferences;
        
        // Validate required fields - show clear alerts
        if (!formData.crop) {
            alert('⚠️ Please select a Crop before getting recommendations.');
            document.getElementById('crop').focus();
            return;
        }
        if (!formData.location) {
            alert('⚠️ Please select a Location/Area before getting recommendations.');
            document.getElementById('location').focus();
            return;
        }
        if (!formData.season) {
            alert('⚠️ Please select a Season before getting recommendations.');
            document.getElementById('season').focus();
            return;
        }
        if (!formData.fieldType) {
            alert('⚠️ Please select a Field Type before getting recommendations.');
            document.getElementById('fieldType').focus();
            return;
        }
        
        // Validate numeric inputs against allowed ranges
        var numValidation = validateNumericInputs();
        if (!numValidation.valid) {
            alert('Input validation failed:\n' + numValidation.errors.join('\n'));
            return;
        }
        
        // Run calculation
        console.log('[handleFormSubmission] Running calculation with:', formData);
        var results = calculateRecommendations(formData);
        
        // Global validation: sum delivered nutrients across all stages
        var totalDelivered = { n: 0, p: 0, k: 0 };
        if (results.recommendations) {
            results.recommendations.forEach(function(stage) {
                (stage.fertilizers || []).forEach(function(fert) {
                    totalDelivered.n += fert.nContributed || 0;
                    totalDelivered.p += fert.pContributed || 0;
                    totalDelivered.k += fert.kContributed || 0;
                });
            });
        }
        // Pass required NPK — use the recommended totals from calculation
        var globalVal = validateGlobalDelivery(results.recommendations || [], {
            n: results.totals ? results.totals.n : 0,
            p: results.totals ? results.totals.p : 0,
            k: results.totals ? results.totals.k : 0
        });
        results.globalValidation = globalVal;
        
        // Display results
        displayResults(results);
        
        // Show feedback form after results
        if (typeof showFeedbackForm === 'function') {
            showFeedbackForm(formData, results);
        }
        
    } catch (error) {
        console.error('[handleFormSubmission] Error:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        
        // Show error in results section
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');
        if (resultsSection && resultsContent) {
            resultsSection.style.display = 'block';
            resultsContent.innerHTML = `
                <div style="padding:20px;background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;border-radius:5px;">
                    <h3 style="margin-top:0;">❌ Error Generating Recommendation</h3>
                    <p><strong>Error:</strong> ${errorMsg}</p>
                    <p>💡 <strong>Tip:</strong> Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) usually fixes this. If not, try incognito/private window.</p>
                    <p>Check browser console (F12) for details.</p>
                </div>`;
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('❌ Error: ' + errorMsg + '\n\nCheck browser console (F12) for details.');
        }
    } finally {
        // Always restore button
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

window.savePayload = function savePayload() {
    const form = document.getElementById('soilTestForm');
    const formData = new FormData(form);
    const payload = {};
    
    // Save all form fields
    for (let [key, value] of formData.entries()) {
        payload[key] = value;
    }
    
    // Also save all select and input values explicitly
    payload.crop = document.getElementById('crop').value;
    payload.organicCarbon = document.getElementById('organicCarbon').value;
    payload.nitrogen = document.getElementById('nitrogen').value;
    payload.phosphorus = document.getElementById('phosphorus').value;
    payload.potassium = document.getElementById('potassium').value;
    payload.season = document.getElementById('season').value;
    payload.fieldType = document.getElementById('fieldType').value;
    payload.location = document.getElementById('location').value;
        payload.sulfur = document.getElementById('sulfur').value;
        payload.ph = document.getElementById('ph').value;
        payload.gromorCombination = document.getElementById('gromorCombination').value;
        payload.soilType = document.getElementById('soilType').value;
        payload.ec = document.getElementById('ec').value;
        payload.calcium = document.getElementById('calcium').value;
        payload.magnesium = document.getElementById('magnesium').value;
        payload.zinc = document.getElementById('zinc').value;
        payload.boron = document.getElementById('boron').value;
        payload.manganese = document.getElementById('manganese').value;
        payload.iron = document.getElementById('iron').value;
        payload.copper = document.getElementById('copper').value;
        payload.molybdenum = document.getElementById('molybdenum').value;
        payload.chlorine = document.getElementById('chlorine').value;
    
    // Save all fertilizer preferences
    const prefInputs = form.querySelectorAll('[name^="pref_"]');
    prefInputs.forEach(input => {
        payload[input.name] = input.value;
    });
    
    // Save to localStorage
    localStorage.setItem('soilTestPayload', JSON.stringify(payload));
    
    // Show notification
    showPayloadNotification('Payload saved successfully!', 'success');
}

window.loadPayload = function loadPayload() {
    const savedPayload = localStorage.getItem('soilTestPayload');
    
    if (!savedPayload) {
        showPayloadNotification('No saved payload found!', 'error');
        return;
    }
    
    try {
        const payload = JSON.parse(savedPayload);
        const form = document.getElementById('soilTestForm');
        
        // Load all form fields
        Object.keys(payload).forEach(key => {
            const element = form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = payload[key] === element.value;
                } else {
                    element.value = payload[key] || '';
                }
            }
        });
        
        // Explicitly set main fields
        if (payload.crop) document.getElementById('crop').value = payload.crop;
        if (payload.organicCarbon) document.getElementById('organicCarbon').value = payload.organicCarbon;
        if (payload.nitrogen) document.getElementById('nitrogen').value = payload.nitrogen;
        if (payload.phosphorus) document.getElementById('phosphorus').value = payload.phosphorus;
        if (payload.potassium) document.getElementById('potassium').value = payload.potassium;
        if (payload.season) document.getElementById('season').value = payload.season;
        if (payload.fieldType) document.getElementById('fieldType').value = payload.fieldType;
        if (payload.location) document.getElementById('location').value = payload.location;
        if (payload.sulfur) document.getElementById('sulfur').value = payload.sulfur;
        if (payload.ph) document.getElementById('ph').value = payload.ph;
        if (payload.gromorCombination) document.getElementById('gromorCombination').value = payload.gromorCombination;
        if (payload.soilType) document.getElementById('soilType').value = payload.soilType;
        if (payload.ec) document.getElementById('ec').value = payload.ec;
        if (payload.calcium) document.getElementById('calcium').value = payload.calcium;
        if (payload.magnesium) document.getElementById('magnesium').value = payload.magnesium;
        if (payload.zinc) document.getElementById('zinc').value = payload.zinc;
        if (payload.boron) document.getElementById('boron').value = payload.boron;
        if (payload.manganese) document.getElementById('manganese').value = payload.manganese;
        if (payload.iron) document.getElementById('iron').value = payload.iron;
        if (payload.copper) document.getElementById('copper').value = payload.copper;
        if (payload.molybdenum) document.getElementById('molybdenum').value = payload.molybdenum;
        if (payload.chlorine) document.getElementById('chlorine').value = payload.chlorine;
        
        // Load fertilizer preferences
        const prefInputs = form.querySelectorAll('[name^="pref_"]');
        prefInputs.forEach(input => {
            if (payload[input.name]) {
                input.value = payload[input.name];
            }
        });
        
        showPayloadNotification('Payload loaded successfully! You can now click "Get Recommendation".', 'success');
        
        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        showPayloadNotification('Error loading payload: ' + error.message, 'error');
        console.error('Error loading payload:', error);
    }
}

window.showPayloadNotification = function showPayloadNotification(message, type) {
    const notification = document.getElementById('payloadNotification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    if (type === 'success') {
        notification.style.background = '#d4edda';
        notification.style.color = '#155724';
        notification.style.border = '1px solid #c3e6cb';
    } else {
        notification.style.background = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.border = '1px solid #f5c6cb';
    }
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}