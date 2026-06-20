/**
 * Input Validation Module
 * Validates user form inputs before submission
 */

var FIELD_CONFIG = {
    organicCarbon: { label: 'Organic Carbon', min: 0, max: 5, step: 0.01 },
    nitrogen:      { label: 'Nitrogen',      min: 0, max: 1000, step: 0.1 },
    phosphorus:    { label: 'Phosphorus (P₂O₅)', min: 0, max: 500, step: 0.1 },
    potassium:     { label: 'Potassium (K₂O)', min: 0, max: 1000, step: 0.1 },
    sulfur:        { label: 'Sulfur', min: 0, max: 200, step: 0.1 },
    ph:            { label: 'pH', min: 0, max: 14, step: 0.1 },
    ec:            { label: 'EC', min: 0, max: 20, step: 0.01 },
    calcium:       { label: 'Calcium', min: 0, max: 50, step: 0.1 },
    magnesium:     { label: 'Magnesium', min: 0, max: 20, step: 0.1 },
    zinc:          { label: 'Zinc', min: 0, max: 50, step: 0.1 },
    boron:         { label: 'Boron', min: 0, max: 10, step: 0.1 },
    manganese:     { label: 'Manganese', min: 0, max: 100, step: 0.1 },
    iron:          { label: 'Iron', min: 0, max: 200, step: 0.1 },
    copper:        { label: 'Copper', min: 0, max: 20, step: 0.1 },
    molybdenum:    { label: 'Molybdenum', min: 0, max: 5, step: 0.01 },
    chlorine:      { label: 'Chlorine', min: 0, max: 500, step: 0.1 }
};

/**
 * Validate a single numeric field value against its config
 * @param {string} fieldName
 * @param {string|number} value
 * @returns {{ valid: boolean, error?: string }}
 */
function validateNumericField(fieldName, value) {
    var cfg = FIELD_CONFIG[fieldName];
    if (!cfg) return { valid: true }; // Not a validated field — skip
    
    var num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, error: cfg.label + ' must be a number' };
    }
    if (num < cfg.min) {
        return { valid: false, error: cfg.label + ' must be ≥ ' + cfg.min };
    }
    if (num > cfg.max) {
        return { valid: false, error: cfg.label + ' must be ≤ ' + cfg.max };
    }
    return { valid: true };
}

/**
 * Validate all required numeric fields from the form
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateNumericInputs() {
    var errors = [];
    for (var fieldName in FIELD_CONFIG) {
        var el = document.getElementById(fieldName);
        if (!el || !el.value) continue; // Optional/empty — skip
        var result = validateNumericField(fieldName, el.value);
        if (!result.valid) {
            errors.push(result.error);
        }
    }
    return { valid: errors.length === 0, errors: errors };
}

// Export for browser (globalThis) and Node.js (module.exports)
if (typeof globalThis !== 'undefined') {
    globalThis.validateNumericField = validateNumericField;
    globalThis.validateNumericInputs = validateNumericInputs;
}
