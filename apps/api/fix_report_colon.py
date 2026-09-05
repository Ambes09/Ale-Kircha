import re

with open('src/controllers/reportController.ts', 'r') as f:
    content = f.read()

# Fix line 186 - missing colon
# Look for the line with delivery and fix it
lines = content.split('\n')
for i, line in enumerate(lines):
    if i == 185:  # Line 186
        # Fix the line to have proper syntax
        if 'delivery' in line and ':' not in line:
            lines[i] = line.replace('delivery', 'delivery:')
        elif 'include' in line and ':' not in line:
            lines[i] = line.replace('include', 'include:')

content = '\n'.join(lines)

# Also fix any other missing colons
content = re.sub(r'(\w+):\s*\{([^}]*)\}', r'\1: {\2}', content)

with open('src/controllers/reportController.ts', 'w') as f:
    f.write(content)

print("✅ Fixed report controller colon")
