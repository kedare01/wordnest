import { describe, it, expect } from 'vitest';
import {
    parseWords,
    scoreLabel,
    checkVerify,
    findTooLongWords,
    KEY_COLORS,
    QWERTY,
    LEVEL_DESC,
    MAX_WORD_LENGTH,
} from '../src/logic.js';

// ── parseWords ────────────────────────────────────────

describe('parseWords', () => {
    it('splits on newlines', () => {
        expect(parseWords('cat\ndog\nbird')).toEqual(['CAT', 'DOG', 'BIRD']);
    });

    it('splits on commas', () => {
        expect(parseWords('cat,dog,bird')).toEqual(['CAT', 'DOG', 'BIRD']);
    });

    it('uppercases every word', () => {
        expect(parseWords('Apple\nBANANA\norange')).toEqual(['APPLE', 'BANANA', 'ORANGE']);
    });

    it('trims surrounding whitespace', () => {
        expect(parseWords('  cat  \n  dog  ')).toEqual(['CAT', 'DOG']);
    });

    it('drops entries that contain non-letter characters', () => {
        expect(parseWords('cat\n123\nhello world\nbird')).toEqual(['CAT', 'BIRD']);
    });

    it('skips blank lines', () => {
        expect(parseWords('cat\n\n\ndog')).toEqual(['CAT', 'DOG']);
    });

    it('returns empty array for blank input', () => {
        expect(parseWords('')).toEqual([]);
        expect(parseWords('   ')).toEqual([]);
    });

    it('handles mixed comma and newline separators', () => {
        expect(parseWords('cat,dog\nbird')).toEqual(['CAT', 'DOG', 'BIRD']);
    });

    it('handles single word', () => {
        expect(parseWords('elephant')).toEqual(['ELEPHANT']);
    });

    it('accepts a word exactly MAX_WORD_LENGTH letters long', () => {
        const word = 'A'.repeat(MAX_WORD_LENGTH);
        expect(parseWords(word)).toEqual([word]);
    });

    it('rejects words longer than MAX_WORD_LENGTH', () => {
        const tooLong = 'A'.repeat(MAX_WORD_LENGTH + 1);
        expect(parseWords(tooLong)).toEqual([]);
    });

    it('MAX_WORD_LENGTH is 45 (longest dictionary word)', () => {
        expect(MAX_WORD_LENGTH).toBe(45);
        // pneumonoultramicroscopicsilicovolcanoconiosis = 45 letters
        expect(parseWords('pneumonoultramicroscopicsilicovolcanoconiosis'))
            .toEqual(['PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS']);
    });
});

// ── findTooLongWords ──────────────────────────────────

describe('findTooLongWords', () => {
    it('returns empty array when all words are within limit', () => {
        expect(findTooLongWords('cat\ndog')).toEqual([]);
    });

    it('returns words that exceed MAX_WORD_LENGTH', () => {
        const long = 'A'.repeat(MAX_WORD_LENGTH + 1);
        expect(findTooLongWords(long)).toEqual([long]);
    });

    it('does not flag a word exactly at MAX_WORD_LENGTH', () => {
        const exact = 'A'.repeat(MAX_WORD_LENGTH);
        expect(findTooLongWords(exact)).toEqual([]);
    });

    it('ignores non-alpha entries', () => {
        expect(findTooLongWords('123\nhello world')).toEqual([]);
    });

    it('returns uppercased flagged words', () => {
        const long = 'a'.repeat(MAX_WORD_LENGTH + 1);
        expect(findTooLongWords(long)).toEqual([long.toUpperCase()]);
    });

    it('handles mixed valid and too-long words', () => {
        const long = 'B'.repeat(MAX_WORD_LENGTH + 5);
        expect(findTooLongWords(`cat\n${long}\ndog`)).toEqual([long]);
    });
});

// ── scoreLabel ────────────────────────────────────────

