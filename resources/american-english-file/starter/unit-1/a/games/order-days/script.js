/* Order the Days – put weekdays in correct order */
(function () {
  const GAME_ID = "starter-1a-order-days";
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

  function clearDragOver() {
    const list = document.getElementById("od-list");
    if (!list) return;
    list.querySelectorAll(".od-item").forEach((el) => el.classList.remove("od-drag-over"));
  }

  function itemIndexFromPoint(x, y) {
    const list = document.getElementById("od-list");
    if (!list) return -1;
    const els = list.querySelectorAll(".od-item");
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) return i;
    }
    // Before first / after last
    if (els.length) {
      const first = els[0].getBoundingClientRect();
      const last = els[els.length - 1].getBoundingClientRect();
      if (y < first.top) return 0;
      if (y > last.bottom) return els.length - 1;
    }
    return -1;
  }

  function removeGhost() {
    const g = document.getElementById("od-ghost");
    if (g) g.remove();
  }

  function renderList() {
    const list = document.getElementById("od-list");
    if (!list) return;
    removeGhost();
    list.innerHTML = order
      .map((id, i) => {
        const d = dayById(id);
        const sel = selectedIndex === i ? " od-selected" : "";
        return `
          <li class="od-item${sel}" data-index="${i}" draggable="true">
            <span class="od-handle" aria-hidden="true" title="Drag">⋮⋮</span>
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

    // Desktop HTML5 drag & drop
    list.querySelectorAll(".od-item").forEach((li) => {
      li.addEventListener("dragstart", (e) => {
        if (locked) {
          e.preventDefault();
          return;
        }
        // Don't start HTML5 drag from buttons
        if (e.target.closest(".od-move, .od-day")) {
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
        clearDragOver();
        dragIndex = null;
      });
      li.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (locked || dragIndex === null) return;
        e.dataTransfer.dropEffect = "move";
        clearDragOver();
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

    // Touch drag & drop (phones / tablets)
    bindTouchDrag(list);
  }

  function bindTouchDrag(list) {
    let touchFrom = null;
    let ghost = null;
    let activeLi = null;
    let startY = 0;
    let startX = 0;
    let moved = false;
    let suppressClick = false;

    function onTouchStart(e) {
      if (locked) return;
      const touch = e.touches[0];
      if (!touch) return;
      const li = e.target.closest(".od-item");
      if (!li || !list.contains(li)) return;
      // Allow up/down buttons to work normally
      if (e.target.closest(".od-move")) return;

      touchFrom = +li.dataset.index;
      activeLi = li;
      startY = touch.clientY;
      startX = touch.clientX;
      moved = false;
      suppressClick = false;
    }

    function onTouchMove(e) {
      if (touchFrom === null || !activeLi) return;
      const touch = e.touches[0];
      if (!touch) return;

      const dy = touch.clientY - startY;
      const dx = touch.clientX - startX;

      // Require a little movement before treating as drag
      if (!moved && Math.abs(dy) < 8 && Math.abs(dx) < 8) return;

      if (!moved) {
        moved = true;
        suppressClick = true;
        selectedIndex = null;
        activeLi.classList.add("od-dragging");
        document.body.classList.add("od-touch-dragging");

        // Floating ghost that follows the finger
        ghost = document.createElement("div");
        ghost.id = "od-ghost";
        ghost.className = "od-ghost";
        const d = dayById(order[touchFrom]);
        ghost.innerHTML = `<span class="od-emoji">${d.emoji}</span><span class="od-label">${d.label}</span>`;
        document.body.appendChild(ghost);
      }

      e.preventDefault(); // stop page scroll while dragging

      ghost.style.left = touch.clientX + "px";
      ghost.style.top = touch.clientY + "px";

      clearDragOver();
      const over = itemIndexFromPoint(touch.clientX, touch.clientY);
      if (over >= 0 && over !== touchFrom) {
        const el = list.querySelector(`.od-item[data-index="${over}"]`);
        if (el) el.classList.add("od-drag-over");
      }
    }

    function onTouchEnd(e) {
      if (touchFrom === null) return;
      const touch = (e.changedTouches && e.changedTouches[0]) || null;

      if (moved && touch) {
        const to = itemIndexFromPoint(touch.clientX, touch.clientY);
        if (to >= 0 && to !== touchFrom) {
          move(touchFrom, to);
        } else {
          // No reorder — just refresh classes
          if (activeLi) activeLi.classList.remove("od-dragging");
          clearDragOver();
          renderList();
        }
      } else if (!moved && activeLi) {
        // Treated as tap on the row (not the day button) — optional select via handle
        activeLi.classList.remove("od-dragging");
      }

      removeGhost();
      document.body.classList.remove("od-touch-dragging");
      clearDragOver();
      touchFrom = null;
      activeLi = null;
      ghost = null;
      moved = false;

      // Block the synthetic click that would fire after a drag
      if (suppressClick) {
        const block = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          document.removeEventListener("click", block, true);
        };
        document.addEventListener("click", block, true);
        setTimeout(() => document.removeEventListener("click", block, true), 400);
      }
    }

    function onTouchCancel() {
      if (activeLi) activeLi.classList.remove("od-dragging");
      removeGhost();
      document.body.classList.remove("od-touch-dragging");
      clearDragOver();
      touchFrom = null;
      activeLi = null;
      ghost = null;
      moved = false;
    }

    // Use passive:false on move so we can preventDefault (stop scroll)
    list.addEventListener("touchstart", onTouchStart, { passive: true });
    list.addEventListener("touchmove", onTouchMove, { passive: false });
    list.addEventListener("touchend", onTouchEnd, { passive: true });
    list.addEventListener("touchcancel", onTouchCancel, { passive: true });
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
            <li>Drag days up or down (works on phone)</li>
            <li>Or use ↑ ↓ / tap two days to swap</li>
          </ul>
          <button type="button" class="od-btn" id="od-start">Start</button>
        </section>`;
      document.getElementById("od-start").onclick = startGame;
      return;
    }

    if (mode === "result") {
      const ok = isCorrect();
      const correctCount = order.filter((id, i) => id === CORRECT[i]).length;
      const stars = ok ? 3 : correctCount >= 6 ? 2 : correctCount >= 4 ? 1 : 0;
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
      app.innerHTML = `
        <header class="od-topbar">
          <a class="od-back" href="../" aria-label="Back">←</a>
          <span class="od-title">Order the Days</span>
          <span class="od-badge">Done</span>
        </header>
        <section class="od-done">
          <div class="od-trophy" aria-hidden="true">${ok ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="od-stars" aria-hidden="true">
            <span class="od-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="od-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="od-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${ok ? "Perfect!" : stars >= 1 ? "Almost!" : "Keep practicing!"}</h1>
          <p>${ok ? "You put all the days in the right order." : correctCount + " of 7 in the right place — try again."}</p>
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
