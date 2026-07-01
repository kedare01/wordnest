#!/usr/bin/env node

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function build() {
    let minify, JavaScriptObfuscator;
    try {
        ({ minify } = await import('html-minifier-terser'));
        JavaScriptObfuscator = (await import('javascript-obfuscator')).default;
    } catch {
        console.error('\n  ✗  Dependencies not installed. Run: npm install\n');
        process.exit(1);
    }

    console.log('\n🪺  Building WordNest...\n');

    const src = fs.readFileSync('index.html', 'utf8');

    // ── Step 1: obfuscate every inline <script> block ──────────────────────
    // renameGlobals:false keeps top-level function names intact so that
    // HTML onclick="..." attributes continue to work after obfuscation.
    console.log('  → Obfuscating JavaScript...');
    const withObfuscatedJS = src.replace(
        /<script>([\s\S]*?)<\/script>/gi,
        (_match, js) => {
            const result = JavaScriptObfuscator.obfuscate(js.trim(), {
                compact: true,
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false,
                stringArray: true,
                stringArrayThreshold: 0.8,
                stringArrayEncoding: ['base64'],
                stringArrayIndexShift: true,
                stringArrayRotate: true,
                stringArrayShuffle: true,
                simplify: true,
                numbersToExpressions: true,
                transformObjectKeys: true,
                target: 'browser',
            });
            return `<script>${result.getObfuscatedCode()}</script>`;
        }
    );

    // ── Step 2: minify HTML + inline CSS ───────────────────────────────────
    // minifyJS is false here — JS was already handled above.
    console.log('  → Minifying HTML & CSS...');
    const output = await minify(withObfuscatedJS, {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: {
            level: { 1: { all: true }, 2: { all: false } },
        },
        minifyJS: false,
    });

    // ── Step 3: write output ────────────────────────────────────────────────
    const outDir  = path.join(__dirname, 'dist');
    const outFile = path.join(outDir, 'index.html');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, output, 'utf8');

    const srcKB = (Buffer.byteLength(src,    'utf8') / 1024).toFixed(1);
    const outKB = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
    console.log(`\n  ✓  dist/index.html  (${srcKB} KB → ${outKB} KB)\n`);
}

build().catch(err => {
    console.error('\n  ✗  Build failed:', err.message, '\n');
    process.exit(1);
});
