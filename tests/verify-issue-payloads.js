
// Comprehensive verification of all issue payloads
const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable'
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.console = console;

// Load the main calculator file
require('./calculator.js');

// Also load feedback.js, output-formatter.js
const fs = require('fs');
const feedbackCode = fs.readFileSync('./feedback.js', 'utf8');
eval(feedbackCode);

// Test payloads from each issue
const testPayloads = [
    {
        issue: '#2',
        name: 'Panicle N=0',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.4',
            nitrogen: '160',
            phosphorus: '9',
            potassium: '80',
            season: 'Kharif',
            fieldType: 'Irrigated',
            location: 'NORTH TELENGANA',
            soilType: 'Medium',
            pH: '8.5',
            EC: '1.5',
            sulfur: '16'
        },
        expectations: {
            // N should be 40 kg total, 3 equal splits of ~13.33 kg each
            panicleNMin: 10, // At least 10 kg N at panicle (should be ~13.33)
        }
    },
    {
        issue: '#3',
        name: 'K shortfall + Mn/Fe',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.7',
            nitrogen: '100',
            phosphorus: '8',
            potassium: '50',
            season: 'Kharif',
            fieldType: 'Irrigated',
            location: 'GODAVARI DELTA',
            soilType: 'Medium',
            pH: '8',
            EC: '1',
            sulfur: '16'
        },
        expectations: {
            totalKMin: 18, // User expects 21 kg total K
        }
    },
    {
        issue: '#4',
        name: 'K shortfall again',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.8',
            nitrogen: '110',
            phosphorus: '20',
            potassium: '55',
            season: 'Kharif',
            fieldType: 'Irrigated',
            location: 'KRI-DELTA & L soils',
            soilType: 'Medium',
            pH: '7.5',
            EC: '0.9',
            sulfur: '10'
        },
        expectations: {
            totalKMin: 18,
        }
    },
    {
        issue: '#5',
        name: 'N/K shortfall',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '1',
            nitrogen: '150',
            phosphorus: '8',
            potassium: '60',
            season: 'Kharif',
            fieldType: 'Irrigated',
            location: 'NORTH TELENGANA',
            soilType: 'Light',
            pH: '7',
            EC: '1',
            sulfur: '12'
        },
        expectations: {}
    },
    {
        issue: '#6',
        name: 'K calc wrong',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.5',
            nitrogen: '200',
            phosphorus: '20',
            potassium: '40',
            season: 'Kharif',
            fieldType: 'Irrigated',
            location: 'SOUTH TELENGANA',
            soilType: 'Light',
            pH: '7',
            EC: '1',
            sulfur: '16'
        },
        expectations: {
            totalKMin: 15,
        }
    },
    {
        issue: '#8',
        name: 'N at Tillering shortfall',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.6',
            nitrogen: '90',
            phosphorus: '8',
            potassium: '48',
            season: 'Rabi',
            fieldType: 'Irrigated',
            location: 'GODAVARI DELTA',
            soilType: 'Medium',
            pH: '7.8',
            EC: '1',
            sulfur: '20'
        },
        expectations: {
            tilleringNMin: 7,
        }
    },
    {
        issue: '#9',
        name: 'N=10 at Tillering instead of 20',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.5',
            nitrogen: '125',
            phosphorus: '16',
            potassium: '75',
            season: 'Rabi',
            fieldType: 'Irrigated',
            location: 'LOW RAINFALL AREA',
            soilType: 'Medium',
            pH: '7.5',
            EC: '1',
            sulfur: '10'
        },
        expectations: {
            tilleringNMin: 7,
        }
    },
    {
        issue: '#10',
        name: 'N/K shortfall',
        payload: {
            crop: 'Paddy Mediumland',
            organicCarbon: '0.8',
            nitrogen: '105',
            phosphorus: '8',
            potassium: '80',
            season: 'Rabi',
            fieldType: 'Irrigated',
            location: 'NORTH COASTAL',
            soilType: 'Light',
            pH: '7',
            EC: '1',
            sulfur: '15'
        },
        expectations: {}
    }
];

let totalPass = 0;
let totalFail = 0;

