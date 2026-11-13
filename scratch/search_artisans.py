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
                title = info.get('title', '')
                if not (title.lower().endswith('.jpg') or title.lower().endswith('.jpeg')):
                    continue
                imageinfo = info.get('imageinfo', [{}])[0]
                img_url = imageinfo.get('url')
                width = imageinfo.get('width', 0)
                height = imageinfo.get('height', 0)
                if width < 1600 or height < 1000:
                    continue
                meta = imageinfo.get('extmetadata', {})
                desc = meta.get('ImageDescription', {}).get('value', '')
                artist = meta.get('Artist', {}).get('value', '')
                license_name = meta.get('LicenseShortName', {}).get('value', '')
                results.append({
                    'title': title,
                    'url': img_url,
                    'width': width,
                    'height': height,
                    'desc': desc[:120],
                    'artist': artist[:50],
                    'license': license_name
                })
            return results
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

terms = [
    'tailor measuring customer Africa',
    'African artisan at work',
    'African modern office meeting',
    'African customer smartphone business'
]

for t in terms:
    res = search_commons(t, 6)
    print(f"=== {t} ({len(res)} matches) ===")
    for r in res[:2]:
        print(f"Title: {r['title']} ({r['width']}x{r['height']})")
        print(f"License: {r['license']} | Artist: {r['artist']}")
        print(f"URL: {r['url']}")
        print(f"Desc: {r['desc']}")
        print("-" * 30)

