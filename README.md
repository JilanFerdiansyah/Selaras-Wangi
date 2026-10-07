# Selaras Wangi

A focused perfume matcher prototype for discovering Indonesian fragrances by comparing a perfume someone is considering with perfumes they already love.

## Open the prototype

Open `index.html` in a browser. The first search uses the local production catalog at `data/app/catalog.js`; product images and purchase links point to their listed sources.

## Catalog files

- `data/cariparfum/perfumes.json` is the imported source catalog used for review.
- `data/dadidupe/perfumes.json` contains factual fields from the public Indonesian catalog; `merge-review.json` records additions, duplicates, disagreements and exclusions.
- `data/femaledaily/` contains the CSV extraction, Indonesian brand provenance, public-page verification and merge report.
- `data/kaggle-indonesian/` contains the user-selected CSV, normalized records, licensing attribution and merge report.
- `data/app/catalog.json` is the readable app dataset.
- `data/app/catalog.min.json` and `data/app/catalog.js` are compact app versions.
- `scripts/import-cariparfum.mjs` refreshes the review import.
- `scripts/import-dadidupe.py` extracts downloaded public catalog pages; see `data/dadidupe/README.md` for refresh commands.
- `scripts/import-femaledaily.py` extracts explicitly labeled notes from Wangi's Female Daily CSV; see `data/femaledaily/README.md` for refresh and verification commands.
- `scripts/import-kaggle-indonesian.py` imports Zhafran Kuncoro's Indonesian Parfume CSV; see `data/kaggle-indonesian/README.md` for refresh commands and CC BY-SA 4.0 attribution.
- `scripts/build-app-catalog.mjs` prepares the app dataset after reviewing an import.
- `scripts/build-cariparfum-preview.mjs` rebuilds the catalog review page.

The database and generated bottle images are kept in this repository so the prototype can be continued on another device. Use a private GitHub repository for this project.

The current app catalog contains 1,774 perfumes across 205 brands: 906 original CariParfum entries, 236 Dadidupe additions, 60 Female Daily additions and 572 Kaggle additions. The Female Daily notes and identities are checked against public product pages before merging; the Kaggle import uses explicit fields in the selected Indonesian-brand dataset. Existing note pyramids are preserved. Incoming duplicates, incomplete note dictionaries and ambiguous names remain in the review reports. Linear note lists retain their own `notes.linear` field and contribute to the same matching profile without inventing a pyramid. Images are optional; 590 entries use the current unavailable-image state until a bottle placeholder is designed. Kaggle prices are source snapshots from 2025-09-15.

## Current prototype state

The first question searches the imported catalog. The second question collects two to five loved perfumes around the selected perfume. With one favorite, the user is prompted to add another; comparison is available from two favorites.

**See comparison** starts the calm “Comparing notes” orbit. Every selected favorite settles into the result collection and stays visible. The transition takes about 3.9 seconds, followed by a 1.1-second reveal; reduced-motion users see the result immediately. Timing is presentation, not AI processing or a remote request. Desktop uses the large selected perfume and collection on the left, with the result on the right, fitting without scrolling at the checked sizes. Mobile stacks and scrolls. The individual comparison dropdown is removed.

`matching.js` now builds one profile from all unique favorites. Each perfume's binary note vector is normalized to unit length, then the vectors are averaged. The selected perfume's normalized vector is compared with that centroid using cosine similarity. Each perfume has equal vector magnitude before averaging; recurring notes accumulate support. Exact duplicate perfume IDs and the candidate itself are excluded. Missing note lists are omitted transparently; at least two contributing favorites and candidate notes are needed for a score. Cedar wood / cedarwood share an explicit alias, while rose / red rose and musk / white musk stay distinct.

The result displays cosine similarity multiplied by 100 and rounded to the nearest whole number, labeled “profile overlap” above and slightly to the right of the selected bottle. The main title retains High / Medium / Low overlap using the provisional cosine boundaries .70 / .35. Full precision is retained in the calculation. Missing data has no percentage; genuine zero overlap shows 0%. Category boundaries still require calibration with wearer feedback. This is a listed-note alignment score, not a calibrated likelihood of liking or verified sensory similarity. Evidence count and similarity score are separate. Adding more favorites can lower the score.

All result copy uses fixed templates with actual note counts. Shared with your favorites previews up to four notes, ordered by recurrence, then profile weight, then canonical key. New in this perfume previews up to four notes absent from the profile, in alphabetical order. Remaining counts are shown; previews do not imply ingredient concentration or note intensity. Editing favorites rebuilds the full profile. Changing target preserves favorites except the new target itself.

Run the algorithm checks with `node tests/matching.test.cjs`.
Run catalog preservation and import checks with `node --test tests/catalog.test.cjs tests/matching.test.cjs`.
Run CSV extraction checks with `python3 -m unittest discover -s tests -p 'test_*.py'`.

The prototype supports keyboard search, narrow screens, reduced motion, missing-image fallbacks, and empty search results. Decorative orbit assets use lightweight WebP copies; the original PNGs remain in the repository.

## Repository note

This project is being published to a new repository with a clean initial commit. The previous local site history remains on the `legacy-site` branch.
