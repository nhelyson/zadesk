import urllib.request
from PIL import Image
import io

candidates = [
    '13722668',
    '39634272',
    '29630128',
    '34735506',
    '5028727',
    '5368632',
    '8867400',
    '3873735'
]

req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in candidates:
    url = f"https://images.pexels.com/photos/{cid}/pexels-photo-{cid}.jpeg?auto=compress&cs=tinysrgb&w=1920"
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            img = Image.open(io.BytesIO(data))
            out_file = f"frontend/public/images/pexels-{cid}.jpg"
            img.save(out_file, "JPEG", quality=85)
            print(f"Downloaded {cid}: {img.size}")
    except Exception as e:
        print(f"Error {cid}: {e}")

