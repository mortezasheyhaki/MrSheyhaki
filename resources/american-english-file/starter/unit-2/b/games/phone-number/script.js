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

/* Phone Number – listen & complete · AEF Starter Unit 2B */
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
  function sfxTap() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () { tone(520, 0.06, "triangle", 0.08); })(); }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  })(); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  })(); }
  function sfxCelebrate() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  })(); }
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


  const GAME_ID = "starter-2b-phone-number";
  const AUDIO_SRC = "https://cdn.imgurl.ir/uploads/q61987_phone-number.mp3";

  // Target: 212-555-0375
  // Template from book-style: 2 □ 2 - □ □ 5 - 0 □ □ □
  // Pre-filled: pos 0:2, 2:2, 5:5, 6:0
  // Blanks (user fills): 1, 3, 4, 7, 8, 9  → values 1,5,5,3,7,5
  const DIGITS = [
    { val: "2", locked: true },
    { val: "1", locked: false },
    { val: "2", locked: true },
    { val: "-", locked: true, sep: true },
    { val: "5", locked: false },
    { val: "5", locked: false },
    { val: "5", locked: true },
    { val: "-", locked: true, sep: true },
    { val: "0", locked: true },
    { val: "3", locked: false },
    { val: "7", locked: false },
    { val: "5", locked: false },
  ];

  const BLANK_INDEXES = DIGITS.map((d, i) => (!d.locked && !d.sep ? i : -1)).filter((i) => i >= 0);

  const app = document.getElementById("game-app");
  if (!app) return;

  let lastCorrectCount = 0;
  let phase = "menu";
  let currentAudio = null;
  let checked = false;

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".pn-audio-btn.playing").forEach((b) =>
      b.classList.remove("playing")
    );
  }

  function playAudio() {
    const btn = app.querySelector(".pn-audio-btn");
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(AUDIO_SRC);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function calcStars(correctCount, total) {
    if (correctCount >= total) return 3;
    if (correctCount >= Math.ceil(total * 0.66)) return 2;
    if (correctCount >= 1) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function getUserDigits() {
    return BLANK_INDEXES.map((idx) => {
      const inp = document.getElementById("pn-d" + idx);
      return inp ? String(inp.value || "").trim() : "";
    });
  }

  function check() {
    const expected = BLANK_INDEXES.map((idx) => DIGITS[idx].val);
    const user = getUserDigits();
    let allOk = true;
    let correctCount = 0;

    BLANK_INDEXES.forEach((idx, i) => {
      const wrap = document.querySelector('.pn-digit[data-idx="' + idx + '"]');
      const inp = document.getElementById("pn-d" + idx);
      if (!wrap || !inp) return;
      const ok = user[i] === expected[i];
      wrap.classList.remove("is-ok", "is-bad");
      wrap.classList.add(ok ? "is-ok" : "is-bad");
      if (ok) { try{sfxCorrect();}catch(e){}
        correctCount++; lastCorrectCount = correctCount;
        inp.disabled = true;
      } else {
        allOk = false;
      }
    });

    const hint = document.getElementById("pn-hint");
    if (allOk) {
      checked = true;
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("pn-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Perfect!";
      }
      setTimeout(() => {
        phase = "done";
        render(correctCount);
      }, 700);
    } else {
      if (hint) {
        hint.textContent = "Not quite — listen again and try!";
        hint.classList.add("is-visible");
      }
      // focus first wrong
      for (let i = 0; i < user.length; i++) {
        if (user[i] !== expected[i]) {
          const inp = document.getElementById("pn-d" + BLANK_INDEXES[i]);
          if (inp) {
            inp.focus();
            inp.select();
          }
          break;
        }
      }
    }
  }

  function start() {
    stopAudio();
    checked = false;
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function render(correctCount) {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="pn-topbar">' +
        '<a class="pn-back" href="../" aria-label="Back">←</a>' +
        '<span class="pn-title">Phone Number</span>' +
        '<span class="pn-badge">2B</span>' +
        "</header>" +
        '<section class="pn-start">' +
        '<div class="pn-hero" aria-hidden="true">📱</div>' +
        "<h1>Listen &amp; Complete</h1>" +
        '<p class="pn-desc">Listen to the phone number.<br>Fill in the missing digits.</p>' +
        '<button type="button" class="pn-btn" id="pn-start">Start →</button>' +
        "</section>";
      document.getElementById("pn-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const total = typeof ITEMS !== 'undefined' ? ITEMS.length : (lastCorrectCount || 10);
      const stars = saveStars(calcStars(lastCorrectCount || total, total));
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: lastCorrectCount,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    // play phase
    const digitsHTML = DIGITS.map((d, i) => {
      if (d.sep) {
        return '<span class="pn-sep">–</span>';
      }
      if (d.locked) {
        return (
          '<div class="pn-digit locked" data-idx="' +
          i +
          '"><span class="pn-fixed">' +
          d.val +
          "</span></div>"
        );
      }
      return (
        '<div class="pn-digit" data-idx="' +
        i +
        '">' +
        '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="pn-d' +
        i +
        '" class="pn-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Digit" />' +
        "</div>"
      );
    }).join("");

    app.innerHTML =
      '<header class="pn-topbar">' +
      '<a class="pn-back" href="../" aria-label="Back">←</a>' +
      '<span class="pn-title">Phone Number</span>' +
      '<span class="pn-badge">2.19</span>' +
      "</header>" +
      '<div class="pn-play">' +
      '<div class="pn-audio-wrap">' +
      '<button type="button" class="pn-audio-btn" id="pn-audio" aria-label="Play the phone number">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<p class="pn-listen-label">Tap to listen</p>' +
      "</div>" +
      '<p class="pn-instruction">Listen and complete the phone number.</p>' +
      '<div class="pn-number" role="group" aria-label="Phone number">' +
      digitsHTML +
      "</div>" +
      '<p class="pn-hint" id="pn-hint" aria-live="polite"></p>' +
      '<div class="pn-actions"><button type="button" class="pn-btn" id="pn-check">Check</button></div>' +
      "</div>";

    document.getElementById("pn-audio").onclick = playAudio;
    document.getElementById("pn-check").onclick = check;

    // Auto-advance focus on digit entry
    const inputs = BLANK_INDEXES.map((idx) => document.getElementById("pn-d" + idx)).filter(Boolean);
    inputs.forEach((inp, i) => {
      inp.addEventListener("input", (e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 1);
        e.target.value = v;
        const wrap = e.target.closest(".pn-digit");
        if (wrap) {
          wrap.classList.remove("is-ok", "is-bad");
        }
        const hint = document.getElementById("pn-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
        if (v && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value && i > 0) {
          inputs[i - 1].focus();
        }
        if (e.key === "Enter") {
          e.preventDefault();
          document.getElementById("pn-check")?.click();
        }
      });
      // Allow paste of full number
      inp.addEventListener("paste", (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        if (!paste) return;
        let j = i;
        for (let k = 0; k < paste.length && j < inputs.length; k++, j++) {
          inputs[j].value = paste[k];
        }
        if (j < inputs.length) inputs[j].focus();
        else inputs[inputs.length - 1].focus();
      });
    });

    if (inputs[0]) inputs[0].focus();
  }

  render();
})();
