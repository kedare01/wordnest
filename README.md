# 🪺 WordNest

## Why this exists

I built this for my son in first grade. Spelling practice with a worksheet is boring — he'd tune out in two minutes.

WordNest grew out of a simple idea: what if a parent could paste in this week's spelling list and the child could practice right now, on the screen, with color and sound feedback — no account, no subscription, no app store? Just open a file.

The three-level structure mirrors how kids actually learn a new word: first they follow along (Level 1 shows you exactly which key to press), then they try with occasional help (Level 2 lets a parent unlock a hint), and finally they do it alone (Level 3, no hints). Repeating all three levels for each word before moving on locks in muscle memory.

---

## What it does

- Parent types the week's spelling words (one per line) and presses **Start**
- For each word the child goes through three rounds:
  - **Level 1** — the correct key glows and a bouncing arrow points to it
  - **Level 2** — no automatic hint; tap 💡 and a parent solves a quick multiplication to unlock a brief glow
  - **Level 3** — no hints at all; pure recall
- Wrong attempts are counted silently per word across all levels
- After the last word, a results table shows each word with its wrong-attempt count and a medal score

---

## How to use it

**No installation needed for playing.** Open `index.html` in any modern browser.

```
index.html   ← double-click this
```

Type your words in the text box and press **Start Practice!**

Words must be letters only. Maximum 45 letters (the length of *pneumonoultramicroscopicsilicovolcanoconiosis*). The app warns you in real time if a word is too long.

---

## Development

There's no build step. `index.html` is the entire app — edit it and refresh your browser.

---

## Tech

- No framework, no bundler, no backend
- [Tailwind CSS Play CDN](https://tailwindcss.com/docs/installation/play-cdn) — requires internet
- [Fredoka One](https://fonts.google.com/specimen/Fredoka+One) via Google Fonts — requires internet
