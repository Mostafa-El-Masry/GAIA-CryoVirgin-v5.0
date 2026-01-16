const body = document.body;
const colorBox = document.getElementById("colorBox");
const randomBtn = document.getElementById("randomBtn");
const resetBtn = document.getElementById("resetBtn");

const DEFAULT_COLOR = "#ffffff";

/**
 * Generate a random hex color
 */
function generateRandomColor() {
  const hex = Math.floor(Math.random() * 16777215).toString(16);
  return `#${hex.padStart(6, "0")}`;
}

/**
 * Determine if text should be light or dark
 * based on background brightness
 */
function getTextColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#000000" : "#ffffff";
}

/**
 * Apply color to UI
 */
function applyColor(color) {
  body.style.backgroundColor = color;
  colorBox.style.backgroundColor = color;
  colorBox.style.color = getTextColor(color);
  colorBox.textContent = color;
}

randomBtn.addEventListener("click", () => {
  const newColor = generateRandomColor();
  applyColor(newColor);
});

resetBtn.addEventListener("click", () => {
  applyColor(DEFAULT_COLOR);
});

applyColor(DEFAULT_COLOR);
