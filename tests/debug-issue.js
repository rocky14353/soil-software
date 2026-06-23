#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
const origLog = console.log;
console.log = function() {};
const ROOT = __dirname, DATA = path.join(ROOT, 'data');
const cropsData = JSON.parse(fs.readFileSync(path.join(DATA, 'crops.json'), 'utf8'));
const locationCropRecs = JSON.parse(fs.readFileSync(path.join(DATA, 'location-crop-recommendations.json'), 'utf8'));
const locationsData = JSON.parse(fs.readFileSync(path.join(DATA, 'locations.json'), 'utf8'));
const fertConversion = JSON.parse(fs.readFileSync(path.join(DATA, 'fertilizer-conversion.json'), 'utf8'));
const soilTestClass = JSON.parse(fs.readFileSync(path.join(DATA, 'soil-test-classification.json'), 'utf8'));
global.fetch = function(u) {const d=u.includes('fert')?fertConversion:u.includes('crops')?cropsData:u.includes('locations')?locationsData:u.includes('soil')?soilTestClass:u.includes('loc')?locationCropRecs:{};return Promise.resolve({json:()=>Promise.resolve(d)});};
global.alert = ()=>{}; global.window=global;
global.document={getElementById:()=>null,querySelectorAll:()=>[],createElement:()=>({style:{},appendChild(){},classList:{add(){}}}),addEventListener:()=>{}};
global.localStorage={getItem:()=>null,setItem:()=>{}}; global.location={href:'',search:''};
Object.defineProperty(global,'navigator',{value:{userAgent:'node'},configurable:true});
global.cropsData=cropsData;global.fertilizerConversion=fertConversion;global.locationsData=locationsData;
global.soilTestClassification=soilTestClass;global.locationCropRecommendations=locationCropRecs;
for(const f of ['rule-engine.js','fertilizer-catalog.js','allocation-engine.js','output-formatter.js','input-validation.js','calculator.js','renderer.js','form-handler.js','feedback.js','script.js']){try{eval(fs.readFileSync(path.join(ROOT,f),'utf8'))}catch(e){origLog('Error: '+e.message);process.exit(1);}}
console.log = origLog;

// Debug: Test just issue #10
const p = {crop:'Paddy Mediumland',organicCarbon:'0.8',nitrogen:'105',phosphorus:'8',potassium:'80',season:'Rabi',fieldType:'Irrigated',location:'NORTH COASTAL',soilType:'Light',pH:'7',EC:'1',sulfur:'15'};
console.log('Testing issue #10 payload...');
try {
  const r = window.calculateRecommendations(p);
  console.log('Result type:', typeof r, 'Array:', Array.isArray(r), 'Length:', r ? r.length : 'N/A');
  if (r && r.length > 0) {
    let tn=0,tp=0,tk=0;
    r.forEach((s,i) => {
      const name = ['Basal','Tillering','Panicle'][i]||i;
      let sn=0,sp=0,sk=0;
      if (s.fertilizers) {
        s.fertilizers.forEach(f => {
          sn+=f.nContributed||0; sp+=f.pContributed||0; sk+=f.kContributed||0;
        });
      }
      tn+=sn;tp+=sp;tk+=sk;
      console.log(name+': N='+sn.toFixed(2)+' P='+sp.toFixed(2)+' K='+sk.toFixed(2));
    });
    console.log('TOTAL: N='+tn.toFixed(2)+' P='+tp.toFixed(2)+' K='+tk.toFixed(2));
  }
} catch(e) {
  console.log('ERROR: '+e.message);
}