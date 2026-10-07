# Dadidupe factual catalog import

Collected 2026-10-07 from https://dadidupe.com/perfumes, https://dadidupe.com/brands and https://dadidupe.com/notes. Product source URLs are checked against the public sitemap. No accounts, private APIs or individual official brand sites were used. Source descriptions, accord profiles and affiliate links are not imported. Images remain links to the source CDN.

The source snapshot has 724 records. The merge adds 236 perfumes with resolved note names, skips 306 duplicate identities, and holds 182 entries out of the app. Original records win when sources disagree; 232 duplicate records have note or concentration differences recorded for review. Differences include missing incoming data and do not establish which source is correct.

Brand aliases align abbreviated labels with existing names. Five similar product names are held for identity review rather than added as possible duplicates. Unknown note identifiers are retained in the source snapshot, but entries containing them are excluded from matching. Missing prices remain null. A size accidentally stored as concentration is not accepted. Unordered notes remain `notes.linear` instead of being assigned top, middle or base positions.

## Refresh

Download the same four public pages, then run the offline extractor and catalog builder:

```sh
curl -L --fail https://dadidupe.com/perfumes -o /tmp/selaras-dadidupe-perfumes.html
curl -L --fail https://dadidupe.com/brands -o /tmp/selaras-dadidupe-brands.html
curl -L --fail https://dadidupe.com/notes -o /tmp/selaras-dadidupe-notes.html
curl -L --fail https://dadidupe.com/sitemap-0.xml -o /tmp/selaras-dadidupe-sitemap0.xml
python3 scripts/import-dadidupe.py --input-prefix /tmp/selaras-dadidupe
node scripts/build-app-catalog.mjs
node --test tests/catalog.test.cjs tests/matching.test.cjs
```

Refreshes must continue to check crawl guidance and source conditions. Dadidupe's terms restrict site material reuse and require approval for commercial use; this import does not grant a redistribution or commercial license. See https://dadidupe.com/terms.

Ruwangi returned “Access Denied: Bot Activity Detected” for its catalog and robots file. No Ruwangi records were imported, and the block was not bypassed.
