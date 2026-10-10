/* Listening Comprehension – Teen2Teen 2 Unit 2
   5 short conversations · pick the activity · no script / no pictures
   Uses the shared UA Kit for sound, progress and the result screen. */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-listening-comprehension";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "1",
      audio: CDN + "f9187_conv1_mp3cut_net.mp3",
      correct: "dinner",
      options: [
        { id: "dinner", text: "Eating dinner" },
        { id: "book", text: "Reading a book" },
        { id: "tv", text: "Watching TV" }
      ]
    },
    {
      id: "2",
      audio: CDN + "5305_conv2_mp3cut_net.mp3",
      correct: "pet",
      options: [
        { id: "pet", text: "Playing with a pet" },
        { id: "homework", text: "Doing homework" },
        { id: "music", text: "Listening to music" }
      ]
    },
    {
      id: "3",
      audio: CDN + "h964021_conv3_mp3cut_net.mp3",
      correct: "phone",
      options: [
        { id: "phone", text: "Talking on the phone" },
        { id: "games", text: "Playing computer games" },
        { id: "tv", text: "Watching TV" }
      ]
    },
    {
      id: "4",
      audio: CDN + "f69584_conv4_mp3cut_net.mp3",
      correct: "table",
      options: [
        { id: "table", text: "Helping with a table" },
        { id: "homework", text: "Doing homework" },
        { id: "music", text: "Listening to music" }
      ]
    },
    {
      id: "5",
      audio: CDN + "j63931_conv5_mp3cut_net.mp3",
      correct: "book",
      options: [
        { id: "book", text: "Reading a book" },
        { id: "homework", text: "Doing homework" },
        { id: "tv", text: "Watching TV" }
      ]
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var K = window.UAKit;
  var phase = "start";     // start | play | done
  var order = [];
  var index = 0;
  var selected = null;
  var locked = false;
  var correctCount = 0;
  var currentAudio = null;
  var optionOrder = [];
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
    var btn = document.getElementById("lc-play");
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
      var done = function () { if (currentAudio === a) { currentAudio = null; } setPlayingUI(false); };
      a.onended = done;
      a.onerror = done;
      var p = a.play();
      if (p && p.catch) p.catch(done);
    } catch (e) { setPlayingUI(false); }
  }

  function prepRound() {
    selected = null;
    locked = false;
    optionOrder = shuffle(current().options.map(function (o) { return o.id; }));
  }

  function optionById(id) {
    var opts = current().options;
    for (var i = 0; i < opts.length; i++) if (opts[i].id === id) return opts[i];
    return null;
  }

  function startGame() {
    if (K) K.unlock();
    stopAudio();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    correctCount = 0;
    phase = "play";
    prepRound();
    render();
    timer = setTimeout(playAudio, 450);
  }

  function pick(id) {
    if (locked) return;
    selected = id;
    sfx("select");
    // update selection in place (no full rebuild, keeps audio and layout steady)
    app.querySelectorAll(".lc-opt").forEach(function (b) {
      b.classList.toggle("is-selected", b.getAttribute("data-id") === id);
    });
    var check = document.getElementById("lc-check");
    if (check) check.disabled = false;
  }

  function check() {
    if (locked || !selected) return;
    locked = true;
    var item = current();
    var ok = selected === item.correct;
    if (ok) { correctCount++; sfx("correct"); } else { sfx("wrong"); }
    render();
    var card = app.querySelector(".lc-card");
    if (K) K.flash(card, ok ? "ok" : "bad");

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
    }, ok ? 1000 : 1200);
  }

  function starsFromScore() {
    var total = ITEMS.length;
    var ratio = total ? correctCount / total : 0;
    if (ratio >= 1) return 3;
    if (ratio >= 0.6) return 2;
    if (correctCount > 0) return 1;
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

  function renderOptions() {
    var item = current();
    return optionOrder.map(function (id) {
      var opt = optionById(id);
      if (!opt) return "";
      var cls = "lc-opt";
      if (selected === id) cls += " is-selected";
      if (locked && id === item.correct) cls += " is-ok";
      if (locked && selected === id && id !== item.correct) cls += " is-bad";
      return '<button type="button" class="' + cls + '" data-id="' + esc(id) + '"' +
        (locked ? " disabled" : "") + ">" + esc(opt.text) + "</button>";
    }).join("");
  }

  function render() {
    if (timer) { clearTimeout(timer); timer = null; }

    if (phase === "start") {
      app.innerHTML =
        K.topbar({ title: "Listening Comprehension", pct: 0 }) +
        '<section class="lc-start ua-screen">' +
          '<div class="lc-hero" aria-hidden="true">🎧</div>' +
          "<h1>Listening Comprehension</h1>" +
          '<p class="lc-desc">Listen to each conversation and choose the <strong>activity</strong>. 5 conversations · 3 choices each.</p>' +
          '<p class="lc-muted">No script on screen — just listen.</p>' +
          '<button type="button" class="ua-btn" id="lc-start">Start</button>' +
        "</section>";
      document.getElementById("lc-start").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "lc");
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        K.topbar({ title: "Listening Comprehension", count: ITEMS.length + "/" + ITEMS.length, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({ score: correctCount, total: ITEMS.length, stars: starsFromScore(), againId: "lc-again" }) +
        "</div>";
      document.getElementById("lc-again").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "lc");
      return;
    }

    var item = current();
    var pct = (index / order.length) * 100;
    var checkDisabled = !selected || locked;

    app.innerHTML =
      K.topbar({ title: "Listening Comprehension", count: (index + 1) + " / " + order.length, pct: pct }) +
      '<section class="lc-card ua-screen">' +
        '<p class="lc-qnum">Conversation ' + (index + 1) + "</p>" +
        '<h2 class="lc-prompt">What is the activity?</h2>' +
        '<p class="lc-hint">Tap play, then choose one answer.</p>' +
        '<div class="lc-listen-row">' +
          '<button type="button" class="mc-play" id="lc-play" aria-label="Play conversation">' +
            '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
            '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
            '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
          "</button>" +
        "</div>" +
        '<div class="lc-opts">' + renderOptions() + "</div>" +
        '<button type="button" class="ua-btn lc-check" id="lc-check"' + (checkDisabled ? " disabled" : "") + ">Check</button>" +
      "</section>";

    K && K.afterRender(app, "lc");

    document.getElementById("lc-play").onclick = function () { sfx("tap"); playAudio(); };
    app.querySelectorAll(".lc-opt[data-id]").forEach(function (btn) {
      btn.onclick = function () { pick(btn.getAttribute("data-id")); };
    });
    document.getElementById("lc-check").onclick = check;
    if (currentAudio && !currentAudio.paused) setPlayingUI(true);
  }

  render();
})();
