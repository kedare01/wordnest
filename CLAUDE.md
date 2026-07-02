# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**WordNest** — single-file browser spelling game for kids (`index.html`). Open directly in any browser for development. No server needed.

## Commands

```
npm install         # first time only
npm run build       # outputs dist/index.html
npm run clean       # removes dist/
npm test            # run unit tests (vitest)
npm run test:watch  # vitest in watch mode
```

## Build pipeline

`build.js` runs two passes over `index.html`:

1. **JS obfuscation** — `javascript-obfuscator` renames internal identifiers to `_0x…` hex names, base64-encodes string literals, and shuffles the string array. `renameGlobals: false` keeps top-level function names intact so HTML `onclick="…"` attributes still work.
2. **HTML/CSS minification** — `html-minifier-terser` collapses whitespace, strips comments, and minifies inline CSS. JS is left untouched here (already handled in step 1).

Distribute `dist/index.html`; keep `index.html` as the editable source.

## Architecture

Everything lives in `index.html`: inline `<style>`, HTML markup, and an inline `<script>`. Runtime dependencies are CDN-loaded (Tailwind CSS Play CDN, Google Fonts — requires internet).

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

## Unit tests

Pure logic is extracted to `src/logic.js` (ES module) and tested with Vitest in `test/logic.test.js`. The exports there are the **source of truth** — `index.html` contains equivalent inline definitions for the browser bundle. When changing logic, update both files.

Exported from `src/logic.js`:
- `parseWords(raw)` — splits textarea input, uppercases, drops non-alpha and words longer than `MAX_WORD_LENGTH`
- `findTooLongWords(raw)` — returns words that exceed `MAX_WORD_LENGTH`; used for real-time setup-screen warnings
- `scoreLabel(n)` — medal label for a wrong-attempt count
- `checkVerify(inputStr, expected)` — validates the parent math-check answer
- `QWERTY`, `KEY_COLORS`, `LEVEL_DESC`, `MAX_WORD_LENGTH` (= 45, the length of *pneumonoultramicroscopicsilicovolcanoconiosis*)
