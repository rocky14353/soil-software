# Complete Entity Documentation
## NPK Fertilizer Recommendation System

This document lists all entities, data structures, and concepts used in the Soil Test - NPK Fertilizer Recommendation System.

---

## 1. INPUT ENTITIES (Form Data)

### Required Inputs
- **Crop** (string): Selected crop name
  - Examples: "Paddy lowland", "Maize", "Wheat", "Turmeric", etc.
  - Total: 41+ crops supported

- **Organic Carbon (%)** (number): Soil organic carbon percentage
  - Range: 0-5%
  - Used for: Nitrogen classification

- **Nitrogen (kg/acre)** (number): Available soil nitrogen
  - Unit: kg/acre
  - Used for: Nutrient analysis and classification

- **Phosphorus P2O5 (kg/acre)** (number): Available soil phosphorus
  - Unit: kg/acre (as P2O5)
  - Used for: Nutrient analysis, classification, and P2O5 recommendations

- **Potassium K2O (kg/acre)** (number): Available soil potassium
  - Unit: kg/acre (as K2O)
  - Used for: Nutrient analysis, classification, and K2O recommendations

### Optional Inputs
- **Season** (string): Growing season
  - Values: "Kharif", "Rabi", "Summer", "Perennial"
  - Default: "Rabi"

- **Field Type** (string): Irrigation status
  - Values: "Irrigated", "Rainfed"
  - Default: "Irrigated"

- **Location/Area** (string): Geographic location
  - Values: 
    - "GODAVARI DELTA"
    - "KRI-DELTA & L soils"
    - "NORTH COASTAL"
    - "SOUTH MANDL"
    - "NORTH TELENGANA"
    - "SOUTH TELENGANA"
    - "LOW RAINFALL AREA"
    - "High altitude Area"

- **Sulfur (ppm)** (number): Available sulfur
  - Unit: ppm (parts per million)
  - Used for: Nutrient analysis and classification

- **pH** (number): Soil pH value
  - Range: 0-14
  - Used for: Soil acidity/alkalinity classification

- **Gromor Combination** (string): Preferred fertilizer combination
  - Values: "1", "2", "3", "4", "5", "6", or "Auto-select based on Location"
  - Auto-selected based on location if not specified

- **Fertilizer Preferences** (object): Preferences for each fertilizer type
  - Keys: "pref_Urea", "pref_A.S", "pref_C.A.N", "pref_MOP", "pref_SOP"
  - Values: "Optional", "Mandatory", "Reject"

---

## 2. CLASSIFICATION ENTITIES

### Nutrient Status Classifications
- **Nitrogen Status** (string): Based on Organic Carbon
  - Values: "low", "medium", "high"
  - Thresholds:
    - Low: OC < 0.5% (N < 113 kg/acre)
    - Medium: 0.5% ≤ OC ≤ 0.75% (113-226 kg/acre)
    - High: OC > 0.75% (N > 226 kg/acre)

- **Phosphorus Status** (string): Based on P2O5 value
  - Values: "low", "medium", "high"
  - Thresholds:
    - Low: P2O5 < 10 kg/acre
    - Medium: 10 ≤ P2O5 ≤ 24 kg/acre
    - High: P2O5 > 24 kg/acre

- **Potassium Status** (string): Based on K2O value
  - Values: "low", "medium", "high"
  - Thresholds:
    - Low: K2O < 58 kg/acre
    - Medium: 59 ≤ K2O ≤ 138 kg/acre
    - High: K2O > 138 kg/acre

- **Sulfur Status** (string): Based on sulfur ppm
  - Values: "low", "medium", "high"
  - Thresholds:
    - Low: S < 10 ppm
    - Medium: 10 ≤ S ≤ 15 ppm
    - High: S > 15 ppm

- **pH Classification** (string): Based on pH value
  - Values: "stronglyAcidic", "mediumAcidic", "slightlyAcidic", "neutral", "slightlyAlkaline", "moderatelyAlkaline", "highlyAlkaline"
  - Thresholds:
    - Strongly Acidic: pH ≤ 5.5
    - Medium Acidic: 5.6 ≤ pH ≤ 6.0
    - Slightly Acidic: 6.1 ≤ pH ≤ 6.5
    - Neutral: 6.6 ≤ pH ≤ 7.3
    - Slightly Alkaline: 7.4 ≤ pH ≤ 7.8
    - Moderately Alkaline: 7.9 ≤ pH ≤ 8.4
    - Highly Alkaline: 8.5 ≤ pH ≤ 14

