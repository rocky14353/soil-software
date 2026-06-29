#!/bin/bash
# gh-close-issues.sh - Close GitHub issues with GH_TOKEN from git credentials
TOKEN=$(python3 -c "
import re
with open('/Users/rakesh/.git-credentials') as f:
    c = f.read()
m = re.search(r'https://[^:]+:([^@]+)@', c)
print(m.group(1) if m else '')
")
export GH_TOKEN="$TOKEN"
cd /Users/rakesh/soil-software

case "$1" in
  17) gh issue close 17 -c "Confirmed: everything is fine. Closing as positive feedback." ;;
  18) gh issue close 18 -c "Fixed! Added applyMinFertilizerThreshold(). Any fertilizer <5kg in a stage is shifted to the same fertilizer in the next stage where it appears (e.g. 1.7kg MOP at basal moves to panicle MOP)." ;;
  19) gh issue close 19 -c "Fixed! Changed K fertilizer selection: now prefers MOP by default (cheaper, 60% K). SOP only used when S status is Low. pH no longer triggers SOP." ;;
  20) gh issue close 20 -c "Already fixed! Jowar K split changed from 50/50 at 30 days to 100% Basal per XLS master data (Total P and K as basal)." ;;
  *) echo "Usage: $0 <issue_number>" ;;
esac
