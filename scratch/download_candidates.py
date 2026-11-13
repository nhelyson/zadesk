import urllib.request
from PIL import Image
import io

test_urls = [
    ("https://images.pexels.com/photos/8475204/pexels-photo-8475204.jpeg?auto=compress&cs=tinysrgb&w=1920", "pexels-8475204.jpg"),
    ("https://images.pexels.com/photos/2520446/pexels-photo-2520446.jpeg?auto=compress&cs=tinysrgb&w=1920", "pexels-2520446.jpg"),
    ("https://images.pexels.com/photos/30275077/pexels-photo-30275077.jpeg?auto=compress&cs=tinysrgb&w=1920", "pexels-30275077.jpg"),
    ("https://upload.wikimedia.org/wikipedia/commons/4/40/Celebrating_Collaboration.jpg", "wikimedia-collab.jpg"),
]

req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for url, filename in test_urls:
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            img = Image.open(io.BytesIO(data))
            out_path = f"frontend/public/images/{filename}"
            with open(out_path, "wb") as f:
                f.write(data)
            print(f"Downloaded {filename}: {img.size} ({img.format}), bytes: {len(data)}")
    except Exception as e:
        print(f"Error {filename}: {e}")

