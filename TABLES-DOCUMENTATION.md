# Tables/Data Structures Created
## NPK Fertilizer Recommendation System

This document lists all the "tables" (JSON data structures) we created for the application. Since this is a web-based system using JSON files instead of a traditional SQL database, these JSON files function as our data tables.

---

## 📁 **Data Files Created (5 Main Tables)**

### 1. **`data/crops.json`** - Crop Master Table
**Purpose**: Stores crop-specific NPK recommendations and split application schedules

**Structure**:
```json
{
  "CropName": {
    "irrigated": {
      "kharif": { "n": number, "p": number, "k": number, "splits": {...} },
      "rabi": { "n": number, "p": number, "k": number, "splits": {...} },
      "summer": { "n": number, "p": number, "k": number, "splits": {...} }
    },
    "rainfed": {
      "kharif": { "n": number, "p": number, "k": number, "splits": {...} },
      "rabi": { "n": number, "p": number, "k": number, "splits": {...} }
    }
  }
}
```

**Key Fields**:
- `n`: Recommended Nitrogen (kg/acre)
- `p`: Recommended Phosphorus P2O5 (kg/acre)
- `k`: Recommended Potassium K2O (kg/acre)
- `splits.n`: Nitrogen split schedule (count, ratios, stages)
- `splits.k`: Potassium split schedule (count, ratios, stages)

**Records**: 41+ crops × multiple seasons × field types = **200+ records**

**Source**: Extracted from `N and K split crop wise.csv`

---

### 2. **`data/fertilizer-conversion.json`** - Fertilizer Conversion Tables
**Purpose**: Contains all conversion tables for converting nutrient requirements to fertilizer quantities

**Structure Contains**:

#### **Table 2.1: P2O5 to Gromor Conversion Table**
```json
{
  "p2o5ToGromor": {
    "14-35-14": [
      {"p2o5": 1, "dose": 2.9, "n": 0.4, "k": 0.4},
      {"p2o5": 2, "dose": 5.7, "n": 0.8, "k": 0.8},
      ...
    ],
    "28-28-0": [...],
    "20-20-0-13": [...],
    "10-26-26": [...],
    "16-20-0-13": [...],
    "SSP": [...]
  }
}
```

**Products**: 6 Gromor products (14-35-14, 28-28-0, 20-20-0-13, 10-26-26, 16-20-0-13, SSP)
**Rows per product**: ~15 rows (P2O5 values from 1 to 30 kg/acre)
**Total rows**: ~90 rows

#### **Table 2.2: N to Straight Fertilizer Conversion Table**
```json
{
  "nToStraight": {
    "urea": [
      {"n": 1, "qty": 2.2},
      {"n": 2, "qty": 4.3},
      {"n": 3, "qty": 6.5},
      ...
    ],
    "as": [...],
    "can": [...]
  }
}
```

**Products**: 3 straight N fertilizers (Urea, A.S, C.A.N)
**Rows per product**: ~17 rows (N values from 1 to 50 kg/acre)
**Total rows**: ~51 rows

#### **Table 2.3: K2O to Straight Fertilizer Conversion Table**
```json
{
  "k2oToStraight": {
    "mop": [
      {"k2o": 1, "qty": 1.7},
      {"k2o": 2, "qty": 3.3},
      ...
    ],
    "sop": [...]
  }
}
```

**Products**: 2 straight K fertilizers (MOP, SOP)
**Rows per product**: ~17 rows (K2O values from 1 to 50 kg/acre)
**Total rows**: ~34 rows

#### **Table 2.4: Conversion Factors Table**
```json
{
  "conversionFactors": {
    "urea": 2.2,
    "as": 4.9,
    "can": 3.8,
    "mop": 1.7,
    "sop": 2.0,
    "bagSize": 50,
    "acreToHectare": 2.471
  }
}
```

**Factors**: 7 conversion factors
**Rows**: 7 rows

#### **Table 2.5: Fertilizer Products Master Table**
```json
{
  "fertilizerProducts": {
    "ProductName": {
      "n": number,       // % Nitrogen
      "p2o5": number,    // % P2O5
      "k2o": number,     // % K2O
      "s": number        // % Sulfur (if applicable)
    }
  }
}
```

