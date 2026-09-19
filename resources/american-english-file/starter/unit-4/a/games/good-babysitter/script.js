/* Is Sarah a good babysitter? · listening · Unit 4A
   Answer: No, she isn't. (pizza & TV against mother's rules) */
(function () {
  const GAME_ID = "starter-4a-good-babysitter";
  const AUDIO_URL = "audio/conversation.mp3";

  const OPTIONS = [
    { id: "yes", label: "Yes, she is.", correct: false },
    { id: "no", label: "No, she isn't.", correct: true },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let selected = null;
  let answered = false;
  let correct = false;
  let audio = null;
  let playing = false;

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_URL);
      audio.preload = "auto";
      audio.addEventListener("ended", function () {
        playing = false;
        var btn = document.getElementById("gb-play");
        if (btn) btn.classList.remove("playing");
      });
      audio.addEventListener("error", function () {
        playing = false;
        var btn = document.getElementById("gb-play");
        if (btn) btn.classList.remove("playing");
      });
    }
    return audio;
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }
    playing = false;
    var btn = document.getElementById("gb-play");
    if (btn) btn.classList.remove("playing");
  }

  function togglePlay() {
    var a = ensureAudio();
    var btn = document.getElementById("gb-play");
    if (playing) {
      a.pause();
      playing = false;
      if (btn) btn.classList.remove("playing");
      return;
    }
    a.play()
      .then(function () {
        playing = true;
        if (btn) btn.classList.add("playing");
      })
      .catch(function () {
        playing = false;
        if (btn) btn.classList.remove("playing");
      });
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    selected = null;
    answered = false;
    correct = false;
    stopAudio();
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (answered || !selected) return;
    answered = true;
    var choice = OPTIONS.find(function (c) {
      return c.id === selected;
    });
    correct = !!(choice && choice.correct);
    saveStars(correct ? 3 : 1);

    app.querySelectorAll(".gb-opt").forEach(function (el) {
      var id = el.dataset.id;
      var c = OPTIONS.find(function (x) {
        return x.id === id;
      });
      if (c && c.correct) el.classList.add("correct");
      if (id === selected && !c.correct) el.classList.add("wrong");
      el.disabled = true;
    });

    var fb = document.getElementById("gb-feedback");
    if (fb) {
      fb.textContent = correct
        ? "Correct! She isn't a good babysitter."
        : "Not quite — she isn't a good babysitter.";
      fb.className = "gb-feedback " + (correct ? "ok" : "bad");
    }

    var checkBtn = document.getElementById("gb-check");
    if (checkBtn) checkBtn.style.display = "none";
    var nextBtn = document.getElementById("gb-done-btn");
    if (nextBtn) nextBtn.style.display = "";
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="gb-topbar">' +
        '<a class="gb-back" href="../" aria-label="Back">←</a>' +
        '<span class="gb-title">Good babysitter?</span>' +
        '<span class="gb-badge">4A</span></header>' +
        '<section class="gb-start">' +
        '<div class="gb-hero" aria-hidden="true">🎧</div>' +
        "<h1>Is Sarah a good babysitter?</h1>" +
        '<p class="gb-desc">Listen to the conversation. Then choose the correct answer.</p>' +
        '<button type="button" class="gb-btn" id="gb-start">Start</button></section>';
      document.getElementById("gb-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: 10,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      var stars = correct ? 3 : 1;
      app.innerHTML =
        '<header class="gb-topbar">' +
        '<a class="gb-back" href="../" aria-label="Back">←</a>' +
        '<span class="gb-title">Good babysitter?</span>' +
        '<span class="gb-badge">Done</span></header>' +
        '<section class="gb-done">' +
        '<div class="gb-stars" aria-hidden="true">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" +
        (correct ? "Well done!" : "Almost!") +
        "</h1>" +
        '<p class="gb-desc">' +
        (correct
          ? "Sarah wants pizza and TV — but Mom said no."
          : "Listen again — Sarah ignores the mother's rules.") +
        "</p>" +
        '<button type="button" class="gb-btn" id="gb-again">Play again</button>' +
        '<button type="button" class="gb-btn secondary" id="gb-menu">Back to start</button></section>';
      document.getElementById("gb-again").onclick = startGame;
      document.getElementById("gb-menu").onclick = function () {
        stopAudio();
        phase = "menu";
        render();
      };
      return;
    }

    var opts = OPTIONS.map(function (c) {
      return (
        '<button type="button" class="gb-opt" data-id="' +
        c.id +
        '">' +
        c.label +
        "</button>"
      );
    }).join("");

    app.innerHTML =
      '<header class="gb-topbar">' +
      '<a class="gb-back" href="../" aria-label="Back">←</a>' +
      '<span class="gb-title">Good babysitter?</span>' +
      '<span class="gb-badge">Listen</span></header>' +
      '<div class="gb-play">' +
      '<p class="gb-question">Is Sarah a good babysitter?</p>' +
      '<div class="gb-player">' +
      '<button type="button" class="gb-play-btn" id="gb-play" aria-label="Play">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="gb-player-meta">' +
      "<strong>Conversation</strong>" +
      "<span>Listen, then choose below</span>" +
      "</div></div>" +
      '<div class="gb-options">' +
      opts +
      "</div>" +
      '<p class="gb-feedback" id="gb-feedback"></p>' +
      '<div class="gb-actions">' +
      '<button type="button" class="gb-btn" id="gb-check" disabled>Check</button>' +
      '<button type="button" class="gb-btn secondary" id="gb-done-btn" style="display:none">Continue</button>' +
      "</div></div>";

    document.getElementById("gb-play").onclick = togglePlay;
    document.getElementById("gb-check").onclick = checkAnswer;
    document.getElementById("gb-done-btn").onclick = function () {
      stopAudio();
      phase = "done";
      render();
    };

    app.querySelectorAll(".gb-opt").forEach(function (el) {
      el.onclick = function () {
        if (answered) return;
        selected = el.dataset.id;
        app.querySelectorAll(".gb-opt").forEach(function (c) {
          c.classList.toggle("selected", c.dataset.id === selected);
        });
        document.getElementById("gb-check").disabled = false;
      };
    });
  }

  render();
})();
