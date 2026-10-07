# Selaras Wangi app catalog

Generated from CariParfum, Dadidupe, Female Daily and the user-selected Kaggle CSV on 2026-10-07. Existing CariParfum records retain their original notes. Dadidupe adds 236 entries with resolved note names. Female Daily adds 60 entries from explicit CSV note pyramids checked against public product pages. Kaggle adds 572 entries from its documented Indonesian-brand dataset. Exclusions and source disagreements are recorded in each import's `merge-review.json`.

Kaggle additions adapt **Indonesian Parfume** by **Zhafran Kuncoro**, version 1, under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). [Original dataset](https://www.kaggle.com/datasets/zhafrankuncoro/indonesian-parfume). Changes: note and brand normalization, documented concentration expansion, duplicate filtering. The adapted Kaggle records retain that license; other source records retain their own source conditions. Kaggle prices are snapshots dated 2025-09-15. Missing images use the existing fallback.

## Contents

- 1774 perfumes
- 205 brands
- 1676 normalized note keys
- 1466 perfumes with a price snapshot
- 1184 perfumes with a primary image

## Files

- `catalog.json` — readable production catalog
- `catalog.min.json` — compact version for deployment
- `catalog.js` — browser-ready version for the current local-file prototype

Each perfume retains display notes and normalized `note_keys` for matching. The source descriptions, extra gallery images, and importer-only metadata were intentionally removed from the app payload.
