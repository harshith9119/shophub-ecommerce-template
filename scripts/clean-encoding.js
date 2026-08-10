const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = ['.js', '.jsx', '.ts', '.tsx', '.md', '.sql', '.json'];

// Targeted safe replacements for common mojibake sequences
const replacements = [
  [/•/g, '•'],
  [/→/g, '→'],
  [/---+/g, '---'],
  [/—|—/g, '—'],
  [/₹/g, '₹'],
  [/\u00A0/g, ' '],
  [/\u00A0/g, ' '],
  [//g, ''],
];

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      // skip node_modules and .git
      if (file === 'node_modules' || file === '.git') return;
      results.push(...walk(full));
    } else {
      if (exts.includes(path.extname(file))) results.push(full);
    }
  });
  return results;
}

const files = walk(root);
let updated = [];
for (const f of files) {
  try {
    let text = fs.readFileSync(f, 'utf8');
    let orig = text;
    for (const [pat, repl] of replacements) {
      text = text.replace(pat, repl);
    }
    if (text !== orig) {
      fs.writeFileSync(f, text, 'utf8');
      console.log('Updated:', f);
      updated.push(f);
    }
  } catch (e) {
    console.error('Error processing', f, e.message);
  }
}
console.log('Total updated files:', updated.length);
process.exit(0);

