// ----- DOM Elements -----
const passwordInput = document.getElementById("passwordInput");
const strengthText = document.getElementById("strengthText");
const strengthBar = document.getElementById("strengthBar");

// ----- Functions -----
function checkStrength(password) {
  let score = 0;

  if (password.length >= 6) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score; // 0 - 5
}

function updateStrengthUI(password) {
  const score = checkStrength(password);

  let color = "red";
  let width = (score / 5) * 100 + "%";
  let text = "Very Weak";

  switch (score) {
    case 0:
    case 1:
      color = "red";
      text = "Very Weak";
      break;
    case 2:
      color = "orange";
      text = "Weak";
      break;
    case 3:
      color = "yellow";
      text = "Medium";
      break;
    case 4:
      color = "blue";
      text = "Strong";
      break;
    case 5:
      color = "green";
      text = "Very Strong";
      break;
  }

  strengthBar.style.width = width;
  strengthBar.className = `h-3 w-[${width}] rounded bg-${color}-500 transition-all`;
  strengthText.textContent = `Strength: ${text}`;
}

// ----- Event Listeners -----
passwordInput.addEventListener("input", (e) => {
  updateStrengthUI(e.target.value);
});
