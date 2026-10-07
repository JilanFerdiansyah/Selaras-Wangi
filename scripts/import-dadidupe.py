"""Extract factual catalog fields from downloaded public Dadidupe HTML."""
import argparse
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree


def decode(value):
    if len(value) == 1:
        return None
    kind, payload = value
    if kind == 1:
        return [decode(item) for item in payload]
    if kind == 0:
        return {key: decode(item) for key, item in payload.items()} if isinstance(payload, dict) else payload
    raise ValueError(f"Unexpected Astro data type: {kind}")


class Islands(HTMLParser):
    def __init__(self):
        super().__init__()
        self.props = []

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag == 'astro-island' and 'props' in attributes:
            self.props.append({key: decode(value) for key, value in json.loads(attributes['props']).items()})


def extract(filename, key):
    parser = Islands()
    parser.feed(filename.read_text())
    matches = [props[key] for props in parser.props if key in props]
    if len(matches) != 1 or not isinstance(matches[0], list):
        raise ValueError(f"Expected one {key} catalog in {filename}")
    return matches[0]


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--input-prefix', required=True, help='Prefix for -perfumes.html, -brands.html, -notes.html and -sitemap0.xml')
    options = args.parse_args()
    root = Path(__file__).resolve().parent.parent
    prefix = options.input_prefix
    perfumes = extract(Path(prefix + '-perfumes.html'), 'perfumes')
    brands = {item['key']: item['name'] for item in extract(Path(prefix + '-brands.html'), 'brands')}
    notes = {item['key']: item['name'] for item in extract(Path(prefix + '-notes.html'), 'notes')}
    sitemap = ElementTree.parse(prefix + '-sitemap0.xml')
    urls = {element.text.rstrip('/') for element in sitemap.iter() if element.tag.endswith('}loc') or element.tag == 'loc'}
    facts = []
    seen = set()
    for perfume in perfumes:
        identity = perfume['id']
        if identity in seen:
            raise ValueError(f'Duplicate source ID: {identity}')
        seen.add(identity)
        brand_key = perfume['brand']
        if brand_key not in brands:
            raise ValueError(f'Unknown brand: {brand_key}')
        suffix = perfume['slug'].removeprefix(brand_key + '-')
        url = f'https://dadidupe.com/perfumes/{brand_key}/{suffix}'
        if url not in urls:
            raise ValueError(f'Product URL absent from public sitemap: {url}')
        source_notes = perfume.get('notes') or {}
        note_ids = {stage: [key for key in source_notes.get(source_stage, []) if key] for stage, source_stage in [('top', 'top'), ('middle', 'heart'), ('base', 'base')]}
        if perfume.get('linear'):
            note_ids['linear'] = [key for key in perfume['linear'] if key]
        unresolved = sorted({key for values in note_ids.values() for key in values if key not in notes})
        facts.append({
            'id': identity, 'brand_key': brand_key, 'brand': brands[brand_key],
            'name': perfume['name'], 'concentration': perfume.get('concentration'),
            'image_url': perfume.get('image'), 'source_url': url,
            'notes': {stage: [notes[key] for key in values if key in notes] for stage, values in note_ids.items()},
            'source_note_ids': note_ids, 'unresolved_note_ids': unresolved,
        })
    output = root / 'data' / 'dadidupe' / 'perfumes.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    dataset = {'metadata': {'source': 'Dadidupe', 'source_url': 'https://dadidupe.com/perfumes', 'imported_at': datetime.now(timezone.utc).isoformat(), 'scope': 'Indonesian fragrance catalog', 'count': len(facts)}, 'perfumes': facts}
    output.write_text(json.dumps(dataset, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'output': str(output), 'entries': len(facts), 'unresolved_notes': sum(bool(item['unresolved_note_ids']) for item in facts), 'without_notes': sum(not any(item['notes'].values()) for item in facts)}))


if __name__ == '__main__':
    main()
