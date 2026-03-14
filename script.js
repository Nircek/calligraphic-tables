'use strict';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

const textarea = document.getElementById('input');
const container = document.getElementById('tables-container');

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function isVariationSelector(cp) {
  return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF);
}

function shouldSkip(cp) {
  const ch = String.fromCodePoint(cp);
  if (/^[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Cn}]$/u.test(ch)) return true;
  if (isVariationSelector(cp)) return true;
  return false;
}

function processLine(line) {
  const chars = [];
  for (const { segment } of segmenter.segment(line)) {
    const codePoints = [...segment].map(c => c.codePointAt(0));
    if (codePoints.length === 0) continue;
    const baseCP = codePoints[0];
    if (shouldSkip(baseCP)) continue;
    chars.push(baseCP);
  }
  return chars;
}

function toHex(cp) {
  return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
}

function makeAnchor() {
  const el = document.createElement('div');
  el.className = 'anchor';
  const left = document.createElement('span');
  left.textContent = 'Nircek/calligraphic-tables';
  const right = document.createElement('span');
  right.textContent = 'Nircek/calligraphic-tables';
  el.appendChild(left);
  el.appendChild(right);
  return el;
}

function buildTables() {
  container.innerHTML = '';
  const lines = textarea.value.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const chars = processLine(line);
    if (chars.length === 0) continue;

    container.appendChild(makeAnchor());

    const table = document.createElement('table');

    const row1 = document.createElement('tr');
    row1.className = 'unicode-row';
    const row2 = document.createElement('tr');
    row2.className = 'char-row';
    const row3 = document.createElement('tr');
    row3.className = 'practice-row';
    const row4 = document.createElement('tr');
    row4.className = 'practice-row';

    for (const cp of chars) {
      const td1 = document.createElement('td');
      td1.textContent = toHex(cp);
      row1.appendChild(td1);

      const td2 = document.createElement('td');
      td2.textContent = String.fromCodePoint(cp);
      row2.appendChild(td2);

      row3.appendChild(document.createElement('td'));
      row4.appendChild(document.createElement('td'));
    }

    table.appendChild(row1);
    table.appendChild(row2);
    table.appendChild(row3);
    table.appendChild(row4);
    container.appendChild(table);

    container.appendChild(makeAnchor());
  }
}

textarea.addEventListener('input', buildTables);
buildTables();
