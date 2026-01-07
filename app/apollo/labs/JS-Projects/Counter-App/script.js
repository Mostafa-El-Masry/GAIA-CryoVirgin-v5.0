(function () {
  // Encapsulate everything to avoid global pollution
  const STORAGE_KEY = "jsproj.counter.v1";

  // Default state
  const defaultState = {
    value: 0,
    step: 1,
    min: null,
    max: null,
    history: [],
    historyLimit: 50,
  };

  // Elements
  const displayEl = document.getElementById("display");
  const feedbackEl = document.getElementById("feedback");
  const limitsText = document.getElementById("limitsText");

  const incBtn = document.getElementById("increment");
  const decBtn = document.getElementById("decrement");
  const resetBtn = document.getElementById("reset");

  const stepInput = document.getElementById("stepInput");
  const minInput = document.getElementById("minInput");
  const maxInput = document.getElementById("maxInput");
  const historyLimitInput = document.getElementById("historyLimit");

  const historyList = document.getElementById("historyList");
  const historyCount = document.getElementById("historyCount");
  const clearHistoryBtn = document.getElementById("clearHistory");
  const exportHistoryBtn = document.getElementById("exportHistory");

  // Load state
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      // merge with defaults to avoid missing keys
      return Object.assign({}, defaultState, parsed);
    } catch (e) {
      console.error("Failed to load state", e);
      return { ...defaultState };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save state", e);
    }
  }

  // State & update pipeline
  let state = loadState();

  function clampValue(v) {
    if (typeof state.min === "number" && v < state.min) return state.min;
    if (typeof state.max === "number" && v > state.max) return state.max;
    return v;
  }

  function pushHistory(action, prev, next) {
    const entry = { ts: Date.now(), action, prev, next };
    state.history.unshift(entry);
    // Enforce history limit
    const limit = Number(state.historyLimit) || 50;
    if (state.history.length > limit) state.history.length = limit;
  }

  function setState(mutator) {
    // Use a functional update to avoid accidental direct mutation
    const next = JSON.parse(JSON.stringify(state));
    mutator(next);
    // Validate integrity
    // Ensure min/max numeric or null
    next.min =
      next.min === "" || next.min === null
        ? null
        : isNaN(Number(next.min))
        ? null
        : Number(next.min);
    next.max =
      next.max === "" || next.max === null
        ? null
        : isNaN(Number(next.max))
        ? null
        : Number(next.max);
    next.step = isNaN(Number(next.step)) ? 1 : Number(next.step);
    next.historyLimit = isNaN(Number(next.historyLimit))
      ? 50
      : Math.max(0, Number(next.historyLimit));

    // If min > max fix by swapping
    if (next.min !== null && next.max !== null && next.min > next.max) {
      // keep consistent: swap and inform
      const tmp = next.min;
      next.min = next.max;
      next.max = tmp;
      feedback("Min was greater than max — swapped to keep valid");
    }

    state = next;
    saveState(state);
    render();
  }

  // UI render
  function render() {
    displayEl.textContent = String(state.value);

    // Update inputs (avoid clobbering user's focus)
    if (document.activeElement !== stepInput)
      stepInput.value = String(state.step);
    if (document.activeElement !== minInput)
      minInput.value = state.min === null ? "" : String(state.min);
    if (document.activeElement !== maxInput)
      maxInput.value = state.max === null ? "" : String(state.max);
    if (document.activeElement !== historyLimitInput)
      historyLimitInput.value = String(state.historyLimit);

    // Limits display
    if (state.min !== null || state.max !== null) {
      const minText = state.min === null ? "—" : state.min;
      const maxText = state.max === null ? "—" : state.max;
      limitsText.textContent = `Min: ${minText} · Max: ${maxText}`;
    } else {
      limitsText.textContent = "No limits";
    }

    // Buttons disabled logic
    decBtn.disabled =
      typeof state.min === "number" && state.value - state.step < state.min;
    incBtn.disabled =
      typeof state.max === "number" && state.value + state.step > state.max;

    // Update history
    historyList.innerHTML = "";
    state.history.forEach((h, idx) => {
      const li = document.createElement("li");
      li.className = "px-2 py-1 rounded bg-slate-800";
      const d = new Date(h.ts).toLocaleTimeString();
      li.textContent = `[${d}] ${h.action} ${h.prev} → ${h.next}`;
      historyList.appendChild(li);
    });
    historyCount.textContent = String(state.history.length);
  }

  // Feedback helper
  let feedbackTimer = null;
  function feedback(msg, ms = 3000) {
    feedbackEl.textContent = msg;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedbackEl.textContent = "";
      feedbackTimer = null;
    }, ms);
  }

  // Actions
  function doIncrement() {
    const prev = state.value;
    let next = prev + state.step;
    // Validate
    if (typeof state.max === "number" && next > state.max) {
      next = state.max;
      feedback("Maximum reached");
    }
    if (next === prev) {
      // nothing changed
      return;
    }
    setState((s) => {
      s.value = next;
      pushHistory("increment", prev, next);
    });
  }

  function doDecrement() {
    const prev = state.value;
    let next = prev - state.step;
    if (typeof state.min === "number" && next < state.min) {
      next = state.min;
      feedback("Minimum reached");
    }
    if (next === prev) return;
    setState((s) => {
      s.value = next;
      pushHistory("decrement", prev, next);
    });
  }

  function doReset() {
    const prev = state.value;
    const next = 0;
    setState((s) => {
      s.value = next;
      pushHistory("reset", prev, next);
    });
  }

  // Event handlers and validation
  incBtn.addEventListener("click", () => {
    doIncrement();
  });
  decBtn.addEventListener("click", () => {
    doDecrement();
  });
  resetBtn.addEventListener("click", () => {
    doReset();
  });

  stepInput.addEventListener("change", (e) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v) || v === 0) {
      feedback("Invalid step. Step must be a non-zero number.");
      // restore
      render();
      return;
    }
    if (v < 0) {
      feedback("Negative step not allowed. Using absolute value.");
    }
    setState((s) => {
      s.step = Math.abs(v);
    });
  });

  historyLimitInput.addEventListener("change", (e) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v) || v < 0) {
      feedback("Invalid history limit");
      render();
      return;
    }
    setState((s) => {
      s.historyLimit = Math.floor(v);
      if (s.history.length > s.historyLimit) s.history.length = s.historyLimit;
    });
  });

  minInput.addEventListener("change", (e) => {
    const raw = e.target.value.trim();
    if (raw === "") {
      setState((s) => {
        s.min = null;
      });
      return;
    }
    const v = Number(raw);
    if (!Number.isFinite(v)) {
      feedback("Invalid min value");
      render();
      return;
    }
    setState((s) => {
      s.min = v;
    });
  });

  maxInput.addEventListener("change", (e) => {
    const raw = e.target.value.trim();
    if (raw === "") {
      setState((s) => {
        s.max = null;
      });
      return;
    }
    const v = Number(raw);
    if (!Number.isFinite(v)) {
      feedback("Invalid max value");
      render();
      return;
    }
    setState((s) => {
      s.max = v;
    });
  });

  // Clear & export history
  clearHistoryBtn.addEventListener("click", () => {
    setState((s) => {
      s.history = [];
    });
  });

  exportHistoryBtn.addEventListener("click", () => {
    const data = JSON.stringify(state.history, null, 2);
    const w = window.open("about:blank", "_blank");
    if (w) {
      w.document.write("<pre>" + escapeHtml(data) + "</pre>");
    }
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      doIncrement();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      doDecrement();
    }
    if (e.key === "0" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      doReset();
    }
  });

  // Storage watcher
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      state = loadState();
      render();
    }
  });

  // Initialize default state values if missing
  if (state.history === undefined) state.history = [];
  if (state.historyLimit === undefined) state.historyLimit = 50;

  // Ensure state values are numbers when present
  state.step = isNaN(Number(state.step)) ? 1 : Math.abs(Number(state.step));
  state.min =
    state.min === null || state.min === undefined ? null : Number(state.min);
  state.max =
    state.max === null || state.max === undefined ? null : Number(state.max);

  // Initial render
  render();
})();
