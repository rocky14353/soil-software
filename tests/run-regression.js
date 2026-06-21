#!/usr/bin/env node
/**
 * Standalone Regression Test Runner
 *
 * Runs ALL crop × location × soil status × gromor combination payload
 * combinations against the REAL calculator.js and validates NPK targets.
 *
 * Run: node tests/run-regression.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT   = path.resolve(__dirname, '..');
const DATA   = path.join(ROOT, 'data');
const OUTPUT = path.join(__dirname, 'regression-results.json');

// ===========================================================================
// 1. Load all data files into memory
// ===========================================================================
const cropsData                = JSON.parse(fs.readFileSync(path.join(DATA, 'crops.json'), 'utf8'));
const locationCropRecs         = JSON.parse(fs.readFileSync(path.join(DATA, 'location-crop-recommendations.json'), 'utf8'));
const locationsData            = JSON.parse(fs.readFileSync(path.join(DATA, 'locations.json'), 'utf8'));
const fertConversion           = JSON.parse(fs.readFileSync(path.join(DATA, 'fertilizer-conversion.json'), 'utf8'));
const soilTestClass            = JSON.parse(fs.readFileSync(path.join(DATA, 'soil-test-classification.json'), 'utf8'));

// ===========================================================================
// 2. Set up minimal browser mock in Node (NO jsdom)
// ===========================================================================

// --- Mock global.fetch -----------------------------------------------------
global.fetch = function fetch(url) {
  const data =
    url.includes('fertilizer-conversion')          ? fertConversion :
    url.includes('crops')                          ? cropsData :
    url.includes('locations')                      ? locationsData :
    url.includes('soil-test')                      ? soilTestClass :
    url.includes('location-crop-recommendations')  ? locationCropRecs :
    {};
  return Promise.resolve({ json: () => Promise.resolve(data) });
};

// --- Mock global.alert -----------------------------------------------------
global.alert = function alert(msg) {
  // silently swallow alerts
};

// --- Mock global.console (forward everything) ------------------------------
// We'll suppress verbose logs later; for now keep them.

// --- Minimal document mock -------------------------------------------------
class MockElement {
  constructor(id, value) {
    this.id = id;
    this._value = value !== undefined ? String(value) : '';
  }
  get value() { return this._value; }
  set value(v) { this._value = String(v); }
}

// Store a map of id -> value so tests can inject payload values
const mockElements = {};

global.document = {
  getElementById(id) {
    if (!mockElements[id]) {
      mockElements[id] = new MockElement(id, '');
    }
    return mockElements[id];
  },
  createElement(tag) {
    return { style: {}, appendChild() {}, classList: { add() {} } };
  },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};

// Helper: set up the DOM mock with payload values before each test
function setupDocumentFromPayload(payload) {
  // Set all known form fields from payload (payload has string values)
  const knownFields = [
    'crop', 'organicCarbon', 'nitrogen', 'phosphorus', 'potassium',
    'season', 'fieldType', 'location', 'sulfur', 'ph', 'gromorCombination',
    'soilType', 'ec', 'calcium', 'magnesium', 'zinc', 'boron',
    'manganese', 'iron', 'copper', 'molybdenum', 'chlorine'
  ];
  for (const field of knownFields) {
    if (!mockElements[field]) {
      mockElements[field] = new MockElement(field, '');
    }
    mockElements[field]._value = payload[field] !== undefined ? String(payload[field]) : '';
  }
  // Ensure soilTestForm exists (needed by preferences extraction)
  if (!mockElements['soilTestForm']) {
    mockElements['soilTestForm'] = {
      id: 'soilTestForm',
      querySelectorAll() { return []; }
    };
  }
}

// ===========================================================================
// 3. Set up global window and load all JS files
// ===========================================================================

// Node.js v22 supports optional chaining natively — no transpilation needed.
var transpile = function transpile(src) {
  return src;
};

// The scripts assign to `window.XXX` so we need a global `window` object.
global.window = global;   // In Node, window === global makes `window.XXX` assign to global

// The scripts also reference these globals directly:
global.cropsData = cropsData;
global.fertilizerConversion = fertConversion;
global.locationsData = locationsData;
global.soilTestClassification = soilTestClass;
global.locationCropRecommendations = locationCropRecs;

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

for (const file of scriptFiles) {
  const filePath = path.join(ROOT, file);
  let src = fs.readFileSync(filePath, 'utf8');
  src = transpile(src);
  try {
    eval(src);
  } catch (err) {
    console.error(`[ERROR] Failed to load ${file}: ${err.message}`);
    process.exit(1);
  }
}

// Wait for async loadData() from script.js to complete
function flushMicrotasks() {
  return new Promise(function(resolve) { setImmediate(resolve); });
}

// ===========================================================================
// 4. Test infrastructure — payload generation & validation
// ===========================================================================

const LOCATIONS = Object.keys(locationsData.locationPreferences);
const STATUSES  = ['low', 'medium', 'high'];
const VALID_COMBINATIONS = ['1', '2', '3', '4', '5', '6'];
const DEFAULT_LOCATION = 'GODAVARI DELTA';

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

function getCropKey(crop, season) {
  if (crop.toLowerCase().includes('paddy')) {
    return season === 'Kharif' ? 'PADDY-KHARIF' : 'PADDY-RABI';
  }
  return crop.toUpperCase().replace(/\s+/g, '-');
}

/**
 * Get expected NPK targets from location-crop-recommendations.json
 * or fall back to crops.json base NPK with status adjustment.
 */
