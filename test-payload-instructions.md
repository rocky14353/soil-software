# Test Payload - SOUTH TELENGANA Case

## Test Data

This is the regression test case payload for the SOUTH TELENGANA location with Paddy lowland crop.

### Expected Results
- **Total N Required**: 48.0 kg/acre
- **Total P Required**: 32.0 kg/acre  
- **Total K Required**: 21.0 kg/acre

### Expected Stage Targets
- **Basal**: N=16.0, P=22.4 (60%), K=10.5 (50%)
- **Tillering**: N=16.0, P=9.6 (40%), K=0 (NOT ALLOWED)
- **Panicle**: N=16.0, P=0 (NOT ALLOWED), K=10.5 (50%)

### Hard Constraints (Must Pass)
✅ Tillering K = 0 (strict)
✅ Panicle P = 0 (strict)
✅ Stage caps: No stage exceeds target + 12% tolerance
✅ Global quota: Total delivered within 12% of required

### Test Payload JSON

```json
{
  "crop": "Paddy lowland",
  "organicCarbon": 0.6,
  "nitrogen": 150,
  "phosphorus": 9,
  "potassium": 50,
  "season": "Rabi",
  "fieldType": "Irrigated",
  "location": "SOUTH TELENGANA",
  "soilType": "Medium",
  "sulfur": 9,
  "ph": 7.5,
  "ec": 0.6,
  "calcium": 20,
  "magnesium": 50,
  "zinc": 5,
  "boron": 0.5,
  "manganese": 20,
  "iron": 50,
  "copper": 20,
  "molybdenum": 0.5,
  "chlorine": 9.8,
  "gromorCombination": "Auto-select based on Location",
  "preferences": {
    "28-28-0": "Optional",
    "14-35-14": "Optional",
    "20-20-0": "Optional",
    "10-26-26": "Optional",
    "16-20-0": "Optional",
    "Urea": "Optional",
    "MOP": "Optional",
    "SOP": "Optional",
    "SSP": "Optional"
  }
}
```

## How to Test

1. **Browser Test**: Open `test-topup-output.html` in a browser
2. **Console Test**: Open browser console and run:
   ```javascript
   fetch('test-payload.json')
     .then(r => r.json())
     .then(payload => {
       const result = calculateRecommendations(payload);
       console.log('Total N:', result.totalRequirements.n);
       console.log('Total P:', result.totalRequirements.p);
       console.log('Total K:', result.totalRequirements.k);
       result.stageRecommendations.forEach((stage, idx) => {
         const n = stage.fertilizers.reduce((s, f) => s + (f.nContributed || 0), 0);
         const p = stage.fertilizers.reduce((s, f) => s + (f.pContributed || 0), 0);
         const k = stage.fertilizers.reduce((s, f) => s + (f.kContributed || 0), 0);
         console.log(`Stage ${idx + 1} (${stage.stage}): N=${n.toFixed(2)}, P=${p.toFixed(2)}, K=${k.toFixed(2)}`);
       });
     });
   ```

## Validation Checklist

- [ ] Tillering K = 0.00 (within 0.01 tolerance)
- [ ] Panicle P = 0.00 (within 0.01 tolerance)
- [ ] Total N delivered ≤ 48.0 * 1.12 = 53.76 kg
- [ ] Total N delivered ≥ 48.0 * 0.88 = 42.24 kg (ideally close to 48.0)
- [ ] Total P delivered within 12% of 32.0 kg
- [ ] Total K delivered within 12% of 21.0 kg
- [ ] No 0.00 kg fertilizer rows in output
- [ ] All stage caps respected (no stage exceeds target + 12%)





