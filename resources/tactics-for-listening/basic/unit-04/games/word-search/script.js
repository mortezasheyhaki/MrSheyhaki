/* Word search · Tactics For Listening Basic Unit 4
 * Drag across letters in a straight line to select a word.
 * The word list is hidden on the board; the round button opens it.
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
  var cellEls = [];
  var boardEl = null;
  var modalEl = null;
  var countEl = null;
  var doneEl = null;
  var started = false;

  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function foundCount() { return Object.keys(found).length; }

  function topBar() {
    return (
      '<header class="ws-top">' +
      '<div class="ws-title"><span class="ws-eyebrow">' + esc(UNIT) + '</span><strong>' + esc(GAME_NAME) + '</strong></div>' +
      '<div class="ws-words-wrap">' +
      '<button type="button" class="ws-words-btn" id="ws-open" aria-label="Show the words to find" title="Words">☰' +
      '</button>' +
      '<span class="ws-badge" id="ws-badge" aria-hidden="true" style="display:none"></span>' +
      '</div>' +
      "</header>"
    );
  }

  function render() {
    app.innerHTML =
      topBar() +
      '<div class="ws-board-area"><div class="ws-board" id="ws-board" role="grid" aria-label="Letter grid"></div></div>' +
      '<div class="ws-done" id="ws-done" hidden></div>' +
      '<footer class="ws-foot">' +
      '<span class="ws-found-count" id="ws-count"></span>' +
      '<span>Drag across the letters</span>' +
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
    var list = document.getElementById("ws-words");
    list.innerHTML = WORDS.map(function (w, i) {
      return '<li data-i="' + i + '" class="' + (found[i] ? "is-found" : "") + '">' + esc(w) + "</li>";
    }).join("");
  }

  function updateStatus() {
    var n = foundCount();
    countEl.textContent = n + " of " + WORDS.length + " found";
    var badge = document.getElementById("ws-badge");
    if (badge) {
      badge.textContent = (WORDS.length - n);
      badge.style.display = n < WORDS.length ? "" : "none";
    }
    if (n === WORDS.length) {
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

  function cellFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el || !el.classList || !el.classList.contains("ws-cell")) return null;
    return { r: +el.dataset.r, c: +el.dataset.c };
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
    var p = cellFromPoint(e.clientX, e.clientY);
    if (!p) return;
    dragging = true;
    startCell = p;
    paintSelection([p]);
    try { boardEl.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onMove(e) {
    if (!dragging) return;
    var p = cellFromPoint(e.clientX, e.clientY);
    if (!p) return;
    paintSelection(lineBetween(startCell, p));
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    checkSelection();
  }

  function finish() {
    var stars = 3;
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
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
    }
  }

  function startGame() {
    if (window.LAFinish && typeof LAFinish.startTimer === "function") LAFinish.startTimer();
    found = {};
    foundCells = {};
    selected = [];
    dragging = false;
    render();
  }

  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalEl && !modalEl.hidden) closeWords();
  });

  startGame();
})();
