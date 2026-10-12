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

/* Plurals Match – 3 modes × 5 pairs – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-plural-match";


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
    { id: "bags",          label: "bags",           audio: "https://cdn.imgurl.ir/uploads/x638628_bags.mp3",          image: "https://cdn.imgurl.ir/uploads/x20944_bags.png" },
    { id: "change-purses", label: "change purses",  audio: "https://cdn.imgurl.ir/uploads/z462354_change_purses.mp3", image: "https://cdn.imgurl.ir/uploads/v229506_change-purses.png" },
    { id: "watches",       label: "watches",        audio: "https://cdn.imgurl.ir/uploads/o076155_watches.mp3",       image: "https://cdn.imgurl.ir/uploads/y97471_watches.png" },
    { id: "tablets",       label: "tablets",        audio: "https://cdn.imgurl.ir/uploads/t104692_Tablets.mp3",       image: "https://cdn.imgurl.ir/uploads/z4134_tablets.png" },
    { id: "passports",     label: "passports",      audio: "https://cdn.imgurl.ir/uploads/o75155_Pports.mp3",     image: "https://cdn.imgurl.ir/uploads/q617804_pports.png" },
    { id: "coats",         label: "coats",          audio: "https://cdn.imgurl.ir/uploads/o62846_coats.mp3",         image: "https://cdn.imgurl.ir/uploads/o465237_coats.png" },
    { id: "books",         label: "books",          audio: "https://cdn.imgurl.ir/uploads/w44344_books.mp3",         image: "https://cdn.imgurl.ir/uploads/m43927_books.png" },
    { id: "pens",          label: "pens",           audio: "https://cdn.imgurl.ir/uploads/b728985_pens.mp3",          image: "https://cdn.imgurl.ir/uploads/o169010_pens.png" },
    { id: "keys",          label: "keys",           audio: "https://cdn.imgurl.ir/uploads/d512633_keys.mp3",          image: "https://cdn.imgurl.ir/uploads/i998013_keys.png" },
    { id: "phones",        label: "phones",         audio: "https://cdn.imgurl.ir/uploads/i79236_phones.mp3",        image: "https://cdn.imgurl.ir/uploads/v603681_phones.png" },
  ];

  // 2 fixed sets of 5
  const SETS = [
    ["bags", "change-purses", "watches", "tablets", "passports"],
    ["coats", "books", "pens", "keys", "phones"],
  ];

  const MODES = [
    { id: "pic-word",   title: "Pictures → Words",   left: "picture", right: "word",    tip: "Match each picture to the word." },
    { id: "audio-word", title: "Audio → Words",      left: "audio",   right: "word",    tip: "Listen, then match to the word." },
    { id: "audio-pic",  title: "Audio → Pictures",   left: "audio",   right: "picture", tip: "Listen, then match to the picture." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu"; // menu | play | done
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
  let advancing = false; // guards against advancing twice (audio-ended + safety timer)
  let totalCorrect = 0, wrongCount = 0; // across all parts
  const TOTAL_PAIRS = MODES.length * SETS.reduce((n, set) => n + set.length, 0);
  if (window.ArcadeFX) ArcadeFX.track = function () {
    const per = SETS.reduce((n, set) => n + set.length, 0);
    let done = 0;
    SETS.forEach((set, i) => { if (i < setIndex) done += set.length; });
    return Math.round(((modeIndex * per + done + correctCount()) / TOTAL_PAIRS) * 100);
  };

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
    if (!c) return;

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

  function playItemAudio(itemId) {
    const c = byId(itemId);
    if (!c) return;
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
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
    advancing = false;
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
        s.style.setProperty("--delay", (i * 0.02) + "s");
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
    return correctCount() === SETS[setIndex].length;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    const mode = MODES[modeIndex];
    if (mode.left === "audio") playAudioFor(i);
  }

  function selectRight(rightId) {
    if (selectedLeft === null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = MODES[modeIndex].left === "audio"
          ? "Play a sound first, then tap a match."
          : "Tap an item on the left first.";
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

    if (ok) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      setCorrect += 1;
      modeCorrect += 1;
      totalCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      sfxCorrect();
      spawnMatchFX(leftEl, rightEl);
      // Audio after a match only in Pictures → Words mode
      if (MODES[modeIndex].id === "pic-word") {
        playItemAudio(leftId);
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (allMatched()) {
        // Wait for word audio to finish before next set / finish (don't cut off last match sound)
        const advance = () => {
          if (advancing) return;
          advancing = true;
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else if (modeIndex < MODES.length - 1) {
            // part finished → pop-up, then straight into the next part
            if (window.ArcadeFX) ArcadeFX.cheer(modeIndex, MODES.length);
            setTimeout(() => startMode(modeIndex + 1), 1700);
          } else {
            if (window.ArcadeFX) ArcadeFX.cheer(modeIndex, MODES.length);
            if (typeof sfxComplete === "function") sfxComplete();
            phase = "done";
            render();
          }
        };
        const waitMs = 1600;
        if (currentAudio && !currentAudio.paused) {
          const a = currentAudio;
          const prev = a.onended;
          a.onended = function () {
            if (typeof prev === "function") prev.call(a);
            setTimeout(advance, 350);
          };
          // safety max wait
          setTimeout(function () {
            if (phase === "play" && allMatched()) advance();
          }, 3500);
        } else {
          setTimeout(advance, waitMs);
        }
      }
    } else {
      wrongCount += 1;
      sfxWrong();
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong", "is-selected");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 450);
    }
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) el.textContent = "Part " + (modeIndex + 1) + "/" + MODES.length + " · Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + SETS[setIndex].length;
  }

  function calcStars() {
    // Stars come from accuracy: correct matches / all match attempts
    const attempts = totalCorrect + wrongCount;
    if (totalCorrect < TOTAL_PAIRS || attempts === 0) return 0;
    const acc = totalCorrect / attempts;
    return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function leftCell(id, i, kind) {
    const c = byId(id);
    const isLocked = !!locked[i];
    const sel = selectedLeft === i ? " is-selected" : "";
    const ok = isLocked ? " is-correct" : "";

    if (kind === "audio") {
      return `
        <div class="mc-left-item mc-audio-cell${ok}${sel}" data-i="${i}">
          <button type="button" class="mc-play" data-i="${i}" aria-label="Play ${c.label}" ${isLocked ? "disabled" : ""}>
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
        </div>`;
    }
    // picture
    return `
      <div class="mc-left-item mc-pic-cell${ok}${sel}" data-i="${i}">
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
      </div>`;
  }

  function rightCell(id, kind) {
    const c = byId(id);
    const used = Object.keys(locked).some((li) => matches[li] === id);
    if (kind === "word") {
      return `
        <button type="button" class="mc-right-item mc-word${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
          <span class="mc-word-label">${c.label}</span>
        </button>`;
    }
    // picture on the right
    return `
      <button type="button" class="mc-right-item mc-pic-btn${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
      </button>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Plurals Match</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">📦</div>
          <h1>Plurals Match</h1>
          <p class="mc-desc">${MODES.length} parts, one after another · ${TOTAL_PAIRS} pairs</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <div class="mc-mode-card">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </div>`).join("")}
          </div>
          <button type="button" class="mc-btn" id="mc-start-btn">Start →</button>
        </section>`;
      document.getElementById("mc-start-btn").onclick = () => startMode(0);
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      if (window.LAFinish) {
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
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u3a-again">Again</button>`;
      document.getElementById("u3a-again").onclick = () => startMode(0);
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id, mode.right)).join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title} · Set ${setIndex + 1}/${SETS.length}</span>
        <span class="mc-progress" id="mc-progress">Part ${modeIndex + 1}/${MODES.length} · Set ${setIndex + 1}/${SETS.length} · ${correctCount()}/${SETS[setIndex].length}</span>
      </header>
      <p class="mc-instruction" id="mc-hint">${mode.tip}</p>
      <div class="mc-board is-entering" id="mc-board">
        <div class="mc-col mc-col-left">${left}</div>
        <div class="mc-col mc-col-right">${right}</div>
      </div>
      <div class="mc-actions">
        <button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>
      </div>`;

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


  function ensureFieldVisible(el) {
    if (!el) return;
    var target = el.closest(".ll-card, .lsp-card, .sp-card, .qa-card, .wi-card, .lw-card, .ll-stage, .lsp-stage, .sp-stage, .qa-stage, .wi-stage") || el;
    try { target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { try { target.scrollIntoView(true); } catch (e2) {} }
    setTimeout(function () {
      try { target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e3) {}
    }, 350);
  }
  function bindKeyboardFix(root) {
    root = root || document;
    var inputs = root.querySelectorAll('input[type="text"], input.ll-input, input.lsp-input, input.sp-input, input.qa-input, input.lw-input, input.wi-input');
    inputs.forEach(function (inp) {
      if (inp.dataset.kbFix) return;
      inp.dataset.kbFix = "1";
      inp.addEventListener("focus", function () { ensureFieldVisible(inp); });
      inp.addEventListener("click", function () { ensureFieldVisible(inp); });
    });
    if (window.visualViewport && !window.__proKbVV) {
      window.__proKbVV = true;
      var onVV = function () {
        var ae = document.activeElement;
        if (ae && ae.tagName === "INPUT") ensureFieldVisible(ae);
      };
      window.visualViewport.addEventListener("resize", onVV);
      window.visualViewport.addEventListener("scroll", onVV);
    }
  }

  // Re-bind after UI paints
  var _origRenderDone = true;
  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.tagName === 'INPUT') ensureFieldVisible(e.target);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      var ae = document.activeElement;
      if (ae && ae.tagName === 'INPUT') ensureFieldVisible(ae);
    });
  }

  render();
})();
