# 150 kg/acre Nitrogen - Status Classification

## 📊 According to Your Data Files

### **Soil Test Classification (from soil-test-classification.json)**

| Nitrogen Status | Range (kg/acre) | Your Value: 150 kg/acre |
|----------------|-----------------|-------------------------|
| **LOW** | Less than 113 kg/acre | ❌ Not Low |
| **MEDIUM** | 113 to 226 kg/acre | ✅ **MEDIUM STATUS** |
| **HIGH** | More than 226 kg/acre | ❌ Not High |

**Result: 150 kg/acre = MEDIUM Nitrogen Status**

---

## ⚠️ Important Distinction:

### **If 150 kg/acre is SOIL TEST VALUE (Nitrogen in soil):**
- ✅ **MEDIUM Status** (113-226 kg/acre range)
- This means your soil has medium nitrogen content
- Recommendation would be: **48 kg/acre** (for most Rabi paddy regions)

### **If 150 kg/acre is FERTILIZER RECOMMENDATION (Nitrogen to apply):**
- ❌ **VERY HIGH** - Exceeds all standard recommendations
- Normal recommendation: 24-48 kg/acre
- Maximum low N status: 53-85 kg/acre
- **150 kg/acre is 3-6x higher than normal!**

---

## 📋 Complete Classification Table (from data/soil-test-classification.json)

### Nitrogen Status Classification

| Status | Organic Carbon (OC) | Nitrogen in Soil (kg/acre) | Your Value |
|--------|---------------------|---------------------------|------------|
| **LOW** | OC < 0.5% | Less than 113 kg/acre | ❌ 150 > 113 |
| **MEDIUM** | 0.5% ≤ OC ≤ 0.75% | 113 to 226 kg/acre | ✅ **150 is MEDIUM** |
| **HIGH** | OC > 0.75% | More than 226 kg/acre | ❌ 150 < 226 |

---

## 📊 Fertilizer Recommendations by Status (from location-crop-recommendations.json)

### PADDY - KHARIF

| Location | Normal N | Low N Status | Medium N Status | High N Status |
|----------|----------|--------------|-----------------|---------------|
| GODAVARI DELTA | 24 | 32 | 24 | 16 |
| KRI-DELTA & L soils | 32 | 43 | 32 | 21 |
| NORTH COASTAL | 32 | 43 | 32 | 21 |
| SOUTH MANDL | 32 | 43 | 32 | 21 |
| NORTH TELENGANA | 40 | 53 | 40 | 27 |
| SOUTH TELENGANA | 48 | 64 | 48 | 32 |
| LOW RAINFALL AREA | 64 | 85 | 64 | 43 |
| High altitude Area | 32 | 43 | 32 | 21 |

### PADDY - RABI

| Location | Normal N | Low N Status | Medium N Status | High N Status |
|----------|----------|--------------|-----------------|---------------|
| GODAVARI DELTA | 48 | 64 | 48 | 32 |
| KRI-DELTA & L soils | 48 | 64 | 48 | 32 |
| NORTH COASTAL | 48 | 64 | 48 | 32 |
| SOUTH MANDL | 48 | 64 | 48 | 32 |
| NORTH TELENGANA | 48 | 64 | 48 | 32 |
| SOUTH TELENGANA | 48 | 64 | 48 | 32 |
| LOW RAINFALL AREA | 64 | 85 | 64 | 43 |
| High altitude Area | 48 | 64 | 48 | 32 |

---

## 🎯 Summary for 150 kg/acre:

### **If this is SOIL TEST VALUE:**
- ✅ **Status: MEDIUM** (113-226 kg/acre range)
- ✅ **Fertilizer to apply: 48 kg/acre** (for Medium N status, Rabi paddy)

### **If this is FERTILIZER RECOMMENDATION:**
- ❌ **Status: EXCESSIVE** (3-6x higher than normal)
- ⚠️ **Not recommended** - May cause crop problems

---

## 📝 Data File References:

1. **soil-test-classification.json** - Nitrogen status thresholds
2. **location-crop-recommendations.json** - Fertilizer recommendations by status
3. **crops.json** - Base crop recommendations

---

## ✅ Final Answer:

**150 kg/acre nitrogen = MEDIUM Status** (according to soil-test-classification.json)

- **Range**: 113-226 kg/acre
- **Classification**: MEDIUM
- **If soil test value**: Your soil has medium nitrogen
- **Fertilizer to apply**: 48 kg/acre (for Medium N status)












