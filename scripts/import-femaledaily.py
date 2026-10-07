"""Extract labeled note pyramids from Wangi's saved Female Daily descriptions."""
import argparse
import csv
import hashlib
import io
import json
import re
import unicodedata
from html import unescape
from html.parser import HTMLParser
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
STAGE = re.compile(r'(\btop|middle|heart|base)\s*(?:notes?)?\s*:', re.I)
END = re.compile(r'how\s*to\s*use|suitable\s*for|ingredients?\s*:|longevity\s*:|sillage\s*:|projection\s*:|ukuran\s*:|ketahanan\s*:|tips\s+penggunaan', re.I)


def normalize(value):
    text = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower().replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text)


def read_csv(filename):
    text = Path(filename).read_bytes().decode('utf-8', errors='surrogateescape')
    text = ''.join(bytes([ord(char) - 0xDC00]).decode('cp1252', errors='replace') if 0xDC80 <= ord(char) <= 0xDCFF else char for char in text)
    return list(csv.DictReader(io.StringIO(text)))


def extract_notes(description):
    description = unescape(unescape(description))
    labels = list(STAGE.finditer(description))
    if [match[1].lower() for match in labels] not in [['top', 'middle', 'base'], ['top', 'heart', 'base']]:
        return None, 'missing_or_ambiguous_pyramid'
    notes = {}
    for index, label in enumerate(labels):
        section = description[label.end():labels[index + 1].start() if index < 2 else len(description)]
        section = END.split(section)[0]
        # A sentence after a note list is description copy, not another note.
        section = re.split(r'[.!](?:\s|[A-Z]|$)', section, maxsplit=1)[0]
        section = section.strip(' \n\r\t.,;:-–—•')
        tokens = [re.sub(r'\s+', ' ', token).strip(' \n\r\t.,;:-–—•') for token in re.split(r'[,|;•&]|\s+(?:and|dan)\s+', section, flags=re.I)]
        tokens = [re.sub(r'^(?:and|dan)\s+', '', token, flags=re.I) for token in tokens if token]
        if not tokens or any(len(token) > 60 or len(token.split()) > 5 or re.search(r'[^\w\s&()\-]', token) for token in tokens):
            return None, 'ambiguous_note_text'
        stage = 'middle' if label[1].lower() == 'heart' else label[1].lower()
        notes[stage] = list(dict.fromkeys(tokens))
    return notes, None


def product_name(row):
    name = row['product_name'].strip()
    variant = row['product_variant'].strip()
    if name.lower() == 'perfumery':
        name = variant
    elif variant:
        name += ' (' + variant + ')' if re.search(r'reformul', variant, re.I) else ' ' + variant
    concentration = None
    for pattern, display in [
        (r'\bextrait\s+de\s+(?:parfum|parfume|perfume)\b', 'Extrait de Parfum'),
        (r'\b(?:eau|eu)\s+de\s+(?:parfum|parfume|perfume)\b|\bEDP\b', 'Eau de Parfum'),
        (r'\beau\s+de\s+toilette\b|\bEDT\b', 'Eau de Toilette')]:
        if re.search(pattern, name, re.I):
            concentration = display
            name = re.sub(pattern, ' ', name, flags=re.I)
            break
    return re.sub(r'\s+', ' ', name).strip(), concentration


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = {}

    def handle_starttag(self, tag, attributes):
        if tag == 'meta':
            attributes = dict(attributes)
            self.values[attributes.get('name', attributes.get('property', ''))] = attributes.get('content', '')


