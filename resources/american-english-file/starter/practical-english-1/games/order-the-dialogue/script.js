/* Order the Dialogue – Rob & receptionist · Starter PE1 */
(function () {

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-pe1-order-the-dialogue";
  const AUDIO_SRC = "audio/dialogue.mp3";

  // Correct order from the audio
  const LINES = [
    { id: "l1", text: "Hello." },
    { id: "l2", text: "Good afternoon." },
    { id: "l3", text: "My name's Rob Walker. I have a reservation." },
    { id: "l4", text: "Sorry, what's your surname?" },
    { id: "l5", text: "Walker." },
    { id: "l6", text: "How do you spell it?" },
    { id: "l7", text: "W-A-L-K-E-R." },
    { id: "l8", text: "Sorry?" },
    { id: "l9", text: "W-A-L-K-E-R." },
    { id: "l10", text: "Thank you. OK, Mr. Walker. You're in room 321." },
    { id: "l11", text: "Thanks." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let order = []; // array of line ids in current order
  let locked = false;
  let audio = null;
  let dragId = null;
  let touchEl = null;
  let touchStartY = 0;
  let touchOffsetY = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // avoid starting in perfect order
    if (a.every((id, i) => id === LINES[i].id)) {
      const t = a[0];
      a[0] = a[a.length - 1];
      a[a.length - 1] = t;
    }
    return a;
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
      audio = null;
    }
    const btn = document.getElementById("od-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    stopAudio();
    audio = new Audio(AUDIO_SRC);
    const btn = document.getElementById("od-play");
    if (btn) btn.classList.add("playing");
    audio.play().catch(() => {});
    audio.onended = () => {
      if (btn) btn.classList.remove("playing");
      audio = null;
    };
    audio.onerror = () => {
      if (btn) btn.classList.remove("playing");
      audio = null;
    };
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function lineById(id) {
    return LINES.find((l) => l.id === id);
  }

  function showStart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    locked = false;
    order = [];
    app.innerHTML = `
      <header class="od-topbar">
        <a class="od-back" href="../" aria-label="Back">←</a>
        <span class="od-title">Order the Dialogue</span>
        <span class="od-badge">PE1</span>
      </header>
      <section class="od-start">
        <div class="od-hero od-enter" style="--i:0">
          <div class="od-icon">🏨</div>
          <h1>Order the Dialogue</h1>
          <p>Listen to Rob at the hotel.<br>
          Put the sentences in the correct order.</p>
        </div>
        <ul class="od-preview">
          <li class="od-enter" style="--i:1">Listen to the full conversation</li>
          <li class="od-enter" style="--i:2">Drag the lines into the right order</li>
          <li class="od-enter" style="--i:3">Check your answers</li>
        </ul>
        <button type="button" class="od-btn primary od-enter" style="--i:4" id="od-go">Start</button>
      </section>`;
    document.getElementById("od-go").onclick = startGame;
  }

  function startGame() {
    order = shuffle(LINES.map((l) => l.id));
    locked = false;
    renderPlay();
  }

  function renderPlay() {
    stopAudio();
    locked = false;

    const items = order
      .map((id, i) => {
        const line = lineById(id);
        return `
          <li class="od-item od-enter" style="--i:${i}" data-id="${id}" draggable="true">
            <span class="od-handle" aria-hidden="true">⋮⋮</span>
            <span class="od-num">${i + 1}</span>
            <span class="od-text">${escapeHtml(line.text)}</span>
          </li>`;
      })
      .join("");

    app.innerHTML = `
      <header class="od-topbar">
        <a class="od-back" href="#" id="od-back" aria-label="Back">←</a>
        <span class="od-title">Order the Dialogue</span>
        <span class="od-badge">Hotel</span>
      </header>
      <div class="od-stage">
        <div class="od-speaker-wrap od-enter" style="--i:0">
          <button type="button" class="od-play" id="od-play" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <div class="od-listen-hint">Tap to listen · drag to reorder</div>
        </div>
        <ol class="od-list" id="od-list">${items}</ol>
        <div class="od-feedback" id="od-fb" hidden></div>
      </div>
      <div class="od-controls od-enter" style="--i:2">
        <button type="button" class="od-btn secondary" id="od-reset">Shuffle</button>
        <button type="button" class="od-btn primary" id="od-check">Check</button>
      </div>`;

    document.getElementById("od-back").onclick = (e) => {
      e.preventDefault();
      if (locked) return;
      showStart();
    };
    document.getElementById("od-play").onclick = playAudio;
    document.getElementById("od-check").onclick = onCheck;
    document.getElementById("od-reset").onclick = () => {
      if (locked) return;
      order = shuffle(LINES.map((l) => l.id));
      renderPlay();
    };

    bindDragDrop(document.getElementById("od-list"));
    setTimeout(playAudio, 450);
  }

  function renumber() {
    const list = document.getElementById("od-list");
    if (!list) return;
    Array.from(list.children).forEach((li, i) => {
      const num = li.querySelector(".od-num");
      if (num) num.textContent = String(i + 1);
    });
    order = Array.from(list.children).map((li) => li.dataset.id);
  }

  function moveItem(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= order.length || toIndex >= order.length) return;
    const id = order.splice(fromIndex, 1)[0];
    order.splice(toIndex, 0, id);
    const list = document.getElementById("od-list");
    if (!list) return;
    const items = Array.from(list.children);
    const el = items[fromIndex];
    if (!el) return;
    if (toIndex >= items.length - 1 && fromIndex < toIndex) {
      list.appendChild(el);
    } else {
      const ref = items[toIndex + (fromIndex < toIndex ? 1 : 0)];
      list.insertBefore(el, ref || null);
    }
    renumber();
  }

  function bindDragDrop(list) {
    if (!list) return;

    // Desktop HTML5 DnD
    list.querySelectorAll(".od-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        if (locked) {
          e.preventDefault();
          return;
        }
        dragId = item.dataset.id;
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", dragId);
      });
      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        list.querySelectorAll(".od-item").forEach((li) => li.classList.remove("drag-over"));
        dragId = null;
        renumber();
      });
      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const over = e.currentTarget;
        if (over.dataset.id === dragId) return;
        list.querySelectorAll(".od-item").forEach((li) => li.classList.remove("drag-over"));
        over.classList.add("drag-over");
      });
      item.addEventListener("dragleave", (e) => {
        e.currentTarget.classList.remove("drag-over");
      });
      item.addEventListener("drop", (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        target.classList.remove("drag-over");
        if (!dragId || target.dataset.id === dragId) return;
        const from = order.indexOf(dragId);
        const to = order.indexOf(target.dataset.id);
        moveItem(from, to);
      });
    });

    // Touch support
    list.querySelectorAll(".od-item").forEach((item) => {
      item.addEventListener(
        "touchstart",
        (e) => {
          if (locked) return;
          const t = e.changedTouches[0];
          touchEl = item;
          touchStartY = t.clientY;
          const rect = item.getBoundingClientRect();
          touchOffsetY = t.clientY - rect.top;
          item.classList.add("dragging");
          item.style.zIndex = "20";
        },
        { passive: true }
      );

      item.addEventListener(
        "touchmove",
        (e) => {
          if (!touchEl || locked) return;
          e.preventDefault();
          const t = e.changedTouches[0];
          const dy = t.clientY - touchStartY;
          touchEl.style.transform = `translateY(${dy}px) scale(1.02)`;
          touchEl.style.boxShadow = "0 12px 28px rgba(99,102,241,0.25)";

          // find element under finger
          touchEl.style.pointerEvents = "none";
          const under = document.elementFromPoint(t.clientX, t.clientY);
          touchEl.style.pointerEvents = "";
          const target = under && under.closest ? under.closest(".od-item") : null;
          list.querySelectorAll(".od-item").forEach((li) => li.classList.remove("drag-over"));
          if (target && target !== touchEl) target.classList.add("drag-over");
        },
        { passive: false }
      );

      item.addEventListener(
        "touchend",
        (e) => {
          if (!touchEl || locked) return;
          const t = e.changedTouches[0];
          touchEl.style.pointerEvents = "none";
          const under = document.elementFromPoint(t.clientX, t.clientY);
          touchEl.style.pointerEvents = "";
          const target = under && under.closest ? under.closest(".od-item") : null;

          touchEl.style.transform = "";
          touchEl.style.boxShadow = "";
          touchEl.style.zIndex = "";
          touchEl.classList.remove("dragging");
          list.querySelectorAll(".od-item").forEach((li) => li.classList.remove("drag-over"));

          if (target && target !== touchEl) {
            const from = order.indexOf(touchEl.dataset.id);
            const to = order.indexOf(target.dataset.id);
            moveItem(from, to);
          }
          touchEl = null;
        },
        { passive: true }
      );

      item.addEventListener("touchcancel", () => {
        if (!touchEl) return;
        touchEl.style.transform = "";
        touchEl.style.boxShadow = "";
        touchEl.style.zIndex = "";
        touchEl.classList.remove("dragging");
        list.querySelectorAll(".od-item").forEach((li) => li.classList.remove("drag-over"));
        touchEl = null;
      });
    });
  }

  function onCheck() {
    if (locked) return;
    locked = true;
    stopAudio();

    const list = document.getElementById("od-list");
    let correct = 0;
    order.forEach((id, i) => {
      const ok = id === LINES[i].id;
      if (ok) correct++;
      const li = list && list.querySelector(`.od-item[data-id="${id}"]`);
      if (li) {
        li.classList.remove("ok", "bad");
        li.classList.add(ok ? "ok" : "bad");
        li.draggable = false;
      }
    });

    const total = LINES.length;
    const fb = document.getElementById("od-fb");
    if (fb) {
      fb.hidden = false;
      if (correct === total) {
        fb.className = "od-feedback ok od-fb-in";
        fb.textContent = "Perfect! All in the right order.";
      } else {
        fb.className = "od-feedback warn od-fb-in";
        fb.textContent = `You got ${correct} / ${total} in the right place.`;
      }
    }

    const checkBtn = document.getElementById("od-check");
    const resetBtn = document.getElementById("od-reset");
    if (resetBtn) resetBtn.disabled = true;
    if (checkBtn) {
      checkBtn.textContent = correct === total ? "Continue" : "Try again";
      checkBtn.onclick = () => {
        if (correct === total) {
          showDone(correct);
        } else {
          // reshuffle and try again, but keep listening available
          order = shuffle(LINES.map((l) => l.id));
          renderPlay();
        }
      };
    }

    if (correct === total) {
      setTimeout(() => showDone(correct), 1400);
    }
  }

  function showDone(score) {
    const stars = score === LINES.length ? 3 : score >= 8 ? 2 : score >= 5 ? 1 : 0;
    saveStars(stars);
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: LINES.length,
        stars: stars,
        timeMs: timeMs,
        onAgain: showStart,
        onModes: () => showStart(),
        backHref: "../",
        save: false,
      });
      return;
    }
    app.innerHTML = `<p>Done</p><button type="button" id="pe-again">Again</button>`;
    document.getElementById("pe-again").onclick = showStart;
  }

  showStart();
})();
