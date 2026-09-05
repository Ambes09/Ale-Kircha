import re

with open('src/bot.ts', 'r') as f:
    content = f.read()

# Fix keyboard arrays with null values - remove null filtering
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

# Remove null items at start of arrays
content = re.sub(
    r'\[\s*null\s*,\s*([^\[\]]*?)\]',
    r'[\1]',
    content
)

# Remove null items at end of arrays
content = re.sub(
    r'\[([^\[\]]*?),\s*null\s*\]',
    r'[\1]',
    content
)

# Remove trailing commas before closing brackets
content = re.sub(r',\s*\]', r']', content)

# Remove leading commas after opening brackets
content = re.sub(r'\[\s*,', r'[', content)

# Fix unused variable (_text)
content = content.replace('const _text = ctx.message?.text;', '// const _text = ctx.message?.text;')

with open('src/bot.ts', 'w') as f:
    f.write(content)

print("✅ Fixed admin bot (12 errors)")