**Products**: 11 products (6 Gromor + 5 Straight)
**Rows**: 11 rows

**Source**: Extracted from `Soil Test based Gromor Recommendation (2).csv` and `Data1 - Direct nutrients.csv`

---

### 3. **`data/locations.json`** - Location Preferences & Combinations Table
**Purpose**: Stores location-based fertilizer combination preferences and combination definitions

**Structure Contains**:

#### **Table 3.1: Location Preferences Table**
```json
{
  "locationPreferences": {
    "LOCATION_NAME": {
      "preferredCombination": number,  // 1-6
      "description": string
    }
  }
}
```

**Locations**: 8 locations
- GODAVARI DELTA
- KRI-DELTA & L soils
- NORTH COASTAL
- SOUTH MANDL
- NORTH TELENGANA
- SOUTH TELENGANA
- LOW RAINFALL AREA
- High altitude Area

**Rows**: 8 rows

#### **Table 3.2: Fertilizer Combinations Master Table**
```json
{
  "combinations": {
    "1": {
      "name": "28-28-0 (basal) + 20-20-0 (1st top) + Urea + MOP",
      "products": ["28-28-0", "20-20-0-13", "Urea", "MOP"],
      "description": "..."
    },
    ...
  }
}
```

**Combinations**: 6 combinations (1-6)
**Rows**: 6 rows

**Source**: Extracted from `Software requirements for fert recommendations.txt`

---

### 4. **`data/soil-test-classification.json`** - Soil Test Classification Thresholds Table
**Purpose**: Defines classification thresholds for nutrient status (Low/Medium/High)

**Structure**:
```json
{
  "nitrogen": {
    "basedOn": "organicCarbon",
    "thresholds": {
      "low": {"ocMax": 0.5, "kgPerAcre": "Less than 113 Kg"},
      "medium": {"ocMin": 0.5, "ocMax": 0.75, "kgPerAcre": "113 to 226 Kg"},
      "high": {"ocMin": 0.75, "kgPerAcre": "more than 226 Kg"}
    },
    "directThresholds": {
      "low": 113,
      "medium": 226
    }
  },
  "phosphorus": {
    "thresholds": {
      "low": {"max": 10, "kgPerAcre": "less than 10 Kg"},
      "medium": {"min": 10, "max": 24, "kgPerAcre": "10 to 24 Kg"},
      "high": {"min": 24, "kgPerAcre": "Above 24 Kg"}
    }
  },
  "potassium": {
    "thresholds": {
      "low": {"max": 58, "kgPerAcre": "less than 58 Kg"},
      "medium": {"min": 59, "max": 138, "kgPerAcre": "59 to 138 Kg"},
      "high": {"min": 138, "kgPerAcre": "Above 138 Kg"}
    }
  },
  "sulfur": {
    "thresholds": {
      "low": {"max": 10, "ppm": "0-10 ppm"},
      "medium": {"min": 10, "max": 15, "ppm": "10 to 15 ppm"},
      "high": {"min": 15, "ppm": "Above 15 ppm"}
    }
  },
  "ph": {
    "thresholds": {
      "stronglyAcidic": {"max": 5.5},
      "mediumAcidic": {"min": 5.6, "max": 6.0},
      ...
    }
  }
}
```

**Nutrients**: 5 nutrient classifications (N, P, K, S, pH)
**Rows**: 5 main sections with multiple threshold rows each

**Source**: Extracted from `Data 3 - Soil test Parameters.csv`

---

### 5. **`data/location-crop-recommendations.json`** - Location-Crop-Season Recommendations Table
**Purpose**: Stores location-wise, crop-wise, season-wise NPK recommendations based on soil test status

