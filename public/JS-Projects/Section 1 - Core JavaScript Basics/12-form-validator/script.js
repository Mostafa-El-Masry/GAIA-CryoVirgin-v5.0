// ----- DOM Elements -----
const form = document.getElementById("registrationForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const successMsg = document.getElementById("successMsg");

// ----- Validation Regex -----
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; // min 6 chars, letters + numbers

// ----- Functions -----
function validateName() {
  if (nameInput.value.trim() === "") {
    nameError.textContent = "Name is required.";
    nameError.classList.remove("hidden");
    return false;
  }
  nameError.classList.add("hidden");
  return true;
}

function validateEmail() {
  if (!emailRegex.test(emailInput.value.trim())) {
    emailError.textContent = "Invalid email format.";
    emailError.classList.remove("hidden");
    return false;
  }
  emailError.classList.add("hidden");
  return true;
}

function validatePassword() {
  if (!passwordRegex.test(passwordInput.value)) {
    passwordError.textContent =
      "Password must be 6+ chars, include letters & numbers.";
    passwordError.classList.remove("hidden");
    return false;
  }
  passwordError.classList.add("hidden");
  return true;
}

function validateForm() {
  const nameValid = validateName();
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  return nameValid && emailValid && passwordValid;
}

// ----- Event Listeners -----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  successMsg.classList.add("hidden");

  if (validateForm()) {
    successMsg.textContent = `Welcome, ${nameInput.value.trim()}! Registration successful.`;
    successMsg.classList.remove("hidden");
    form.reset();
  }
});

// Optional: real-time validation
[nameInput, emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", validateForm);
});
