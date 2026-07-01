# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**WordNest** — single-file browser spelling game for kids (`index.html`). Open directly in any browser for development.

## Build

```
npm install   # first time only
npm run build # outputs dist/index.html
npm run clean # removes dist/
```

The build pipeline (`build.js`) runs two passes over `index.html`:
1. **JS obfuscation** — `javascript-obfuscator` renames internal identifiers to `_0x…` hex names, base64-encodes string literals, and shuffles the string array. `renameGlobals: false` keeps top-level function names intact so HTML `onclick="…"` attributes still work.
2. **HTML/CSS minification** — `html-minifier-terser` collapses whitespace, strips comments, and minifies inline CSS. JS is left untouched here since it was already processed in step 1.

Output goes to `dist/index.html`. Distribute that file; keep `index.html` as the editable source.

## Architecture

Everything lives in `index.html`: inline `<style>`, HTML markup, and an inline `<script>`. There is no module system, bundler, or external library.

**Three screens** share the same DOM; only one has `class="active"` at a time:
- `#setup-screen` — parent enters words (one per line)
- `#game-screen` — the spelling game
- `#stats-screen` — per-word wrong-attempt counts after all words finish

**Game flow:** for each word the player goes through Level 1 → 2 → 3, then moves to the next word.
- Level 1: correct key glows on the QWERTY keyboard + a bouncing arrow points at the current slot
- Level 2: hint is gated behind a parent math-verification modal (random single-digit multiplication); passing it briefly glows the correct key
- Level 3: no hints

**Key state variables** (all module-level `let`):
- `words`, `wordIdx`, `level`, `letterIdx` — current position in the game
- `wrongAttempts` — object keyed by uppercase word, counts wrong key presses across all three levels
- `levelDone`, `hintTimer`, `feedbackTimer` — transient flags/timers

**Responsive sizing** is done entirely with CSS `clamp()` and `vh`/`vw` units — no media queries. The CSS custom property `--word-len` is set by JS in `loadState()` so slot widths auto-fit the current word length.

**Logo:** inline SVG in `.site-logo` — two letter-eggs (W in orange, N in green) sitting in a brown nest. No external file needed.

## Keyboard input

Both mouse clicks on `.key` buttons and physical keystrokes (`keydown` on `document`) call the same `onKey(ch)` function. The `Enter`/`Space` keys trigger `goNext()` when the Next button is visible.
