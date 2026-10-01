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

/* Classroom Language Write – look at the scene, write the phrase · PE1 */
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


  const GAME_ID = "starter-pe1-classroom-language-write";

  const ITEMS = [
    { id: "look-board", label: "Look at the board, please.",
      image: "https://cdn.imgurl.ir/uploads/p826615_look-at-the-board.png", audio: "https://cdn.imgurl.ir/uploads/t63176_look-at-the-board.mp3",
      answers: ["look at the board please", "look at the board, please", "look at the board"] },
    { id: "sorry-late", label: "Sorry, I'm late.",
      image: "https://cdn.imgurl.ir/uploads/e195266_sorry-im-late.png", audio: "https://cdn.imgurl.ir/uploads/u759904_sorry-im-late.mp3",
      answers: ["sorry im late", "sorry i'm late", "sorry i am late"] },
    { id: "dont-know", label: "I don't know.",
      image: "https://cdn.imgurl.ir/uploads/g105297_i-dont-know.png", audio: "https://cdn.imgurl.ir/uploads/v35496_i-dont-know.mp3",
      answers: ["i dont know", "i don't know", "i do not know"] },
    { id: "dont-under", label: "I don't understand.",
      image: "https://cdn.imgurl.ir/uploads/i965470_i-dont-understand.png", audio: "https://cdn.imgurl.ir/uploads/e84120_i-dont-understand.mp3",
      answers: ["i dont understand", "i don't understand", "i do not understand"] },
    { id: "gracias", label: "Excuse me, what's \"gracias\" in English?",
      image: "https://cdn.imgurl.ir/uploads/g788943_whats-gracias.png", audio: "https://cdn.imgurl.ir/uploads/o602381_whats-gracias.mp3",
      answers: [
        "excuse me whats gracias in english",
        "excuse me what's gracias in english",
        "excuse me what is gracias in english",
        "whats gracias in english",
        "what's gracias in english",
        "what is gracias in english"
      ] },
    { id: "repeat", label: "Sorry, can you repeat that, please?",
      image: "https://cdn.imgurl.ir/uploads/i846999_can-you-rep.png", audio: "https://cdn.imgurl.ir/uploads/t250762_can-you-rep.mp3",
      answers: [
        "sorry can you repeat that please",
        "sorry can you repeat that, please",
        "can you repeat that please",
        "can you repeat that",
        "sorry can you repeat that"
      ] },
    { id: "spell", label: "How do you spell it?",
      image: "https://cdn.imgurl.ir/uploads/z267726_how-do-you-spell-it.png", audio: "https://cdn.imgurl.ir/uploads/p668959_how-do-you-spell-it.mp3",
      answers: ["how do you spell it"] },
    { id: "sit", label: "Sit down.",
      image: "https://cdn.imgurl.ir/uploads/e602807_sit-down.png", audio: "https://cdn.imgurl.ir/uploads/r83490_sit-down.mp3",
      answers: ["sit down", "sit down please", "sit down, please"] },
    { id: "stand", label: "Stand up, please.",
      image: "https://cdn.imgurl.ir/uploads/m612408_stand-up.png", audio: "https://cdn.imgurl.ir/uploads/562935_stand-up.mp3",
      answers: ["stand up please", "stand up, please", "stand up"] },
    { id: "close", label: "Close your books.",
      image: "https://cdn.imgurl.ir/uploads/v60268_close-your-books.png", audio: "https://cdn.imgurl.ir/uploads/q78409_close-your-books.mp3",
      answers: ["close your books", "close your book"] },
    { id: "page", label: "Go to page ten.",
      image: "https://cdn.imgurl.ir/uploads/y887190_go-to-page.png", audio: "https://cdn.imgurl.ir/uploads/e185615_go-to-page.mp3",
      answers: ["go to page ten", "go to page 10"] },
    { id: "open", label: "Open your books.",
      image: "https://cdn.imgurl.ir/uploads/e652197_open-your-books.png", audio: "https://cdn.imgurl.ir/uploads/b36642_open-your-books.mp3",
      answers: ["open your books", "open your book"] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
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
      .replace(/[’']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    return item.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playItemAudio(item) {
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function clearAuto() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    clearAuto();
    order = shuffle(ITEMS);
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("cw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrect(lastUserInput, item);
    if (lastCorrect) correctCount += 1;
    answered = true;
    stopAudio();
    if (input) {
      input.classList.add(lastCorrect ? "cw-ok" : "cw-bad");
      input.blur();
    }
    const checkBtn = document.getElementById("cw-check");
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
    answered = true;
    stopAudio();
    phase = "feedback";
    render();
  }

  function nextItem() {
    clearAuto();
    if (index < order.length - 1) {
      if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
      index += 1;
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
    const n = correctCount;
    const total = ITEMS.length;
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
      s.className = "cw-spark";
      const angle = (i / 10) * Math.PI * 2;
      const dist = 32 + Math.random() * 22;
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      s.style.setProperty("--delay", (i * 0.02) + "s");
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }

  function render() {
    clearAuto();

    if (phase === "menu") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="../" aria-label="Back">←</a>
          <span class="cw-title">Classroom Language Write</span>
          <span class="cw-badge">PE1</span>
        </header>
        <section class="cw-start">
          <div class="cw-hero" aria-hidden="true">💬</div>
          <h1>Classroom Language</h1>
          <p class="cw-desc">Look at the scene and write the phrase.<br>12 classroom language sentences</p>
          <button type="button" class="cw-btn" id="cw-start">Start →</button>
        </section>`;
      document.getElementById("cw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: ITEMS.length,
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
    const progress = `${index + 1} / ${order.length}`;
    const pct = phase === "feedback"
      ? ((index + 1) / order.length) * 100
      : (index / order.length) * 100;

    if (phase === "play") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="#" id="cw-back" aria-label="Back">←</a>
          <span class="cw-title">Write the phrase</span>
          <span class="cw-progress">${progress}</span>
        </header>
        <div class="cw-bar"><div class="cw-bar-fill" style="width:${pct}%"></div></div>
        <p class="cw-instruction">Look at the scene. What do they say?</p>
        <section class="cw-play-area">
          <div class="cw-pic-wrap cw-pic-wide">
            <img class="cw-pic" src="${item.image}" alt="Classroom scene" draggable="false">
          </div>
          <div class="cw-input-wrap">
            <input type="text" id="cw-input" class="cw-input"
              placeholder="Type the sentence…"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
          </div>
          <div class="cw-actions">
            <button type="button" class="cw-btn" id="cw-check" disabled>Check</button>
            <button type="button" class="cw-skip" id="cw-skip">Skip →</button>
          </div>
        </section>`;

      document.getElementById("cw-back").onclick = (e) => {
        e.preventDefault();
        stopAudio();
        phase = "menu";
        render();
      };
      const input = document.getElementById("cw-input");
      const checkBtn = document.getElementById("cw-check");
      input.focus();
      checkBtn.onclick = checkAnswer;
      document.getElementById("cw-skip").onclick = skipAnswer;
      const sync = () => { checkBtn.disabled = !input.value.trim(); };
      input.addEventListener("input", sync);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkAnswer();
      });
      return;
    }

    // feedback
    app.innerHTML = `
      <header class="cw-topbar">
        <a class="cw-back" href="#" id="cw-back" aria-label="Back">←</a>
        <span class="cw-title">Write the phrase</span>
        <span class="cw-progress">${progress}</span>
      </header>
      <div class="cw-bar"><div class="cw-bar-fill" style="width:${pct}%"></div></div>
      <section class="cw-feedback ${lastCorrect ? "is-correct" : lastSkipped ? "is-skip" : "is-wrong"}">
        <div class="cw-result-icon">${lastCorrect ? "✅" : lastSkipped ? "⏭️" : "❌"}</div>
        <h2>${lastCorrect ? "Correct!" : lastSkipped ? "Skipped" : "Not quite"}</h2>
        <div class="cw-answer-card">
          <img class="cw-answer-img" src="${item.image}" alt="">
          <strong>${item.label}</strong>
        </div>
        ${!lastSkipped ? `<p class="cw-your">You wrote: <em>${(lastUserInput || "—").trim() || "—"}</em></p>` : ""}
        <button type="button" class="cw-btn" id="cw-next">${index < order.length - 1 ? "Next →" : "See results →"}</button>
      </section>`;

    document.getElementById("cw-back").onclick = (e) => {
      e.preventDefault();
      stopAudio();
      phase = "menu";
      render();
    };
    const nextBtn = document.getElementById("cw-next");
    nextBtn.onclick = nextItem;
    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      const card = app.querySelector(".cw-answer-card");
      setTimeout(() => spawnSparks(card), 80);
      playItemAudio(item);
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.6";
      autoTimer = setTimeout(() => nextItem(), 1400);
    }
  }

  render();
})();
