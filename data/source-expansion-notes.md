# Indonesian catalog expansion

User scope (2026-10-07): Indonesian perfumes only; use multi-brand sources rather than official individual perfume brands because brand-by-brand collection takes too long.

Current app catalog: 1,774 perfumes, 205 brands, 1,676 normalized note keys. The original 906 CariParfum records are preserved; Dadidupe adds 236 perfumes, Female Daily adds 60, and the selected Kaggle CSV adds 572.

Candidates investigated:
- Dadidupe: the public catalog HTML exposes 724 entries, the brand page exposes 117 brand labels, and the note page exposes 514 note labels. These were extracted offline from downloaded public pages. Source product URLs were verified against its public sitemap. Only factual perfume fields were saved; editorial descriptions and inferred accord profiles were omitted.
- Ruwangi: https://ruwangi.com/katalog and its robots file returned “Access Denied: Bot Activity Detected” to direct collection. No records were imported and the block was not bypassed.

Dadidupe merge: 236 additions, 306 duplicate identities, 182 exclusions (167 without notes, 9 with unresolved note labels, 5 with potentially duplicate names, 1 invalid concentration). Among duplicate identities, 232 have note-set or concentration differences; source disagreements remain in `dadidupe/merge-review.json` and do not overwrite existing notes. Missing incoming data also counts as a difference, not proof of an incorrect source.

Each addition has a source link and resolved note names. Linear notes stay in `notes.linear`, contributing to matching without invented pyramid positions. Prices absent from this source stay null. Rebuilding the app catalog merges both saved imports, preserving expansion on future builds. Catalog checks verify all 906 original records, additions, exclusions, normalized keys and browser/JSON consistency. Matching checks pass with the expanded catalog; new Alien Objects entries and CDN images were verified in the app search.

Dadidupe's source terms restrict site material reuse and commercial use; the saved import does not grant a reuse license. No publication or deployment was performed.

## CSV research, 2026-10-07

User accepts image-free records with a bottle placeholder; placeholder design is deferred. Name, brand and real listed notes matter for dataset inclusion. Indonesian-only scope remains in effect.

- TidyTuesday Parfumo CSV: https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2024/2024-12-10/parfumo_data_clean.csv. Download inspected locally: 59,325 rows, brand/name/top/middle/base fields, no image column or country field. No brand labels match our existing Indonesian catalog after basic normalization. This does not establish that every row is foreign, but the file is unsuitable for immediate Indonesian expansion without additional origin verification.
- Wangi / Female Daily public CSVs: https://github.com/syariefsq/wangi-perfume-recommender/tree/main/data. `product_listings.csv` has 1,000 rows with brand and product labels, without images or dedicated note fields. `product_descriptions.csv` has 1,020 URL/description records; actual descriptions contain some explicitly labeled note pyramids. The listing includes international brands, so the repository's Indonesian wording refers to market availability rather than an Indonesian-only brand catalog. Basic existing-brand matching including HMNS Perfume and Saff & Co aliases finds 155 listing rows across 18 known local brand labels; this is not a deduplicated addition count. Some text has mixed encoding. The cleaned/model datasets may impute descriptions, so only source descriptions with explicit factual notes should be considered for deterministic extraction. No CSV records merged during this research.
- Fragrantica Kaggle dataset https://www.kaggle.com/datasets/olgagmiufana1/fragrantica-com-fragrance-dataset located, but contents and current local coverage not verified. Do not assume images, counts or usable Indonesian coverage from third-party descriptions.

## Female Daily CSV merge, 2026-10-07

User approved deterministic extraction and Indonesian-only merge. Decoding mixed CSV encoding yields 136 explicit, parseable note pyramids among the 1,020 description rows. Product identities are joined by exact URL to `file_bersih_final_project.csv`; its imputed descriptions and reviews are never used for notes. Indonesian brand labels and aliases have a provenance map. Added-brand origin evidence includes Female Daily editorial articles for Evangeline, Avicenna, MS Glow and Mercredi, and Lazada's brand profile for Bonavie. Carl Claire, Kitschy and Polka also appear in Dadidupe's Indonesian brand directory.

Public product pages validate every addition's identity and note pyramid. Merge: 60 additions, 61 exact duplicates, 15 exclusions; 37 duplicate note differences are reported without overwriting prior records. All 1,142 pre-existing records were compared in full and remain unchanged. Added entries include 42 listed product image URLs and 18 image-free records, which use the existing fallback; custom bottle placeholder design is deferred. Tests pass for extraction, source validation, catalog preservation and deterministic matching. New totals: 1,202 perfumes, 137 brands, 1,277 note keys, 1,184 image URLs. No deployment or publication performed.

## User-selected Kaggle CSV, 2026-10-07

User explicitly requested https://www.kaggle.com/datasets/zhafrankuncoro/indonesian-parfume/data. Public API download succeeded without an account. Version 1 contains `Parfume Lokal Indonesian.csv`, 1,064 rows, with brand/name, separate note stages, price, size, concentration, situation and gender; no images. Source metadata states Indonesian local-brand scope, documents XDP as Extrait de Parfum, and specifies CC BY-SA 4.0. Creator attribution, source link, version, license link and modification notice are retained in the import README and browser catalog metadata.

Merge: 572 additions, 429 exact duplicates skipped, 63 entries held for review (49 possible duplicates or unspecified variants, 11 likely spelling duplicates, 2 unparsed note lists and 1 invalid product name). All 1,202 pre-existing records remain unchanged. CSV note stages and stable source IDs are preserved; no notes are inferred. Dataset prices are dated snapshots (2025-09-15), and unknown size units are not assumed. App counts are now 1,774 perfumes, 205 brands, 1,676 note keys, 1,184 image URLs and 590 image-free records. Catalog, parsing and matching tests pass. The selected Kaggle source is included in every catalog rebuild. No publication or deployment performed.
