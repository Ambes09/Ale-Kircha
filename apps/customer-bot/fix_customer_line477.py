import re

with open('src/bot.ts', 'r') as f:
    content = f.read()

# Fix line 477 - missing colon and comma
lines = content.split('\n')
for i, line in enumerate(lines):
    if i == 476:  # Line 477
        # Fix the line
        if 'telegramId' in line:
            # Make sure it has proper syntax
            lines[i] = '  const telegramId = ctx.from?.id?.toString();'
        elif 'firstName' in line:
            lines[i] = '  const firstName = ctx.from?.first_name || "Customer";'

content = '\n'.join(lines)

with open('src/bot.ts', 'w') as f:
    f.write(content)

print("✅ Fixed customer bot line 477")
