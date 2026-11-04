/* Listening · Verb forms — Teen2Teen 2 Unit 1
   4 conversations. In each one the student hears the audio and circles the
   correct verb form for two sentences (e.g. "He's doing / not doing his homework").
   Uses the shared UA Kit for sound, progress and the result screen. */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u1-listening-verb-forms";

  // rows: pre (before the choice), opts (the two choices), post (after), correct (index of the right choice)
  var ITEMS = [
    {
      id: "1",
      audio: "https://cdn.imgurl.ir/uploads/g26479_.mp3",
      rows: [
        { pre: "He's", opts: ["doing", "not doing"], post: "his homework.", correct: 1 },
        { pre: "He's", opts: ["watching", "not watching"], post: "TV.", correct: 0 }
      ]
    },
    {
      id: "2",
      audio: "https://cdn.imgurl.ir/uploads/v337390_.mp3",
      rows: [
        { pre: "She's", opts: ["calling", "not calling"], post: "her friend.", correct: 0 },
        { pre: "She's", opts: ["playing", "not playing"], post: "video games.", correct: 1 }
      ]
    },
    {
      id: "3",
      audio: "https://cdn.imgurl.ir/uploads/p960522_.mp3",
      rows: [
        { pre: "He's", opts: ["visiting", "not visiting"], post: "his grandma.", correct: 0 },
        { pre: "She's", opts: ["swimming", "not swimming"], post: "at the beach.", correct: 0 }
      ]
    },
    {
      id: "4",
      audio: "https://cdn.imgurl.ir/uploads/o54333_.mp3",
      rows: [
        { pre: "He's", opts: ["wearing", "not wearing"], post: "his new T-shirt.", correct: 1 },
        { pre: "His mom's", opts: ["writing", "not writing"], post: "an e-mail.", correct: 0 }
      ]
    }
  ];

  var TOTAL_ROWS = ITEMS.reduce(function (n, it) { return n + it.rows.length; }, 0);

  var app = document.getElementById("game-app");
  if (!app) return;

  var K = window.UAKit;
  var phase = "start";     // start | play | done
  var order = [];
  var index = 0;
  var sel = [];            // chosen option index per row of the current item
  var locked = false;
  var correctRows = 0;
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

  function current() { return ITEMS[order[index]]; }
  function sfx(name) { if (K) K.sfx(name); }

  function setPlayingUI(on) {
    var btn = document.getElementById("lvf-play");
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
    sel = current().rows.map(function () { return null; });
    locked = false;
  }

  function startGame() {
    if (K) K.unlock();
    stopAudio();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    correctRows = 0;
    phase = "play";
    prepRound();
    render();
    timer = setTimeout(playAudio, 450);
  }

  function pick(row, opt) {
    if (locked) return;
    sel[row] = opt;
    sfx("select");
    app.querySelectorAll('.lvf-opt[data-row="' + row + '"]').forEach(function (b) {
      b.classList.toggle("is-selected", Number(b.getAttribute("data-opt")) === opt);
    });
    var check = document.getElementById("lvf-check");
    if (check) check.disabled = sel.some(function (s) { return s === null; });
  }

  function check() {
    if (locked || sel.some(function (s) { return s === null; })) return;
    locked = true;
    var item = current();
    var rowsOk = 0;
    item.rows.forEach(function (row, r) {
      var ok = sel[r] === row.correct;
      if (ok) { rowsOk++; correctRows++; }
      app.querySelectorAll('.lvf-opt[data-row="' + r + '"]').forEach(function (b) {
        var o = Number(b.getAttribute("data-opt"));
        if (o === row.correct) b.classList.add("is-ok");
        if (o === sel[r] && !ok) b.classList.add("is-bad");
      });
    });
    var allOk = rowsOk === item.rows.length;
    sfx(allOk ? "correct" : "wrong");
    var card = app.querySelector(".lvf-card");
    if (K) K.flash(card, allOk ? "ok" : "bad");
    var check = document.getElementById("lvf-check");
    if (check) check.disabled = true;

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
    }, allOk ? 1300 : 1700);
  }

  function starsFromScore() {
    var ratio = TOTAL_ROWS ? correctRows / TOTAL_ROWS : 0;
    if (ratio >= 1) return 3;
    if (ratio >= 0.6) return 2;
    if (correctRows > 0) return 1;
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

  function renderRows() {
    var item = current();
    return item.rows.map(function (row, r) {
      var opts = row.opts.map(function (label, o) {
        var cls = "lvf-opt";
        if (sel[r] === o) cls += " is-selected";
        if (locked && o === row.correct) cls += " is-ok";
        if (locked && sel[r] === o && o !== row.correct) cls += " is-bad";
        return '<button type="button" class="' + cls + '" data-row="' + r + '" data-opt="' + o + '"' +
          (locked ? " disabled" : "") + ">" + esc(label) + "</button>";
      });
      return '<div class="lvf-row">' +
        '<span class="lvf-pre">' + esc(row.pre) + "</span>" +
        opts.join('<span class="lvf-slash">/</span>') +
        '<span class="lvf-post">' + esc(row.post) + "</span>" +
        "</div>";
    }).join("");
  }

  function render() {
    if (timer) { clearTimeout(timer); timer = null; }

    if (phase === "start") {
      app.innerHTML =
        K.topbar({ title: "Listening · Verb forms", pct: 0 }) +
        '<section class="yn-start ua-screen">' +
          '<div class="yn-hero" aria-hidden="true">🎧</div>' +
          "<h1>Listening · Verb forms</h1>" +
          '<p class="yn-desc">Listen to 4 conversations and circle the correct verb form. 8 choices.</p>' +
          '<p class="yn-muted">Circle one choice in each sentence, then press Check.</p>' +
          '<button type="button" class="ua-btn" id="lvf-start">Start</button>' +
        "</section>";
      document.getElementById("lvf-start").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "lvf");
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        K.topbar({ title: "Listening · Verb forms", count: ITEMS.length + "/" + ITEMS.length, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({ score: correctRows, total: TOTAL_ROWS, stars: starsFromScore(), againId: "lvf-again" }) +
        "</div>";
      document.getElementById("lvf-again").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "lvf");
      return;
    }

    var pct = (index / order.length) * 100;
    var ready = sel.every(function (s) { return s !== null; });

    app.innerHTML =
      K.topbar({ title: "Listening · Verb forms", count: (index + 1) + " / " + order.length, pct: pct }) +
      '<section class="lvf-card ua-screen">' +
        '<p class="lvf-qnum">Conversation ' + (index + 1) + "</p>" +
        '<p class="lvf-hint">Tap play, then circle the correct form.</p>' +
        '<button type="button" class="mc-play" id="lvf-play" aria-label="Play conversation">' +
          '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
          '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<div class="lvf-rows">' + renderRows() + "</div>" +
        '<button type="button" class="ua-btn" id="lvf-check"' + (ready && !locked ? "" : " disabled") + ">Check</button>" +
      "</section>";

    K && K.afterRender(app, "lvf");

    document.getElementById("lvf-play").onclick = function () { sfx("tap"); playAudio(); };
    app.querySelectorAll(".lvf-opt").forEach(function (btn) {
      btn.onclick = function () {
        pick(Number(btn.getAttribute("data-row")), Number(btn.getAttribute("data-opt")));
      };
    });
    document.getElementById("lvf-check").onclick = check;
    if (currentAudio && !currentAudio.paused) setPlayingUI(true);
  }

  render();
})();
