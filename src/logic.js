// Pure game logic — no DOM dependencies.
// index.html inlines equivalent definitions for the browser bundle;
// this module exists as the testable source of truth.

export const QWERTY = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
];

export const KEY_COLORS = {
    Q:'#FF6B6B', W:'#FF9F43', E:'#FECA57', R:'#26DE81', T:'#2BCBBA',
    Y:'#45AAF2', U:'#A55EEA', I:'#FD9644', O:'#FC5C65', P:'#0FB9B1',
    A:'#6C5CE7', S:'#FDCB6E', D:'#E17055', F:'#00B894', G:'#0984E3',
    H:'#E84393', J:'#6AB04C', K:'#F9CA24', L:'#D63031', Z:'#00CEC9',
    X:'#FD79A8', C:'#BADC58', V:'#F0932B', B:'#EB4D4B', N:'#7ED6DF',
    M:'#686DE0',
};

export const LEVEL_DESC = [
    '',
    '🟡 Level 1 — Watch the glowing key and the arrow pointing to it!',
    '🔵 Level 2 — Press 💡 Hint if you need help finding the key!',
    '🟢 Level 3 — No hints! Type the word all by yourself! 💪',
];

// Longest word in the dictionary: pneumonoultramicroscopicsilicovolcanoconiosis (45 letters)
export const MAX_WORD_LENGTH = 45;

/**
 * Parse raw textarea input into an array of uppercase words.
 * Splits on newlines and commas, trims whitespace, drops non-alpha entries
 * and anything longer than MAX_WORD_LENGTH.
 */
export function parseWords(raw) {
    return raw
        .split(/[\n,]+/)
        .map(w => w.trim().toUpperCase())
        .filter(w => /^[A-Z]+$/.test(w) && w.length <= MAX_WORD_LENGTH);
}

/**
 * Return the score label for a given wrong-attempt count.
 */
export function scoreLabel(n) {
    if (n === 0) return '🥇 Perfect!';
    if (n <= 3)  return '🥈 Well done!';
    if (n <= 8)  return '🥉 Good try!';
    return '💪 Keep practicing!';
}

/**
 * Return alphabetic words from raw input that exceed MAX_WORD_LENGTH.
 * Used to show a real-time warning in the setup screen.
 */
export function findTooLongWords(raw) {
    return raw
        .split(/[\n,]+/)
        .map(w => w.trim().toUpperCase())
        .filter(w => /^[A-Z]+$/.test(w) && w.length > MAX_WORD_LENGTH);
}

/**
 * Validate a parent-verify answer string against the expected product.
 * Returns { ok: true } on success or { ok: false, error: string } on failure.
 */
export function checkVerify(inputStr, expected) {
    const val = parseInt(inputStr, 10);
    if (isNaN(val)) return { ok: false, error: 'Please enter a number.' };
    if (val !== expected) return { ok: false, error: '❌ Not quite — try again!' };
    return { ok: true };
}
