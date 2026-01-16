// ----- State -----
let targetNumber = Math.floor(Math.random() * 100) + 1;
let attemptCount = 0;
const maxAttempts = 10;

// ----- DOM Elements -----
const guessInput = document.getElementById("guessInput");
const submitGuess = document.getElementById("submitGuess");
const feedback = document.getElementById("feedback");
const attemptsEl = document.getElementById("attempts");
const restartBtn = document.getElementById("restartBtn");

// ----- Functions -----
function checkGuess() {
  const guess = Number(guessInput.value);
  attemptCount++;

  if (isNaN(guess) || guess < 1 || guess > 100) {
    feedback.textContent = "Please enter a number between 1 and 100.";
    attemptCount--; // don't count invalid input
    return;
  }

  if (guess === targetNumber) {
    feedback.textContent = `🎉 Correct! The number was ${targetNumber}.`;
    endGame();
  } else if (guess < targetNumber) {
    feedback.textContent = "📈 Too low!";
  } else {
    feedback.textContent = "📉 Too high!";
  }

  attemptsEl.textContent = `Attempts: ${attemptCount}/${maxAttempts}`;

  if (attemptCount >= maxAttempts && guess !== targetNumber) {
    feedback.textContent = `💥 Game over! The number was ${targetNumber}.`;
    endGame();
  }
}

function endGame() {
  guessInput.disabled = true;
  submitGuess.disabled = true;
  restartBtn.classList.remove("hidden");
}

function restartGame() {
  targetNumber = Math.floor(Math.random() * 100) + 1;
  attemptCount = 0;
  guessInput.disabled = false;
  submitGuess.disabled = false;
  guessInput.value = "";
  feedback.textContent = "";
  attemptsEl.textContent = "";
  restartBtn.classList.add("hidden");
}

// ----- Event Listeners -----
submitGuess.addEventListener("click", checkGuess);
restartBtn.addEventListener("click", restartGame);
guessInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkGuess();
});
