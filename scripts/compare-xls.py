#!/usr/bin/env python3
"""Compare Coromandel XLS master data vs soil-software codebase - clean version."""
import xlrd, json, sys, os

os.chdir('/Users/rakesh/soil-software')
XLS_PATH = "/Users/rakesh/.hermes/cache/documents/doc_6e9f21844556_Soil Test based Gromor  Recommendation (3).xls"

def parse_paddy_section(sheet, start_row, count):
    """Parse a PADDY section: rows with locations."""
    result = {}
    for r in range(start_row, start_row + count):
        loc = str(sheet.cell(r, 0).value).strip()
        if not loc or loc.startswith('CROP') or not loc[0].isalpha():
            continue
        try:
            result[loc] = {
                'base': {'n': float(sheet.cell(r, 1).value), 'p': float(sheet.cell(r, 2).value), 'k': float(sheet.cell(r, 3).value)},
                'n_adj': {'low': float(sheet.cell(r, 4).value), 'med': float(sheet.cell(r, 5).value), 'high': float(sheet.cell(r, 6).value)},
                'p_adj': {'low': float(sheet.cell(r, 7).value), 'med': float(sheet.cell(r, 8).value), 'high': float(sheet.cell(r, 9).value)},
                'k_adj': {'low': float(sheet.cell(r, 10).value), 'med': float(sheet.cell(r, 11).value), 'high': float(sheet.cell(r, 12).value)},
            }
        except (ValueError, IndexError):
            continue
    return result

def parse_crop_section(sheet, start_row):
    """Parse a crop section (IRRIGATED/RAINFED)."""
    result = {}
    for r in range(start_row, start_row + 20):
        loc = str(sheet.cell(r, 0).value).strip()
        if not loc or len(loc) < 2 or not loc[0].isalpha():
            continue
        if loc in ['CROP', 'CROP', '']:
            continue
        # Check if this row has numeric NPK
        try:
            n = float(sheet.cell(r, 1).value)
            p = float(sheet.cell(r, 2).value)
            k = float(sheet.cell(r, 3).value)
            result[loc] = {
                'base': {'n': n, 'p': p, 'k': k},
                'n_adj': {'low': float(sheet.cell(r, 4).value), 'med': float(sheet.cell(r, 5).value), 'high': float(sheet.cell(r, 6).value)},
                'p_adj': {'low': float(sheet.cell(r, 7).value), 'med': float(sheet.cell(r, 8).value), 'high': float(sheet.cell(r, 9).value)},
                'k_adj': {'low': float(sheet.cell(r, 10).value), 'med': float(sheet.cell(r, 11).value), 'high': float(sheet.cell(r, 12).value)},
            }
        except (ValueError, IndexError):
            continue
    return result

def parse_splits(sheet, start_row, end_row):
    """Parse split application table."""
    result = {}
    for r in range(start_row, end_row):
        crop = str(sheet.cell(r, 0).value).strip()
        if not crop or not crop[0].isalpha():
            continue
        if crop in ['CROP', 'CROP', '']:
            continue
        try:
            basal = str(sheet.cell(r, 1).value).strip()
            top1 = str(sheet.cell(r, 2).value).strip()
            top2 = str(sheet.cell(r, 4).value).strip()
            remarks = str(sheet.cell(r, 5).value).strip() if sheet.ncols > 5 else ''
            if basal or top1:
                result[crop] = {'basal': basal, 'top1': top1, 'top2': top2, 'remarks': remarks}
        except IndexError:
            continue
    return result

def round2(x):
    return round(x, 2) if x is not None else None

def compare_adj(xls_adj, cb_entry, prefix):
    """Compare adjustment values. Codebase stores as low/med/high in nStatus/pStatus/kStatus dicts."""
    issues = []
    for status, xls_key in [('low', 'low'), ('medium', 'medium'), ('high', 'high')]:
        xv = xls_adj.get(status)
        if xv is None:
            continue
        # Codebase rounds values - check with tolerance
        cv = cb_entry.get(xls_key) if cb_entry else None
        if cv is None:
            issues.append(f"  ❌ {prefix} ({status}): XLS={round2(xv)}, codebase=MISSING")
        elif abs(xv - cv) > 1.0:
            issues.append(f"  ❌ {prefix} ({status}): XLS={round2(xv)}, codebase={round2(cv)}")
        elif abs(xv - cv) > 0.1:
            issues.append(f"  ⚠️ {prefix} ({status}): XLS={round2(xv)}, codebase={round2(cv)} (minor rounding)")
    return issues

