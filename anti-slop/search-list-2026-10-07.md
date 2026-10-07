# Search visibility revision

Desktop favorites now use two columns: a larger perfume orbit on the left, heading and search on the right. Controls fit the viewport; only the dropdown scrolls when its content exceeds available space. Rows use 44px thumbnails and slightly tighter padding. The first-page search shifts upward while results are open.

On mobile, focusing search opens a full-height panel with a close button and search at the top. An empty query shows the first six eligible catalog entries in existing catalog order; typed queries retain the existing ranking. Selecting a favorite returns to the orbit, and Close moves focus to the question. The visual viewport continues to account for the keyboard.

Verification: six complete rows at 1280 x 720. Keyboard ArrowDown/Enter selected Addict. At 390 x 844 the panel showed six matches without horizontal overflow and Close restored favorite selection. At 900 x 600, both the first-page list and favorites list showed five complete rows after compact spacing adjustments. Real phone keyboard behavior was not physically tested. Inline JavaScript parses and git diff whitespace check passes.

Hard Gate: PASS in checked scope. Existing catalog and real images, accessible close control and existing keyboard selection retained.

Purpose Gate: PASS. Two columns reclaim vertical room while preserving the perfume as the primary visual; mobile search isolates the current selection task.

Liveliness: PASS. The bottle orbit remains visible and larger on desktop; no new decorative assets.

Craftsmanship and Quality Locks: PASS within the sampled viewports and browser interactions above. Full assistive-technology and physical-device testing remain outside this check.

## Centered form and motion revision

The desktop heading, promise, search, favorites and actions now form one vertically centered group opposite the perfume orbit. The caption sits directly beneath that orbit instead of at the bottom of the viewport. Opening results raises the form over 560 ms; supporting controls yield the list space until it closes. The first screen uses the same duration for position, type size and spacing. Available dropdown height is measured during movement so it grows with the available room. Reduced-motion CSS removes these transitions, and measurement finishes without an animation loop.

Verification: at 1280 x 720 and 900 x 600 the resting form center exactly matched the center of its layout area. Six complete result rows remained visible at 1280 x 720. Comparison and Edit favorites retained both chosen favorites. At 390 x 844 the expanded search and Close still worked with the regrouped markup. JavaScript parses and whitespace checks pass. Physical mobile keyboard and full screen-reader verification remain untested.

Hard Gate: PASS in checked scope; reduced motion, real assets and focus behavior remain supported. Purpose Gate: PASS; motion preserves orientation while creating list space, and grouping corrects the asymmetric vertical spacing. Liveliness: PASS; orbit and coordinated form movement carry the existing identity. Craftsmanship and Quality Locks: PASS for the sampled layouts and interactions above.

## Fixed first-screen hero revision

User preferred the first screen without the search repositioning animation and requested a smaller hero font instead. Removed desktop first-screen search-state position, typography and spacing changes. Its heading now uses a fixed responsive 36–44px size; opening or closing search leaves the form in place. The second-screen centered form and mobile search panel remain unchanged.

Verification at 1280 x 720: search bounds before and after typing were identical (top 405.50px, bottom 483.50px); heading was 44px and three complete dropdown rows were visible with further entries scrollable. This narrower scope prioritizes the requested fixed hero over the prior first-screen six-row layout. Whitespace check passed.

Hard Gate: PASS; existing assets, copy and interaction retained. Purpose Gate: PASS; smaller heading frees list space without moving the form. Liveliness: PASS; original orbit remains the visual identity. Craftsmanship and Quality Locks: PASS within the checked desktop state; this revision changes desktop typography only.

## Static second-screen search positioning

User requested no animation for the second-screen center-to-top search movement. Removed both the form position/transform transition and the search-open position override. The form stays centered while suggestions open and close. The dropdown uses available space beneath the fixed search and scrolls within that space. Whitespace check passed.

## Neutral search styling

User requested neutral grey instead of sage for the search bar. Updated default border to #8a8a8a, focused border/ring to #707070, white field background, neutral text/icons/placeholder and grey disabled fill. Browser confirmed the focused grey border and white background; whitespace check passed. Existing visible focus treatment is retained.
