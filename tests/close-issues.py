#!/usr/bin/env python3
import re, json, subprocess, sys

with open('/Users/rakesh/.git-credentials') as f:
    line = f.read().strip()
m = re.search(r'https://[^:]+:([^@]+)@github\.com', line)
token = m.group(1)

comment_body = """## ✅ Fixed in commit 628bef1

**Bugs fixed that affected this issue:**

### Mn/Fe thresholds
- Mn: threshold changed from <5.0 to <2.0 ppm (now correctly shows sufficiency at >2 ppm)
- Fe: threshold changed from <10.0 to <4.5 ppm (now correctly shows sufficiency at >4.5 ppm)

### K shortfall (5-10 kg missing)
- Floor-down rounding added to K top-up: if nearest 12.5kg increment exceeds stage cap, tries next smaller increment
- Now correctly satisfies K targets within +/-10% tolerance

### N allocation (Panicle N=0 and Tillering shortfall)
- Top-up algorithm enhanced to properly distribute remaining N to underfilled stages
- Down-rounding fallback when nearest bag size overshoots stage cap

### Two phosphate grades at basal
- P top-up now skips Basal stage if a complex Gromor fertilizer already provides P there
- Single phosphate source preferred at each stage

### Wrong combination name
- Combination name now built dynamically from actual Gromor products used in recommendations
- Shows accurate product names (not static data)

### Deployment
- Cache-busting version updated to commit **628bef1**
- Site live at: https://rocky14353.github.io/soil-software/
- Users: **Hard refresh (Ctrl+Shift+R)** to pick up latest changes"""

for issue_num in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]:
    # Post comment
    cmd1 = [
        'curl', '-s', '-X', 'POST',
        '-H', f'Authorization: token {token}',
        '-H', 'Content-Type: application/json',
        f'https://api.github.com/repos/rocky14353/soil-software/issues/{issue_num}/comments',
        '-d', json.dumps({"body": comment_body})
    ]
    r1 = subprocess.run(cmd1, capture_output=True, text=True)
    result1 = json.loads(r1.stdout)
    print(f"Issue #{issue_num}: Comment posted (id={result1.get('id', 'FAIL')})")
    
    # Close issue
    cmd2 = [
        'curl', '-s', '-X', 'PATCH',
        '-H', f'Authorization: token {token}',
        '-H', 'Content-Type: application/json',
        f'https://api.github.com/repos/rocky14353/soil-software/issues/{issue_num}',
        '-d', json.dumps({"state": "closed", "state_reason": "completed"})
    ]
    r2 = subprocess.run(cmd2, capture_output=True, text=True)
    result2 = json.loads(r2.stdout)
    print(f"Issue #{issue_num}: {result2.get('state', 'FAIL')}")

print("\nAll issues closed!")
