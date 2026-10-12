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

/* Listen & Write – 5 conversations, write the things you hear – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-listen-and-write";


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

  // The five short conversations in the audio. Players write the main "thing" heard.
  const ITEMS = [
    {
      id: 1,
      accepted: [
        "laptops", "laptop", "your laptops", "take out your laptops",
        "all laptops", "laptops out"
      ],
      display: "laptops"
    },
    {
      id: 2,
      accepted: [
        "cell phones", "cellphones", "cell phone", "cellphone",
        "phones", "mobile phones", "electronic devices",
        "cell phones and electronic devices", "turn off cell phones"
      ],
      display: "cell phones"
    },
    {
      id: 3,
      accepted: [
        "bag", "your bag", "is this your bag", "this bag"
      ],
      display: "bag"
    },
    {
      id: 4,
      accepted: [
        "passport", "your passport", "see your passport",
        "reservation", "a reservation"
      ],
      display: "passport"
    },
    {
      id: 5,
      accepted: [
        "key", "your key", "room key", "here's your key",
        "keys", "elevator", "the elevator"
      ],
      display: "key"
    }
  ];

  const AUDIO = "https://cdn.imgurl.ir/uploads/i5657_listening.mp3";
  const MAX_LISTENS = 3;
  const MAX_ATTEMPTS = 3;

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "play"; // play | done
  let listensLeft = MAX_LISTENS;
  let attemptsLeft = MAX_ATTEMPTS;
  let currentAudio = null;
  let values = ITEMS.map(() => "");
  let states = ITEMS.map(() => ({ correct: false, locked: false, checked: false }));
  let checkedOnce = false;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:"""()/]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(user, accepted) {
    const u = normalize(user);
    if (!u) return false;
    for (let i = 0; i < accepted.length; i++) {
      const a = normalize(accepted[i]);
      if (!a) continue;
      if (u === a || u.includes(a) || a.includes(u)) return true;
    }
    // flat version without spaces
    const uFlat = u.replace(/[\s\-]/g, "");
    for (let i = 0; i < accepted.length; i++) {
      const aFlat = normalize(accepted[i]).replace(/[\s\-]/g, "");
      if (aFlat && (uFlat === aFlat || uFlat.includes(aFlat) || aFlat.includes(uFlat))) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".mc-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    if (listensLeft <= 0 && !currentAudio) return;
    stopAudio();
    if (listensLeft > 0) listensLeft -= 1;
    const a = new Audio(AUDIO);
    currentAudio = a;
    const btn = app.querySelector(".mc-play");
    if (btn) {
      btn.classList.add("playing");
      if (listensLeft <= 0) btn.disabled = true;
    }
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      renderStats();
    };
    renderStats();
  }

  function renderStats() {
    const listensEl = app.querySelector("#lw-listens");
    const attemptsEl = app.querySelector("#lw-attempts");
    const hintEl = app.querySelector(".lw-audio-hint");
    if (listensEl) listensEl.textContent = listensLeft;
    if (attemptsEl) attemptsEl.textContent = attemptsLeft;
    if (hintEl) {
      hintEl.textContent = listensLeft > 0
        ? `Tap to play · ${listensLeft} listen${listensLeft === 1 ? "" : "s"} left`
        : "No listens left";
    }
  }

  function allFilled() {
    return values.every((v) => normalize(v).length > 0);
  }

  function checkAnswers() {
    if (attemptsLeft <= 0) return;
    if (!allFilled()) {
      const fb = app.querySelector(".lw-feedback");
      if (fb) {
        fb.className = "lw-feedback warn";
        fb.textContent = "Write something in every box first.";
      }
      return;
    }
    attemptsLeft -= 1;
    checkedOnce = true;
    let correctCount = 0;
    ITEMS.forEach((it, i) => {
      const ok = isCorrect(values[i], it.accepted);
      states[i].checked = true;
      states[i].correct = ok;
      if (ok) {
      sfxCorrect();
        states[i].locked = true;
        correctCount += 1;
      }
    });
    renderPlay();
    const fb = app.querySelector(".lw-feedback");
    if (correctCount === ITEMS.length) {
      if (fb) {
        fb.className = "lw-feedback ok";
        fb.textContent = "Perfect! All correct.";
      }
      setTimeout(() => {
        phase = "done";
        render();
      }, 900);
    } else if (attemptsLeft <= 0) {
      if (fb) {
        fb.className = "lw-feedback err";
        fb.textContent = `No attempts left. ${correctCount}/${ITEMS.length} correct.`;
      }
      // reveal remaining
      ITEMS.forEach((it, i) => {
        if (!states[i].correct) {
          values[i] = it.display;
          states[i].locked = true;
        }
      });
      setTimeout(() => {
        phase = "done";
        render();
      }, 1400);
    } else {
      if (fb) {
        fb.className = "lw-feedback warn";
        fb.textContent = `${correctCount}/${ITEMS.length} correct · ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left`;
      }
    }
  }

  function calcStars() {
    const correct = states.filter((s) => s.correct).length;
    if (correct >= 5) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
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

  function renderPlay() {
    const rows = ITEMS.map((it, i) => {
      const st = states[i];
      let cls = "lw-row";
      if (st.checked && st.correct) cls += " is-correct is-locked";
      else if (st.checked && !st.correct) cls += " is-wrong";
      if (st.locked) cls += " is-locked";
      const icon = st.checked ? (st.correct ? "✓" : "✗") : "";
      return `
        <div class="${cls}" data-idx="${i}">
          <span class="lw-num">${i + 1}</span>
          <input type="text" class="lw-input" data-idx="${i}"
            placeholder="Write sentence ${i + 1}..."
            value="${escapeAttr(values[i])}"
            ${st.locked ? "disabled" : ""}
            autocomplete="off" autocorrect="off" spellcheck="false" />
          <span class="lw-check-icon">${icon}</span>
        </div>`;
    }).join("");

    app.innerHTML = `
      <div class="mc-topbar">
        <a href="../" class="mc-back" aria-label="Back">←</a>
        <div class="mc-title-wrap">
          <span class="mc-unit">Unit 3A</span>
          <span class="mc-title">Listen &amp; Write</span>
        </div>
        <div class="mc-stats">
          <div class="mc-stat">
            <span class="mc-stat-label">Listens</span>
            <span class="mc-stat-value" id="lw-listens">${listensLeft}</span>
          </div>
          <div class="mc-stat">
            <span class="mc-stat-label">Attempts</span>
            <span class="mc-stat-value" id="lw-attempts">${attemptsLeft}</span>
          </div>
        </div>
      </div>

      <p class="mc-instruction">Listen to the 5 conversations and write the thing you hear in each one.</p>

      <div class="lw-audio">
        <button type="button" class="mc-play" id="lw-play" aria-label="Play audio" ${listensLeft <= 0 ? "disabled" : ""}>
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <span class="lw-audio-hint">Tap to play · ${listensLeft} listen${listensLeft === 1 ? "" : "s"} left</span>
      </div>

      <div class="lw-boxes">${rows}</div>

      <p class="lw-feedback"></p>

      <div class="lw-actions">
        <button type="button" class="mc-btn" id="lw-check" ${attemptsLeft <= 0 ? "disabled" : ""}>Check</button>
      </div>
    `;

    // events
    const playBtn = app.querySelector("#lw-play");
    if (playBtn) playBtn.onclick = () => playAudio();

    app.querySelectorAll(".lw-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const idx = +e.target.dataset.idx;
        values[idx] = e.target.value;
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkAnswers();
        }
      });
    });

    const checkBtn = app.querySelector("#lw-check");
    if (checkBtn) checkBtn.onclick = () => checkAnswers();
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderDone() {
    const stars = saveStars();
    const correct = states.filter((s) => s.correct).length;
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: correct,
        total: states.length,
        stars: stars,
        timeMs: timeMs,
        onAgain: () => {
          values = ITEMS.map(() => "");
          states = ITEMS.map(() => ({ correct: false, locked: false, checked: false }));
          checkedOnce = false;
          listensLeft = MAX_LISTENS;
          attemptsLeft = MAX_ATTEMPTS;
          phase = "play";
          if (window.LAFinish) LAFinish.startTimer();
          render();
        },
        onModes: () => {
          values = ITEMS.map(() => "");
          states = ITEMS.map(() => ({ correct: false, locked: false, checked: false }));
          checkedOnce = false;
          listensLeft = MAX_LISTENS;
          attemptsLeft = MAX_ATTEMPTS;
          phase = "play";
          render();
        },
        backHref: "../",
        save: false,
      });
      return;
    }
    // fallback uses original again button path
    const starHtml = [0, 1, 2].map((i) =>
      `<span class="star${i < stars ? " filled" : ""}">★</span>`
    ).join("");
    app.innerHTML = `<p>Done ${correct}/${states.length}</p><button type="button" id="lw-again">Again</button>`;
    document.getElementById("lw-again").onclick = () => {
      values = ITEMS.map(() => "");
      states = ITEMS.map(() => ({ correct: false, locked: false, checked: false }));
      checkedOnce = false;
      phase = "play";
      render();
    };
  }

  function render() {
    stopAudio();
    if (phase === "done") renderDone();
    else renderPlay();
  }

  // start
  render();
  // optional auto-play after short delay
  setTimeout(() => {
    if (phase === "play" && listensLeft === MAX_LISTENS) playAudio();
  }, 500);
})();