for (const test of testPayloads) {
    const line = '='.repeat(60);
    console.log(`\n${line}`);
    console.log(`=== ISSUE ${test.issue}: ${test.name}`);
    console.log(line);
    
    try {
        const result = window.calculateRecommendations(test.payload);
        
        // Calculate totals
        let totalN = 0, totalP = 0, totalK = 0;
        const stageDetails = result.map((stage, idx) => {
            if (!stage || !stage.fertilizers) return { stage: stage?.stage || stage?.stageName || `Stage ${idx}`, n: 0, p: 0, k: 0 };
            let sn = 0, sp = 0, sk = 0;
            const ferts = stage.fertilizers.map(f => {
                sn += f.nContributed || 0;
                sp += f.pContributed || 0;
                sk += f.kContributed || 0;
                return `${f.name}: ${f.kgs?.toFixed(1) || '?'} kg (N=${(f.nContributed||0).toFixed(2)}, P=${(f.pContributed||0).toFixed(2)}, K=${(f.kContributed||0).toFixed(2)})`;
            });
            totalN += sn; totalP += sp; totalK += sk;
            return { stage: stage.stage || stage.stageName || `Stage ${idx}`, n: sn, p: sp, k: sk, ferts };
        });
        
        console.log('  Stages:');
        stageDetails.forEach((s, i) => {
            const stageNames = ['Basal', 'at Tillering', 'at Panicle'];
            console.log(`  ${i < 3 ? stageNames[i] : s.stage}: N=${s.n.toFixed(2)}, P=${s.p.toFixed(2)}, K=${s.k.toFixed(2)}`);
            s.ferts.forEach(f => console.log(`    ${f}`));
        });
        console.log(`  TOTALS: N=${totalN.toFixed(2)}, P=${totalP.toFixed(2)}, K=${totalK.toFixed(2)}`);
        
        // Check for "undefined"
        let hasUndefined = false;
        result.forEach((stage, idx) => {
            if (!stage.stage && !stage.stageName) hasUndefined = true;
            if (stage.fertilizers) {
                stage.fertilizers.forEach(f => {
                    if (f.kgs === undefined || f.kgs === null) hasUndefined = true;
                });
            }
        });
        if (hasUndefined) {
            console.log(`  ❌ FAIL: Contains "undefined" in output`);
            totalFail++;
        } else {
            console.log(`  ✅ PASS: No undefined values`);
            totalPass++;
        }
        
        // Check specific expectations
        if (test.expectations.panicleNMin !== undefined) {
            const panicleN = stageDetails[2]?.n || 0;
            if (panicleN >= test.expectations.panicleNMin) {
                console.log(`  ✅ PASS: Panicle N = ${panicleN.toFixed(2)} (min ${test.expectations.panicleNMin})`);
                totalPass++;
            } else {
                console.log(`  ❌ FAIL: Panicle N = ${panicleN.toFixed(2)} < ${test.expectations.panicleNMin}`);
                totalFail++;
            }
        }
        
        if (test.expectations.tilleringNMin !== undefined) {
            const tilleringN = stageDetails[1]?.n || 0;
            if (tilleringN >= test.expectations.tilleringNMin) {
                console.log(`  ✅ PASS: Tillering N = ${tilleringN.toFixed(2)} (min ${test.expectations.tilleringNMin})`);
                totalPass++;
            } else {
                console.log(`  ❌ FAIL: Tillering N = ${tilleringN.toFixed(2)} < ${test.expectations.tilleringNMin}`);
                totalFail++;
            }
        }
        
        if (test.expectations.totalKMin !== undefined) {
            if (totalK >= test.expectations.totalKMin) {
                console.log(`  ✅ PASS: Total K = ${totalK.toFixed(2)} (min ${test.expectations.totalKMin})`);
                totalPass++;
            } else {
                console.log(`  ❌ FAIL: Total K = ${totalK.toFixed(2)} < ${test.expectations.totalKMin}`);
                totalFail++;
            }
        }
        
    } catch (e) {
        console.log(`  ❌ ERROR: ${e.message}`);
        totalFail++;
    }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`RESULTS: ${totalPass} PASS, ${totalFail} FAIL`);
process.exit(totalFail > 0 ? 1 : 0);
