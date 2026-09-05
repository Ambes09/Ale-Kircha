with open('src/bot.ts', 'r') as f:
    lines = f.readlines()

# Fix line 477 (index 476)
if len(lines) > 476:
    # Replace with proper syntax
    lines[476] = '  const telegramId = ctx.from?.id?.toString();\n'

with open('src/bot.ts', 'w') as f:
    f.writelines(lines)

print("✅ Fixed customer bot line 477")
