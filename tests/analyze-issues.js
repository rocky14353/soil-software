#!/usr/bin/env node
const fs = require('fs'), p = require('path');
const R = p.resolve(__dirname, '..');
const D = p.join(R, 'data');
const L = JSON.parse(fs.readFileSync(p.join(D, 'location-crop-recommendations.json'), 'utf8'));
const F = JSON.parse(fs.readFileSync(p.join(D, 'fertilizer-conversion.json'), 'utf8'));
const C = JSON.parse(fs.readFileSync(p.join(D, 'crops.json'), 'utf8'));
const LC = JSON.parse(fs.readFileSync(p.join(D, 'locations.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(p.join(D, 'soil-test-classification.json'), 'utf8'));

global.fetch = function(u) { const d = u.includes('fert') ? F : u.includes('crops') ? C : u.includes('locations') ? LC : u.includes('soil') ? S : u.includes('loc') ? L : {}; return Promise.resolve({ json: () => Promise.resolve(d) }); };
global.alert = function() {}; global.window = global;
global.document = { getElementById: function() { return null }, querySelectorAll: function() { return [] }, createElement: function() { return { style: {}, appendChild: function() {}, classList: { add: function() {} } } } };
global.localStorage = { getItem: function() { return null }, setItem: function() {} };
global.location = { href: '', search: '' };
Object.defineProperty(global, 'navigator', { value: { userAgent: 'node' }, configurable: true });
global.cropsData = C; global.fertilizerConversion = F; global.locationsData = LC;
global.soilTestClassification = S; global.locationCropRecommendations = L;

for (const f of ['rule-engine.js', 'fertilizer-catalog.js', 'allocation-engine.js', 'output-formatter.js', 'input-validation.js', 'calculator.js', 'renderer.js', 'form-handler.js', 'feedback.js', 'script.js']) {
    eval(fs.readFileSync(p.join(R, f), 'utf8'));
}

const clog = console.log;
console.log = function() {};

function analyze(num, payload) {
    try {
        const r = window.calculateRecommendations(payload);
        clog('\n=== ISSUE #' + num + ': ' + payload.crop + ', ' + payload.location + ' ===');
        clog('Final Rec: N=' + r.recommendedNPK.n + ' P=' + r.recommendedNPK.p + ' K=' + r.recommendedNPK.k);
        
        // Check base recommendation display
        const step1 = r.calculationSteps?.step1;
        if (step1) {
            clog('Base Rec shown: N=' + step1.baseRecommendation.n + ' P=' + step1.baseRecommendation.p + ' K=' + step1.baseRecommendation.k);
            clog('Adjustments: N=' + step1.adjustments.n.value + ' P=' + step1.adjustments.p.value + ' K=' + step1.adjustments.k.value);
        }
        
        clog('Combination: ' + (r.combination?.name || 'N/A'));
        clog('Optimizer chose: ' + (r.optimizationInfo?.bestCombination || 'N/A'));
        
        let tn = 0, tp = 0, tk = 0;
        r.recommendations.forEach(function(s, i) {
            const name = s.stage || s.stageName || 'Stage ' + i;
            let sn = 0, sp = 0, sk = 0;
            s.fertilizers.forEach(function(f) { sn += f.nContributed || 0; sp += f.pContributed || 0; sk += f.kContributed || 0; });
            tn += sn; tp += sp; tk += sk;
            clog(name + ': N=' + sn.toFixed(2) + ' P=' + sp.toFixed(2) + ' K=' + sk.toFixed(2));
            s.fertilizers.forEach(function(f) { clog('  ' + f.name + ': ' + f.kgs.toFixed(1) + ' kg'); });
        });
        clog('TOTAL: N=' + tn.toFixed(2) + '/' + r.recommendedNPK.n + ' P=' + tp.toFixed(2) + '/' + r.recommendedNPK.p + ' K=' + tk.toFixed(2) + '/' + r.recommendedNPK.k);
        clog('Validation: ' + r.validation.passed);
        
        // Check what data is in location recs
        const cropKey = (num === 15) ? 'MAIZE' : 'JOWAR';
        const season = (num === 15) ? 'Kharif' : 'Kharif';
        const cropDataKey = cropKey + '-' + season.toUpperCase();
        clog('\nData check for ' + cropDataKey + ' / ' + payload.location + ':');
        const rec = L[cropDataKey];
        if (rec) {
            if (rec[payload.location]) {
                const locRec = rec[payload.location];
                clog('  Normal: N=' + locRec.normal.n + ' P=' + locRec.normal.p + ' K=' + locRec.normal.k);
                if (locRec.nStatus) clog('  N status: low=' + locRec.nStatus.low + ' med=' + locRec.nStatus.medium + ' high=' + locRec.nStatus.high);
                if (locRec.pStatus) clog('  P status: low=' + locRec.pStatus.low + ' med=' + locRec.pStatus.medium + ' high=' + locRec.pStatus.high);
                if (locRec.kStatus) clog('  K status: low=' + locRec.kStatus.low + ' med=' + locRec.kStatus.medium + ' high=' + locRec.kStatus.high);
            } else {
                clog('  Location "' + payload.location + '" not found in data. Available: ' + Object.keys(rec).slice(0, 5).join(', '));
            }
        } else {
            clog('  Crop key "' + cropDataKey + '" not found');
        }

    } catch (e) {
        clog('ERROR: ' + e.message);
    }
}

// Issue #15
analyze(15, {
    crop: 'Maize', organicCarbon: '0.5', nitrogen: '140', phosphorus: '8', potassium: '49',
    season: 'Kharif', fieldType: 'Irrigated', location: 'NORTH TELENGANA',
    soilType: 'Medium', pH: '7.5', EC: '1', sulfur: '16'
});

// Issue #16
analyze(16, {
    crop: 'Jowar', organicCarbon: '0.3', nitrogen: '125', phosphorus: '20', potassium: '80',
    season: 'Kharif', fieldType: 'Irrigated', location: 'KRI-DELTA & L soils',
    soilType: 'Medium', pH: '6.9', EC: '1', sulfur: '10'
});