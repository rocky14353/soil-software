# Why Nitrogen Shows as LOW When N = 150 kg/acre

## 🔍 The Answer: Classification is Based on Organic Carbon, NOT Nitrogen Value

### Your Input:
- **Organic Carbon (OC)**: 0.4%
- **Nitrogen (N)**: 150 kg/acre
- **Result**: Nitrogen Status = **LOW** ✅

---

## 📊 How the System Classifies Nitrogen

### The Classification Logic (from script.js):

```javascript
function classifyNitrogenByOC(organicCarbon) {
    if (organicCarbon < 0.5) return 'low';      // OC < 0.5% = LOW
    if (organicCarbon <= 0.75) return 'medium'; // OC 0.5-0.75% = MEDIUM
    return 'high';                                // OC > 0.75% = HIGH
}
```

### Classification Table (from soil-test-classification.json):

| Nitrogen Status | Organic Carbon (OC) | Equivalent N Range (kg/acre) |
|----------------|---------------------|------------------------------|
| **LOW** | OC < 0.5% | Less than 113 kg/acre |
| **MEDIUM** | 0.5% ≤ OC ≤ 0.75% | 113 to 226 kg/acre |
| **HIGH** | OC > 0.75% | More than 226 kg/acre |

---

## 🎯 Why Your Result is LOW:

### Your Values:
- **OC = 0.4%** → Since 0.4 < 0.5, status = **LOW** ✅
- **N = 150 kg/acre** → This value is NOT used for classification

### The System Logic:
1. ✅ Reads Organic Carbon: **0.4%**
2. ✅ Checks: Is 0.4 < 0.5? **YES**
3. ✅ Returns: **"low"** status
4. ❌ Does NOT check the Nitrogen value (150 kg/acre)

---

## 💡 Why Organic Carbon is Used (Not Nitrogen Directly):

### Scientific Reason:
- **Organic Carbon (OC)** is a more reliable indicator of soil nitrogen availability
- OC represents the organic matter in soil, which is the primary source of nitrogen
- The relationship: Higher OC = Higher available nitrogen potential
- Direct nitrogen measurements can vary, but OC is more stable

### The Correlation:
- **OC < 0.5%** → Low organic matter → Low nitrogen availability → **LOW status**
- **OC 0.5-0.75%** → Medium organic matter → Medium nitrogen → **MEDIUM status**
- **OC > 0.75%** → High organic matter → High nitrogen → **HIGH status**

---

## 📋 Your Complete Classification:

| Parameter | Your Value | Status | Based On |
|-----------|------------|--------|----------|
| **Nitrogen** | 150 kg/acre | **LOW** | Organic Carbon (0.4%) |
| **Phosphorus** | 9 kg/acre | **LOW** | P2O5 value (< 10) |
| **Potassium** | 70 kg/acre | **MEDIUM** | K2O value (59-138) |
| **Sulfur** | 15 ppm | **MEDIUM** | S value (10-15) |
| **pH** | 7.4 | **Slightly Alkaline** | pH value |

---

## ✅ Summary:

**Why N = 150 kg/acre shows as LOW:**
- ✅ System uses **Organic Carbon (0.4%)** to classify nitrogen
- ✅ OC = 0.4% is **< 0.5%**, so status = **LOW**
- ✅ The nitrogen value (150 kg/acre) is **displayed but not used** for classification
- ✅ This is **correct behavior** according to your data files

**The nitrogen value (150 kg/acre) is:**
- Used for **display** in the results
- Used for **calculations** if needed
- **NOT used** for status classification (OC is used instead)

---

## 📝 Data File Reference:

**From `data/soil-test-classification.json`:**
```json
"nitrogen": {
  "basedOn": "organicCarbon",  // ← Classification based on OC
  "thresholds": {
    "low": {"ocMax": 0.5, "kgPerAcre": "Less than 113 Kg"},
    "medium": {"ocMin": 0.5, "ocMax": 0.75, "kgPerAcre": "113 to 226 Kg"},
    "high": {"ocMin": 0.75, "kgPerAcre": "more than 226 Kg"}
  }
}
```

**Key Point:** `"basedOn": "organicCarbon"` - This confirms classification uses OC, not N value directly.

---

## 🔄 If You Want Different Classification:

If you want the system to classify based on nitrogen value directly (150 kg/acre = MEDIUM), you would need to:
1. Change the classification function to use nitrogen value instead of OC
2. Update the logic in `classifyNitrogenByOC()` or create a new function
3. Modify the data file to indicate nitrogen should be classified directly

**But currently, the system is working as designed** - using Organic Carbon for nitrogen status classification.












