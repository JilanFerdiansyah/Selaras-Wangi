# Selaras Wangi

A focused perfume matcher prototype for discovering Indonesian fragrances by comparing a perfume someone is considering with perfumes they already love.

## Open the prototype

Open `index.html` in a browser. The first search uses the local production catalog at `data/app/catalog.js`; product images and purchase links point to their listed sources.

## Catalog files

- `data/cariparfum/perfumes.json` is the imported source catalog used for review.
- `data/app/catalog.json` is the readable app dataset.
- `data/app/catalog.min.json` and `data/app/catalog.js` are compact app versions.
- `scripts/import-cariparfum.mjs` refreshes the review import.
- `scripts/build-app-catalog.mjs` prepares the app dataset after reviewing an import.
- `scripts/build-cariparfum-preview.mjs` rebuilds the catalog review page.

The database and generated bottle images are kept in this repository so the prototype can be continued on another device. Use a private GitHub repository for this project.

## Current prototype state

The first question searches the imported catalog. The second question collects up to five loved perfumes. The matching results screen is not implemented yet.

## Repository note

This project is being published to a new repository with a clean initial commit. The previous local site history remains on the `legacy-site` branch.
