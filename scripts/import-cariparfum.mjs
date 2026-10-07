import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outputDir = path.join(root, 'data', 'cariparfum');
const outputJson = path.join(outputDir, 'perfumes.json');
const outputCsv = path.join(outputDir, 'perfumes.csv');
const sitemapUrl = 'https://cariparfum.com/sitemap.xml';
const concurrency = 10;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const unique = values => [...new Set(values.filter(Boolean))];

function decodeHtml(value = '') {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function text(value = '') {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function hrefs(value = '', pattern = /href="([^"]+)"/gi) {
  return unique([...value.matchAll(pattern)].map(match => decodeHtml(match[1])));
}

function contentAfterLabel(html, label, tag = 'div') {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`>\\s*${escaped}\\s*<\\/p>\\s*<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  return [...html.matchAll(expression)].map(match => match[1]);
}

function valuesAfterLabel(html, label, tag = 'div') {
  return unique(contentAfterLabel(html, label, tag).flatMap(block => {
    const nodes = [...block.matchAll(/<(?:span|li|a)\b[^>]*>([\s\S]*?)<\/(?:span|li|a)>/gi)].map(match => text(match[1]));
    return nodes.length ? nodes : [text(block)];
  }));
}

function parseJsonLd(html) {
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const product = candidates.find(item => item?.['@type'] === 'Product');
      if (product) return product;
    } catch {}
  }
  return {};
}

function parseNotes(html) {
  const result = { top: [], middle: [], base: [] };
  const layerPattern = /<p[^>]*>\s*(Top|Heart|Middle|Base)\s*<\/p>[\s\S]*?<div class="flex flex-wrap gap-2">([\s\S]*?)<\/div>/gi;
  for (const match of html.matchAll(layerPattern)) {
    const key = /heart|middle/i.test(match[1]) ? 'middle' : match[1].toLowerCase();
    const notes = [...match[2].matchAll(/<a\s+href="\/note\/[^"]+"[^>]*>([\s\S]*?)<\/a>/gi)].map(item => text(item[1]));
    result[key] = unique([...result[key], ...notes]);
  }
  return result;
}

function parsePage(html, page) {
  const product = parseJsonLd(html);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] ?? page.url;
  const concentration = text(html.match(/<span class="[^"]*badge-lg badge-outline[^"]*"[^>]*>\s*([^<]+?)\s*<\/span>/i)?.[1] ?? '');
  const metaDescription = decodeHtml(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? '');
  const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers ?? {};
  const imageUrls = unique(Array.isArray(product.image) ? product.image : [product.image]);
  const notes = parseNotes(html);
  const genderBlocks = contentAfterLabel(html, 'GENDER');
  const gender = unique(genderBlocks.flatMap(block => [...block.matchAll(/title="([^"]+)"/gi)].map(match => decodeHtml(match[1]))));
  const bestTimeWeather = unique(valuesAfterLabel(html, 'BEST TIME & WEATHER').map(value => value.replace(/^\p{Extended_Pictographic}+\s*/u, '').trim()));
  const purchaseUrl = html.match(/data-cta-cek-harga[\s\S]*?href="([^"]+)"/i)?.[1] ?? null;
  const similarStart = html.indexOf('id="similar-perfumes-heading"');
  const similarHtml = similarStart >= 0 ? html.slice(similarStart) : '';
  const similarSlugs = hrefs(similarHtml, /href="\/parfum\/([^"]+)"/gi).filter(slug => slug !== page.slug);

  return {
    source: 'CariParfum',
    slug: page.slug,
    source_url: canonical,
    source_last_modified: page.last_modified,
    imported_at: new Date().toISOString(),
    brand: product.brand?.name ?? null,
    name: product.name?.replace(new RegExp(`^${String(product.brand?.name ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i'), '') ?? null,
    full_name: product.name ?? null,
    concentration: concentration || null,
    price_idr: Number(offer.price) || null,
    price_currency: offer.priceCurrency ?? null,
    availability: offer.availability?.split('/').pop() ?? null,
    image_urls: imageUrls,
    summary: metaDescription || null,
    notes,
    scent_families: valuesAfterLabel(html, 'FAMILY'),
    characters: valuesAfterLabel(html, 'CHARACTER'),
    gender,
    occasions: valuesAfterLabel(html, 'OCCASION', 'ul'),
    best_time_weather: bestTimeWeather,
    purchase_url: purchaseUrl,
    similar_perfume_slugs: similarSlugs
  };
}

async function fetchText(url, attempts = 3) {
  let error;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'SelarasWangiCatalogResearch/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (caught) {
      error = caught;
      if (attempt < attempts) await sleep(attempt * 750);
    }
  }
  throw error;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<url>\s*<loc>(https:\/\/cariparfum\.com\/parfum\/([^<]+))<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi)]
    .map(match => ({ url: decodeHtml(match[1]), slug: decodeHtml(match[2]), last_modified: match[3] ?? null }));
}

function csvEscape(value) {
  const string = Array.isArray(value) ? value.join(' | ') : String(value ?? '');
  return `"${string.replaceAll('"', '""')}"`;
}

function toCsv(records) {
  const headers = ['brand','name','concentration','price_idr','price_currency','availability','top_notes','middle_notes','base_notes','scent_families','characters','gender','occasions','best_time_weather','image_urls','purchase_url','similar_perfume_slugs','summary','source_url','source_last_modified','imported_at'];
  const rows = records.map(item => [
    item.brand,item.name,item.concentration,item.price_idr,item.price_currency,item.availability,
    item.notes.top,item.notes.middle,item.notes.base,item.scent_families,item.characters,item.gender,
    item.occasions,item.best_time_weather,item.image_urls,item.purchase_url,item.similar_perfume_slugs,
    item.summary,item.source_url,item.source_last_modified,item.imported_at
  ].map(csvEscape).join(','));
  return [headers.map(csvEscape).join(','), ...rows].join('\r\n');
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const pages = parseSitemap(await fetchText(sitemapUrl));
  if (!pages.length) throw new Error('No perfume pages were found in the sitemap.');
  console.log(`Found ${pages.length} perfume pages.`);

  const records = new Array(pages.length);
  let nextIndex = 0;
  let completed = 0;
  const failures = [];
  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= pages.length) return;
      const page = pages[index];
      try {
        records[index] = parsePage(await fetchText(page.url), page);
      } catch (error) {
        failures.push({ ...page, error: error.message });
      }
      completed += 1;
      if (completed % 50 === 0 || completed === pages.length) console.log(`Imported ${completed}/${pages.length}`);
      await sleep(80);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  const clean = records.filter(Boolean).sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`));
  await writeFile(outputJson, JSON.stringify({ metadata: { source: 'https://cariparfum.com', imported_at: new Date().toISOString(), record_count: clean.length, failure_count: failures.length, failures }, perfumes: clean }, null, 2));
  await writeFile(outputCsv, toCsv(clean));
  console.log(`Saved ${clean.length} records to ${outputJson}`);
  console.log(`Saved CSV to ${outputCsv}`);
  if (failures.length) console.log(`${failures.length} pages failed after retries.`);
}

await main();
