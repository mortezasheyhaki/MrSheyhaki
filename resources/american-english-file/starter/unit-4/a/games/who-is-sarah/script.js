/* Who is Sarah? · listening · Unit 4A
   Listen only – no transcript. Images = context. Buttons = answers.
   Sarah is the babysitter. */
(function () {
  const GAME_ID = "starter-4a-who-is-sarah";

  const AUDIO_URL =
    "https://cdn.imgurl.ir/uploads/z5383_AEF3e_Starter_SB_4_mp3cut_net.mp3";

  const SCENE_IMGS = [
    "https://cdn.imgurl.ir/uploads/q026520_ChatGPT_Image_Sep_17_2026_12_28_50_AM.png",
    "https://cdn.imgurl.ir/uploads/u275691_ChatGPT_Image_Sep_17_2026_12_29_25_AM.png",
  ];

  const OPTIONS = [
    { id: "babysitter", label: "A new babysitter", correct: true },
    { id: "friend", label: "A family friend", correct: false },
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
        var btn = document.getElementById("ws-play");
        if (btn) btn.classList.remove("playing");
      });
      audio.addEventListener("error", function () {
        playing = false;
        var btn = document.getElementById("ws-play");
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
    var btn = document.getElementById("ws-play");
    if (btn) btn.classList.remove("playing");
  }

  function togglePlay() {
    var a = ensureAudio();
    var btn = document.getElementById("ws-play");
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

    app.querySelectorAll(".ws-opt").forEach(function (el) {
      var id = el.dataset.id;
      var c = OPTIONS.find(function (x) {
        return x.id === id;
      });
      if (c && c.correct) el.classList.add("correct");
      if (id === selected && !c.correct) el.classList.add("wrong");
      el.disabled = true;
    });

    var fb = document.getElementById("ws-feedback");
    if (fb) {
      fb.textContent = correct
        ? "Correct! Sarah is the babysitter."
        : "Not quite — Sarah is the babysitter.";
      fb.className = "ws-feedback " + (correct ? "ok" : "bad");
    }

    var checkBtn = document.getElementById("ws-check");
    if (checkBtn) checkBtn.style.display = "none";
    var nextBtn = document.getElementById("ws-done-btn");
    if (nextBtn) nextBtn.style.display = "";
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="ws-topbar">' +
        '<a class="ws-back" href="../" aria-label="Back">←</a>' +
        '<span class="ws-title">Who is Sarah?</span>' +
        '<span class="ws-badge">4A</span></header>' +
        '<section class="ws-start">' +
        '<div class="ws-hero" aria-hidden="true">🎧</div>' +
        "<h1>Who is Sarah?</h1>" +
        '<p class="ws-desc">Listen to the conversation. Then choose the correct answer.</p>' +
        '<button type="button" class="ws-btn" id="ws-start">Start</button></section>';
      document.getElementById("ws-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = correct ? 3 : 1;
      app.innerHTML =
        '<header class="ws-topbar">' +
        '<a class="ws-back" href="../" aria-label="Back">←</a>' +
        '<span class="ws-title">Who is Sarah?</span>' +
        '<span class="ws-badge">Done</span></header>' +
        '<section class="ws-done">' +
        '<div class="ws-stars" aria-hidden="true">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" +
        (correct ? "Well done!" : "Almost!") +
        "</h1>" +
        '<p class="ws-desc">' +
        (correct
          ? "Sarah is a new babysitter for the children."
          : "Listen again — Maria says Sarah is the babysitter.") +
        "</p>" +
        '<button type="button" class="ws-btn" id="ws-again">Play again</button>' +
        '<button type="button" class="ws-btn secondary" id="ws-menu">Back to start</button></section>';
      document.getElementById("ws-again").onclick = startGame;
      document.getElementById("ws-menu").onclick = function () {
        stopAudio();
        phase = "menu";
        render();
      };
      return;
    }

    var scenes =
      '<div class="ws-scenes" aria-hidden="true">' +
      SCENE_IMGS.map(function (src) {
        return '<img class="ws-scene" src="' + src + '" alt="" loading="lazy">';
      }).join("") +
      "</div>";

    var opts = OPTIONS.map(function (c) {
      return (
        '<button type="button" class="ws-opt" data-id="' +
        c.id +
        '">' +
        c.label +
        "</button>"
      );
    }).join("");

    app.innerHTML =
      '<header class="ws-topbar">' +
      '<a class="ws-back" href="../" aria-label="Back">←</a>' +
      '<span class="ws-title">Who is Sarah?</span>' +
      '<span class="ws-badge">Listen</span></header>' +
      '<div class="ws-play">' +
      scenes +
      '<p class="ws-question">Who is Sarah?</p>' +
      '<div class="ws-player">' +
      '<button type="button" class="ws-play-btn" id="ws-play" aria-label="Play conversation">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="ws-player-meta">' +
      "<strong>Conversation</strong>" +
      "<span>Listen, then choose below</span>" +
      "</div></div>" +
      '<div class="ws-options">' +
      opts +
      "</div>" +
      '<p class="ws-feedback" id="ws-feedback"></p>' +
      '<div class="ws-actions">' +
      '<button type="button" class="ws-btn" id="ws-check" disabled>Check</button>' +
      '<button type="button" class="ws-btn secondary" id="ws-done-btn" style="display:none">Continue</button>' +
      "</div></div>";

    document.getElementById("ws-play").onclick = togglePlay;
    document.getElementById("ws-check").onclick = checkAnswer;
    document.getElementById("ws-done-btn").onclick = function () {
      stopAudio();
      phase = "done";
      render();
    };

    app.querySelectorAll(".ws-opt").forEach(function (el) {
      el.onclick = function () {
        if (answered) return;
        selected = el.dataset.id;
        app.querySelectorAll(".ws-opt").forEach(function (c) {
          c.classList.toggle("selected", c.dataset.id === selected);
        });
        document.getElementById("ws-check").disabled = false;
      };
    });
  }

  render();
})();
