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
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class$="-track"],[class*="-bar-fill"],[class*="-track-fill"],[class*="-progress-fill"]')) return;
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

/* I'm from… → He's/She's + nationality · AEF Starter Unit 2A */
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


  const GAME_ID = "starter-2a-from-nationality";

  // Fixed order 1–16. Gender comes from the model answer audio.
  const ITEMS = [
    { id: 1,  fromAudio: "audio/from-01.mp3", natAudio: "audio/nat-01.mp3", country: "China",        answer: "He's Chinese",      answers: ["he's chinese", "he is chinese"] },
    { id: 2,  fromAudio: "audio/from-02.mp3", natAudio: "audio/nat-02.mp3", country: "Spain",        answer: "She's Spanish",     answers: ["she's spanish", "she is spanish"] },
    { id: 3,  fromAudio: "audio/from-03.mp3", natAudio: "audio/nat-03.mp3", country: "Japan",        answer: "He's Japanese",     answers: ["he's japanese", "he is japanese"] },
    { id: 4,  fromAudio: "audio/from-04.mp3", natAudio: "audio/nat-04.mp3", country: "Vietnam",      answer: "She's Vietnamese",  answers: ["she's vietnamese", "she is vietnamese"] },
    { id: 5,  fromAudio: "audio/from-05.mp3", natAudio: "audio/nat-05.mp3", country: "the US",       answer: "He's American",     answers: ["he's american", "he is american"] },
    { id: 6,  fromAudio: "audio/from-06.mp3", natAudio: "audio/nat-06.mp3", country: "Chile",        answer: "She's Chilean",     answers: ["she's chilean", "she is chilean"] },
    { id: 7,  fromAudio: "audio/from-07.mp3", natAudio: "audio/nat-07.mp3", country: "Argentina",    answer: "He's Argentinian",  answers: ["he's argentinian", "he is argentinian", "he's argentine", "he is argentine"] },
    { id: 8,  fromAudio: "audio/from-08.mp3", natAudio: "audio/nat-08.mp3", country: "Mexico",       answer: "She's Mexican",     answers: ["she's mexican", "she is mexican"] },
    { id: 9,  fromAudio: "audio/from-09.mp3", natAudio: "audio/nat-09.mp3", country: "England",      answer: "He's English",      answers: ["he's english", "he is english"] },
    { id: 10, fromAudio: "audio/from-10.mp3", natAudio: "audio/nat-10.mp3", country: "Turkey",       answer: "She's Turkish",     answers: ["she's turkish", "she is turkish"] },
    { id: 11, fromAudio: "audio/from-11.mp3", natAudio: "audio/nat-11.mp3", country: "Korea",        answer: "He's Korean",       answers: ["he's korean", "he is korean"] },
    { id: 12, fromAudio: "audio/from-12.mp3", natAudio: "audio/nat-12.mp3", country: "Canada",       answer: "She's Canadian",    answers: ["she's canadian", "she is canadian"] },
    { id: 13, fromAudio: "audio/from-13.mp3", natAudio: "audio/nat-13.mp3", country: "Brazil",       answer: "He's Brazilian",    answers: ["he's brazilian", "he is brazilian"] },
    { id: 14, fromAudio: "audio/from-14.mp3", natAudio: "audio/nat-14.mp3", country: "Peru",         answer: "She's Peruvian",    answers: ["she's peruvian", "she is peruvian"] },
    { id: 15, fromAudio: "audio/from-15.mp3", natAudio: "audio/nat-15.mp3", country: "Saudi Arabia", answer: "He's Saudi",        answers: ["he's saudi", "he is saudi"] },
    { id: 16, fromAudio: "audio/from-16.mp3", natAudio: "audio/nat-16.mp3", country: "the UK",       answer: "She's British",     answers: ["she's british", "she is british"] },
  ];

  const PART1 = ITEMS.slice(0, 8);  // 1–8
  const PART2 = ITEMS.slice(8);     // 9–16

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | tryagain | feedback | continue | done
  let part = 1;       // 1 or 2
  let order = [];
  let index = 0;
  let correctCount = 0;
  let part1Correct = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\bhe is\b/g, "he's")
      .replace(/\bshe is\b/g, "she's");
  }

  function isCorrectAnswer(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    return item.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playFromAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.fromAudio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function playNatAudio(then) {
    const item = order[index];
    if (!item) { if (then) then(); return; }
    stopAudio();
    const a = new Audio(item.natAudio);
    currentAudio = a;
    a.play().catch(() => { if (then) then(); });
    a.onended = () => {
      if (currentAudio === a) currentAudio = null;
      if (then) then();
    };
  }

  function startPart(p) {
    if (window.LAFinish) LAFinish.startTimer();
    part = p;
    order = p === 1 ? PART1.slice() : PART2.slice();
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
    setTimeout(playFromAudio, 350);
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrectAnswer(lastUserInput, item);
    stopAudio();

    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render();
      // Play model "He's/She's …" then auto-next
      playNatAudio(() => {
        setTimeout(() => nextItem(), 400);
      });
    } else {
      answered = false;
      phase = "tryagain";
      render();
    }
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    stopAudio();
    render();
    playNatAudio(() => {
      setTimeout(() => nextItem(), 400);
    });
  }

  function nextItem() {
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playFromAudio, 300);
    } else if (part === 1) {
      part1Correct = correctCount;
      if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — halfway there!");
      phase = "continue";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const total = part1Correct + correctCount; // out of 16 if finished both
    const n = phase === "done" ? total : correctCount;
    const max = phase === "done" ? 16 : 8;
    if (n >= max - 1) return 3;
    if (n >= Math.ceil(max * 0.65)) return 2;
    if (n >= Math.ceil(max * 0.4)) return 1;
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

  function progressHTML() {
    const total = order.length;
    const current = index + 1;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="lw-track" aria-hidden="true">
        <div class="lw-track-fill" style="width:${fill}%"></div>
      </div>
      <div class="lw-scoreline">
        <span class="lw-score">${correctCount} correct</span>
        <span class="lw-step">${current} / ${total}</span>
      </div>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from…</span>
          <span class="lw-badge">2A</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">🗣️</div>
          <h1>I'm from…</h1>
          <p class="lw-desc">Listen to <em>I'm from…</em><br>Write <strong>He's / She's + nationality</strong></p>
          <button type="button" class="lw-btn" id="lw-start">Start (1–8) →</button>
        </section>`;
      document.getElementById("lw-start").onclick = () => startPart(1);
      return;
    }

    if (phase === "continue") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from…</span>
          <span class="lw-badge">Part 1</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">👍</div>
          <h1>Part 1 complete</h1>
          <p>You got <strong>${correctCount} / 8</strong> correct.</p>
          <p class="lw-desc">Continue with 9–16?</p>
          <button type="button" class="lw-btn" id="lw-yes">Yes, continue →</button>
          <button type="button" class="lw-btn secondary" id="lw-stop">Finish here</button>
        </section>`;
      document.getElementById("lw-yes").onclick = () => startPart(2);
      document.getElementById("lw-stop").onclick = () => {
        phase = "done";
        render();
      };
      return;
    }

    if (phase === "done") {
      const totalCorrect = part === 2 ? part1Correct + correctCount : correctCount;
      const totalItems = part === 2 ? 16 : 8;
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: totalItems,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(1),
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = () => startPart(1);
      return;
    }

    const item = order[index];
    const progress = (index + 1) + " / " + order.length;
    const partLabel = part === 1 ? "1–8" : "9–16";

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from… · ${partLabel}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback is-wrong">
          <div class="lw-fb-icon">❌</div>
          <p class="lw-fb-msg">Try again</p>
          <p class="lw-fb-hint">You wrote: <em>${lastUserInput || "—"}</em></p>
          <button type="button" class="lw-btn" id="lw-retry">Try again</button>
        </section>`;
      document.getElementById("lw-retry").onclick = () => {
        answered = false;
        lastUserInput = "";
        phase = "play";
        render();
        setTimeout(playFromAudio, 250);
      };
      return;
    }

    if (phase === "feedback") {
      const msg = lastSkipped
        ? `Answer: <strong>${item.answer}</strong>`
        : `Correct! <strong>${item.answer}</strong>`;
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from… · ${partLabel}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback ${lastCorrect ? "is-correct" : "is-wrong"}">
          <div class="lw-fb-icon">${lastCorrect ? "✅" : "➡️"}</div>
          <p class="lw-fb-msg">${msg}</p>
        </section>`;
      return;
    }

    // play
    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">I'm from… · ${partLabel}</span>
        <span class="lw-progress">${progress}</span>
      </header>
      ${progressHTML()}
      <section class="lw-play-area">
        <p class="lw-instruction">Listen, then write <strong>He's / She's + nationality</strong></p>
        <button type="button" class="lw-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <div class="lw-input-wrap">
          <input type="text" id="lw-input" class="lw-input" placeholder="e.g. He's Chinese" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false">
        </div>
        <div class="lw-actions">
          <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
          <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
        </div>
      </section>`;
    const input = document.getElementById("lw-input");
    const checkBtn = document.getElementById("lw-check");
    input.focus();
    document.querySelector(".lw-play").onclick = playFromAudio;
    checkBtn.onclick = checkAnswer;
    document.getElementById("lw-skip").onclick = skipAnswer;
    input.oninput = () => { checkBtn.disabled = !input.value.trim(); };
    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim()) checkAnswer();
    };
  }

  render();
})();
