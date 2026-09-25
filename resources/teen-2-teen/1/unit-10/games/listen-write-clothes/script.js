/* Listen & Write · Clothes — Teen2Teen 1 Unit 10
   Part 1: Look & Write (picture, no audio)
   Part 2: Listen & Write (audio, no picture) */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u10-listen-write-clothes";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "sweater", word: "sweater", label: "a sweater",
      answers: ["sweater", "a sweater"],
      image: CDN + "q049292_swer.png", audio: CDN + "d159367_a_swer.mp3" },
    { id: "skirt", word: "skirt", label: "a skirt",
      answers: ["skirt", "a skirt"],
      image: CDN + "a444189_st.png", audio: CDN + "b668114_st.mp3" },
    { id: "shorts", word: "shorts", label: "shorts",
      answers: ["shorts"],
      image: CDN + "p155179_shorts.png", audio: CDN + "b61351_shorts_2.mp3" },
    { id: "shoes", word: "shoes", label: "shoes",
      answers: ["shoes"],
      image: CDN + "i80933_shoes.png", audio: CDN + "y529847_shoes_3.mp3" },
    { id: "shirt", word: "shirt", label: "a shirt",
      answers: ["shirt", "a shirt"],
      image: CDN + "y409033_shirt.png", audio: CDN + "f1066_a_shirt.mp3" },
    { id: "pants", word: "pants", label: "pants",
      answers: ["pants"],
      image: CDN + "b63746_pants.png", audio: CDN + "e126543_pants_2.mp3" },
    { id: "jeans", word: "jeans", label: "jeans",
      answers: ["jeans"],
      image: CDN + "s86734_jeans.png", audio: CDN + "p371082_jeans_3.mp3" },
    { id: "jacket", word: "jacket", label: "a jacket",
      answers: ["jacket", "a jacket"],
      image: CDN + "n731967_jacket.png", audio: CDN + "c58647_a_jacket.mp3" },
    { id: "dress", word: "dress", label: "a dress",
      answers: ["dress", "a dress"],
      image: CDN + "e35407_dress.png", audio: CDN + "m241908_a_dress.mp3" },
    { id: "blouse", word: "blouse", label: "a blouse",
      answers: ["blouse", "a blouse"],
      image: CDN + "d598847_blouse.png", audio: CDN + "m041818_a_blouse.mp3" }
  ];

  var MODES = [
    {
      id: "look",
      title: "Look & Write",
      tip: "Look at the picture. Type the clothes word.",
      betweenTitle: "Great job!",
      betweenText: "Now listen and write the words — no picture this time."
    },
    {
      id: "listen",
      title: "Listen & Write",
      tip: "Listen, then type the clothes word.",
      betweenTitle: "",
      betweenText: ""
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | between | done
  var modeIndex = 0;
  var order = [];
  var index = 0;
  var score = 0;
  var locked = false;
  var currentAudio = null;
  var sfxCtx = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") {
      try {
        sfxCtx.resume();
      } catch (_) {}
    }
    return sfxCtx;
  }

  function tone(freq, dur, type, gain, delay) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.12), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) LASfx.correct();
        else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
        else if (name === "click" && LASfx.click) LASfx.click();
        else if (name === "win" && LASfx.win) LASfx.win();
      }
    } catch (_) {}
    try {
      if (name === "click") {
        tone(480, 0.04, "triangle", 0.08);
      } else if (name === "correct") {
        tone(523.25, 0.08, "triangle", 0.12);
        tone(659.25, 0.1, "triangle", 0.11, 0.06);
        tone(783.99, 0.12, "sine", 0.1, 0.12);
      } else if (name === "wrong") {
        tone(220, 0.1, "square", 0.07);
        tone(165, 0.14, "square", 0.05, 0.05);
      } else if (name === "win") {
        tone(523.25, 0.12, "triangle", 0.12);
        tone(659.25, 0.12, "triangle", 0.11, 0.08);
        tone(783.99, 0.14, "triangle", 0.12, 0.16);
        tone(1046.5, 0.22, "sine", 0.1, 0.26);
      }
    } catch (_) {}
  }

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, item) {
    var u = norm(user);
    if (!u) return false;
    return item.answers.some(function (a) {
      return norm(a) === u;
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    var btn = document.getElementById("lw-play");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    var item = order[index];
    if (!item || !item.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      var btn = document.getElementById("lw-play");
      if (btn) btn.classList.add("is-playing");
      currentAudio.onended = function () {
        if (btn) btn.classList.remove("is-playing");
        currentAudio = null;
      };
      currentAudio.onerror = function () {
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.play().catch(function () {
        if (btn) btn.classList.remove("is-playing");
      });
    } catch (_) {}
  }

  function currentMode() {
    return MODES[modeIndex];
  }

  function totalRounds() {
    return ITEMS.length * MODES.length;
  }

  function progressDone() {
    return modeIndex * ITEMS.length + index;
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = 0;
    score = 0;
    beginMode();
  }

  function beginMode() {
    order = shuffle(ITEMS.slice());
    index = 0;
    locked = false;
    phase = "play";
    stopAudio();
    render();
    if (currentMode().id === "listen") {
      setTimeout(playAudio, 400);
    }
  }

  function afterCorrect() {
    setTimeout(function () {
      index += 1;
      if (index >= order.length) {
        if (modeIndex < MODES.length - 1) {
          phase = "between";
          stopAudio();
          render();
        } else {
          finishGame();
        }
      } else {
        locked = false;
        render();
        if (currentMode().id === "listen") {
          setTimeout(playAudio, 300);
        }
        focusInput();
      }
    }, 700);
  }

  function afterWrong() {
    setTimeout(function () {
      index += 1;
      if (index >= order.length) {
        if (modeIndex < MODES.length - 1) {
          phase = "between";
          stopAudio();
          render();
        } else {
          finishGame();
        }
      } else {
        locked = false;
        render();
        if (currentMode().id === "listen") {
          setTimeout(playAudio, 300);
        }
        focusInput();
      }
    }, 1400);
  }

  function checkAnswer() {
    if (locked || phase !== "play") return;
    var input = document.getElementById("lw-input");
    if (!input) return;
    var item = order[index];
    var user = input.value;
    if (!norm(user)) {
      input.focus();
      return;
    }
    locked = true;
    input.disabled = true;
    var checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;
    var fb = document.getElementById("lw-fb");

    if (isCorrect(user, item)) {
      score += 1;
      sfx("correct");
      input.classList.add("ok");
      if (fb) {
        fb.textContent = "✓ " + item.label;
        fb.className = "lw-fb ok";
      }
      afterCorrect();
    } else {
      sfx("wrong");
      input.classList.add("bad");
      if (fb) {
        fb.textContent = "Answer: " + item.label;
        fb.className = "lw-fb bad";
      }
      afterWrong();
    }
  }

  function goNextMode() {
    sfx("click");
    modeIndex += 1;
    beginMode();
  }

  function finishGame() {
    stopAudio();
    phase = "done";
    sfx("win");
    var total = totalRounds();
    var stars =
      score === total ? 3 : score >= total - 3 ? 2 : score >= Math.ceil(total / 2) ? 1 : 0;

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn(e);
      }
    }
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    render();
  }

  function focusInput() {
    setTimeout(function () {
      var input = document.getElementById("lw-input");
      if (input && !input.disabled) input.focus();
    }, 80);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function playBtnHtml() {
    return (
      '<button type="button" class="lw-play" id="lw-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>"
    );
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<div class="lw-topbar-center">' +
        '<span class="lw-kicker">TEEN2TEEN 1 · UNIT 10</span>' +
        '<span class="lw-title">Listen &amp; Write</span>' +
        "</div>" +
        '<span class="lw-badge">' +
        ITEMS.length * 2 +
        "</span>" +
        "</header>" +
        '<section class="lw-start">' +
        '<div class="lw-hero">✍️</div>' +
        "<h1>Listen &amp; Write</h1>" +
        '<p class="lw-desc">Two parts — first look at the picture, then listen and type the clothes words.</p>' +
        '<ol class="lw-steps">' +
        '<li><span class="lw-step-num">1</span><span><strong>Look &amp; Write</strong> — see the picture, type the word (no audio).</span></li>' +
        '<li><span class="lw-step-num">2</span><span><strong>Listen &amp; Write</strong> — hear the word, type it (no picture).</span></li>' +
        "</ol>" +
        '<button type="button" class="lw-btn lw-btn-full" id="lw-start">Start Part 1</button>' +
        "</section>";
      document.getElementById("lw-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "between") {
      var m = currentMode();
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<div class="lw-topbar-center">' +
        '<span class="lw-kicker">TEEN2TEEN 1 · UNIT 10</span>' +
        '<span class="lw-title">Listen &amp; Write</span>' +
        "</div>" +
        '<span class="lw-badge">Part 1 ✓</span>' +
        "</header>" +
        '<section class="lw-between">' +
        "<h2>" +
        escapeHtml(m.betweenTitle || "Nice work!") +
        "</h2>" +
        "<p>" +
        escapeHtml(m.betweenText) +
        "</p>" +
        '<button type="button" class="lw-btn lw-btn-full" id="lw-next-mode">Start Part 2</button>' +
        "</section>";
      document.getElementById("lw-next-mode").onclick = goNextMode;
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<div class="lw-topbar-center">' +
        '<span class="lw-kicker">TEEN2TEEN 1 · UNIT 10</span>' +
        '<span class="lw-title">Listen &amp; Write</span>' +
        "</div></header>" +
        '<section class="lw-start">' +
        "<h1>Done!</h1>" +
        "<p class=\"lw-desc\">" +
        score +
        " / " +
        totalRounds() +
        " correct</p>" +
        '<button type="button" class="lw-btn" id="lw-again">Play again</button>' +
        "</section>";
      document.getElementById("lw-again").onclick = startGame;
      return;
    }

    // play
    var mode = currentMode();
    var item = order[index];
    var done = progressDone();
    var total = totalRounds();
    var pct = (done / total) * 100;
    var isLook = mode.id === "look";

    var promptHtml = isLook
      ? '<div class="lw-card lw-photo-wrap">' +
        '<img class="lw-photo" src="' +
        item.image +
        '" alt="" draggable="false" />' +
        "</div>"
      : '<div class="lw-card lw-listen-only">' +
        playBtnHtml() +
        '<span class="lw-listen-label">Tap to listen</span>' +
        "</div>";

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<div class="lw-topbar-center">' +
      '<span class="lw-kicker">PART ' +
      (modeIndex + 1) +
      " / " +
      MODES.length +
      "</span>" +
      '<span class="lw-title">' +
      escapeHtml(mode.title) +
      "</span>" +
      "</div>" +
      '<span class="lw-badge">' +
      (index + 1) +
      "/" +
      order.length +
      "</span>" +
      "</header>" +
      '<p class="lw-instruction">' +
      escapeHtml(mode.tip) +
      "</p>" +
      '<div class="lw-progress"><div class="lw-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      promptHtml +
      '<div class="lw-card lw-input-row">' +
      '<input class="lw-input" id="lw-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="Type the word…" enterkeyhint="done" />' +
      '<p class="lw-fb" id="lw-fb"></p>' +
      '<button type="button" class="lw-btn lw-check" id="lw-check">Check</button>' +
      "</div>";

    var input = document.getElementById("lw-input");
    var checkBtn = document.getElementById("lw-check");
    checkBtn.onclick = function () {
      sfx("click");
      checkAnswer();
    };
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    var play = document.getElementById("lw-play");
    if (play) {
      play.onclick = function () {
        sfx("click");
        playAudio();
      };
    }
    focusInput();
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
