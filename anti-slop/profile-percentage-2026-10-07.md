# Profile overlap percentage

User approved displaying the combined-profile cosine score as a percentage with “implement it”.

The result headline now reads “N% profile overlap”. Percentage is Math.round(cosine * 100); the original full-precision cosine remains unchanged. Percentage is null for insufficient data, rather than converting missing data to zero. Genuine zero cosine displays 0%, and unit cosine displays 100%. High / Medium / Low category labels, functions, and provisional thresholds have been removed.

The metric is explicitly labeled profile overlap. It measures alignment of listed-note vectors with the normalized favorite centroid. It is not a calibrated preference probability or a percentage of physical ingredients. Fixed note-count explanation, visible collection, existing animation, and missing-data handling remain intact. Matching script version is incremented to profile-2 to avoid the previously observed stale-script cache issue.

Automated checks pass for rounding, 0 and 100 boundaries, missing/non-finite input, score preservation, and the existing profile engine. Real catalog regression: Darker Shades with Addict + Fantasy has raw cosine 0.474341649025257 and displays 47% profile overlap.

Browser verification: real two-favorite result displays 47% profile overlap with the unchanged factual explanation. At 720 x 520 the result panel fits between header and footer with zero scroll-height overflow. At 320 x 568 the document width equals the viewport width. Temporary viewport was reset and the final result screenshot saved.

Delivery Gate: Hard Gate PASS (explicit metric label, real calculated score, missing-data distinction, tested rounding); Purpose Gate PASS (whole-number percentage exposes the existing profile score without arbitrary category thresholds); Liveliness PASS (existing typography and collection remain intact); Craftsmanship PASS within algorithm tests and checked browser sizes. This is mathematical profile alignment, not calibrated preference prediction.

## Placement revision

User requested the previous title plus percentage above and slightly to the right of the selected perfume. High / Medium / Low overlap is restored using the existing provisional cosine boundaries .70 / .35. Percentage remains a separate whole-number metric with a small “profile overlap” label, positioned relative to the bottle circle, without a decorative pill or new assets. Missing-data results omit the percentage. The animation's final image measurement is preserved by the new bottle wrapper. Matcher version advances to profile-3.
