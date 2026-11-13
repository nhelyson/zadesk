import urllib.request
from PIL import Image
import io

urls = [
    ("https://upload.wikimedia.org/wikipedia/commons/f/ff/A_business_man_attending_to_his_customer.jpg", "wla-businessman-customer.jpg"),
    ("https://upload.wikimedia.org/wikipedia/commons/5/59/Barber_and_smiling_customer_in_a_Kenyan_barbershop.jpg", "wla-barbershop-customer.jpg"),
    ("https://upload.wikimedia.org/wikipedia/commons/0/01/The_Wot-If_Trust%2C_South_Africa_2.jpg", "wla-wotif-trust.jpg"),
]

req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for url, filename in urls:
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            img = Image.open(io.BytesIO(data))
            # save web-optimized 1920px version
            img.thumbnail((1920, 1280))
            out_path = f"frontend/public/images/{filename}"
            img.save(out_path, "JPEG", quality=85)
            print(f"Saved {filename}: {img.size}")
    except Exception as e:
        print(f"Error {filename}: {e}")

