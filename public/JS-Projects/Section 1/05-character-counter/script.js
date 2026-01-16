const textInput = document.getElementById("textInput");

const charCountEl = document.getElementById("charCount");
const charNoSpaceCountEl = document.getElementById("charNoSpaceCount");
const wordCountEl = document.getElementById("wordCount");
const lineCountEl = document.getElementById("lineCount");
const readingTimeEl = document.getElementById("readingTime");

/**
 * Analyze text and return stats
 */
function analyzeText(text) {
  const characters = text.length;

  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const lines = text === "" ? 0 : text.split("\n").length;

  // Average reading speed ≈ 200 words/min
  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    readingTimeMinutes,
  };
}

/**
 * Update UI with analysis
 */
function updateStats() {
  const text = textInput.value;
  const stats = analyzeText(text);

  charCountEl.textContent = stats.characters;
  charNoSpaceCountEl.textContent = stats.charactersNoSpaces;
  wordCountEl.textContent = stats.words;
  lineCountEl.textContent = stats.lines;
  readingTimeEl.textContent = `Reading time: ${stats.readingTimeMinutes} min`;
}

// React to typing
textInput.addEventListener("input", updateStats);

// Initial state
updateStats();
