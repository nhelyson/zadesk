import sys
sys.stdout.reconfigure(encoding='utf-8')

for path in ['frontend/src/app/entreprises/[slug]/page.tsx', 'frontend/src/components/public/CompanyInfoBubbleModal.tsx', 'frontend/src/components/public/DirectoryCompanyCard.tsx']:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        print(f"=== {path} ===")
        for kw in ['address', 'city', 'opening', 'hours', 'agency', 'agencies', 'guichet']:
            count = text.lower().count(kw)
            print(f"  {kw}: {count}")
    except Exception as e:
        print(f"Error {path}: {e}")

