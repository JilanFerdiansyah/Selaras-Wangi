const assert = require('node:assert/strict');
const fs = require('node:fs');
const catalog = require('../data/app/catalog.json');
const incoming = require('../data/dadidupe/perfumes.json');
const review = require('../data/dadidupe/merge-review.json');
const original = require('../data/cariparfum/perfumes.json');
const femaleDaily = require('../data/femaledaily/perfumes.json');
const femaleDailyReview = require('../data/femaledaily/merge-review.json');
const verification = new Map(require('../data/femaledaily/source-verification.json').map(item => [item.id, item]));
const kaggle = require('../data/kaggle-indonesian/perfumes.json');
const kaggleReview = require('../data/kaggle-indonesian/merge-review.json');
const matcher = require('../matching.js');
const byId = new Map(catalog.perfumes.map(item => [item.id, item]));
const normalized = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

assert.equal(byId.size, catalog.perfumes.length, 'IDs must remain unique');
assert.equal(catalog.counts.perfumes, original.perfumes.length + review.added.length + femaleDailyReview.added.length + kaggleReview.added.length);
assert.equal(review.added.length + review.duplicates.length + review.excluded.length, incoming.perfumes.length);
assert.equal(catalog.counts.brands, new Set(catalog.perfumes.map(item => item.brand)).size);
for (const item of original.perfumes) {
  const retained = byId.get(item.slug);
  assert.ok(retained, `Original perfume missing: ${item.slug}`);
  assert.equal(retained.source_url, item.source_url);
  for (const stage of ['top', 'middle', 'base']) {
    assert.deepEqual(retained.notes[stage].map(normalized), [...new Set((item.notes[stage] ?? []).map(normalized))], `Original notes changed: ${item.slug}`);
  }
}
for (const item of review.added) {
  const imported = byId.get(item.id);
  const source = incoming.perfumes.find(perfume => perfume.id === item.source_id);
  assert.deepEqual(source.unresolved_note_ids, []);
  assert.deepEqual(imported.notes, source.notes);
  assert.ok(imported.note_keys.length, 'Unscorable perfume entered the catalog');
  assert.deepEqual(imported.note_keys, [...new Set(Object.values(imported.notes).flat().map(normalized))]);
  assert.equal(imported.source_url, source.source_url);
  assert.equal(imported.price_idr, null, 'Missing prices must not be invented');
}
for (const item of review.excluded) assert.ok(!byId.has(`dadidupe-${item.source_id}`));
assert.equal(femaleDailyReview.added.length + femaleDailyReview.duplicates.length + femaleDailyReview.excluded.length, femaleDaily.perfumes.length);
for (const item of femaleDailyReview.added) {
  const source = femaleDaily.perfumes.find(perfume => perfume.id === item.source_id);
  const imported = byId.get(item.id);
  assert.deepEqual(imported.notes, source.notes);
  assert.equal(verification.get(item.source_id).status, 'verified');
  for (const stage of ['top', 'middle', 'base']) assert.deepEqual(imported.notes[stage].map(normalized), verification.get(item.source_id).public_notes[stage].map(normalized));
  assert.equal(imported.image_url, verification.get(item.source_id).image_url ?? null);
  assert.equal(imported.price_idr, null);
  assert.ok(source.brand_evidence);
  assert.ok(imported.source_url.startsWith('https://reviews.femaledaily.com/products/fragrance/edp/'));
  assert.ok(imported.note_keys.length);
}
const imageFree = byId.get('femaledaily-f244dda69cdddcb1');
assert.equal(imageFree.image_url, null);
assert.ok(Number.isFinite(matcher.assess(imageFree, [byId.get('mykonos-caramel-fudge-cookie'), byId.get('hmns-orgsm')]).score), 'Image-free perfumes must participate in matching');
for (const item of femaleDailyReview.excluded) assert.ok(!byId.has(`femaledaily-${item.source_id}`));
assert.equal(catalog.counts.with_image, catalog.perfumes.filter(item => item.image_url).length);
assert.equal(kaggleReview.added.length + kaggleReview.duplicates.length + kaggleReview.excluded.length, kaggle.perfumes.length);
assert.equal(kaggle.perfumes.find(item => item.id === 'HRMN-0001').concentration, 'Extrait de Parfum');
assert.equal(kaggle.perfumes.find(item => item.id === 'HRMN-0042').price_idr, 320000);
for (const item of kaggleReview.added) {
  const source = kaggle.perfumes.find(perfume => perfume.id === item.source_id);
  const imported = byId.get(item.id);
  assert.deepEqual(source.issues, []);
  assert.deepEqual(imported.notes, source.notes);
  assert.deepEqual(imported.note_keys, [...new Set(Object.values(source.notes).flat().map(normalized))]);
  assert.equal(imported.source_record_id, item.source_id);
  assert.equal(imported.image_url, null);
  assert.equal(imported.price_idr, source.price_idr);
  assert.equal(imported.price_snapshot_at, kaggle.metadata.source_updated_at);
  assert.ok(imported.note_keys.length);
}
for (const item of kaggleReview.excluded) assert.ok(!byId.has(`kaggle-indonesian-${item.source_id.toLowerCase()}`));
assert.equal(catalog.sources.find(source => source.url === kaggle.metadata.source_url).license, 'CC BY-SA 4.0');
const blue = byId.get('dadidupe-alienobjects-blue');
assert.deepEqual(blue.notes.top, []);
assert.deepEqual(blue.notes.linear, ['Lemon', 'Lime', 'Soda', 'Sake', 'Sandalwood']);
const favorites = ['dadidupe-alienobjects-roses', 'dadidupe-alienobjects-yong-may'].map(id => byId.get(id));
const result = matcher.assess(blue, favorites);
assert.equal(typeof result.score, 'number');
assert.ok(Number.isFinite(result.score));
assert.deepEqual(JSON.parse(fs.readFileSync(require.resolve('../data/app/catalog.min.json'), 'utf8')), catalog);
assert.equal(fs.readFileSync(require.resolve('../data/app/catalog.js'), 'utf8'), `window.SELARAS_WANGI_CATALOG=${JSON.stringify(catalog)};\n`);
console.log(`Catalog verified: ${original.perfumes.length} original records preserved, ${review.added.length} additions, ${catalog.counts.brands} brands; linear notes participate in matching.`);
console.log(`Female Daily: ${femaleDailyReview.added.length} source-verified additions; images are optional and use only listed public product URLs.`);
console.log(`Kaggle: ${kaggleReview.added.length} additions, unique IDs, source note preservation, documented concentrations, snapshot prices and attribution verified.`);
