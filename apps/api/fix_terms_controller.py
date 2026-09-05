import re

with open('src/controllers/termsController.ts', 'r') as f:
    content = f.read()

# Fix isActive -> isCurrent for terms
content = content.replace('isActive:', 'isCurrent:')
content = content.replace('isActive =', 'isCurrent =')
content = content.replace('{ isActive: true }', '{ isCurrent: true }')

# Fix effectiveFrom -> effectiveDate
content = content.replace('effectiveFrom:', 'effectiveDate:')
content = content.replace('effectiveFrom =', 'effectiveDate =')
content = content.replace('orderBy: { effectiveFrom:', 'orderBy: { effectiveDate:')

# Fix languageUsed -> language
content = content.replace('languageUsed:', 'language:')

with open('src/controllers/termsController.ts', 'w') as f:
    f.write(content)

print("✅ Fixed terms controller")