def main():
    wb = xlrd.open_workbook(XLS_PATH)
    
    # Load codebase data
    with open('data/crops.json') as f: crops = json.load(f)
    with open('data/location-crop-recommendations.json') as f: loc_data = json.load(f)
    
    s1 = wb.sheet_by_name('Direct Gromor grades')
    s3 = wb.sheet_by_name('Crop wise NPK recommendation')
    
    mismatches = []
    
    # ============ PADDY-KHARIF ============
    print("=" * 65)
    print("1. PADDY-KHARIF — Location Recommendations")
    print("=" * 65)
    paddy_kharif_xls = parse_paddy_section(s1, 4, 8)
    for loc, xls in sorted(paddy_kharif_xls.items()):
        cb = loc_data.get('PADDY-KHARIF', {}).get(loc, {})
        issues = []
        issues += compare_adj(xls['n_adj'], cb.get('nStatus'), f"{loc} N adj")
        issues += compare_adj(xls['p_adj'], cb.get('pStatus'), f"{loc} P adj")
        issues += compare_adj(xls['k_adj'], cb.get('kStatus'), f"{loc} K adj")
        print(f"\n{loc}:")
        if issues:
            for i in issues: print(i)
            mismatches.extend(issues)
        else:
            print("  ✅ All adjustments match")
    
    # ============ PADDY-RABI ============
    print("\n" + "=" * 65)
    print("2. PADDY-RABI — Location Recommendations")
    print("=" * 65)
    paddy_rabi_xls = parse_paddy_section(s1, 16, 8)
    for loc, xls in sorted(paddy_rabi_xls.items()):
        cb = loc_data.get('PADDY-RABI', {}).get(loc, {})
        issues = []
        issues += compare_adj(xls['n_adj'], cb.get('nStatus'), f"{loc} N adj")
        issues += compare_adj(xls['p_adj'], cb.get('pStatus'), f"{loc} P adj")
        issues += compare_adj(xls['k_adj'], cb.get('kStatus'), f"{loc} K adj")
        print(f"\n{loc}:")
        if issues:
            for i in issues: print(i)
            mismatches.extend(issues)
        else:
            print("  ✅ All adjustments match")
    
    # ============ IRRIGATED CROPS ============
    print("\n" + "=" * 65)
    print("3. IRRIGATED CROPS — Base NPK (XLS vs crops.json)")
    print("=" * 65)
    irrigated_xls = parse_crop_section(s1, 55)
    crop_map_irr = {'MAIZE': 'Maize', 'JOWAR': 'Jowar', 'BAJRA': 'Bajra', 'RAGI': 'Fingermillet(Ragi)', 'KORRA': 'Korra'}
    for xls_crop, cb_name in sorted(crop_map_irr.items()):
        if xls_crop not in irrigated_xls:
            continue
        xls = irrigated_xls[xls_crop]
        cb_season = crops.get(cb_name, {}).get('irrigated', {}).get('rabi', {}) or crops.get(cb_name, {}).get('irrigated', {}).get('kharif', {})
        issues = []
        for nut, key in [('N', 'n'), ('P', 'p'), ('K', 'k')]:
            xv = xls['base'][key]
            cv = cb_season.get(key)
            if cv is None:
                issues.append(f"  ❌ {xls_crop} {nut}: XLS={round2(xv)}, codebase=MISSING")
            elif abs(xv - cv) > 0.1:
                issues.append(f"  ❌ {xls_crop} {nut}: XLS={round2(xv)}, codebase={round2(cv)}")
        print(f"\n{xls_crop} → {cb_name}:")
        if issues:
            for i in issues: print(i)
            mismatches.extend(issues)
        else:
            print(f"  ✅ NPK={round2(xls['base']['n'])}-{round2(xls['base']['p'])}-{round2(xls['base']['k'])} matches")
    
    # ============ RAINFED CROPS ============
    print("\n" + "=" * 65)
    print("4. RAINFED CROPS — Base NPK (XLS vs crops.json)")
    print("=" * 65)
    rainfed_xls = parse_crop_section(s1, 97)
    crop_map_rf = {'MAIZE': 'Maize', 'JOWAR': 'Jowar', 'BAJRA': 'Bajra', 'RAGI': 'Fingermillet(Ragi)', 'KORRA': 'Korra', 'VARIGA': 'Variga'}
    for xls_crop, cb_name in sorted(crop_map_rf.items()):
        if xls_crop not in rainfed_xls:
            continue
        xls = rainfed_xls[xls_crop]
        cb_season = crops.get(cb_name, {}).get('rainfed', {}).get('rabi', {}) or crops.get(cb_name, {}).get('rainfed', {}).get('kharif', {})
        issues = []
        for nut, key in [('N', 'n'), ('P', 'p'), ('K', 'k')]:
            xv = xls['base'][key]
            cv = cb_season.get(key)
            if cv is None:
                issues.append(f"  ❌ {xls_crop} {nut}: XLS={round2(xv)}, codebase=MISSING")
            elif abs(xv - cv) > 0.1:
                issues.append(f"  ❌ {xls_crop} {nut}: XLS={round2(xv)}, codebase={round2(cv)}")
        print(f"\n{xls_crop} → {cb_name}:")
        if issues:
            for i in issues: print(i)
            mismatches.extend(issues)
        else:
            print(f"  ✅ NPK={round2(xls['base']['n'])}-{round2(xls['base']['p'])}-{round2(xls['base']['k'])} matches")
    
    # ============ SPLITS ============
    print("\n" + "=" * 65)
    print("5. STAGE SPLITS (XLS Split tables vs crops.json)")
    print("=" * 65)
    
    # Irrigated splits (rows ~70-80 in sheet 1)
    irr_splits = parse_splits(s1, 76, 86)
    print("\nIrrigated Crops — N Splits:")
    for crop, split in sorted(irr_splits.items()):
        print(f"\n  {crop}:")
        print(f"    N: Basal={split['basal']}, Top1={split['top1']}, Top2={split['top2']}")
        print(f"    Remarks: {split['remarks']}")
        
        # Find in codebase
        cb_name = crop_map_irr.get(crop)
        if cb_name:
            cb_splits = crops.get(cb_name, {}).get('irrigated', {}).get('rabi', {}).get('splits', {}) or \
                       crops.get(cb_name, {}).get('irrigated', {}).get('kharif', {}).get('splits', {})
            n_splits = cb_splits.get('n', {})
            print(f"    Codebase N splits: ratios={n_splits.get('ratios',[])}, stages={n_splits.get('stages',[])}")
            
            # Check K placement
            k_remark = split['remarks']
            cb_k = cb_splits.get('k', {})
            if 'Total K as basal' in k_remark or ('Total P and K as basal' in k_remark):
                if cb_k.get('count', 0) > 1:
                    print(f"    ⚠️  XLS says K=100% basal but codebase has K split ({cb_k.get('count')} splits)")
                    mismatches.append(f"{cb_name} K split: XLS says 100% basal, codebase has {cb_k.get('count')} splits")
                else:
                    print(f"    ✅ K placement matches (100% basal)")
            elif 'Total K as basal' not in k_remark:
                print(f"    ℹ️  K placement: XLS says '{k_remark}'")
    
    # Rainfed splits  
    rf_splits = parse_splits(s1, 113, 123)
    print("\nRainfed Crops — N Splits:")
    for crop, split in sorted(rf_splits.items()):
        print(f"\n  {crop}:")
        print(f"    N: Basal={split['basal']}, Top1={split['top1']}, Top2={split['top2']}")
        print(f"    Remarks: {split['remarks']}")
        
        cb_name = crop_map_rf.get(crop)
        if cb_name:
            rainfed_data = crops.get(cb_name, {}).get('rainfed', {})
            # Try rabi first, then kharif
            cb_season = {}
            for s in ['rabi', 'kharif']:
                if s in rainfed_data:
                    cb_season = rainfed_data[s]
                    break
            cb_splits = cb_season.get('splits', {})
            n_splits = cb_splits.get('n', {})
            print(f"    Codebase N splits: ratios={n_splits.get('ratios',[])}, stages={n_splits.get('stages',[])}")
    
    # ============ Sheet 3: Additional Crops ============
    print("\n" + "=" * 65)
    print("6. SHEET 3 — Additional Crops (NOT in main codebase)")
    print("=" * 65)
    
    crop_names_codebase = set()
    for k in crops: crop_names_codebase.add(k.lower())
    
    # Parse Sheet 3
    sheet3_crops = {}
    current_section = None
    for r in range(s3.nrows):
        cell = str(s3.cell(r, 0).value).strip()
        if 'IRRIGATED CROPS' in cell.upper():
            current_section = 'irrigated'
            continue
        elif 'RAINFED CROPS' in cell.upper():
            current_section = 'rainfed'
            continue
        elif 'KHARIF' in cell.upper() and current_section is None:
            current_section = 'kharif'
            continue
        elif 'RABI' in cell.upper() and cell.upper() == 'RABI':
            current_section = 'rabi'
            continue
        
        if current_section and cell and cell not in ['CROP', ''] and not cell.startswith('0'):
            try:
                n_val = float(s3.cell(r, 1).value)
                p_val = float(s3.cell(r, 2).value)
                k_val = float(s3.cell(r, 3).value)
                basal = str(s3.cell(r, 4).value).strip()
                top1 = str(s3.cell(r, 5).value).strip()
                top2 = str(s3.cell(r, 6).value).strip()
                p_placement = str(s3.cell(r, 7).value).strip()
                k_placement = str(s3.cell(r, 8).value).strip()
                
                sheet3_crops[f"{current_section}/{cell}"] = {
                    'section': current_section, 'crop': cell,
                    'npk': {'n': n_val, 'p': p_val, 'k': k_val},
                    'splits': {'basal': basal, 'top1': top1, 'top2': top2},
                    'p_placement': p_placement, 'k_placement': k_placement
                }
            except (ValueError, IndexError):
                pass
    
    # Check which crops from Sheet 3 are missing or different in codebase
    for key, rec in sorted(sheet3_crops.items()):
        crop = rec['crop']
        # Try to match to codebase
        found = False
        for cb_name in crops:
            if crop.lower() in cb_name.lower() or cb_name.lower() in crop.lower():
                found = True
                # Check if this specific irrigation/season combo exists
                section = rec['section']
                if section in ['irrigated', 'rainfed']:
                    cb_entry = crops.get(cb_name, {}).get(section, {})
                    if not cb_entry:
                        print(f"\n{crop} ({section}): ❌ MISSING from codebase")
                        print(f"  XLS: NPK={rec['npk']['n']}-{rec['npk']['p']}-{rec['npk']['k']}, N: basal={rec['splits']['basal']}, top1={rec['splits']['top1']}, top2={rec['splits']['top2']}")
                        print(f"  XLS: P={rec['p_placement']}, K={rec['k_placement']}")
                        mismatches.append(f"{crop} ({section}) entry MISSING in codebase")
                break
        if not found:
            print(f"\n{crop} ({rec['section']}): ❌ ENTIRELY MISSING from codebase")
            print(f"  XLS: NPK={rec['npk']['n']}-{rec['npk']['p']}-{rec['npk']['k']}, N: basal={rec['splits']['basal']}, top1={rec['splits']['top1']}, top2={rec['splits']['top2']}")
            mismatches.append(f"{crop} ({rec['section']}) ENTIRELY MISSING from codebase")
    
    # ============ SUMMARY ============
    print("\n\n" + "=" * 65)
    print("FINAL SUMMARY")
    print("=" * 65)
    
    if mismatches:
        print(f"\n⚠️  {len(mismatches)} discrepancy/ies found:\n")
        for m in mismatches:
            print(f"  • {m}")
    else:
        print("\n🎉 ALL DATA MATCHES! XLS master data = Codebase data for all checked values.")

if __name__ == '__main__':
    main()
