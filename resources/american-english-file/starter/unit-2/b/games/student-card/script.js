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

/* Student Card – listen & complete · AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-student-card";
  const AUDIO_SRC = "https://cdn.imgurl.ir/uploads/t21916_conversation.mp3";

  const DIALOGUE = [
    { speaker: "Pia", text: "Who's he?" },
    { speaker: "Lin", text: "He's Alex. He's in my class." },
    { speaker: "Pia", text: "Where's he from?" },
    { speaker: "Lin", text: "He's from Mexico." },
    { speaker: "Pia", text: "How old is he?" },
    { speaker: "Lin", text: "He's 22, I think." },
    { speaker: "Pia", text: "He's very good-looking!" },
  ];

  const FIELDS = [
    {
      id: "name",
      label: "Name",
      accept: ["alex martinez", "alex martínez", "alex"],
      model: "Alex Martínez",
      // surname shown on card as Martínez — first name is Alex
    },
    {
      id: "nationality",
      label: "Nationality",
      accept: ["mexican", "mexico"],
      model: "Mexican",
    },
    {
      id: "age",
      label: "Age",
      accept: ["22", "twenty-two", "twenty two"],
      model: "22",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let currentAudio = null;
  let checked = false;
  let fieldOk = [false, false, false];

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchField(val, accept) {
    const n = norm(val);
    if (!n) return false;
    for (let i = 0; i < accept.length; i++) {
      if (n === norm(accept[i])) return true;
    }
    // allow "Alex Martinez" when accept has alex
    if (accept.some((a) => norm(a) === "alex") && n.indexOf("alex") === 0) {
      if (n === "alex" || n.indexOf("martinez") >= 0) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".sc-audio-btn.playing").forEach((b) =>
      b.classList.remove("playing")
    );
  }

  function playAudio() {
    const btn = app.querySelector(".sc-audio-btn");
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

  function calcStars(n) {
    if (n >= 3) return 3;
    if (n >= 2) return 2;
    if (n >= 1) return 1;
    return 0;
  }

  function saveStars(n) {
    const stars = calcStars(n);
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function dialogueHTML() {
    return DIALOGUE.map(
      (line) =>
        '<div class="sc-line"><span class="sc-speaker">' +
        line.speaker +
        '</span><span class="sc-speech">' +
        line.text +
        "</span></div>"
    ).join("");
  }

  function check() {
    const results = FIELDS.map((f, i) => {
      const inp = document.getElementById("sc-" + f.id);
      return matchField(inp ? inp.value : "", f.accept);
    });
    fieldOk = results;

    let all = true;
    results.forEach((ok, i) => {
      const wrap = document.querySelector(
        '.sc-field[data-id="' + FIELDS[i].id + '"]'
      );
      const inp = document.getElementById("sc-" + FIELDS[i].id);
      if (!wrap || !inp) return;
      wrap.classList.remove("is-ok", "is-bad");
      wrap.classList.add(ok ? "is-ok" : "is-bad");
      // clear old models
      const old = wrap.querySelector(".sc-model");
      if (old) old.remove();
      if (!ok) { try{sfxWrong();}catch(e){}
        all = false;
        const m = document.createElement("span");
        m.className = "sc-model";
        m.textContent = FIELDS[i].model;
        wrap.appendChild(m);
      }
    });

    const hint = document.getElementById("sc-hint");
    if (all) {
      checked = true;
      FIELDS.forEach((f) => {
        const inp = document.getElementById("sc-" + f.id);
        if (inp) inp.disabled = true;
      });
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("sc-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Perfect!";
      }
      setTimeout(() => {
        phase = "done";
        render();
      }, 800);
    } else {
      if (hint) {
        hint.textContent = "Not quite — try again!";
        hint.classList.add("is-visible");
      }
      // focus first wrong
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) {
          const inp = document.getElementById("sc-" + FIELDS[i].id);
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
    fieldOk = [false, false, false];
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="sc-topbar">' +
        '<a class="sc-back" href="../" aria-label="Back">←</a>' +
        '<span class="sc-title">Student Card</span>' +
        '<span class="sc-badge">2B</span>' +
        "</header>" +
        '<section class="sc-start">' +
        '<div class="sc-hero" aria-hidden="true">🪪</div>' +
        "<h1>Student Identity Card</h1>" +
        '<p class="sc-desc">Listen to the conversation.<br>Complete the information on the card.</p>' +
        '<button type="button" class="sc-btn" id="sc-start">Start →</button>' +
        "</section>";
      document.getElementById("sc-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const stars = saveStars(3);
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: fieldOk.filter(Boolean).length,
          total: fieldOk.length,
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

    // play
    app.innerHTML =
      '<header class="sc-topbar">' +
      '<a class="sc-back" href="../" aria-label="Back">←</a>' +
      '<span class="sc-title">Student Card</span>' +
      '<span class="sc-badge">2.13</span>' +
      "</header>" +
      '<div class="sc-play">' +
      '<div class="sc-conv">' +
      '<div class="sc-conv-head">' +
      '<button type="button" class="sc-audio-btn" id="sc-audio" aria-label="Play conversation">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      "<h2>Conversation</h2>" +
      "</div>" +
      '<div class="sc-conv-body">' +
      dialogueHTML() +
      "</div>" +
      "</div>" +
      '<div class="sc-card" aria-label="INTERNATIONAL STUDENT IDENTITY CARD">' +
      '<div class="sc-card-banner">INTERNATIONAL STUDENT IDENTITY CARD</div>' +
      '<div class="sc-card-body">' +
      '<div class="sc-photo" aria-label="Student photo">' +
      '<img src="https://cdn.imgurl.ir/uploads/c05508_alex.png" alt="Alex Martínez" class="sc-photo-img" draggable="false" />' +
      "</div>" +
      '<div class="sc-fields">' +
      FIELDS.map(
        (f) =>
          '<div class="sc-field" data-id="' +
          f.id +
          '">' +
          '<label for="sc-' +
          f.id +
          '">' +
          f.label +
          "</label>" +
          '<input type="text" id="sc-' +
          f.id +
          '" class="sc-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…" />' +
          "</div>"
      ).join("") +
      "</div>" +
      "</div>" +
      "</div>" +
      '<p class="sc-hint" id="sc-hint" aria-live="polite"></p>' +
      '<div class="sc-actions"><button type="button" class="sc-btn" id="sc-check">Check</button></div>' +
      "</div>";

    document.getElementById("sc-audio").onclick = playAudio;
    document.getElementById("sc-check").onclick = check;

    app.querySelectorAll(".sc-input").forEach((inp, i, list) => {
      inp.addEventListener("input", () => {
        const field = inp.closest(".sc-field");
        if (field) {
          field.classList.remove("is-ok", "is-bad");
          const m = field.querySelector(".sc-model");
          if (m) m.remove();
        }
        const hint = document.getElementById("sc-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (i < list.length - 1) list[i + 1].focus();
          else document.getElementById("sc-check")?.click();
        }
      });
    });
    document.getElementById("sc-name")?.focus();
  }

  render();
})();
