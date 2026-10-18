/* Describe people · Tactics For Listening Basic Unit 2
 * Drag each word into Age, Height or Hair. Tap a word, then a column, works too.
 * "curly" is the example and is already placed. A wrong drop bounces back.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u2-describe-sort";
  var UNIT = "Unit 2 · Basic";
  var BACK = "../../";

  var CATS = [
    { id: "age",    label: "Age" },
    { id: "height", label: "Height" },
    { id: "hair",   label: "Hair" },
  ];

  var EXAMPLE = { w: "curly", cat: "hair" };

  var WORDS = [
    { w: "about 22", cat: "age" },
    { w: "19 years old", cat: "age" },
    { w: "almost 25", cat: "age" },
    { w: "in her teens", cat: "age" },
    { w: "in his twenties", cat: "age" },
    { w: "in her thirties", cat: "age" },
    { w: "about 170 cm", cat: "height" },
    { w: "tall", cat: "height" },
    { w: "not very tall", cat: "height" },
    { w: "short", cat: "hair" },
    { w: "long", cat: "hair" },
    { w: "dark", cat: "hair" },
    { w: "light brown", cat: "hair" },
    { w: "blond", cat: "hair" },
    { w: "straight", cat: "hair" },
    { w: "shoulder-length", cat: "hair" },
  ];

  var app = document.getElementById("game-app");
  var phase = "start";
  var items = [];        // { id, w, cat, placed }
  var selectedId = null;
  var mistakes = 0;
  var placedCount = 0;
  var status = { text: "", kind: "" };
  var flashCat = null;
  var drag = null;       // active drag state
  var playRecorded = false;
  var finished = false;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- state ---------- */

  function setupGame() {
    items = shuffle(WORDS).map(function (x, i) {
      return { id: "w" + i, w: x.w, cat: x.cat, placed: false };
    });
    selectedId = null;
    mistakes = 0;
    placedCount = 0;
    status = { text: "Drag a word into a column, or tap a word and then a column.", kind: "" };
    flashCat = null;
    drag = null;
    finished = false;
  }

  function calcStars() {
    if (mistakes === 0) return 3;
    if (mistakes <= 3) return 2;
    if (mistakes <= 6) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Describe people",
          category: "tactics-for-listening", unit: "basic-2",
          score: WORDS.length - mistakes, maxScore: WORDS.length,
          accuracy: Math.max(0, Math.round(((WORDS.length - mistakes) / WORDS.length) * 100)),
          completed: true, stars: stars,
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    setupGame();
    playRecorded = false;
    phase = "play";
    render();
  }

  /* ---------- placing ---------- */

  function findItem(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  function tryPlace(id, cat) {
    var it = findItem(id);
    if (!it || it.placed || finished) return;
    if (it.cat === cat) {
      it.placed = true;
      placedCount++;
      selectedId = null;
      flashCat = null;
      sfx("pop");
      var left = items.length - placedCount;
      status = left
        ? { text: "Yes! “" + it.w + "” goes in " + catLabel(cat) + ". " + left + " to go.", kind: "is-ok" }
        : { text: "All done!", kind: "is-ok" };
      if (left === 0) { render(); setTimeout(finish, 900); return; }
    } else {
      mistakes++;
      sfx("wrong");
      selectedId = null;
      flashCat = cat;
      status = { text: "Not quite. Try another column.", kind: "is-bad" };
      setTimeout(function () { flashCat = null; render(); }, 380);
    }
    render();
  }

  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label;
    return id;
  }

  function tapWord(id) {
    if (finished) return;
    var it = findItem(id);
    if (!it || it.placed) return;
    selectedId = selectedId === id ? null : id;
    status = selectedId
      ? { text: "Now tap a column for “" + it.w + "”.", kind: "" }
      : { text: "Drag a word into a column, or tap a word and then a column.", kind: "" };
    sfx("click");
    render();
  }

  function tapColumn(cat) {
    if (finished) return;
    if (selectedId) { tryPlace(selectedId, cat); }
  }

  /* ---------- drag (mouse, pen and touch via pointer events) ---------- */

  function columnAt(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && el !== document.body) {
      if (el.classList && el.classList.contains("ws-col")) return el;
      el = el.parentNode;
    }
    return null;
  }

  function onPointerDown(e, id, el) {
    if (finished) return;
    var it = findItem(id);
    if (!it || it.placed) return;
    e.preventDefault();
    var ghost = el.cloneNode(true);
    ghost.classList.add("ws-ghost");
    ghost.removeAttribute("data-id");
    document.body.appendChild(ghost);
    drag = { id: id, el: el, ghost: ghost, startX: e.clientX, startY: e.clientY, moved: false, over: null };
    el.classList.add("is-dragging");
    moveGhost(e.clientX, e.clientY);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
  }

  function moveGhost(x, y) {
    if (!drag) return;
    drag.ghost.style.left = x + "px";
    drag.ghost.style.top = y + "px";
  }

  function setOver(col) {
    if (drag.over === col) return;
    if (drag.over) drag.over.classList.remove("is-over");
    drag.over = col;
    if (col) col.classList.add("is-over");
  }

  function onPointerMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true;
    moveGhost(e.clientX, e.clientY);
    setOver(columnAt(e.clientX, e.clientY));
  }

  function endDrag() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    if (drag) {
      if (drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
      if (drag.el) drag.el.classList.remove("is-dragging");
      if (drag.over) drag.over.classList.remove("is-over");
    }
    drag = null;
  }

  function onPointerUp(e) {
    if (!drag) return;
    var d = drag;
    var col = columnAt(e.clientX, e.clientY);
    endDrag();
    if (!d.moved) { tapWord(d.id); return; }   // a tap, not a drag
    if (col) { tryPlace(d.id, col.getAttribute("data-cat")); }
  }

  function onPointerCancel() { endDrag(); render(); }

  /* ---------- views ---------- */

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>Describe people</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function chipHtml(it) {
    var cls = "ws-chip" + (selectedId === it.id ? " is-selected" : "");
    return '<button type="button" class="' + cls + '" data-id="' + it.id + '">' + esc(it.w) + "</button>";
  }

  function render() {
    document.querySelectorAll(".ws-ghost").forEach(function (g) { g.parentNode && g.parentNode.removeChild(g); });
    if (phase === "start") return renderStart();
    if (phase === "done") return renderDone();
    var bank = items.filter(function (it) { return !it.placed; });
    var counter = placedCount + " / " + items.length;

    var cols = CATS.map(function (c) {
      var cls = "ws-col" + (flashCat === c.id ? " is-bad" : "");
      var placed = items.filter(function (it) { return it.placed && it.cat === c.id; });
      var list = (c.id === "hair" ? '<div class="ws-chip is-example">' + esc(EXAMPLE.w) + "</div>" : "") +
        placed.map(function (it) { return '<div class="ws-chip is-placed">' + esc(it.w) + "</div>"; }).join("");
      return (
        '<section class="' + cls + '" data-cat="' + c.id + '" aria-label="' + c.label + ' column">' +
        '<h2 class="ws-col-head">' + c.label + "</h2>" +
        '<div class="ws-list">' + list + "</div></section>"
      );
    }).join("");

    app.innerHTML =
      topBar(counter) +
      '<main class="lc-main"><div class="ws-wrap">' +
      '<p class="ws-hint">Put each word in the right column.</p>' +
      '<div class="ws-bank" id="ws-bank">' + bank.map(chipHtml).join("") + "</div>" +
      '<div class="ws-cols">' + cols + "</div>" +
      '<p class="ws-status ' + status.kind + '" aria-live="polite">' + esc(status.text) + "</p>" +
      "</div></main>";

    bind();
  }

  function bind() {
    app.querySelectorAll(".ws-chip[data-id]").forEach(function (el) {
      var id = el.getAttribute("data-id");
      el.addEventListener("pointerdown", function (e) { onPointerDown(e, id, el); });
      el.addEventListener("dragstart", function (e) { e.preventDefault(); });
    });
    app.querySelectorAll(".ws-col").forEach(function (col) {
      col.addEventListener("click", function () { tapColumn(col.getAttribute("data-cat")); });
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🧑</div>' +
      "<h1>Describe people</h1>" +
      '<p class="lc-intro-lede">Sort the words into Age, Height and Hair. “Curly” is already done for you.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ws-start">Start →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span><strong>Drag</strong> a word into a column, or tap a word and then a column</span></li>' +
      '<li><span class="tip-num">2</span><span>Wrong columns bounce the word back</span></li>' +
      '<li><span class="tip-num">3</span><span>Place all the words to finish</span></li>' +
      "</ol></section>";
    document.getElementById("ws-start").onclick = startGame;
  }

  function finish() {
    if (finished) return;
    finished = true;
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: WORDS.length - mistakes, total: WORDS.length, stars: stars,
        accuracy: Math.max(0, Math.round(((WORDS.length - mistakes) / WORDS.length) * 100)), timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK, save: false,
      });
      return;
    }
    render();
  }

  function renderDone() {
    var stars = calcStars();
    var right = WORDS.length - mistakes;
    var pct = Math.max(0, Math.round((right / WORDS.length) * 100));
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + pct + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + WORDS.length + "</span>" +
      '<span class="lc-ring-of">placed</span></div></div>' +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>All words placed with " + mistakes + (mistakes === 1 ? " mistake." : " mistakes.") + "</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="ws-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("ws-again").onclick = startGame;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
