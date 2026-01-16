// ----- DOM Elements -----
const billInput = document.getElementById("billInput");
const tipInput = document.getElementById("tipInput");
const peopleInput = document.getElementById("peopleInput");

const tipPerPersonEl = document.getElementById("tipPerPerson");
const totalPerPersonEl = document.getElementById("totalPerPerson");

// ----- Functions -----
function calculateTip() {
  const bill = parseFloat(billInput.value) || 0;
  const tipPercent = parseFloat(tipInput.value) || 0;
  const people = parseInt(peopleInput.value) || 1;

  if (people <= 0) {
    tipPerPersonEl.textContent = "0.00";
    totalPerPersonEl.textContent = "0.00";
    return;
  }

  const tipTotal = (bill * tipPercent) / 100;
  const total = bill + tipTotal;

  const tipPerPerson = tipTotal / people;
  const totalPerPerson = total / people;

  tipPerPersonEl.textContent = tipPerPerson.toFixed(2);
  totalPerPersonEl.textContent = totalPerPerson.toFixed(2);
}

// ----- Event Listeners -----
[billInput, tipInput, peopleInput].forEach((input) => {
  input.addEventListener("input", calculateTip);
});
