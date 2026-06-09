import json
import openpyxl
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
wb = openpyxl.load_workbook(ROOT / 'clearwater_dentist_gsc_url_migration_map.xlsx', read_only=True, data_only=True)
ws = wb['URL Migration Map']
rows = list(ws.iter_rows(values_only=True))
header = rows[0]
data = [dict(zip(header, r)) for r in rows[1:] if r[0]]
pages = json.loads((ROOT / 'src/content/pages.json').read_text(encoding='utf-8'))
v2 = {p['route'] for p in pages}
v2_lower = {r.lower(): r for r in v2}

def base_path(path):
    p = (path or '/').split('?')[0].split('#')[0] or '/'
    return p

def in_v2(path):
    return base_path(path).lower() in v2_lower

redirects = json.loads((ROOT / 'src/content/redirects.json').read_text(encoding='utf-8'))
redirect_from = {r['from'].lower() for r in redirects}

def resolved(path):
    base = base_path(path)
    if base.lower() in redirect_from:
        return 'redirect'
    if base.lower() in v2_lower:
        return 'page'
    return 'missing'

print('GSC URL rows:', len(data))
print('Direct v2 pages:', sum(1 for r in data if resolved(r['Path']) == 'page'))
print('Handled by redirects:', sum(1 for r in data if resolved(r['Path']) == 'redirect'))
print('Still unmatched:', sum(1 for r in data if resolved(r['Path']) == 'missing'))
still_missing = [r for r in data if resolved(r['Path']) == 'missing']
still_missing.sort(key=lambda r: -(r['Impressions'] or 0))
print('\n=== STILL UNMATCHED (host/subdomain cleanup at launch) ===')
for row in still_missing:
    print(f"{int(row['Impressions'] or 0):>7} impr | {int(row['Clicks'] or 0):>4} clk | {row['Path']} | {row['V2 status']}")
