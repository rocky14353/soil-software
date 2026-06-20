# 📋 Test Payloads We've Been Testing

## 🔴 Current Payload (Causing Validation Errors)

This is the payload that was showing **Phosphorus validation errors**:

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
  "sulfur": 9,
  "ph": 7.5,
  "soilType": "Medium",
  "ec": 0.6,
  "calcium": 20,
  "magnesium": 50,
  "zinc": 5,
  "boron": 0.5,
  "manganese": 20,
  "iron": 50,
  "copper": 20,
  "molybdenum": 0.5,
  "chlorine": 10,
  "gromorCombination": "Auto-select based on Location",
  "pref_28_28_0": "Optional",
  "pref_14_35_14": "Optional",
  "pref_20_20_0": "Optional",
  "pref_10_26_26": "Optional",
  "pref_16_20_0": "Optional",
  "pref_Urea": "Optional",
  "pref_MOP": "Optional",
  "pref_SOP": "Optional",
  "pref_SSP": "Optional"
}
```

**Expected Results:**
- **Recommended:** N=48, P=32, K=21 kg/acre
- **Soil Status:** N=medium, P=low, K=low
- **Issue:** Was getting P=27.02 kg/acre (below 28.16 kg/acre minimum)

---

## 📝 Standard Test Payloads

### Test 1: Basic Paddy Test
```json
{
  "crop": "Paddy lowland",
  "organicCarbon": 0.4,
  "nitrogen": null,
  "phosphorus": 9,
  "potassium": 70,
  "season": "Rabi",
  "fieldType": "Irrigated",
  "location": "SOUTH TELENGANA",
  "sulfur": 15,
  "ph": 7.5
}
```
**Purpose:** Tests OC fallback for N classification

---

### Test 2: Paddy with N Value
```json
{
  "crop": "Paddy lowland",
  "organicCarbon": 0.4,
  "nitrogen": 150,
  "phosphorus": 9,
  "potassium": 70,
  "season": "Rabi",
  "fieldType": "Irrigated",
  "location": "SOUTH TELENGANA",
  "sulfur": 15,
  "ph": 7.5
}
```
**Purpose:** Tests N classification with direct N value (should be medium)

---

### Test 3: High N, Low P, Low K
```json
{
  "crop": "Paddy lowland",
  "organicCarbon": 0.6,
  "nitrogen": 170,
  "phosphorus": 12,
  "potassium": 150,
  "season": "Rabi",
  "fieldType": "Irrigated",
  "location": "SOUTH TELENGANA",
  "sulfur": 10,
  "ph": 8.0
}
```
**Purpose:** Tests with high K (should reduce K recommendation)

---

### Test 4: JSON API Payload Format
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
**Note:** This format needs mapping to our form fields

---

## 🎯 Quick Test Payload (Copy-Paste Ready)

**For testing the current fixes:**

```javascript
{
  crop: "Paddy lowland",
  organicCarbon: 0.6,
  nitrogen: 150,
  phosphorus: 9,
  potassium: 50,
  season: "Rabi",
  fieldType: "Irrigated",
  location: "SOUTH TELENGANA",
  sulfur: 9,
  ph: 7.5,
  soilType: "Medium",
  ec: 0.6,
  calcium: 20,
  magnesium: 50,
  zinc: 5,
  boron: 0.5,
  manganese: 20,
  iron: 50,
  copper: 20,
  molybdenum: 0.5,
  chlorine: 10,
  gromorCombination: "Auto-select based on Location",
  pref_28_28_0: "Optional",
  pref_14_35_14: "Optional",
  pref_20_20_0: "Optional",
  pref_10_26_26: "Optional",
  pref_16_20_0: "Optional",
  pref_Urea: "Optional",
  pref_MOP: "Optional",
  pref_SOP: "Optional",
  pref_SSP: "Optional"
}
```

---

## 📊 Expected Results for Current Payload

- **Location:** SOUTH TELENGANA
- **Crop:** Paddy lowland
- **Season:** Rabi
- **Soil Status:** N=medium, P=low, K=low
- **Recommended:** N=48, P=32, K=21 kg/acre
- **Expected Delivered:** Should be ≥ 88% of recommended (N≥42.24, P≥28.16, K≥18.48)

---

## 💾 How to Load Saved Payload

1. Fill in the form with test values
2. Click **"💾 Save Payload"** button
3. Later, click **"📋 Load Saved Payload"** to restore values
4. Payload is saved in browser's `localStorage`











