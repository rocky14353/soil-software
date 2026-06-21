/**
 * @jest-environment jsdom
 *
 * Comprehensive Regression Test Suite
 * Soil fertilizer recommendation engine — Coromandel Fertilisers Ltd.
 *
 * Tests ALL crop × location × soil status × gromor combination against
 * expected NPK targets from location-crop-recommendations.json
 * and stage-split constraints from crops.json.
 *
 * Run: npx jest tests/comprehensive-regression.test.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  cropsData,
  locationCropRecs,
  locationsData,
  fertConversion,
  soilTestClass,
  LOCATIONS,
  STATUSES,
  SOIL_INPUTS,
  VALID_COMBINATIONS,
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
} = require('./comprehensive-test-runner.js');

// ===========================================================================
// SETUP
// ===========================================================================

// Mock fetch to return real data from the JSON files
global.fetch = jest.fn((url) => {
  const data =
    url.includes('fertilizer-conversion') ? fertConversion :
    url.includes('crops')                 ? cropsData :
    url.includes('locations')             ? locationsData :
    url.includes('soil-test')             ? soilTestClass :
    url.includes('location-crop-recommendations') ? locationCropRecs :
    {};
  return Promise.resolve({ json: () => Promise.resolve(data) });
});

global.alert = jest.fn();

// Set up the DOM that the script expects
document.body.innerHTML = `
  <form id="soilTestForm">
    <input id="crop" value="Paddy">
    <input id="organicCarbon" value="0.6">
    <input id="nitrogen" value="150">
    <input id="phosphorus" value="17">
    <input id="potassium" value="100">
    <input id="season" value="Kharif">
    <input id="fieldType" value="Irrigated">
    <input id="location" value="">
    <input id="sulfur" value="">
    <input id="ph" value="">
    <input id="gromorCombination" value="1">
    <input id="soilType" value="">
    <input id="ec" value="">
    <input id="calcium" value="">
    <input id="magnesium" value="">
    <input id="zinc" value="">
    <input id="boron" value="">
    <input id="manganese" value="">
    <input id="iron" value="">
    <input id="copper" value="">
    <input id="molybdenum" value="">
    <input id="chlorine" value="">
  </form>
  <div id="resultsSection" style="display:none"></div>
  <div id="resultsContent"></div>
`;

// Load the calculator script into the jsdom window
loadCalculatorScript(window);

// Wait for async data loading (loadData() is called at script eval time)
beforeAll(() => new Promise(resolve => setTimeout(resolve, 100)));

// ===========================================================================
// ENVIRONMENT TESTS
// ===========================================================================

describe('Environment Setup', () => {
  test('calculateRecommendations is defined', () => {
    expect(typeof calculateRecommendations).toBe('function');
  });

  test('classify functions are defined', () => {
    expect(typeof classifyNitrogenByOC).toBe('function');
    expect(typeof classifyPhosphorus).toBe('function');
    expect(typeof classifyPotassium).toBe('function');
  });

  test('data is loaded into global scope', () => {
    expect(typeof cropsData).toBe('object');
    expect(Object.keys(cropsData).length).toBeGreaterThan(30);
    expect(typeof locationCropRecs).toBe('object');
    expect(typeof locationsData).toBe('object');
  });

  test('all 8 locations are present', () => {
    expect(LOCATIONS).toHaveLength(8);
    expect(LOCATIONS).toContain('GODAVARI DELTA');
    expect(LOCATIONS).toContain('LOW RAINFALL AREA');
  });
});

// ===========================================================================
// PRERELEASE TESTS

// Run a quick sample first to validate the test harness
describe('Prerelease — Sample Validation', () => {
  const sampleCases = [
    {
      desc: 'Paddy lowland low-N low-P low-K',
      payload: {
        crop: 'Paddy lowland',
        organicCarbon: '0.3', nitrogen: '50',
        phosphorus: '5', potassium: '30',
        season: 'Rabi', fieldType: 'Irrigated',
        location: 'GODAVARI DELTA',
        sulfur: '', ph: '', gromorCombination: '1'
      }
    },
    {
      desc: 'Paddy Upland high-N high-P high-K',
      payload: {
        crop: 'Paddy Upland',
        organicCarbon: '1.0', nitrogen: '250',
        phosphorus: '35', potassium: '200',
        season: 'Kharif', fieldType: 'Irrigated',
        location: 'SOUTH TELENGANA',
        sulfur: '', ph: '', gromorCombination: '1'
      }
    },
    {
      desc: 'Maize irrigated medium NPK',
      payload: {
        crop: 'Maize',
        organicCarbon: '0.6', nitrogen: '150',
        phosphorus: '17', potassium: '100',
        season: 'Rabi', fieldType: 'Irrigated',
        location: 'NORTH COASTAL',
        sulfur: '', ph: '', gromorCombination: '1'
      }
    }
  ];

  sampleCases.forEach(({ desc, payload }) => {
    test(desc, () => {
      const result = calculateRecommendations(payload);
      const validation = validateResult(payload, result);

      // Log for debugging
      if (!validation.passed) {
        console.log(`[FAIL] ${desc}:`, validation.errors);
      }

      expect(validation.passed).toBe(true);
    });
  });
});

// ===========================================================================
// COMPREHENSIVE REGRESSION TESTS

describe('Comprehensive Regression Tests', () => {
  let allPayloads = [];
  let allResults = [];

  beforeAll(() => {
    allPayloads = generateAllPayloads();
    console.log(`[Comprehensive Test] Generated ${allPayloads.length} test cases`);
  });

  test('payloads were generated (all 50 crops × all 6 gromor combos)', () => {
    expect(allPayloads.length).toBeGreaterThan(5000);
  });

  test('run all payloads and validate results', () => {
    let passed = 0;
    let failed = 0;
    let errors = 0;

    allPayloads.forEach(({ payload, description }, idx) => {
      try {
        const result = calculateRecommendations(payload);
        const validation = validateResult(payload, result);

        allResults.push({
          index: idx + 1,
          description,
          validation
        });

        if (validation.passed) {
          passed++;
        } else {
          failed++;
        }
      } catch (e) {
        errors++;
        allResults.push({
          index: idx + 1,
          description,
          validation: {
            passed: false,
            errors: [`Exception: ${e.message}`],
            warnings: []
          }
        });
      }
    });

    const total = allPayloads.length;

    console.log(`\n══════════════════════════════════════════════`);
    console.log(`  COMPREHENSIVE REGRESSION RESULTS`);
    console.log(`══════════════════════════════════════════════`);
    console.log(`  Total tests: ${total}`);
    console.log(`  Passed:      ${passed}`);
    console.log(`  Failed:      ${failed}`);
    console.log(`  Errors:      ${errors}`);
    console.log(`  Pass rate:   ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`══════════════════════════════════════════════\n`);

    // Log failures if any
    if (failed > 0 || errors > 0) {
      console.log('FAILURES:');
      allResults.forEach(r => {
        if (!r.validation.passed) {
          console.log(`  ❌ [${r.index}/${total}] ${r.description}`);
          r.validation.errors.forEach(e => console.log(`     - ${e}`));
          if (r.validation.warnings && r.validation.warnings.length > 0) {
            r.validation.warnings.forEach(w => console.log(`     ⚠ ${w}`));
          }
        }
      });
    }

    // Print PASS lines
    console.log('\nPASSED (sample of first 10):');
    allResults.filter(r => r.validation.passed).slice(0, 10).forEach(r => {
      console.log(`  ✅ [${r.index}/${total}] ${r.description}`);
    });
    if (passed > 10) {
      console.log(`  ... and ${passed - 10} more passed`);
    }

    // Expect ALL to pass
    expect(failed).toBe(0);
    expect(passed).toBe(total);
  });
});

// ===========================================================================
// SUMMARY STATISTICS

afterAll(() => {
  console.log('\n=== COMPREHENSIVE REGRESSION TEST COMPLETE ===');
});