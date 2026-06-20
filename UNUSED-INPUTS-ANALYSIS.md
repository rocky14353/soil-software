# Inputs Collected But NOT Used in Logic/Calculations

## Analysis of All Form Inputs

### ✅ **INPUTS USED IN CALCULATIONS:**

1. **Crop** ✅
   - **Used for:** Crop data lookup, split schedules, base NPK recommendations
   - **Location in code:** `getCropData(crop, season, fieldType)`

2. **Organic Carbon (%)** ✅
   - **Used for:** Nitrogen status classification (N status based on OC)
   - **Location in code:** `classifyNitrogenByOC(organicCarbon)`
   - **Note:** This determines N status (low/medium/high), which affects recommendations

3. **Phosphorus P2O5 (kg/acre)** ✅
   - **Used for:** 
     - Phosphorus status classification (low/medium/high)
     - Affects location-based P recommendations
   - **Location in code:** `classifyPhosphorus(phosphorus)`, `getLocationBasedRecommendation(...)`

4. **Potassium K2O (kg/acre)** ✅
   - **Used for:**
     - Potassium status classification (low/medium/high)
     - Affects location-based K recommendations
   - **Location in code:** `classifyPotassium(potassium)`, `getLocationBasedRecommendation(...)`

5. **Season** ✅
   - **Used for:** Crop data lookup, location-based recommendations
   - **Location in code:** `getCropData(crop, season, fieldType)`, `getLocationBasedRecommendation(...)`

6. **Field Type** ✅
   - **Used for:** Crop data lookup (Irrigated vs Rainfed)
   - **Location in code:** `getCropData(crop, season, fieldType)`

7. **Location/Area** ✅
   - **Used for:** Location-based NPK recommendations, Gromor combination selection
   - **Location in code:** `getLocationBasedRecommendation(...)`, combination auto-selection

8. **Gromor Combination** ✅
   - **Used for:** Selecting which fertilizer combination to use (1-6)
   - **Location in code:** `calculateCombination1-6(...)`

9. **Fertilizer Preferences** ✅
   - **Used for:** Determining which fertilizers to include/exclude (Optional/Mandatory/Reject)
   - **Location in code:** `checkPreference(fertilizer, preferences)` - used throughout all combination functions
   - **Note:** If a fertilizer is set to "Reject", it won't be included in recommendations

---

## ❌ **INPUTS COLLECTED BUT NOT USED IN CALCULATIONS:**

### 1. **Nitrogen (kg/acre)** ❌
   - **Collected:** Yes (required field)
   - **Used in calculations:** ❌ NO
   - **What it's used for:**
     - ✅ Display in Nutrient Analysis section
     - ✅ Classification display (but classification is based on OC, not N value)
   - **Why not used:**
     - N recommendations come from location-based data or crop master data
     - N status is determined by Organic Carbon, NOT by the input nitrogen value
     - The input nitrogen value does NOT adjust the recommended N amounts
   - **Code evidence:**
     ```javascript
     // N status is based on OC, not nitrogen value:
     const nStatus = classifyNitrogenByOC(organicCarbon);
     
     // Recommended N comes from location/crop data, not input:
     const recommendedN = locationRec ? locationRec.n : cropData.n;
     ```

### 2. **Sulfur (ppm)** ❌
   - **Collected:** Yes (optional field)
   - **Used in calculations:** ❌ NO
   - **What it's used for:**
     - ✅ Display in Nutrient Analysis section
     - ✅ Classification (low/medium/high)
     - ❌ Does NOT affect fertilizer recommendations
     - ❌ Does NOT adjust NPK amounts
   - **Why not used:**
     - Sulfur classification is only for informational purposes
     - No sulfur-based fertilizer adjustments are made
     - No sulfur recommendations are generated
   - **Code evidence:**
     ```javascript
     const sStatus = classifySulfur(sulfur); // Only for display
     // No usage of sStatus in recommendation calculations
     ```

### 3. **pH** ❌
   - **Collected:** Yes (optional field)
   - **Used in calculations:** ❌ NO
   - **What it's used for:**
     - ✅ Display in Nutrient Analysis section
     - ✅ Classification (strongly acidic, neutral, alkaline, etc.)
     - ✅ pH-based recommendations/advisories (lime, gypsum suggestions)
     - ❌ Does NOT affect NPK fertilizer recommendations
     - ❌ Does NOT adjust fertilizer quantities
   - **Why not used:**
     - pH recommendations are advisory only (lime/gypsum suggestions)
     - pH does NOT change the NPK fertilizer amounts calculated
     - pH does NOT affect which fertilizers are selected
   - **Code evidence:**
     ```javascript
     const phStatus = classifyPh(ph); // Only for display and advisories
     const phRecommendations = getPhRecommendations(phStatus); // Advisory only
     // No usage of phStatus in NPK calculation logic
     ```

---

## 📊 **Summary Table**

| Input Field | Collected | Used in Calculations | Used For Display | Used For Classification | Affects Recommendations |
|-------------|-----------|---------------------|------------------|------------------------|------------------------|
| Crop | ✅ | ✅ | ✅ | - | ✅ |
| Organic Carbon | ✅ | ✅ | ✅ | ✅ (N status) | ✅ |
| Nitrogen | ✅ | ❌ | ✅ | ❌ (uses OC instead) | ❌ |
| Phosphorus | ✅ | ✅ | ✅ | ✅ | ✅ |
| Potassium | ✅ | ✅ | ✅ | ✅ | ✅ |
| Season | ✅ | ✅ | ✅ | - | ✅ |
| Field Type | ✅ | ✅ | ✅ | - | ✅ |
| Location | ✅ | ✅ | ✅ | - | ✅ |
| Sulfur | ✅ | ❌ | ✅ | ✅ | ❌ |
| pH | ✅ | ❌ | ✅ | ✅ | ❌ (advisory only) |
| Gromor Combination | ✅ | ✅ | ✅ | - | ✅ |
| Fertilizer Preferences | ✅ | ✅ | ✅ | - | ✅ |

---

## 🔍 **Key Findings:**

1. **Nitrogen input value is NOT used** - Only Organic Carbon determines N status and recommendations
2. **Sulfur input is informational only** - No sulfur-based fertilizer adjustments
3. **pH input is advisory only** - Provides lime/gypsum suggestions but doesn't affect NPK calculations

## 💡 **Recommendations:**

If you want to use these inputs in calculations:

1. **Nitrogen Value:**
   - Could be used to adjust recommended N if soil N is very high
   - Currently, recommendations are based solely on location/crop data and OC-based status

2. **Sulfur Value:**
   - Could trigger sulfur-containing fertilizer selection (A.S, SOP, 20-20-0-13, 16-20-0-13)
   - Currently, sulfur fertilizers are selected based on combination, not soil S status

3. **pH Value:**
   - Could adjust fertilizer selection (e.g., avoid acidifying fertilizers in acidic soils)
   - Could affect micronutrient recommendations
   - Currently, only provides advisory text

---

**Last Updated:** Based on code analysis of `script.js` (lines 1220-1527)












