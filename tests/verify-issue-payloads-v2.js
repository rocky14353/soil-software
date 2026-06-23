#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), DATA = path.join(ROOT, 'data');

// Load data
const cropsData = JSON.parse(fs.readFileSync(path.join(DATA, 'crops.json'), 'utf8'));
const locationCropRecs = JSON.parse(fs.readFileSync(path.join(DATA, 'location-crop-recommendations.json'), 'utf8'));
const locationsData = JSON.parse(fs.readFileSync(path.join(DATA, 'locations.json'), 'utf8'));
const fertConversion = JSON.parse(fs.readFileSync(path.join(DATA, 'fertilizer-conversion.json'), 'utf8'));
const soilTestClass = JSON.parse(fs.readFileSync(path.join(DATA, 'soil-test-classification.json'), 'utf8'));

// Browser mock
global.fetch = function(url) { const data = url.includes('fertilizer-conversion') ? fertConversion : url.includes('crops') ? cropsData : url.includes('locations') ? locationsData : url.includes('soil-test') ? soilTestClass : url.includes('location-crop-recommendations') ? locationCropRecs : {}; return Promise.resolve({ json: () => Promise.resolve(data) }); };
global.alert = () => {};
global.window = global;
global.document = { getElementById: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, appendChild() {}, classList: { add() {} } }), addEventListener: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.location = { href: '', search: '' };
Object.defineProperty(global, 'navigator', { value: { userAgent: 'node' }, configurable: true });
global.cropsData = cropsData;
global.fertilizerConversion = fertConversion;
global.locationsData = locationsData;
global.soilTestClassification = soilTestClass;
global.locationCropRecommendations = locationCropRecs;

// Load JS files
for (const file of ['rule-engine.js','fertilizer-catalog.js','allocation-engine.js','output-formatter.js','input-validation.js','calculator.js','renderer.js','form-handler.js','feedback.js','script.js']) {
  try { eval(fs.readFileSync(path.join(ROOT, file), 'utf8')); } catch (err) { console.error('ERROR loading '+file+': '+err.message); process.exit(1); }
}

const issues = [
  { num: 2, payload: { crop:'Paddy Mediumland',organicCarbon:'0.4',nitrogen:'160',phosphorus:'9',potassium:'80',season:'Kharif',fieldType:'Irrigated',location:'NORTH TELENGANA',soilType:'Medium',pH:'8.5',EC:'1.5',sulfur:'16' } },
  { num: 3, payload: { crop:'Paddy Mediumland',organicCarbon:'0.7',nitrogen:'100',phosphorus:'8',potassium:'50',season:'Kharif',fieldType:'Irrigated',location:'GODAVARI DELTA',soilType:'Medium',pH:'8',EC:'1',sulfur:'16' } },
  { num: 4, payload: { crop:'Paddy Mediumland',organicCarbon:'0.8',nitrogen:'110',phosphorus:'20',potassium:'55',season:'Kharif',fieldType:'Irrigated',location:'KRI-DELTA & L soils',soilType:'Medium',pH:'7.5',EC:'0.9',sulfur:'10' } },
  { num: 5, payload: { crop:'Paddy Mediumland',organicCarbon:'1',nitrogen:'150',phosphorus:'8',potassium:'60',season:'Kharif',fieldType:'Irrigated',location:'NORTH TELENGANA',soilType:'Light',pH:'7',EC:'1',sulfur:'12' } },
  { num: 6, payload: { crop:'Paddy Mediumland',organicCarbon:'0.5',nitrogen:'200',phosphorus:'20',potassium:'40',season:'Kharif',fieldType:'Irrigated',location:'SOUTH TELENGANA',soilType:'Light',pH:'7',EC:'1',sulfur:'16' } },
  { num: 7, payload: { crop:'Paddy Mediumland',organicCarbon:'1',nitrogen:'135',phosphorus:'6',potassium:'130',season:'Kharif',fieldType:'Irrigated',location:'LOW RAINFALL AREA',soilType:'Medium',pH:'7',EC:'1',sulfur:'15' } },
  { num: 8, payload: { crop:'Paddy Mediumland',organicCarbon:'0.6',nitrogen:'90',phosphorus:'8',potassium:'48',season:'Rabi',fieldType:'Irrigated',location:'GODAVARI DELTA',soilType:'Medium',pH:'7.8',EC:'1',sulfur:'20' } },
  { num: 9, payload: { crop:'Paddy Mediumland',organicCarbon:'0.5',nitrogen:'125',phosphorus:'16',potassium:'75',season:'Rabi',fieldType:'Irrigated',location:'LOW RAINFALL AREA',soilType:'Medium',pH:'7.5',EC:'1',sulfur:'10' } },
  { num: 10, payload: { crop:'Paddy Mediumland',organicCarbon:'0.8',nitrogen:'105',phosphorus:'8',potassium:'80',season:'Rabi',fieldType:'Irrigated',location:'NORTH COASTAL',soilType:'Light',pH:'7',EC:'1',sulfur:'15' } },
  { num: 11, payload: { crop:'Paddy Mediumland',organicCarbon:'0.6',nitrogen:'250',phosphorus:'30',potassium:'200',season:'Rabi',fieldType:'Irrigated',location:'SOUTH TELENGANA',soilType:'Light',pH:'7.9',EC:'1.2',sulfur:'10' } },
  { num: 12, payload: { crop:'Paddy Mediumland',organicCarbon:'0.6',nitrogen:'250',phosphorus:'30',potassium:'200',season:'Rabi',fieldType:'Irrigated',location:'SOUTH TELENGANA',soilType:'Light',pH:'7.9',EC:'1.2',sulfur:'10' } }
];

