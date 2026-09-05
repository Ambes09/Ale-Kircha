import re

with open('src/controllers/reportController.ts', 'r') as f:
    content = f.read()

# Fix line 186 - missing colon
content = content.replace(
    'delivery: { include: { order: true } }',
    'delivery: { include: { order: true } }'
)

# Also fix any deliveryAddress references
content = content.replace(
    'deliveryAddress: true',
    'delivery: { include: { order: true } }'
)

with open('src/controllers/reportController.ts', 'w') as f:
    f.write(content)

print("✅ Fixed reportController.ts")
