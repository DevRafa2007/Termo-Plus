const fs = require('fs');
const path = require('path');

const lexiconPath = path.resolve(__dirname, '..', 'lexico.txt');
const outDir = path.resolve(__dirname, '..', 'public');
const outPath = path.join(outDir, 'common-words.txt');

function removeAcentos(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z]/g, '');
}

try {
  const text = fs.readFileSync(lexiconPath, 'utf8');
  const words = text.split(/\r?\n/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === 5)
    .map(w => removeAcentos(w))
    .filter(w => /^[a-z]{5}$/.test(w));

  const unique = Array.from(new Set(words)).sort();

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, unique.join('\n') + '\n', 'utf8');

  console.log(`Generated ${unique.length} common 5-letter words at ${outPath}`);
} catch (err) {
  console.error('Failed to generate common words:', err);
  process.exit(1);
}
