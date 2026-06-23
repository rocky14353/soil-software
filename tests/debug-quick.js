#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), DATA = path.join(ROOT, 'data');

try {
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
  for(const f of ['rule-engine.js','fertilizer-catalog.js','allocation-engine.js','output-formatter.js','input-validation.js','calculator.js','renderer.js','form-handler.js','feedback.js','script.js']){
    eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  }
  // Override verbose console logs
  const origLog = console.log;
  console.log = function() {
    const m = arguments[0] || '';
    if (typeof m === 'string' && m.startsWith('[')) return;
    if (typeof m === 'string' && m.includes('Attempting')) return;
    if (typeof m === 'string' && m.includes('REJECTED')) return;
    if (typeof m === 'string' && (m.includes('ADDED') || m.includes('ACCEPTED') || m.includes('Skipped') || m.includes('SKIPPED'))) return;
    if (typeof m === 'string' && m.includes('Cannot add')) return;
    if (typeof m === 'string' && m.includes('Final Rebalancing')) return;
    if (typeof m === 'string' && m.includes('rebalancing') || m.includes('overflow')) return;
    if (typeof m === 'string' && m.includes('DEBUG') || m.includes('P-First')) return;
    if (typeof m === 'string' && m.includes('topup') || m.includes('headroom')) return;
    origLog.apply(console, arguments);
  };
  console.error = function() {};
  
  const r = window.calculateRecommendations({crop:'Paddy Mediumland',organicCarbon:'0.8',nitrogen:'105',phosphorus:'8',potassium:'80',season:'Rabi',fieldType:'Irrigated',location:'NORTH COASTAL',soilType:'Light',pH:'7',EC:'1',sulfur:'15'});
  if (!r || !Array.isArray(r)) {
    console.log(JSON.stringify({error:'no array result', type:typeof r}));
    process.exit(1);
  }
  let tn=0,tp=0,tk=0;
  const stages = r.map((s,i) => {
    const name = ['Basal','Tillering','Panicle'][i]||i;
    let sn=0,sp=0,sk=0;
    if (s.fertilizers) s.fertilizers.forEach(f => {sn+=f.nContributed||0;sp+=f.pContributed||0;sk+=f.kContributed||0;});
    tn+=sn;tp+=sp;tk+=sk;
    return {name,n:sn,p:sp,k:sk,ferts:(s.fertilizers||[]).map(f=>f.name+'='+f.kgs+'kg')};
  });
  console.log(JSON.stringify({stages,total:{n:tn,p:tp,k:tk},pass:tn>0&&tp>0&&tk>0}));
} catch(e) {
  console.log(JSON.stringify({error:e.message}));
  process.exit(1);
}