---

## 3. CROP ENTITIES

### Crop Data Structure
```javascript
{
  "CropName": {
    "irrigated": {
      "kharif": { ... },
      "rabi": { ... },
      "summer": { ... }
    },
    "rainfed": {
      "kharif": { ... },
      "rabi": { ... }
    }
  }
}
```

### Crop Properties
- **n** (number): Recommended Nitrogen in kg/acre
- **p** (number): Recommended Phosphorus (P2O5) in kg/acre
- **k** (number): Recommended Potassium (K2O) in kg/acre
- **splits** (object): Split application schedule
  - **n** (object): Nitrogen split schedule
    - **count** (number): Number of split applications
    - **ratios** (array): Array of ratios for each split (sums to 1.0)
    - **stages** (array): Stage names for each split
  - **k** (object): Potassium split schedule
    - **count** (number): Number of split applications
    - **ratios** (array): Array of ratios for each split
    - **stages** (array): Stage names for each split

### Supported Crops (41+)
- Paddy Upland, Paddy Mediumland, Paddy lowland
- Maize, Jowar, Bajra, Fingermillet (Ragi), Korra, Variga
- Cow Pea, Redgram, Green Gram, Black Gram, Bengal Gram
- Soyabean, Groundnut, Mustard, Sunflower, Sesamum, Castor, Niger, Saff Flower
- Jute, Sugarcane, Wheat
- Betalvine, Ladiesfinger (Bhindi), Brinjal, Sweet potato, Pumpkin, Spine gourd, Gerkin (Coccinia), Pointed gourd
- Onion, Chillie, Garlic, Ginger, Turmeric, Tomato
- Cauliflower, Cabbage, French bean, Pea, Carrot, Radish, Capsicum
- Pineapple, Potato
- American Varieties/Cotton, Desi Varieties/Cotton

---

## 4. LOCATION ENTITIES

### Location Preferences
```javascript
{
  "locationPreferences": {
    "LOCATION_NAME": {
      "preferredCombination": number,  // 1-6
      "description": string
    }
  }
}
```

### Location-Based Recommendations
```javascript
{
  "CROP-SEASON": {
    "LOCATION_NAME": {
      "normal": { "n": number, "p": number, "k": number },
      "nStatus": { "low": number, "medium": number, "high": number },
      "pStatus": { "low": number, "medium": number, "high": number },
      "kStatus": { "low": number, "medium": number, "high": number },
      "gromorByPStatus": {
        "low": { "14-35-14": number, "28-28-0": number, ... },
        "medium": { ... },
        "high": { ... }
      }
    }
  }
}
```

### Supported Locations (8)
1. GODAVARI DELTA
2. KRI-DELTA & L soils
3. NORTH COASTAL
4. SOUTH MANDL
5. NORTH TELENGANA
6. SOUTH TELENGANA
7. LOW RAINFALL AREA
8. High altitude Area

---

## 5. FERTILIZER ENTITIES

### Gromor Complex Fertilizers (6 Products)
1. **14-35-14**: NPK ratio 14:35:14
2. **28-28-0**: NPK ratio 28:28:0
3. **20-20-0-13**: NPK ratio 20:20:0 with 13% S (Sulfur)
4. **10-26-26**: NPK ratio 10:26:26
5. **16-20-0-13**: NPK ratio 16:20:0 with 13% S
6. **SSP** (Single Super Phosphate): Used for P2O5 supplementation

### Straight Fertilizers (5 Products)
1. **Urea**: 46% N
2. **A.S** (Ammonium Sulphate): 21% N, 24% S
3. **C.A.N** (Calcium Ammonium Nitrate): 25% N
4. **MOP** (Muriate of Potash): 60% K2O
5. **SOP** (Sulphate of Potash): 50% K2O, 18% S

