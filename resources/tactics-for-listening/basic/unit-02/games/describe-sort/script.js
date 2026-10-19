/* Describe People · Tactics For Listening Basic Unit 2
 * One word at a time. Tap Age, Height or Hair for the word.
 * A right answer moves on; a wrong one shakes and you try again.
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

  // the words from the list (curly is the example, so it is left out of the game)
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
  var order = [];
  var idx = 0;
  var mistakes = 0;
  var locked = false;
  var status = { text: "", kind: "" };
  var wrongCat = null;
  var rightCat = null;
  var nextTimer = null;
  var playRecorded = false;

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
  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label;
    return id;
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
    var right = Math.max(0, WORDS.length - mistakes);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Describe People",
          category: "tactics-for-listening", unit: "basic-2",
          score: right, maxScore: WORDS.length,
          accuracy: Math.round((right / WORDS.length) * 100),
          completed: true, stars: stars,
        });
      }
    } catch (e) {}
  }

  function clearNext() {
    if (nextTimer) { clearTimeout(nextTimer); nextTimer = null; }
  }

  function startGame() {
    clearNext();
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(WORDS);
    idx = 0;
    mistakes = 0;
    locked = false;
    wrongCat = null;
    rightCat = null;
    status = { text: "Tap the word's group.", kind: "" };
    playRecorded = false;
    phase = "play";
    render();
  }

  function answer(cat) {
    if (locked || phase !== "play") return;
    var item = order[idx];
    if (cat === item.cat) {
      locked = true;
      wrongCat = null;
      rightCat = cat;
      sfx("correct");
      status = { text: "Yes! " + item.w + " is " + catLabel(cat).toLowerCase() + ".", kind: "is-ok" };
      render();
      nextTimer = setTimeout(next, 900);
    } else {
      mistakes++;
      sfx("wrong");
      wrongCat = cat;
      status = { text: "Not quite. Try again.", kind: "is-bad" };
      render();
      setTimeout(function () { wrongCat = null; if (phase === "play" && !locked) render(); }, 380);
    }
  }

  function next() {
    nextTimer = null;
    if (idx + 1 >= order.length) { finish(); return; }
    idx++;
    locked = false;
    wrongCat = null;
    rightCat = null;
    status = { text: "Tap the word's group.", kind: "" };
    render();
  }

  function finish() {
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    var right = Math.max(0, WORDS.length - mistakes);
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: right, total: WORDS.length, stars: stars,
        accuracy: Math.round((right / WORDS.length) * 100), timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK, save: false,
      });
      return;
    }
    render();
  }

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>Describe People</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Word ' + (idx + 1) + " of " + order.length + '">' +
      order.map(function (_, i) {
        var cls = i < idx ? "is-done" : i === idx ? "is-current" : "";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function btnHtml(c) {
    var cls = "ds-btn";
    if (rightCat === c.id) cls += " is-right";
    if (wrongCat === c.id) cls += " is-wrong";
    return (
      '<button type="button" class="' + cls + '" data-cat="' + c.id + '"' + (locked ? " disabled" : "") + ">" +
      esc(c.label) + "</button>"
    );
  }

  function renderPlay() {
    var item = order[idx];
    app.innerHTML =
      topBar((idx + 1) + " / " + order.length) +
      segments() +
      '<main class="lc-main"><div class="ds-wrap">' +
      '<section class="ds-card" aria-live="polite">' +
      '<p class="ds-prompt">Which group does this word belong to?</p>' +
      '<p class="ds-word">' + esc(item.w) + "</p>" +
      "</section>" +
      '<p class="ds-status ' + status.kind + '">' + esc(status.text) + "</p>" +
      '<div class="ds-btns">' + CATS.map(btnHtml).join("") + "</div>" +
      "</div></main>";
    bind();
  }

  function bind() {
    app.querySelectorAll(".ds-btn").forEach(function (b) {
      b.onclick = function () { answer(b.getAttribute("data-cat")); };
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🧑</div>' +
      "<h1>Describe People</h1>" +
      '<p class="lc-intro-lede">Read each word and tap the group it belongs to: Age, Height or Hair.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ds-start">Start →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Read the word</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap <strong>Age</strong>, <strong>Height</strong> or <strong>Hair</strong></span></li>' +
      '<li><span class="tip-num">3</span><span>A wrong group shakes, so try another</span></li>' +
      "</ol></section>";
    document.getElementById("ds-start").onclick = startGame;
  }

  function renderDone() {
    var stars = calcStars();
    var right = Math.max(0, WORDS.length - mistakes);
    var pct = Math.round((right / WORDS.length) * 100);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + pct + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + WORDS.length + "</span>" +
      '<span class="lc-ring-of">words</span></div></div>' +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>All words done with " + mistakes + (mistakes === 1 ? " mistake." : " mistakes.") + "</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="ds-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("ds-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
