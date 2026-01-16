// ----- DOM Elements -----
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const increaseBtn = document.getElementById("increaseBtn");
const decreaseBtn = document.getElementById("decreaseBtn");

// ----- State -----
let progress = 0;

// ----- Functions -----
function updateProgressUI() {
  progress = Math.min(Math.max(progress, 0), 100);
  progressFill.style.width = progress + "%";
  progressText.textContent = progress + "%";
}

function increaseProgress() {
  progress += 10;
  updateProgressUI();
}

function decreaseProgress() {
  progress -= 10;
  updateProgressUI();
}

// ----- Event Listeners -----
increaseBtn.addEventListener("click", increaseProgress);
decreaseBtn.addEventListener("click", decreaseProgress);

// ----- Initialize -----
updateProgressUI();
