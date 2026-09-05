import re

with open('src/controllers/reportController.ts', 'r') as f:
    lines = f.readlines()

# Fix line 186 (index 185) - missing colon
if len(lines) > 185:
    line = lines[185]
    if 'delivery' in line and ':' not in line:
        lines[185] = line.replace('delivery', 'delivery:')
    elif 'include' in line and ':' not in line:
        lines[185] = line.replace('include', 'include:')

with open('src/controllers/reportController.ts', 'w') as f:
    f.writelines(lines)

print("✅ Fixed report controller (1 error)")
