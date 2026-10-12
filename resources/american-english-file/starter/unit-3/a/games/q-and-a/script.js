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
    var _k = c[1] + "|" + c[2], _n = Date.now(); if (api._bk === _k && _n - (api._bt || 0) < 2500) return; api._bk = _k; api._bt = _n; var _old = document.querySelectorAll(".afx-burst"); for (var _i = 0; _i < _old.length; _i++) if (_old[_i].parentNode) _old[_i].parentNode.removeChild(_old[_i]); 
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
    snd: (function () {
      var lastT = 0;
      return {
        tap: function () { var n = Date.now(); if (n - lastT < 60) return; lastT = n; tone(880, 0.05, "sine", 0.06, 0); tone(1320, 0.04, "sine", 0.03, 0.02); },
        correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "triangle", 0.09, i * 0.07); }); tone(2093, 0.3, "sine", 0.03, 0.3); },
        wrong: function () { tone(311, 0.14, "sine", 0.09, 0); tone(233, 0.22, "triangle", 0.08, 0.1); },
        celebrate: function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.09, i * 0.08); }); tone(392, 0.7, "sine", 0.06, 0.1); }
      };
    })(),
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
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("button, [role=button], .mc-left-item, .mc-right-item") : null;
      if (t && !t.disabled) api.snd.tap();
    }, true);
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Ask & Answer – write question + answer · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-q-and-a";


  /* ---------- sound effects (Web Audio) ---------- */
  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function sfxTone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.1);
    sfxTone(659.25, t + 0.08, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.16, 0.16, "sine", 0.09);
  }).apply(this, arguments); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(220, t, 0.14, "sawtooth", 0.05, 140);
    sfxTone(180, t + 0.05, 0.14, "triangle", 0.04, 120);
  }).apply(this, arguments); }
  function sfxClick() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(720, ctx.currentTime, 0.045, "sine", 0.04);
  }).apply(this, arguments); }
  function sfxComplete() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.09);
    sfxTone(659.25, t + 0.1, 0.1, "triangle", 0.09);
    sfxTone(783.99, t + 0.2, 0.12, "triangle", 0.1);
    sfxTone(1046.5, t + 0.32, 0.22, "sine", 0.08);
  }).apply(this, arguments); }

  const ITEMS = [
    {
      id: "laptop",
      image: "https://cdn.imgurl.ir/uploads/i65362_laptop.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a laptop", "it is a laptop", "a laptop"],
      qLabel: "What is it?",
      aLabel: "It's a laptop.",
    },
    {
      id: "watches",
      image: "https://cdn.imgurl.ir/uploads/c5210_watches.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're watches", "they are watches", "watches"],
      qLabel: "What are they?",
      aLabel: "They're watches.",
    },
    {
      id: "coat",
      image: "https://cdn.imgurl.ir/uploads/i1932_coat.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a coat", "it is a coat", "a coat"],
      qLabel: "What is it?",
      aLabel: "It's a coat.",
    },
    {
      id: "keys",
      image: "https://cdn.imgurl.ir/uploads/o0639_keys.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're keys", "they are keys", "keys"],
      qLabel: "What are they?",
      aLabel: "They're keys.",
    },
    {
      id: "umbrella",
      image: "https://cdn.imgurl.ir/uploads/h825990_umbrella.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's an umbrella", "it is an umbrella", "an umbrella", "it's a umbrella", "a umbrella"],
      qLabel: "What is it?",
      aLabel: "It's an umbrella.",
    },
    {
      id: "id-card",
      image: "https://cdn.imgurl.ir/uploads/d612286_id-card.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's an id card", "it is an id card", "an id card", "it's a id card", "id card", "it's an identity card"],
      qLabel: "What is it?",
      aLabel: "It's an ID card.",
    },
    {
      id: "charger",
      image: "https://cdn.imgurl.ir/uploads/n93189_charger.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a charger", "it is a charger", "a charger"],
      qLabel: "What is it?",
      aLabel: "It's a charger.",
    },
    {
      id: "glasses",
      image: "https://cdn.imgurl.ir/uploads/b197798_gles.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're glasses", "they are glasses", "glasses"],
      qLabel: "What are they?",
      aLabel: "They're glasses.",
    },
    {
      id: "purse",
      image: "https://cdn.imgurl.ir/uploads/s138600_purse.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a purse", "it is a purse", "a purse", "it's a bag", "a bag"],
      qLabel: "What is it?",
      aLabel: "It's a purse.",
    },
    {
      id: "books",
      image: "https://cdn.imgurl.ir/uploads/i992666_books.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're books", "they are books", "books"],
      qLabel: "What are they?",
      aLabel: "They're books.",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.?!,]/g, "")
      .replace(/\s+/g, " ");
  }

  function matchAny(user, list) {
    const u = normalize(user);
    if (!u) return false;
    return list.some((a) => normalize(a) === u);
  }

  function start() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.slice());
    idx = 0;
    score = 0;
    locked = false;
    phase = "play";
    render();
  }

  function check() {
    if (locked) return;
    const qEl = document.getElementById("qa-q");
    const aEl = document.getElementById("qa-a");
    if (!qEl || !aEl) return;

    const qVal = qEl.value;
    const aVal = aEl.value;
    if (!normalize(qVal) && !normalize(aVal)) {
      qEl.focus();
      return;
    }

    locked = true;
    qEl.disabled = true;
    aEl.disabled = true;
    const btn = document.getElementById("qa-check");
    if (btn) btn.disabled = true;

    const item = order[idx];
    const qOk = matchAny(qVal, item.qAnswers);
    const aOk = matchAny(aVal, item.aAnswers);
    const both = qOk && aOk;

    if (qOk && aOk) sfxCorrect();
    else sfxWrong();
    if (qOk) qEl.classList.add("is-correct");
    else qEl.classList.add("is-wrong");
    if (aOk) aEl.classList.add("is-correct");
    else aEl.classList.add("is-wrong");

    if (both) score += 1;

    const fb = document.getElementById("qa-feedback");
    if (fb) {
      if (both) {
        fb.textContent = "Correct!";
        fb.className = "qa-feedback ok";
      } else {
        fb.innerHTML = item.qLabel + "<br>" + item.aLabel;
        fb.className = "qa-feedback bad";
      }
    }

    setTimeout(() => {
      if (idx < order.length - 1) {
        if (window.ArcadeFX && order.length >= 8 && idx + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (idx + 1) + " of " + order.length + " done");
        idx += 1;
        locked = false;
        render();
      } else {
        phase = "done";
        render();
      }
    }, both ? 900 : 1800);
  }

  function calcStars() {
    const t = ITEMS.length;
    if (score >= t - 1) return 3;
    if (score >= Math.ceil(t * 0.66)) return 2;
    if (score >= Math.ceil(t * 0.33)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Ask & Answer</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">❓</div>
          <h1>Ask & Answer</h1>
          <p class="mc-desc">Look at the picture. Write the question and the answer.</p>
          <div class="qa-menu-chips">
            <span class="qa-chip is-sing">What is it? → It's a…</span>
            <span class="qa-chip is-plur">What are they? → They're…</span>
          </div>
          <button type="button" class="mc-btn" id="qa-start">Start</button>
        </section>`;
      document.getElementById("qa-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => start(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u3a-again">Again</button>`;
      document.getElementById("u3a-again").onclick = () => start();
      return;
    }

    const item = order[idx];
    const typeClass = item.type === "plural" ? "is-plural" : "is-singular";

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Ask & Answer</span>
        <span class="mc-progress">${idx + 1} / ${order.length}</span>
      </header>
      <div class="qa-stage">
        <div class="qa-card ${typeClass}">
          <div class="qa-pic-wrap">
            <img class="qa-pic" src="${item.image}" alt="Look" draggable="false">
          </div>
          <div class="qa-fields">
            <label class="qa-label">Question</label>
            <input type="text" id="qa-q" class="qa-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="What is it? / What are they?" enterkeyhint="next">
            <label class="qa-label">Answer</label>
            <input type="text" id="qa-a" class="qa-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="It's a… / They're…" enterkeyhint="done">
          </div>
          <p class="qa-feedback" id="qa-feedback"></p>
        </div>
        <button type="button" class="mc-btn qa-check-btn" id="qa-check">Check</button>
      </div>`;

    document.getElementById("qa-check").onclick = () => check();
    const qEl = document.getElementById("qa-q");
    const aEl = document.getElementById("qa-a");
    qEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        aEl.focus();
      }
    });
    aEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    });
    setTimeout(() => qEl.focus(), 80);
  }

  render();
})();
