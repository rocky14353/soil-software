# Detailed Calculation Trace for Your Input

## Input Data
- **Crop:** Paddy lowland
- **Nitrogen:** 100 kg/ha
- **Phosphorus:** 50 kg/ha
- **Potassium:** 180 kg/ha
- **Season:** Kharif
- **Field Type:** Irrigated
- **Location:** NORTH COASTAL
- **Sulfur:** 9 kg/ha

---

## Step 1: Unit Conversion (kg/ha → kg/acre)

**Conversion Factor:** 1 hectare = 2.471 acres

- **N:** 100 kg/ha ÷ 2.471 = **40.5 kg/acre**
- **P:** 50 kg/ha ÷ 2.471 = **20.2 kg/acre**
- **K:** 180 kg/ha ÷ 2.471 = **72.8 kg/acre**

---

## Step 2: Base Recommendation Lookup

**From crop master data (Paddy lowland, Irrigated, Rabi):**
- Base N: 40 kg/acre
- Base P: 20 kg/acre
- Base K: 20 kg/acre

**Logic Applied:**
```javascript
recommendedN = Math.max(inputN, baseN) = Math.max(40.5, 40) = 40.5 kg/acre
recommendedP = Math.max(inputP, baseP) = Math.max(20.2, 20) = 20.2 kg/acre
recommendedK = Math.max(inputK, baseK) = Math.max(72.8, 20) = 72.8 kg/acre
```

