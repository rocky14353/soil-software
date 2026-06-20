# Current Telangana Values in System

## 📍 **NORTH TELENGANA**

### PADDY - KHARIF
- **Normal NPK**: N: 40, P: 20, K: 16 (kg/acre)
- **By N Status**:
  - Low: 53 kg/acre
  - Medium: 40 kg/acre
  - High: 27 kg/acre
- **By P Status**:
  - Low: 27 kg/acre
  - Medium: 20 kg/acre
  - High: 13 kg/acre
- **By K Status**:
  - Low: 21 kg/acre
  - Medium: 16 kg/acre
  - High: 11 kg/acre
- **Preferred Combination**: 5 (28-28-0 + 16-20-0)

### PADDY - RABI
- **Normal NPK**: N: 48, P: 24, K: 16 (kg/acre)
- **By N Status**:
  - Low: 64 kg/acre
  - Medium: 48 kg/acre
  - High: 32 kg/acre
- **By P Status**:
  - Low: 32 kg/acre
  - Medium: 24 kg/acre
  - High: 16 kg/acre
- **By K Status**:
  - Low: 21 kg/acre
  - Medium: 16 kg/acre
  - High: 11 kg/acre
- **Preferred Combination**: 5 (28-28-0 + 16-20-0)

---

## 📍 **SOUTH TELENGANA**

### PADDY - KHARIF
- **Normal NPK**: N: 48, P: 24, K: 16 (kg/acre)
- **By N Status**:
  - Low: 64 kg/acre
  - Medium: 48 kg/acre
  - High: 32 kg/acre
- **By P Status**:
  - Low: 32 kg/acre
  - Medium: 24 kg/acre
  - High: 16 kg/acre
- **By K Status**:
  - Low: 21 kg/acre
  - Medium: 16 kg/acre
  - High: 11 kg/acre
- **Preferred Combination**: 6 (14-35-14 + 16-20-0)

### PADDY - RABI
- **Normal NPK**: N: 48, P: 24, K: 16 (kg/acre)
- **By N Status**:
  - Low: 64 kg/acre
  - Medium: 48 kg/acre
  - High: 32 kg/acre
- **By P Status**:
  - Low: 32 kg/acre
  - Medium: 24 kg/acre
  - High: 16 kg/acre
- **By K Status**:
  - Low: 21 kg/acre
  - Medium: 16 kg/acre
  - High: 11 kg/acre
- **Preferred Combination**: 6 (14-35-14 + 16-20-0)

---

## 🌾 **Crop Split Ratios (from crops.json)**

### Paddy lowland (used for Telangana)
- **N Splits**: 3 splits
  - Ratios: [0.25, 0.5, 0.25] (25%, 50%, 25%)
  - Stages: ["Basal", "at Tillering", "at Panicle"]
- **K Splits**: 2 splits
  - Ratios: [0.5, 0.5] (50%, 50%)
  - Stages: ["Basal", "at Panicle"]
- **P**: Applied only at Basal (100%)

### Paddy Upland
- **N Splits**: 3 splits
  - Ratios: [0.25, 0.5, 0.25] (25%, 50%, 25%)
  - Stages: ["Basal", "at Tillering", "at Panicle"]
- **K Splits**: 2 splits
  - Ratios: [0.5, 0.5] (50%, 50%)
  - Stages: ["Basal", "at Panicle"]

### Paddy Mediumland
- **N Splits**: 3 splits
  - Ratios: [0.25, 0.5, 0.25] (25%, 50%, 25%)
  - Stages: ["Basal", "at Tillering", "at Panicle"]
- **K Splits**: 2 splits
  - Ratios: [0.5, 0.5] (50%, 50%)
  - Stages: ["Basal", "at Panicle"]

---

## 📝 **Note**
The web search did not find the specific book "Telangana Vyasaya Panchagam". 

**To update the values, please provide:**
1. The crop split ratios from the book (N and K split percentages)
2. Updated NPK recommendations for Telangana regions
3. Any changes to preferred Gromor combinations

**Files that will be updated:**
- `data/location-crop-recommendations.json` - For NPK values by location
- `data/crops.json` - For crop split ratios
- `data/locations.json` - For preferred combinations (if changed)












