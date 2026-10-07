import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceFile = path.join(root, 'data', 'cariparfum', 'perfumes.json');
const outputDir = path.join(root, 'data', 'app');
const prettyFile = path.join(outputDir, 'catalog.json');
const compactFile = path.join(outputDir, 'catalog.min.json');
const browserFile = path.join(outputDir, 'catalog.js');
const readmeFile = path.join(outputDir, 'README.md');

const cleanText = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const normalizeKey = value => cleanText(value)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const uniqueText = values => {
  const seen = new Set();
  return (values ?? []).map(cleanText).filter(value => {
    const key = normalizeKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const cleanCondition = value => cleanText(value)
  .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
  .trim();

const raw = JSON.parse(await readFile(sourceFile, 'utf8'));
const sourcePerfumes = raw.perfumes ?? [];
const ids = new Set();
const noteUsage = new Map();

const perfumes = sourcePerfumes.map(item => {
  const id = cleanText(item.slug);
  if (!id || ids.has(id)) throw new Error(`Missing or duplicate perfume id: ${id}`);
  ids.add(id);

  const notes = {
    top: uniqueText(item.notes?.top),
    middle: uniqueText(item.notes?.middle),
    base: uniqueText(item.notes?.base)
  };
  const noteKeys = [...new Set([...notes.top, ...notes.middle, ...notes.base].map(normalizeKey))];
  for (const key of noteKeys) {
    const display = [...notes.top, ...notes.middle, ...notes.base].find(note => normalizeKey(note) === key);
    const existing = noteUsage.get(key) ?? { key, name: display, perfume_count: 0 };
    existing.perfume_count += 1;
    noteUsage.set(key, existing);
  }

  const brand = cleanText(item.brand);
  const name = cleanText(item.name);
  if (!brand || !name) throw new Error(`Perfume ${id} is missing its brand or name.`);

  return {
    id,
    brand,
    name,
    concentration: cleanText(item.concentration) || null,
    price_idr: Number(item.price_idr) || null,
    image_url: item.image_urls?.[0] ?? null,
    notes,
    note_keys: noteKeys,
    families: uniqueText(item.scent_families),
    characters: uniqueText(item.characters),
    gender: uniqueText(item.gender),
    occasions: uniqueText(item.occasions),
    conditions: uniqueText((item.best_time_weather ?? []).map(cleanCondition)),
    source_url: item.source_url,
    purchase_url: item.purchase_url ?? null
  };
}).sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'id'));

const brands = [...new Set(perfumes.map(item => item.brand))].sort((a, b) => a.localeCompare(b, 'id'));
const noteIndex = [...noteUsage.values()].sort((a, b) => b.perfume_count - a.perfume_count || a.name.localeCompare(b.name));
const generatedAt = new Date().toISOString();
const catalog = {
  schema_version: 1,
  generated_at: generatedAt,
  source: {
    name: 'CariParfum',
    url: 'https://cariparfum.com',
    imported_at: raw.metadata?.imported_at ?? null
  },
  counts: {
    perfumes: perfumes.length,
    brands: brands.length,
    notes: noteIndex.length,
    with_price: perfumes.filter(item => item.price_idr).length,
    with_image: perfumes.filter(item => item.image_url).length
  },
  brands,
  note_index: noteIndex,
  perfumes
};

await mkdir(outputDir, { recursive: true });
const compact = JSON.stringify(catalog);
await writeFile(prettyFile, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(compactFile, compact);
await writeFile(browserFile, `window.SELARAS_WANGI_CATALOG=${compact};\n`);
await writeFile(readmeFile, `# Selaras Wangi app catalog

Generated from the reviewed CariParfum import on ${generatedAt.slice(0, 10)}.

## Contents

- ${catalog.counts.perfumes} perfumes
- ${catalog.counts.brands} brands
- ${catalog.counts.notes} normalized note keys
- ${catalog.counts.with_price} perfumes with a price snapshot
- ${catalog.counts.with_image} perfumes with a primary image

## Files

- \`catalog.json\` — readable production catalog
- \`catalog.min.json\` — compact version for deployment
- \`catalog.js\` — browser-ready version for the current local-file prototype

Each perfume retains display notes and normalized \`note_keys\` for matching. The source descriptions, extra gallery images, and importer-only metadata were intentionally removed from the app payload.
`);

console.log(JSON.stringify({
  output: outputDir,
  ...catalog.counts,
  pretty_bytes: Buffer.byteLength(JSON.stringify(catalog, null, 2)),
  compact_bytes: Buffer.byteLength(compact)
}, null, 2));
