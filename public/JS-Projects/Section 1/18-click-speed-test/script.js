// ----- DOM Elements -----
const clickBtn = document.getElementById("clickBtn");
const restartBtn = document.getElementById("restartBtn");
const timeLeftEl = document.getElementById("timeLeft");
const clickCountEl = document.getElementById("clickCount");

// ----- State -----
let clicks = 0;
let timeLeft = 10; // seconds
let timer = null;

// ----- Functions -----
function startTest() {
  clicks = 0;
  timeLeft = 10;
  clickCountEl.textContent = clicks;
  timeLeftEl.textContent = timeLeft;
  clickBtn.disabled = false;
  restartBtn.classList.add("hidden");

  timer = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endTest();
    }
  }, 1000);
}

function endTest() {
  clearInterval(timer);
  clickBtn.disabled = true;
  restartBtn.classList.remove("hidden");
  alert(
    `Time's up! You clicked ${clicks} times. CPS: ${(clicks / 10).toFixed(2)}`
  );
}

function handleClick() {
  clicks++;
  clickCountEl.textContent = clicks;
}

// ----- Event Listeners -----
clickBtn.addEventListener("click", handleClick);
restartBtn.addEventListener("click", startTest);

// ----- Initialize -----
startTest();
