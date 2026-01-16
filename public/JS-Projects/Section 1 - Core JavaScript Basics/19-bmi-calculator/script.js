// ----- DOM Elements -----
const weightInput = document.getElementById("weightInput");
const heightInput = document.getElementById("heightInput");
const calculateBtn = document.getElementById("calculateBtn");
const bmiResult = document.getElementById("bmiResult");
const bmiCategory = document.getElementById("bmiCategory");

// ----- Functions -----
function calculateBMI() {
  const weight = parseFloat(weightInput.value);
  const heightCm = parseFloat(heightInput.value);

  if (isNaN(weight) || isNaN(heightCm) || weight <= 0 || heightCm <= 0) {
    bmiResult.textContent = "0";
    bmiCategory.textContent = "Invalid input";
    return;
  }

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  bmiResult.textContent = bmi.toFixed(1);

  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  bmiCategory.textContent = category;
}

// ----- Event Listeners -----
calculateBtn.addEventListener("click", calculateBMI);
