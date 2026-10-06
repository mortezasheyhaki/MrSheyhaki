/* Adverbs · Listen & Write – AEF 1 Unit 11A
   Listen to the sentence, write only the adverb in the blank.
   Hint shows the adjective in parentheses. */
(function () {
  "use strict";

  var GAME_ID = "1-11a-adverbs-listen-write";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "quietly",
      before: "They're speaking",
      after: ".",
      adj: "quiet",
      answer: "quietly",
      answers: ["quietly"],
      full: "They're speaking quietly.",
      audio: CDN + "b46330_They39re_speaking_queitly.mp3"
    },
    {
      id: "fast",
      before: "He's driving",
      after: ".",
      adj: "fast",
      answer: "fast",
      answers: ["fast"],
      full: "He's driving fast.",
      audio: CDN + "f661006_He39s_driving_fast.mp3"
    },
    {
      id: "badly",
      before: "They're dancing",
      after: ".",
      adj: "bad",
      answer: "badly",
      answers: ["badly"],
      full: "They're dancing badly.",
      audio: CDN + "k216940_They39re_dancing_badly.mp3"
    },
    {
      id: "noisily",
      before: "They're eating",
      after: ".",
      adj: "noisy",
      answer: "noisily",
      answers: ["noisily"],
      full: "They're eating noisily.",
      audio: CDN + "s02757_She39s_ing_nosily.mp3"
    },
    {
      id: "beautifully",
      before: "She's singing",
      after: ".",
      adj: "beautiful",
      answer: "beautifully",
      answers: ["beautifully", "well"],
      full: "She's singing beautifully.",
      audio: CDN + "p62124_She39s_singing_beautifully.mp3"
    },
    {
      id: "loudly",
      before: "He's playing the piano",
      after: ".",
      adj: "loud",
      answer: "loudly",
      answers: ["loudly"],
      full: "He's playing the piano loudly.",
      audio: CDN + "n67100_He39s_aying_loudly.mp3"
    }
  ];

  var TOTAL = ITEMS.length;

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "menu"; // menu | play | done
  var order = [];
  var index = 0;
  var score = 0;
  var wrongs = 0;
  var locked = false;
  var currentAudio = null;
  var typed = "";

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) return LASfx.correct();
        if (name === "wrong" && LASfx.wrong) return LASfx.wrong();
        if (name === "click" && LASfx.click) return LASfx.click();
        if (name === "win" && LASfx.win) return LASfx.win();
      }
    } catch (_) {}
  }

  function setPlaying(on) {
    var btn = document.getElementById("lw-play");
    if (btn) btn.classList.toggle("playing", !!on);
  }

  function playAudio(item) {
    if (!item || !item.audio) return;
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      setPlaying(true);
      currentAudio.play().catch(function () {
        setPlaying(false);
      });
      currentAudio.onended = function () {
        setPlaying(false);
        currentAudio = null;
      };
    } catch (_) {
      setPlaying(false);
    }
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    setPlaying(false);
  }

  function current() {
    return order[index];
  }

  function normalize(s) {
    return String(s)
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(item, value) {
    var v = normalize(value);
    var list = item.answers || [item.answer];
    for (var i = 0; i < list.length; i++) {
      if (v === normalize(list[i])) return true;
    }
    return false;
  }

  function calcAccuracy() {
    var a = score + wrongs;
    if (a <= 0) return 0;
    return Math.round((score / a) * 100);
  }

  function calcStars() {
    var acc = calcAccuracy();
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function saveStars() {
    var stars = calcStars();
    var acc = calcAccuracy();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (typeof LAStars.saveFromAccuracy === "function") {
          stars = LAStars.saveFromAccuracy(GAME_ID, acc);
        } else {
          LAStars.save(GAME_ID, stars);
        }
      } catch (_) {}
    }
    return stars;
  }

  function goNext() {
    index += 1;
    locked = false;
    typed = "";
    stopAudio();
    if (index >= order.length) {
      finishGame();
    } else {
      render();
    }
  }

  function showContinue() {
    if (document.getElementById("lc-continue")) return;
    var fb = document.getElementById("lc-fb");
    if (!fb) return;
    var wrap = document.createElement("div");
    wrap.className = "lc-wrong-actions";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "lc-continue";
    btn.className = "lc-icon-btn lc-continue-btn is-primary";
    btn.setAttribute("aria-label", "Continue");
    btn.title = "Continue";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
    btn.onclick = function () {
      sfx("click");
      goNext();
    };
    wrap.appendChild(btn);
    fb.parentNode.insertBefore(wrap, fb.nextSibling);
  }

  function check() {
    if (locked || phase !== "play") return;
    var item = current();
    if (!item) return;
    var input = document.getElementById("lw-input");
    if (input) typed = input.value;
    if (!typed.trim()) return;

    locked = true;
    var ok = isCorrect(item, typed);

    if (input) {
      input.disabled = true;
      input.classList.add(ok ? "ok" : "bad");
    }
    var checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;

    // fill blank visually
    var blank = document.getElementById("lw-blank");
    if (blank) {
      blank.textContent = ok ? item.answer : typed.trim();
      blank.classList.add("is-filled");
      blank.style.color = ok ? "#059669" : "#dc2626";
      blank.style.borderBottomColor = ok ? "#22c55e" : "#ef4444";
    }

    var fb = document.getElementById("lc-fb");
    if (ok) {
      score += 1;
      sfx("correct");
      if (fb) {
        fb.textContent = "✓ " + item.full;
        fb.className = "lc-fb ok";
      }
      setTimeout(goNext, 900);
    } else {
      wrongs += 1;
      sfx("wrong");
      if (fb) {
        var ansList = item.answers || [item.answer];
        fb.innerHTML =
          "Answer: <strong>" +
          escapeHtml(ansList.join(" / ")) +
          "</strong>";
        fb.className = "lc-fb bad";
      }
      // also show full sentence under feedback
      var reveal = document.createElement("p");
      reveal.className = "lw-answer-reveal";
      reveal.textContent = item.full;
      if (fb && fb.parentNode) {
        fb.parentNode.insertBefore(reveal, fb.nextSibling);
      }
      showContinue();
    }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.slice());
    index = 0;
    score = 0;
    wrongs = 0;
    locked = false;
    typed = "";
    phase = "play";
    render();
  }

  function finishGame() {
    phase = "done";
    sfx("win");
    stopAudio();
    var stars = saveStars();
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          accuracy: calcAccuracy(),
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: function () {
            startGame();
          },
          onModes: function () {
            phase = "menu";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {}
    }
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<div class="lc-topbar-center">' +
        '<span class="lc-kicker">UNIT 11A</span>' +
        '<span class="lc-title">Listen &amp; Write</span>' +
        "</div>" +
        '<span class="lc-badge">' +
        TOTAL +
        "</span>" +
        "</header>" +
        '<section class="lc-start">' +
        '<div class="lc-hero">✍️</div>' +
        "<h1>Adverbs · Listen &amp; Write</h1>" +
        '<p class="lc-desc">Listen to the sentence, then write the <strong>adverb</strong> only.</p>' +
        '<p class="lc-desc" style="margin-top:8px">The adjective is shown in parentheses as a hint.</p>' +
        '<p class="lc-desc">' +
        TOTAL +
        " sentences</p>" +
        '<button type="button" class="lc-btn" id="lw-start">Start</button>' +
        "</section>";
      document.getElementById("lw-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "done") {
      var stars = calcStars();
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<div class="lc-topbar-center">' +
        '<span class="lc-kicker">UNIT 11A</span>' +
        '<span class="lc-title">Done!</span>' +
        "</div></header>" +
        '<section class="lc-start">' +
        '<div class="lc-hero">🏆</div>' +
        "<h1>Done!</h1>" +
        "<p>Score: " +
        score +
        "/" +
        TOTAL +
        "</p>" +
        "<p>Accuracy: " +
        calcAccuracy() +
        "%</p>" +
        '<p style="font-size:1.6rem;color:#f59e0b;letter-spacing:4px">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</p>" +
        '<button type="button" class="lc-btn" id="lw-again">Again</button>' +
        "</section>";
      document.getElementById("lw-again").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    // play
    var item = current();
    if (!item) return;
    var pct = Math.round((index / TOTAL) * 100);

    app.innerHTML =
      '<header class="lc-topbar">' +
      '<a class="lc-back" href="../" aria-label="Back">←</a>' +
      '<div class="lc-topbar-center">' +
      '<span class="lc-kicker">UNIT 11A</span>' +
      '<span class="lc-title">Listen &amp; Write</span>' +
      "</div>" +
      '<span class="lc-badge">' +
      (index + 1) +
      "/" +
      TOTAL +
      "</span>" +
      "</header>" +
      '<div class="lc-progress"><div class="lc-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<p class="lc-instruction">Listen, then type the <strong>adverb</strong> only.</p>' +
      '<div class="lw-card">' +
      '<div class="lc-audio-wrap">' +
      '<button type="button" class="mc-play" id="lw-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button></div>" +
      '<p class="lw-sentence">' +
      escapeHtml(item.before) +
      ' <span class="lw-blank" id="lw-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
      (item.after ? " " + escapeHtml(item.after.trim()) : "") +
      "</p>" +
      '<span class="lw-hint">from <em>' +
      escapeHtml(item.adj) +
      "</em></span>" +
      '<div class="lw-input-area">' +
      '<input type="text" class="lc-type-input" id="lw-input" placeholder="Type the adverb…" autocomplete="off" autocapitalize="none" spellcheck="false" />' +
      '<button type="button" class="lc-check-btn" id="lw-check">Check</button>' +
      "</div>" +
      "</div>" +
      '<p class="lc-fb" id="lc-fb"></p>';

    document.getElementById("lw-play").onclick = function () {
      sfx("click");
      playAudio(item);
    };
    setTimeout(function () {
      playAudio(item);
    }, 280);

    var input = document.getElementById("lw-input");
    var checkBtn = document.getElementById("lw-check");
    if (input) {
      input.focus();
      input.onkeydown = function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          check();
        }
      };
    }
    if (checkBtn) {
      checkBtn.onclick = function () {
        check();
      };
    }
  }

  render();
})();
