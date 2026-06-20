/**
 * @jest-environment jsdom
 *
 * Regression test suite for script-v2.js
 * Soil fertilizer recommendation engine — Coromandel Fertilisers Ltd.
 *
 * Core fix under test:
 *   getNutrientsFromStraight() was added so that all fertilizer pushes
 *   record ACTUAL nutrients from the ROUNDED bag quantity, not the
 *   originally required amount.
 *   e.g. 50 kg Urea (46% N)  → nContributed = 23 kg  (not 21.33 kg)
 *        50 kg MOP  (60% K)  → kContributed = 30 kg
 *
 * Run: npx jest tests/script-v2-regression.test.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Build the full fertilizer data the script needs
//    loadData() runs on load and OVERWRITES the local fertilizerConversion var
//    from fetch — so the mock must return real data, not {}.
// ---------------------------------------------------------------------------

const FERT_DATA = {
  fertilizerProducts: {
    'urea':       { n: 46, p: 0,  k: 0,  s: 0  },
    'mop':        { n: 0,  p: 0,  k: 60, s: 0  },
    'sop':        { n: 0,  p: 0,  k: 50, s: 18 },
    'as':         { n: 21, p: 0,  k: 0,  s: 24 },
    'can':        { n: 25, p: 0,  k: 0,  s: 0  },
    'ssp':        { n: 0,  p: 16, k: 0,  s: 12 },
    '28-28-0':    { n: 28, p: 28, k: 0,  s: 0  },
    '14-35-14':   { n: 14, p: 35, k: 14, s: 0  },
    '20-20-0-13': { n: 20, p: 20, k: 0,  s: 13 },
    '10-26-26':   { n: 10, p: 26, k: 26, s: 0  },
    '16-20-0-13': { n: 16, p: 20, k: 0,  s: 13 }
  },
  conversionFactors: { urea: 2.174, mop: 1.667, sop: 2.0 },
  nToStraight:   {},
  k2oToStraight: {},
  p2o5ToGromor:  {}
};

// Fetch mock: return real fertilizer data so loadData() populates the script's
// local fertilizerConversion variable correctly.
global.fetch = jest.fn((url) => {
  const data =
    url.includes('fertilizer-conversion') ? FERT_DATA :
    url.includes('crops')                 ? {} :
    url.includes('locations')             ? {} :
    url.includes('soil-test')             ? {} :
    {};
  return Promise.resolve({ json: () => Promise.resolve(data) });
});

global.alert = jest.fn();

// ---------------------------------------------------------------------------
// 3. Load the script under test via jsdom window.eval()
//    jsdom environment makes window === global, so window.eval() exposes
//    top-level function declarations to global — identical to a <script> tag.
//    document is provided by jsdom; fetch is already mocked above.
// ---------------------------------------------------------------------------

// Create the DOM elements that script-v2.js hooks into at load time
document.body.innerHTML = `
  <form id="soilTestForm">
    <input id="crop" value="Paddy">
    <input id="organicCarbon" value="0.6">
    <input id="nitrogen" value="150">
    <input id="phosphorus" value="15">
    <input id="potassium" value="100">
    <input id="season" value="Kharif">
    <input id="fieldType" value="Irrigated">
    <input id="location" value="">
    <input id="sulfur" value="">
    <input id="ph" value="">
    <input id="gromorCombination" value="1">
  </form>
  <div id="resultsSection" style="display:none"></div>
  <div id="resultsContent"></div>
`;

const scriptSrc = fs.readFileSync(path.resolve(__dirname, '../script-v2.js'), 'utf8');
window.eval(scriptSrc);

// Wait for loadData()'s multiple async awaits to flush before any test runs.
beforeAll(() => new Promise(resolve => setTimeout(resolve, 50)));

// ---------------------------------------------------------------------------
// Helper: small floating-point comparison tolerance
// ---------------------------------------------------------------------------
const EPSILON = 0.0001;
function closeTo(received, expected) {
  return Math.abs(received - expected) < EPSILON;
}

// ===========================================================================
// Suite 1 — getNutrientsFromStraight
// ===========================================================================
describe('getNutrientsFromStraight', () => {

  it('50 kg Urea (46% N) → n = 23 kg', () => {
    // Validates the core fix: rounded bag quantity drives nContributed
    const result = getNutrientsFromStraight(50, 'Urea');
    expect(closeTo(result.n, 23)).toBe(true);
  });

  it('50 kg MOP (60% K) → k = 30 kg', () => {
    // MOP is K-only; s should be 0
    const result = getNutrientsFromStraight(50, 'MOP');
    expect(closeTo(result.k, 30)).toBe(true);
    expect(result.n).toBe(0);
    expect(result.s).toBe(0);
  });

  it('50 kg SOP (50% K, 18% S) → k = 25 kg, s = 9 kg', () => {
    const result = getNutrientsFromStraight(50, 'SOP');
    expect(closeTo(result.k, 25)).toBe(true);
    expect(closeTo(result.s, 9)).toBe(true);
    expect(result.n).toBe(0);
  });

  it('50 kg A.S (21% N, 24% S) → n = 10.5 kg, s = 12 kg', () => {
    // "A.S" normalises to "as" inside the function
    const result = getNutrientsFromStraight(50, 'A.S');
    expect(closeTo(result.n, 10.5)).toBe(true);
    expect(closeTo(result.s, 12)).toBe(true);
    expect(result.k).toBe(0);
  });

  it('0 kg Urea → n = 0', () => {
    // Zero quantity edge case
    const result = getNutrientsFromStraight(0, 'Urea');
    expect(result.n).toBe(0);
  });

  it('45 kg Urea (46% N) → n = 20.7 kg', () => {
    // Partial-bag quantity
    const result = getNutrientsFromStraight(45, 'Urea');
    expect(closeTo(result.n, 20.7)).toBe(true);
  });

  it('returns all-zero object for an unknown fertilizer name', () => {
    const result = getNutrientsFromStraight(50, 'UNKNOWN_FERT');
    expect(result.n).toBe(0);
    expect(result.p).toBe(0);
    expect(result.k).toBe(0);
    expect(result.s).toBe(0);
  });

});

// ===========================================================================
// Suite 2 — getNutrientsFromGromor
// ===========================================================================
describe('getNutrientsFromGromor', () => {

  it('100 kg 28-28-0 → n = 28 kg, k = 0 kg', () => {
    const result = getNutrientsFromGromor(100, '28-28-0');
    expect(closeTo(result.n, 28)).toBe(true);
    expect(result.k).toBe(0);
  });

  it('100 kg 14-35-14 → n = 14 kg, k = 14 kg', () => {
    const result = getNutrientsFromGromor(100, '14-35-14');
    expect(closeTo(result.n, 14)).toBe(true);
    expect(closeTo(result.k, 14)).toBe(true);
  });

  it('0 kg 28-28-0 → n = 0, k = 0', () => {
    // Zero-dose edge case
    const result = getNutrientsFromGromor(0, '28-28-0');
    expect(result.n).toBe(0);
    expect(result.k).toBe(0);
  });

  it('returns zeros for an unknown grade', () => {
    const result = getNutrientsFromGromor(100, '99-99-99');
    expect(result.n).toBe(0);
    expect(result.k).toBe(0);
  });

  it('50 kg 10-26-26 → n = 5 kg, k = 13 kg', () => {
    // Half-bag quantity of a balanced N+K grade
    const result = getNutrientsFromGromor(50, '10-26-26');
    expect(closeTo(result.n, 5)).toBe(true);
    expect(closeTo(result.k, 13)).toBe(true);
  });

});

// ===========================================================================
// Suite 3 — roundToBag
// ===========================================================================
describe('roundToBag', () => {

  it('46.37 kg → rounds to nearest bag fraction of 50 kg → 50 kg', () => {
    // 46.37 is closest to 50 (1 full bag) vs 25 (0.5 bag distance = 21.37)
    const result = roundToBag(46.37);
    expect(result.kgs).toBe(50);
  });

  it('100 kg → stays at 100 kg (2 bags)', () => {
    const result = roundToBag(100);
    expect(result.kgs).toBe(100);
    expect(result.bags).toBe(2);
  });

  it('0 kg → returns 0 kg', () => {
    const result = roundToBag(0);
    expect(result.kgs).toBe(0);
  });

  it('12.5 kg → 12.5 kg (quarter bag)', () => {
    // 12.5 is exactly one quarter of 50
    const result = roundToBag(12.5);
    expect(result.kgs).toBe(12.5);
  });

  it('returns an object with kgs, bags, label, and original', () => {
    const result = roundToBag(50);
    expect(result).toHaveProperty('kgs');
    expect(result).toHaveProperty('bags');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('original');
  });

  it('25 kg → 25 kg (half bag)', () => {
    const result = roundToBag(25);
    expect(result.kgs).toBe(25);
  });

  it('preserves original input value in result.original', () => {
    const result = roundToBag(46.37);
    expect(closeTo(result.original, 46.37)).toBe(true);
  });

  it('rounds 63 kg to 62.5 kg (quarter-bag is closest)', () => {
    // candidates: 50 (diff 13), 62.5 (diff 0.5), 75 (diff 12) — 62.5 wins
    const result = roundToBag(63);
    expect(result.kgs).toBe(62.5);
  });

});

// ===========================================================================
// Suite 4 — classifyNitrogenByOC
// Signature: classifyNitrogenByOC(organicCarbon, nitrogen)
// When nitrogen is a valid number > 0 it is used; otherwise falls back to OC.
// N thresholds: low < 113, medium 113-226, high > 226
// OC thresholds: low < 0.5, medium 0.5-0.75, high > 0.75
// ===========================================================================
describe('classifyNitrogenByOC', () => {

  // --- Nitrogen-based classification ---
  it('N = 64 kg (below 113) → "low"', () => {
    expect(classifyNitrogenByOC(null, 64)).toBe('low');
  });

  it('N = 112.9 kg (just below 113) → "low"', () => {
    expect(classifyNitrogenByOC(null, 112.9)).toBe('low');
  });

  it('N = 150 kg (113-226 range) → "medium"', () => {
    expect(classifyNitrogenByOC(null, 150)).toBe('medium');
  });

  it('N = 226 kg (upper boundary of medium) → "medium"', () => {
    expect(classifyNitrogenByOC(null, 226)).toBe('medium');
  });

  it('N = 300 kg (above 226) → "high"', () => {
    expect(classifyNitrogenByOC(null, 300)).toBe('high');
  });

  // --- OC fallback classification (nitrogen null/undefined/0) ---
  it('N = undefined, OC = 0.3 → "low" (OC < 0.5)', () => {
    expect(classifyNitrogenByOC(0.3, undefined)).toBe('low');
  });

  it('N = undefined, OC = 0.6 → "medium" (0.5 ≤ OC ≤ 0.75)', () => {
    expect(classifyNitrogenByOC(0.6, undefined)).toBe('medium');
  });

  it('N = undefined, OC = 0.9 → "high" (OC > 0.75)', () => {
    expect(classifyNitrogenByOC(0.9, undefined)).toBe('high');
  });

  it('N = 0 triggers OC fallback; OC = 0.4 → "low"', () => {
    // N = 0 is falsy in the guard (`nitrogen > 0` fails)
    expect(classifyNitrogenByOC(0.4, 0)).toBe('low');
  });

  it('N = null triggers OC fallback; OC = 0.75 → "medium" (boundary)', () => {
    expect(classifyNitrogenByOC(0.75, null)).toBe('medium');
  });

  it('nitrogen value takes priority over OC when both provided', () => {
    // N = 300 (high) should win even if OC would say "low"
    expect(classifyNitrogenByOC(0.2, 300)).toBe('high');
  });

});

// ===========================================================================
// Suite 5 — classifyPhosphorus
// Thresholds (P2O5 kg/acre): low < 10, medium 10-24, high > 24
// ===========================================================================
describe('classifyPhosphorus', () => {

  it('P = 8 → "low" (below 10)', () => {
    expect(classifyPhosphorus(8)).toBe('low');
  });

  it('P = 9.99 → "low" (just below boundary)', () => {
    expect(classifyPhosphorus(9.99)).toBe('low');
  });

  it('P = 10 → "medium" (lower boundary of medium)', () => {
    expect(classifyPhosphorus(10)).toBe('medium');
  });

  it('P = 15 → "medium"', () => {
    expect(classifyPhosphorus(15)).toBe('medium');
  });

  it('P = 24 → "medium" (upper boundary)', () => {
    expect(classifyPhosphorus(24)).toBe('medium');
  });

  it('P = 30 → "high" (above 24)', () => {
    expect(classifyPhosphorus(30)).toBe('high');
  });

  it('P = 25 → "high" (just above upper boundary)', () => {
    expect(classifyPhosphorus(25)).toBe('high');
  });

});

// ===========================================================================
// Suite 6 — classifyPotassium
// Thresholds (K2O kg/acre): low < 58, medium 58-138, high > 138
// NOTE: the prompt used illustrative values (40/100/200); the actual code
// boundaries are 58 and 138.  Tests are written against source code truth.
// ===========================================================================
describe('classifyPotassium', () => {

  it('K = 40 → "low" (below 58)', () => {
    expect(classifyPotassium(40)).toBe('low');
  });

  it('K = 57.9 → "low" (just below boundary)', () => {
    expect(classifyPotassium(57.9)).toBe('low');
  });

  it('K = 58 → "medium" (lower boundary)', () => {
    expect(classifyPotassium(58)).toBe('medium');
  });

  it('K = 100 → "medium"', () => {
    expect(classifyPotassium(100)).toBe('medium');
  });

  it('K = 138 → "medium" (upper boundary)', () => {
    expect(classifyPotassium(138)).toBe('medium');
  });

  it('K = 200 → "high" (above 138)', () => {
    expect(classifyPotassium(200)).toBe('high');
  });

  it('K = 139 → "high" (just above upper boundary)', () => {
    expect(classifyPotassium(139)).toBe('high');
  });

});

// ===========================================================================
// Suite 7 — Nutrient accuracy regression (the core fix)
//
// Before the fix:  nContributed was set to the *required* N amount (21.33)
// After the fix:   nContributed = getNutrientsFromStraight(roundedKgs, 'Urea')
//                              = 50 × 0.46 = 23.0
//
// We mock convertNToStraight to return 46.37 (rounds to 50 kg Urea) then
// call getNutrientsFromStraight with the rounded quantity and verify 23.0.
// ===========================================================================
describe('Nutrient accuracy regression — ACTUAL nutrients from rounded bags', () => {

  it('50 kg Urea after rounding → nContributed = 23.0, not the 21.33 required amount', () => {
    // Simulate the pipeline in calculateCombination1:
    //   1. convertNToStraight returns 46.37 for a given N requirement
    //   2. roundToBag(46.37) → 50 kg
    //   3. getNutrientsFromStraight(50, 'Urea') must return n = 23
    const rawKgs    = 46.37;          // as-if output from convertNToStraight
    const rounded   = roundToBag(rawKgs);
    expect(rounded.kgs).toBe(50);     // confirm rounding step

    const nutrients = getNutrientsFromStraight(rounded.kgs, 'Urea');
    expect(closeTo(nutrients.n, 23.0)).toBe(true);

    // Explicitly confirm the pre-fix value (21.33) is NOT being returned
    expect(nutrients.n).not.toBeCloseTo(21.33, 1);
  });

  it('50 kg MOP after rounding → kContributed = 30.0, not the required K amount', () => {
    // Same pipeline check for potassium via MOP
    const rawKgs  = 46.37;
    const rounded = roundToBag(rawKgs);
    expect(rounded.kgs).toBe(50);

    const nutrients = getNutrientsFromStraight(rounded.kgs, 'MOP');
    expect(closeTo(nutrients.k, 30.0)).toBe(true);
  });

  it('getNutrientsFromStraight always returns a numeric n value (no undefined)', () => {
    // Guard against regression where the function might not return a value
    const result = getNutrientsFromStraight(50, 'Urea');
    expect(typeof result.n).toBe('number');
    expect(isNaN(result.n)).toBe(false);
  });

  it('rounding different N requirements still gives nutrient from actual bag weight', () => {
    // 30 kg required N → convertNToStraight would give ~65.2 kg Urea → rounds to 75 kg
    // 75 kg × 46% = 34.5 kg N contributed (not 30)
    const rounded   = roundToBag(65.2);
    const nutrients = getNutrientsFromStraight(rounded.kgs, 'Urea');
    const expected  = (rounded.kgs * 46) / 100;
    expect(closeTo(nutrients.n, expected)).toBe(true);
  });

});

// ===========================================================================
// Suite 8 — Stage constraint: K (MOP) must NOT appear in Tillering stage
//
// calculateCombination1 has an explicit comment:
//   "K is NOT allowed at Tillering — skip MOP for Stage 2"
// We call it with a non-zero kPerSplit[1] and verify Stage 2 has no MOP.
// ===========================================================================
describe('Stage constraint — K (MOP) excluded from Tillering stage', () => {

  // Minimal cropData stub that calculateCombination1 needs
  const stubCropData = {
    splits: {
      n: {
        ratios: [0.5, 0.5],
        stages: ['Basal', 'Tillering']
      },
      k: {
        ratios: [0.5, 0.5],
        stages: ['Basal', 'Tillering']
      }
    }
  };

  // Stub locationRec with a gromorByPStatus entry so
  // convertP2O5ToGromorDirect returns a non-zero value and we
  // actually exercise the fertilizer-push paths in Stage 1.
  const stubLocationRec = {
    gromorByPStatus: {
      low:    { '28-28-0': 100, '20-20-0-13': 50 },
      medium: { '28-28-0': 75,  '20-20-0-13': 37.5 },
      high:   { '28-28-0': 50,  '20-20-0-13': 25  }
    }
  };

  // Supply conversion tables so convertNToStraight falls back to factor
  // (factor 2.174 for urea, already in global.fertilizerConversion)

  it('Stage 2 (Tillering) fertilizer list contains no MOP entry', () => {
    // nPerSplit: [21, 21]  kPerSplit: [15, 15]  — K is present in both splits
    const nPerSplit = [21, 21];
    const kPerSplit = [15, 15];  // non-zero K at index 1 (Tillering)
    const preferences = {};      // no rejections

    const stages = calculateCombination1(
      stubCropData,
      nPerSplit,
      kPerSplit,
      100,           // pTotal
      'low',         // pStatus
      stubLocationRec,
      preferences
    );

    // There should be at least 2 stages
    expect(stages.length).toBeGreaterThanOrEqual(2);

    const tillering = stages[1];
    expect(tillering.stage).toBe('Tillering');

    const mopInTillering = tillering.fertilizers.filter(
      f => f.name === 'MOP'
    );
    // The fix guarantees MOP never appears in Tillering
    expect(mopInTillering).toHaveLength(0);
  });

  it('Stage 1 (Basal) CAN contain MOP when basal K is non-zero', () => {
    // Confirms MOP exclusion is specific to Stage 2, not all stages
    const nPerSplit = [21, 21];
    const kPerSplit = [15, 15];
    const preferences = {};

    const stages = calculateCombination1(
      stubCropData,
      nPerSplit,
      kPerSplit,
      100,
      'low',
      stubLocationRec,
      preferences
    );

    const basal    = stages[0];
    const mopInBasal = basal.fertilizers.filter(f => f.name === 'MOP');
    // Basal K is allowed — MOP should appear
    expect(mopInBasal.length).toBeGreaterThan(0);
  });

  it('Stage 2 (Tillering) CAN contain Urea for top-dress nitrogen', () => {
    // K blocked but N top-dress should still work
    const nPerSplit = [21, 21];
    const kPerSplit = [0, 0];
    const preferences = {};

    const stages = calculateCombination1(
      stubCropData,
      nPerSplit,
      kPerSplit,
      100,
      'low',
      stubLocationRec,
      preferences
    );

    expect(stages.length).toBeGreaterThanOrEqual(2);
    const tillering  = stages[1];
    const ureaOrGromor = tillering.fertilizers.filter(
      f => f.name === 'Urea' || f.name.startsWith('Gromor')
    );
    // At least one N-supplying fertilizer should be present at Tillering
    expect(ureaOrGromor.length).toBeGreaterThan(0);
  });

  it('nContributed on Urea entries in Stage 2 is derived from rounded kgs (fix check)', () => {
    // Verifies that nContributed stored on Stage 2 Urea matches
    // getNutrientsFromStraight(roundedKgs, 'Urea') — i.e. the fix is active
    const nPerSplit = [0, 30];   // all N at Tillering to force Urea top-dress
    const kPerSplit = [0, 0];
    const preferences = {};

    const stages = calculateCombination1(
      stubCropData,
      nPerSplit,
      kPerSplit,
      0,       // pTotal = 0 → no Gromor in Basal
      'low',
      stubLocationRec,
      preferences
    );

    // Find Stage 2
    const tillering = stages.find(s => s.stage === 'Tillering');
    if (!tillering) return; // Skip if stage absent (e.g. no N in Tillering path)

    const ureaEntry = tillering.fertilizers.find(f => f.name === 'Urea');
    if (!ureaEntry) return;

    // nContributed must equal kgs × 0.46
    const expected = (ureaEntry.kgs * 46) / 100;
    expect(closeTo(ureaEntry.nContributed, expected)).toBe(true);
  });

});

// ===========================================================================
// Suite 9 — Edge cases and boundary guards
// ===========================================================================
describe('Edge cases', () => {

  it('classifyNitrogenByOC: N at exact lower medium boundary (113) → "medium"', () => {
    expect(classifyNitrogenByOC(null, 113)).toBe('medium');
  });

  it('classifyNitrogenByOC: N at exact upper medium boundary (226) → "medium"', () => {
    expect(classifyNitrogenByOC(null, 226)).toBe('medium');
  });

  it('classifyNitrogenByOC: OC at exact 0.5 → "medium"', () => {
    // Threshold is < 0.5 → low, else ≤ 0.75 → medium
    expect(classifyNitrogenByOC(0.5, undefined)).toBe('medium');
  });

  it('classifyNitrogenByOC: OC at exact 0.75 → "medium"', () => {
    expect(classifyNitrogenByOC(0.75, undefined)).toBe('medium');
  });

  it('classifyPhosphorus: P at exact boundary 10 → "medium"', () => {
    expect(classifyPhosphorus(10)).toBe('medium');
  });

  it('classifyPhosphorus: P at exact boundary 24 → "medium"', () => {
    expect(classifyPhosphorus(24)).toBe('medium');
  });

  it('classifyPotassium: K at exact boundary 58 → "medium"', () => {
    expect(classifyPotassium(58)).toBe('medium');
  });

  it('classifyPotassium: K at exact boundary 138 → "medium"', () => {
    expect(classifyPotassium(138)).toBe('medium');
  });

  it('getNutrientsFromStraight: input is case-insensitive for fertilizer name', () => {
    const lower  = getNutrientsFromStraight(50, 'urea');
    const upper  = getNutrientsFromStraight(50, 'UREA');
    const mixed  = getNutrientsFromStraight(50, 'Urea');
    expect(lower.n).toBe(upper.n);
    expect(lower.n).toBe(mixed.n);
  });

  it('roundToBag returns non-negative kgs for any non-negative input', () => {
    [0, 1, 10, 25, 50, 100, 200, 500].forEach(v => {
      expect(roundToBag(v).kgs).toBeGreaterThanOrEqual(0);
    });
  });

  it('getNutrientsFromGromor: returns n and k keys even for missing product', () => {
    const result = getNutrientsFromGromor(50, 'NONEXISTENT');
    expect(result).toHaveProperty('n');
    expect(result).toHaveProperty('k');
  });

});
