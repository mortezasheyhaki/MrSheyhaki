/* Word search · Tactics For Listening Basic Unit 4
 * Drag across letters in a straight line to select a word.
 * Desktop shows the word list beside the board; mobile uses the top-right Words button.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-word-search";
  var GAME_NAME = "Word search";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  var GRID = [
    "TUOGNAHNZSGNSRF",
    "PTZUQRNORZOTTAU",
    "KJEFLSASGSAVHER",
    "QBQJKNFRRYAOSYT",
    "JWCHATAEUJETSWP",
    "XPCTPOPPJANTREE",
    "SNTUQTLGNTILMNK",
    "IDTMHAKNVPGZBTO",
    "MENGTUVINEHIYOC",
    "GJIEMYZNYJTSZPU",
    "QNXYPRORPOSCUNZ",
    "DTTGUEYOADHHFDG",
    "QDRCIUDMSEIKPGX",
    "FALLASLEEPFSSHC",
    "JFRIOCZDPYTLNEL"
  ];

  var WORDS = [
    "chat", "fall asleep", "get up", "hang out", "depends",
    "morning person", "night person", "night shift", "new year", "stay up late"
  ];
  var KEYS = WORDS.map(function (w) { return w.replace(/ /g, "").toUpperCase(); });
  var N = GRID.length;

  var app = document.getElementById("game-app");
  if (!app) return;

  var found = {};        // word index -> true
  var foundCells = {};   // "r,c" -> true
  var selected = [];
  var startCell = null;
  var dragging = false;
  var completed = false;
  var playRecorded = false;
  var cellEls = [];
  var boardEl = null;
  var modalEl = null;
  var countEl = null;
  var doneEl = null;

  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function foundCount() { return Object.keys(found).length; }

  function saveProgress(stars) {
    if (window.LAStars) {
      if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
      LAStars.save(GAME_ID, stars);
    }
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-4",
          score: foundCount(),
          maxScore: WORDS.length,
          accuracy: 100,
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function topBar() {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span><strong>" + esc(GAME_NAME) + "</strong></div>" +
      '<div class="ws-words-wrap">' +
      '<button type="button" class="ws-words-btn" id="ws-open" aria-label="Show the words to find" title="Words">' +
      '<span aria-hidden="true">☰</span><span class="ws-words-btn-label">Words</span>' +
      "</button>" +
      '<span class="ws-badge" id="ws-badge" aria-hidden="true" style="display:none"></span>' +
      "</div>" +
      "</header>"
    );
  }

  function render() {
    app.innerHTML =
      topBar() +
      '<div class="ws-workspace">' +
      '<div class="ws-board-area"><div class="ws-board" id="ws-board" role="grid" aria-label="Letter grid"></div></div>' +
      '<aside class="ws-sidebar" aria-label="Words to find">' +
      '<h2 class="ws-sidebar-title">Find these words</h2>' +
      '<ul class="ws-words" id="ws-words-side"></ul>' +
      "</aside>" +
      "</div>" +
      '<div class="ws-done" id="ws-done" hidden></div>' +
      '<footer class="ws-foot">' +
      '<span class="ws-found-count" id="ws-count"></span>' +
      '<span class="ws-foot-hint">Drag across letters in any straight line</span>' +
      '<button type="button" class="ws-foot-btn" id="ws-restart">Restart</button>' +
      "</footer>" +
      '<div class="ws-modal" id="ws-modal" hidden role="dialog" aria-modal="true" aria-labelledby="ws-sheet-title">' +
      '<div class="ws-sheet">' +
      '<div class="ws-sheet-head"><h2 id="ws-sheet-title">Find these words</h2>' +
      '<button type="button" class="ws-close" id="ws-close">Close</button></div>' +
      '<p class="ws-sheet-hint">Words go across, down, diagonally, forwards or backwards.</p>' +
      '<ul class="ws-words" id="ws-words"></ul>' +
      "</div></div>";

    boardEl = document.getElementById("ws-board");
    modalEl = document.getElementById("ws-modal");
    countEl = document.getElementById("ws-count");
    doneEl = document.getElementById("ws-done");

    buildBoard();
    buildWordList();
    updateStatus();

    document.getElementById("ws-open").onclick = openWords;
    document.getElementById("ws-close").onclick = closeWords;
    document.getElementById("ws-restart").onclick = startGame;
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeWords();
    });
  }

  function buildBoard() {
    boardEl.innerHTML = "";
    cellEls = [];
    for (var r = 0; r < N; r++) {
      cellEls[r] = [];
      for (var c = 0; c < N; c++) {
        var el = document.createElement("div");
        el.className = "ws-cell";
        el.textContent = GRID[r][c];
        el.dataset.r = r;
        el.dataset.c = c;
        boardEl.appendChild(el);
        cellEls[r][c] = el;
      }
    }
    boardEl.addEventListener("pointerdown", onDown);
    boardEl.addEventListener("pointermove", onMove);
  }

  function buildWordList() {
    var html = WORDS.map(function (w, i) {
      return '<li data-i="' + i + '" class="' + (found[i] ? "is-found" : "") + '">' + esc(w) + "</li>";
    }).join("");
    var list = document.getElementById("ws-words");
    if (list) list.innerHTML = html;
    var side = document.getElementById("ws-words-side");
    if (side) side.innerHTML = html;
  }

  function updateStatus() {
    var n = foundCount();
    countEl.textContent = n + " of " + WORDS.length + " found";
    var badge = document.getElementById("ws-badge");
    if (badge) {
      badge.textContent = (WORDS.length - n);
      badge.style.display = n < WORDS.length ? "" : "none";
    }
    buildWordList();
    if (n === WORDS.length && !completed) {
      completed = true;
      doneEl.hidden = false;
      doneEl.textContent = "Well done! You found all " + WORDS.length + " words.";
      finish();
    }
  }

  function openWords() {
    buildWordList();
    modalEl.hidden = false;
    sfx("click");
    document.getElementById("ws-close").focus();
  }

  function closeWords() {
    modalEl.hidden = true;
    sfx("click");
  }

  // Coordinate-based hit test so dragging across grid gaps never drops selection
  function cellFromPoint(x, y) {
    if (!boardEl) return null;
    var el = document.elementFromPoint(x, y);
    if (el && el.classList && el.classList.contains("ws-cell")) {
      return { r: +el.dataset.r, c: +el.dataset.c };
    }
    var rect = boardEl.getBoundingClientRect();
    var pad = 6;
    var innerW = rect.width - pad * 2;
    var innerH = rect.height - pad * 2;
    if (innerW <= 0 || innerH <= 0) return null;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (!dragging) return null;
    }
    var relX = Math.max(0, Math.min(innerW - 0.01, x - (rect.left + pad)));
    var relY = Math.max(0, Math.min(innerH - 0.01, y - (rect.top + pad)));
    var c = Math.max(0, Math.min(N - 1, Math.floor((relX / innerW) * N)));
    var r = Math.max(0, Math.min(N - 1, Math.floor((relY / innerH) * N)));
    return { r: r, c: c };
  }

  function lineBetween(a, b) {
    var dr = b.r - a.r, dc = b.c - a.c;
    var steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return [a];
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    var sr = Math.sign(dr), sc = Math.sign(dc);
    var out = [];
    for (var k = 0; k <= steps; k++) out.push({ r: a.r + sr * k, c: a.c + sc * k });
    return out;
  }

  function clearSelection() {
    selected.forEach(function (p) { cellEls[p.r][p.c].classList.remove("is-sel"); });
    selected = [];
  }

  function paintSelection(line) {
    clearSelection();
    if (!line) return;
    line.forEach(function (p) {
      if (!foundCells[p.r + "," + p.c]) cellEls[p.r][p.c].classList.add("is-sel");
    });
    selected = line;
  }

  function checkSelection() {
    if (!selected.length) return;
    var str = selected.map(function (p) { return GRID[p.r][p.c]; }).join("");
    var rev = str.split("").reverse().join("");
    var idx = KEYS.indexOf(str);
    if (idx === -1) idx = KEYS.indexOf(rev);

    if (idx !== -1 && !found[idx]) {
      found[idx] = true;
      selected.forEach(function (p) {
        foundCells[p.r + "," + p.c] = true;
        var el = cellEls[p.r][p.c];
        el.classList.remove("is-sel");
        el.classList.add("is-found");
      });
      sfx("correct");
      clearSelection();
      updateStatus();
    } else {
      var flash = selected.slice();
      clearSelection();
      sfx("wrong");
      flash.forEach(function (p) {
        if (foundCells[p.r + "," + p.c]) return;
        var el = cellEls[p.r][p.c];
        el.classList.add("is-bad");
        setTimeout(function () { el.classList.remove("is-bad"); }, 320);
      });
    }
  }

  function onDown(e) {
    if (completed) return;
    var p = cellFromPoint(e.clientX, e.clientY);
    if (!p) return;
    dragging = true;
    startCell = p;
    paintSelection([p]);
    try { boardEl.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onMove(e) {
    if (!dragging || completed) return;
    var p = cellFromPoint(e.clientX, e.clientY);
    if (!p) return;
    var line = lineBetween(startCell, p);
    if (line) paintSelection(line);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    checkSelection();
  }

  function finish() {
    var stars = 3;
    saveProgress(stars);
    sfx("win");
    if (window.LAFinish && typeof LAFinish.show === "function") {
      var timeMs = typeof LAFinish.stopTimer === "function" ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: foundCount(),
        total: WORDS.length,
        stars: stars,
        accuracy: 100,
        timeMs: timeMs,
        onAgain: startGame,
        onModes: startGame,
        backHref: BACK,
        save: false
      });
      return;
    }
    renderDone();
  }

  function renderDone() {
    app.innerHTML =
      topBar() +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>All " + WORDS.length + " words found!</h1>" +
      '<p class="lc-intro-lede">Great job finding every Unit 4 phrase in the grid.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="ws-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("ws-again").onclick = startGame;
  }

  function startGame() {
    if (window.LAFinish && typeof LAFinish.startTimer === "function") LAFinish.startTimer();
    found = {};
    foundCells = {};
    selected = [];
    dragging = false;
    completed = false;
    playRecorded = false;
    render();
  }

  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalEl && !modalEl.hidden) closeWords();
  });

  startGame();
})();
