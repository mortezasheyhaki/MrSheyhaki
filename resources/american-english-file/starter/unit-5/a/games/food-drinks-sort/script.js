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
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();


  const ITEMS = [
    ["fish","food"],["meat","food"],["pasta","food"],["rice","food"],["eggs","food"],
    ["yogurt","food"],["vegetables","food"],["potatoes","food"],["salad","food"],["fruit","food"],
    ["bread","food"],["butter","food"],["cheese","food"],["sugar","food"],["a sandwich","food"],
    ["cereal","food"],["chocolate","food"],
    ["coffee","drinks"],["tea","drinks"],["milk","drinks"],["water","drinks"],["orange juice","drinks"]
  ];
  const VISIBLE = 6;
  const TOTAL = ITEMS.length;
  const START_TIME = 90;
  const $ = (id) => document.getElementById(id);

  let state = null;

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startGame() {
    $("homeScreen").classList.add("hidden");
    $("gameScreen").classList.remove("hidden");
    $("endModal").classList.add("hidden");
    resetRound();
  }

  function resetRound() {
    if (state && state.timer) clearInterval(state.timer);
    state = {
      score: 0, combo: 0, bestCombo: 0, correct: 0, attempts: 0,
      foodCount: 0, drinksCount: 0, time: START_TIME, done: false, selected: null,
      remaining: shuffle(ITEMS.map(([word, category]) => ({ word, category }))),
      timer: null
    };
    $("cardTray").innerHTML = "";
    fillTray();
    updateHud();
    state.timer = setInterval(tick, 1000);
  }

  function fillTray() {
    const tray = $("cardTray");
    while (tray.children.length < VISIBLE && state.remaining.length > 0) {
      const next = state.remaining.shift();
      makeCard(next.word, next.category);
    }
  }

  function makeCard(word, category) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "word-card";
    card.textContent = word;
    card.dataset.category = category;
    card.dataset.word = word;
    card.addEventListener("click", () => selectCard(card));
    card.addEventListener("pointerdown", startPointer);
    $("cardTray").appendChild(card);
  }

  function clearSelection() {
    document.querySelectorAll(".word-card.selected").forEach((c) => c.classList.remove("selected"));
    $("foodZone").classList.remove("active-target");
    $("drinksZone").classList.remove("active-target");
    state.selected = null;
  }

  function selectCard(card) {
    if (state.done) return;
    if (state.selected === card) { clearSelection(); return; }
    clearSelection();
    state.selected = card;
    card.classList.add("selected");
    $("foodZone").classList.add("active-target");
    $("drinksZone").classList.add("active-target");
  }

  function startPointer(e) {
    if (state.done || (e.button !== undefined && e.button !== 0)) return;
    const card = e.currentTarget;
    e.preventDefault();
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    card.classList.add("dragging");
    const move = (ev) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      document.querySelectorAll(".drop-zone").forEach((z) => {
        z.classList.toggle("drag-over", !!(el && z.contains(el)));
      });
    };
    const up = (ev) => {
      card.classList.remove("dragging");
      document.querySelectorAll(".drop-zone").forEach((z) => z.classList.remove("drag-over"));
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      try { card.releasePointerCapture(ev.pointerId); } catch (_) {}
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const zone = el && el.closest ? el.closest(".drop-zone") : null;
      if (zone) place(card, zone.dataset.category);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  ["foodZone", "drinksZone"].forEach((id) => {
    $(id).addEventListener("click", () => {
      if (state.selected) place(state.selected, $(id).dataset.category);
    });
  });

  function place(card, category) {
    if (!card || state.done || !card.parentNode) return;
    state.attempts++;
    if (card.dataset.category !== category) {
      state.combo = 0;
      card.classList.add("wrong");
      setTimeout(() => card.classList.remove("wrong"), 400);
      updateHud();
      return;
    }
    state.correct++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += 10 + Math.max(0, state.combo - 1) * 2;
    if (category === "food") state.foodCount++; else state.drinksCount++;
    clearSelection();
    card.classList.add("leaving");
    setTimeout(() => {
      if (card.parentNode) card.parentNode.removeChild(card);
      fillTray();
    }, 220);
    updateHud();
    if (state.correct >= TOTAL) finish(true);
  }

  function tick() {
    if (state.done) return;
    state.time--;
    updateHud();
    if (state.time <= 0) finish(false);
  }

  function updateHud() {
    $("score").textContent = state.score;
    $("combo").textContent = state.combo + "x";
    $("timer").textContent = String(Math.max(0, state.time));
    $("progressLabel").textContent = state.correct + " / " + TOTAL;
    $("progressFill").style.width = (state.correct / TOTAL) * 100 + "%";
    $("foodCount").textContent = state.foodCount;
    $("drinksCount").textContent = state.drinksCount;
  }

  function finish(won) {
    state.done = true;
    clearInterval(state.timer);
    $("finalScore").textContent = state.score;
    $("accuracy").textContent = (state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0) + "%";
    $("bestCombo").textContent = state.bestCombo + "x";
    $("endTitle").textContent = won ? "Excellent!" : "Time's up!";
    $("endMessage").textContent = won
      ? "You sorted all " + TOTAL + " words correctly."
      : "You sorted " + state.correct + " of " + TOTAL + ".";
    $("resultIcon").textContent = won ? "🏆" : "⏱️";
    
    try { if(window.LAStars){var acc=state.attempts?Math.round(state.correct/state.attempts*100):0;LAStars.recordPlay("starter-5a-food-drinks-sort");LAStars.saveFromAccuracy("starter-5a-food-drinks-sort",acc);} } catch (e) {}
    $("endModal").classList.remove("hidden");
  }

  const themeBtn = $("themeBtn");
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeBtn.textContent = dark ? "☀️" : "🌙";
    try { localStorage.setItem("fds-theme", dark ? "dark" : "light"); } catch (_) {}
  }
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });
  try { applyTheme(localStorage.getItem("fds-theme") === "dark"); } catch (_) { applyTheme(false); }

  $("startBtn").addEventListener("click", startGame);
  $("playAgain").addEventListener("click", () => {
    $("endModal").classList.add("hidden");
    startGame();
  });
})();
