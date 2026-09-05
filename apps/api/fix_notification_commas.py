import re

with open('src/controllers/notificationController.ts', 'r') as f:
    content = f.read()

# Fix lines 20, 41, 53 - missing commas
# Look for patterns where there's no comma after a property value
lines = content.split('\n')
fixed_lines = []
for i, line in enumerate(lines):
    # Check if this line needs a comma
    if i in [19, 20, 40, 41, 52, 53]:  # Lines 20, 41, 53 (0-indexed)
        # Add comma if missing at end of line
        if line.strip() and not line.rstrip().endswith(',') and not line.rstrip().endswith('{') and not line.rstrip().endswith('}'):
            line = line.rstrip() + ','
    fixed_lines.append(line)

content = '\n'.join(fixed_lines)

# Also fix any other missing commas
content = re.sub(r'(\w+):\s*([^,\n]+)\s*\n\s*(\w+):', r'\1: \2,\n  \3:', content)

with open('src/controllers/notificationController.ts', 'w') as f:
    f.write(content)

print("✅ Fixed notification controller commas")
