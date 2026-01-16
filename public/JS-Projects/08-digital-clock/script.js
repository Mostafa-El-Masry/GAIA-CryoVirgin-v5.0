// ----- State -----
const state = {
  is24Hour: true,
};

// ----- DOM Elements -----
const clockDisplay = document.getElementById("clockDisplay");
const toggleFormatBtn = document.getElementById("toggleFormatBtn");

// ----- Functions -----
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let period = "";

  if (!state.is24Hour) {
    period = hours >= 12 ? " PM" : " AM";
    hours = hours % 12 || 12;
  }

  const formattedTime =
    [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":") + period;

  clockDisplay.textContent = formattedTime;
}

function toggleFormat() {
  state.is24Hour = !state.is24Hour;
  toggleFormatBtn.textContent = state.is24Hour
    ? "Toggle 12 Hour"
    : "Toggle 24 Hour";
}

// ----- Event Listeners -----
toggleFormatBtn.addEventListener("click", toggleFormat);

// ----- Initialize -----
updateClock();
setInterval(updateClock, 1000);