describe('scoreLabel', () => {
    it('returns Perfect for 0 wrong attempts', () => {
        expect(scoreLabel(0)).toBe('🥇 Perfect!');
    });

    it('returns Well done for 1–3 wrong attempts', () => {
        expect(scoreLabel(1)).toBe('🥈 Well done!');
        expect(scoreLabel(2)).toBe('🥈 Well done!');
        expect(scoreLabel(3)).toBe('🥈 Well done!');
    });

    it('returns Good try for 4–8 wrong attempts', () => {
        expect(scoreLabel(4)).toBe('🥉 Good try!');
        expect(scoreLabel(8)).toBe('🥉 Good try!');
    });

    it('returns Keep practicing for 9+ wrong attempts', () => {
        expect(scoreLabel(9)).toBe('💪 Keep practicing!');
        expect(scoreLabel(50)).toBe('💪 Keep practicing!');
    });

    it('boundary: 3 is Well done, 4 is Good try', () => {
        expect(scoreLabel(3)).toBe('🥈 Well done!');
        expect(scoreLabel(4)).toBe('🥉 Good try!');
    });

    it('boundary: 8 is Good try, 9 is Keep practicing', () => {
        expect(scoreLabel(8)).toBe('🥉 Good try!');
        expect(scoreLabel(9)).toBe('💪 Keep practicing!');
    });
});

// ── checkVerify ───────────────────────────────────────

describe('checkVerify', () => {
    it('accepts the correct answer', () => {
        expect(checkVerify('42', 42)).toEqual({ ok: true });
        expect(checkVerify('1', 1)).toEqual({ ok: true });
        expect(checkVerify('81', 81)).toEqual({ ok: true });
    });

    it('rejects a wrong numeric answer', () => {
        const result = checkVerify('5', 42);
        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/not quite/i);
    });

    it('rejects non-numeric input', () => {
        const result = checkVerify('abc', 42);
        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/number/i);
    });

    it('rejects empty string', () => {
        const result = checkVerify('', 42);
        expect(result.ok).toBe(false);
    });

    it('rejects floating-point string (parseInt truncates, may match or not)', () => {
        // parseInt('7.9', 10) === 7, which != 8 → rejected
        const result = checkVerify('7.9', 8);
        expect(result.ok).toBe(false);
    });

    it('returns ok:true with no error key on success', () => {
        const result = checkVerify('6', 6);
        expect(result).toEqual({ ok: true });
        expect(result.error).toBeUndefined();
    });
});

// ── KEY_COLORS ────────────────────────────────────────

describe('KEY_COLORS', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    it('has an entry for every letter A–Z', () => {
        letters.forEach(l => expect(KEY_COLORS).toHaveProperty(l));
    });

    it('has exactly 26 entries', () => {
        expect(Object.keys(KEY_COLORS)).toHaveLength(26);
    });

    it('all values are valid 6-digit hex colors', () => {
        Object.values(KEY_COLORS).forEach(color => {
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });

    it('all colors are unique', () => {
        const values = Object.values(KEY_COLORS);
        expect(new Set(values).size).toBe(values.length);
    });
});

// ── QWERTY layout ─────────────────────────────────────

describe('QWERTY', () => {
    it('has exactly 3 rows', () => {
        expect(QWERTY).toHaveLength(3);
    });

    it('row lengths match standard layout (10 / 9 / 7)', () => {
        expect(QWERTY[0]).toHaveLength(10);
        expect(QWERTY[1]).toHaveLength(9);
        expect(QWERTY[2]).toHaveLength(7);
    });

    it('contains all 26 letters exactly once', () => {
        const flat = QWERTY.flat();
        expect(flat).toHaveLength(26);
        expect(new Set(flat).size).toBe(26);
    });

    it('every key has a color in KEY_COLORS', () => {
        QWERTY.flat().forEach(ch => {
            expect(KEY_COLORS).toHaveProperty(ch);
        });
    });
});

// ── LEVEL_DESC ────────────────────────────────────────

describe('LEVEL_DESC', () => {
    it('has 4 entries (index 0 unused, 1–3 for levels)', () => {
        expect(LEVEL_DESC).toHaveLength(4);
    });

    it('index 0 is empty string', () => {
        expect(LEVEL_DESC[0]).toBe('');
    });

    it('levels 1–3 have non-empty descriptions', () => {
        expect(LEVEL_DESC[1].length).toBeGreaterThan(0);
        expect(LEVEL_DESC[2].length).toBeGreaterThan(0);
        expect(LEVEL_DESC[3].length).toBeGreaterThan(0);
    });
});
