import json

steps = [11841, 11843, 11845, 11847]
with open('C:/Users/japhet/.gemini/antigravity/brain/c97ab7da-8e88-447f-b549-ed09d0cb31f6/.system_generated/logs/transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        idx = data.get('step_index')
        if idx in steps:
            content = data.get('content', '')
            print(f"Found step {idx}, length: {len(content)}")
            with open(f'scratch/step_{idx}.txt', 'w', encoding='utf-8') as out:
                out.write(content)

