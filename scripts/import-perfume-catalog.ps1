param(
  [string]$OutputPath = '..\data\perfumes.json'
)

$ErrorActionPreference = 'Stop'
$stores = @(
  @{ brand = 'SAFF & Co.'; domain = 'saffnco.com'; kind = 'saff' },
  @{ brand = 'Alchemist Fragrance'; domain = 'alchemistfragrance.com'; kind = 'alchemist' },
  @{ brand = 'Carl & Claire'; domain = 'www.carlandclaire.com'; kind = 'carlclaire' },
  @{ brand = 'MYKONOS'; domain = 'officialmykonos.com'; kind = 'mykonos' }
)

function Get-PublicPage([string]$Uri) {
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    try {
      return (Invoke-WebRequest -Uri $Uri -Method Get -TimeoutSec 30 -UseBasicParsing).Content
    } catch {
      if ($attempt -eq 3) { throw }
      Start-Sleep -Seconds $attempt
    }
  }
}

function ConvertFrom-HtmlFragment([string]$Html) {
  $withLines = $Html -replace '(?i)<br\s*/?>', "`n" -replace '(?i)</p\s*>', "`n"
  $plain = [System.Net.WebUtility]::HtmlDecode(($withLines -replace '<[^>]+>', ''))
  return (($plain -replace "`r", '') -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Split-NoteValues($Values) {
  $result = [System.Collections.Generic.List[string]]::new()
  foreach ($value in @($Values)) {
    foreach ($part in ([string]$value -split '\s*(?:\||,|•|·)\s*')) {
      $clean = ([System.Net.WebUtility]::HtmlDecode($part) -replace '\s+', ' ').Trim(' ', '.', ';', ':')
      if ($clean -and $clean -notmatch '^(Top|Middle|Heart|Base) Notes?$') { $result.Add($clean) }
    }
  }
  return @($result)
}

function Get-NotesFromPage([string]$Html) {
  $lineNotes = @{ top=@(); middle=@(); base=@(); main=@() }
  foreach ($line in (ConvertFrom-HtmlFragment $Html)) {
    $match = [regex]::Match($line, '^(?<layer>Top|Middle|Heart|Base|Bottom|Main)\s*Notes?\s*:\s*(?<value>.+)$', 'IgnoreCase')
    if (-not $match.Success) { continue }
    $layer = $match.Groups['layer'].Value.ToLowerInvariant()
    if ($layer -eq 'heart') { $layer = 'middle' }
    if ($layer -eq 'bottom') { $layer = 'base' }
    $lineNotes[$layer] = @(Split-NoteValues $match.Groups['value'].Value)
  }
  if (($lineNotes.top.Count -and $lineNotes.middle.Count -and $lineNotes.base.Count) -or $lineNotes.main.Count) { return $lineNotes }

  $section = [regex]::Match($Html, '(?is)<h[1-6][^>]*>\s*Notes\s*</h[1-6]>(?<body>.*?)</details>')
  if (-not $section.Success) {
    $pyramid = [regex]::Match($Html, '(?is)<p>\s*Top Notes\s*</p>\s*<p[^>]*>(?<top>.*?)</p>\s*<p>\s*Middle Notes\s*</p>\s*<p[^>]*>(?<middle>.*?)</p>\s*<p>\s*Base Notes\s*</p>\s*<p[^>]*>(?<base>.*?)</p>')
    if ($pyramid.Success) {
      return @{
        top = @(Split-NoteValues (ConvertFrom-HtmlFragment $pyramid.Groups['top'].Value))
        middle = @(Split-NoteValues (ConvertFrom-HtmlFragment $pyramid.Groups['middle'].Value))
        base = @(Split-NoteValues (ConvertFrom-HtmlFragment $pyramid.Groups['base'].Value))
        main = @()
      }
    }

    $tableRows = [regex]::Matches($Html, '(?is)<(?:td|th)[^>]*>\s*(?<layer>Top|Middle|Heart|Base)\s*Notes?\s*</(?:td|th)>\s*<td[^>]*>(?<value>.*?)</td>')
    if ($tableRows.Count -ge 3) {
      $tableNotes = @{ top=@(); middle=@(); base=@(); main=@() }
      foreach ($row in $tableRows) {
        $layer = $row.Groups['layer'].Value.ToLowerInvariant()
        if ($layer -eq 'heart') { $layer = 'middle' }
        $tableNotes[$layer] = @(Split-NoteValues (ConvertFrom-HtmlFragment $row.Groups['value'].Value))
      }
      return $tableNotes
    }

    $inline = [regex]::Match($Html, '(?is)Top\s*Notes?\s*:\s*(?<top>.*?)(?:<br\s*/?>)\s*(?:Middle|Heart)\s*Notes?\s*:\s*(?<middle>.*?)(?:<br\s*/?>)\s*Base\s*Notes?\s*:\s*(?<base>.*?)(?:<br\s*/?>|</blockquote>|</p>)')
    if ($inline.Success) {
      return @{
        top = @(Split-NoteValues (ConvertFrom-HtmlFragment $inline.Groups['top'].Value))
        middle = @(Split-NoteValues (ConvertFrom-HtmlFragment $inline.Groups['middle'].Value))
        base = @(Split-NoteValues (ConvertFrom-HtmlFragment $inline.Groups['base'].Value))
        main = @()
      }
    }

    return @{ top=@(); middle=@(); base=@(); main=@() }
  }

  $lines = ConvertFrom-HtmlFragment $section.Groups['body'].Value
  $notes = @{ top=[System.Collections.Generic.List[string]]::new(); middle=[System.Collections.Generic.List[string]]::new(); base=[System.Collections.Generic.List[string]]::new() }
  $layer = $null
  foreach ($line in $lines) {
    $heading = $line.Trim().TrimEnd(':').ToLowerInvariant()
    if ($heading -match '^(top|top notes)$') { $layer='top'; continue }
    if ($heading -match '^(heart|middle|middle notes|heart notes)$') { $layer='middle'; continue }
    if ($heading -match '^(base|base notes)$') { $layer='base'; continue }
    if ($heading -match '^(notes|characters|fragrance performance|sillage|projection|longevity)$') { $layer=$null; continue }
    if ($layer -and $line -notmatch '^\d+\s*/\s*\d+$') { $notes[$layer].Add($line) }
  }
  return @{
    top=@(Split-NoteValues $notes.top)
    middle=@(Split-NoteValues $notes.middle)
    base=@(Split-NoteValues $notes.base)
    main=@()
  }
}

function Get-CatalogName([string]$Title, [string]$Kind) {
  $name = $Title.Trim()
  switch ($Kind) {
    'saff' {
      $name = $name -replace '^(Extrait de Parfum|Eau de Parfum)\s*', ''
      $name = $name -replace '^Travel\s*size\s*', ''
    }
    'carlclaire' {
      $name = $name -replace '^Carl\s*&\s*Claire\s*', ''
      $name = $name -replace '\s+(EDP|Eau de Parfum|Extrait de Parfum)\b.*$', ''
    }
    'mykonos' {
      $name = $name -replace '^Mykonos\s*-\s*', ''
      $name = $name -replace '\s+(EDP|Eau de Parfum|Extrait de Parfum|Parfum)\b.*$', ''
    }
  }
  $name = $name -replace '\s+\d+(?:\.\d+)?\s*(ml|ML)\b.*$', ''
  return $name.Trim(' ', '-', '–', '—')
}

$records = [System.Collections.Generic.List[object]]::new()
foreach ($store in $stores) {
  $robots = Get-PublicPage "https://$($store.domain)/robots.txt"
  if ($robots -notmatch '(?is)public product.*crawlable') { throw "The published crawl policy did not confirm product pages are crawlable: $($store.domain)" }

  $feedUrl = "https://$($store.domain)/products.json?limit=250"
  $feed = (Get-PublicPage $feedUrl) | ConvertFrom-Json
  $candidates = foreach ($product in $feed.products) {
    $title = [string]$product.title
    $tags = @($product.tags)
    if ($store.kind -eq 'saff') {
      if ($product.product_type -notmatch 'Parfum' -and $title -notmatch '(?i)Parfum') { continue }
      if ($title -match '(?i)bundle|discovery|gift|set|merch|cloud mist|body care|deo potion') { continue }
    } elseif ($store.kind -eq 'alchemist') {
      if (($tags -contains 'Alchemist Home') -or $title -match '(?i)bundle|discovery|gift|set|hamper|home fragrance|body lotion|body wash|hand wash' -or $product.handle -match '(?i)body-lotion|body-wash|hand-wash') { continue }
    } elseif ($store.kind -eq 'carlclaire') {
      if ($title -notmatch '(?i)EDP|Eau de Parfum|Extrait de Parfum') { continue }
      if ($title -match '(?i)bundle|discovery|gift|set|hamper|home|room|body|hair') { continue }
    } elseif ($store.kind -eq 'mykonos') {
      if ($title -notmatch '(?i)EDP|Eau de Parfum|Extrait de Parfum|Parfum') { continue }
      if ($title -match '(?i)bundle|discovery|gift|set|hamper|home|room|body|hair|refill') { continue }
    }
    $name = Get-CatalogName $title $store.kind
    if (-not $name) { continue }
    [pscustomobject]@{
      brand=$store.brand
      name=$name
      handle=$product.handle
      domain=$store.domain
      kind=$store.kind
      title=$title
      description_html=[string]$product.body_html
    }
  }

  $unique = $candidates | Group-Object { "$($_.brand)|$((Get-CatalogName $_.title $_.kind).ToLowerInvariant())" } | ForEach-Object {
    $_.Group | Sort-Object @{Expression={ if ($_.title -match '(?i)travel\s*size|\b10\s*ml\b') { 1 } else { 0 } }} | Select-Object -First 1
  }

  foreach ($product in $unique) {
    $url = "https://$($product.domain)/products/$($product.handle)"
    try {
      $notes = Get-NotesFromPage $product.description_html
      $noteCount = $notes.top.Count + $notes.middle.Count + $notes.base.Count + $notes.main.Count
      $records.Add([pscustomobject]@{
        brand = $product.brand
        name = $product.name
        notes = [pscustomobject]@{ top=$notes.top; middle=$notes.middle; base=$notes.base; main=$notes.main }
        source_url = $url
        source_type = 'official_brand_page'
        checked_on = (Get-Date -Format 'yyyy-MM-dd')
        note_status = if ($noteCount) { 'verified_published_notes' } else { 'product_found_notes_not_listed' }
      })
    } catch {
      $records.Add([pscustomobject]@{
        brand = $product.brand
        name = $product.name
        notes = [pscustomobject]@{ top=@(); middle=@(); base=@(); main=@() }
        source_url = $url
        source_type = 'official_brand_page'
        checked_on = (Get-Date -Format 'yyyy-MM-dd')
        note_status = 'page_fetch_failed'
      })
    }
  }
}

$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $OutputPath))
$outputDirectory = Split-Path -Parent $resolvedOutput
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$records | Sort-Object brand,name | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $resolvedOutput -Encoding utf8
$verified = @($records | Where-Object note_status -eq 'verified_published_notes').Count
Write-Output "Saved $($records.Count) products; $verified have published notes."
Write-Output $resolvedOutput
