/**
 * Feedback Module v2 — Auto-creates GitHub Issues
 * Submits feedback + full payload directly to the repo as a GitHub Issue
 */

var currentFeedbackData = null;

/**
 * Show the feedback section after a prediction
 */
function showFeedbackForm(formData, results) {
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
            EC: formData.ec || '',
            sulfur: formData.sulfur || ''
        },
        systemOutput: results.recommendations ? {
            totals: results.totals || {},
            globalValidation: results.globalValidation || null,
            stages: results.recommendations.map(function(s) {
                return {
                    name: s.stage || s.stageName || s.name,
                    n: s.deliveredN || s.n || 0,
                    p: s.deliveredP || s.p || 0,
                    k: s.deliveredK || s.k || 0,
                    fertilizers: (s.fertilizers || []).map(function(f) {
                        return { name: f.name, qty: f.kgs || f.qty || f.quantity, n: f.nContributed, p: f.pContributed, k: f.kContributed };
                    })
                };
            })
        } : results
    };

    document.getElementById('feedbackSection').style.display = 'block';
    document.getElementById('feedbackSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Build a pre-filled GitHub Issue URL with all feedback data
 */
function buildIssueUrl() {
    var expected = (document.getElementById('feedbackWhatExpected')?.value || '').trim();
    var wrong = (document.getElementById('feedbackWhatWrong')?.value || '').trim();
    if (!expected || !currentFeedbackData) return null;

    var d = currentFeedbackData;
    var crop = d.inputs.crop || 'Unknown';

    // Format payload as markdown
    var inputsBlock = Object.entries(d.inputs)
        .filter(function(e) { return e[1]; })
        .map(function(e) { return '- **' + e[0] + ':** ' + e[1]; })
        .join('\n');

    var outputBlock = '';
    if (d.systemOutput) {
        var stages = d.systemOutput.stages || [];
        outputBlock = stages.map(function(s) {
            var ferts = (s.fertilizers || []).map(function(f) {
                return '  - ' + f.name + ': ' + f.qty + ' kg (N=' + f.n + ', P=' + f.p + ', K=' + f.k + ')';
            }).join('\n');
            return '### ' + s.name + '\n  N: ' + s.n + ', P: ' + s.p + ', K: ' + s.k + '\n' + ferts;
        }).join('\n\n');
    }

    var body = '## Feedback Report\n\n' +
        '### What user expected\n' + expected + '\n\n' +
        '### What looks wrong\n' + (wrong || 'Not specified') + '\n\n' +
        '---\n\n' +
        '### Input Payload\n' + inputsBlock + '\n\n' +
        '### System Output\n' + outputBlock + '\n\n' +
        '---\n' +
        '_Timestamp: ' + d.timestamp + '_\n' +
        '_URL: ' + window.location.href + '_';

    var title = '[Feedback] ' + crop + ' - ' + expected.substring(0, 60) + (expected.length > 60 ? '...' : '');
    var url = 'https://github.com/rocky14353/soil-software/issues/new?title=' +
        encodeURIComponent(title) +
        '&body=' + encodeURIComponent(body);

    return url;
}

/**
 * Submit feedback via GitHub Issue (auto-opens pre-filled form)
 */
function submitFeedbackViaGitHub() {
    var url = buildIssueUrl();
    if (!url) {
        showFeedbackNotification('Please tell us what you expected before submitting.', 'error');
        return;
    }

    showFeedbackNotification('Opening GitHub... just click "Submit new issue" ✅', 'success');
    window.open(url, '_blank');
}

/**
 * Download as JSON report (fallback)
 */
function downloadFeedbackReport() {
    var expected = (document.getElementById('feedbackWhatExpected')?.value || '').trim();
    var wrong = (document.getElementById('feedbackWhatWrong')?.value || '').trim();
    if (!expected) {
        showFeedbackNotification('Please tell us what you expected before downloading.', 'error');
        return;
    }

    var report = JSON.parse(JSON.stringify(currentFeedbackData));
    report.userFeedback = { expectedOutcome: expected, whatWasWrong: wrong };
    report.reportFormat = 'soil-test-feedback-v1';

    var crop = (currentFeedbackData.inputs.crop || 'unknown').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    var ts = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    var filename = 'feedback-' + crop + '-' + ts + '.json';

    var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showFeedbackNotification('Report saved as ' + filename + ' ✅', 'success');
}

function showFeedbackNotification(msg, type) {
    var el = document.getElementById('feedbackNotification');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = msg;
    el.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
    el.style.color = type === 'success' ? '#155724' : '#721c24';
    el.style.border = '1px solid ' + (type === 'success' ? '#c3e6cb' : '#f5c6cb');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showFeedbackForm: showFeedbackForm, submitFeedbackViaGitHub: submitFeedbackViaGitHub, downloadFeedbackReport: downloadFeedbackReport };
}