### Fertilizer Combinations (6)
1. **Combination 1**: 28-28-0 (basal) + 20-20-0 (1st top) + Urea + MOP
2. **Combination 2**: 14-35-14 + 20-20-0
3. **Combination 3**: 14-35-14 + 28-28-0
4. **Combination 4**: 28-28-0 + 10-26-26
5. **Combination 5**: 28-28-0 + 16-20-0
6. **Combination 6**: 14-35-14 + 16-20-0

### Fertilizer Product Data Structure
```javascript
{
  "fertilizerProducts": {
    "ProductName": {
      "n": number,      // % Nitrogen
      "p2o5": number,   // % P2O5
      "k2o": number,    // % K2O
      "s": number       // % Sulfur (if applicable)
    }
  }
}
```

---

## 6. CONVERSION ENTITIES

### P2O5 to Gromor Conversion Tables
```javascript
{
  "p2o5ToGromor": {
    "ProductName": [
      {
        "p2o5": number,    // Required P2O5 in kg/acre
        "dose": number,    // Fertilizer dose in kg/acre
        "n": number,       // N contribution from this dose
        "k": number        // K contribution (if applicable)
      }
    ]
  }
}
```

### N to Straight Fertilizer Conversion
```javascript
{
  "nToStraight": {
    "Urea": number,        // kg fertilizer per kg N
    "A.S": number,         // kg fertilizer per kg N
    "C.A.N": number        // kg fertilizer per kg N
  }
}
```

### K2O to Straight Fertilizer Conversion
```javascript
{
  "k2oToStraight": {
    "MOP": number,         // kg fertilizer per kg K2O
    "SOP": number          // kg fertilizer per kg K2O
  }
}
```

---

## 7. RECOMMENDATION ENTITIES

### Recommendation Stage Structure
```javascript
{
  "stage": string,           // Stage name (e.g., "Basal", "at Tillering")
  "fertilizers": [
    {
      "name": string,        // Fertilizer product name
      "quantity": number,    // Quantity in kg/acre
      "bags": string,        // Rounded to bags (e.g., "2.5 bags (50kg)")
      "nutrients": {
        "n": number,         // N contribution in kg/acre
        "p2o5": number,      // P2O5 contribution in kg/acre
        "k2o": number        // K2O contribution in kg/acre
      }
    }
  ]
}
```

### Results Object Structure
```javascript
{
  "recommendations": [       // Array of stage objects
    { stage: "...", fertilizers: [...] },
    ...
  ],
  "nutrientAnalysis": {
    "nitrogen": {
      "value": number,       // Input value in kg/acre
      "status": string,      // "low", "medium", "high"
      "classification": string
    },
    "phosphorus": { ... },
    "potassium": { ... },
    "sulfur": {
      "value": number,       // Input value in ppm
      "status": string,
      "classification": string
    }
  },
  "crop": string,
  "season": string,
  "fieldType": string,
  "location": string,
  "combination": {
    "name": string,
    "description": string,
    "products": [string]
  },
  "soilTestStatus": {
    "nStatus": string,
    "pStatus": string,
    "kStatus": string,
    "sStatus": string
  },
  "totals": {
    "n": number,            // Total recommended N in kg/acre
    "p": number,            // Total recommended P2O5 in kg/acre
    "k": number             // Total recommended K2O in kg/acre
  },
  "recommendedBasedOn": {
    "nStatus": string,
    "pStatus": string,
    "kStatus": string
  }
}
```

---

## 8. CALCULATION ENTITIES

### Per-Split Requirements
- **nPerSplit** (array): Array of N requirements for each split in kg/acre
- **kPerSplit** (array): Array of K2O requirements for each split in kg/acre
- **pTotal** (number): Total P2O5 requirement in kg/acre

### Location-Based Recommendation Object
```javascript
{
  "n": number,              // Recommended N based on nStatus
  "p": number,              // Recommended P2O5 based on pStatus
  "k": number,              // Recommended K2O based on kStatus
  "gromorByPStatus": {
    "low": { ... },
    "medium": { ... },
    "high": { ... }
  }
}
```

### Fertilizer Contribution Tracking
- **nFromGromor** (number): N contributed by Gromor products
- **pFromGromor** (number): P2O5 contributed by Gromor products
- **kFromGromor** (number): K2O contributed by Gromor products
- **nBalance** (number): Remaining N to be supplied by straight fertilizers
- **kBalance** (number): Remaining K2O to be supplied by straight fertilizers

