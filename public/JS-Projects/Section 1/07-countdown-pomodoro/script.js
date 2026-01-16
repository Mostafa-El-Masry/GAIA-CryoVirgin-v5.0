// ----- State -----
const state = {
  workDuration: 25, // minutes
  breakDuration: 5, // minutes
  sessionsBeforeLong: 4,
  currentSession: 0,
  currentPhase: "Work", // Work, Break, LongBreak
  remainingTime: 25 * 60, // seconds
  timerId: null,
};

// ----- DOM Elements -----
const timerDisplay = document.getElementById("timerDisplay");
const currentSessionEl = document.getElementById("currentSession");
const currentPhaseEl = document.getElementById("currentPhase");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const workDurationInput = document.getElementById("workDuration");
const breakDurationInput = document.getElementById("breakDuration");
const sessionsBeforeLongInput = document.getElementById("sessionsBeforeLong");

// ----- Functions -----
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function render() {
  timerDisplay.textContent = formatTime(state.remainingTime);
  currentSessionEl.textContent = state.currentSession;
  currentPhaseEl.textContent = state.currentPhase;
}

function startTimer() {
  if (state.timerId) return; // already running
  state.timerId = setInterval(() => {
    state.remainingTime--;
    if (state.remainingTime <= 0) {
      nextPhase();
    }
    render();
  }, 1000);
}

function pauseTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function resetTimer() {
  pauseTimer();
  state.currentPhase = "Work";
  state.currentSession = 0;
  state.remainingTime = state.workDuration * 60;
  render();
}

function nextPhase() {
  pauseTimer();
  if (state.currentPhase === "Work") {
    state.currentSession++;
    if (state.currentSession % state.sessionsBeforeLong === 0) {
      state.currentPhase = "LongBreak";
      state.remainingTime = state.breakDuration * 60 * 2; // optional: long break = 2x break
    } else {
      state.currentPhase = "Break";
      state.remainingTime = state.breakDuration * 60;
    }
  } else {
    state.currentPhase = "Work";
    state.remainingTime = state.workDuration * 60;
  }
  startTimer();
}

// ----- Event Handlers -----
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

workDurationInput.addEventListener("input", (e) => {
  const val = Math.max(1, Number(e.target.value));
  state.workDuration = val;
  if (state.currentPhase === "Work") state.remainingTime = val * 60;
  render();
});

breakDurationInput.addEventListener("input", (e) => {
  const val = Math.max(1, Number(e.target.value));
  state.breakDuration = val;
  if (state.currentPhase === "Break" || state.currentPhase === "LongBreak") {
    state.remainingTime = val * 60;
  }
  render();
});

sessionsBeforeLongInput.addEventListener("input", (e) => {
  const val = Math.max(1, Number(e.target.value));
  state.sessionsBeforeLong = val;
});

// ----- Initial Render -----
render();
