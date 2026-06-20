# 16 Soil Test Parameters - Names and Ranges

## Complete List of Soil Test Parameters

Based on **Software requirements for fert recommendations.txt**, here are all the soil test parameters:

### 1. **Soil Type**
- **Values**: Light, Medium, Heavy
- **Unit**: Categorical
- **Status**: ⚠️ Not currently implemented in system

### 2. **pH**
- **Unit**: 0-14 scale
- **Classifications**:
  - **Strongly Acidic**: ≤ 5.5
  - **Medium Acidic**: 5.6 - 6.0
  - **Slightly Acidic**: 6.1 - 6.5
  - **Neutral**: 6.6 - 7.3
  - **Slightly Alkaline**: 7.4 - 7.8
  - **Moderately Alkaline**: 7.9 - 8.4
  - **Highly Alkaline**: 8.5 - 14
- **Status**: ✅ Implemented

### 3. **EC (Electrical Conductivity)**
- **Unit**: dS/m (deciSiemens per meter)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented (mentioned for problematic soils)

### 4. **OC (Organic Carbon)**
- **Unit**: % (percentage)
- **Classifications** (used for N classification):
  - **LOW**: < 0.5%
  - **MEDIUM**: 0.5% - 0.75%
  - **HIGH**: > 0.75%
- **Status**: ✅ Implemented

### 5. **N (Nitrogen)**
- **Unit**: kg/acre
- **Classifications** (based on OC or direct N value):
  - **LOW**: < 113 kg/acre (or OC < 0.5%)
  - **MEDIUM**: 113 - 226 kg/acre (or OC 0.5% - 0.75%)
  - **HIGH**: > 226 kg/acre (or OC > 0.75%)
- **Status**: ✅ Implemented

### 6. **P (Phosphorus - P2O5)**
- **Unit**: kg/acre
- **Classifications**:
  - **LOW**: < 10 kg/acre
  - **MEDIUM**: 10 - 24 kg/acre
  - **HIGH**: > 24 kg/acre
- **Status**: ✅ Implemented

### 7. **K (Potassium - K2O)**
- **Unit**: kg/acre
- **Classifications**:
  - **LOW**: < 58 kg/acre
  - **MEDIUM**: 59 - 138 kg/acre
  - **HIGH**: > 138 kg/acre
- **Status**: ✅ Implemented

### 8. **S (Sulfur)**
- **Unit**: ppm (parts per million)
- **Classifications**:
  - **LOW**: 0 - 10 ppm
  - **MEDIUM**: 10 - 15 ppm
  - **HIGH**: > 15 ppm
- **Status**: ✅ Implemented

### 9. **Ca (Calcium)**
- **Unit**: kg/acre
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 10. **Mg (Magnesium)**
- **Unit**: kg/acre
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 11. **Zn (Zinc)**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 12. **Boron**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 13. **Mn (Manganese)**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 14. **Fe (Iron)**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 15. **Cu (Copper)**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 16. **Mo (Molybdenum)**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

### 17. **Cl (Chlorine/Chloride)**
- **Unit**: mg/kg soil (or ppm)
- **Classifications**: Low, Medium, High (ranges not specified in current data)
- **Status**: ⚠️ Not currently implemented

---

## 📊 Summary Table

| # | Parameter | Unit | Low/Medium/High Ranges | Status |
|---|-----------|------|------------------------|--------|
| 1 | Soil Type | Categorical | Light/Medium/Heavy | ⚠️ Not implemented |
| 2 | pH | 0-14 | 7 categories (see above) | ✅ Implemented |
| 3 | EC | dS/m | Not specified | ⚠️ Not implemented |
| 4 | OC | % | <0.5 / 0.5-0.75 / >0.75 | ✅ Implemented |
| 5 | N | kg/acre | <113 / 113-226 / >226 | ✅ Implemented |
| 6 | P (P2O5) | kg/acre | <10 / 10-24 / >24 | ✅ Implemented |
| 7 | K (K2O) | kg/acre | <58 / 59-138 / >138 | ✅ Implemented |
| 8 | S | ppm | 0-10 / 10-15 / >15 | ✅ Implemented |
| 9 | Ca | kg/acre | Not specified | ⚠️ Not implemented |
| 10 | Mg | kg/acre | Not specified | ⚠️ Not implemented |
| 11 | Zn | mg/kg | Not specified | ⚠️ Not implemented |
| 12 | Boron | mg/kg | Not specified | ⚠️ Not implemented |
| 13 | Mn | mg/kg | Not specified | ⚠️ Not implemented |
| 14 | Fe | mg/kg | Not specified | ⚠️ Not implemented |
| 15 | Cu | mg/kg | Not specified | ⚠️ Not implemented |
| 16 | Mo | mg/kg | Not specified | ⚠️ Not implemented |
| 17 | Cl | mg/kg | Not specified | ⚠️ Not implemented |

---

## ✅ Currently Implemented (5 parameters):
1. **pH** - Full classification with 7 categories
2. **OC (Organic Carbon)** - Used for N classification
3. **N (Nitrogen)** - Classification based on OC or direct value
4. **P (Phosphorus)** - P2O5 classification
5. **K (Potassium)** - K2O classification
6. **S (Sulfur)** - ppm classification

---

## ⚠️ Not Currently Implemented (11 parameters):
1. **Soil Type** (Light/Medium/Heavy)
2. **EC** (Electrical Conductivity)
3. **Ca** (Calcium)
4. **Mg** (Magnesium)
5. **Zn** (Zinc)
6. **Boron**
7. **Mn** (Manganese)
8. **Fe** (Iron)
9. **Cu** (Copper)
10. **Mo** (Molybdenum)
11. **Cl** (Chlorine)

---

## 📝 Notes:

- **Units**: NPK, Ca, Mg, S are in **kg/acre**
- **Micronutrients** (Zn, Boron, Mn, Fe, Cu, Mo, Cl) are in **mg/kg soil** (or ppm)
- **pH** is on 0-14 scale
- **EC** is in dS/m (deciSiemens per meter)
- **OC** is in percentage (%)

- **Current System**: Only 5-6 parameters are actively used for fertilizer recommendations
- **Future Enhancement**: Micronutrient recommendations can be added based on deficiency levels

---

## 🔍 Reference Files:
- **Software requirements**: `Software requirements for fert recommendations.txt`
- **Classification data**: `data/soil-test-classification.json`
- **CSV data**: `Data 3 - Soil test Parameters.csv`











