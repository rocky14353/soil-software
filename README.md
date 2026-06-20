# Soil Test - NPK Fertilizer Recommendation System

## Overview
A comprehensive web-based application for generating fertilizer recommendations based on soil test results, following Coromandel Fertilisers Ltd. specifications. The system provides district-wise, crop-wise, and season-wise NPK recommendations with multiple Gromor complex fertilizer combinations.

## Features

### Core Functionality
- **Crop-wise NPK Recommendations**: Based on soil test values (N, P, K in kg/ha)
- **6 Gromor Combination Options**: 
  1. 28-28-0 (basal) + 20-20-0 (1st top) + Urea + MOP
  2. 14-35-14 + 20-20-0
  3. 14-35-14 + 28-28-0
  4. 28-28-0 + 10-26-26
  5. 28-28-0 + 16-20-0
  6. 14-35-14 + 16-20-0
- **Split Application Schedules**: Stage-wise fertilizer application based on crop requirements
- **Fertilizer Conversion**: Accurate conversion from NPK requirements to Gromor products and straight fertilizers
- **Bag Rounding**: Automatic rounding to Full bag, Half bag, or 1/4th bag
- **Location-based Selection**: Automatic combination selection based on location/area
- **Fertilizer Preferences**: Optional, Mandatory, or Reject preferences for each fertilizer type
- **Nutrient Classification**: Low/Medium/High classification for N, P, K

### Supported Crops
- Paddy (Upland, Mediumland, Lowland)
- Maize, Jowar, Bajra, Ragi
- Pulses: Redgram, Greengram, Blackgram, Bengalgram, Cowpea, Soyabean
- Oilseeds: Groundnut, Mustard, Sunflower, Sesamum, Castor, Niger, Safflower
- Cash Crops: Sugarcane, Cotton (American & Desi varieties)
- Vegetables: Tomato, Onion, Chilli, Brinjal, Cabbage, Cauliflower, and many more
- Spices: Turmeric, Ginger, Garlic
- And 40+ more crops

### Input Fields

**Required:**
- Crop (dropdown selection)
- Nitrogen (kg/ha)
- Phosphorus (kg/ha)
- Potassium (kg/ha)

**Optional:**
- Season (Kharif/Rabi/Summer/Perennial)
- Field Type (Irrigated/Rainfed)
- Location/Area (8 predefined locations)
- Sulfur (kg/ha)
- Gromor Combination (manual selection or auto-based on location)
- Fertilizer Preferences (for each fertilizer type)

## File Structure

```
soil-fert-recommendation/
├── index.html              # Main HTML structure
├── styles.css              # Styling and responsive design
├── script.js               # Complete calculation engine
├── data/
│   ├── crops.json          # Crop master data with NPK and splits
│   ├── fertilizer-conversion.json  # Conversion tables from CSV
│   └── locations.json      # Location preferences and combinations
└── README.md               # This file
```

## Usage

1. **Open the Application**: Open `index.html` in a modern web browser
2. **Select Crop**: Choose the crop from the dropdown
3. **Enter Soil Test Values**: Input N, P, K values in kg/ha
4. **Optional Fields**: Fill in Season, Field Type, Location if known
5. **Set Preferences**: Adjust fertilizer preferences if needed
6. **Get Recommendation**: Click "Get Recommendation" button
7. **View Results**: 
   - Stage-wise fertilizer application schedule
   - Nutrient classification (Low/Medium/High)
   - Total NPK requirements
   - Selected Gromor combination

## Technical Details

### Calculation Logic

1. **Base Recommendation Lookup**: Retrieves crop-specific NPK recommendations from master data
2. **Soil Test Adjustment**: Adjusts recommendations based on input soil test values
3. **Split Calculation**: Calculates per-stage NPK requirements based on crop split schedule
4. **Gromor Selection**: Selects appropriate Gromor combination (location-based or manual)
5. **Fertilizer Conversion**: Converts NPK requirements to specific fertilizer products using conversion tables
6. **Bag Rounding**: Rounds fertilizer quantities to nearest bag fraction (Full/Half/Quarter)

### Data Sources

- **Crop Data**: Extracted from `N and K split crop wise.csv`
- **Fertilizer Conversion**: Extracted from `Soil Test based Gromor Recommendation (2).csv`
- **Location Preferences**: Based on regional requirements

### Conversion Tables

The system uses interpolation from conversion tables for:
- P2O5 → Gromor Complex Fertilizers (14-35-14, 28-28-0, 20-20-0, 10-26-26, 16-20-0, SSP)
- N → Straight Fertilizers (Urea, A.S, C.A.N)
- K2O → Straight Fertilizers (MOP, SOP)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design for mobile and desktop

## Future Enhancements

- [ ] Database integration for master data
- [ ] Multi-language support (Telugu, Oriya)
- [ ] PDF export functionality
- [ ] pH and EC recommendations
- [ ] Micronutrient recommendations
- [ ] Target yield-based recommendations
- [ ] Historical data tracking
- [ ] User authentication and data persistence

## Notes

- All calculations are done in kg/acre internally, converted to/from kg/ha for display
- Default season is "Rabi" if not specified
- Default field type is "Irrigated" if not specified
- If location is specified, combination is auto-selected; otherwise defaults to Combination 1
- Fertilizer preferences (Reject) will exclude that fertilizer from recommendations

## License

This software is developed for Coromandel Fertilisers Ltd. soil testing and recommendation system.