**Structure**:
```json
{
  "CROP-SEASON": {
    "LOCATION_NAME": {
      "normal": {"n": number, "p": number, "k": number},
      "nStatus": {
        "low": number,
        "medium": number,
        "high": number
      },
      "pStatus": {
        "low": number,
        "medium": number,
        "high": number
      },
      "kStatus": {
        "low": number,
        "medium": number,
        "high": number
      },
      "gromorByPStatus": {
        "low": {
          "14-35-14": number,
          "28-28-0": number,
          "20-20-0-13": number,
          "10-26-26": number,
          "16-20-0-13": number
        },
        "medium": {...},
        "high": {...}
      }
    }
  }
}
```

**Key Fields**:
- `normal`: Base NPK recommendations
- `nStatus`: N recommendations by N status (low/medium/high)
- `pStatus`: P recommendations by P status (low/medium/high)
- `kStatus`: K recommendations by K status (low/medium/high)
- `gromorByPStatus`: Gromor product recommendations by P status

**Crop-Season Combinations**: Multiple (e.g., PADDY-KHARIF, PADDY-RABI, etc.)
**Locations**: 8 locations per crop-season
**Rows**: ~100+ location-crop-season combinations

**Source**: Extracted from `Data 2 - Direct Gromor grades.csv`

---

## 📊 **Summary of All Tables**

| Table Name | File | Records | Purpose |
|------------|------|---------|---------|
| **Crop Master** | `crops.json` | 200+ | Crop NPK recommendations & splits |
| **P2O5 to Gromor** | `fertilizer-conversion.json` | ~90 | P2O5 conversion to Gromor products |
| **N to Straight** | `fertilizer-conversion.json` | ~51 | N conversion to straight fertilizers |
| **K2O to Straight** | `fertilizer-conversion.json` | ~34 | K2O conversion to straight fertilizers |
| **Conversion Factors** | `fertilizer-conversion.json` | 7 | Simple conversion factors |
| **Fertilizer Products** | `fertilizer-conversion.json` | 11 | Fertilizer product specifications |
| **Location Preferences** | `locations.json` | 8 | Location-based combination preferences |
| **Combinations Master** | `locations.json` | 6 | Fertilizer combination definitions |
| **Soil Classification** | `soil-test-classification.json` | 5 | Nutrient classification thresholds |
| **Location-Crop Recommendations** | `location-crop-recommendations.json` | 100+ | Location-wise NPK recommendations |

**Total Tables**: 10 logical tables (stored in 5 JSON files)
**Total Records**: ~500+ records across all tables

---

## 🔗 **Table Relationships**

```
Crop Master
    ↓
Location-Crop Recommendations (uses crop + season + location)
    ↓
Soil Classification (classifies input values)
    ↓
Fertilizer Conversion Tables (converts NPK to fertilizers)
    ↓
Location Preferences (selects combination)
    ↓
Combinations Master (defines combination products)
```

---

## 📝 **Additional Data Files**

### 6. **`data/location-crop-recommendations-full.json`** (Backup/Extended)
- Extended version of location-crop-recommendations.json
- May contain additional data or backup

---

## 🎯 **Table Usage in Application**

1. **User Input** → Classified using `soil-test-classification.json`
2. **Crop Selection** → Looked up in `crops.json`
3. **Location Selection** → Looked up in `location-crop-recommendations.json`
4. **NPK Recommendations** → Retrieved from `location-crop-recommendations.json` or `crops.json`
5. **Fertilizer Conversion** → Uses `fertilizer-conversion.json` tables
6. **Combination Selection** → Uses `locations.json` preferences
7. **Final Recommendations** → Generated using all tables

---

## 📦 **Data Sources (Original CSV Files)**

All tables were created by extracting and structuring data from:
1. `N and K split crop wise.csv` → `crops.json`
2. `Soil Test based Gromor Recommendation (2).csv` → `fertilizer-conversion.json`
3. `Data1 - Direct nutrients.csv` → `fertilizer-conversion.json` (N/K conversions)
4. `Data 2 - Direct Gromor grades.csv` → `location-crop-recommendations.json`
5. `Data 3 - Soil test Parameters.csv` → `soil-test-classification.json`
6. `Software requirements for fert recommendations.txt` → `locations.json`

---

This comprehensive table documentation covers all data structures used in the NPK Fertilizer Recommendation System.

