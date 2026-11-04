/* Listening · Activity & relationship — Teen2Teen 2 Unit 1
   4 conversations. The student hears the audio and writes the activity and the
   relationship in each sentence (e.g. "She ___ with her ___."). Uses the shared UA Kit. */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u1-listening-activities";

  // sentence: parts around the two blanks. blanks: accepted answers for each blank (normalised).
  var ITEMS = [
    {
      id: "1",
      audio: "https://cdn.imgurl.ir/uploads/n65149_.mp3",
      parts: ["She", "with her", "."],
      blanks: [
        { label: "activity", answer: "playing soccer", accept: ["playing soccer"] },
        { label: "relationship", answer: "teammates", accept: ["teammates", "teammate"] }
      ]
    },
    {
      id: "2",
      audio: "https://cdn.imgurl.ir/uploads/j13657_.mp3",
      parts: ["He", "with his", "."],
      blanks: [
        { label: "activity", answer: "watching TV", accept: ["watching tv", "watching television"] },
        { label: "relationship", answer: "neighbor", accept: ["neighbor", "neighbour"] }
      ]
    },
    {
      id: "3",
      audio: "https://cdn.imgurl.ir/uploads/g820993_.mp3",
      parts: ["She", "her", "."],
      blanks: [
        { label: "activity", answer: "visiting", accept: ["visiting"] },
        { label: "relationship", answer: "aunt and uncle", accept: ["aunt and uncle", "aunt & uncle"] }
      ]
    },
    {
      id: "4",
      audio: "https://cdn.imgurl.ir/uploads/d70897_.mp3",
      parts: ["He", "to music with his", "."],
      blanks: [
        { label: "activity", answer: "listening", accept: ["listening"] },
        { label: "relationship", answer: "cousin", accept: ["cousin"] }
      ]
    }
  ];

  var TOTAL_BLANKS = ITEMS.reduce(function (n, it) { return n + it.blanks.length; }, 0);

  var app = document.getElementById("game-app");
  if (!app) return;

  var K = window.UAKit;
  var phase = "start";
  var order = [];
  var index = 0;
  var values = [];         // typed text per blank of the current item
  var locked = false;
  var correctBlanks = 0;
  var currentAudio = null;
  var timer = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // lower case, drop "is"/"'s", punctuation and extra spaces
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/’/g, "'")
      .replace(/^\s*(is|are)\s+/, "")
      .replace(/^'s\s+/, "")
      .replace(/[^a-z& ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function current() { return ITEMS[order[index]]; }
  function sfx(name) { if (K) K.sfx(name); }

  function setPlayingUI(on) {
    var btn = document.getElementById("lac-play");
    if (btn) btn.classList.toggle("playing", on);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    setPlayingUI(false);
  }

  function playAudio() {
    var item = current();
    if (!item || !item.audio) return;
    stopAudio();
    try {
      var a = new Audio(item.audio);
      currentAudio = a;
      setPlayingUI(true);
      var done = function () { if (currentAudio === a) currentAudio = null; setPlayingUI(false); };
      a.onended = done;
      a.onerror = done;
      var p = a.play();
      if (p && p.catch) p.catch(done);
    } catch (e) { setPlayingUI(false); }
  }

  function prepRound() {
    values = current().blanks.map(function () { return ""; });
    locked = false;
  }

  function startGame() {
    if (K) K.unlock();
    stopAudio();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    correctBlanks = 0;
    phase = "play";
    prepRound();
    render();
    timer = setTimeout(playAudio, 450);
  }

  function allFilled() {
    return values.every(function (v) { return norm(v).length > 0; });
  }

  function refreshCheck() {
    var check = document.getElementById("lac-check");
    if (check) check.disabled = locked || !allFilled();
  }

  function check() {
    if (locked || !allFilled()) return;
    locked = true;
    var item = current();
    var oks = item.blanks.map(function (b, i) {
      return b.accept.indexOf(norm(values[i])) !== -1;
    });
    oks.forEach(function (ok) { if (ok) correctBlanks++; });
    var allOk = oks.every(Boolean);
    sfx(allOk ? "correct" : "wrong");
    render();
    var card = app.querySelector(".lac-card");
    if (K) K.flash(card, allOk ? "ok" : "bad");

    setTimeout(function () {
      stopAudio();
      if (index < order.length - 1) {
        index++;
        sfx("next");
        prepRound();
        render();
        timer = setTimeout(playAudio, 350);
      } else {
        finishGame();
      }
    }, allOk ? 1300 : 1900);
  }

  function starsFromScore() {
    var ratio = TOTAL_BLANKS ? correctBlanks / TOTAL_BLANKS : 0;
    if (ratio >= 1) return 3;
    if (ratio >= 0.6) return 2;
    if (correctBlanks > 0) return 1;
    return 0;
  }

  function finishGame() {
    phase = "done";
    stopAudio();
    var stars = starsFromScore();
    try {
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
    } catch (e) {}
    sfx(stars >= 2 ? "win" : "lose");
    render();
    if (K) K.celebrate(app.querySelector(".ua-done"));
  }

  function renderSentence() {
    var item = current();
    var html = '<span class="lac-text">' + esc(item.parts[0]) + "</span>";
    item.blanks.forEach(function (b, i) {
      var ok = locked && norm(values[i]) && b.accept.indexOf(norm(values[i])) !== -1;
      var bad = locked && !ok;
      var cls = "lac-input" + (locked ? (ok ? " is-ok" : " is-bad") : "");
      var w = Math.max(8, Math.min(22, b.answer.length + 2));
      html += '<input type="text" class="' + cls + '" data-blank="' + i + '" aria-label="' + esc(b.label) + '"' +
        ' style="--w:' + w + 'ch" value="' + esc(values[i]) + '"' + (locked ? " disabled" : "") +
        ' autocomplete="off" autocapitalize="none" spellcheck="false">';
      if (locked && bad) {
        html += '<span class="lac-answer">' + esc(b.answer) + "</span>";
      }
      html += '<span class="lac-text">' + esc(item.parts[i + 1] || "") + "</span>";
    });
    return html;
  }

  function render() {
    if (timer) { clearTimeout(timer); timer = null; }

    if (phase === "start") {
      app.innerHTML =
        K.topbar({ title: "Listening · Activity & relationship", pct: 0 }) +
        '<section class="yn-start ua-screen">' +
          '<div class="yn-hero" aria-hidden="true">🎧</div>' +
          "<h1>Listening · Activity &amp; relationship</h1>" +
          '<p class="yn-desc">Listen to 4 conversations. Write the activity and the relationship in each sentence.</p>' +
          '<p class="yn-muted">Type the missing words, then press Check.</p>' +
          '<button type="button" class="ua-btn" id="lac-start">Start</button>' +
        "</section>";
      document.getElementById("lac-start").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "lac");
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        K.topbar({ title: "Listening · Activity & relationship", count: ITEMS.length + "/" + ITEMS.length, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({ score: correctBlanks, total: TOTAL_BLANKS, stars: starsFromScore(), againId: "lac-again" }) +
        "</div>";
      document.getElementById("lac-again").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "lac");
      return;
    }

    var pct = (index / order.length) * 100;
    app.innerHTML =
      K.topbar({ title: "Listening · Activity & relationship", count: (index + 1) + " / " + order.length, pct: pct }) +
      '<section class="lac-card ua-screen">' +
        '<p class="lac-qnum">Conversation ' + (index + 1) + "</p>" +
        '<p class="lac-hint">Tap play, then write the activity and the relationship.</p>' +
        '<button type="button" class="mc-play" id="lac-play" aria-label="Play conversation">' +
          '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
          '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<div class="lac-sentence">' + renderSentence() + "</div>" +
        '<button type="button" class="ua-btn" id="lac-check"' + (locked || !allFilled() ? " disabled" : "") + ">Check</button>" +
      "</section>";

    K && K.afterRender(app, "lac");

    document.getElementById("lac-play").onclick = function () { sfx("tap"); playAudio(); };
    app.querySelectorAll(".lac-input").forEach(function (inp) {
      inp.oninput = function () {
        values[Number(inp.getAttribute("data-blank"))] = inp.value;
        refreshCheck();
      };
      inp.onkeydown = function (e) {
        if (e.key === "Enter") { e.preventDefault(); if (!locked && allFilled()) check(); }
      };
    });
    document.getElementById("lac-check").onclick = check;
    if (currentAudio && !currentAudio.paused) setPlayingUI(true);
  }

  render();
})();
