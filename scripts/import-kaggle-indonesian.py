"""Import the user-selected Indonesian Parfume CSV without inferring notes."""
import argparse
import csv
import hashlib
import io
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = 'https://www.kaggle.com/datasets/zhafrankuncoro/indonesian-parfume'
CONCENTRATIONS = {'EDP': 'Eau de Parfum', 'XDP': 'Extrait de Parfum', 'EDT': 'Eau de Toilette'}


def notes(value):
    if value.strip().lower() in ['', '-', 'n/a', 'nan', 'none']:
        return [], None
    result = []
    for token in value.split(','):
        token = re.sub(r'[\u200b-\u200d\ufeff]', '', token)
        token = re.sub(r'\s+', ' ', token).strip().rstrip('.').strip()
        if not token:
            continue
        if re.search(r'[/|;?\n]', token) or len(token) > 80:
            return [], 'ambiguous_note_separator'
        if len(token.split()) > 4 and '(' not in token and 'a.k.a' not in token:
            return [], 'unparsed_note_list'
        result.extend(part.strip() for part in re.split(r'\s+(?:and|&)\s+', token, flags=re.I) if part.strip())
    return list(dict.fromkeys(result)), None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--archive', required=True)
    parser.add_argument('--metadata', required=True)
    args = parser.parse_args()
    metadata = json.loads(Path(args.metadata).read_text())
    if metadata['ref'] != 'zhafrankuncoro/indonesian-parfume' or metadata['licenseName'] != 'CC BY-SA 4.0':
        raise ValueError('Dataset identity or license changed; review metadata before importing.')
    with zipfile.ZipFile(args.archive) as archive:
        files = [name for name in archive.namelist() if name.lower().endswith('.csv')]
        if len(files) != 1:
            raise ValueError('Expected exactly one CSV in the selected dataset.')
        filename = files[0]
        raw = archive.read(filename)
    rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
    perfumes = []
    seen = set()
    for row in rows:
        identity = row['ID_Perfume'].strip()
        brand, name = row['brand'].strip(), row['perfume'].strip()
        if not identity or identity in seen or not brand or not name:
            raise ValueError('Missing or duplicate source identity: ' + identity)
        seen.add(identity)
        pyramid, issues = {}, []
        if name.lower() in ['edp', 'edt', 'xdp', 'eau de parfum', 'extrait de parfum']:
            issues.append({'reason': 'name_is_only_concentration'})
        for stage, field in [('top', 'top notes'), ('middle', 'mid notes'), ('base', 'base notes')]:
            pyramid[stage], issue = notes(row[field])
            if issue:
                issues.append({'stage': stage, 'reason': issue, 'source_value': row[field]})
        concentration = CONCENTRATIONS.get(row['concentrate'].strip())
        if not concentration:
            issues.append({'reason': 'unknown_concentration', 'source_value': row['concentrate']})
        price = row['price'].strip()
        if re.fullmatch(r'\d{1,3}(?:\.\d{3})+', price):
            price = price.replace('.', '')
        if price and not price.isdecimal():
            issues.append({'reason': 'invalid_price', 'source_value': price})
        perfumes.append({'id': identity, 'brand': brand, 'name': name, 'concentration': concentration,
                         'price_idr': int(price) if price.isdecimal() and int(price) > 0 else None,
                         'notes': pyramid, 'image_url': None, 'source_url': SOURCE,
                         'source_size': row['size'].strip(), 'source_situation': row['situation'].strip(),
                         'source_gender': row['gender'].strip(), 'issues': issues})
    output = ROOT / 'data/kaggle-indonesian'
    output.mkdir(parents=True, exist_ok=True)
    (output / filename).write_bytes(raw)
    imported = {'source': metadata['title'], 'source_url': SOURCE, 'creator': metadata['creatorName'],
                'license': metadata['licenseName'], 'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
                'version': metadata['currentVersionNumber'], 'source_updated_at': metadata['lastUpdated'],
                'imported_at': datetime.now(timezone.utc).isoformat(), 'scope': 'Indonesian brands, as stated in dataset description',
                'count': len(rows), 'csv_sha256': hashlib.sha256(raw).hexdigest(),
                'modifications': 'Whitespace and comma-separated notes normalized; concentration abbreviations expanded using dataset documentation; no inferred notes or images.'}
    (output / 'perfumes.json').write_text(json.dumps({'metadata': imported, 'perfumes': perfumes}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'entries': len(rows), 'with_issues': sum(bool(item['issues']) for item in perfumes)}, indent=2))


if __name__ == '__main__':
    main()
