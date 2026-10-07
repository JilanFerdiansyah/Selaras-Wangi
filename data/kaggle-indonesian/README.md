# Indonesian Parfume — Kaggle import

Source: [Indonesian Parfume](https://www.kaggle.com/datasets/zhafrankuncoro/indonesian-parfume) by **Zhafran Kuncoro**, version 1, updated 2025-09-15. The dataset description explicitly identifies these as Indonesian local brands and defines EDP as Eau de Parfum and XDP as Extrait de Parfum. Downloaded on 2026-10-07 using Kaggle's public dataset download API.

## Attribution and license

The original CSV and records adapted from it are licensed under **[Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**, as specified by the source metadata. Retain this credit, the original dataset link, license link and modification notice when sharing the adapted records. Other imports retain their own source conditions.

Changes: CSV fields converted to the app schema; whitespace, invisible characters and trailing note punctuation cleaned; explicit note conjunctions separated; documented concentration abbreviations expanded; Indonesian thousands separators parsed in prices; established brand aliases aligned; duplicate and ambiguous identities filtered. No ingredient lists, pyramid stages or images were invented. The source CSV is retained unchanged, with its SHA-256 recorded in `perfumes.json`.

## Merge

- 1,064 input rows.
- 572 additions to the app catalog.
- 429 exact duplicate identities skipped.
- 63 held entries: 49 possible duplicates or unspecified variants, 11 similar spellings, 2 unparsed note lists, 1 perfume name containing only a concentration label.
- 267 note-set or concentration differences among duplicate identities recorded without overwriting existing records.

All 1,202 pre-existing app records were compared in full and remain unchanged. Additions have stable source IDs, all available parsed source notes and a dataset source link. The CSV contains no image URLs; additions use the app's existing unavailable-image state until the custom bottle placeholder is designed. Prices are **2025-09-15 source snapshots**, recorded in `price_snapshot_at`, rather than current retail quotes. The `size` column has no confirmed unit, so it is retained only as raw import metadata. Gender and situation labels are also retained in the import, without inferring app tags.

`identity-review.json` lists likely spelling duplicates for manual identity review. These records are held, rather than silently correcting names or combining note lists. `merge-review.json` records every outcome. Missing pyramid stages remain empty; ambiguous slash-separated alternatives and concatenated note prose are not guessed.

## Refresh

```sh
curl -L --fail https://www.kaggle.com/api/v1/datasets/download/zhafrankuncoro/indonesian-parfume -o /tmp/selaras-kaggle-indonesian.zip
curl -L --fail https://www.kaggle.com/api/v1/datasets/view/zhafrankuncoro/indonesian-parfume -o /tmp/selaras-kaggle-info.json
python3 scripts/import-kaggle-indonesian.py --archive /tmp/selaras-kaggle-indonesian.zip --metadata /tmp/selaras-kaggle-info.json
node scripts/build-app-catalog.mjs
node --test tests/catalog.test.cjs tests/matching.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

Review source metadata changes, new aliases, note parse errors and held identities before accepting a refreshed build.