function getExpectedNPK(crop, season, location, nStatus, pStatus, kStatus, fieldType) {
  const cropKey = getCropKey(crop, season);
  const rec = locationCropRecs[cropKey];

  // Try location-based lookup (works for PADDY crops)
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
    const data = entry && entry[sKey] || entry && entry['rabi'];
    if (data && data.n !== undefined) {
      return { n: data.n, p: data.p, k: data.k };
    }
    for (const ft of Object.keys(cropEntry)) {
      const d = cropEntry[ft] && (cropEntry[ft][sKey] || cropEntry[ft]['rabi']);
      if (d && d.n !== undefined) return { n: d.n, p: d.p, k: d.k };
    }
  }

  return null;
}

function getFieldTypesForCrop(crop) {
  const cropEntry = cropsData[crop];
  if (!cropEntry) return ['Irrigated'];
  return Object.keys(cropEntry).map(function(t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  });
}

function getSeasonsForCrop(crop, fieldType) {
  const cropEntry = cropsData[crop];
  if (!cropEntry) return ['Rabi'];
  const ftKey = fieldType.toLowerCase();
  const entry = cropEntry[ftKey];
  if (!entry) return ['Rabi'];
  return Object.keys(entry).map(function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
}

function buildPayload(crop, season, fieldType, location, nStatus, pStatus, kStatus, gromorCombination) {
  const nInput = SOIL_INPUTS.n[nStatus] || SOIL_INPUTS.n.medium;
  const pInput = SOIL_INPUTS.p[pStatus] || SOIL_INPUTS.p.medium;
  const kInput = SOIL_INPUTS.k[kStatus] || SOIL_INPUTS.k.medium;

  return {
    crop:                     crop,
    organicCarbon:            String(nInput.organicCarbon),
    nitrogen:                 String(nInput.nitrogen),
    phosphorus:               String(pInput.phosphorus),
    potassium:                String(kInput.potassium),
    season:                   season,
    fieldType:                fieldType,
    location:                 location,
    sulfur:                   '',
    ph:                       '',
    gromorCombination:        gromorCombination || '',
    soilType:                 '',
    ec:                       '',
    calcium:                  '',
    magnesium:                '',
    zinc:                     '',
    boron:                    '',
    manganese:                '',
    iron:                     '',
    copper:                   '',
    molybdenum:               '',
    chlorine:                 '',
    preferences:              {}
  };
}

/**
 * Generate ALL test payloads — ALL 50 crops, ALL 6 gromor combinations
 */
function generateAllPayloads() {
  const payloads = [];
  const paddyCrops = ['Paddy Upland', 'Paddy Mediumland', 'Paddy lowland'];
  const allCrops = Object.keys(cropsData);

  // ── ALL CROPS: iterate over every crop ─────────────────────────────
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
          // Paddy: test all locations that have data
          testLocations = LOCATIONS.filter(function(l) {
            return locRec && locRec[l];
          });
        } else if (locRec) {
          // Other crops WITH location-crop-recommendation data (e.g. Maize)
          testLocations = Object.keys(locRec).filter(function(l) {
            return LOCATIONS.includes(l);
          });
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
                    description: crop + '/' + season + '/' + fieldType + '/' + location +
                      ' N=' + nStatus + ' P=' + pStatus + ' K=' + kStatus + ' C=' + combo
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

/**
 * Compute delivered NPK from recommendations array
 */
function computeDeliveredNPK(recommendations) {
  var n = 0, p = 0, k = 0;
  if (recommendations) {
    recommendations.forEach(function(stage) {
      (stage.fertilizers || []).forEach(function(f) {
        n += f.nContributed || 0;
        p += f.pContributed || 0;
        k += f.kContributed || 0;
      });
    });
  }
  return { n: n, p: p, k: k };
}

/**
 * Validate a single result against expected values
 */
function validateResult(payload, result) {
  var errors = [];
  var warnings = [];

  var crop       = payload.crop;
  var season     = payload.season;
  var fieldType  = payload.fieldType;
  var location   = payload.location;
  var combo      = payload.gromorCombination;

  var ss = result.soilTestStatus;
  var nStatus = ss.nStatus;
  var pStatus = ss.pStatus;
  var kStatus = ss.kStatus;

  // ── Check 1: NPK targets match expected (within tolerance) ─────
  var expected = getExpectedNPK(crop, season, location, nStatus, pStatus, kStatus, fieldType);
  if (!expected) {
    return {
      passed: false,
      errors: ['No expected NPK data for ' + crop + '/' + season + '/' + location +
               ' N=' + nStatus + ' P=' + pStatus + ' K=' + kStatus],
      warnings: []
    };
  }

  var recommended = result.totals || { n: 0, p: 0, k: 0 };

  // Tolerance: ±10% for N/K, -5%/+15% for P
  function within(actual, target, lo, hi) {
    if (target === 0) return Math.abs(actual) < 0.01;
    var r = actual / target;
    return r >= lo && r <= hi;
  }

  if (!within(recommended.n, expected.n, 0.90, 1.10)) {
    errors.push('N target mismatch: got ' + recommended.n.toFixed(2) +
                ', expected ' + expected.n + ' (' + (recommended.n/expected.n*100).toFixed(1) + '%)');
  }
  if (!within(recommended.p, expected.p, 0.85, 1.15)) {
    errors.push('P target mismatch: got ' + recommended.p.toFixed(2) +
                ', expected ' + expected.p + ' (' + (recommended.p/expected.p*100).toFixed(1) + '%)');
  }
  if (!within(recommended.k, expected.k, 0.90, 1.10)) {
    errors.push('K target mismatch: got ' + recommended.k.toFixed(2) +
                ', expected ' + expected.k + ' (' + (recommended.k/expected.k*100).toFixed(1) + '%)');
  }

  // ── Check 2: Stage restrictions (HARD) ────────────────────────
  var recommendations = result.recommendations || [];
  recommendations.forEach(function(stage, idx) {
    var stageName = (stage.stage || '').toLowerCase();
    var ferts = stage.fertilizers || [];

    var deliveredN = 0, deliveredP = 0, deliveredK = 0;
    ferts.forEach(function(f) {
      deliveredN += f.nContributed || 0;
      deliveredP += f.pContributed || 0;
      deliveredK += f.kContributed || 0;
    });

    // K must be 0 at Tillering stage
    if (stageName.indexOf('tillering') !== -1 && deliveredK > 0.5) {
      errors.push('Stage ' + idx + ' (' + stage.stage + '): K violation (' +
                  deliveredK.toFixed(2) + ' kg K applied at Tillering)');
    }

    // P must be 0 at Panicle stage
    if (stageName.indexOf('panicle') !== -1 && deliveredP > 0.5) {
      errors.push('Stage ' + idx + ' (' + stage.stage + '): P violation (' +
                  deliveredP.toFixed(2) + ' kg P applied at Panicle)');
    }
  });

  // ── Check 3: Delivered NPK (with bag rounding tolerance) ──────
  var delivered = computeDeliveredNPK(recommendations);

  if (result.totals && result.totals.n > 0) {
    var ratio = delivered.n / result.totals.n;
    if (ratio < 0.80 || ratio > 1.50) {
      warnings.push('Total N delivery ' + (ratio*100).toFixed(1) +
                    '% of target (' + delivered.n.toFixed(1) + '/' + result.totals.n + ')');
    }
  }
  if (result.totals && result.totals.p > 0) {
    var ratio2 = delivered.p / result.totals.p;
    if (ratio2 < 0.80 || ratio2 > 1.50) {
      warnings.push('Total P delivery ' + (ratio2*100).toFixed(1) +
                    '% of target (' + delivered.p.toFixed(1) + '/' + result.totals.p + ')');
    }
  }
  if (result.totals && result.totals.k > 0) {
    var ratio3 = delivered.k / result.totals.k;
    if (ratio3 < 0.80 || ratio3 > 1.50) {
      warnings.push('Total K delivery ' + (ratio3*100).toFixed(1) +
                    '% of target (' + delivered.k.toFixed(1) + '/' + result.totals.k + ')');
    }
  }

  return {
    passed:       errors.length === 0,
    errors:       errors,
    warnings:     warnings,
    expectedNPK:  expected,
    actualNPK:    recommended,
    deliveredNPK: delivered,
    stageCount:   recommendations.length,
    combo:        combo
  };
}

// ===========================================================================
// 5. Main test runner
// ===========================================================================

async function main() {
  // Suppress console output from the calculator during bulk testing
  var originalLog = console.log;
  var originalWarn = console.warn;
  var originalError = console.error;

  // Collect only critical messages
  console.log = function() {};
  console.warn = function() {};
  console.error = function() {};

  // Flush microtasks so loadData() completes
  await flushMicrotasks();

  // Verify environment
  if (typeof window.calculateRecommendations !== 'function') {
    throw new Error('window.calculateRecommendations is not defined');
  }

  // Generate all payloads
  var allPayloads = generateAllPayloads();
  console.log = originalLog; // re-enable for summary output
  console.log('[Runner] Generated ' + allPayloads.length + ' test payloads');

  // Run all tests
  var results = [];
  var passed = 0;
  var failed = 0;
  var errors = 0;

  console.log('[Runner] Running tests...');

  // Re-suppress for the loop
  console.log = function() {};
  console.warn = function() {};

  var total = allPayloads.length;
  for (var i = 0; i < total; i++) {
    var item = allPayloads[i];
    var payload = item.payload;
    var description = item.description;

    // Set up DOM mock with this payload's values
    setupDocumentFromPayload(payload);

    try {
      var result = window.calculateRecommendations(payload);
      var validation = validateResult(payload, result);

      results.push({
        index:        i + 1,
        description:  description,
        payload:      payload,
        result:       result,
        validation:   validation
      });

      if (validation.passed) {
        passed++;
      } else {
        failed++;
      }
    } catch (e) {
      errors++;
      results.push({
        index:        i + 1,
        description:  description,
        payload:      payload,
        result:       null,
        validation:   {
          passed:       false,
          errors:       [String(e.message || e)],
          warnings:     []
        }
      });
    }

    // Progress indicator every 1000 tests
    if ((i + 1) % 1000 === 0) {
      process.stdout.write('.');
    }
  }

  // Restore console
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;

  // =========================================================================
  // 6. Print summary
  // =========================================================================
  console.log('\n');
  console.log('══════════════════════════════════════════════');
  console.log('  COMPREHENSIVE REGRESSION RESULTS');
  console.log('══════════════════════════════════════════════');
  console.log('  Total tests: ' + total);
  console.log('  Passed:      ' + passed);
  console.log('  Failed:      ' + failed);
  console.log('  Errors:      ' + errors);
  if (total > 0) {
    console.log('  Pass rate:   ' + ((passed / total) * 100).toFixed(1) + '%');
  }
  console.log('══════════════════════════════════════════════\n');

  // Print FAILING cases (with full stage recommendations)
  if (failed > 0 || errors > 0) {
    console.log('FAILING CASES:');
    results.forEach(function(r) {
      if (!r.validation.passed) {
        console.log('\n  ❌ [' + r.index + '/' + total + '] ' + r.description);
        r.validation.errors.forEach(function(e) {
          console.log('     ERROR: ' + e);
        });
        if (r.validation.warnings && r.validation.warnings.length > 0) {
          r.validation.warnings.forEach(function(w) {
            console.log('     WARN: ' + w);
          });
        }
        // Show stage recommendations for failing cases
        if (r.result && r.result.recommendations) {
          console.log('     Stage Recommendations:');
          r.result.recommendations.forEach(function(stage, si) {
            console.log('       Stage ' + si + ' (' + stage.stage + '):');
            var ferts = stage.fertilizers || [];
            ferts.forEach(function(f) {
              console.log('         - ' + f.name + ': ' + (f.kgs || 0).toFixed(1) +
                          ' kg (N:' + (f.nContributed || 0).toFixed(2) +
                          ' P:' + (f.pContributed || 0).toFixed(2) +
                          ' K:' + (f.kContributed || 0).toFixed(2) + ')');
            });
            if (ferts.length === 0) {
              console.log('         (no fertilizers)');
            }
          });
        }
        // Show expected vs actual
        if (r.validation.expectedNPK && r.validation.actualNPK) {
          console.log('     Expected NPK: N=' + r.validation.expectedNPK.n +
                      ' P=' + r.validation.expectedNPK.p +
                      ' K=' + r.validation.expectedNPK.k);
          console.log('     Actual NPK:   N=' + r.validation.actualNPK.n.toFixed(2) +
                      ' P=' + r.validation.actualNPK.p.toFixed(2) +
                      ' K=' + r.validation.actualNPK.k.toFixed(2));
        }
      }
    });
    console.log('');
  }

  // Print sample of passing cases
  var passCount = 0;
  console.log('PASSED (sample of first 10):');
  results.forEach(function(r) {
    if (r.validation.passed && passCount < 10) {
      console.log('  ✅ [' + r.index + '/' + total + '] ' + r.description);
      passCount++;
    }
  });
  if (passed > 10) {
    console.log('  ... and ' + (passed - 10) + ' more passed');
  }

  // =========================================================================
  // 7. Save full results JSON
  // =========================================================================
  var outputData = {
    summary: {
      total:  total,
      passed: passed,
      failed: failed,
      errors: errors,
      passRate: total > 0 ? (passed / total * 100).toFixed(1) + '%' : 'N/A',
      timestamp: new Date().toISOString()
    },
    results: results.map(function(r) {
      return {
        index:        r.index,
        description:  r.description,
        passed:       r.validation.passed,
        errors:       r.validation.errors,
        warnings:     r.validation.warnings,
        expectedNPK:  r.validation.expectedNPK,
        actualNPK:    r.validation.actualNPK,
        deliveredNPK: r.validation.deliveredNPK
      };
    })
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(outputData, null, 2), 'utf8');
  console.log('\nFull results saved to: ' + OUTPUT);

  // =========================================================================
  // 8. Exit code
  // =========================================================================
  if (failed > 0 || errors > 0) {
    console.log('\n❌ SOME TESTS FAILED — exiting with code 1\n');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED\n');
    process.exit(0);
  }
}

main().catch(function(err) {
  console.error('[FATAL] ' + err.message);
  console.error(err.stack);
  process.exit(1);
});
