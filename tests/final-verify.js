#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');

// Load data files
const locationCropRecs = JSON.parse(fs.readFileSync(path.join(DATA, 'location-crop-recommendations.json'), 'utf8'));
const fertConversion = JSON.parse(fs.readFileSync(path.join(DATA, 'fertilizer-conversion.json'), 'utf8'));
const cropsData = JSON.parse(fs.readFileSync(path.join(DATA, 'crops.json'), 'utf8'));
const locationsData = JSON.parse(fs.readFileSync(path.join(DATA, 'locations.json'), 'utf8'));
const soilTestClass = JSON.parse(fs.readFileSync(path.join(DATA, 'soil-test-classification.json'), 'utf8'));

global.fetch = function(url) {const d=url.includes('fertilizer-conversion')?fertConversion:url.includes('crops')?cropsData:url.includes('locations')?locationsData:url.includes('soil-test')?soilTestClass:url.includes('location-crop-recommendations')?locationCropRecs:{};return Promise.resolve({json:()=>Promise.resolve(d)});};
global.alert = function(){}; global.window = global;
global.document = {getElementById:function(){return null;},querySelectorAll:function(){return[];},createElement:function(){return{style:{},appendChild:function(){},classList:{add:function(){}}}};
global.localStorage = {getItem:function(){return null;},setItem:function(){}};
global.location = {href:'',search:''};
Object.defineProperty(global,'navigator',{value:{userAgent:'node'},configurable:true});
global.cropsData=cropsData;global.fertilizerConversion=fertConversion;global.locationsData=locationsData;
global.soilTestClassification=soilTestClass;global.locationCropRecommendations=locationCropRecs;

for(const f of ['rule-engine.js','fertilizer-catalog.js','allocation-engine.js','output-formatter.js','input-validation.js','calculator.js','renderer.js','form-handler.js','feedback.js','script.js']){
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}

// Disable ALL console.log from the calculator
const silentLog = function(){};
console.log = silentLog;
console.warn = silentLog;
console.error = silentLog;

const tests = [
  {n:2, p:{crop:'Paddy Mediumland',organicCarbon:'0.4',nitrogen:'160',phosphorus:'9',potassium:'80',season:'Kharif',fieldType:'Irrigated',location:'NORTH TELENGANA',soilType:'Medium',pH:'8.5',EC:'1.5',sulfur:'16'}},
  {n:3, p:{crop:'Paddy Mediumland',organicCarbon:'0.7',nitrogen:'100',phosphorus:'8',potassium:'50',season:'Kharif',fieldType:'Irrigated',location:'GODAVARI DELTA',soilType:'Medium',pH:'8',EC:'1',sulfur:'16'}},
  {n:4, p:{crop:'Paddy Mediumland',organicCarbon:'0.8',nitrogen:'110',phosphorus:'20',potassium:'55',season:'Kharif',fieldType:'Irrigated',location:'KRI-DELTA & L soils',soilType:'Medium',pH:'7.5',EC:'0.9',sulfur:'10'}},
  {n:5, p:{crop:'Paddy Mediumland',organicCarbon:'1',nitrogen:'150',phosphorus:'8',potassium:'60',season:'Kharif',fieldType:'Irrigated',location:'NORTH TELENGANA',soilType:'Light',pH:'7',EC:'1',sulfur:'12'}},
  {n:6, p:{crop:'Paddy Mediumland',organicCarbon:'0.5',nitrogen:'200',phosphorus:'20',potassium:'40',season:'Kharif',fieldType:'Irrigated',location:'SOUTH TELENGANA',soilType:'Light',pH:'7',EC:'1',sulfur:'16'}},
  {n:7, p:{crop:'Paddy Mediumland',organicCarbon:'1',nitrogen:'135',phosphorus:'6',potassium:'130',season:'Kharif',fieldType:'Irrigated',location:'LOW RAINFALL AREA',soilType:'Medium',pH:'7',EC:'1',sulfur:'15'}},
  {n:8, p:{crop:'Paddy Mediumland',organicCarbon:'0.6',nitrogen:'90',phosphorus:'8',potassium:'48',season:'Rabi',fieldType:'Irrigated',location:'GODAVARI DELTA',soilType:'Medium',pH:'7.8',EC:'1',sulfur:'20'}},
  {n:9, p:{crop:'Paddy Mediumland',organicCarbon:'0.5',nitrogen:'125',phosphorus:'16',potassium:'75',season:'Rabi',fieldType:'Irrigated',location:'LOW RAINFALL AREA',soilType:'Medium',pH:'7.5',EC:'1',sulfur:'10'}},
  {n:10, p:{crop:'Paddy Mediumland',organicCarbon:'0.8',nitrogen:'105',phosphorus:'8',potassium:'80',season:'Rabi',fieldType:'Irrigated',location:'NORTH COASTAL',soilType:'Light',pH:'7',EC:'1',sulfur:'15'}},
];

// Restore console for our output
const stdout = function(msg){process.stdout.write(msg+'\n');};

let pass=0,fail=0;
for(const t of tests){
  try{
    const result = window.calculateRecommendations(t.p);
    const recs = result.recommendations;
    if(!recs||!Array.isArray(recs)){stdout('#'+t.n+': FAIL (no recs)');fail++;continue;}
    let tn=0,tp=0,tk=0,issues=[];
    for(let i=0;i<recs.length;i++){
      let s=recs[i],sn=0,sp=0,sk=0;
      if(s.fertilizers) s.fertilizers.forEach(f=>{sn+=f.nContributed||0;sp+=f.pContributed||0;sk+=f.kContributed||0;});
      if(i===1&&sk>0.1) issues.push('K>0@Tillering');
      if(i===2&&sp>0.1) issues.push('P>0@Panicle');
      if(i===2&&sn<1) issues.push('Panicle N=0');
      tn+=sn;tp+=sp;tk+=sk;
    }
    if(issues.length>0){stdout('#'+t.n+': FAIL '+issues.join(' ')+' (N='+tn.toFixed(1)+' P='+tp.toFixed(1)+' K='+tk.toFixed(1)+')');fail++;}
    else{stdout('#'+t.n+': PASS (N='+tn.toFixed(1)+' P='+tp.toFixed(1)+' K='+tk.toFixed(1)+')');pass++;}
  }catch(e){stdout('#'+t.n+': FAIL - '+e.message);fail++;}
}
stdout('\n'+pass+' passed, '+fail+' failed');
process.exit(fail>0?1:0);