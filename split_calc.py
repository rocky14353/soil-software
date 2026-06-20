#!/usr/bin/env python3
import re, os

def extract_functions_with_trailer(filepath, start, end):
    """Extract functions and any trailing code after the last function."""
    with open(filepath, 'r') as f:
        all_lines = f.readlines()
    
    body_lines = all_lines[start-1:end]
    
    functions = []
    current_func = []
    in_func = False
    brace_depth = 0
    func_name = None
    trailing_lines = []
    last_func_end = 0
    
    for idx, line in enumerate(body_lines):
        stripped = line.rstrip('\n')
        
        if not in_func:
            m = re.match(r'^(?:async\s+)?function\s+(\w+)\s*\(', stripped)
            if m:
                if current_func:
                    functions.append((func_name, '\n'.join(current_func)))
                    last_func_end = idx
                func_name = m.group(1)
                in_func = True
                current_func = [stripped]
                brace_depth = stripped.count('{') - stripped.count('}')
                continue
            # Collect trailing lines
            trailing_lines.append(stripped)
            continue
        
        current_func.append(stripped)
        brace_depth += stripped.count('{') - stripped.count('}')
        
        if brace_depth <= 0 and current_func:
            functions.append((func_name, '\n'.join(current_func)))
            current_func = []
            in_func = False
            func_name = None
            last_func_end = idx
            trailing_lines = []
    
    # Save last function
    if current_func:
        functions.append((func_name, '\n'.join(current_func)))
        last_func_end = len(body_lines) - 1
    
    # Collect any trailing non-function code after the last function
    trailing = ''
    if last_func_end is not None and last_func_end < len(body_lines) - 1:
        for i in range(last_func_end + 1, len(body_lines)):
            line = body_lines[i].rstrip('\n')
            # Skip blank lines at the very end
            trailing += line + '\n'
    
    # Build result
    result_parts = []
    for name, body in functions:
        result_parts.append(f"globalThis.{name} = {body}")
    
    result = '\n\n'.join(result_parts)
    if trailing.strip():
        result += '\n\n' + trailing.rstrip('\n')
    
    return result

# Extract calculator.js (lines 42-6904)
print("Extracting calculator.js (lines 42-6904)...")
calc = extract_functions_with_trailer('script.js', 42, 6904)
with open('calculator.js', 'w') as f:
    f.write(calc)
print(f"  calculator.js: {calc.count(chr(10)) + 1} lines")

# Extract renderer.js (lines 6905-7347)
print("Extracting renderer.js (lines 6905-7347)...")
rend = extract_functions_with_trailer('script.js', 6905, 7347)
with open('renderer.js', 'w') as f:
    f.write(rend)
print(f"  renderer.js: {rend.count(chr(10)) + 1} lines")

# Extract form-handler.js (lines 7348-7639)
print("Extracting form-handler.js (lines 7348-7639)...")
form = extract_functions_with_trailer('script.js', 7348, 7639)
with open('form-handler.js', 'w') as f:
    f.write(form)
print(f"  form-handler.js: {form.count(chr(10)) + 1} lines")

# Verify function counts
for fname in ['calculator.js', 'renderer.js', 'form-handler.js']:
    with open(fname) as f:
        content = f.read()
    funcs = re.findall(r'globalThis\.(\w+)\s*=', content)
    print(f"  {fname}: {len(funcs)} functions -> {funcs}")

# Clean up
os.remove('split_calc.py')
print("Cleanup complete.")
