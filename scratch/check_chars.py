import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

bad_chars = [c for c in text if ord(c) == 0xFFFD or ord(c) > 10000]
print(f"Total bad characters: {len(bad_chars)}")

# Check for 'l\'éÉquipe' on line 402:
if "l'éÉquipe" in text:
    print("Found typo l'éÉquipe, fixing...")
    text = text.replace("l'éÉquipe", "l'Équipe")

# Check for any remaining '?' that was supposed to be dash
text = text.replace('ZADESK ? DIAGRAMME', 'ZADESK — DIAGRAMME')

with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'w', encoding='utf-8') as f:
    f.write(text)

print("Checked and finalized!")

