/**
 * @jest-environment jsdom
 *
 * Quick debug test to understand what calculateRecommendations returns
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Load data
const cropsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/crops.json')));
const locRecs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/location-crop-recommendations.json')));
const locsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/locations.json')));
const fertConv = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/fertilizer-conversion.json')));
const soilTestC = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/soil-test-classification.json')));

// Mock fetch
global.fetch = jest.fn((url) => {
  const data =
    url.includes('fertilizer-conversion') ? fertConv :
    url.includes('crops')                 ? cropsData :
    url.includes('locations')             ? locsData :
    url.includes('soil-test')             ? soilTestC :
    url.includes('location-crop-recommendations') ? locRecs :
    {};
  return Promise.resolve({ json: () => Promise.resolve(data) });
});

global.alert = jest.fn();

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
  </form>
  <div id="resultsSection"></div>
  <div id="resultsContent"></div>
`;

// Load the script
const scriptSrc = fs.readFileSync(path.resolve(__dirname, '..', 'script-v2.js'), 'utf8');
window.eval(scriptSrc);

beforeAll(() => new Promise(resolve => setTimeout(resolve, 200)));

test('debug single payload', () => {
  expect(typeof calculateRecommendations).toBe('function');

  const payload = {
    crop: 'Paddy lowland',
    organicCarbon: '0.3',
    nitrogen: '50',
    phosphorus: '5',
    potassium: '30',
    season: 'Rabi',
    fieldType: 'Irrigated',
    location: 'GODAVARI DELTA',
    sulfur: '',
    ph: '',
    gromorCombination: '1'
  };

  const result = calculateRecommendations(payload);

  console.log('=== RESULT KEYS ===');
  console.log(Object.keys(result));

  console.log('=== SOIL TEST STATUS ===');
  console.log(JSON.stringify(result.soilTestStatus));

  console.log('=== TOTALS ===');
  console.log(JSON.stringify(result.totals));

  console.log('=== RECOMMENDATIONS ===');
  if (result.recommendations) {
    result.recommendations.forEach((stage, i) => {
      console.log(`Stage ${i}: ${stage.stage}`);
      console.log(`  Fertilizers: ${JSON.stringify(stage.fertilizers)}`);
    });
  } else {
    console.log('  No recommendations');
  }

  // Calculate delivered totals from recommendations
  let totalN = 0, totalP = 0, totalK = 0;
  if (result.recommendations) {
    result.recommendations.forEach(stage => {
      (stage.fertilizers || []).forEach(f => {
        totalN += f.nContributed || 0;
        totalP += f.pContributed || 0;
        totalK += f.kContributed || 0;
      });
    });
  }
  console.log('=== DELIVERED NPK ===');
  console.log(`N: ${totalN}, P: ${totalP}, K: ${totalK}`);

  expect(result.totals.n).toBeGreaterThan(0);
});