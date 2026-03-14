"use strict";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

const textarea = document.getElementById("input");
const container = document.getElementById("tables-container");
const fontSizeDisplay = document.getElementById("font-size");

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const FILTERED_CATEGORIES = /^[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Cn}]$/u;

function isVariationSelector(cp) {
  return (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef);
}

function shouldSkip(cp) {
  if (FILTERED_CATEGORIES.test(String.fromCodePoint(cp))) return true;
  if (isVariationSelector(cp)) return true;
  return false;
}

function processLine(line) {
  const chars = [];
  for (const { segment } of segmenter.segment(line)) {
    const codePoints = [...segment].map((c) => c.codePointAt(0));
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
  return "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
}

function makeAnchor() {
  const el = document.createElement("div");
  el.className = "anchor";
  const text = "Nircek/calligraphic-tables";
  for (const ch of text) {
    const span = document.createElement("span");
    span.textContent = ch;
    el.appendChild(span);
  }
  return el;
}

function processLines(lines) {
  return lines.map(processLine).filter((chars) => chars.length > 0);
}

function groupLinesToWidth(lines, width) {
  lines = lines.map((line, index) => [line, index]);
  lines.sort((a, b) => [b[0].length - a[0].length, a[1] - b[1]]);

  let groups = [];

  for (let [line, index] of lines) {
    let placed = false;
    for (let group of groups) {
      let currentGroupSum = group.reduce(
        (sum, [line, _]) => sum + line.length,
        0,
      );
      if (currentGroupSum + line.length <= width) {
        group.push([line, index]);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([[line, index]]);
    }
  }
  groups.forEach((group) => group.sort((a, b) => a[1] - b[1]));
  groups = groups.map((group) => [
    group.map((item) => item[0]),
    group.map((item) => item[1]).reduce((a, b) => Math.min(a, b), Infinity),
  ]);
  groups.sort((a, b) => a[1] - b[1]);
  return groups.map((group) => group[0]);
}

function matchSizesForGroups(processed_lines) {
  if (processed_lines.length === 0) return [];

  const constraints = [
    { maxGroups: 10, maxWidth: 22, fontSize: 12 },
    { maxGroups: 10, maxWidth: 23, fontSize: 11 },
    { maxGroups: 11, maxWidth: 26, fontSize: 10 },
    { maxGroups: 12, maxWidth: 29, fontSize: 9 },
    { maxGroups: 14, maxWidth: 32, fontSize: 8 },
  ];

  const max_line = Math.max(...processed_lines.map((line) => line.length));
  const max_possible_line = constraints[constraints.length - 1].maxWidth;
  if (max_line > max_possible_line) {
    alert(
      `The longest line has ${max_line} characters, which exceeds the maximum width of ${max_possible_line}. Please split it into multiple lines.`,
    );
    return [];
  }

  const possible_groups = [];
  for (let width = max_line; width <= 32; width++) {
    const groups = groupLinesToWidth(processed_lines, width);
    possible_groups.push({ width, groups });
  }

  let best = null;
  let font_size = 0;

  for (const candidate of possible_groups) {
    const numGroups = candidate.groups.length;
    let candidateFont = 0;

    for (const constraint of constraints) {
      if (
        numGroups <= constraint.maxGroups &&
        candidate.width <= constraint.maxWidth
      ) {
        candidateFont = constraint.fontSize;
        break; // Stop at the first match since the table is sorted by largest font
      }
    }

    if (candidateFont > font_size) {
      best = candidate;
      font_size = candidateFont;
    } else if (candidateFont === font_size && candidateFont !== 0) {
      if (candidate.groups.length < best.groups.length) {
        best = candidate;
      }
    }
  }

  if (!best) {
    alert(
      "Could not fit the text within the allowed maximum groups and width constraints.",
    );
    return [];
  }

  container.style.maxWidth = `calc(2 * ${best.width}em + ${best.width + 2}px)`;
  document.body.style.fontSize = `${font_size}pt`;
  fontSizeDisplay.textContent = `Font size: ${font_size}pt (${best.width} chars in ${best.groups.length} groups)`;

  return best.groups;
}

function buildTables() {
  container.innerHTML = "";
  const processed_lines = processLines(textarea.value.split("\n"));
  const groups = matchSizesForGroups(processed_lines);
  let lastBlock = null;

  for (const lines of groups) {
    const block = document.createElement("div");
    block.className = "table-block";
    block.appendChild(makeAnchor());
    const tablesGroup = document.createElement("div");
    tablesGroup.className = "tables-group";
    for (const chars of lines) {
      const table = document.createElement("table");

      const row1 = document.createElement("tr");
      row1.className = "unicode-row";
      const row2 = document.createElement("tr");
      row2.className = "char-row";
      const row3 = document.createElement("tr");
      row3.className = "practice-row";
      const row4 = document.createElement("tr");
      row4.className = "practice-row";

      for (const char of chars) {
        const td1 = document.createElement("td");
        td1.textContent = toHex(char.cp);
        row1.appendChild(td1);

        const td2 = document.createElement("td");
        td2.textContent = char.display;
        row2.appendChild(td2);

        row3.appendChild(document.createElement("td"));
        row4.appendChild(document.createElement("td"));
      }

      table.appendChild(row1);
      table.appendChild(row2);
      table.appendChild(row3);
      table.appendChild(row4);
      tablesGroup.appendChild(table);
      lastBlock = block;
    }
    block.appendChild(tablesGroup);
    container.appendChild(block);
  }

  if (lastBlock) {
    lastBlock.appendChild(makeAnchor());
  }
}

textarea.addEventListener("input", buildTables);
buildTables();
