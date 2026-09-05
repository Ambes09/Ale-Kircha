with open('src/controllers/reportController.ts', 'r') as f:
    lines = f.readlines()

# Fix line 186 (index 185) - add colon
if len(lines) > 185:
    line = lines[185]
    # Check if line has 'delivery' without colon
    if 'delivery' in line and ':' not in line:
        lines[185] = line.replace('delivery', 'delivery:')
    # Also fix if it's a different pattern
    elif 'include' in line and ':' not in line:
        lines[185] = line.replace('include', 'include:')
    # Generic fix: add colon after the first word if missing
    else:
        # Look for pattern like "delivery { ... }"
        import re
        match = re.search(r'^(\s*)(\w+)\s*\{', line)
        if match:
            indent = match.group(1)
            word = match.group(2)
            if ':' not in line.split('{')[0]:
                lines[185] = f'{indent}{word}: {{\n'

with open('src/controllers/reportController.ts', 'w') as f:
    f.writelines(lines)

print("✅ Fixed reportController.ts line 186")
