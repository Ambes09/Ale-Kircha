import re

with open('src/bot.ts', 'r') as f:
    lines = f.readlines()

# Fix line 477 (index 476) - missing colon and comma
if len(lines) > 476:
    # Check what's on line 477
    line = lines[476]
    if 'telegramId' in line:
        # Replace with proper syntax
        lines[476] = '  const telegramId = ctx.from?.id?.toString();\n'

with open('src/bot.ts', 'w') as f:
    f.writelines(lines)

print("✅ Fixed customer bot (2 errors)")
