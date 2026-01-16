// ----- State -----
const state = {
  currentCode: "",
  history: [],
  historyLimit: 50,
  charset: {
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
  },
  length: 8,
};

// ----- DOM Elements -----
const currentCodeEl = document.getElementById("currentCode");
const historyListEl = document.getElementById("historyList");
const codeLengthInput = document.getElementById("codeLength");

const includeUpper = document.getElementById("includeUpper");
const includeLower = document.getElementById("includeLower");
const includeNumbers = document.getElementById("includeNumbers");
const includeSymbols = document.getElementById("includeSymbols");

const generateBtn = document.getElementById("generateBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ----- Character sets -----
const CHAR_SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?",
};

// ----- Functions -----

function getActiveCharset() {
  let chars = "";
  for (const key in state.charset) {
    if (state.charset[key]) {
      chars += CHAR_SETS[key];
    }
  }
  return chars;
}

function generateCode() {
  const charset = getActiveCharset();
  if (!charset) {
    alert("Please select at least one character set!");
    return "";
  }

  let code = "";
  for (let i = 0; i < state.length; i++) {
    const index = Math.floor(Math.random() * charset.length);
    code += charset[index];
  }
  return code;
}

function updateState(newCode) {
  state.currentCode = newCode;

  // Update history
  if (newCode) {
    state.history.unshift(newCode);
    if (state.history.length > state.historyLimit) {
      state.history.length = state.historyLimit;
    }
  }

  render();
}

function render() {
  // Current code
  currentCodeEl.textContent = state.currentCode || "—";

  // History
  historyListEl.innerHTML = "";
  state.history.forEach((code) => {
    const li = document.createElement("li");
    li.textContent = code;
    historyListEl.appendChild(li);
  });
}

// ----- Event Handlers -----
generateBtn.addEventListener("click", () => {
  const code = generateCode();
  if (code) updateState(code);
});

// Clear history
clearHistoryBtn.addEventListener("click", () => {
  state.history = [];
  render();
});

// Inputs
codeLengthInput.addEventListener("input", (e) => {
  const val = Number(e.target.value);
  if (val < 1) {
    state.length = 1;
  } else {
    state.length = val;
  }
});

includeUpper.addEventListener("change", (e) => {
  state.charset.upper = e.target.checked;
});
includeLower.addEventListener("change", (e) => {
  state.charset.lower = e.target.checked;
});
includeNumbers.addEventListener("change", (e) => {
  state.charset.numbers = e.target.checked;
});
includeSymbols.addEventListener("change", (e) => {
  state.charset.symbols = e.target.checked;
});

// ----- Initial render -----
render();
