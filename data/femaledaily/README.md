# Female Daily CSV import

Imported on 2026-10-07 from [Wangi's public CSV files](https://github.com/syariefsq/wangi-perfume-recommender/tree/main/data). Only `product_descriptions.csv` supplies note text. `file_bersih_final_project.csv` supplies product identity by exact URL; its descriptions, prices and customer reviews are not used. Descriptions are not inferred or filled in by AI.

The CSV has 1,020 description rows. Brand provenance in `brand-map.json` limits extraction to Indonesian brands; unknown and international brands are excluded. A deterministic parser extracts 136 explicit top/middle/base note pyramids. It rejects incomplete pyramids and ambiguous separators instead of guessing ingredients or pyramid positions. Encoding is decoded before extraction. Concentration labels and formulation variants are preserved separately from the fragrance name.

The merge adds **60 perfumes**, skips **61 exact duplicate identities**, and excludes **15** candidates: 9 possible duplicate names or unspecified variants, 4 without an explicit pyramid on the public product page, 1 with conflicting public notes, and 1 with ambiguous combined note labels. The 37 note-set differences among duplicate records remain in `merge-review.json`; existing notes are unchanged.

Every addition has its identity and note list checked against the public Female Daily product page. `source-verification.json` stores only factual metadata, notes and a hash of the checked page. Editorial descriptions and customer reviews are not included in the app or saved verification report. Public product image metadata supplies 42 image URLs; 18 additions have no image URL and use the app's existing unavailable-image state. Images are optional, and the custom bottle placeholder design remains deferred.

## Refresh

Download the two public source CSVs:

```sh
curl -L --fail https://raw.githubusercontent.com/syariefsq/wangi-perfume-recommender/main/data/product_descriptions.csv -o /tmp/selaras-wangi-descriptions.csv
curl -L --fail https://raw.githubusercontent.com/syariefsq/wangi-perfume-recommender/main/data/file_bersih_final_project.csv -o /tmp/selaras-wangi-clean.csv
python3 scripts/import-femaledaily.py --descriptions /tmp/selaras-wangi-descriptions.csv --identities /tmp/selaras-wangi-clean.csv
```

Review new candidates against their public product pages, respecting crawl guidance. Save each downloaded HTML page as `/tmp/selaras-fd-<source ID>.html`, using the ID from `perfumes.json`, then verify and build:

```sh
python3 scripts/import-femaledaily.py --verify-prefix /tmp/selaras-fd-
node scripts/build-app-catalog.mjs
node --test tests/catalog.test.cjs tests/matching.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

The builder checks extracted notes against the saved verification and rejects stale verification. Unverified new identities cannot enter the app. Existing entries retain their IDs and full data. CSV input hashes are saved in the import metadata. Public availability does not itself grant a reuse license.
