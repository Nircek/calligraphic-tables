'use strict';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

const textarea = document.getElementById('input');
const container = document.getElementById('tables-container');

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const FILTERED_CATEGORIES = /^[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Cn}]$/u;

function isVariationSelector(cp) {
  return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF);
}

function shouldSkip(cp) {
  if (FILTERED_CATEGORIES.test(String.fromCodePoint(cp))) return true;
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
    let display = String.fromCodePoint(baseCP);
    for (let i = 1; i < codePoints.length; i++) {
      if (isVariationSelector(codePoints[i])) {
        display += String.fromCodePoint(codePoints[i]);
      }
    }
    chars.push({ cp: baseCP, display });
  }
  return chars;
}

function toHex(cp) {
  return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
}

function makeAnchor() {
  const el = document.createElement('div');
  el.className = 'anchor';
  const text = 'Nircek/calligraphic-tables';
  for (const ch of text) {
    const span = document.createElement('span');
    span.textContent = ch;
    el.appendChild(span);
  }
  return el;
}

function buildTables() {
  container.innerHTML = '';
  const lines = textarea.value.split('\n');
  let lastBlock = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const chars = processLine(line);
    if (chars.length === 0) continue;

    const block = document.createElement('div');
    block.className = 'table-block';
    block.appendChild(makeAnchor());

    const table = document.createElement('table');

    const row1 = document.createElement('tr');
    row1.className = 'unicode-row';
    const row2 = document.createElement('tr');
    row2.className = 'char-row';
    const row3 = document.createElement('tr');
    row3.className = 'practice-row';
    const row4 = document.createElement('tr');
    row4.className = 'practice-row';

    for (const char of chars) {
      const td1 = document.createElement('td');
      td1.textContent = toHex(char.cp);
      row1.appendChild(td1);

      const td2 = document.createElement('td');
      td2.textContent = char.display;
      row2.appendChild(td2);

      row3.appendChild(document.createElement('td'));
      row4.appendChild(document.createElement('td'));
    }

    table.appendChild(row1);
    table.appendChild(row2);
    table.appendChild(row3);
    table.appendChild(row4);
    block.appendChild(table);
    container.appendChild(block);
    lastBlock = block;
  }

  if (lastBlock) {
    lastBlock.appendChild(makeAnchor());
  }
}

textarea.addEventListener('input', buildTables);
buildTables();
