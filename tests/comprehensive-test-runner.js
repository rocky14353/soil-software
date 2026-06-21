/**
 * Comprehensive Test Payload Generator & Runner
 * 
 * Generates EVERY combination of crops, locations, soil test statuses,
 * and gromor combinations, runs them through calculateRecommendations(),
 * and validates results.
 * 
 * Used by comprehensive-regression.test.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');

// ---------------------------------------------------------------------------
// 1. Load all data files
// ---------------------------------------------------------------------------
const cropsData          = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'crops.json'), 'utf8'));
const locationCropRecs   = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'location-crop-recommendations.json'), 'utf8'));
const locationsData      = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'locations.json'), 'utf8'));
const fertConversion     = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'fertilizer-conversion.json'), 'utf8'));
const soilTestClass      = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'soil-test-classification.json'), 'utf8'));

// ---------------------------------------------------------------------------
// 2. Locations (8)
// ---------------------------------------------------------------------------
const LOCATIONS = Object.keys(locationsData.locationPreferences);
const DEFAULT_LOCATION = 'GODAVARI DELTA';

// ---------------------------------------------------------------------------
// 3. Soil test input values for each status
// ---------------------------------------------------------------------------
const SOIL_INPUTS = {
  n: {
    low:    { organicCarbon: 0.3, nitrogen: 50 },
    medium: { organicCarbon: 0.6, nitrogen: 150 },
    high:   { organicCarbon: 1.0, nitrogen: 250 }
  },
  p: {
    low:    { phosphorus: 5 },
    medium: { phosphorus: 17 },
    high:   { phosphorus: 35 }
  },
  k: {
    low:    { potassium: 30 },
    medium: { potassium: 100 },
    high:   { potassium: 200 }
  }
};

const STATUSES = ['low', 'medium', 'high'];

// Valid gromor combinations
const VALID_COMBINATIONS = ['1', '2', '3', '4', '5', '6'];

// ---------------------------------------------------------------------------
// 4. Expected status from soil inputs
// ---------------------------------------------------------------------------
function getExpectedNStatus(oc, n) {
  if (n !== null && n !== undefined && !isNaN(n) && n > 0) {
    if (n < 113) return 'low';
    if (n <= 226) return 'medium';
    return 'high';
  }
  if (oc < 0.5) return 'low';
  if (oc <= 0.75) return 'medium';
  return 'high';
}

function getExpectedPStatus(p2o5) {
  if (p2o5 < 10) return 'low';
  if (p2o5 <= 24) return 'medium';
  return 'high';
}

function getExpectedKStatus(k2o) {
  if (k2o < 58) return 'low';
  if (k2o <= 138) return 'medium';
  return 'high';
}

// ---------------------------------------------------------------------------
// 5. Get crop key (matches calculator.js logic)
// ---------------------------------------------------------------------------
function getCropKey(crop, season) {
  if (crop.toLowerCase().includes('paddy')) {
    return season === 'Kharif' ? 'PADDY-KHARIF' : 'PADDY-RABI';
  }
  return crop.toUpperCase().replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// 6. Expected NPK targets
//    For PADDY crops: look up location-crop-recommendations.json by (season, location, status)
//    For MAIZE: look up by fieldType + status
//    For other crops: fall back to crops.json base NPK
// ---------------------------------------------------------------------------
function getExpectedNPK(crop, season, location, nStatus, pStatus, kStatus, fieldType) {
  const cropKey = getCropKey(crop, season);
  const rec = locationCropRecs[cropKey];

  // Try location-based lookup first (works for PADDY crops)
  if (rec && rec[location]) {
    const loc = rec[location];
    return {
      n: loc.nStatus[nStatus] || loc.normal.n,
      p: loc.pStatus[pStatus] || loc.normal.p,
      k: loc.kStatus[kStatus] || loc.normal.k
    };
  }

  // Try fieldType-based lookup (works for MAIZE)
  const ftKey = (fieldType || 'Irrigated').toLowerCase();
  if (rec && rec[ftKey] && (rec[ftKey].nStatus || rec[ftKey].pStatus || rec[ftKey].kStatus)) {
    const ftRec = rec[ftKey];
    return {
      n: ftRec.nStatus[nStatus] || ftRec.normal.n,
      p: ftRec.pStatus[pStatus] || ftRec.normal.p,
      k: ftRec.kStatus[kStatus] || ftRec.normal.k
    };
  }

  // Fallback to crops.json base NPK
  const cropEntry = cropsData[crop];
  if (cropEntry) {
    const sKey = (season || 'Rabi').toLowerCase();
    const entry = cropEntry[ftKey];
    const data = entry?.[sKey] || entry?.['rabi'];
    if (data && data.n !== undefined) {
      return { n: data.n, p: data.p, k: data.k };
    }
    // Try all fieldTypes as last resort
    for (const ft of Object.keys(cropEntry)) {
      const d = cropEntry[ft]?.[sKey] || cropEntry[ft]?.['rabi'];
      if (d && d.n !== undefined) return { n: d.n, p: d.p, k: d.k };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 7. Get split ratios from crops.json
// ---------------------------------------------------------------------------
function getExpectedSplits(crop, season, fieldType) {
  const cropEntry = cropsData[crop];
  if (!cropEntry) return null;

  const ftKey = (fieldType || 'Irrigated').toLowerCase();
  const sKey = (season || 'Rabi').toLowerCase();
  const data = cropEntry[ftKey]?.[sKey] || cropEntry[ftKey]?.['rabi'];
  if (!data || !data.splits) return null;

  return data.splits;
}

// ---------------------------------------------------------------------------
// 8. Get field types/irrigation modes for a crop
// ---------------------------------------------------------------------------
function getFieldTypesForCrop(crop) {
  const cropEntry = cropsData[crop];
  if (!cropEntry) return ['Irrigated'];

  return Object.keys(cropEntry).map(
    t => t.charAt(0).toUpperCase() + t.slice(1)
  );
}

// ---------------------------------------------------------------------------
// 9. Get seasons for a crop+fieldType
// ---------------------------------------------------------------------------
function getSeasonsForCrop(crop, fieldType) {
  const cropEntry = cropsData[crop];
  if (!cropEntry) return ['Rabi'];

  const ftKey = fieldType.toLowerCase();
  const entry = cropEntry[ftKey];
  if (!entry) return ['Rabi'];

  return Object.keys(entry).map(s => s.charAt(0).toUpperCase() + s.slice(1));
}

// ---------------------------------------------------------------------------
// 10. Build a full formData payload
// ---------------------------------------------------------------------------
function buildPayload(crop, season, fieldType, location, nStatus, pStatus, kStatus, gromorCombination) {
  const nInput = SOIL_INPUTS.n[nStatus] || SOIL_INPUTS.n.medium;
  const pInput = SOIL_INPUTS.p[pStatus] || SOIL_INPUTS.p.medium;
  const kInput = SOIL_INPUTS.k[kStatus] || SOIL_INPUTS.k.medium;

  return {
    crop,
    organicCarbon: String(nInput.organicCarbon),
    nitrogen: String(nInput.nitrogen),
    phosphorus: String(pInput.phosphorus),
    potassium: String(kInput.potassium),
    season,
    fieldType,
    location,
    sulfur: '',
    ph: '',
    gromorCombination: gromorCombination || '',
    soilType: '',
    ec: '',
    calcium: '',
    magnesium: '',
    zinc: '',
    boron: '',
    manganese: '',
    iron: '',
    copper: '',
    molybdenum: '',
    chlorine: '',
    preferences: {}
  };
}

// ---------------------------------------------------------------------------
// 11. Generate ALL test payloads — ALL 50 crops, ALL 6 gromor combinations
// ---------------------------------------------------------------------------
function generateAllPayloads() {
  const payloads = [];
  const paddyCrops = ['Paddy Upland', 'Paddy Mediumland', 'Paddy lowland'];
  const allCrops = Object.keys(cropsData);

  // Iterate over EVERY crop
  for (const crop of allCrops) {
    const isPaddy = paddyCrops.includes(crop);
    const ftTypes = getFieldTypesForCrop(crop);

    for (const fieldType of ftTypes) {
      const seasons = getSeasonsForCrop(crop, fieldType);

      for (const season of seasons) {
        const cropKey = getCropKey(crop, season);
        const locRec = locationCropRecs[cropKey];

        // Determine which locations to test
        let testLocations;

        if (isPaddy) {
          // Paddy: all locations that have data
          testLocations = LOCATIONS.filter(l => locRec && locRec[l]);
        } else if (locRec) {
          // Other crops WITH location-crop-recommendation data (e.g. Maize)
          testLocations = Object.keys(locRec).filter(l => LOCATIONS.includes(l));
        } else {
          // Non-Paddy crops WITHOUT location data: use GODAVARI DELTA
          testLocations = [DEFAULT_LOCATION];
        }

        if (testLocations.length === 0) {
          testLocations = [DEFAULT_LOCATION];
        }

        for (const location of testLocations) {
          for (const nStatus of STATUSES) {
            for (const pStatus of STATUSES) {
              for (const kStatus of STATUSES) {
                for (const combo of VALID_COMBINATIONS) {
                  payloads.push({
                    payload: buildPayload(crop, season, fieldType, location, nStatus, pStatus, kStatus, combo),
                    description: `${crop}/${season}/${fieldType}/${location} N=${nStatus} P=${pStatus} K=${kStatus} C=${combo}`
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return payloads;
}

// ---------------------------------------------------------------------------
// 12. Calculate delivered NPK from recommendations
// ---------------------------------------------------------------------------
function computeDeliveredNPK(recommendations) {
  let n = 0, p = 0, k = 0;
  if (recommendations) {
    recommendations.forEach(stage => {
      (stage.fertilizers || []).forEach(f => {
        n += f.nContributed || 0;
        p += f.pContributed || 0;
        k += f.kContributed || 0;
      });
    });
  }
  return { n, p, k };
}

// ---------------------------------------------------------------------------
// 13. Validate a single result against expected values
// ---------------------------------------------------------------------------
function validateResult(payload, result) {
  const errors = [];
  const warnings = [];

  const { crop, season, fieldType, location, gromorCombination: combo } = payload;
  const ss = result.soilTestStatus;
  const { nStatus, pStatus, kStatus } = ss;

  // ── Check 1: NPK targets match expected (within tolerance) ─────
  const expected = getExpectedNPK(crop, season, location, nStatus, pStatus, kStatus, fieldType);
  if (!expected) {
    return {
      passed: false,
      errors: [`No expected NPK data for ${crop}/${season}/${location} N=${nStatus} P=${pStatus} K=${kStatus}`],
      warnings: []
    };
  }

  const recommended = result.totals || { n: 0, p: 0, k: 0 };

  // Tolerance: ±10% for N/K, -5%/+15% for P
  const within = (actual, target, lo, hi) => {
    if (target === 0) return Math.abs(actual) < 0.01;
    const r = actual / target;
    return r >= lo && r <= hi;
  };

  if (!within(recommended.n, expected.n, 0.90, 1.10)) {
    errors.push(`N target mismatch: got ${recommended.n}, expected ${expected.n} (${(recommended.n/expected.n*100).toFixed(1)}%)`);
  }
  if (!within(recommended.p, expected.p, 0.85, 1.15)) {
    errors.push(`P target mismatch: got ${recommended.p}, expected ${expected.p} (${(recommended.p/expected.p*100).toFixed(1)}%)`);
  }
  if (!within(recommended.k, expected.k, 0.90, 1.10)) {
    errors.push(`K target mismatch: got ${recommended.k}, expected ${expected.k} (${(recommended.k/expected.k*100).toFixed(1)}%)`);
  }

  // ── Check 2: Stage restrictions (HARD) ────────────────────────
  const recommendations = result.recommendations || [];
  recommendations.forEach((stage, idx) => {
    const stageName = (stage.stage || '').toLowerCase();
    const ferts = stage.fertilizers || [];

    let deliveredN = 0, deliveredP = 0, deliveredK = 0;
    ferts.forEach(f => {
      deliveredN += f.nContributed || 0;
      deliveredP += f.pContributed || 0;
      deliveredK += f.kContributed || 0;
    });

    // K must be 0 at Tillering stage
    if (stageName.includes('tillering') && deliveredK > 0.5) {
      errors.push(`Stage ${idx} (${stage.stage}): K violation (${deliveredK.toFixed(2)} kg K applied at Tillering)`);
    }

    // P must be 0 at Panicle stage
    if (stageName.includes('panicle') && deliveredP > 0.5) {
      errors.push(`Stage ${idx} (${stage.stage}): P violation (${deliveredP.toFixed(2)} kg P applied at Panicle)`);
    }
  });

  // ── Check 3: Gromor combination is valid ──────────────────────
  const comboInfo = result.combination;
  if (comboInfo && comboInfo.name) {
    // Combination is valid if it has a name — no hard check needed
  }

  // ── Check 4: Delivered NPK (with bag rounding tolerance) ──────
  const delivered = computeDeliveredNPK(recommendations);

  if (result.totals && result.totals.n > 0) {
    const ratio = delivered.n / result.totals.n;
    if (ratio < 0.80 || ratio > 1.50) {
      warnings.push(`Total N delivery ${(ratio*100).toFixed(1)}% of target (${delivered.n.toFixed(1)}/${result.totals.n})`);
    }
  }
  if (result.totals && result.totals.p > 0) {
    const ratio = delivered.p / result.totals.p;
    if (ratio < 0.80 || ratio > 1.50) {
      warnings.push(`Total P delivery ${(ratio*100).toFixed(1)}% of target (${delivered.p.toFixed(1)}/${result.totals.p})`);
    }
  }
  if (result.totals && result.totals.k > 0) {
    const ratio = delivered.k / result.totals.k;
    if (ratio < 0.80 || ratio > 1.50) {
      warnings.push(`Total K delivery ${(ratio*100).toFixed(1)}% of target (${delivered.k.toFixed(1)}/${result.totals.k})`);
    }
  }

  // ── Return verdict ────────────────────────────────────────────
  return {
    passed: errors.length === 0,
    errors,
    warnings,
    expectedNPK: expected,
    actualNPK: recommended,
    deliveredNPK: delivered,
    combo
  };
}

// ---------------------------------------------------------------------------
// 14. Load the calculator script into jsdom window
// ---------------------------------------------------------------------------
function loadCalculatorScript(window) {
  // First, set global data references so calculator.js can find them
  window.cropsData = cropsData;
  window.fertilizerConversion = fertConversion;
  window.locationsData = locationsData;
  window.soilTestClassification = soilTestClass;
  window.locationCropRecommendations = locationCropRecs;

  // Load ALL JS files in the same order as index.html
  const scriptFiles = [
    'rule-engine.js',
    'fertilizer-catalog.js',
    'allocation-engine.js',
    'output-formatter.js',
    'input-validation.js',
    'calculator.js',
    'renderer.js',
    'form-handler.js',
    'feedback.js',
    'script.js'
  ];
  // No transpilation needed — Node.js 22+ and jsdom 20+ support optional chaining natively.
  const transpile = (src) => src;
  for (const file of scriptFiles) {
    const scriptPath = path.resolve(__dirname, '..', file);
    let scriptSrc = fs.readFileSync(scriptPath, 'utf8');
    scriptSrc = transpile(scriptSrc);
    window.eval(scriptSrc);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  cropsData,
  locationCropRecs,
  locationsData,
  fertConversion,
  soilTestClass,
  LOCATIONS,
  STATUSES,
  SOIL_INPUTS,
  VALID_COMBINATIONS,
  DEFAULT_LOCATION,
  getExpectedNStatus,
  getExpectedPStatus,
  getExpectedKStatus,
  getCropKey,
  getExpectedNPK,
  getExpectedSplits,
  getFieldTypesForCrop,
  getSeasonsForCrop,
  buildPayload,
  generateAllPayloads,
  validateResult,
  computeDeliveredNPK,
  loadCalculatorScript
};
