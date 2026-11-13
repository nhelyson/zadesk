import urllib.request
import re
import json

def get_unsplash_photos(query):
    url = f"https://unsplash.com/s/photos/{query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8')
            # Extract photo image links: https://images.unsplash.com/photo-XXXXXXXX-XXXXXX
            matches = re.findall(r'https://images\.unsplash\.com/photo-([a-zA-Z0-9\-_]+)', html)
            unique_ids = []
            for m in matches:
                if len(m) > 10 and m not in unique_ids:
                    unique_ids.append(m)
            return unique_ids[:5]
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

for q in ['african-entrepreneur', 'black-business-owner', 'african-business-meeting', 'african-customer']:
    ids = get_unsplash_photos(q)
    print(f"=== {q} ===")
    for photo_id in ids:
        img_url = f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1920&q=85"
        print(f"https://unsplash.com/photos/{photo_id} -> {img_url}")

