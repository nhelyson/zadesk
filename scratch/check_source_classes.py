with open('scratch/build_enhanced_diagram.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Print lines 20 to 120
lines = text.splitlines()
print('\n'.join(lines[20:100]))
