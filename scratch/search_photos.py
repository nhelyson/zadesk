import urllib.request
import json
import urllib.parse

queries = [
    'african small business owner customer',
    'african entrepreneur store retail',
    'african business team meeting modern'
]

for q in queries:
    encoded = urllib.parse.quote(q)
    url = f"https://unsplash.com/napi/search/photos?query={encoded}&per_page=6"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"=== Query: {q} ===")
            for r in data.get('results', [])[:4]:
                photo_id = r.get('id')
                desc = r.get('alt_description') or r.get('description')
                author = r.get('user', {}).get('name')
                regular_url = r.get('urls', {}).get('regular')
                full_url = r.get('urls', {}).get('full')
                width = r.get('width')
                height = r.get('height')
                print(f"ID: {photo_id} | {width}x{height} | By: {author}")
                print(f"Desc: {desc}")
                print(f"URL: {regular_url}")
                print("-" * 40)
    except Exception as e:
        print(f"Error for {q}: {e}")

