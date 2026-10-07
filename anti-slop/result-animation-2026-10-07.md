# Result transition

User approved the discussed animation with “do it”. Existing product photos and circle motif carry the favorite-selection scene into the result.

## Purpose and behavior

- Actual selected perfume remains the main visual. Favorites sweep 0.6 turns over 2,800 ms, easing to a stop.
- “Comparing notes” is the only status copy. Matching is still local Jaccard with fixed copy; the duration is deliberate presentation timing, not computational cost or AI processing.
- Over 1,100 ms, the selected bottle and closest reference move into their exact result positions. Other favorites and the status fade away.
- Captions, title, explanation, and supporting notes reveal in sequence over 1,060 ms. Motion then stops for reading. The reveal class is removed after 1,100 ms so switching references does not restart it.
- Under reduced motion, the intermediate scene and delay are skipped. Changing the preference during the transition finishes the current stages immediately.
- The underlying controls are inert while comparing. Focus moves to the status, then to the result heading. Re-entry is guarded so repeated activation cannot duplicate the transition.
- Loaded and failed image states can be reused; images still loading get the existing load/error handlers rather than a frozen loading clone.

## Verification

Desktop with two references: status appeared, closest reference was Fantasy, and Medium overlap with full notes followed. Mobile at 390 x 844 with one reference: Enter activated comparison, status appeared, Low overlap with Addict followed, no horizontal overflow, and focus reached the result heading. Edit favorites preserved the reference; repeating comparison completed normally. Temporary phone viewport was reset. Captured warning/error logs were empty.

Source-extracted checks passed for animation completion, reduced-motion frame skipping, preference changes during an active frame sequence, immediate result under reduced motion, and re-entry guarding. Inline JavaScript parses; existing matching tests and git diff whitespace checks pass. Reduced motion was checked in the source harness rather than by changing the user's OS setting.

## Delivery Gate

Hard Gate: PASS for this change. Real existing product assets, truthful fixed status copy, focus handling, inert controls, reduced-motion path, and existing image fallbacks.

Purpose Gate: PASS. Orbit carries the user's established motif into a finite comparison transition; settling positions explain the final pair; staged text supports reading order. No new decorative effects or assets.

Liveliness: PASS. Product photos perform the transition instead of a generic spinner. The target retains the dominant size.

Craftsmanship and Quality Locks: PASS within the checked desktop/mobile samples and source harness. Physical-device keyboard and full screen-reader testing remain outside this verification.

## Calmer pacing revision

User requested a slower, calm transition. Orbit now takes 2.8 seconds with a shorter sweep; the initial positioning eases over 840 ms. The pair settles over 1.1 seconds using symmetric acceleration and deceleration, instead of a fast initial snap. Text moves only 6px during its slower staggered reveal. Total presentation is about five seconds, and reduced motion still skips the delay.

## Edit favorites return revision

The current matcher and results use the combined favorites profile described in profile-matcher-2026-10-07.md; the original pairwise description above is historical.

Edit favorites and Back now reuse the visible candidate and every favorite photo as a shared transition. Existing text fades over 140 ms, then circles move into the measured selection positions over 780 ms with symmetric easing. Selection controls fade in during the final 312 ms. No comparison status or artificial processing delay appears on return.

The orbit phase pauses outside favorite selection and during the handoff. Scene reconstruction uses that same phase, and the restored scene skips its separate entrance animation. Pending reveal timers are cleared; repeated activation is guarded and controls remain inert until completion. Reduced motion returns immediately.

Verification: desktop Edit favorites and 390 x 844 Back preserved both favorites, completed the return, and removed the temporary overlay. Mobile had no horizontal overflow. Inline JavaScript parses; source harness verified immediate reduced-motion return and re-entry guards; git diff whitespace check passed. Physical-device and screen-reader testing were not performed.

Hard Gate: PASS for this change. Existing real product photos, no new claims, reduced-motion path and focus restoration retained.

Purpose Gate: PASS. Shared circles make the relationship between results and the editable favorites clear; preserving phase prevents a jump.

Liveliness: PASS. The established bottle orbit carries the navigation, without a generic loading effect.

Craftsmanship and Quality Locks: PASS within the desktop/mobile checks and source harness above.
