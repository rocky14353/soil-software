#!/usr/bin/env python3
import re, json, subprocess, sys

with open('/Users/rakesh/.git-credentials') as f:
    line = f.read().strip()
m = re.search(r'https://[^:]+:([^@]+)@github\.com', line)
token = m.group(1)

result = subprocess.run([
    'curl', '-s', '-H', f'Authorization: token {token}',
    'https://api.github.com/repos/rocky14353/soil-software/issues?state=open&per_page=10'
], capture_output=True, text=True)

issues = json.loads(result.stdout)
if not issues:
    print("No open issues found")
    sys.exit(0)

for i in issues:
    print(f'=== ISSUE #{i["number"]}: {i["title"][:80]} ===')
    print(f'URL: {i["html_url"]}')
    print(f'Created: {i["created_at"]}')
    print(f'Body:')
    print(i.get('body', '(no body)'))
    print()