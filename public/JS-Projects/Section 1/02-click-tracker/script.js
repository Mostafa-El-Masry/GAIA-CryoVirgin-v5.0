const buttons = document.querySelectorAll(".tracker-btn");
const totalEl = document.getElementById("total");
const resetBtn = document.getElementById("reset");

const counts = {
  A: 0,
  B: 0,
  C: 0,
};

let totalClicks = 0;

function render() {
  totalEl.textContent = totalClicks;

  Object.keys(counts).forEach((key) => {
    const el = document.getElementById(`count-${key}`);
    el.textContent = counts[key];
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = e.currentTarget.dataset.key;

    counts[key]++;
    totalClicks++;

    render();
  });
});

resetBtn.addEventListener("click", () => {
  Object.keys(counts).forEach((key) => {
    counts[key] = 0;
  });

  totalClicks = 0;
  render();
});

render();
