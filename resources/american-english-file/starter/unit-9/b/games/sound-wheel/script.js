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
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, 2)];
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
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^\d+\s*\/\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(\d+)\s*\/\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
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

/* Sound Wheel — AEF Starter Unit 9B
 * Clothes vocabulary grouped by the five vowel sounds shown in the Student's Book.
 */
(function () {
  "use strict";

  

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
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

var GAME_ID = "starter-9b-sound-wheel";

  var SOUNDS = [
    { id: "e", ipa: "e", example: "egg", hint: "as in egg" },
    { id: "u", ipa: "u", example: "boot", hint: "as in boot" },
    { id: "ae", ipa: "æ", example: "cat", hint: "as in cat" },
    { id: "ou", ipa: "oʊ", example: "phone", hint: "as in phone" },
    { id: "i", ipa: "i", example: "tree", hint: "as in tree" },
  ];

  var WORDS = [
    { id: "cap", word: "cap", sound: "ae" },
    { id: "coat", word: "coat", sound: "ou" },
    { id: "dress", word: "dress", sound: "e" },
    { id: "hat", word: "hat", sound: "ae" },
    { id: "jacket", word: "jacket", sound: "ae" },
    { id: "jeans", word: "jeans", sound: "i" },
    { id: "shoes", word: "shoes", sound: "u" },
    { id: "sneakers", word: "sneakers", sound: "i" },
    { id: "suit", word: "suit", sound: "u" },
    { id: "sweater", word: "sweater", sound: "e" },
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var solved = {};
  var correct = 0;
  var selectedSound = null;
  var draggedId = null;
  var pointerGhost = null;
  var pointerId = null;
  var startPoint = null;
  var moved = false;
  var idx = 0, missed = false, misses = 0, firstTry = 0, prevPct = 0;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }

  function sfx(name) {
    if (window.ArcadeFX) { if (name === "good" || name === "correct") ArcadeFX.ok(); else if (name === "bad" || name === "wrong") ArcadeFX.bad(); }
    try {
      if (!window.LASfx) return;
      if (name === "good" && LASfx.correct) LASfx.correct();
      else if (name === "bad" && LASfx.wrong) LASfx.wrong();
      else if (name === "click" && LASfx.click) LASfx.click();
      else if (name === "win" && LASfx.win) LASfx.win();
    } catch (_) {}
  }

  function startGame() {
    phase = "play";
    order = shuffle(WORDS.map(function (_, i) { return i; }));
    solved = {};
    correct = 0;
    idx = 0; missed = false; misses = 0; firstTry = 0; prevPct = 0;
    selectedSound = null;
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function wordById(id) {
    return WORDS.find(function (w) { return w.id === id; });
  }

  function soundById(id) {
    return SOUNDS.find(function (s) { return s.id === id; });
  }

  function setFeedback(text, type) {
    var el = document.getElementById("feedback");
    if (!el) return;
    el.textContent = text || "";
    el.className = "sw-feedback" + (type ? " " + type : "");
  }

  function chooseSound(id) {
    selectedSound = id;
    sfx("click");
    document.querySelectorAll(".sw-tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.sound === id);
    });
    setFeedback("Drag a word to " + soundById(id).ipa + " — " + soundById(id).example + ".", "");
  }

  function checkWord(wordId, targetSound, sourceEl) {
    if (!wordId || solved[wordId]) return;
    var word = wordById(wordId);
    if (!word) return;

    if (word.sound === targetSound) {
      solved[wordId] = true;
      correct++;
      sourceEl.classList.remove("dragging", "wrong");
      sourceEl.classList.add("correct");
      sourceEl.setAttribute("aria-disabled", "true");
      sourceEl.draggable = false;
      var tab = document.querySelector('.sw-tab[data-sound="' + targetSound + '"]');
      if (tab) {
        tab.classList.add("active");
        setTimeout(function () { tab.classList.remove("active"); }, 450);
      }
      sfx("good");
      setFeedback("✓ " + word.word + " goes with /" + soundById(targetSound).ipa + "/.", "good");
      if (!missed) firstTry++;
      missed = false; misses = 0;
      idx++;
      var scEl = document.getElementById("score");
      if (scEl) scEl.textContent = correct + " / " + WORDS.length;
      var fillEl = document.getElementById("swFill");
      if (fillEl) { prevPct = Math.round((correct / WORDS.length) * 100); fillEl.style.width = prevPct + "%"; }
      if (correct === WORDS.length) {
        setTimeout(finishGame, 650);
      } else {
        var okMsg = "✓ " + word.word + " goes with /" + soundById(targetSound).ipa + "/.";
        setTimeout(function () { if (phase === "play") { renderPlay(); setFeedback(okMsg, "good"); } }, 650);
      }
    } else {
      sourceEl.classList.remove("dragging");
      sourceEl.classList.add("wrong");
      sfx("bad");
      missed = true; misses++;
      if (misses >= 2) { var ht = document.querySelector('.sw-tab[data-sound="' + word.sound + '"]'); if (ht) ht.classList.add("hint"); }
      setFeedback("Try again — listen to the sound in the middle of the word.", "bad");
      setTimeout(function () { sourceEl.classList.remove("wrong"); }, 400);
    }
  }

  function finishGame() {
    if (phase === "done") return;
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: firstTry, // first-try answers only
        total: WORDS.length,
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: "../",
        save: true,
      });
      return;
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, Math.round(firstTry / WORDS.length * 100));
      }
    } catch (_) {}
    render();
  }

  function renderStart() {
    app.innerHTML = '' +
      '<section class="sw-start">' +
        '<div class="sw-hero" aria-hidden="true">🎡🔤</div>' +
        '<h1>Sound Wheel</h1>' +
        '<p class="sw-lead">Drag each clothes word into the correct sound tab.<br>Use the examples around the wheel to help you.</p>' +
        '<div class="sw-demo">' +
          SOUNDS.map(function (s) { return '<span class="sw-chip">/' + escapeHtml(s.ipa) + '/ ' + escapeHtml(s.example) + '</span>'; }).join('') +
        '</div>' +
        '<button type="button" class="sw-btn" id="startBtn">Start</button>' +
      '</section>';
    document.getElementById("startBtn").onclick = function () { sfx("click"); startGame(); };
  }

  function renderPlay() {
    var words = idx < order.length ? [WORDS[order[idx]]] : []; // one word at a time

    app.innerHTML = '' +
      '<header class="sw-topbar">' +
        '<a class="sw-back" href="../" aria-label="Back">←</a>' +
        '<div class="sw-heading"><span class="sw-eyebrow">Starter · Unit 9B</span><span class="sw-title">Sound Wheel</span></div>' +
        '<div class="sw-score" id="score">' + correct + ' / ' + WORDS.length + '</div>' +
      '</header>' +
      '<div class="sw-progress"><div class="sw-progress-fill" id="swFill" style="width:' + prevPct + '%"></div></div>' +
      '<p class="sw-instruction">Listen for the vowel sound in the middle of the word, then drag the word to its sound.</p>' +
      '<section class="sw-stage" aria-label="Sound selection wheel">' +
        '<div class="sw-wheel" id="wheel">' +
          SOUNDS.map(function (s, i) {
            return '<button type="button" class="sw-tab t' + i + '" data-sound="' + s.id + '" aria-label="Sound /' + escapeHtml(s.ipa) + '/ as in ' + escapeHtml(s.example) + '">' +
              '<span class="ipa">/' + escapeHtml(s.ipa) + '/</span>' +
              '<span class="example">' + escapeHtml(s.example) + '</span>' +
              '<span class="mini">' + escapeHtml(s.hint) + '</span>' +
            '</button>';
          }).join('') +
          '<div class="sw-center" id="center" aria-label="Words to sort">' +
            '<span class="sw-center-label">Word ' + Math.min(idx + 1, WORDS.length) + ' of ' + WORDS.length + '</span>' +
            words.map(function (w) {
              return '<div class="sw-word" draggable="true" tabindex="0" data-word="' + escapeHtml(w.id) + '" role="button" aria-label="Drag ' + escapeHtml(w.word) + '">' + escapeHtml(w.word) + '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +
      '<div class="sw-help">Sounds: /e/ egg · /u/ boot · /æ/ cat · /oʊ/ phone · /i/ tree</div>' +
      '<p class="sw-feedback" id="feedback" aria-live="polite"></p>';

    document.querySelectorAll(".sw-tab").forEach(function (tab) {
      tab.addEventListener("click", function () { chooseSound(tab.dataset.sound); });
      tab.addEventListener("dragover", function (e) {
        e.preventDefault();
        tab.classList.add("drag-over");
      });
      tab.addEventListener("dragleave", function () { tab.classList.remove("drag-over"); });
      tab.addEventListener("drop", function (e) {
        e.preventDefault();
        tab.classList.remove("drag-over");
        var id = e.dataTransfer.getData("text/plain");
        var el = document.querySelector('.sw-word[data-word="' + id + '"]');
        checkWord(id, tab.dataset.sound, el);
      });
    });

    document.querySelectorAll(".sw-word").forEach(function (wordEl) {
      wordEl.addEventListener("dragstart", function (e) {
        draggedId = wordEl.dataset.word;
        wordEl.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", draggedId);
      });
      wordEl.addEventListener("dragend", function () { wordEl.classList.remove("dragging"); draggedId = null; });
      wordEl.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && selectedSound) {
          e.preventDefault();
          checkWord(wordEl.dataset.word, selectedSound, wordEl);
        }
      });
      bindPointerDrag(wordEl);
    });
    var newPct = Math.round((correct / WORDS.length) * 100);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var f = document.getElementById("swFill"); if (f) f.style.width = newPct + "%";
    }); });
    prevPct = newPct;
  }

  /* Pointer-based drag fallback makes the same game usable on touchscreens where
   * native HTML drag-and-drop is inconsistent. The native drag API remains active
   * for desktop browsers. */
  function bindPointerDrag(el) {
    el.addEventListener("pointerdown", function (e) {
      // Let the browser's native drag-and-drop handle mouse users; this fallback
      // is primarily for touch/pen devices where native HTML DnD is inconsistent.
      if (e.pointerType === "mouse") return;
      if (solved[el.dataset.word]) return;
      pointerId = e.pointerId;
      startPoint = { x: e.clientX, y: e.clientY };
      moved = false;
      try { el.setPointerCapture(pointerId); } catch (_) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (pointerId !== e.pointerId || !startPoint || solved[el.dataset.word]) return;
      var dx = e.clientX - startPoint.x;
      var dy = e.clientY - startPoint.y;
      if (!moved && Math.hypot(dx, dy) < 8) return;
      moved = true;
      if (!pointerGhost) {
        pointerGhost = el.cloneNode(true);
        pointerGhost.className = "sw-word dragging";
        pointerGhost.style.position = "fixed";
        pointerGhost.style.zIndex = "99999";
        pointerGhost.style.pointerEvents = "none";
        pointerGhost.style.margin = "0";
        document.body.appendChild(pointerGhost);
      }
      pointerGhost.style.left = (e.clientX - pointerGhost.offsetWidth / 2) + "px";
      pointerGhost.style.top = (e.clientY - pointerGhost.offsetHeight / 2) + "px";
      el.classList.add("dragging");
      highlightTabAt(e.clientX, e.clientY);
    });
    el.addEventListener("pointerup", function (e) {
      if (pointerId !== e.pointerId) return;
      if (moved) {
        var tab = tabAt(e.clientX, e.clientY);
        if (tab) checkWord(el.dataset.word, tab.dataset.sound, el);
        clearTabHighlights();
      } else if (selectedSound) {
        checkWord(el.dataset.word, selectedSound, el);
      }
      cleanupPointerDrag(el);
    });
    el.addEventListener("pointercancel", function () { cleanupPointerDrag(el); });
  }

  function tabAt(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest(".sw-tab") : null;
  }
  function highlightTabAt(x, y) {
    var tab = tabAt(x, y);
    clearTabHighlights();
    if (tab) tab.classList.add("drag-over");
  }
  function clearTabHighlights() {
    document.querySelectorAll(".sw-tab.drag-over").forEach(function (x) { x.classList.remove("drag-over"); });
  }
  function cleanupPointerDrag(el) {
    el.classList.remove("dragging");
    if (pointerGhost && pointerGhost.parentNode) pointerGhost.parentNode.removeChild(pointerGhost);
    pointerGhost = null;
    pointerId = null;
    startPoint = null;
    moved = false;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderPlay();
  }

  render();
})();
