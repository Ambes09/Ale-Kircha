import re

with open('src/bot.ts', 'r') as f:
    content = f.read()

# Remove null values from inline_keyboard arrays
# Find and fix all inline_keyboard arrays with null
content = re.sub(
    r'inline_keyboard:\s*\[([\s\S]*?)\]\.filter\(\(item\)\s*=>\s*item\s*!==\s*null\)',
    r'inline_keyboard: [\1]',
    content
)

# Remove null items from arrays
content = re.sub(
    r'\[([^\[\]]*?),\s*null\s*,\s*([^\[\]]*?)\]',
    r'[\1, \2]',
    content
)

# Remove trailing commas before closing brackets
content = re.sub(
    r',\s*\]',
    r']',
    content
)

# Remove leading commas after opening brackets
content = re.sub(
    r'\[\s*,',
    r'[',
    content
)

with open('src/bot.ts', 'w') as f:
    f.write(content)

print("✅ Fixed admin bot keyboard arrays")
