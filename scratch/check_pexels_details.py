import urllib.request
import json
import re

for pid in ['8475204', '2520446', '30275077', '7693863', '7551442', '5935242']:
    url = f"https://www.pexels.com/photo/{pid}/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8')
            # Extract meta title or description
            title_m = re.search(r'<title>(.*?)</title>', html)
            desc_m = re.search(r'<meta name="description" content="(.*?)"', html)
            title = title_m.group(1) if title_m else 'No title'
            desc = desc_m.group(1) if desc_m else 'No desc'
            print(f"Pexels {pid}: {title}")
            print(f"Desc: {desc}")
            print("-" * 40)
    except Exception as e:
        print(f"Error {pid}: {e}")

