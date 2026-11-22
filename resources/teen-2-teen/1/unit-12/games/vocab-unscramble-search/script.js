/* Unscramble & Search – Teen2Teen 1 Unit 12 vocabulary.
   Part 1: unscramble the letters. Part 2: find the words in the word search. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-vocab-unscramble-search";

  // scrambled = the letters shown, answer = the words to write
  var SCRAMBLES = [
    { scrambled: "USCIM", answer: "music" },
    { scrambled: "ODOF", answer: "food" },
    { scrambled: "NITMANOUS", answer: "mountains" },
    { scrambled: "RUSSNIVOE", answer: "souvenirs" },
    { scrambled: "STURTIO RATATNICOTS", answer: "tourist attractions" }
  ];

  // the grid exactly as in the book (9 columns x 18 rows)
  var GRID = [
    "SDOPRTKNO", "TRTFOODLL", "OHYHLUNLM", "UIUJERHWA", "XJMUSICHI", "CWKKESQSN",
    "MFGFWTEOD", "UGNOWARVG", "SHWJFTPEH", "LNEKVTGHL", "OLTNLRASW", "MOUNTAINS",
    "PDAFKCSMC", "TGSDATJQH", "RSHGEIELK", "SOCHROKUA", "SOUVENIRS", "NNKJKSLSM"
  ];
  // the words to find; spaces are removed when matching, so "tourist attractions" is one line in the grid
  var TARGETS = ["music", "food", "mountains", "souvenirs", "tourist attractions"];
  function key(w) { return w.replace(/ /g, ""); }

  var app = document.getElementById("game-app");
  if (!app) return;

  /* ---------- sound effects ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("ua-muted") === "1"; } catch (e) {}
  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audioCtx(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    tap: function () { tone(640, 0.05, "triangle", 0.07); },
    type: function () { tone(900, 0.03, "square", 0.03); },
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z]/g, ""); }

  /* ---------- state ---------- */
  var phase = "unscramble";   // "unscramble" then "search"
  var idx = 0, scoreU = 0, misses = 0, locked = false, stageTimer = null;
  var foundWords = {};        // target word -> index (for its colour)
  var startCell = null;       // [row, col] of the first tap in the word search
  var foundCells = [];        // list of {cells:[[r,c],...], color index}

  function setProgress(pct) { $("sh-fill").style.width = pct + "%"; }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }

  /* ---------- part 1: unscramble ---------- */
  function boxes() { return Array.prototype.slice.call(document.querySelectorAll("#vs-row .tp-box")); }
  function allFilled() { return boxes().every(function (b) { return b.value.trim().length > 0; }); }
  function updateCheck() { var c = $("vs-check"); if (c) c.disabled = locked || !allFilled(); }

  function renderUnscramble(animateIn) {
    var it = SCRAMBLES[idx];
    locked = false;
    var words = it.answer.split(" ");
    var boxesHTML = words.map(function (w, i) {
      return '<input class="tp-box" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
        'maxlength="' + (w.length + 1) + '" data-len="' + w.length + '" data-w="' + i + '" style="--len:' + w.length + '" aria-label="Word ' + (i + 1) + '">';
    }).join(" ");
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<p class="qw-label">Part 1 · Unscramble the letters</p>' +
      '<p class="vs-scr">' + esc(it.scrambled) + "</p>" +
      '<div class="vs-row" id="vs-row">' + boxesHTML + "</div>" +
      '<button class="ca-check" id="vs-check" disabled>Check ✓</button>';
    setProgress(Math.round((idx / SCRAMBLES.length) * 50));
    setFeedback("", "");
    updateCheck();
    var first = boxes()[0];
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, animateIn ? 450 : 50);
  }

  function checkUnscramble() {
    if (locked || !allFilled()) return;
    var it = SCRAMBLES[idx];
    var target = it.answer.split(" ");
    var bs = boxes(), wrong = 0;
    bs.forEach(function (b, i) {
      b.classList.remove("is-wrong");
      if (norm(b.value) === norm(target[i])) { b.classList.add("is-right"); b.readOnly = true; }
      else { b.classList.add("is-wrong"); wrong++; }
    });
    if (wrong === 0) {
      locked = true;
      if (misses === 0) scoreU++;
      misses = 0;
      sfx("correct");
      setFeedback("Yesss! 🎉", "ok");
      updateCheck();
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextUnscramble, 1100);
    } else {
      misses++;
      sfx("wrong");
      setFeedback("Check the red boxes 💪", "no");
      var first = bs.filter(function (b) { return b.classList.contains("is-wrong"); })[0];
      if (first) first.focus({ preventScroll: true });
    }
  }

  function nextUnscramble() {
    $("sh-card").classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      idx++;
      if (idx >= SCRAMBLES.length) startSearch(true);
      else renderUnscramble(true);
    }, 300);
  }

  /* ---------- part 2: word search ---------- */
  function startSearch(animateIn) {
    phase = "search";
    startCell = null;
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    var cells = "";
    for (var r = 0; r < GRID.length; r++) {
      for (var c = 0; c < GRID[r].length; c++) {
        cells += '<button class="vs-cell" data-r="' + r + '" data-c="' + c + '" aria-label="' + GRID[r][c] + '">' + GRID[r][c] + "</button>";
      }
    }
    $("sh-card").innerHTML =
      '<div class="vs-search">' +
      '<div class="vs-search-top"><p class="qw-label" style="margin:0">Part 2 · Find the words</p>' +
      '<p class="vs-hint" id="vs-hint">Tap the first letter, then the last letter of a word.</p></div>' +
      '<ul class="vs-list" id="vs-list">' + TARGETS.map(function (w) {
        return '<li data-word="' + key(w) + '">' + w + "</li>";
      }).join("") + "</ul>" +
      '<div class="vs-grid" id="vs-grid">' + cells + "</div></div>";
    setProgress(50);
    setFeedback("", "");
  }

  function lineCells(a, b) {
    var dr = Math.sign(b[0] - a[0]), dc = Math.sign(b[1] - a[1]);
    var dr2 = Math.abs(b[0] - a[0]), dc2 = Math.abs(b[1] - a[1]);
    if (!(dr === 0 || dc === 0 || dr2 === dc2)) return null;   // must be straight, across, or diagonal
    var n = Math.max(dr2, dc2), out = [];
    for (var i = 0; i <= n; i++) out.push([a[0] + dr * i, a[1] + dc * i]);
    return out;
  }

  function letterAt(rc) { return GRID[rc[0]][rc[1]].toLowerCase(); }

  function tapCell(btn) {
    var rc = [Number(btn.getAttribute("data-r")), Number(btn.getAttribute("data-c"))];
    if (!startCell) {
      startCell = rc;
      document.querySelectorAll(".vs-cell.is-start").forEach(function (x) { x.classList.remove("is-start"); });
      btn.classList.add("is-start");
      sfx("tap");
      return;
    }
    if (rc[0] === startCell[0] && rc[1] === startCell[1]) {   // tap the start again to cancel
      startCell = null;
      btn.classList.remove("is-start");
      return;
    }
    var path = lineCells(startCell, rc);
    if (!path) {
      sfx("wrong");
      setFeedback("Choose a straight line: across, down, or diagonal.", "no");
      startCell = null;
      document.querySelectorAll(".vs-cell.is-start").forEach(function (x) { x.classList.remove("is-start"); });
      return;
    }
    var word = path.map(letterAt).join("");
    var rev = word.split("").reverse().join("");
    var hit = TARGETS.map(key).filter(function (t) { return !(t in foundWords) && (t === word || t === rev); })[0];
    startCell = null;
    document.querySelectorAll(".vs-cell.is-start").forEach(function (x) { x.classList.remove("is-start"); });
    if (hit) {
      var colour = Object.keys(foundWords).length;
      foundWords[hit] = colour;
      foundCells.push({ cells: path, colour: colour });
      paintFound();
      var li = document.querySelector('#vs-list li[data-word="' + hit + '"]');
      if (li) li.classList.add("is-found");
      sfx("correct");
      var label = TARGETS.filter(function (t) { return key(t) === hit; })[0];
      setFeedback("Yes! You found " + label + " 🎉", "ok");
      if (Object.keys(foundWords).length === TARGETS.length) {
        clearTimeout(stageTimer);
        stageTimer = setTimeout(finish, 1100);
      }
    } else {
      sfx("wrong");
      path.forEach(function (rc2) {
        var el = document.querySelector('.vs-cell[data-r="' + rc2[0] + '"][data-c="' + rc2[1] + '"]');
        if (el) { el.classList.add("is-wrong"); setTimeout(function () { el.classList.remove("is-wrong"); }, 600); }
      });
      setFeedback("Not a word from the list. Try again 💪", "no");
    }
  }

  function paintFound() {
    document.querySelectorAll(".vs-cell").forEach(function (x) {
      x.className = "vs-cell";
    });
    foundCells.forEach(function (f) {
      f.cells.forEach(function (rc) {
        var el = document.querySelector('.vs-cell[data-r="' + rc[0] + '"][data-c="' + rc[1] + '"]');
        if (el) el.classList.add("is-found-" + f.colour);
      });
    });
  }

  /* ---------- events ---------- */
  $("sh-card").addEventListener("input", function (ev) {
    var b = ev.target;
    if (!b.classList || !b.classList.contains("tp-box")) return;
    b.classList.remove("is-wrong");
    sfx("type");
    var len = Number(b.getAttribute("data-len"));
    if (b.value.length >= len) {
      var bs = boxes(), i = bs.indexOf(b);
      if (i > -1 && i < bs.length - 1) bs[i + 1].focus();
    }
    updateCheck();
  });
  $("sh-card").addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    if (!ev.target.classList || !ev.target.classList.contains("tp-box")) return;
    ev.preventDefault();
    if (allFilled()) checkUnscramble();
    else { var empty = boxes().filter(function (x) { return !x.value.trim(); })[0]; if (empty) empty.focus(); }
  });
  $("sh-card").addEventListener("click", function (ev) {
    if (ev.target.closest("#vs-check")) { audioCtx(); sfx("tap"); checkUnscramble(); return; }
    var cell = ev.target.closest(".vs-cell");
    if (cell && phase === "search") { audioCtx(); tapCell(cell); }
  });

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var found = Object.keys(foundWords).length;
    var total = SCRAMBLES.length + TARGETS.length;
    var score = scoreU + found;
    var stars = score === total ? 3 : score / total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID, score: score, total: total, stars: stars, timeMs: timeMs,
          onAgain: start, onModes: start, backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("sh-card").className = "sh-card";
    $("sh-card").innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
  }

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap"); paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    phase = "unscramble"; idx = 0; scoreU = 0; misses = 0; locked = false;
    foundWords = {}; foundCells = []; startCell = null;
    renderUnscramble(false);
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
