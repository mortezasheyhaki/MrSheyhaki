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

/* Restaurant Booking – Locanda Verde · Starter PE1 */
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


  const GAME_ID = "starter-pe1-restaurant-booking";
  const AUDIO_SRC = "audio/booking.mp3";

  // Acceptable answers (normalized lowercase)
  const FIELDS = [
    {
      key: "day",
      label: "Day",
      answers: ["tuesday"],
      placeholder: "………",
    },
    {
      key: "people",
      label: "Table for",
      suffix: "people",
      answers: ["3", "three"],
      placeholder: "………",
    },
    {
      key: "time",
      label: "Time",
      suffix: "(o'clock)",
      answers: ["7", "seven"],
      placeholder: "………",
    },
    {
      key: "name",
      label: "Name",
      prefix: "Jenny Ziel",
      answers: ["inski", "zielinski"],
      placeholder: "………",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let locked = false;
  let audio = null;

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
      audio = null;
    }
    const btn = document.getElementById("rb-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    stopAudio();
    audio = new Audio(AUDIO_SRC);
    const btn = document.getElementById("rb-play");
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

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[.,]/g, "")
      .replace(/\s+/g, " ");
  }

  function showStart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    locked = false;
    app.innerHTML = `
      <header class="rb-topbar">
        <a class="rb-back" href="../" aria-label="Back">←</a>
        <span class="rb-title">Restaurant Booking</span>
        <span class="rb-badge">PE1</span>
      </header>
      <section class="rb-start">
        <div class="rb-hero rb-enter" style="--i:0">
          <div class="rb-icon">🍽️</div>
          <h1>Locanda Verde</h1>
          <p>Listen to the phone call.<br>
          Complete the booking form.</p>
        </div>
        <ul class="rb-preview">
          <li class="rb-enter" style="--i:1">Day</li>
          <li class="rb-enter" style="--i:2">Table for ___ people</li>
          <li class="rb-enter" style="--i:3">Time (o'clock)</li>
          <li class="rb-enter" style="--i:4">Name</li>
        </ul>
        <button type="button" class="rb-btn primary rb-enter" style="--i:5" id="rb-go">Start</button>
      </section>`;
    document.getElementById("rb-go").onclick = renderForm;
  }

  function renderForm() {
    stopAudio();
    locked = false;

    const rows = FIELDS.map((f) => {
      if (f.key === "name") {
        return `
          <div class="rb-row" data-key="${f.key}">
            <label class="rb-label" for="rb-${f.key}">${f.label}</label>
            <div class="rb-name-wrap">
              <span class="rb-prefix">${f.prefix}</span>
              <input type="text" class="rb-input rb-input-name" id="rb-${f.key}"
                autocomplete="off" autocorrect="off" spellcheck="false"
                placeholder="${f.placeholder}" maxlength="12">
            </div>
          </div>`;
      }
      return `
        <div class="rb-row" data-key="${f.key}">
          <label class="rb-label" for="rb-${f.key}">${f.label}</label>
          <div class="rb-field-wrap">
            <input type="text" class="rb-input" id="rb-${f.key}"
              autocomplete="off" autocorrect="off" spellcheck="false"
              placeholder="${f.placeholder}" maxlength="16">
            ${f.suffix ? `<span class="rb-suffix">${f.suffix}</span>` : ""}
          </div>
        </div>`;
    }).join("");

    app.innerHTML = `
      <header class="rb-topbar">
        <a class="rb-back" href="#" id="rb-back" aria-label="Back">←</a>
        <span class="rb-title">Complete the form</span>
        <span class="rb-badge">Listen</span>
      </header>
      <div class="rb-stage">
        <div class="rb-speaker-wrap rb-enter" style="--i:0">
          <button type="button" class="rb-play" id="rb-play" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <div class="rb-listen-hint">Tap to listen</div>
        </div>
        <div class="rb-card rb-enter" style="--i:1">
          <div class="rb-card-header">LOCANDA VERDE</div>
          <div class="rb-card-body">
            <h2 class="rb-card-title">Bookings</h2>
            ${rows}
          </div>
        </div>
        <div class="rb-feedback" id="rb-fb" hidden></div>
      </div>
      <div class="rb-controls rb-enter" style="--i:2">
        <button type="button" class="rb-btn primary" id="rb-check">Check</button>
      </div>`;

    document.getElementById("rb-back").onclick = (e) => {
      e.preventDefault();
      if (locked) return;
      showStart();
    };
    document.getElementById("rb-play").onclick = playAudio;
    document.getElementById("rb-check").onclick = onCheck;

    // Enter key submits
    app.querySelectorAll(".rb-input").forEach((inp) => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCheck();
        }
      });
    });

    setTimeout(playAudio, 400);
  }

  function onCheck() {
    if (locked) return;
    locked = true;
    stopAudio();

    let score = 0;
    const results = [];

    FIELDS.forEach((f) => {
      const input = document.getElementById("rb-" + f.key);
      const raw = input ? input.value : "";
      const val = normalize(raw);
      const ok = f.answers.some((a) => val === a || val.endsWith(a));
      if (ok) score++;
      results.push({ key: f.key, ok, correct: f.answers[0] });

      if (input) {
        input.disabled = true;
        input.classList.remove("ok", "bad");
        input.classList.add(ok ? "ok" : "bad");
      }
      const row = app.querySelector(`.rb-row[data-key="${f.key}"]`);
      if (row) {
        row.classList.remove("ok", "bad");
        row.classList.add(ok ? "ok" : "bad");
      }
    });

    const total = FIELDS.length;
    const fb = document.getElementById("rb-fb");
    if (fb) {
      fb.hidden = false;
      if (score === total) {
        fb.className = "rb-feedback ok rb-fb-in";
        fb.textContent = "Perfect! Form complete.";
      } else {
        fb.className = "rb-feedback warn rb-fb-in";
        fb.textContent = `You got ${score} / ${total} correct.`;
        // show correct answers for wrong ones
        const hints = results
          .filter((r) => !r.ok)
          .map((r) => {
            const f = FIELDS.find((x) => x.key === r.key);
            if (r.key === "name") return "Name: Jenny Zielinski";
            if (r.key === "day") return "Day: Tuesday";
            if (r.key === "people") return "Table for: 3";
            if (r.key === "time") return "Time: 7";
            return "";
          })
          .filter(Boolean);
        if (hints.length) {
          fb.innerHTML =
            `You got <strong>${score} / ${total}</strong> correct.<br>` +
            `<span class="rb-hints">${hints.join(" · ")}</span>`;
        }
      }
    }

    const checkBtn = document.getElementById("rb-check");
    if (checkBtn) {
      checkBtn.textContent = score === total ? "Continue" : "Try again";
      checkBtn.onclick = () => {
        if (score === total) showDone(score);
        else renderForm();
      };
    }

    if (score === total) {
      setTimeout(() => showDone(score), 1400);
    }
  }

  function showDone(score) {
    const stars = score === 4 ? 3 : score === 3 ? 2 : score >= 1 ? 1 : 0;
    saveStars(stars);
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: 4,
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
