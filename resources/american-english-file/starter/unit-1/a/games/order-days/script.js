/* Order the Days – put weekdays in correct order */
(function () {
  const DAYS = [
    { id: "monday", label: "Monday", emoji: "📘" },
    { id: "tuesday", label: "Tuesday", emoji: "📗" },
    { id: "wednesday", label: "Wednesday", emoji: "📙" },
    { id: "thursday", label: "Thursday", emoji: "📕" },
    { id: "friday", label: "Friday", emoji: "🎉" },
    { id: "saturday", label: "Saturday", emoji: "🎮" },
    { id: "sunday", label: "Sunday", emoji: "☀️" },
  ];

  const CORRECT = DAYS.map((d) => d.id);
  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let order = [];
  let locked = false;
  let dragIndex = null;
  let selectedIndex = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startGame() {
    order = shuffle(DAYS.map((d) => d.id));
    // Avoid already-correct shuffle
    let tries = 0;
    while (isCorrect() && tries < 10) {
      order = shuffle(DAYS.map((d) => d.id));
      tries++;
    }
    locked = false;
    selectedIndex = null;
    dragIndex = null;
    mode = "play";
    render();
  }

  function isCorrect() {
    return order.every((id, i) => id === CORRECT[i]);
  }

  function dayById(id) {
    return DAYS.find((d) => d.id === id);
  }

  function move(from, to) {
    if (locked || from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return;
    const item = order.splice(from, 1)[0];
    order.splice(to, 0, item);
    selectedIndex = null;
    renderList();
  }

  function swap(i, j) {
    if (locked || i === j) return;
    [order[i], order[j]] = [order[j], order[i]];
    selectedIndex = null;
    renderList();
  }

  function check() {
    if (locked || mode !== "play") return;
    locked = true;
    const ok = isCorrect();
    const list = document.getElementById("od-list");
    if (list) {
      Array.from(list.children).forEach((li, i) => {
        li.classList.remove("od-ok", "od-bad", "od-selected");
        if (order[i] === CORRECT[i]) li.classList.add("od-ok");
        else li.classList.add("od-bad");
      });
    }
    const fb = document.getElementById("od-fb");
    if (fb) {
      if (ok) {
        fb.textContent = "Perfect! All days in order.";
        fb.className = "od-fb good";
      } else {
        const wrong = order.filter((id, i) => id !== CORRECT[i]).length;
        fb.textContent = wrong === 1 ? "1 day is in the wrong place." : `${wrong} days are in the wrong place.`;
        fb.className = "od-fb bad";
      }
    }
    const checkBtn = document.getElementById("od-check");
    if (checkBtn) checkBtn.disabled = true;

    setTimeout(() => {
      mode = "result";
      render();
    }, ok ? 900 : 1400);
  }

  function renderList() {
    const list = document.getElementById("od-list");
    if (!list) return;
    list.innerHTML = order
      .map((id, i) => {
        const d = dayById(id);
        const sel = selectedIndex === i ? " od-selected" : "";
        return `
          <li class="od-item${sel}" data-index="${i}" draggable="true">
            <span class="od-num" aria-hidden="true">${i + 1}</span>
            <button type="button" class="od-day" data-index="${i}">
              <span class="od-emoji" aria-hidden="true">${d.emoji}</span>
              <span class="od-label">${d.label}</span>
            </button>
            <div class="od-moves">
              <button type="button" class="od-move" data-dir="up" data-index="${i}" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button>
              <button type="button" class="od-move" data-dir="down" data-index="${i}" aria-label="Move down" ${i === order.length - 1 ? "disabled" : ""}>↓</button>
            </div>
          </li>`;
      })
      .join("");

    // Bind events
    list.querySelectorAll(".od-move").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (locked) return;
        const i = +btn.dataset.index;
        const dir = btn.dataset.dir;
        if (dir === "up") move(i, i - 1);
        else move(i, i + 1);
      };
    });

    list.querySelectorAll(".od-day").forEach((btn) => {
      btn.onclick = () => {
        if (locked) return;
        const i = +btn.dataset.index;
        if (selectedIndex === null) {
          selectedIndex = i;
          renderList();
        } else if (selectedIndex === i) {
          selectedIndex = null;
          renderList();
        } else {
          swap(selectedIndex, i);
        }
      };
    });

    // Drag & drop
    list.querySelectorAll(".od-item").forEach((li) => {
      li.addEventListener("dragstart", (e) => {
        if (locked) {
          e.preventDefault();
          return;
        }
        dragIndex = +li.dataset.index;
        li.classList.add("od-dragging");
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", String(dragIndex));
        } catch (_) {}
      });
      li.addEventListener("dragend", () => {
        li.classList.remove("od-dragging");
        list.querySelectorAll(".od-item").forEach((el) => el.classList.remove("od-drag-over"));
        dragIndex = null;
      });
      li.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (locked || dragIndex === null) return;
        e.dataTransfer.dropEffect = "move";
        list.querySelectorAll(".od-item").forEach((el) => el.classList.remove("od-drag-over"));
        li.classList.add("od-drag-over");
      });
      li.addEventListener("dragleave", () => li.classList.remove("od-drag-over"));
      li.addEventListener("drop", (e) => {
        e.preventDefault();
        li.classList.remove("od-drag-over");
        if (locked || dragIndex === null) return;
        const to = +li.dataset.index;
        if (dragIndex !== to) move(dragIndex, to);
        dragIndex = null;
      });
    });
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="od-topbar">
          <a class="od-back" href="../" aria-label="Back">←</a>
          <span class="od-title">Order the Days</span>
          <span class="od-badge">1A</span>
        </header>
        <section class="od-start">
          <div class="od-hero">
            <div class="od-blob" aria-hidden="true"></div>
            <div class="od-icon-wrap" aria-hidden="true">📅</div>
          </div>
          <h1>Order the Days</h1>
          <p class="od-desc">Put the days of the week in order<br>from <strong>Monday</strong> to <strong>Sunday</strong>.</p>
          <ul class="od-tips">
            <li>Use ↑ ↓ or drag to move</li>
            <li>Tap two days to swap them</li>
          </ul>
          <button type="button" class="od-btn" id="od-start">Start</button>
        </section>`;
      document.getElementById("od-start").onclick = startGame;
      return;
    }

    if (mode === "result") {
      const ok = isCorrect();
      const stars = ok ? 3 : 0;
      app.innerHTML = `
        <header class="od-topbar">
          <a class="od-back" href="../" aria-label="Back">←</a>
          <span class="od-title">Order the Days</span>
          <span class="od-badge">Done</span>
        </header>
        <section class="od-done">
          <div class="od-trophy" aria-hidden="true">${ok ? "🏆" : "💪"}</div>
          <div class="od-stars" aria-hidden="true">
            <span class="od-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="od-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="od-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${ok ? "Perfect!" : "Keep practicing!"}</h1>
          <p>${ok ? "You put all the days in the right order." : "Try again — Monday comes first, then Tuesday…"}</p>
          <div class="od-answer">
            ${DAYS.map((d) => `<span class="od-chip">${d.emoji} ${d.label}</span>`).join("")}
          </div>
          <button type="button" class="od-btn" id="od-again">Play again</button>
          <a class="od-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("od-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    // play
    app.innerHTML = `
      <header class="od-topbar">
        <a class="od-back" href="../" aria-label="Back">←</a>
        <span class="od-title">Order the Days</span>
        <span class="od-badge">Reorder</span>
      </header>
      <p class="od-instruction">Monday → Sunday. Move the days into the correct order.</p>
      <ol class="od-list" id="od-list"></ol>
      <div class="od-fb" id="od-fb" aria-live="polite"></div>
      <div class="od-actions">
        <button type="button" class="od-btn secondary" id="od-shuffle">Shuffle</button>
        <button type="button" class="od-btn" id="od-check">Check</button>
      </div>
    `;
    renderList();
    document.getElementById("od-check").onclick = check;
    document.getElementById("od-shuffle").onclick = () => {
      if (locked) return;
      order = shuffle(order);
      selectedIndex = null;
      const fb = document.getElementById("od-fb");
      if (fb) {
        fb.textContent = "";
        fb.className = "od-fb";
      }
      renderList();
    };
  }

  render();
})();
