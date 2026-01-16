// ----- State -----
const state = {
  currentInput: "",
  operator: null,
  operand: null,
  resetNext: false,
};

// ----- DOM Elements -----
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

// ----- Functions -----
function updateDisplay() {
  display.textContent = state.currentInput || "0";
}

function handleInput(value) {
  if (!isNaN(value) || value === ".") {
    if (state.resetNext) {
      state.currentInput = value;
      state.resetNext = false;
    } else {
      state.currentInput += value;
    }
  } else if (["+", "-", "*", "/"].includes(value)) {
    if (state.operand !== null && state.operator) {
      compute();
    } else {
      state.operand = parseFloat(state.currentInput) || 0;
    }
    state.operator = value;
    state.resetNext = true;
  } else if (value === "=") {
    compute();
    state.operator = null;
    state.operand = null;
    state.resetNext = true;
  } else if (value === "C") {
    state.currentInput = "";
    state.operator = null;
    state.operand = null;
    state.resetNext = false;
  }

  updateDisplay();
}

function compute() {
  const current = parseFloat(state.currentInput) || 0;
  let result = state.operand || 0;

  switch (state.operator) {
    case "+":
      result += current;
      break;
    case "-":
      result -= current;
      break;
    case "*":
      result *= current;
      break;
    case "/":
      result = current !== 0 ? result / current : "Error";
      break;
  }

  state.currentInput = String(result);
  state.operand = result;
}

// ----- Event Listeners -----
buttons.forEach((btn) => {
  btn.addEventListener("click", () => handleInput(btn.dataset.value));
});

// ----- Initial Render -----
updateDisplay();
