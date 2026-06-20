import csv
import json
import re

# Read Data 2 CSV
with open('Data 2 - Direct Gromor grades.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

# Structure to store all data
all_recommendations = {}

current_crop = None
current_season = None
current_field_type = None

i = 0
while i < len(rows):
    row = rows[i]
    
    # Detect crop sections
    if len(row) > 0:
        row_str = ','.join(row).upper()
        
        # Paddy sections
        if 'PADDY-KHARIF' in row_str:
            current_crop = 'PADDY-KHARIF'
            current_season = 'Kharif'
            i += 2  # Skip header rows
            continue
        elif 'PADDY-RABI' in row_str:
            current_crop = 'PADDY-RABI'
            current_season = 'Rabi'
            i += 2  # Skip header rows
            continue
        # Irrigated crops
        elif 'IRRIGATED CROPS' in row_str:
            current_field_type = 'Irrigated'
            i += 1
            continue
        # Rainfed crops
        elif 'RAINFED CROPS' in row_str:
            current_field_type = 'Rainfed'
            i += 1
            continue
        # Kharif crops
        elif row_str.startswith('KHARIF') and 'CROP' in row_str:
            current_season = 'Kharif'
            i += 1
            continue
        # Rabi crops
        elif row_str.startswith('RABI') and 'CROP' in row_str:
            current_season = 'Rabi'
            i += 1
            continue
    
    # Parse location/crop rows
    if current_crop or (current_field_type and len(row) > 5):
        if len(row) > 5 and row[0] and not row[0].startswith(',') and row[0] not in ['CROP', 'AREA/DT', 'Normal recommend']:
            location_or_crop = row[0].strip()
            
            # Check if it's a location (for Paddy) or crop name
            locations = ['GODAVARI DELTA', 'KRI-DELTA & L soils', 'NORTH COASTAL', 'SOUTH MANDL', 
                        'NORTH TELENGANA', 'SOUTH TELENGANA', 'LOW RAINFALL AREA', 'High altitude Area']
            
            if location_or_crop in locations or current_crop:
                # It's a location row for Paddy
                if current_crop:
                    if current_crop not in all_recommendations:
                        all_recommendations[current_crop] = {}
                    
                    if location_or_crop not in all_recommendations[current_crop]:
                        all_recommendations[current_crop][location_or_crop] = {
                            'normal': {},
                            'nStatus': {},
                            'pStatus': {},
                            'kStatus': {},
                            'gromorByPStatus': {'low': {}, 'medium': {}, 'high': {}}
                        }
                    
                    try:
                        # Parse the row data
                        normal_n = float(row[1]) if row[1] else 0
                        normal_p = float(row[2]) if row[2] else 0
                        normal_k = float(row[3]) if row[3] else 0
                        
                        all_recommendations[current_crop][location_or_crop]['normal'] = {
                            'n': normal_n, 'p': normal_p, 'k': normal_k
                        }
                        
                        # N status
                        all_recommendations[current_crop][location_or_crop]['nStatus'] = {
                            'low': float(row[4]) if row[4] else normal_n,
                            'medium': float(row[5]) if row[5] else normal_n,
                            'high': float(row[6]) if row[6] else normal_n
                        }
                        
                        # P status
                        all_recommendations[current_crop][location_or_crop]['pStatus'] = {
                            'low': float(row[7]) if row[7] else normal_p,
                            'medium': float(row[8]) if row[8] else normal_p,
                            'high': float(row[9]) if row[9] else normal_p
                        }
                        
                        # K status
                        all_recommendations[current_crop][location_or_crop]['kStatus'] = {
                            'low': float(row[10]) if row[10] else normal_k,
                            'medium': float(row[11]) if row[11] else normal_k,
                            'high': float(row[12]) if row[12] else normal_k
                        }
                        
                        # Gromor by P status - Low P2O5
                        if len(row) > 13:
                            all_recommendations[current_crop][location_or_crop]['gromorByPStatus']['low'] = {
                                '14-35-14': float(row[13]) if row[13] else 0,
                                '28-28-0': float(row[14]) if row[14] else 0,
                                '20-20-0-13': float(row[15]) if row[15] else 0,
                                '10-26-26': float(row[16]) if row[16] else 0,
                                '16-20-0-13': float(row[17]) if row[17] else 0
                            }
                        if len(row) > 18:
                            all_recommendations[current_crop][location_or_crop]['gromorByPStatus']['medium'] = {
                                '14-35-14': float(row[18]) if row[18] else 0,
                                '28-28-0': float(row[19]) if row[19] else 0,
                                '20-20-0-13': float(row[20]) if row[20] else 0,
                                '10-26-26': float(row[21]) if row[21] else 0,
                                '16-20-0-13': float(row[22]) if row[22] else 0
                            }
                        if len(row) > 23:
                            all_recommendations[current_crop][location_or_crop]['gromorByPStatus']['high'] = {
                                '14-35-14': float(row[23]) if row[23] else 0,
                                '28-28-0': float(row[24]) if row[24] else 0,
                                '20-20-0-13': float(row[25]) if row[25] else 0,
                                '10-26-26': float(row[26]) if row[26] else 0,
                                '16-20-0-13': float(row[27]) if row[27] else 0
                            }
                    except (ValueError, IndexError) as e:
                        pass  # Skip invalid rows
    
    i += 1

# Save to JSON
with open('data/location-crop-recommendations-full.json', 'w', encoding='utf-8') as f:
    json.dump(all_recommendations, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(all_recommendations)} crop sections")
print("Sample:", list(all_recommendations.keys())[:5])













