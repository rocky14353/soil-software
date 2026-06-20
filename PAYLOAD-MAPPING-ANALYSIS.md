# Payload Mapping Analysis

## Your JSON Payload:
```json
{
  "cropCode": "PADDY",
  "irrigationType": "IRRIGATED",
  "useComplexFertilizer": true,
  "nitrogen": null,
  "phosphorus": 18,
  "potassium": 260,
  "organicCarbon": 0.48,
  "sulphur": 8,
  "ph": 7.4,
  "zinc": 0.6,
  "iron": 6.0,
  "manganese": 4.0,
  "copper": 0.2,
  "boron": 0.6,
  "molybdenum": 0.2,
  "chlorine": 12.0
}
```

## Field Mapping:

| Your JSON Field | System Field | Status | Notes |
|----------------|--------------|--------|-------|
| `cropCode: "PADDY"` | `crop` | ⚠️ Needs mapping | Must be: "Paddy lowland", "Paddy Upland", or "Paddy Mediumland" |
| `irrigationType: "IRRIGATED"` | `fieldType` | ✅ Maps | Value: "Irrigated" |
| `useComplexFertilizer: true` | N/A | ❌ Not used | Not a form field |
| `nitrogen: null` | `nitrogen` | ✅ OK | Will use organicCarbon for classification |
| `phosphorus: 18` | `phosphorus` | ✅ Maps | Value: 18 kg/acre |
| `potassium: 260` | `potassium` | ✅ Maps | Value: 260 kg/acre |
| `organicCarbon: 0.48` | `organicCarbon` | ✅ Maps | Value: 0.48% |
| `sulphur: 8` | `sulfur` | ✅ Maps | Value: 8 ppm |
| `ph: 7.4` | `ph` | ✅ Maps | Value: 7.4 |
| `zinc: 0.6` | `zinc` | ✅ Maps | Value: 0.6 ppm |
| `iron: 6.0` | `iron` | ✅ Maps | Value: 6.0 ppm |
| `manganese: 4.0` | `manganese` | ✅ Maps | Value: 4.0 ppm |
| `copper: 0.2` | `copper` | ✅ Maps | Value: 0.2 ppm |
| `boron: 0.6` | `boron` | ✅ Maps | Value: 0.6 ppm |
| `molybdenum: 0.2` | `molybdenum` | ✅ Maps | Value: 0.2 ppm |
| `chlorine: 12.0` | `chlorine` | ✅ Maps | Value: 12.0 ppm |

## Missing Required Fields:

1. **`location`** - REQUIRED for recommendations
   - Options: "GODAVARI DELTA", "KRI-DELTA & L soils", "NORTH COASTAL", "SOUTH MANDL", "NORTH TELENGANA", "SOUTH TELENGANA", "LOW RAINFALL AREA", "High altitude Area"

2. **`season`** - Optional (defaults to "Rabi")
   - Options: "Kharif", "Rabi", "Summer", "Perennial"

3. **`crop`** - Needs to be specific
   - Your: "PADDY"
   - System needs: "Paddy lowland", "Paddy Upland", or "Paddy Mediumland"

## Optional Fields (Not in your payload):
- `soilType` - Defaults to empty
- `ec` - Defaults to 0
- `calcium` - Defaults to 0
- `magnesium` - Defaults to 0

## Expected Results Based on Your Payload:

### Nutrient Classifications:
- **Nitrogen**: LOW (OC = 0.48% < 0.5%)
- **Phosphorus**: MEDIUM (18 kg/acre, between 10-24)
- **Potassium**: HIGH (260 kg/acre > 138)
- **Sulfur**: LOW (8 ppm < 10)
- **pH**: Slightly Alkaline (7.4)
- **Zinc**: Deficiency (0.6 ppm < 1.5)
- **Iron**: Deficiency (6.0 ppm < 10.0)
- **Manganese**: Deficiency (4.0 ppm < 5.0)
- **Copper**: Deficiency (0.2 ppm < 0.3)
- **Boron**: Sufficiency (0.6 ppm ≥ 0.5)
- **Molybdenum**: Sufficiency (0.2 ppm ≥ 0.15)
- **Chlorine**: Deficiency (12.0 ppm < 20)

### Expected Recommendations:
- **N**: High requirement (N status = LOW)
- **P**: Medium requirement (P status = MEDIUM)
- **K**: Low requirement (K status = HIGH)

**Note**: Without `location`, the system cannot provide specific recommendations. Location determines the exact NPK values.











