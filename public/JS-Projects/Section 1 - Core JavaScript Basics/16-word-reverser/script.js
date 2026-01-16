// ----- DOM Elements -----
const inputText = document.getElementById("inputText");
const reversedText = document.getElementById("reversedText");

// ----- Functions -----
function reverseString(str) {
  return str.split("").reverse().join("");
}

// ----- Event Listeners -----
inputText.addEventListener("input", () => {
  reversedText.textContent = reverseString(inputText.value);
});
