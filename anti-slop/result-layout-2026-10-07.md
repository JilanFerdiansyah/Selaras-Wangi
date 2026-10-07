# Simplified result layout

User approved the two-column plan with “yes do it”. This supersedes the earlier centered, scrolling desktop result and its three complete note lists.

## Decisions

Desktop: use the available width, approximately 55% for perfume imagery and 45% for the explanation. Selected circle grows up to 340px; reference stays smaller. The result occupies the viewport between the wordmark and footer. Shorter and narrower desktop windows use tighter spacing and smaller imagery/type, without a scroll container.

Left: paired circles and a single native favorite selector instead of a wrapping row of buttons. Existing animation measures the new image destinations, so bottles settle directly into the left composition.

Right: preserve approved overlap title and fixed explanation. Show only Shared notes and Different here. Each group previews its first four alphabetically sorted normalized notes and reports any remainder as “+N more listed”. Preview order does not imply strength or prominence. Matching still uses all listed notes. Different-in-reference is removed from the displayed view, not from the matcher.

Top Back returns to favorites. Footer retains the factual note limitation and the two existing actions. The step-number eyebrow is omitted on results to simplify the header. Mobile stacks and scrolls normally. No new external assets, AI service, or copy generation.

## Verification

- Desktop 1440 x 900, 1280 x 720, 900 x 600, and 720 x 520: center scroll height equals client height, both panels fit between header and footer, and no horizontal overflow.
- At 720 x 520, Oaken Lab's longest catalog name remains fully visible in the caption and explanation without colliding with header or actions. Native selector truncates its closed label; full name remains in caption and option.
- Selecting Addict changes the comparison, title, photos, and note previews. Selecting the long-name reference shows the actual zero-shared-note state and correct remaining count.
- Keyboard ArrowDown / Home / Enter on the native selector returns to Fantasy and updates the result; focus remains on the select.
- Top Back returns to favorites with selections preserved. Repeating comparison runs the calm animation into the new composition.
- Mobile 390 x 844 is stacked and scrollable. At 320 x 568, no horizontal overflow and scrolling exposes both 44px footer actions.
- Desktop viewport restored after phone tests. Center scrollTop resets to zero with desktop layout. Captured browser warning/error logs empty.
- Existing matcher checks pass. Inline JavaScript parses. Git diff whitespace check passes.

## Delivery Gate

Hard Gate PASS within these checks: existing real catalog and copy, working selector and actions, reduced-motion path retained, existing image fallbacks, contrast tokens retained, and 44px control sizes (Back's minimum width checked in source).

Purpose Gate PASS: wide two-column layout removes scrolling at checked desktop dimensions; product hierarchy gives the selected perfume prominence; two bounded note previews reduce reading load; native selector prevents favorite controls from consuming height.

Liveliness PASS: dominant circular perfume visual and calm transition retain the established identity without adding decoration.

Craftsmanship and Quality Locks PASS for the verified samples. Arbitrarily short windows, text zoom, and full screen-reader behavior are not certified by these measurements. Mobile scrolling is intentional.

## Selector alignment revision

User identified the selector as off-center. It was centered under the entire pair, while the dominant bottle was left of that axis. The selector and its label now share the dominant bottle's column center on desktop, using the same reference width and pair gap as the visual. Mobile continues centering it under the pair. This is an optical grouping correction, not a new page direction.

Further review recommendations, not applied: reduce the distance to the smaller reference, use content-width note chips instead of full-column tiles, and distinguish the primary footer action from the secondary one.
