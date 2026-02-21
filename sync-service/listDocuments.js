'use strict';
// Usage: node listDocuments.js [minCount]   default minCount=5
// Output: prints to console AND saves to documents_list.txt
const path = require('path');
const fs   = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose  = require('mongoose');
const MIN_COUNT = parseInt(process.argv[2] || '5', 10);

// Decode HTML entities (&amp; &#39; etc.)
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'");
}

// Canonical key used for dedup grouping (never displayed)
function normalize(s) {
  let k = s.toLowerCase();
  k = k.replace(/aadhar\b/g,         'aadhaar');          // Aadhar → Aadhaar
  k = k.replace(/^copy\s+of\s+/,     '');                 // "Copy of X" → "X"
  k = k.replace(/^photocopy\s+of\s+/,'');                 // "Photocopy of X" → "X"
  k = k.replace(/^certified\s+copy\s+of\s+/, '');        // "Certified Copy of X" → "X"
  k = k.replace(/pass\s+book\b/,     'passbook');         // pass book → passbook
  k = k.replace(/cancel+ed\s+chequ?e/, 'cancelled cheque');
  k = k.replace(/passbook\s*[/\\]\s*cancelled cheque/, 'passbook / cancelled cheque');
  k = k.replace(/\s*\(.*?\)\s*$/, '');                   // strip trailing parenthetical
  k = k.replace(/[.,;:*_\-]+$/, '').replace(/\s+/g, ' ').trim();
  return k;
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col = mongoose.connection.collection('schemes');

  const schemes = await col
    .find({ isActive: true }, { projection: { documentsRequired_md: 1 } })
    .toArray();

  // normalizedKey → { count, displayNames: Map<displayString, frequency> }
  const docMap = new Map();

  for (const scheme of schemes) {
    const md = scheme.documentsRequired_md || '';
    if (!md.trim()) continue;

    const seenInScheme = new Set(); // count each doc only once per scheme

    for (const line of md.split('\n')) {
      let cleaned = line
        .replace(/^\s*(\d+\.|[-*>•]|\(\w+\))\s+/, '') // list markers
        .replace(/^\s*\*{1,2}/,                     '') // leading ** / *
        .trim();

      cleaned = decodeEntities(cleaned);
      cleaned = cleaned
        .replace(/\s+/g, ' ')
        .replace(/[.,;:*_]+$/, '')
        .replace(/\s*\(mandatory\)\s*$/i,    '')
        .replace(/\s*\(if\s+applicable\)\s*$/i, '')
        .replace(/\s*\(optional\)\s*$/i,     '')
        .trim();

      if (cleaned.length < 5 || cleaned.length > 100) continue;

      // Skip noise / structural lines
      if (/^(note:|#####|step \d|during |post-|at the time|sl\.?\s*no|sr\.?\s*no)/i.test(cleaned)) continue;
      if (/^[A-C]\.\s/i.test(cleaned)) continue;  // "A. Documents Related to…"
      if (/documents?\s+(required|needed|as\s+(per|required))/i.test(cleaned)) continue;
      if (/following|required at|application form/i.test(cleaned)) continue;

      const normalKey = normalize(cleaned);
      if (!normalKey || normalKey.length < 4) continue;
      if (seenInScheme.has(normalKey)) continue;
      seenInScheme.add(normalKey);

      if (!docMap.has(normalKey)) docMap.set(normalKey, { count: 0, names: new Map() });
      const entry = docMap.get(normalKey);
      entry.count++;
      entry.names.set(cleaned, (entry.names.get(cleaned) || 0) + 1);
    }
  }

  // For each group pick the most-frequent display name
  const sorted = [...docMap.values()]
    .map(({ count, names }) => ({
      count,
      name: [...names.entries()].sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => b.count - a.count);

  const filtered = sorted.filter(e => e.count >= MIN_COUNT);

  const lines = [
    `Active schemes scanned: ${schemes.length}`,
    `Distinct document types (>= ${MIN_COUNT} schemes): ${filtered.length} of ${sorted.length} total`,
    '',
    'Count  Document',
    '─'.repeat(70),
    ...filtered.map(({ name, count }) => `${String(count).padStart(5)}  ${name}`),
  ];

  const output = lines.join('\n');
  console.log('\n' + output);

  // Save to file
  const outPath = path.join(__dirname, 'documents_list.txt');
  fs.writeFileSync(outPath, output + '\n', 'utf8');
  console.log(`\n✅ Saved to ${outPath}`);

  mongoose.disconnect();
});

