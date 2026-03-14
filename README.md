# calligraphic-tables

A static Progressive Web App (PWA) that generates handwriting practice tables
based on user input. Enter characters in the textarea, get a printable table with
Unicode labels, sample characters, and blank rows for handwriting practice.

**Live demo:** <https://nircek.github.io/calligraphic-tables/>

## Usage

1. Print it
2. Scan the blank
3. Write on it
4. Scan again

## Original Prompt

Create a complete repository for a static Progressive Web App (PWA) using only HTML, Vanilla JavaScript, and pure CSS (no frameworks). The app generates handwriting practice tables based on user input, specifically optimized for printing and scanning. Implement the following files and requirements:

1. `index.html`
   - Add a header that contains instructions: "1. print it, 2. scan the blank, 3. write on it, 4. scan again".
   - Add an expandable `<textarea>` at the top of the page.
   - Set the default value of the textarea to:
0123456789
abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ
.,:;!?¿¡"'«»„"()[]{}/\|
#%‰&@*^_`°~•…¶
αβγδεζηθικλμνξοπρστυφχψω
ąćłżäßéàâçñíčďůșāøþœŋ
ΓΔΘΛΞΠΣΥΦΨΩϵϑϰϱςϕ
+-±×÷=≠<>≤≈≟≝
∀∃∄¬∧∨∅⊂⋃ℵℶℸ∴
∎∞∂∇∮∢⊕○⬡
ℕℤℚℝℂ𝔻⭠↦⇒⇔⇌
♪♫♭♮♯𝄪𝄞𝄡𝄢
¤$€£¥₹₽₩₿
№†‡✓☒
⚠︎☢︎☣︎
☉☾☿♀🜨♂♃♄⛢♆♇
♈︎♉︎♊︎♋︎♌︎♍︎♎︎♏︎♐︎♑︎♒︎♓︎
☆♡♢♤♧
ʃʒðɪæʌəʊɔɑː
бвгджзиклмнпфцчшщъыьэюя
БГДЖЗИЛПФЦЧШЩЪЫЬЭЮЯ
ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚻᚾᛁᛃᛇᛈᛉᛊᛋᛏᛒᛖᛗᛚᛜᛞᛟ
   - Below the textarea, add an empty container (e.g., `<div id="tables-container"></div>`) where the tables will be rendered.
   - Link the `style.css`, `script.js`, and the PWA manifest.

2. `script.js`
   - Listen for the `input` event on the textarea.
   - Split the text from the textarea into lines by the newline character (`\n`). Each non-empty line should generate a separate HTML table.
   - Skip any cluster where the base character is a Control (Cc), Format (Cf), Private Use (Co), Unassigned (Cn), or lone Surrogate (Cs).
   - Convert valid surrogate pairs into single characters. Remove all combining marks (Mn, Mc, Me).
   - Print only the Unicode hex code (U+XXXX) of the base character and filter out Variation Selectors, stripped marks, or filtered characters.
   - The structure of each table must be:
     * Exactly 4 rows (`<tr>`).
     * The number of columns (`<td>`) must equal the number of characters in that specific line.
     * First row: Each cell must contain the Unicode hex value (e.g., U+0041) corresponding to the character directly below it. 
     * Second row: Each cell contains one sequential character from the text line.
     * Third and fourth rows: All cells are empty.
   - Add anchor points with text "Nircek/calligraphic-tables". It should appear below and above each table.
   - The script must clear the container and rebuild the tables on every change. It must also run once on page load to process the default textarea value.
   - Include code to register the Service Worker (`sw.js`).

3. `style.css`
   - Use `border-collapse: collapse` for the tables.
   - Borders: The second, third, and fourth rows must have visible borders (`1px solid black` for table cells). However, the first row (the Unicode row) must have NO visible borders, making the text appear as if it is floating above the grid.
   - Typography for the first row: The font size of the Unicode text must be extremely small so that the entire code fits within the normal width of a single character cell.
   - Anchor points: Make them in grey, small font and justify aligned to the left and right border of table
   - Handwriting paper effect: Apply a background pattern to the empty cells in the third and fourth rows to mimic handwriting practice paper. Do not use hardcoded pixel heights for the overall row. Instead, use multiple `linear-gradient` layers to draw a "four-line" structure:
     * A top line (e.g., light blue).
     * A midline (e.g., semi-transparent black).
     * A thicker baseline (e.g., light red).
     * A bottom line (e.g., light blue).
     * Use proportional background positioning (e.g., 0%, 33%, 66%, 100% or similar fractional spacing) and sizing to distribute these four lines evenly across the height of the cell.
   - Add a `@media print` directive that:
     * Completely hides the textarea (`display: none`).
     * The anchor point should only be visible during print.
     * Centers all tables horizontally on the printed page.

4. `manifest.json`
   - Create a basic PWA manifest (name, short_name, display: "standalone", basic background and theme colors). Use inline SVG URI icon with a small zeta symbol.

5. `sw.js` (Service Worker)
   - Implement an install-time caching mechanism that caches the core assets: `/`, `/index.html`, `/style.css`, `/script.js`, and `/manifest.json`.
   - Add a "Cache First" strategy in the `fetch` event listener to ensure the app works fully offline after the first load.

6. `README.md`
   - Write a short project description.
   - Include a direct link to the GitHub Pages deployment: `https://nircek.github.io/calligraphic-tables/`.
   - Create a section titled "Original Prompt" and paste the exact, full text of this prompt into it.