let passed = 0, failed = 0;
for (const issue of issues) {
  process.stdout.write('Issue #'+issue.num+': ');
  try {
    const result = window.calculateRecommendations(issue.payload);
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log('FAIL - no result (all combos failed?)');
      failed++;
      continue;
    }
    let totalN = 0, totalP = 0, totalK = 0;
    let stageN = [];
    for (let i = 0; i < result.length; i++) {
      const s = result[i];
      let sn=0,sp=0,sk=0;
      if (s && s.fertilizers) {
        s.fertilizers.forEach(f => { sn+=f.nContributed||0; sp+=f.pContributed||0; sk+=f.kContributed||0; });
      }
      stageN.push({sn,sp,sk});
      totalN+=sn; totalP+=sp; totalK+=sk;
    }
    
    // Quality checks
    const issues_found = [];
    if (stageN[1] && stageN[1].sk > 0.5) issues_found.push('K>0 at Tillering');
    if (stageN[2] && stageN[2].sp > 0.5) issues_found.push('P>0 at Panicle');
    if (stageN[2] && stageN[2].sn < 1) issues_found.push('Panicle N=0');
    
    if (issues_found.length > 0) {
      console.log('FAIL: '+issues_found.join(', '));
      console.log('  Basal: N='+(stageN[0]?stageN[0].sn.toFixed(2):'?')+' P='+(stageN[0]?stageN[0].sp.toFixed(2):'?')+' K='+(stageN[0]?stageN[0].sk.toFixed(2):'?'));
      console.log('  Tillering: N='+(stageN[1]?stageN[1].sn.toFixed(2):'?')+' P='+(stageN[1]?stageN[1].sp.toFixed(2):'?')+' K='+(stageN[1]?stageN[1].sk.toFixed(2):'?'));
      console.log('  Panicle: N='+(stageN[2]?stageN[2].sn.toFixed(2):'?')+' P='+(stageN[2]?stageN[2].sp.toFixed(2):'?')+' K='+(stageN[2]?stageN[2].sk.toFixed(2):'?'));
      console.log('  Total: N='+totalN.toFixed(2)+' P='+totalP.toFixed(2)+' K='+totalK.toFixed(2));
      failed++;
    } else {
      const detail = 'N='+totalN.toFixed(1)+' P='+totalP.toFixed(1)+' K='+totalK.toFixed(1);
      console.log('PASS ('+detail+')');
      passed++;
    }
  } catch(e) {
    console.log('FAIL - error: '+e.message);
    failed++;
  }
}
console.log('\n'+passed+' passed, '+failed+' failed');
process.exit(failed > 0 ? 1 : 0);