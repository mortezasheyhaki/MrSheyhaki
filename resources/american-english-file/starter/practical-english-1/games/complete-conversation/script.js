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

/* Complete the Conversation – Starter PE1 classroom language */
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


  const GAME_ID = "starter-pe1-complete-conversation";

  const PARTS = [
    {
      id: 1,
      title: "In the classroom",
      audio: "audio/1.mp3",
      lines: [
        {
          speaker: "Teacher",
          segments: [
            { type: "blank", answer: ["open"], width: "5em" },
            { type: "text", text: " your books, please. " },
            { type: "blank", answer: ["go"], width: "3.5em" },
            { type: "text", text: " to page 7." },
          ],
        },
        {
          speaker: "Student",
          segments: [
            { type: "blank", answer: ["sorry"], width: "5em" },
            { type: "text", text: ", can you " },
            { type: "blank", answer: ["repeat"], width: "5.5em" },
            { type: "text", text: " that, please?" },
          ],
        },
        {
          speaker: "Teacher",
          segments: [{ type: "text", text: "Go to page 7." }],
        },
      ],
    },
    {
      id: 2,
      title: "How do you spell it?",
      audio: "audio/2.mp3",
      lines: [
        {
          speaker: "Student",
          segments: [
            { type: "blank", answer: ["excuse"], width: "5.5em" },
            { type: "text", text: " me. " },
            { type: "blank", answer: ["how"], width: "4em" },
            { type: "text", text: ' do you spell "birthday"?' },
          ],
        },
        {
          speaker: "Teacher",
          segments: [{ type: "text", text: "B-I-R-T-H-D-A-Y." }],
        },
      ],
    },
    {
      id: 3,
      title: "Sorry I'm late",
      audio: "audio/3.mp3",
      lines: [
        {
          speaker: "Student",
          segments: [
            { type: "blank", answer: ["sorry"], width: "5em" },
            { type: "text", text: " I'm late." },
          ],
        },
        {
          speaker: "Teacher",
          segments: [
            { type: "text", text: "That's OK. Sit " },
            { type: "blank", answer: ["down"], width: "4.5em" },
            { type: "text", text: ", please." },
          ],
        },
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let audio = null;
  let locked = false; // true while audio plays / transitioning

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[’']/g, "'");
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
      audio = null;
    }
  }

  function playPartAudio(src, onEnded) {
    stopAudio();
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      try {
        if (audio) {
          audio.onended = null;
          audio.onerror = null;
        }
      } catch (_) {}
      audio = null;
      if (onEnded) onEnded();
    };
    audio = new Audio(src);
    audio.onended = done;
    audio.onerror = done;
    // Safety net if play is blocked or file missing
    const safety = setTimeout(done, 16000);
    audio
      .play()
      .then(() => {
        if (audio && isFinite(audio.duration) && audio.duration > 0) {
          clearTimeout(safety);
          setTimeout(done, Math.ceil(audio.duration * 1000) + 600);
        }
      })
      .catch(() => {
        clearTimeout(safety);
        setTimeout(done, 900);
      });
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function showStart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    locked = false;
    partIndex = 0;
    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="../" aria-label="Back">←</a>
        <span class="cc-title">Complete the Conversation</span>
        <span class="cc-badge">PE1</span>
      </header>
      <section class="cc-start">
        <div class="cc-hero">
          <div class="cc-icon">💬</div>
          <h1>Complete the Conversation</h1>
          <p>Type the missing classroom language.<br>
          Check your answers, then listen to the full dialogue.</p>
        </div>
        <div class="cc-parts-preview">
          ${PARTS.map(
            (p, i) => `
            <div class="cc-preview-card">
              <span class="cc-preview-num">${i + 1}</span>
              <span class="cc-preview-title">${p.title}</span>
            </div>`
          ).join("")}
        </div>
        <button type="button" class="cc-btn primary" id="cc-start">Start</button>
      </section>`;
    document.getElementById("cc-start").onclick = () => {
      partIndex = 0;
      renderPart();
    };
  }

  function renderPart() {
    stopAudio();
    locked = false;
    const part = PARTS[partIndex];
    const total = PARTS.length;

    const dialogueHtml = part.lines
      .map((line, li) => {
        const segs = line.segments
          .map((seg, si) => {
            if (seg.type === "text") {
              return `<span class="cc-text">${escapeHtml(seg.text)}</span>`;
            }
            const id = `blank-${li}-${si}`;
            return `<input type="text" class="cc-blank" id="${id}"
              autocomplete="off" autocorrect="off" autocapitalize="off"
              spellcheck="false" data-answers="${seg.answer.join("|")}"
              style="width:${seg.width || "5em"}" aria-label="Missing word">`;
          })
          .join("");
        return `
          <div class="cc-line">
            <span class="cc-speaker">${escapeHtml(line.speaker)}</span>
            <div class="cc-utterance">${segs}</div>
          </div>`;
      })
      .join("");

    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="#" id="cc-back" aria-label="Back">←</a>
        <span class="cc-title">${escapeHtml(part.title)}</span>
        <span class="cc-badge">${partIndex + 1} / ${total}</span>
      </header>
      <div class="cc-stage">
        <p class="cc-hint">Fill in the blanks, then check.</p>
        <div class="cc-dialogue" id="cc-dialogue">
          ${dialogueHtml}
        </div>
        <div class="cc-feedback" id="cc-feedback" hidden></div>
      </div>
      <div class="cc-controls">
        <button type="button" class="cc-btn secondary" id="cc-skip">Skip</button>
        <button type="button" class="cc-btn primary" id="cc-check">Check</button>
      </div>`;

    document.getElementById("cc-back").onclick = (e) => {
      e.preventDefault();
      if (locked) return;
      showStart();
    };
    document.getElementById("cc-check").onclick = onCheck;
    document.getElementById("cc-skip").onclick = onSkip;

    // Focus first blank
    const first = app.querySelector(".cc-blank");
    if (first) setTimeout(() => first.focus(), 120);

    // Enter key submits
    app.querySelectorAll(".cc-blank").forEach((inp) => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCheck();
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getBlanks() {
    return Array.from(app.querySelectorAll(".cc-blank"));
  }

  function markBlank(inp, state) {
    inp.classList.remove("ok", "bad");
    if (state) inp.classList.add(state);
  }

  function checkAnswers() {
    const blanks = getBlanks();
    let allOk = true;
    blanks.forEach((inp) => {
      const accepted = (inp.dataset.answers || "").split("|").map(normalize);
      const user = normalize(inp.value);
      const ok = accepted.includes(user);
      markBlank(inp, ok ? "ok" : "bad");
      if (!ok) allOk = false;
    });
    return allOk;
  }

  function setFeedback(msg, kind) {
    const el = document.getElementById("cc-feedback");
    if (!el) return;
    el.hidden = false;
    el.className = "cc-feedback " + (kind || "");
    el.textContent = msg;
  }

  function lockControls(lock) {
    locked = lock;
    const check = document.getElementById("cc-check");
    const skip = document.getElementById("cc-skip");
    if (check) check.disabled = lock;
    if (skip) skip.disabled = lock;
    getBlanks().forEach((inp) => {
      inp.disabled = lock;
    });
  }

  function onCheck() {
    if (locked) return;
    const blanks = getBlanks();
    const empty = blanks.some((b) => !normalize(b.value));
    if (empty) {
      setFeedback("Please fill in all the blanks.", "warn");
      blanks.forEach((b) => {
        if (!normalize(b.value)) markBlank(b, "bad");
      });
      return;
    }

    const ok = checkAnswers();
    if (!ok) { try{sfxWrong();}catch(e){}
      setFeedback("Not quite — try again!", "bad");
      // Focus first wrong blank
      const firstBad = blanks.find((b) => b.classList.contains("bad"));
      if (firstBad) firstBad.focus();
      return;
    }

    // Correct
    setFeedback("Correct! Listen…", "ok");
    lockControls(true);
    const part = PARTS[partIndex];
    playPartAudio(part.audio, () => {
      // small pause then advance
      setTimeout(() => {
        if (partIndex >= PARTS.length - 1) {
          showDone();
        } else {
          partIndex++;
          renderPart();
        }
      }, 400);
    });
  }

  function onSkip() {
    if (locked) return;
    lockControls(true);
    setFeedback("Skipped — listen anyway…", "warn");
    const part = PARTS[partIndex];
    playPartAudio(part.audio, () => {
      setTimeout(() => {
        if (partIndex >= PARTS.length - 1) {
          showDone(true);
        } else {
          partIndex++;
          renderPart();
        }
      }, 400);
    });
  }

  function showDone(hadSkip) {
    const stars = 3;
    saveStars(3);
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: 10,
        total: 10,
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
