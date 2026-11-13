import urllib.request
import urllib.parse
import re

def search_ddg(query):
    encoded = urllib.parse.quote(query)
    url = f"https://html.duckduckgo.com/html/?q={encoded}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8')
            # Extract unsplash photo links
            links = re.findall(r'https?://unsplash\.com/photos/([a-zA-Z0-9\-_]+)', html)
            unique = list(dict.fromkeys(links))
            return unique
    except Exception as e:
        print(f"Error: {e}")
        return []

queries = [
    'site:unsplash.com/photos african entrepreneur customer',
    'site:unsplash.com/photos african business meeting modern team',
    'site:unsplash.com/photos black owned business owner retail'
]

for q in queries:
    res = search_ddg(q)
    print(f"=== {q} ===")
    for photo_slug in res[:4]:
        print(f"Slug: {photo_slug}")

