# Perfume bottle PNG sources

The homepage orbit uses sixteen original, unbranded bottle PNGs in `assets/generated-bottles/`. They were created for this prototype with the built-in imagegen tool. Each file has a transparent background and is stored locally.

The design prompts are recorded in [`assets/generated-bottles/PROMPTS.md`](assets/generated-bottles/PROMPTS.md). These bottles are decorative concepts and do not represent perfumes in the demo catalog.

The hero loads WebP derivatives sized to fit within 320 × 480 pixels (quality 88), generated from these PNGs. Originals are preserved. The selection scene uses actual product images from the catalog, rather than the decorative concepts.

## Missing-image placeholder concepts

`assets/perfume-placeholder-subtle.png` is the latest refinement: small regular-weight grey “Image unavailable” text in the lower third. Created with built-in imagegen in edit mode, preserving the transparent bottle concept. Prompt: Refine this perfume bottle placeholder. Preserve the bottle shape, grey frosted glass, cap, framing, and real transparent background. Make the wording 'Image unavailable' subtle: small regular-weight sans-serif text in muted medium grey, on two centered lines, positioned in the lower third of the bottle body. The text block should occupy only about 32 percent of the bottle body's width, like a quiet understated label. No bold lettering. The bottle should be the primary visual and the text a secondary detail. No label rectangle, logo, other text, floor, backdrop, cast shadow, or surrounding glow. Keep all space outside the bottle fully transparent.

`assets/perfume-placeholder.png` and `assets/perfume-placeholder-labelled.png` are transparent PNG concepts created with the built-in imagegen tool. They show a generic frosted-grey bottle and do not depict actual catalog packaging. The labelled version adds the requested wording “Image unavailable”. The app uses the subtle refinement for missing or failed product images in search, selected favorites, and results; the other concepts are preserved for reference.

Generation prompt: Create a single generic perfume bottle as a reusable UI placeholder PNG. Front-facing, upright, centered, full bottle visible with generous padding. Simple rounded shoulders, broad frosted-glass body, short neutral-grey cap. Soft matte cool-grey glass with restrained shading and a clear silhouette readable at thumbnail size. Unbranded: no label, letters, logo, decoration, or colored liquid. Quiet premium product illustration, deliberately generic rather than recognizable packaging. Transparent background with real alpha; no floor, cast shadow, glow, background, or checkerboard.

Edit prompt: Edit this generic frosted-grey perfume bottle placeholder. Keep its shape, cap, front-facing orientation, neutral-grey material, and transparent background. Add clearly readable dark charcoal text directly on the front of the bottle, centered horizontally and vertically on its body. Exact wording on two lines: 'Image' then 'unavailable'. Use plain clean medium-weight sans-serif lettering, large enough to read when the bottle is displayed at 140px tall. No label rectangle, no other text, no logo, no decoration. Preserve real alpha transparency and remove any surrounding glow or halo; outside the bottle must be fully transparent.
