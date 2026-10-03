/* ===== Arcade FX: progress bar, combo, milestone celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [["🌟","Awesome!","10 correct answers!"],["🚀","Superstar!","20 correct — unstoppable!"],["👑","Legend!","30 correct — the best of the best!"]];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) { return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : ""; }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) { el = document.createElement("div"); el.id = "afx-combo"; el.className = "afx-combo"; document.body.appendChild(el); }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = (document.getElementById("game-app") || document.getElementById("app"));
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) { burst(CHEERS[Math.min(Math.floor(n / 10) - 1, 2)]); }
  function burst(c) {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.1, i * 0.09); });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div"); ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 44; i++) h += '<i style="left:' + Math.random() * 100 + "%;background:" + cols[i % 6] + ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" + (1.3 + Math.random() * 0.9).toFixed(2) + 's"></i>';
    ov.innerHTML = h + '<div class="afx-card"><div class="afx-emoji">' + c[0] + '</div><div class="afx-title">' + c[1] + '</div><div class="afx-sub">' + c[2] + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) { var st = L.startTimer; L.__afx = 1; L.startTimer = function () { api.reset(); return st.apply(this, arguments); }; }
  }
  var api = window.ArcadeFX = {
    track: null,
    bar: function (pct) {
      var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
      var bar = app.querySelector(".afx-bar");
      if (!bar) {
        var anchor = app.querySelector('[id*="rogress"]') || app.querySelector("header"); if (!anchor) return;
        var host = anchor.closest("header") || anchor.parentElement;
        bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
        host.parentNode.insertBefore(bar, host.nextSibling);
      }
      var fill = bar.firstChild; lastPct = pct;
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
    },
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0 && !api.noMilestone) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || ("Part " + (i + 1) + " of " + n + " complete")]);
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"],[id*="rogress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^(?:[A-Za-z]{1,9}\s*)?\d+\s*(?:\/|of)\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class*="-bar-fill"],[class*="-progress-fill"]')) return;
    if (!badge && api.track) { try { api.bar(api.track()); } catch (e) {} return; }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(?:[A-Za-z]{1,9}\s*)?(\d+)\s*(?:\/|of)\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
    if (!bar) {
      var host = badge.closest("header") || badge.parentElement;
      bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
      host.parentNode.insertBefore(bar, host.nextSibling);
    }
    var fill = bar.firstChild; lastPct = pct;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
  }
  var q = 0;
  function start() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* What's this? → How do you spell it? · PE1 classroom objects */
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
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok();
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad();
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


  const GAME_ID = "starter-pe1-classroom-whats-this";

  const ITEMS = [
    { id: "bag",        label: "a bag",            image: "https://cdn.imgurl.ir/uploads/q131373_a-bag.png",            audio: "https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3",
      nameAnswers: ["it's a bag", "it is a bag"],
      spellAnswers: ["bag"] },
    { id: "pen",        label: "a pen",            image: "https://cdn.imgurl.ir/uploads/t81465_a-pen.png",            audio: "https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3",
      nameAnswers: ["it's a pen", "it is a pen"],
      spellAnswers: ["pen"] },
    { id: "paper",      label: "a piece of paper", image: "https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png", audio: "https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3",
      nameAnswers: ["it's a piece of paper", "it is a piece of paper"],
      spellAnswers: ["paper", "piece of paper"] },
    { id: "dictionary", label: "a dictionary",     image: "https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png",     audio: "https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3",
      nameAnswers: ["it's a dictionary", "it is a dictionary"],
      spellAnswers: ["dictionary"] },
    { id: "laptop",     label: "a laptop",         image: "https://cdn.imgurl.ir/uploads/w410273_a-laptop.png",         audio: "https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3",
      nameAnswers: ["it's a laptop", "it is a laptop"],
      spellAnswers: ["laptop"] },
    { id: "table",      label: "a table",          image: "https://cdn.imgurl.ir/uploads/a696837_a-table.png",          audio: "https://cdn.imgurl.ir/uploads/d742794_a-table.mp3",
      nameAnswers: ["it's a table", "it is a table"],
      spellAnswers: ["table"] },
    { id: "chair",      label: "a chair",          image: "https://cdn.imgurl.ir/uploads/t901556_a-chair.png",          audio: "https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3",
      nameAnswers: ["it's a chair", "it is a chair"],
      spellAnswers: ["chair"] },
    { id: "window",     label: "a window",         image: "https://cdn.imgurl.ir/uploads/c480039_a-window.png",         audio: "https://cdn.imgurl.ir/uploads/l543208_a-window.mp3",
      nameAnswers: ["it's a window", "it is a window"],
      spellAnswers: ["window"] },
    { id: "door",       label: "the door",         image: "https://cdn.imgurl.ir/uploads/o763819_the-door.png",         audio: "https://cdn.imgurl.ir/uploads/g92275_the-door.mp3",
      nameAnswers: ["it's the door", "it is the door", "it's a door", "it is a door"],
      spellAnswers: ["door"] },
    { id: "board",      label: "the board",        image: "https://cdn.imgurl.ir/uploads/v58413_the-board.png",        audio: "https://cdn.imgurl.ir/uploads/i034259_the-board.mp3",
      nameAnswers: ["it's the board", "it is the board", "it's a board", "it is a board"],
      spellAnswers: ["board"] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  // step: "name" = What's this?  |  "spell" = How do you spell it?
  let phase = "menu"; // menu | play | feedback | done
  let order = [];
  let index = 0;
  let step = "name";
  let correctCount = 0;
  let totalAnswered = 0; // each item has 2 questions
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let currentAudio = null;
  let autoTimer = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      // unify apostrophes
      .replace(/[’`´]/g, "'")
      // strip trailing / surrounding punctuation (periods, commas, !, ?)
      .replace(/[.,!?;:]+$/g, "")
      .replace(/^[.,!?;:]+/g, "")
      // remove leftover mid-sentence punctuation that doesn't change meaning
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function core(str) {
    return normalize(str).replace(/^(a|an|the)\s+/, "");
  }

  /** Expand accepted name answers: a↔the, it's↔it is, optional article */
  function expandNameAnswers(list) {
    const out = {};
    list.forEach((raw) => {
      const base = normalize(raw);
      if (!base) return;
      const variants = [base];
      // it's ↔ it is
      if (base.indexOf("it's ") === 0) {
        variants.push("it is " + base.slice(5));
      } else if (base.indexOf("it is ") === 0) {
        variants.push("it's " + base.slice(6));
      }
      // a ↔ the (and an)
      variants.slice().forEach((v) => {
        variants.push(v.replace(/\ba\b/g, "the"));
        variants.push(v.replace(/\bthe\b/g, "a"));
        variants.push(v.replace(/\ban\b/g, "the"));
        variants.push(v.replace(/\bthe\b/g, "an"));
      });
      variants.forEach((v) => {
        out[normalize(v)] = true;
      });
    });
    return out;
  }

  function isCorrect(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    if (step === "spell") {
      const list = item.spellAnswers;
      // letter boxes produce the bare word; also accept spaced "b o a r d"
      const compact = n.replace(/\s+/g, "");
      return list.some((a) => {
        const na = normalize(a).replace(/\s+/g, "");
        return na === n || na === compact;
      });
    }
    // name step — must include "it's" / "it is"; a↔the and punctuation are flexible
    const accepted = expandNameAnswers(item.nameAnswers);
    return !!accepted[n];
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playItemAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function clearAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    clearAuto();
    order = shuffle(ITEMS);
    index = 0;
    step = "name";
    correctCount = 0;
    totalAnswered = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
  }

  function spellTarget(item) {
    // Primary word for letter boxes (no spaces)
    return (item.spellAnswers[0] || "").replace(/\s+/g, "").toLowerCase();
  }

  function getSpellInput() {
    const boxes = app.querySelectorAll(".wt-letter");
    if (!boxes.length) return "";
    let s = "";
    boxes.forEach((b) => {
      s += (b.value || "").toLowerCase();
    });
    return s;
  }

  function allSpellFilled() {
    const boxes = app.querySelectorAll(".wt-letter");
    if (!boxes.length) return false;
    for (let i = 0; i < boxes.length; i++) {
      if (!(boxes[i].value || "").trim()) return false;
    }
    return true;
  }

  function checkAnswer() {
    if (answered) return;
    let val = "";
    if (step === "spell") {
      val = getSpellInput();
      if (!val || !allSpellFilled()) return;
    } else {
      const input = document.getElementById("wt-input");
      val = (input ? input.value : "").trim();
      if (!val) return;
    }
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrect(lastUserInput, item);
    totalAnswered += 1;
    if (lastCorrect) correctCount += 1;
    answered = true;
    stopAudio();
    if (step === "spell") {
      app.querySelectorAll(".wt-letter").forEach((b) => {
        b.classList.add(lastCorrect ? "wt-ok" : "wt-bad");
        b.disabled = true;
      });
    } else {
      const input = document.getElementById("wt-input");
      if (input) {
        input.classList.add(lastCorrect ? "wt-ok" : "wt-bad");
        input.blur();
      }
    }
    const checkBtn = document.getElementById("wt-check");
    if (checkBtn) checkBtn.disabled = true;
    setTimeout(() => {
      phase = "feedback";
      render();
    }, lastCorrect ? 280 : 380);
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    totalAnswered += 1;
    answered = true;
    stopAudio();
    phase = "feedback";
    render();
  }

  function advance() {
    clearAuto();
    // After "name" step → go to "spell" for same item
    // After "spell" step → next item (or done)
    if (step === "name") {
      step = "spell";
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      return;
    }
    // finished spell for this item
    if (index < order.length - 1) {
      if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
      index += 1;
      step = "name";
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const total = ITEMS.length * 2;
    const n = correctCount;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function spawnSparks(el) {
    if (!el) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "wt-spark";
      const angle = (i / 10) * Math.PI * 2;
      const dist = 32 + Math.random() * 22;
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      s.style.setProperty("--delay", (i * 0.02) + "s");
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }

  // progress: each item = 2 steps
  function progressPct() {
    const doneSteps = index * 2 + (step === "spell" ? 1 : 0) + (phase === "feedback" ? 1 : 0);
    const total = order.length * 2;
    return Math.min(100, (doneSteps / total) * 100);
  }

  function progressLabel() {
    const itemNum = index + 1;
    const stepLabel = step === "name" ? "1/2" : "2/2";
    return `${itemNum}/${order.length} · ${stepLabel}`;
  }

  function render() {
    clearAuto();

    if (phase === "menu") {
      app.innerHTML = `
        <header class="wt-topbar">
          <a class="wt-back" href="../" aria-label="Back">←</a>
          <span class="wt-title">What's this?</span>
          <span class="wt-badge">PE1</span>
        </header>
        <section class="wt-start">
          <div class="wt-hero" aria-hidden="true">❓</div>
          <h1>What's this?</h1>
          <p class="wt-desc">See the picture → name it → spell it.<br>10 classroom objects · 2 steps each</p>
          <button type="button" class="wt-btn" id="wt-start">Start →</button>
        </section>`;
      document.getElementById("wt-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      const total = typeof ITEMS !== 'undefined' ? ITEMS.length : correctCount;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: total,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="pe-again">Again</button>`;
      document.getElementById("pe-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    const item = order[index];
    const isName = step === "name";
    const question = isName ? "What's this?" : "How do you spell it?";
    const tip = isName
      ? "Answer with: It's a … / It's the …"
      : "Put one letter in each box.";
    const targetWord = spellTarget(item);
    const letterBoxesHtml = isName
      ? ""
      : targetWord
          .split("")
          .map(
            (_, i) =>
              `<input type="text" class="wt-letter" data-i="${i}" maxlength="1" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" aria-label="Letter ${i + 1}">`
          )
          .join("");

    if (phase === "play") {
      app.innerHTML = `
        <header class="wt-topbar">
          <a class="wt-back" href="#" id="wt-back" aria-label="Back">←</a>
          <span class="wt-title">${question}</span>
          <span class="wt-progress">${progressLabel()}</span>
        </header>
        <div class="wt-bar"><div class="wt-bar-fill" style="width:${progressPct()}%"></div></div>
        <p class="wt-instruction">${tip}</p>
        <section class="wt-play-area">
          <div class="wt-pic-wrap">
            <img class="wt-pic" src="${item.image}" alt="Classroom object" draggable="false">
          </div>
          <p class="wt-question">${question}</p>
          ${
            isName
              ? `<div class="wt-input-wrap">
            <input type="text" id="wt-input" class="wt-input"
              placeholder="It's a …"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
          </div>`
              : `<div class="wt-letters" id="wt-letters">${letterBoxesHtml}</div>`
          }
          <div class="wt-actions">
            <button type="button" class="wt-btn" id="wt-check" disabled>Check</button>
            <button type="button" class="wt-skip" id="wt-skip">Skip →</button>
          </div>
        </section>`;

      document.getElementById("wt-back").onclick = (e) => {
        e.preventDefault();
        stopAudio();
        phase = "menu";
        render();
      };
      const checkBtn = document.getElementById("wt-check");
      checkBtn.onclick = checkAnswer;
      document.getElementById("wt-skip").onclick = skipAnswer;

      if (isName) {
        const input = document.getElementById("wt-input");
        input.focus();
        const sync = () => {
          checkBtn.disabled = !input.value.trim();
        };
        input.addEventListener("input", sync);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") checkAnswer();
        });
      } else {
        const boxes = Array.from(app.querySelectorAll(".wt-letter"));
        const syncCheck = () => {
          checkBtn.disabled = !allSpellFilled();
        };
        boxes.forEach((box, i) => {
          box.addEventListener("input", (e) => {
            let v = (box.value || "").replace(/[^a-zA-Z]/g, "");
            if (v.length > 1) v = v.slice(-1);
            box.value = v.toUpperCase();
            if (v && i < boxes.length - 1) boxes[i + 1].focus();
            syncCheck();
          });
          box.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
              if (!box.value && i > 0) {
                e.preventDefault();
                boxes[i - 1].focus();
                boxes[i - 1].value = "";
                syncCheck();
              }
            } else if (e.key === "ArrowLeft" && i > 0) {
              e.preventDefault();
              boxes[i - 1].focus();
            } else if (e.key === "ArrowRight" && i < boxes.length - 1) {
              e.preventDefault();
              boxes[i + 1].focus();
            } else if (e.key === "Enter") {
              e.preventDefault();
              checkAnswer();
            }
          });
          // Paste support: fill consecutive boxes
          box.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData)
              .getData("text")
              .replace(/[^a-zA-Z]/g, "")
              .toUpperCase();
            if (!text) return;
            for (let j = 0; j < text.length && i + j < boxes.length; j++) {
              boxes[i + j].value = text[j];
            }
            const next = Math.min(i + text.length, boxes.length - 1);
            boxes[next].focus();
            syncCheck();
          });
        });
        if (boxes[0]) boxes[0].focus();
        syncCheck();
      }
      return;
    }

    // feedback
    const nextLabel = step === "name"
      ? "Spell it →"
      : (index < order.length - 1 ? "Next →" : "See results →");

    app.innerHTML = `
      <header class="wt-topbar">
        <a class="wt-back" href="#" id="wt-back" aria-label="Back">←</a>
        <span class="wt-title">${question}</span>
        <span class="wt-progress">${progressLabel()}</span>
      </header>
      <div class="wt-bar"><div class="wt-bar-fill" style="width:${progressPct()}%"></div></div>
      <section class="wt-feedback ${lastCorrect ? "is-correct" : lastSkipped ? "is-skip" : "is-wrong"}">
        <div class="wt-result-icon">${lastCorrect ? "✅" : lastSkipped ? "⏭️" : "❌"}</div>
        <h2>${lastCorrect ? "Correct!" : lastSkipped ? "Skipped" : "Not quite"}</h2>
        <div class="wt-answer-card">
          <img class="wt-answer-img" src="${item.image}" alt="${item.label}">
          <strong>${
            step === "name"
              ? item.nameAnswers[0].charAt(0).toUpperCase() + item.nameAnswers[0].slice(1)
              : spellTarget(item).toUpperCase().split("").join(" ")
          }</strong>
        </div>
        ${
          !lastSkipped
            ? `<p class="wt-your">You wrote: <em>${
                step === "spell" && lastUserInput
                  ? lastUserInput.toUpperCase().split("").join(" ")
                  : (lastUserInput || "—").trim() || "—"
              }</em></p>`
            : ""
        }
        <button type="button" class="wt-btn" id="wt-next">${nextLabel}</button>
      </section>`;

    document.getElementById("wt-back").onclick = (e) => {
      e.preventDefault();
      stopAudio();
      phase = "menu";
      render();
    };
    const nextBtn = document.getElementById("wt-next");
    nextBtn.onclick = advance;
    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      const card = app.querySelector(".wt-answer-card");
      setTimeout(() => spawnSparks(card), 80);
      playItemAudio();
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.6";
      autoTimer = setTimeout(() => advance(), 1100);
    }
  }

  render();
})();
