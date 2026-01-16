// ----- State -----
let isDarkMode = false;

// ----- DOM Elements -----
const toggleBtn = document.getElementById("toggleModeBtn");
const modeText = document.getElementById("modeText");
const body = document.body;

// ----- Functions -----
function updateMode() {
  if (isDarkMode) {
    body.classList.add("bg-gray-900", "text-gray-100");
    body.classList.remove("bg-white", "text-gray-900");
    modeText.textContent = "Current mode: Dark";
  } else {
    body.classList.add("bg-white", "text-gray-900");
    body.classList.remove("bg-gray-900", "text-gray-100");
    modeText.textContent = "Current mode: Light";
  }
}

function toggleMode() {
  isDarkMode = !isDarkMode;
  updateMode();
}

// ----- Event Listeners -----
toggleBtn.addEventListener("click", toggleMode);

// ----- Initialize -----
updateMode();
