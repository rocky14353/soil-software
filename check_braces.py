
with open('script.js', 'r', encoding='utf-8') as f:
    src = f.read()

bt = chr(96)
sq = chr(39)
dq = chr(34)

i = 0
n = len(src)
depth = 0
line = 1
issues = []
tpl_depth = 0

while i < n:
    c = src[i]
    if c == '\n':
        line += 1
        i += 1
        continue
    # single-line comment
    if c == '/' and i+1 < n and src[i+1] == '/':
        while i < n and src[i] != '\n':
            i += 1
        continue
    # multi-line comment
    if c == '/' and i+1 < n and src[i+1] == '*':
        i += 2
        while i < n-1 and not (src[i] == '*' and src[i+1] == '/'):
            i += 1
        i += 2
        continue
    # single-quoted string
    if c == sq:
        i += 1
        while i < n:
            if src[i] == '\\':
                i += 2
                continue
            if src[i] == sq:
                break
            i += 1
        i += 1
        continue
    # double-quoted string
    if c == dq:
        i += 1
        while i < n:
            if src[i] == '\\':
                i += 2
                continue
            if src[i] == dq:
                break
            i += 1
        i += 1
        continue
    # template literal
    if c == bt:
        i += 1
        nest = 1
        while i < n and nest > 0:
            cc = src[i]
            if cc == '\\':
                i += 2
                continue
            if cc == bt:
                nest -= 1
                i += 1
                continue
            # ${ starts nested expression - count it so we can find matching }
            if cc == '$' and i+1 < n and src[i+1] == '{':
                i += 2
                nest += 1
                # count this brace as code brace
                depth += 1
                continue
            if nest > 1 and cc == '{':
                depth += 1
            elif nest > 1 and cc == '}':
                depth -= 1
                nest -= 1
                if nest == 1:
                    # we just closed a ${ expression
                    pass
                if depth < 0:
                    issues.append((line, depth))
            i += 1
        continue
    if c == '{':
        depth += 1
    elif c == '}':
        depth -= 1
        if depth < 0:
            ctx = src[max(0, i-40):i+40].replace('\n', '|')
            issues.append((line, depth, ctx))
    i += 1

print("Final depth:", depth)
if issues:
    for item in issues:
        ln, d = item[0], item[1]
        ctx = item[2] if len(item) > 2 else ''
        print("  Negative at line", ln, "depth=", d, ":", ctx)
else:
    print("No issues - braces balanced!")




