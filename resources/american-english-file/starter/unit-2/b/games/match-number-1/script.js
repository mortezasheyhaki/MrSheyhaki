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

/* Match Number 1 11–20 – 3 modes × 2 sets – AEF Starter Unit 2B
   Modes: Words ↔ Numbers | Audio ↔ Words | Audio ↔ Numbers
   Two sets of 5; auto-advance (no Next Round button)
*/
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


  const GAME_ID = "starter-2b-match-number-1";

  const ITEMS = [
    { id: "11", num: "11", word: "eleven", audio: "https://cdn.imgurl.ir/uploads/h791947_11.mp3" },
    { id: "12", num: "12", word: "twelve", audio: "https://cdn.imgurl.ir/uploads/h46631_12.mp3" },
    { id: "13", num: "13", word: "thirteen", audio: "https://cdn.imgurl.ir/uploads/o209826_13.mp3" },
    { id: "14", num: "14", word: "fourteen", audio: "https://cdn.imgurl.ir/uploads/u43290_14.mp3" },
    { id: "15", num: "15", word: "fifteen", audio: "https://cdn.imgurl.ir/uploads/e012004_15.mp3" },
    { id: "16", num: "16", word: "sixteen", audio: "https://cdn.imgurl.ir/uploads/a742_16.mp3" },
    { id: "17", num: "17", word: "seventeen", audio: "https://cdn.imgurl.ir/uploads/n235443_17.mp3" },
    { id: "18", num: "18", word: "eighteen", audio: "https://cdn.imgurl.ir/uploads/v36087_18.mp3" },
    { id: "19", num: "19", word: "nineteen", audio: "https://cdn.imgurl.ir/uploads/e896460_19.mp3" },
    { id: "20", num: "20", word: "twenty", audio: "https://cdn.imgurl.ir/uploads/h0809_20.mp3" },
  ];

  // 2 fixed sets of 5
  const SETS = [
    ["11", "12", "13", "14", "15"],
    ["16", "17", "18", "19", "20"],
  ];

  const MODES = [
    {
      id: "words-nums",
      title: "Words → Numbers",
      left: "word",
      right: "num",
      tip: "Match each word to its number.",
    },
    {
      id: "audio-words",
      title: "Audio → Words",
      left: "audio",
      right: "word",
      tip: "Listen, then match the word.",
    },
    {
      id: "audio-nums",
      title: "Audio → Numbers",
      left: "audio",
      right: "num",
      tip: "Listen, then match the number.",
    },
  ];

  const TOTAL_PAIRS = MODES.length * SETS.reduce(function (n, set) { return n + set.length; }, 0);
  if (window.ArcadeFX) ArcadeFX.track = function () {
    var per = SETS.reduce(function (n, set) { return n + set.length; }, 0), done = 0;
    SETS.forEach(function (set, i) { if (i < setIndex) done += set.length; });
    return Math.round(((modeIndex * per + done + correctCount()) / TOTAL_PAIRS) * 100);
  };
  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu";
  let totalCorrect = 0, wrongCount = 0;
  let setIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let locked = {};
  let matches = {};
  let selectedLeft = null;
  let currentAudio = null;
  let playingLeft = null;
  let setCorrect = 0;
  let modeCorrect = 0;

  function byId(id) {
    return ITEMS.find((c) => c.id === id);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    playingLeft = null;
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudioFor(leftIndex) {
    const id = leftOrder[leftIndex];
    const c = byId(id);
    if (!c || !c.audio) return;

    if (playingLeft === leftIndex && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    playingLeft = leftIndex;
    const btn = app.querySelector('.mc-play[data-i="' + leftIndex + '"]');
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      playingLeft = null;
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (playingLeft === leftIndex) playingLeft = null;
      currentAudio = null;
    };
  }

  function startMode(mi) {
    if (window.LAFinish && mi === 0) LAFinish.startTimer();
    if (mi === 0) { totalCorrect = 0; wrongCount = 0; }
    modeIndex = mi;
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    const ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    locked = {};
    matches = {};
    selectedLeft = null;
    setCorrect = 0;
    stopAudio();
    phase = "play";
    render();
  }

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach((el) => {
      if (!el) return;
      el.classList.add("mc-match-pop");
      for (let i = 0; i < 8; i++) {
        const s = document.createElement("span");
        s.className = "mc-spark";
        const angle = (i / 8) * Math.PI * 2;
        const dist = 28 + Math.random() * 18;
        s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        s.style.setProperty("--delay", i * 0.02 + "s");
        el.appendChild(s);
        setTimeout(() => s.remove(), 700);
      }
      setTimeout(() => el.classList.remove("mc-match-pop"), 550);
    });
    const flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === 5;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    const mode = MODES[modeIndex];
    if (mode.left === "audio") {
      playAudioFor(i);
    }
  }

  function selectRight(rightId) {
    if (selectedLeft === null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        const mode = MODES[modeIndex];
        hint.textContent =
          mode.left === "audio"
            ? "Play a sound first, then tap a match."
            : "Tap a word on the left first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(() => hint.classList.remove("mc-hint-warn"), 1200);
      }
      return;
    }
    const used = Object.keys(locked).some((li) => matches[li] === rightId);
    if (used) return;

    const leftId = leftOrder[selectedLeft];
    const ok = leftId === rightId;
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (ok) { try{sfxCorrect();}catch(e){}
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      setCorrect += 1;
      modeCorrect += 1;
      totalCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      spawnMatchFX(leftEl, rightEl);
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));

      // Post-match audio only for Words → Numbers (other modes already use audio)
      if (MODES[modeIndex].left === "word") {
        const matched = byId(leftId);
        if (matched && matched.audio) {
          stopAudio();
          const a = new Audio(matched.audio);
          currentAudio = a;
          a.play().catch(function () {});
          a.onended = function () {
            if (currentAudio === a) currentAudio = null;
          };
        }
      }

      const prog = document.getElementById("mc-progress");
      if (prog) prog.textContent = "Part " + (modeIndex + 1) + "/" + MODES.length + " · Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + SETS[setIndex].length;

      if (allMatched()) {
        const delay = MODES[modeIndex].left === "word" ? 1200 : 700;
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else if (modeIndex < MODES.length - 1) {
            // part finished → pop-up, then straight into the next part
            if (window.ArcadeFX) ArcadeFX.cheer(modeIndex, MODES.length);
            setTimeout(() => startMode(modeIndex + 1), 1700);
          } else {
            if (window.ArcadeFX) ArcadeFX.cheer(modeIndex, MODES.length);
            phase = "done";
            render();
          }
        }, delay);
      }
    } else {
      wrongCount += 1;
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong", "is-selected");
        if (rightEl) rightEl.classList.remove("is-wrong");
        selectedLeft = null;
      }, 650);
    }
  }

  function leftCell(id, i, leftType) {
    const c = byId(id);
    const isLocked = !!locked[i];
    const isSel = selectedLeft === i;
    const ok = isLocked ? " is-correct" : "";
    const sel = isSel ? " is-selected" : "";

    if (leftType === "audio") {
      return (
        '<div class="mc-left-item mc-audio-cell' + ok + sel + '" data-i="' + i + '">' +
        '<button type="button" class="mc-play" data-i="' + i + '" aria-label="Play" ' +
        (isLocked ? "disabled" : "") +
        ">" +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        "</div>"
      );
    }
    // word
    return (
      '<div class="mc-left-item mc-word-left' + ok + sel + '" data-i="' + i + '">' +
      '<span class="mc-word-label">' + c.word + "</span>" +
      "</div>"
    );
  }

  function rightCell(id) {
    const c = byId(id);
    const mode = MODES[modeIndex];
    const used = Object.keys(locked).some((li) => matches[li] === id);
    const label = mode.right === "num" ? c.num : c.word;
    return (
      '<button type="button" class="mc-right-item mc-word' +
      (used ? " is-correct is-used" : "") +
      '" data-id="' + id + '"' +
      (used ? " disabled" : "") +
      ">" +
      '<span class="mc-word-label">' + label + "</span>" +
      "</button>"
    );
  }

  function calcStars() {
    // Stars come from accuracy: correct matches / all match attempts
    var attempts = totalCorrect + wrongCount;
    if (totalCorrect < TOTAL_PAIRS || attempts === 0) return 0;
    var acc = totalCorrect / attempts;
    return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function render() {
    stopAudio();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Number 1</span>' +
        '<span class="mc-badge">2B</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">🔢</div>' +
        "<h1>Match Number 1</h1>" +
        '<p class="mc-desc">Numbers 11–20 · two sets of five<br>3 parts, one after another</p>' +
        '<div class="mc-mode-list">' +
        MODES.map(
          (m, i) =>
            '<div class="mc-mode-card"><span class="mc-mode-num">' + (i + 1) + "</span><div><strong>" + m.title + "</strong><p>" + m.tip + "</p></div></div>"
        ).join("") +
        "</div>" +
        '<button type="button" class="mc-btn" id="mc-start">Start →</button>' +
        "</section>";

      document.getElementById("mc-start").onclick = () => startMode(0);
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: TOTAL_PAIRS,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(0),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startMode(0);
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id)).join("");

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">' +
      mode.title +
      " · Set " +
      (setIndex + 1) +
      "/" + SETS.length + "</span>" +
      '<span class="mc-progress" id="mc-progress">Part ' + (modeIndex + 1) + "/" + MODES.length + " · Set " +
      (setIndex + 1) +
      "/" + SETS.length + " · " +
      correctCount() + "/" + SETS[setIndex].length + "</span>" +
      "</header>" +
      '<p class="mc-instruction" id="mc-hint">' +
      mode.tip +
      "</p>" +
      '<div class="mc-board is-entering" id="mc-board">' +
      '<div class="mc-col mc-col-left">' +
      left +
      "</div>" +
      '<div class="mc-col mc-col-right">' +
      right +
      "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset set</button>' +
      "</div>";

    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.onclick = () => selectLeft(+el.dataset.i);
    });
    app.querySelectorAll(".mc-play").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        if (locked[i]) return;
        selectLeft(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((btn) => {
      btn.onclick = () => selectRight(btn.dataset.id);
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
    const board = document.getElementById("mc-board");
    if (board) {
      setTimeout(function () { board.classList.remove("is-entering"); }, 700);
    }
  }

  render();
})();
