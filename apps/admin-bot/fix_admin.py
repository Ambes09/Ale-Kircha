import re

with open('src/bot.ts', 'r') as f:
    content = f.read()

# Fix inline_keyboard arrays with null values
# Replace .filter(Boolean) with proper filtering
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

# Remove trailing commas
content = re.sub(r',\s*\]', r']', content)

# Remove leading commas
content = re.sub(r'\[\s*,', r'[', content)

# Fix unused variable
content = content.replace('const _text = ctx.message?.text;', '// const _text = ctx.message?.text;')

with open('src/bot.ts', 'w') as f:
    f.write(content)

print("✅ Fixed admin bot")