def verify_sources(prefix):
    output = ROOT / 'data/femaledaily'
    dataset = json.loads((output / 'perfumes.json').read_text())
    verification = []
    for perfume in dataset['perfumes']:
        filename = Path(prefix + perfume['id'] + '.html')
        if not filename.exists():
            continue
        parser = Metadata()
        parser.feed(filename.read_text())
        notes, reason = extract_notes(parser.values.get('description', ''))
        same_notes = notes and all([normalize(note) for note in notes[stage]] == [normalize(note) for note in perfume['notes'][stage]] for stage in ['top', 'middle', 'base'])
        keywords = parser.values.get('keywords', '')
        expected = perfume['source_identity']['product_name'] + ' ' + perfume['source_identity']['brand_name']
        if normalize(keywords) != normalize(expected):
            reason = 'public_identity_mismatch'
        if not reason and not same_notes:
            reason = 'public_notes_mismatch'
        if perfume['id'] == '50d084ad46bebbf6':
            reason = 'ambiguous_combined_note_labels'
        image_url = parser.values.get('thumbnailUrl', '')
        image = urlsplit(image_url)
        if image.scheme != 'https' or image.hostname != 'image.femaledaily.com':
            image_url = None
        verification.append({'id': perfume['id'], 'source_url': perfume['source_url'], 'status': 'excluded' if reason else 'verified',
                             'reason': reason, 'public_keywords': keywords,
                             'public_notes': notes, 'image_url': image_url, 'page_sha256': hashlib.sha256(filename.read_bytes()).hexdigest()})
    (output / 'source-verification.json').write_text(json.dumps(verification, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'verified': sum(item['status'] == 'verified' for item in verification), 'excluded': sum(item['status'] == 'excluded' for item in verification)}))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--descriptions')
    parser.add_argument('--identities')
    parser.add_argument('--verify-prefix', help='Prefix for downloaded product pages, followed by ID and .html')
    args = parser.parse_args()
    if args.verify_prefix:
        verify_sources(args.verify_prefix)
        return
    if not args.descriptions or not args.identities:
        parser.error('--descriptions and --identities are required for extraction')
    descriptions = read_csv(args.descriptions)
    identities = {}
    for row in read_csv(args.identities):
        url = row['link_product']
        if url in identities:
            raise ValueError('Duplicate identity URL: ' + url)
        identities[url] = row
    brand_map = json.loads((ROOT / 'data/femaledaily/brand-map.json').read_text())
    facts, excluded = [], []
    seen = set()
    for record in descriptions:
        url = record['url']
        if url in seen:
            raise ValueError('Duplicate description URL: ' + url)
        seen.add(url)
        row = identities.get(url)
        if not row:
            excluded.append({'source_url': url, 'reason': 'missing_identity'})
            continue
        brand = brand_map.get(normalize(row['brand_name']))
        if not brand:
            excluded.append({'source_url': url, 'brand': row['brand_name'], 'reason': 'brand_not_verified_indonesian'})
            continue
        notes, reason = extract_notes(record['product_desc'])
        if reason:
            excluded.append({'source_url': url, 'brand': brand['name'], 'reason': reason})
            continue
        name, concentration = product_name(row)
        parsed = urlsplit(url)
        if parsed.hostname != 'reviews.femaledaily.com' or not name:
            raise ValueError('Invalid source identity: ' + url)
        identity = hashlib.sha256(url.encode()).hexdigest()[:16]
        facts.append({'id': identity, 'brand': brand['name'], 'name': name, 'concentration': concentration,
                      'notes': notes, 'source_url': url, 'image_url': None,
                      'source_identity': {key: row[key] for key in ['brand_name', 'product_name', 'product_variant']},
                      'brand_evidence': brand['evidence']})
    output = ROOT / 'data/femaledaily'
    metadata = {'source': 'Female Daily via Wangi CSV', 'source_url': 'https://github.com/syariefsq/wangi-perfume-recommender/tree/main/data',
                'imported_at': datetime.now(timezone.utc).isoformat(), 'description_rows': len(descriptions), 'eligible_pyramids': len(facts),
                'input_sha256': {kind: hashlib.sha256(Path(filename).read_bytes()).hexdigest() for kind, filename in [('descriptions', args.descriptions), ('identities', args.identities)]}}
    (output / 'perfumes.json').write_text(json.dumps({'metadata': metadata, 'perfumes': facts}, ensure_ascii=False, indent=2) + '\n')
    (output / 'extraction-review.json').write_text(json.dumps(excluded, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(metadata, indent=2))


if __name__ == '__main__':
    main()
