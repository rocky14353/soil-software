# Nitrogen Classification Values

## 📊 Nitrogen Status Classification (kg/acre)

Based on `data/soil-test-classification.json` and `script.js`:

| Status | Nitrogen Range (kg/acre) | Your Value: 150 kg/acre |
|--------|-------------------------|-------------------------|
| **LOW** | Less than 113 kg/acre | ❌ Not Low (150 > 113) |
| **MEDIUM** | 113 to 226 kg/acre | ✅ **MEDIUM** (150 is in range) |
| **HIGH** | More than 226 kg/acre | ❌ Not High (150 < 226) |

---

## 🔍 Detailed Breakdown:

### **LOW Status:**
- **Range:** < 113 kg/acre
- **Example:** 0, 50, 100, 112 kg/acre
- **Your value 150:** ❌ Not Low

### **MEDIUM Status:**
- **Range:** 113 to 226 kg/acre (inclusive)
- **Example:** 113, 150, 200, 226 kg/acre
- **Your value 150:** ✅ **MEDIUM** (150 is between 113-226)

### **HIGH Status:**
- **Range:** > 226 kg/acre
- **Example:** 227, 250, 300 kg/acre
- **Your value 150:** ❌ Not High

---

## 📝 Code Implementation:

```javascript
// From script.js - classifyNitrogenByOC()
if (nitrogen < 113) return 'low';        // LOW: < 113
if (nitrogen <= 226) return 'medium';   // MEDIUM: 113-226
return 'high';                           // HIGH: > 226
```

---

## ✅ Summary:

**For your value: 150 kg/acre**
- **Status:** ✅ **MEDIUM**
- **Range:** 113-226 kg/acre
- **Classification:** Correct ✅

---

## 📋 Complete Classification Table:

| Parameter | LOW | MEDIUM | HIGH |
|-----------|-----|--------|------|
| **Nitrogen (kg/acre)** | < 113 | 113-226 | > 226 |
| **Phosphorus (kg/acre)** | < 10 | 10-24 | > 24 |
| **Potassium (kg/acre)** | < 58 | 59-138 | > 138 |
| **Sulfur (ppm)** | 0-10 | 10-15 | > 15 |











