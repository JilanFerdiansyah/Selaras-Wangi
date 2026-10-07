# Selaras Wangi perfume catalog

This folder contains the first reviewable slice of the perfume database. It is intentionally separate from the app until the records and structure have been reviewed.

## Current coverage

- 102 distinct fragrances
- 4 Indonesian perfume brands: SAFF & Co., Alchemist Fragrance, Carl & Claire, and MYKONOS
- 101 fragrances with notes published by the official brand
- 1 catalogued fragrance whose official page currently does not publish a note list

Bottle sizes and travel-size variants are collapsed into one fragrance record. Body products, home fragrance, discovery sets, bundles, and gifts are excluded.

## Files

- `catalog-preview.html`: searchable visual review table
- `perfumes.csv`: spreadsheet-friendly export
- `perfumes.json`: structured source for the future matcher

Each record contains the brand, fragrance name, top/middle/base or main notes, verification status, official source URL, and the date checked. This is the first source batch, not yet the full Indonesian market catalog.
