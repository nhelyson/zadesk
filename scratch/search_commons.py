import urllib.request
import json
import urllib.parse

def search_commons(query, limit=5):
    encoded = urllib.parse.quote(query)
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch={encoded}&gsrlimit={limit}&prop=imageinfo&iiprop=url|size|extmetadata"
    req = urllib.request.Request(url, headers={'User-Agent': 'ZadeskApp/1.0 (contact@zadesk.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            results = []
            for page_id, info in pages.items():
                title = info.get('title')
                imageinfo = info.get('imageinfo', [{}])[0]
                img_url = imageinfo.get('url')
                width = imageinfo.get('width')
                height = imageinfo.get('height')
                meta = imageinfo.get('extmetadata', {})
                desc = meta.get('ImageDescription', {}).get('value', '')
                artist = meta.get('Artist', {}).get('value', '')
                license_name = meta.get('LicenseShortName', {}).get('value', '')
                results.append({
                    'title': title,
                    'url': img_url,
                    'width': width,
                    'height': height,
                    'desc': desc[:100],
                    'artist': artist[:50],
                    'license': license_name
                })
            return results
    except Exception as e:
        print(f"Error for {query}: {e}")
        return []

queries = ['African entrepreneur', 'African small business', 'African market trader customer', 'African tech startup meeting']
for q in queries:
    res = search_commons(q, limit=3)
    print(f"=== {q} ({len(res)} results) ===")
    for r in res:
        print(f"Title: {r['title']} | {r['width']}x{r['height']} | License: {r['license']}")
        print(f"URL: {r['url']}")
        print(f"Artist: {r['artist']}")
        print("-" * 30)