---

## 9. BAG ROUNDING ENTITIES

### Bag Rounding Logic
- **Standard Bag Size**: 50 kg
- **Rounding Options**:
  - Full bag: 50 kg
  - Half bag: 25 kg
  - Quarter bag: 12.5 kg
- **Rounding Function**: Rounds to nearest practical bag fraction

### Bag Display Format
- Format: `"X.Y bags (50kg)"` where X.Y is the rounded quantity
- Examples:
  - 50 kg → "1 bag (50kg)"
  - 75 kg → "1.5 bags (50kg)"
  - 37.5 kg → "0.75 bags (50kg)"

---

## 10. DATA FILE ENTITIES

### JSON Data Files
1. **crops.json**: Crop master data with NPK recommendations and split schedules
2. **fertilizer-conversion.json**: Conversion tables for P2O5→Gromor, N→Straight, K2O→Straight
3. **locations.json**: Location preferences and combination definitions
4. **soil-test-classification.json**: Classification thresholds for N, P, K, S, pH
5. **location-crop-recommendations.json**: Location-wise, crop-wise, season-wise NPK recommendations

---

## 11. UNIT ENTITIES

### Measurement Units Used
- **Nitrogen (N)**: kg/acre
- **Phosphorus (P2O5)**: kg/acre
- **Potassium (K2O)**: kg/acre
- **Sulfur (S)**: ppm (parts per million)
- **Organic Carbon**: % (percentage)
- **pH**: dimensionless (0-14 scale)
- **Fertilizer Quantities**: kg/acre
- **Bag Size**: 50 kg (standard)

---

## 12. DISPLAY ENTITIES

### UI Display Sections
1. **Nutrient Analysis Card**: Shows input values with classification
2. **Fertilizer Application Schedule**: Stage-wise recommendations
3. **Total Requirements Card**: Summary of total NPK needed
4. **Combination Information**: Selected Gromor combination details
5. **Soil Test Status**: Classification status for each nutrient

### CSS Classes for Classification
- `.low`: Red styling for low nutrient status
- `.medium`: Yellow/Orange styling for medium nutrient status
- `.high`: Green styling for high nutrient status

---

## 13. FUNCTION ENTITIES

### Core Calculation Functions
- `classifyNitrogenByOC(oc)`: Classifies N status based on Organic Carbon
- `classifyPhosphorus(p2o5)`: Classifies P status based on P2O5 value
- `classifyPotassium(k2o)`: Classifies K status based on K2O value
- `classifySulfur(sulfur)`: Classifies S status based on ppm value
- `getCropData(crop, season, fieldType)`: Retrieves crop-specific data
- `getLocationBasedRecommendation(...)`: Gets location-based NPK recommendations
- `convertP2O5ToGromorDirect(p2o5, product, pStatus, locationRec)`: Converts P2O5 to Gromor product
- `convertNToStraight(n, product)`: Converts N requirement to straight fertilizer
- `convertK2OToStraight(k2o, product)`: Converts K2O requirement to straight fertilizer
- `roundToBags(quantity)`: Rounds fertilizer quantity to bag fractions
- `calculateCombination1-6(...)`: Calculates recommendations for each combination
- `calculateRecommendations(formData)`: Main calculation function
- `displayResults(results)`: Renders results in HTML

---

## 14. ERROR ENTITIES

### Error Types
- **Crop Data Not Found**: When crop/season/fieldType combination doesn't exist
- **Location Data Not Found**: When location-based recommendation is missing
- **Invalid Input**: When required fields are missing or invalid
- **Calculation Error**: When fertilizer conversion fails

---

## SUMMARY

**Total Entity Categories**: 14
**Total Crops Supported**: 41+
**Total Locations**: 8
**Total Fertilizer Products**: 11 (6 Gromor + 5 Straight)
**Total Combinations**: 6
**Total Classification Levels**: 3 (Low, Medium, High) per nutrient
**Total Data Files**: 5 JSON files
**Total Units**: 7 different measurement units

This comprehensive entity documentation covers all aspects of the NPK Fertilizer Recommendation System.












