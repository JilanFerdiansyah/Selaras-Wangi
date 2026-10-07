# Audit 001 follow-up

The user approved all eight findings with 'do all'. All eight were implemented in index.html. The existing hero orbit remains; the results page remains intentionally absent.

## Approved fixes

1. R-03: clear search is now 44 x 44px; favorite chips and change-perfume controls are at least 44px high. Measured in the browser.
2. R-25: search placeholder, brands, and metadata use #606a5d on cream, measured at 5.56:1. Input and chip boundaries use #858b80, measured at 3.44:1 against cream; focus uses #60754f, measured at 4.98:1 against #fffdf9. The limit state no longer fades text through opacity.
3. R-27: all catalog image locations share a loading and failure component. Loading shows brand initials and a loading label; failure shows initials and 'Image unavailable', with an accessible description. Missing URLs immediately enter the failure state. Successful images replace the fallback. These branches passed a Node harness using the actual helper and mocked image events; blocked-network behavior was not simulated in the browser.
4. R-02: generated brand/name labels use a middle dot; page title uses a colon. Actual catalog names were preserved.
5. R-19: background bottles fade to zero opacity on selection and their motion settles. Favorites have their own slow motion phase. Returning to the hero restores the original orbit. Existing reduced-motion handling prevents both orbital phases from advancing.
6. R-20: selected product frame grows to 190 x 196px desktop and 160 x 176px mobile, with gentle image scaling and a softer rectangular backing. The caption now wraps and explicitly says 'Considering'. Second-screen headline is smaller; hero typography remains.
7. R-20 / C-4: changing the target keeps favorites. Selecting a favorite as the target removes only that duplicate by ID.
8. R-08: removed external-link arrows from search options and simplified the row grid.

## Recorded interaction checks

- Search: HMNS and product-name queries produced actual catalog options.
- Keyboard: ArrowDown and Enter selected the target and opened screen two.
- Favorites: clicking a suggestion added a chip and scene image.
- Limit: adding five references disabled search and displayed 'Five references selected'.
- Removal: removing one reference re-enabled search and retained the remaining four.
- Change target: Ambar Janma survived the change from Darker Shades to Addict.
- Duplicate: switching from Addict to Darker Shades, which was then a favorite, removed only Darker Shades and retained the other three.
- Empty search results: a nonsense query displayed the no-match message.
- Clear: clear search emptied the field and closed suggestions.
- Escape: closed suggestions.
- Focus: Tab reached a favorite removal chip with a visible green outline.
- Background: computed bottle opacity was zero on screen two.
- Responsive: inspected 1440 x 900 and 390 x 844. At 320 x 568 the content scrolls within the second screen and document width remains 320px; tablet width remains 768px with no horizontal overflow.
- Console: captured warning/error logs were empty during browser verification.
- Static checks: JavaScript parse and git diff whitespace checks passed.

## Design purposes

Reading: an editorial perfume-selection interface for Indonesian perfume shoppers, ENERGY 2 / RHYTHM 2 / MOTION 3.

- Color: cream surfaces and muted green support the existing fragrance identity; darker tokens restore legibility.
- Typography: serif questions retain the editorial tone, while sans-serif controls favor reading product names.
- Composition: the hero asks for a target; the second screen shifts visual attention to that real product.
- Spacing: the orbit gets its own area; a wrapping caption separates the selected product from the next question.
- Radius: the search remains a pill, chips use 12px corners, and the target uses a soft rectangular frame to distinguish their roles.
- Shadow: retained for the search and suggestion layer to make the input and overlay easier to distinguish.
- Motion: the hero orbit invites browsing; after selection the actual favorites orbit the target to express the reference set. Supporting decorative motion fades away.
- Images: actual catalog photos identify selections; failures are explicit rather than blank.

## Delivery Gate for approved changes

- Hard Gate PASS for the approved fixes: touch targets measured, contrast computed, authored separators updated, and image state handlers verified. Existing controls have real behaviors. No new visual assets, claims, statistics, or destinations were invented.
- Purpose-Gate PASS: motion and radii now distinguish browsing, selection, and removal. Search arrows were removed. Major design reasons are recorded above.
- Liveliness PASS: original hero orbit and serif identity retained; actual selected perfume becomes the second-screen visual focus. Dials are recorded above.
- Craftsmanship and Quality Locks PASS for this change: selection, preserved favorites, duplicate handling, limit, removal, clear, Escape, and responsive samples were exercised; syntax and whitespace checks passed.

This is verification of the approved prototype refinements, not certification of the whole app. A real on-screen mobile keyboard, 200% text resizing, assistive-technology behavior, and runtime image failures on a blocked connection still need device-level checks before release. The result algorithm and result page remain separate unfinished product work.

## Owner adjustment: circular selected frame

The user requested a circular target to match the surrounding favorites. Updated to equal width and height: 196px desktop, 176px mobile, with 50% border radius. Browser verification confirmed 196 x 196px and 50% radius; selecting a target and adding a favorite still worked. Scoped Delivery Gate PASS: no new content or assets, shape matches the owner's direction, and existing image scale and layout are retained.
