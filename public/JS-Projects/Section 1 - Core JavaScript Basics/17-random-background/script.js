// ----- DOM Elements -----
const changeColorBtn = document.getElementById("changeColorBtn");
const currentColor = document.getElementById("currentColor");

// ----- Array of colors -----
const colors = [
  "#f87171", // red
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#a78bfa", // purple
  "#f472b6", // pink
  "#facc15", // amber
];

// ----- Functions -----
function getRandomColor() {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

function changeBackground() {
  const color = getRandomColor();
  document.body.style.backgroundColor = color;
  currentColor.textContent = color;
}

// ----- Event Listener -----
changeColorBtn.addEventListener("click", changeBackground);
