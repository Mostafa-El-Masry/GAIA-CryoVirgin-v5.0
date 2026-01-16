const tempInput = document.getElementById("tempInput");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const resultEl = document.getElementById("result");

/**
 * Convert temperature between units
 */
function convertTemperature(value, from, to) {
  let celsius;

  // Step 1: convert everything to Celsius
  if (from === "c") {
    celsius = value;
  } else if (from === "f") {
    celsius = (value - 32) * (5 / 9);
  } else if (from === "k") {
    celsius = value - 273.15;
  }

  // Step 2: convert from Celsius to target
  if (to === "c") {
    return celsius;
  } else if (to === "f") {
    return celsius * (9 / 5) + 32;
  } else if (to === "k") {
    return celsius + 273.15;
  }
}

/**
 * Update result whenever input changes
 */
function updateResult() {
  const rawValue = tempInput.value;

  if (rawValue === "") {
    resultEl.textContent = "—";
    return;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    resultEl.textContent = "Invalid input";
    return;
  }

  const converted = convertTemperature(value, fromUnit.value, toUnit.value);

  resultEl.textContent = converted.toFixed(2);
}

// Events
tempInput.addEventListener("input", updateResult);
fromUnit.addEventListener("change", updateResult);
toUnit.addEventListener("change", updateResult);
