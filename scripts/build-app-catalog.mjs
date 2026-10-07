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
const dadidupe = JSON.parse(await readFile(path.join(root, 'data', 'dadidupe', 'perfumes.json'), 'utf8'));
const femaleDaily = JSON.parse(await readFile(path.join(root, 'data', 'femaledaily', 'perfumes.json'), 'utf8'));
const verifiedFemaleDaily = new Map(JSON.parse(await readFile(path.join(root, 'data', 'femaledaily', 'source-verification.json'), 'utf8')).map(item => [item.id, item]));
const kaggle = JSON.parse(await readFile(path.join(root, 'data', 'kaggle-indonesian', 'perfumes.json'), 'utf8'));
const kaggleIdentityReview = JSON.parse(await readFile(path.join(root, 'data', 'kaggle-indonesian', 'identity-review.json'), 'utf8'));
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

const brandAliases = {
  aamo: 'Aamo Parfums', alt: 'Alt Perfumery', altar: 'Altar Scents',
  dappers: 'House of Dappers', mine: 'Mine Perfumery', saka: 'SAKA Perfumery',
  sarcasm: 'Sarcasm Fragrance', saudade: 'Saudade Olfactory', scentalgia: 'Scentalgia Fragrance'
};
const existingBrands = new Map(perfumes.map(item => [normalizeKey(item.brand).replace(/ /g, ''), item.brand]));
const identityKey = (brand, name) => `${normalizeKey(brand).replace(/ /g, '')}:${normalizeKey(name).replace(/ /g, '')}`;
const byIdentity = new Map();
for (const perfume of perfumes) {
  const key = identityKey(perfume.brand, perfume.name);
  byIdentity.set(key, [...(byIdentity.get(key) ?? []), perfume]);
}
const concentrations = { EDP: 'Eau de Parfum', EDT: 'Eau de Toilette', Extrait: 'Extrait de Parfum' };
const possibleDuplicates = {
  'aamo-glace-amor': 'aamo-glace-amore',
  'alt-shift-hydra': 'alt-perfumery-shft-hydra',
  'hmns-essence-of-the-sun-eos': 'hmns-essence-of-the-sun',
  'hmns-melting-temptation-orgsm': 'hmns-orgsm-melting-temptation',
  'ynperfumery-vintage-tobacco': 'yn-perfumery-masculine-vintage-tobacco'
};
const review = { added: [], duplicates: [], conflicts: [], excluded: [] };
for (const item of dadidupe.perfumes) {
  const brand = brandAliases[item.brand_key] ?? existingBrands.get(normalizeKey(item.brand).replace(/ /g, '')) ?? cleanText(item.brand);
  const name = cleanText(item.name);
  const notes = Object.fromEntries(Object.entries(item.notes).map(([stage, values]) => [stage, uniqueText(values)]));
  const noteKeys = [...new Set(Object.values(notes).flat().map(normalizeKey))];
  const concentration = concentrations[item.concentration] ?? null;
  const candidates = byIdentity.get(identityKey(brand, name)) ?? [];
  const record = { source_id: item.id, brand, name, source_url: item.source_url };
  if (possibleDuplicates[item.id]) {
    review.excluded.push({ ...record, reason: 'possible_duplicate_name', existing_id: possibleDuplicates[item.id] });
    continue;
  }
  if (candidates.length) {
    review.duplicates.push({ ...record, existing_ids: candidates.map(perfume => perfume.id) });
    const matching = candidates.find(perfume => perfume.concentration === concentration) ?? candidates[0];
    const missing = matching.note_keys.filter(key => !noteKeys.includes(key));
    const extra = noteKeys.filter(key => !matching.note_keys.includes(key));
    if (missing.length || extra.length || (concentration && matching.concentration !== concentration)) {
      review.conflicts.push({ ...record, existing_id: matching.id, existing_concentration: matching.concentration, incoming_concentration: concentration, only_existing_notes: missing, only_incoming_notes: extra });
    }
    continue;
  }
  if (!noteKeys.length || item.unresolved_note_ids.length || (item.concentration && !concentration)) {
    review.excluded.push({ ...record, reason: !noteKeys.length ? 'missing_notes' : item.unresolved_note_ids.length ? 'unresolved_note_names' : 'invalid_concentration', unresolved_note_ids: item.unresolved_note_ids });
    continue;
  }
  const id = `dadidupe-${item.id}`;
  if (ids.has(id)) throw new Error(`Duplicate perfume ID: ${id}`);
  ids.add(id);
  const perfume = { id, brand, name, concentration, price_idr: null, image_url: item.image_url || null, notes, note_keys: noteKeys, families: [], characters: [], gender: [], occasions: [], conditions: [], source_url: item.source_url, purchase_url: null };
  perfumes.push(perfume);
  byIdentity.set(identityKey(brand, name), [perfume]);
  review.added.push({ ...record, id });
}
const femaleDailyReview = { added: [], duplicates: [], conflicts: [], excluded: [] };
for (const item of femaleDaily.perfumes) {
  const brand = cleanText(item.brand);
  const name = cleanText(item.name);
  const record = { source_id: item.id, brand, name, source_url: item.source_url };
  const notes = Object.fromEntries(Object.entries(item.notes).map(([stage, values]) => [stage, uniqueText(values)]));
  const noteKeys = [...new Set(Object.values(notes).flat().map(normalizeKey))];
  const exact = byIdentity.get(identityKey(brand, name)) ?? [];
  if (exact.length) {
    femaleDailyReview.duplicates.push({ ...record, existing_ids: exact.map(perfume => perfume.id) });
    const existing = exact.find(perfume => perfume.concentration === item.concentration) ?? exact[0];
    const missing = existing.note_keys.filter(key => !noteKeys.includes(key));
    const extra = noteKeys.filter(key => !existing.note_keys.includes(key));
    if (missing.length || extra.length) femaleDailyReview.conflicts.push({ ...record, existing_id: existing.id, only_existing_notes: missing, only_incoming_notes: extra });
    continue;
  }
  const compactName = normalizeKey(name).replace(/ /g, '');
  const possible = perfumes.filter(perfume => perfume.brand === brand && (compactName.includes(normalizeKey(perfume.name).replace(/ /g, '')) || normalizeKey(perfume.name).replace(/ /g, '').includes(compactName)));
  if (possible.length) {
    femaleDailyReview.excluded.push({ ...record, reason: 'possible_duplicate_or_unspecified_variant', existing_ids: possible.map(perfume => perfume.id) });
    continue;
  }
  const verification = verifiedFemaleDaily.get(item.id);
  if (!noteKeys.length || verification?.status !== 'verified') {
    femaleDailyReview.excluded.push({ ...record, reason: verification?.reason ?? 'public_notes_not_verified' });
    continue;
  }
  const verifiedKeys = Object.fromEntries(Object.entries(verification.public_notes).map(([stage, values]) => [stage, uniqueText(values).map(normalizeKey)]));
  if (verification.source_url !== item.source_url || normalizeKey(verification.public_keywords) !== normalizeKey(`${item.source_identity.product_name} ${item.source_identity.brand_name}`)) throw new Error(`Female Daily identity verification is stale: ${item.id}`);
  if (JSON.stringify(verifiedKeys) !== JSON.stringify(Object.fromEntries(Object.entries(notes).map(([stage, values]) => [stage, values.map(normalizeKey)])))) throw new Error(`Female Daily verification is stale: ${item.id}`);
  const id = `femaledaily-${item.id}`;
  if (ids.has(id)) throw new Error(`Duplicate perfume ID: ${id}`);
  ids.add(id);
  const perfume = { id, brand, name, concentration: item.concentration, price_idr: null, image_url: verification.image_url ?? null, notes, note_keys: noteKeys, families: [], characters: [], gender: [], occasions: [], conditions: [], source_url: item.source_url, purchase_url: null };
  perfumes.push(perfume);
  byIdentity.set(identityKey(brand, name), [perfume]);
  femaleDailyReview.added.push({ ...record, id });
}
const kaggleBrandAliases = {
  balisurfersperfume: 'Bali Surfers', alchemistfragrance: 'Alchemist',
  carlandclaire: 'Carl Claire', ynparfumery: 'YN Perfumery',
  scentalgia: 'Scentalgia Fragrance', saka: 'SAKA Perfumery',
  alt: 'Alt Perfumery', altar: 'Altar Scents', loco: 'Loco Scent',
  diell: 'Diell Fragrance', saudade: 'Saudade Olfactory',
  jarte: 'Scent of Jarte', gioia: 'Gioia Fragrances', boura: 'REBOURA',
  rainebeauty: 'Raine'
};
const mergedBrandNames = new Map(perfumes.map(item => [normalizeKey(item.brand).replace(/ /g, ''), item.brand]));
const kaggleReview = { added: [], duplicates: [], conflicts: [], excluded: [] };
for (const item of kaggle.perfumes) {
  const brandKey = normalizeKey(item.brand).replace(/ /g, '');
  const brand = kaggleBrandAliases[brandKey] ?? mergedBrandNames.get(brandKey) ?? cleanText(item.brand);
  const name = cleanText(item.name);
  const record = { source_id: item.id, brand, name, source_url: item.source_url };
  const heldIdentity = kaggleIdentityReview[item.id];
  if (heldIdentity) {
    kaggleReview.excluded.push({ ...record, ...heldIdentity });
    continue;
  }
  const notes = Object.fromEntries(Object.entries(item.notes).map(([stage, values]) => [stage, uniqueText(values)]));
  const noteKeys = [...new Set(Object.values(notes).flat().map(normalizeKey))];
  const exact = byIdentity.get(identityKey(brand, name)) ?? [];
  if (exact.length) {
    kaggleReview.duplicates.push({ ...record, existing_ids: exact.map(perfume => perfume.id) });
    const existing = exact.find(perfume => perfume.concentration === item.concentration) ?? exact[0];
    const missing = existing.note_keys.filter(key => !noteKeys.includes(key));
    const extra = noteKeys.filter(key => !existing.note_keys.includes(key));
    if (missing.length || extra.length || existing.concentration !== item.concentration) kaggleReview.conflicts.push({ ...record, existing_id: existing.id, existing_concentration: existing.concentration, incoming_concentration: item.concentration, only_existing_notes: missing, only_incoming_notes: extra });
    continue;
  }
  const compactName = normalizeKey(name).replace(/ /g, '');
  const possible = perfumes.filter(perfume => perfume.brand === brand && (compactName.includes(normalizeKey(perfume.name).replace(/ /g, '')) || normalizeKey(perfume.name).replace(/ /g, '').includes(compactName)));
  if (possible.length) {
    kaggleReview.excluded.push({ ...record, reason: 'possible_duplicate_or_unspecified_variant', existing_ids: possible.map(perfume => perfume.id) });
    continue;
  }
  if (!noteKeys.length || item.issues.length) {
    kaggleReview.excluded.push({ ...record, reason: item.issues[0]?.reason ?? 'missing_notes', issues: item.issues });
    continue;
  }
  const id = `kaggle-indonesian-${item.id.toLowerCase()}`;
  if (ids.has(id)) throw new Error(`Duplicate perfume ID: ${id}`);
  ids.add(id);
  const perfume = { id, brand, name, concentration: item.concentration, price_idr: item.price_idr, price_snapshot_at: kaggle.metadata.source_updated_at, image_url: null, notes, note_keys: noteKeys, families: [], characters: [], gender: [], occasions: [], conditions: [], source_url: item.source_url, source_record_id: item.id, purchase_url: null };
  perfumes.push(perfume);
  byIdentity.set(identityKey(brand, name), [perfume]);
  mergedBrandNames.set(brandKey, brand);
  kaggleReview.added.push({ ...record, id });
}
perfumes.sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'id'));
for (const perfume of perfumes) {
  const displayNotes = Object.values(perfume.notes).flat();
  for (const key of perfume.note_keys) {
    const existing = noteUsage.get(key) ?? { key, name: displayNotes.find(note => normalizeKey(note) === key), perfume_count: 0 };
    existing.perfume_count += 1;
    noteUsage.set(key, existing);
  }
}

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
  sources: [
    { name: 'CariParfum', url: 'https://cariparfum.com', imported_at: raw.metadata?.imported_at ?? null },
    { name: 'Dadidupe', url: dadidupe.metadata.source_url, imported_at: dadidupe.metadata.imported_at },
    { name: 'Female Daily via Wangi CSV', url: femaleDaily.metadata.source_url, imported_at: femaleDaily.metadata.imported_at },
    { name: kaggle.metadata.source, url: kaggle.metadata.source_url, imported_at: kaggle.metadata.imported_at, creator: kaggle.metadata.creator, version: kaggle.metadata.version, license: kaggle.metadata.license, license_url: kaggle.metadata.license_url, modifications: kaggle.metadata.modifications }
  ],
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
await writeFile(path.join(root, 'data', 'dadidupe', 'merge-review.json'), `${JSON.stringify(review, null, 2)}\n`);
await writeFile(path.join(root, 'data', 'femaledaily', 'merge-review.json'), `${JSON.stringify(femaleDailyReview, null, 2)}\n`);
await writeFile(path.join(root, 'data', 'kaggle-indonesian', 'merge-review.json'), `${JSON.stringify(kaggleReview, null, 2)}\n`);
await writeFile(readmeFile, `# Selaras Wangi app catalog

Generated from CariParfum, Dadidupe, Female Daily and the user-selected Kaggle CSV on ${generatedAt.slice(0, 10)}. Existing CariParfum records retain their original notes. Dadidupe adds ${review.added.length} entries with resolved note names. Female Daily adds ${femaleDailyReview.added.length} entries from explicit CSV note pyramids checked against public product pages. Kaggle adds ${kaggleReview.added.length} entries from its documented Indonesian-brand dataset. Exclusions and source disagreements are recorded in each import's \`merge-review.json\`.

Kaggle additions adapt **Indonesian Parfume** by **Zhafran Kuncoro**, version ${kaggle.metadata.version}, under [CC BY-SA 4.0](${kaggle.metadata.license_url}). [Original dataset](${kaggle.metadata.source_url}). Changes: note and brand normalization, documented concentration expansion, duplicate filtering. The adapted Kaggle records retain that license; other source records retain their own source conditions. Kaggle prices are snapshots dated ${kaggle.metadata.source_updated_at.slice(0, 10)}. Missing images use the existing fallback.

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
  added: review.added.length,
  duplicates: review.duplicates.length,
  conflicts: review.conflicts.length,
  excluded: review.excluded.length,
  femaledaily: Object.fromEntries(Object.entries(femaleDailyReview).map(([key, values]) => [key, values.length])),
  kaggle: Object.fromEntries(Object.entries(kaggleReview).map(([key, values]) => [key, values.length])),
  pretty_bytes: Buffer.byteLength(JSON.stringify(catalog, null, 2)),
  compact_bytes: Buffer.byteLength(compact)
}, null, 2));
