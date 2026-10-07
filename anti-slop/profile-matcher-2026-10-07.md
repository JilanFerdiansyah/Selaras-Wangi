# Collection-based fragrance profile

User clarified that every favorite must form one taste profile, then approved the implementation plan with “good update it”. This supersedes the individual-favorite Jaccard matcher and its comparison selector.

## Algorithm

Each unique favorite is a binary vector over canonical listed notes, divided by the square root of its note count. This gives every perfume unit vector length before averaging. The centroid is the arithmetic mean of the normalized favorite vectors. Candidate similarity is its normalized vector's dot product with the centroid, divided by centroid length (cosine similarity).

The candidate itself and repeated perfume identities are excluded. Contributors are sorted by identity before arithmetic, making results independent of selection order. Empty note lists are omitted and reported; at least two unique contributing favorites and a candidate note list are required. Existing conservative alias normalization is retained. No note intensity, actual formulation, sensory perception, or liking probability is inferred.

Counts retain the number of contributing perfumes that list each note. Shared evidence is ordered by count, then accumulated profile weight, then canonical key. New notes are candidate notes absent from all contributors. Result previews contain up to four notes with exact remaining counts. The matcher uses all notes, regardless of preview length.

## Labels and limitations

Prototype cosine thresholds are High >= .70, Medium >= .35, Low below .35. Old Jaccard thresholds are discarded. Mathematical cases and real catalog profiles were reviewed; these thresholds remain provisional and require wearer feedback before any validated preference claim. Count of evidence is separate from similarity. More favorites can lower similarity, and duplication of the same pattern with new perfume identities does not increase cosine purely because the count grows.

Reviewed real catalog cases for Darker Shades: Addict + Fantasy .4743 Medium; Addict + Ambar Janma .1826 Low; Addict + Fantasy + Ambar Janma .4045 Medium. Identical profiles yield 1 and disjoint profiles 0. A centroid can blur distinct scent preferences; this prototype does not cluster preferences or discard unusual favorites.

## Copy and visuals

Fixed copy reports a real recurring note and contributor count, then at most two notes new to the collection. Two contributors use “both of your favorites” instead of “all 2”. Missing-data denominators count usable favorites only, with omissions stated in the footnote. No generative AI, trained model, or remote matching request is used.

Keep the desktop composition: dominant selected circle on the left, concise result on the right. A visible collection of all selected favorites replaces the individual reference and dropdown. Long names use a two-line caption preview with full title and accessible image name. Collection heading identifies its size. The calm orbit moves every bottle into its final collection position; none is removed in favor of a closest reference. Reduced motion skips the intermediate animation.

## Verification

Automated checks: exact cosine geometry, identical/disjoint profiles, equal unit magnitude for short and long note lists, recurring counts, order invariance, duplicate and target exclusion, all-favorite influence, no count-based score inflation, insufficient data, missing-data exclusion, explicit aliases and distinct note variants, new threshold boundaries, fixed explanation cases, and real catalog regression. All pass. Inline JavaScript parses and git diff whitespace check passes.

Browser: one favorite prompts another and hides comparison; two favorites produce one combined profile. Addict + Fantasy displays the same Medium result and factual counts as the engine. Five favorites stay visible after keyboard-activated animation. Editing full favorites preserves them and focuses a removal control; removing the long-name favorite and comparing again changes five to four and updates the denominator. No selector remains. Focus reaches the result heading.

Five favorites at 1280 x 720, 900 x 600, and 720 x 520: no center scroll-height overflow or horizontal overflow; both panels fit between header and footer. Mobile 390 x 844 retains a stacked collection. At 320 x 568, scrolling exposes both 44px actions, without horizontal overflow. Temporary viewport reset.

Preview server was restarted. Browser initially retained the legacy matching script, causing an assess-not-a-function error; versioning the script URL to matching.js?v=profile-1 resolved it. No new runtime errors appeared through the subsequent complete flows. The earlier error remains in the captured log history.

## Delivery Gate

Hard Gate PASS for these checks: real catalog assets, fixed evidence-based copy, functioning minimum and edit paths, tested matcher, keyboard activation/focus, existing image error/loading states, and reduced-motion path retained.

Purpose Gate PASS: collection-wide profile and visible favorites match the user's intended unit; two bounded note lists maintain concise reading; controlled animation explains the transition and settles.

Liveliness PASS: dominant bottle and calm motion retain the existing visual identity while showing the full collection.

Craftsmanship and Quality Locks PASS within tested samples. Category calibration, diverse preference clusters, physical-device behavior, and full screen-reader/zoom testing remain outside this verification. Missing-note branches were exercised in tests rather than by falsifying catalog records.
