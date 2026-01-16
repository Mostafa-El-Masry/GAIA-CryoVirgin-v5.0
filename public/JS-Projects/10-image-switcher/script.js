// ----- State -----
const images = [
  "https://picsum.photos/id/1015/400/300",
  "https://picsum.photos/id/1016/400/300",
  "https://picsum.photos/id/1018/400/300",
];
let currentIndex = 0;

// ----- DOM Elements -----
const mainImage = document.getElementById("mainImage");
const thumbButtons = document.querySelectorAll(".thumbBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ----- Functions -----
function updateImage(index) {
  currentIndex = index;
  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;
  mainImage.src = images[currentIndex];
}

// ----- Event Listeners -----
// Thumbnail clicks
thumbButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    updateImage(idx);
  });
});

// Prev / Next buttons
prevBtn.addEventListener("click", () => {
  updateImage(currentIndex - 1);
});
nextBtn.addEventListener("click", () => {
  updateImage(currentIndex + 1);
});
