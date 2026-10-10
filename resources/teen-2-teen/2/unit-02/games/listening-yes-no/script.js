/* Listening Yes/No – Teen2Teen 2 Unit 2
   5 conversations · circle Yes / No · no dialogue script
   Uses the shared UA Kit for sound, progress and the result screen. */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-listening-yes-no";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "1",
      audio: CDN + "c736053_conve1.mp3",
      question: "Is Evan doing the geography homework?",
      correct: "no",
      options: [
        { id: "yes", text: "Yes, he is." },
        { id: "no", text: "No, he's not." }
      ]
    },
    {
      id: "2",
      audio: CDN + "b222238_conve2.mp3",
      question: "Is Molly babysitting her little sister?",
      correct: "yes",
      options: [
        { id: "yes", text: "Yes, she is." },
        { id: "no", text: "No, she's not." }
      ]
    },
    {
      id: "3",
      audio: CDN + "u351167_conve3.mp3",
      question: "Is Mike helping his dad?",
      correct: "yes",
      options: [
        { id: "yes", text: "Yes, he is." },
        { id: "no", text: "No, he's not." }
      ]
    },
    {
      id: "4",
      audio: CDN + "w607998_conve4.mp3",
      question: "Are Marcia and Johnny reading?",
      correct: "no",
      options: [
        { id: "yes", text: "Yes, they are." },
        { id: "no", text: "No, they're not." }
      ]
    },
    {
      id: "5",
      audio: CDN + "i622350_conve5.mp3",
      question: "Is Danny helping his little brother?",
      correct: "yes",
      options: [
        { id: "yes", text: "Yes, he is." },
        { id: "no", text: "No, he's not." }
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
    var btn = document.getElementById("yn-play");
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
    app.querySelectorAll(".yn-opt").forEach(function (b) {
      b.classList.toggle("is-selected", b.getAttribute("data-id") === id);
    });
    var check = document.getElementById("yn-check");
    if (check) check.disabled = false;
  }

  function check() {
    if (locked || !selected) return;
    locked = true;
    var item = current();
    var ok = selected === item.correct;
    if (ok) { correctCount++; sfx("correct"); } else { sfx("wrong"); }
    render();
    var card = app.querySelector(".yn-card");
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
      var cls = "yn-opt";
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
        K.topbar({ title: "Listening · Yes / No", pct: 0 }) +
        '<section class="yn-start ua-screen">' +
          '<div class="yn-hero" aria-hidden="true">✅</div>' +
          "<h1>Listening · Yes / No</h1>" +
          '<p class="yn-desc">Listen to each conversation and choose the correct answer. 5 questions.</p>' +
          '<p class="yn-muted">No dialogue script — just listen.</p>' +
          '<button type="button" class="ua-btn" id="yn-start">Start</button>' +
        "</section>";
      document.getElementById("yn-start").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "yn");
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        K.topbar({ title: "Listening · Yes / No", count: ITEMS.length + "/" + ITEMS.length, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({ score: correctCount, total: ITEMS.length, stars: starsFromScore(), againId: "yn-again" }) +
        "</div>";
      document.getElementById("yn-again").onclick = function () { sfx("tap"); startGame(); };
      K && K.afterRender(app, "yn");
      return;
    }

    var item = current();
    var pct = (index / order.length) * 100;
    var checkDisabled = !selected || locked;

    app.innerHTML =
      K.topbar({ title: "Listening · Yes / No", count: (index + 1) + " / " + order.length, pct: pct }) +
      '<section class="yn-card ua-screen">' +
        '<p class="yn-qnum">Question ' + (index + 1) + "</p>" +
        '<h2 class="yn-prompt">' + esc(item.question) + "</h2>" +
        '<p class="yn-hint">Tap play, then choose Yes or No.</p>' +
        '<div class="yn-listen-row">' +
          '<button type="button" class="mc-play" id="yn-play" aria-label="Play conversation">' +
            '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
            '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
            '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
          "</button>" +
        "</div>" +
        '<div class="yn-opts">' + renderOptions() + "</div>" +
        '<button type="button" class="ua-btn yn-check" id="yn-check"' + (checkDisabled ? " disabled" : "") + ">Check</button>" +
      "</section>";

    K && K.afterRender(app, "yn");

    document.getElementById("yn-play").onclick = function () { sfx("tap"); playAudio(); };
    app.querySelectorAll(".yn-opt[data-id]").forEach(function (btn) {
      btn.onclick = function () { pick(btn.getAttribute("data-id")); };
    });
    document.getElementById("yn-check").onclick = check;
    if (currentAudio && !currentAudio.paused) setPlayingUI(true);
  }

  render();
})();
