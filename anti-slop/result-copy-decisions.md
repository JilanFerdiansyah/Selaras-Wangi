# Result copy decisions

The user selected the minimal, straightforward title set:

- High overlap
- Medium overlap
- Low overlap

These titles are locked. They describe note overlap, not predicted liking or measured similarity on skin. Initial implementation thresholds are High >= 0.50, Medium >= 0.20, otherwise Low. These are provisional and still need calibration against reviewed perfume pairs.

Result copy uses deterministic templates and catalog fields. No AI generation at runtime.

The user approved the direct subtitle:

- When notes overlap: Shares {shared notes} with {favorite name}.
- When no listed notes overlap: No shared notes with {favorite name}.
- When information is insufficient: Not enough note information to compare.

Use one reference perfume per subtitle and at most two displayed shared notes, selected consistently from the actual intersection. Do not imply they are the only shared notes. Additional details can show the full intersection later. Do not insert sensory claims or predict preference from a note match.

Example verified in the current catalog: Darker Shades of Orgsm shares amber and patchouli with Addict. This example establishes subtitle wording, not an overlap category.

The user approved the warmer alternative: Amber and patchouli connect it to Addict, with caramel and vanilla in the mix. Runtime template: {shared notes} connect(s) it to {favorite name}, with {different notes} in the mix. Populate shared and differing notes only from verified catalog comparisons. The example's specific notes illustrate the wording; runtime picks up to two entries in alphabetical canonical-key order, while showing the complete note sets below.

Use 'No shared notes with {favorite name}. This one lists {different notes}.' when the intersection is empty. When the target has no differing notes, use '{shared notes} appear(s) in both perfumes.' Missing note lists produce 'Not enough data' and 'Not enough note information to compare these perfumes.' Keep these states deterministic and factual.
