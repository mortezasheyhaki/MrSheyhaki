/* Match Making · Tactics For Listening · Basic Unit 3
 * Picture–word matching: tap a picture, then its word.
 * 3 sets × 6 items = 18 items. Uses LAStars, LAFinish and LASfx when present.
 * No audio files: sound effects come from la-sfx.js (Web Audio).
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-match-making";
  var GAME_NAME = "Match Making";
  var BACK = "../../";           // back to Unit 3
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // 18 clothing items: word + picture (in the order given by the teacher)
  var ITEMS = [
    { word: "hat",          img: CDN + "r169150_1_hat.png" },
    { word: "suit",         img: CDN + "v024303_2_suit.png" },
    { word: "shorts",       img: CDN + "n6011_3_shorts.png" },
    { word: "t-shirt",      img: CDN + "g67187_4_t-shirt.png" },
    { word: "sunglasses",   img: CDN + "w548371_5_sungles.png" },
    { word: "pants",        img: CDN + "g74996_6_pants.png" },
    { word: "shirt",        img: CDN + "i55962_7_shirt.png" },
    { word: "sneakers",     img: CDN + "u66294_8_sneakers.png" },
    { word: "blouse",       img: CDN + "l42876_9_blouse.png" },
    { word: "shoulder bag", img: CDN + "i485064_10_shoulder_bag.png" },
    { word: "jeans",        img: CDN + "a0530_11_jeans.png" },
    { word: "tie",          img: CDN + "d76362_12_tie.png" },
    { word: "sandals",      img: CDN + "b957218_13_sandals.png" },
    { word: "jacket",       img: CDN + "j0645_14_jacket.png" },
    { word: "dress",        img: CDN + "k538683_15_dress.png" },
    { word: "scarf",        img: CDN + "u560407_16_scarf.png" },
    { word: "windbreaker",  img: CDN + "b180437_17_windbreaker.png" },
    { word: "skirt",        img: CDN + "x0670_18_st.png" }
  ];

  var SETS = [ITEMS.slice(0, 6), ITEMS.slice(6, 12), ITEMS.slice(12, 18)];
  var SET_TITLES = ["Everyday clothes", "Clothes for going out", "Wardrobe favourites"];
  var SET_INTRO = [
    "Let's warm up! Tap a picture, then tap its word.",
    "Nice work! Set 2 has some new clothes. Take your time.",
    "Last set — you can do this! Look carefully and match each one."
  ];
  var SET_DONE = [
    "Set 1 complete! Great start — you're ready for more.",
    "Set 2 complete! You're getting really good at this.",
    "Set 3 complete! Fantastic finish to the last set."
  ];
  var ENC_OK = ["Great job!", "Excellent!", "Yes, that's it!", "You got it!", "Well done!", "Perfect match!", "Brilliant!"];
  var ENC_BAD = ["Not quite — try a different word.", "Almost! Look again.", "No worries, keep going.", "Good try — have another look."];
  var ENC_HALF = ["Halfway there! Keep it up.", "Halfway! You're doing great."];
  var ENC_END = {
    3: "Outstanding! You matched almost everything the first time!",
    2: "Well done! You really know your clothes.",
    1: "Good effort! Practise these words and try again.",
    0: "Keep going! Every try helps you learn."
  };

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";     // start | play | setdone | done
  var setIdx = 0;
  var picOrder = [];       // item indexes (within the set) shown as pictures
  var wordOrder = [];      // item indexes (within the set) shown as words
  var matched = {};        // set-local index -> true
  var mistakes = {};       // set-local index -> wrong attempts on this item
  var sel = null;          // {side:"pic"|"word", i}
  var busy = false;
  var badPair = null;      // {pic, word} for the wrong attempt being shown
  var fb = { type: "info", text: "" };
  var firstTryTotal = 0;   // across all sets
  var matchedTotal = 0;    // across all sets
  var setFirstTry = 0;
  var halfShown = false;
  var playRecorded = false;
  var pendingTimer = null;  // timer that shows the set-complete screen
  var busyTimer = null;     // timer that clears a wrong-attempt shake

  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  function setItems() { return SETS[setIdx]; }
  function matchedCount() { return Object.keys(matched).length; }
  function overallPct() { return Math.round((matchedTotal / ITEMS.length) * 100); }

  function topBar(rightLabel) {
    return (
      '<header class="mm-top">' +
      '<a class="mm-back" href="' + BACK + '" aria-label="Back to Unit 3">←</a>' +
      '<div class="mm-title"><span>Unit 3 · Basic</span><strong>' + GAME_NAME + '</strong></div>' +
      '<span class="mm-pill">' + esc(rightLabel) + '</span>' +
      '</header>'
    );
  }
  function progressBar() {
    var pct = overallPct();
    return (
      '<div class="mm-progress" role="progressbar" aria-label="Overall progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
      '<div class="mm-bar"><span style="width:' + pct + '%"></span></div>' +
      '<span class="mm-progress-label">' + matchedTotal + '/' + ITEMS.length + '</span>' +
      '</div>'
    );
  }

  /* ---------- screens ---------- */
  function renderStart() {
    var chips = SETS.map(function (s, i) {
      return '<div class="mm-set-chip"><b>Set ' + (i + 1) + '</b><span>' + esc(SET_TITLES[i]) + ' · 6 items</span></div>';
    }).join("");
    app.innerHTML =
      topBar("3 sets") +
      '<section class="mm-card mm-hero">' +
      '<div class="mm-emoji" aria-hidden="true">👕</div>' +
      '<h1>Match Making</h1>' +
      '<p>Look at each picture and find its word. Tap a picture, then tap the matching word. Match all six in a set to move on.</p>' +
      '<div class="mm-sets">' + chips + '</div>' +
      '<button type="button" class="mm-btn" id="mm-start">Start ▶</button>' +
      '</section>';
    document.getElementById("mm-start").onclick = startGame;
  }

  function renderPlay() {
    var items = setItems();
    var bannerText = SET_INTRO[setIdx];

    var pics = picOrder.map(function (i) {
      var it = items[i];
      var st = pickClass("pic", i);
      return '<button type="button" class="mm-tile ' + st.cls + '" data-side="pic" data-i="' + i + '" ' + st.dis + ' aria-label="Picture">' +
        '<span class="mm-pic"><img src="' + esc(it.img) + '" alt="' + esc(it.word) + '" loading="lazy" onerror="this.parentNode.classList.add(\'is-noimg\')"></span>' +
        '</button>';
    }).join("");

    var words = wordOrder.map(function (i) {
      var it = items[i];
      var st = pickClass("word", i);
      return '<button type="button" class="mm-tile ' + st.cls + '" data-side="word" data-i="' + i + '" ' + st.dis + '>' +
        '<span class="mm-word">' + esc(it.word) + '</span>' +
        '</button>';
    }).join("");

    app.innerHTML =
      topBar("Set " + (setIdx + 1) + " of 3") +
      progressBar() +
      '<section class="mm-card mm-banner">' +
      '<div class="mm-setno" aria-hidden="true">' + (setIdx + 1) + '</div>' +
      '<p class="mm-msg"><small>' + esc(SET_TITLES[setIdx]) + ' · ' + matchedCount() + ' of 6 matched</small>' + esc(bannerText) + '</p>' +
      '</section>' +
      '<section class="mm-card mm-board">' +
      '<div><p class="mm-section-label">Pictures</p><div class="mm-grid">' + pics + '</div></div>' +
      '<div><p class="mm-section-label">Words</p><div class="mm-grid mm-grid-words">' + words + '</div></div>' +
      '</section>' +
      '<div class="mm-feedback ' + (fb.type === "ok" ? "is-ok" : fb.type === "bad" ? "is-bad" : "is-info") + '" role="status" aria-live="polite">' +
      esc(fb.type === "info" ? "" : fb.text) + '</div>';

    bindTiles();
  }

  function pickClass(side, i) {
    var cls = "";
    var dis = "";
    if (matched[i]) { cls = "is-ok"; dis = "disabled"; }
    else if (badPair && ((side === "pic" && badPair.pic === i) || (side === "word" && badPair.word === i))) cls = "is-bad";
    else if (sel && sel.side === side && sel.i === i) cls = "is-selected";
    return { cls: cls, dis: dis };
  }

  function renderSetDone() {
    var last = setIdx === SETS.length - 1;
    var msg = SET_DONE[setIdx];
    app.innerHTML =
      topBar("Set " + (setIdx + 1) + " of 3") +
      progressBar() +
      '<section class="mm-card mm-complete">' +
      '<div class="mm-emoji" aria-hidden="true">🎉</div>' +
      '<h2>' + (last ? "All sets done!" : "Set " + (setIdx + 1) + " complete!") + '</h2>' +
      '<p>' + esc(msg) + '</p>' +
      '<span class="mm-stat">' + setFirstTry + ' of 6 right first time</span>' +
      '<button type="button" class="mm-btn" id="mm-next">' + (last ? "See my results ▶" : "Next set ▶") + '</button>' +
      '</section>';
    document.getElementById("mm-next").onclick = function () {
      if (setIdx === SETS.length - 1) finishGame();
      else startSet(setIdx + 1);
    };
  }

  /* ---------- logic ---------- */
  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    if (window.LAStars && !playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    firstTryTotal = 0;
    matchedTotal = 0;
    startSet(0);
  }

  function startSet(i) {
    clearTimeout(pendingTimer); pendingTimer = null;
    clearTimeout(busyTimer); busyTimer = null;
    setIdx = i;
    picOrder = shuffle(SETS[i].map(function (_, k) { return k; }));
    wordOrder = shuffle(SETS[i].map(function (_, k) { return k; }));
    matched = {};
    mistakes = {};
    sel = null;
    busy = false;
    badPair = null;
    setFirstTry = 0;
    halfShown = false;
    fb = { type: "info", text: "" };
    phase = "play";
    render();
  }

  function bindTiles() {
    app.querySelectorAll(".mm-tile").forEach(function (el) {
      el.addEventListener("click", function () {
        if (busy) return;
        onTile(el.getAttribute("data-side"), parseInt(el.getAttribute("data-i"), 10));
      });
    });
  }

  function onTile(side, i) {
    if (matched[i]) return;
    if (!sel) {
      sel = { side: side, i: i };
      sfx("click");
      render();
      return;
    }
    if (sel.side === side) {
      // same side: move the selection
      if (sel.i === i) sel = null; else sel = { side: side, i: i };
      sfx("click");
      render();
      return;
    }
    // opposite side: a match attempt
    var a = sel;
    var b = { side: side, i: i };
    var picI = a.side === "pic" ? a.i : b.i;
    var wordI = a.side === "word" ? a.i : b.i;
    if (picI === wordI) {
      matched[picI] = true;
      matchedTotal += 1;
      if (!mistakes[picI]) { firstTryTotal += 1; setFirstTry += 1; }
      sel = null;
      var done = matchedCount() === SETS[setIdx].length;
      var text = pick(ENC_OK) + " " + SETS[setIdx][picI].word + "!";
      if (!halfShown && matchedCount() === 3) { halfShown = true; text = pick(ENC_HALF); }
      fb = { type: "ok", text: text };
      sfx("correct");
      if (done) {
        // keep the last correct match on screen briefly, then show the set-complete card
        sfx("pop");
        busy = true;
        render();
        var doneSet = setIdx;
        clearTimeout(pendingTimer);
        pendingTimer = setTimeout(function () {
          pendingTimer = null;
          if (setIdx !== doneSet || phase !== "play") return; // player already moved on
          busy = false;
          phase = "setdone";
          renderSetDone();
        }, 900);
        return;
      }
      render();
    } else {
      mistakes[picI] = (mistakes[picI] || 0) + 1;
      busy = true;
      badPair = { pic: picI, word: wordI };
      sel = null;
      fb = { type: "bad", text: pick(ENC_BAD) };
      sfx("wrong");
      render();
      var wrongSet = setIdx;
      clearTimeout(busyTimer);
      busyTimer = setTimeout(function () {
        busyTimer = null;
        if (setIdx !== wrongSet || phase !== "play") return;
        busy = false;
        badPair = null;
        render();
      }, 650);
    }
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "play") return renderPlay();
    if (phase === "setdone") return renderSetDone();
    if (phase === "done") return; // finish screen is handled by LAFinish
  }

  function starsFor(pct) {
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    if (pct >= 40) return 1;
    return 0;
  }

  function finishGame() {
    phase = "done";
    var total = ITEMS.length;
    var pct = Math.round((firstTryTotal / total) * 100);
    var stars = starsFor(pct);
    var timeMs = 0;
    if (window.LAStars) LAStars.save(GAME_ID, stars);
    sfx("win");

    if (window.LAFinish) {
      timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        gameName: GAME_NAME,
        score: firstTryTotal,
        total: total,
        stars: stars,
        accuracy: pct,
        timeMs: timeMs,
        title: stars === 3 ? "Perfect!" : stars === 2 ? "Well done!" : stars === 1 ? "Good effort!" : "Keep practising!",
        onAgain: function () { phase = "start"; render(); },
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false
      });
      return;
    }

    // fallback result card when la-finish is not loaded
    app.innerHTML =
      topBar("Done") +
      '<section class="mm-card mm-complete">' +
      '<div class="mm-emoji" aria-hidden="true">🏆</div>' +
      '<h2>' + esc(ENC_END[stars]) + '</h2>' +
      '<p>You got ' + firstTryTotal + ' of ' + total + ' right first time.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
      '<button type="button" class="mm-btn" id="mm-again">Play again</button>' +
      '<a class="mm-btn" href="' + BACK + '" style="text-decoration:none">Back to Unit 3</a>' +
      '</div></section>';
    document.getElementById("mm-again").onclick = function () { phase = "start"; render(); };
  }

  render();
})();
