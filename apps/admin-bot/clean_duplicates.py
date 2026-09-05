import re

with open('src/bot.ts', 'r') as f:
    content = f.read()

# Find all callbackQuery definitions with their names
pattern = r"bot\.callbackQuery\s*\(\s*'([^']+)'\s*,\s*async\s*\([^)]*\)\s*=>\s*\{"
matches = list(re.finditer(pattern, content))

# Group by callback name
callback_groups = {}
for match in matches:
    name = match.group(1)
    if name not in callback_groups:
        callback_groups[name] = []
    callback_groups[name].append(match)

# Find full function bodies for each match
def get_function_end(content, start_pos):
    brace_count = 0
    pos = start_pos
    while pos < len(content):
        if content[pos] == '{':
            brace_count += 1
        elif content[pos] == '}':
            brace_count -= 1
            if brace_count == 0:
                return pos + 1
        pos += 1
    return pos

# Find all callback definitions with their full bodies
callback_defs = {}
for name, matches_list in callback_groups.items():
    callback_defs[name] = []
    for match in matches_list:
        start = match.start()
        end = get_function_end(content, match.end())
        callback_defs[name].append((start, end, content[start:end]))

# Keep only the LAST occurrence for each callback name
# (assuming last is most complete)
to_remove = []
for name, defs in callback_defs.items():
    if len(defs) > 1:
        # Keep the last one, mark others for removal
        for i in range(len(defs) - 1):
            to_remove.append(defs[i])

# Remove from the end to avoid index issues
for start, end, _ in sorted(to_remove, key=lambda x: x[0], reverse=True):
    # Check if there's a preceding newline to clean up
    before = content[:start]
    after = content[end:]
    # Remove the function and any preceding whitespace
    content = before + after

# Clean up extra newlines
content = re.sub(r'\n{3,}', '\n\n', content)
content = re.sub(r'\n{2,}\s*\n', '\n\n', content)

with open('src/bot-clean.ts', 'w') as f:
    f.write(content)

print("✅ Clean file created: src/bot-clean.ts")
print(f"   Original: {len(content)} chars")
print(f"   Cleaned: {len(content)} chars")
