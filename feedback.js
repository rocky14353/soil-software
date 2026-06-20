/**
 * Feedback Module
 * Captures user feedback + full prediction payload as downloadable JSON reports
 * These reports can be uploaded to the repo for debugging.
 */

// ── Exposed globally ──────────────────────────────────────────
var currentFeedbackData = null;

/**
 * Show the feedback section after a prediction
 * @param {object} formData - The original input payload
 * @param {object} results - The recommendation results
 */
function showFeedbackForm(formData, results) {
    // Store the data for report generation
    currentFeedbackData = {
        timestamp: new Date().toISOString(),
        inputs: {
            crop: formData.crop || '',
            organicCarbon: formData.organicCarbon || '',
            nitrogen: formData.nitrogen || '',
            phosphorus: formData.phosphorus || '',
            potassium: formData.potassium || '',
            season: formData.season || '',
            fieldType: formData.fieldType || '',
            location: formData.location || '',
            soilType: formData.soilType || '',
            pH: formData.ph || '',
            EC: formData.ec || ''
        },
        systemOutput: {
            totalN: results.totalN || results.totals?.n || 0,
            totalP: results.totalP || results.totals?.p || 0,
            totalK: results.totalK || results.totals?.k || 0,
            recommendations: results.recommendations || [],
            globalValidation: results.globalValidation || null
        },
        userFeedback: {
            expectedOutcome: '',
            whatWasWrong: ''
        }
    };

    // Show the feedback section
    var section = document.getElementById('feedbackSection');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Generate and download a JSON feedback report
 */
function generateFeedbackReport() {
    var expected = document.getElementById('feedbackWhatExpected')?.value?.trim() || '';
    var wrong = document.getElementById('feedbackWhatWrong')?.value?.trim() || '';

    if (!expected) {
        showFeedbackNotification('Please tell us what you expected instead.', 'error');
        return;
    }

    if (!currentFeedbackData) {
        showFeedbackNotification('No prediction data found. Run a recommendation first.', 'error');
        return;
    }

    // Build the report
    var report = JSON.parse(JSON.stringify(currentFeedbackData));
    report.userFeedback.expectedOutcome = expected;
    report.userFeedback.whatWasWrong = wrong;
    report.reportFormat = 'soil-test-feedback-v1';
    report.url = window.location.href;

    // Show preview
    var previewDiv = document.getElementById('feedbackPreview');
    if (previewDiv) {
        previewDiv.style.display = 'block';
        previewDiv.textContent = JSON.stringify(report, null, 2);
    }

    // Generate filename: crop-timestamp
    var crop = (currentFeedbackData.inputs.crop || 'unknown')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
    var now = new Date();
    var ts = now.getFullYear() +
        String(now.getMonth()+1).padStart(2,'0') +
        String(now.getDate()).padStart(2,'0') + '-' +
        String(now.getHours()).padStart(2,'0') +
        String(now.getMinutes()).padStart(2,'0') +
        String(now.getSeconds()).padStart(2,'0');
    var filename = 'feedback-' + crop + '-' + ts + '.json';

    // Download
    var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showFeedbackNotification('Report saved as ' + filename + ' ✅ Share with the developer!', 'success');
}

/**
 * Copy feedback to clipboard (for WhatsApp sharing)
 */
function copyFeedbackToClipboard() {
    var expected = document.getElementById('feedbackWhatExpected')?.value?.trim() || '';
    var wrong = document.getElementById('feedbackWhatWrong')?.value?.trim() || '';

    if (!expected) {
        showFeedbackNotification('Please tell us what you expected instead.', 'error');
        return;
    }

    var crop = currentFeedbackData?.inputs?.crop || '?';
    var text = '🌾 Soil Test Feedback - ' + crop + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '📥 Expected: ' + expected + '\n' +
        (wrong ? '⚠️ Issue: ' + wrong + '\n' : '') +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '📎 Full report: download from the page';

    navigator.clipboard.writeText(text).then(function() {
        showFeedbackNotification('Copied to clipboard! Share it via WhatsApp 📱', 'success');
    }).catch(function() {
        showFeedbackNotification('Could not copy. Try the Download button instead.', 'error');
    });
}

/**
 * Show notification in feedback section
 */
function showFeedbackNotification(msg, type) {
    var el = document.getElementById('feedbackNotification');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = msg;
    el.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
    el.style.color = type === 'success' ? '#155724' : '#721c24';
    el.style.border = '1px solid ' + (type === 'success' ? '#c3e6cb' : '#f5c6cb');
}

// Export if in Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showFeedbackForm: showFeedbackForm,
        generateFeedbackReport: generateFeedbackReport,
        copyFeedbackToClipboard: copyFeedbackToClipboard
    };
}