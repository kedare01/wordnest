# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**WordNest** — browser spelling game for kids, built from `index.html` plus a static word-list data file (`words.js`). Open `index.html` directly in any browser; no server, no build step. Hosted as-is on GitHub Pages, which serves the repo root directly.

## Architecture

`index.html` holds inline `<style>`, HTML markup, and an inline `<script>`. `words.js` is loaded via a plain `<script src="words.js">` tag before the inline script and defines `EVERYDAY_WORDS`, a flat global array — no build step or module system involved. Runtime dependencies are CDN-loaded (Tailwind CSS Play CDN, Google Fonts — requires internet).

**Three screens** share the same DOM; only one has `class="active"` at a time:
- `#setup-screen` — parent enters words (one per line)
- `#game-screen` — the spelling game
- `#stats-screen` — per-word wrong-attempt counts after all words finish

**Game flow:** for each word the player goes through Level 1 → 2 → 3, then moves to the next word.
- Level 1: correct key glows on the QWERTY keyboard + a bouncing arrow points at the current slot
- Level 2: hint is gated behind a parent math-verification modal (random single-digit multiplication); passing it briefly glows the correct key
- Level 3: no hints

**Confetti** fires only on Level 3 completion (`launchConfetti(55)`) and on the stats screen (`launchConfetti(80)`) — not on Level 1/2 completions.

**Word pronunciation:** `speakWord()` uses the Web Speech API (`speechSynthesis`) to auto-speak the current word every time `loadState()` runs (new word or level transition). The 🔊 Hear Word button lets the player replay it on demand. Words are stored uppercase but spoken as `Word.charAt(0) + rest.toLowerCase()` — feeding an all-caps string to `SpeechSynthesisUtterance` makes some engines spell it letter-by-letter instead of pronouncing it. The button is hidden at init if `speechSynthesis` isn't in `window`.

**Word validation:** `startGame()` silently drops non-alpha entries and words longer than 45 letters. A real-time `input` listener on `#words-input` calls `findTooLongWords()` and shows `#word-warning` before the user presses Start.

**Init sequence:** at script load time, `createBgFloats()` creates the ambient floating emoji elements, then dark mode is restored from `localStorage`, then the welcome modal is shown on first visit.

**Random word practice:** `generateRandomWords()` samples `randomWordCount` (5/10/15/20, picked via `.random-count-btn` buttons) words from `EVERYDAY_WORDS` (defined in `words.js`, ~9.4k common English words filtered from Google's frequency list) and fills `#words-input`. Two exclusion layers keep results fresh: `sessionUsedWords` (in-memory `Set`, cleared only on page reload) skips words already generated this session, and `getPracticedWords()`/`markWordPracticed()` track words the player has fully completed (Level 3 done, called from `goNext()`) in the `wordnest-practiced-words` localStorage key with a 24-hour TTL. If the pool would run dry under both exclusions, `generateRandomWords()` relaxes the 24h exclusion first, then resets `sessionUsedWords` — the generator always returns the requested count if `EVERYDAY_WORDS` has enough entries.

## Key state variables

All module-level `let` in the inline script:
- `words`, `wordIdx`, `level`, `letterIdx` — current position in the game
- `wrongAttempts` — object keyed by uppercase word; counts wrong key presses across all three levels
- `levelDone`, `hintTimer`, `feedbackTimer` — transient flags/timers
- `verifyAnswer` — the correct answer for the current parent-verify multiplication problem

## localStorage keys

| Key | Purpose |
|-----|---------|
| `wordnest-theme` | `"dark"` or `"light"`; absent means respect OS preference |
| `spellbee-visited` | Truthy after first visit; suppresses welcome modal on return |
| `wordnest-practiced-words` | JSON map of lowercase word → timestamp last fully practiced (Level 3 completed); entries older than 24h are pruned lazily on read. Used by `generateRandomWords()` to avoid repeating recently-practiced words. |

## Modals

Two modals share the `.modal-overlay` pattern (hidden by default, shown with `.open`):
- `#welcome-modal` — shown on first visit (`!spellbee-visited`); reopened by the `?` header button (`showWelcome()`)
- `#verify-modal` — opened by the Level 2 hint button (`openVerify()`); parent solves multiplication to grant hint

## Styling

- **Framework:** Tailwind CSS Play CDN with `darkMode: 'class'`. Dark mode toggled by `toggleDarkMode()`, persisted in `localStorage` under key `wordnest-theme`. On first visit, OS preference (`prefers-color-scheme`) is respected.
- **Font:** Fredoka One (Google Fonts) applied globally via `html, body { font-family: 'Fredoka One', cursive }`.
- **Responsive sizing:** CSS `clamp()` and `vh`/`vw` units throughout — no media queries. The custom property `--word-len` is set by JS in `loadState()` so slot widths auto-fit the current word length.
- **Layout:** `html, body { height:100%; overflow:hidden }`. Screens fill `calc(100vh - var(--header-h))`. The header and all screens share `max-width: 840px` and `padding: var(--pad-h)` so their edges align.
- **Color scheme:** Gmail-inspired — Google Blue (`#1A73E8`) as primary, Google Green (`#34A853`) as secondary, with dark-mode surfaces matching Gmail dark (`#202124`, `#2D2E30`).

## Keyboard key colors

`KEY_COLORS` maps every letter A–Z to a unique hex color. All key colors are managed **exclusively via JS inline styles** (`restoreKey`, `setKeyGlow`, `flashKey`) — never via CSS classes — because inline styles must override class-based styles on the same element.

## Keyboard input

Mouse clicks on `.key` buttons and physical keystrokes (`keydown` on `document`) both call `onKey(ch)`. `Enter`/`Space` trigger `goNext()` when the Next button is visible. The `keydown` listener is guarded so it only fires when `#game-screen` is active and no modifier keys are held.

## CSS classes owned by JS

The following classes are set/toggled by JS and must remain defined in the `<style>` block (not replaced by Tailwind utilities):

`screen`, `screen.active`, `modal-overlay`, `modal-overlay.open`, `key`, `key.hint-glow`, `kb-row`, `slot-wrap`, `slot`, `slot.active`, `slot.filled`, `slot.letter-pop`, `slot.shake`, `hint-arrow`, `hint-arrow.visible`, `feedback`, `feedback.correct`, `feedback.wrong`, `feedback.celebrate`, `confetti-piece`, `star-pop`, `level-up-overlay`, `level-up-text`, `bg-float`

**Critical:** `setFeedback()` does `fb.className = 'feedback ' + cls`, which wipes every class on the element. All `.feedback` layout and state styles must live in `<style>` — never add Tailwind utilities to the feedback element or they will be lost on the first key press.