**Final Recommendations:**
- **N:** 40.5 kg/acre (uses soil test value as it's higher)
- **P:** 20.2 kg/acre (uses soil test value as it's higher)
- **K:** 72.8 kg/acre (uses soil test value as it's much higher)

---

## Step 3: Split Application Schedule

**From crop data (Paddy lowland):**
- **N Splits:** 3 splits with ratios [0.25, 0.5, 0.25]
- **K Splits:** 2 splits with ratios [0.5, 0.5]
- **Stages:** ["Basal", "at Tillering", "at Panicle"]

**Per-Split Calculations:**

### Nitrogen (N) Splits:
- **Basal (25%):** 40.5 × 0.25 = **10.1 kg/acre**
- **Tillering (50%):** 40.5 × 0.5 = **20.3 kg/acre**
- **Panicle (25%):** 40.5 × 0.25 = **10.1 kg/acre**

### Potassium (K) Splits:
- **Basal (50%):** 72.8 × 0.5 = **36.4 kg/acre**
- **Panicle (50%):** 72.8 × 0.5 = **36.4 kg/acre**

### Phosphorus (P):
- **All at Basal:** 20.2 kg/acre (P is always applied at basal)

---

## Step 4: Gromor Combination Selection

**Location:** NORTH COASTAL
**Auto-selected Combination:** Combination 3 (14-35-14 + 28-28-0)

**From locations.json:**
```json
"NORTH COASTAL": {
  "preferredCombination": 3,
  "description": "14-35-14 + 28-28-0"
}
```

---

## Step 5: Fertilizer Conversion (Combination 3 Logic)

### Stage 1: Basal Application

**Requirements:**
- N: 10.1 kg/acre
- P: 20.2 kg/acre
- K: 36.4 kg/acre

**Using 14-35-14 for Basal:**

**P2O5 to 14-35-14 Conversion:**
- Required P2O5: 20.2 kg/acre
- From conversion table: For 20 kg P2O5 → 57.1 kgs of 14-35-14
- Interpolated for 20.2 kg: **57.7 kgs of 14-35-14**

**Nutrients from 14-35-14:**
- N provided: (57.7 × 14) / 100 = **8.1 kg/acre**
- P provided: 20.2 kg/acre (meets requirement)
- K provided: (57.7 × 14) / 100 = **8.1 kg/acre**

**Remaining Requirements:**
- N remaining: 10.1 - 8.1 = **2.0 kg/acre**
- K remaining: 36.4 - 8.1 = **28.3 kg/acre**

**Additional Fertilizers:**
- **Urea for N:** 2.0 × 2.2 = **4.4 kgs** (rounded to nearest bag)
- **MOP for K:** 28.3 × 1.7 = **48.1 kgs** (rounded to nearest bag)

**Stage 1 Summary:**
- Gromor 14-35-14: 57.7 kgs (1.15 bags = 1 bag + 0.15 bag)
- Urea: 4.4 kgs (0.1 bag)
- MOP: 48.1 kgs (0.96 bags = 1 bag)

---

### Stage 2: First Top Dressing (at Tillering)

**Requirements:**
- N: 20.3 kg/acre
- K: 0 kg/acre (K already applied at basal and panicle)

**Using 28-28-0 for First Top:**

**P2O5 to 28-28-0 Conversion:**
- Use part of N requirement for P: 20.3 × 0.3 = 6.1 kg P2O5 equivalent
- For 6 kg P2O5 → 21.4 kgs of 28-28-0
- Interpolated: **21.7 kgs of 28-28-0**

**Nutrients from 28-28-0:**
- N provided: (21.7 × 28) / 100 = **6.1 kg/acre**
- P provided: (21.7 × 28) / 100 = **6.1 kg/acre**

**Remaining N:**
- N remaining: 20.3 - 6.1 = **14.2 kg/acre**

**Additional Fertilizer:**
- **Urea:** 14.2 × 2.2 = **31.2 kgs** (0.62 bags)

**Stage 2 Summary:**
- Gromor 28-28-0: 21.7 kgs (0.43 bags)
- Urea: 31.2 kgs (0.62 bags)

---

### Stage 3: Second Top Dressing (at Panicle)

**Requirements:**
- N: 10.1 kg/acre
- K: 36.4 kg/acre

**Straight Fertilizers:**
- **Urea for N:** 10.1 × 2.2 = **22.2 kgs** (0.44 bags)
- **MOP for K:** 36.4 × 1.7 = **61.9 kgs** (1.24 bags = 1 bag + 0.24 bag)

**Stage 3 Summary:**
- Urea: 22.2 kgs (0.44 bags)
- MOP: 61.9 kgs (1.24 bags)

---

## Step 6: Bag Rounding

**Bag Size:** 50 kgs

**Final Rounded Values:**

### Stage 1 (Basal):
- Gromor 14-35-14: 57.7 kgs → **60 kgs (1.2 bags)** or **50 kgs (1 bag)**
- Urea: 4.4 kgs → **12.5 kgs (0.25 bag)**
- MOP: 48.1 kgs → **50 kgs (1 bag)**

### Stage 2 (Tillering):
- Gromor 28-28-0: 21.7 kgs → **25 kgs (0.5 bag)**
- Urea: 31.2 kgs → **25 kgs (0.5 bag)** or **37.5 kgs (0.75 bag)**

### Stage 3 (Panicle):
- Urea: 22.2 kgs → **25 kgs (0.5 bag)**
- MOP: 61.9 kgs → **62.5 kgs (1.25 bags)**

---

## Step 7: Nutrient Classification

**Thresholds:**
- N: Low < 150, Medium 150-400, High > 400
- P: Low < 12, Medium 12-35, High > 35
- K: Low < 80, Medium 80-250, High > 250

**Your Values (kg/ha):**
- N: 100 → **LOW** (< 150)
- P: 50 → **HIGH** (> 35)
- K: 180 → **MEDIUM** (80-250)

---

## Final Recommendation Summary

### Selected Combination:
**Combination 3: 14-35-14 + 28-28-0**

### Stage-wise Application:

**Stage 1: Basal**
- Gromor 14-35-14: ~58 kgs (1 bag)
- Urea: ~4-5 kgs (0.1 bag)
- MOP: ~48-50 kgs (1 bag)

**Stage 2: at Tillering**
- Gromor 28-28-0: ~22 kgs (0.5 bag)
- Urea: ~31 kgs (0.6 bag)

**Stage 3: at Panicle**
- Urea: ~22 kgs (0.4 bag)
- MOP: ~62 kgs (1.25 bags)

### Total Requirements:
- **N:** 40.5 kg/acre
- **P:** 20.2 kg/acre
- **K:** 72.8 kg/acre

---

## Key Logic Points:

1. **Unit Conversion:** Always converts kg/ha to kg/acre for internal calculations
2. **Base vs Input:** Uses maximum of soil test value and base recommendation
3. **Split Application:** Follows crop-specific split ratios from master data
4. **Location-based Selection:** Auto-selects combination based on location preference
5. **Fertilizer Conversion:** Uses interpolation from conversion tables for accuracy
6. **Bag Rounding:** Rounds to nearest Full/Half/Quarter bag (50 kg bags)
7. **Nutrient Classification:** Classifies based on standard thresholds













