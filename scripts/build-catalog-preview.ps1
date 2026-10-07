param(
  [string]$InputPath = '..\data\perfumes.json',
  [string]$CsvPath = '..\data\perfumes.csv',
  [string]$PreviewPath = '..\data\catalog-preview.html'
)

$ErrorActionPreference = 'Stop'
$inputFile = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $InputPath))
$csvFile = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $CsvPath))
$previewFile = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $PreviewPath))
$data = Get-Content -Raw -LiteralPath $inputFile | ConvertFrom-Json

$data | Select-Object brand,name,
  @{n='top_notes';e={$_.notes.top -join ' | '}},
  @{n='middle_notes';e={$_.notes.middle -join ' | '}},
  @{n='base_notes';e={$_.notes.base -join ' | '}},
  @{n='main_notes';e={$_.notes.main -join ' | '}},
  note_status,source_url,source_type,checked_on |
  Export-Csv -LiteralPath $csvFile -NoTypeInformation -Encoding utf8

$json = $data | ConvertTo-Json -Depth 7 -Compress
$template = @'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Selaras Wangi — catalog preview</title>
  <style>
    :root { --ink:#17251d; --muted:#6d776f; --line:#dde3de; --paper:#fbfcfa; --green:#1e593b; --soft:#edf4ef; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font:14px/1.45 Arial, sans-serif; }
    main { width:min(1440px, calc(100% - 40px)); margin:0 auto; padding:42px 0 64px; }
    header { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:28px; }
    .eyebrow { color:var(--green); font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
    h1 { margin:8px 0 5px; font:52px/1.02 Georgia, serif; letter-spacing:-.035em; }
    .subtitle { color:var(--muted); max-width:680px; margin:0; }
    .stats { display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
    .stat { min-width:116px; border:1px solid var(--line); border-radius:14px; padding:12px 14px; background:white; }
    .stat b { display:block; font:27px/1 Georgia,serif; }
    .stat span { color:var(--muted); font-size:12px; }
    .toolbar { position:sticky; top:0; z-index:2; display:grid; grid-template-columns:1fr 220px; gap:10px; padding:14px 0; background:color-mix(in srgb, var(--paper) 92%, transparent); backdrop-filter:blur(12px); }
    input, select { width:100%; border:1px solid var(--line); border-radius:12px; background:white; color:var(--ink); padding:13px 15px; font:inherit; outline:none; }
    input:focus, select:focus { border-color:var(--green); box-shadow:0 0 0 3px #1e593b16; }
    .result-count { margin:8px 0 14px; color:var(--muted); }
    .table-wrap { overflow:auto; border:1px solid var(--line); border-radius:16px; background:white; }
    table { width:100%; min-width:1050px; border-collapse:collapse; }
    th { position:sticky; top:74px; z-index:1; background:#f4f7f4; color:var(--muted); font-size:11px; letter-spacing:.08em; text-transform:uppercase; text-align:left; }
    th, td { padding:14px 16px; border-bottom:1px solid var(--line); vertical-align:top; }
    tr:last-child td { border-bottom:0; }
    .brand { color:var(--green); font-weight:700; white-space:nowrap; }
    .name { font:19px/1.2 Georgia,serif; min-width:180px; }
    .layer { display:grid; grid-template-columns:54px 1fr; gap:7px; margin-bottom:5px; }
    .layer:last-child { margin-bottom:0; }
    .layer b { color:var(--muted); font-size:11px; letter-spacing:.05em; text-transform:uppercase; }
    .notes { min-width:430px; }
    .empty { color:#9a6a30; font-style:italic; }
    .status { display:inline-flex; padding:4px 8px; border-radius:999px; background:var(--soft); color:var(--green); font-size:11px; font-weight:700; white-space:nowrap; }
    .status.missing { background:#fff3e5; color:#8a541c; }
    a { color:var(--green); text-underline-offset:3px; }
    @media(max-width:760px){ main{width:min(100% - 24px,1440px);padding-top:24px} header{align-items:flex-start;flex-direction:column} h1{font-size:38px}.stats{justify-content:flex-start}.toolbar{grid-template-columns:1fr} }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <div class="eyebrow">Selaras Wangi · data preview</div>
        <h1>Indonesian perfume catalog</h1>
        <p class="subtitle">The first source-linked slice of the database. Search a perfume, brand, or note. Every record points back to the official brand page used for verification.</p>
      </div>
      <div class="stats">
        <div class="stat"><b id="perfumeTotal">0</b><span>fragrances</span></div>
        <div class="stat"><b id="brandTotal">0</b><span>brands</span></div>
        <div class="stat"><b id="notesTotal">0</b><span>with notes</span></div>
      </div>
    </header>

    <div class="toolbar">
      <input id="query" type="search" placeholder="Search perfume, brand, or note…" autofocus>
      <select id="brand"><option value="">All brands</option></select>
    </div>
    <p class="result-count" id="resultCount"></p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Brand</th><th>Perfume</th><th>Published notes</th><th>Status</th><th>Source</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  </main>
  <script id="catalog" type="application/json">__CATALOG_JSON__</script>
  <script>
    const data = JSON.parse(document.getElementById('catalog').textContent);
    const query = document.getElementById('query');
    const brand = document.getElementById('brand');
    const rows = document.getElementById('rows');
    const resultCount = document.getElementById('resultCount');
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const layer = (label, values) => values?.length ? `<div class="layer"><b>${label}</b><span>${values.map(esc).join(' · ')}</span></div>` : '';
    const allNotes = item => ['top','middle','base','main'].flatMap(key => item.notes[key] || []);
    const brands = [...new Set(data.map(item => item.brand))].sort();
    brand.insertAdjacentHTML('beforeend', brands.map(value => `<option>${esc(value)}</option>`).join(''));
    document.getElementById('perfumeTotal').textContent = data.length;
    document.getElementById('brandTotal').textContent = brands.length;
    document.getElementById('notesTotal').textContent = data.filter(item => allNotes(item).length).length;
    function render(){
      const needle = query.value.trim().toLowerCase();
      const filtered = data.filter(item => {
        const haystack = [item.brand,item.name,...allNotes(item)].join(' ').toLowerCase();
        return (!needle || haystack.includes(needle)) && (!brand.value || item.brand === brand.value);
      });
      resultCount.textContent = `${filtered.length} of ${data.length} fragrances`;
      rows.innerHTML = filtered.map(item => {
        const notes = layer('Top',item.notes.top)+layer('Middle',item.notes.middle)+layer('Base',item.notes.base)+layer('Main',item.notes.main);
        const verified = item.note_status === 'verified_published_notes';
        return `<tr><td class="brand">${esc(item.brand)}</td><td class="name">${esc(item.name)}</td><td class="notes">${notes || '<span class="empty">Notes not published on the product page</span>'}</td><td><span class="status ${verified?'':'missing'}">${verified?'Verified':'Needs source'}</span></td><td><a href="${esc(item.source_url)}" target="_blank" rel="noreferrer">Official page ↗</a></td></tr>`;
      }).join('');
    }
    query.addEventListener('input', render);
    brand.addEventListener('change', render);
    render();
  </script>
</body>
</html>
'@

$template.Replace('__CATALOG_JSON__', $json) | Set-Content -LiteralPath $previewFile -Encoding utf8
Write-Output "Saved CSV: $csvFile"
Write-Output "Saved preview: $previewFile"
