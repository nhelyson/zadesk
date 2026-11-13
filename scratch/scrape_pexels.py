import urllib.request
import re

def get_pexels_photos(query):
    url = f"https://www.pexels.com/search/{query}/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8')
            matches = re.findall(r'https://images\.pexels\.com/photos/(\d+)/[^\s"\'?]+', html)
            unique_ids = list(dict.fromkeys(matches))
            return unique_ids[:6]
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

for q in ['african-customer', 'african-business-owner', 'african-team-meeting']:
    ids = get_pexels_photos(q)
    print(f"=== {q} ===")
    for pid in ids:
        img_url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=1920"
        print(f"ID {pid} -> {img_url}")

