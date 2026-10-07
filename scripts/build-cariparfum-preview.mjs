import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const input = path.join(root, 'data', 'cariparfum', 'perfumes.json');
const output = path.join(root, 'data', 'cariparfum', 'catalog-preview.html');
const database = JSON.parse(await readFile(input, 'utf8'));
const embedded = JSON.stringify(database).replaceAll('</script', '<\\/script');

const template = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Selaras Wangi — full catalog review</title>
  <style>
    :root{--ink:#18241d;--muted:#68736c;--line:#dde4df;--paper:#fafcf9;--green:#215f40;--soft:#edf5ef}
    *{box-sizing:border-box} body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 Arial,sans-serif}
    main{width:min(1500px,calc(100% - 40px));margin:auto;padding:36px 0 64px} header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:22px}
    .eyebrow{color:var(--green);font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase} h1{margin:7px 0 6px;font:48px/1 Georgia,serif;letter-spacing:-.03em}.subtitle{margin:0;color:var(--muted);max-width:720px}
    .stats{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.stat{min-width:105px;padding:11px 13px;border:1px solid var(--line);border-radius:13px;background:white}.stat b{display:block;font:25px/1 Georgia,serif}.stat span{color:var(--muted);font-size:11px}
    .toolbar{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:1fr 220px 150px;gap:9px;padding:13px 0;background:#fafcf9ed;backdrop-filter:blur(12px)}input,select{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:11px;background:white;color:var(--ink);font:inherit;outline:none}input:focus,select:focus{border-color:var(--green);box-shadow:0 0 0 3px #215f4015}
    .meta{display:flex;justify-content:space-between;align-items:center;gap:15px;margin:8px 0 13px;color:var(--muted)}.pager{display:flex;align-items:center;gap:8px}.pager button{border:1px solid var(--line);border-radius:9px;background:white;padding:7px 11px;color:var(--ink);cursor:pointer}.pager button:disabled{opacity:.35;cursor:default}
    .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:15px;background:white}table{width:100%;min-width:1180px;border-collapse:collapse}th,td{padding:13px 14px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}th{background:#f1f6f2;color:var(--muted);font-size:10px;letter-spacing:.09em;text-transform:uppercase}tr:last-child td{border-bottom:0}
    .product{display:grid;grid-template-columns:64px 1fr;gap:12px;min-width:245px}.product img{width:64px;height:64px;object-fit:contain;border-radius:10px;background:#f4f5f3}.brand{color:var(--green);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.name{margin:2px 0;font:18px/1.18 Georgia,serif}.concentration{font-size:11px;color:var(--muted)}.price{font-weight:700;white-space:nowrap}
    .notes{min-width:360px}.layer{display:grid;grid-template-columns:43px 1fr;gap:6px;margin-bottom:4px}.layer b{color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.04em}.profile{min-width:200px}.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:7px}.chip{padding:3px 7px;border-radius:999px;background:var(--soft);color:var(--green);font-size:11px}.characters{color:var(--muted);font-size:12px}.links{display:flex;flex-direction:column;gap:6px;white-space:nowrap}.links a{color:var(--green);text-underline-offset:3px}.missing{color:#9b6427;font-style:italic}
    @media(max-width:780px){main{width:calc(100% - 24px);padding-top:22px}header{align-items:flex-start;flex-direction:column}h1{font-size:36px}.stats{justify-content:flex-start}.toolbar{grid-template-columns:1fr}.meta{align-items:flex-start;flex-direction:column}}
  </style>
</head>
<body><main>
  <header><div><div class="eyebrow">Selaras Wangi · imported catalog review</div><h1>CariParfum database</h1><p class="subtitle">A searchable review of the imported product catalog. Images remain linked to their original source. Prices are snapshots and may change.</p></div><div class="stats"><div class="stat"><b id="recordTotal"></b><span>perfumes</span></div><div class="stat"><b id="brandTotal"></b><span>brands</span></div><div class="stat"><b id="priceTotal"></b><span>with prices</span></div><div class="stat"><b id="failureTotal"></b><span>failed pages</span></div></div></header>
  <div class="toolbar"><input id="query" type="search" placeholder="Search perfume, brand, note, family…" autofocus><select id="brand"><option value="">All brands</option></select><select id="price"><option value="">Any price</option><option value="priced">With price</option><option value="missing">Missing price</option></select></div>
  <div class="meta"><span id="resultCount"></span><div class="pager"><button id="previous">Previous</button><span id="pageLabel"></span><button id="next">Next</button></div></div>
  <div class="table-wrap"><table><thead><tr><th>Perfume</th><th>Price</th><th>Published notes</th><th>Profile</th><th>Links</th></tr></thead><tbody id="rows"></tbody></table></div>
</main><script id="database" type="application/json">__DATA__</script><script>
const database=JSON.parse(document.getElementById('database').textContent),data=database.perfumes,pageSize=40;let page=1;
const q=document.getElementById('query'),brand=document.getElementById('brand'),price=document.getElementById('price'),rows=document.getElementById('rows');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>v?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v):'<span class="missing">Not listed</span>';
const brands=[...new Set(data.map(x=>x.brand).filter(Boolean))].sort();brand.insertAdjacentHTML('beforeend',brands.map(x=>'<option>'+esc(x)+'</option>').join(''));
recordTotal.textContent=data.length;brandTotal.textContent=brands.length;priceTotal.textContent=data.filter(x=>x.price_idr).length;failureTotal.textContent=database.metadata.failure_count;
function layer(label,values){return values?.length?'<div class="layer"><b>'+label+'</b><span>'+values.map(esc).join(' · ')+'</span></div>':''}
function filtered(){const needle=q.value.trim().toLowerCase();return data.filter(x=>{const noteText=[...x.notes.top,...x.notes.middle,...x.notes.base].join(' ');const hay=[x.brand,x.name,x.concentration,noteText,...x.scent_families,...x.characters].join(' ').toLowerCase();const priceMatch=!price.value||(price.value==='priced'?!!x.price_idr:!x.price_idr);return(!needle||hay.includes(needle))&&(!brand.value||x.brand===brand.value)&&priceMatch})}
function render(){const found=filtered(),pages=Math.max(1,Math.ceil(found.length/pageSize));page=Math.min(page,pages);const visible=found.slice((page-1)*pageSize,page*pageSize);resultCount.textContent=found.length+' of '+data.length+' perfumes';pageLabel.textContent='Page '+page+' of '+pages;previous.disabled=page===1;next.disabled=page===pages;rows.innerHTML=visible.map(x=>{const noteHtml=layer('Top',x.notes.top)+layer('Heart',x.notes.middle)+layer('Base',x.notes.base);return '<tr><td><div class="product"><img loading="lazy" src="'+esc(x.image_urls[0])+'" alt=""><div><div class="brand">'+esc(x.brand)+'</div><div class="name">'+esc(x.name)+'</div><div class="concentration">'+esc(x.concentration||'Concentration not listed')+'</div></div></div></td><td class="price">'+money(x.price_idr)+'</td><td class="notes">'+(noteHtml||'<span class="missing">No notes listed</span>')+'</td><td class="profile"><div class="chips">'+x.scent_families.map(v=>'<span class="chip">'+esc(v)+'</span>').join('')+'</div><div class="characters">'+x.characters.map(esc).join(' · ')+'</div></td><td><div class="links"><a target="_blank" rel="noreferrer" href="'+esc(x.source_url)+'">Source ↗</a><a target="_blank" rel="noreferrer sponsored" href="'+esc(x.purchase_url)+'">Store ↗</a></div></td></tr>'}).join('')}
[q,brand,price].forEach(el=>el.addEventListener(el===q?'input':'change',()=>{page=1;render()}));previous.onclick=()=>{page--;render();scrollTo({top:0,behavior:'smooth'})};next.onclick=()=>{page++;render();scrollTo({top:0,behavior:'smooth'})};render();
</script></body></html>`;

await writeFile(output, template.replace('__DATA__', embedded));
console.log(`Saved preview to ${output}`);
