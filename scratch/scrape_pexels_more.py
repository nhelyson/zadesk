import urllib.request
import re

queries = ['african-tailor', 'african-store', 'african-pharmacist', 'african-artisan', 'african-hairdresser', 'african-coffee']
found_ids = {}

for q in queries:
    url = f"https://www.pexels.com/search/{q}/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode('utf-8')
            matches = re.findall(r'https://images\.pexels\.com/photos/(\d+)/[^\s"\'?]+', html)
            unique = list(dict.fromkeys(matches))
            if unique:
                found_ids[q] = unique[:4]
                print(f"Found {len(unique)} for {q}: {unique[:3]}")
    except Exception as e:
        pass

print("Summary:", found_ids)

