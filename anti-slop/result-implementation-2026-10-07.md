# Deterministic result implementation

The user requested implementation of the agreed algorithm, fixed copy, and next-page visualization. This authorizes the new result screen; it supersedes the earlier pause on results.

## Algorithm

`matching.js` compares unique normalized note keys using Jaccard similarity, shared keys / union keys. It compares each reference separately, excludes the target itself, and ranks available references by score, preserving input order for ties. It never combines favorites into one fabricated fragrance profile.

Raw normalized keys preserve distinctions such as musk versus white musk and rose versus red rose. One explicit alias merges cedar wood with cedarwood. Non-string and empty values are ignored. Missing note lists produce an unavailable result, not a low score. All current catalog perfumes have at least one note; the unavailable branch is covered by tests for future data.

Initial labels: High >= 0.50, Medium >= 0.20, Low below 0.20. These are provisional boundaries for listed-note overlap, not validated perceived similarity or liking predictions. Human review and calibration remain necessary before launch.

## Copy

The locked titles are High overlap, Medium overlap, Low overlap. The approved warmer template is '{shared notes} connect(s) it to {reference}, with {different notes} in the mix.'

The first two alphabetically sorted canonical keys supply each short list. The full intersections and both differences appear below. No claim is made that the short-list notes are dominant or exhaustive. Separate fixed templates handle zero shared notes, no target-only notes, and missing information. All result copy is computed locally with no AI service or generated explanations.

## Visual direction and purpose

Reading: editorial perfume comparison for Indonesian perfume shoppers, ENERGY 2 / RHYTHM 2 / MOTION 3 across the flow; the result settles after entry for reading.

- Keep serif questions and the existing cream/green palette for continuity.
- A large circular selected perfume and smaller circular reference make their roles distinct while retaining the user's circle preference.
- A thin line connects the pair as a comparison relationship, without suggesting a percentage or performance meter.
- The headline states overlap; the explanation names the actual connection and difference.
- Shared notes receive the restrained green accent; differences use neutral chips, so difference is not treated as a negative verdict.
- Reference buttons compare one favorite at a time. Their pressed state identifies the active reference.
- No decorative orbit runs behind the result. The entrance transition connects the stages, then the content stays still for reading; reduced-motion retains the no-animation path.
- On narrow screens, note columns stack at 360px and the result scrolls inside the app. All actions remain reachable.

## Verification

- Algorithm checks passed: symmetry, identical profiles, zero overlap, missing data, duplicate notes, ignored invalid values, explicit alias, distinct note variants, score boundaries, ranking, exclusion of target, and tie order.
- Copy checks passed: one versus multiple shared-note grammar, no target differences, zero shared notes, missing data, and fact-filled templates.
- Real catalog regression: Darker Shades / Addict yields shared amber and patchouli and Jaccard 2/14. This is Low under the provisional boundaries.
- Browser ranking: among Addict, Ambar Janma, and Aoera Fantasy, Darker Shades opens with Fantasy at Medium overlap. All four shared notes are visible, though the sentence names only two.
- See comparison opens the real result screen after at least one favorite.
- Switching to Ambar Janma updates the photos, active button, zero-overlap copy, and complete note groups.
- Space on a reference button switches the comparison using the keyboard.
- Edit favorites returns with all choices intact.
- Compare another perfume returns to the target search. Selecting Addict removes only the Addict duplicate while retaining Fantasy and Ambar Janma.
- Five references: comparison still opens; editing returns focus to a removal chip while search remains disabled. Removal re-enables search.
- Removing all five references hides See comparison, preventing an empty result.
- Result buttons measured 44px high on phone.
- Examined 1440 x 900 and 390 x 844 screenshots. At 320 x 568, document width stays 320px, notes stack into one column, and content scrolls. At 768 x 1024, document width stays 768px.
- Phone scrolling exposed the footer and both working result actions.
- Captured browser warning/error logs were empty.
- JavaScript parsing and git diff whitespace checks passed.

## Delivery Gate

- Hard Gate PASS for this implementation: real catalog content, fixed factual copy, functional controls, keyboard operation, tested responsive samples, 44px actions, inherited contrast-safe text and focus tokens, and existing image loading/error fallbacks.
- Purpose-Gate PASS: paired circles, connection line, note-chip hierarchy, restrained accent, and settled result motion have purposes recorded above. No invented score visualization or new external assets.
- Liveliness PASS: selected perfume remains the main product visual, the circle motif carries across stages, and the result has a distinct reading composition within the existing editorial identity.
- Craftsmanship and Quality Locks PASS for this change: engine/copy checks passed, all new control types were exercised, and empty/missing-data behavior is explicit.

Scope limits: this is a working prototype, not a validated perfume-preference predictor. Category thresholds still need review. Physical-device keyboard behavior, 200% text resize, full assistive-technology testing, and runtime image failures on blocked networks were not certified in this change. Missing-note behavior was tested in the engine rather than by inserting fake catalog records into the live app.
