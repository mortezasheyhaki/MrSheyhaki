(function () {
  "use strict";

  var GAME_ID = "starter-7b-movie-genres";

  var ITEMS = [
    {
      text: "Movies about the future, space, robots, or aliens.",
      genre: "Science fiction movies"
    },
    {
      text: "Movies that make you laugh. They are usually funny.",
      genre: "Comedies"
    },
    {
      text: "Movies with cowboys, horses, and life in the old American West.",
      genre: "Westerns"
    },
    {
      text: "Movies with a lot of fighting, danger, and exciting events.",
      genre: "Action movies"
    },
    {
      text: "Movies with cartoons or computer-made characters.",
      genre: "Animated movies"
    },
    {
      text: "Movies about real-life problems, love, and people's feelings. They are often serious.",
      genre: "Dramas"
    },
    {
      text: "Movies that are scary. They sometimes have ghosts or monsters.",
      genre: "Horror movies"
    }
  ];

  var GENRES = [
    "Action movies",
    "Animated movies",
    "Comedies",
    "Dramas",
    "Horror movies",
    "Science fiction movies",
    "Westerns"
  ];

  var $ = function (id) { return document.getElementById(id); };

  var startOverlay = $("startOverlay");
  var startBtn = $("startBtn");
  var sentenceEl = $("sentence");
  var promptCard = $("promptCard");
  var chipsEl = $("chips");
  var feedback = $("feedback");
  var counter = $("counter");
  var scoreLive = $("scoreLive");
  var progressFill = $("progressFill");

  var state = null;
  var locked = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof window.LASfx[name] === "function") {
        window.LASfx[name]();
        return;
      }
      if (window.ArcadeFX && ArcadeFX.snd) {
        if (name === "correct" && ArcadeFX.snd.correct) ArcadeFX.snd.correct();
        if (name === "wrong" && ArcadeFX.snd.wrong) ArcadeFX.snd.wrong();
        if (name === "tap" && ArcadeFX.snd.tap) ArcadeFX.snd.tap();
        if (name === "celebrate" && ArcadeFX.snd.celebrate) ArcadeFX.snd.celebrate();
      }
    } catch (e) {}
  }

  function buildChips() {
    chipsEl.innerHTML = "";
    GENRES.forEach(function (g) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-chip";
      btn.textContent = g;
      btn.dataset.genre = g;
      btn.addEventListener("click", function () {
        onPick(btn, g);
      });
      chipsEl.appendChild(btn);
    });
  }

  function updateHUD() {
    if (!state) return;
    var n = state.order.length;
    var i = Math.min(state.index + 1, n);
    counter.textContent = i + " / " + n;
    scoreLive.textContent = "Score " + state.correct;
    progressFill.style.width = ((state.index / n) * 100) + "%";
  }

  function showPrompt(animate) {
    if (!state || state.index >= state.order.length) {
      finish();
      return;
    }
    locked = false;
    feedback.textContent = "";
    feedback.className = "mg-feedback";
    var item = state.order[state.index];
    sentenceEl.textContent = item.text;
    updateHUD();

    if (animate) {
      promptCard.classList.remove("is-out");
      promptCard.classList.remove("is-in");
      void promptCard.offsetWidth;
      promptCard.classList.add("is-in");
    }
  }

  function onPick(btn, genre) {
    if (!state || locked || state.done) return;
    if (btn.classList.contains("used")) return;

    locked = true;
    sfx("tap");

    var item = state.order[state.index];
    var ok = genre === item.genre;
    state.attempts++;

    if (ok) {
      state.correct++;
      sfx("correct");
      btn.classList.add("correct-flash");
      feedback.textContent = "Correct — " + item.genre;
      feedback.className = "mg-feedback ok";
    } else {
      sfx("wrong");
      btn.classList.add("wrong-flash");
      feedback.textContent = "It was “" + item.genre + "”";
      feedback.className = "mg-feedback bad";
    }

    // Mute chosen chip (used up)
    btn.classList.add("used");
    btn.disabled = true;

    updateHUD();

    setTimeout(function () {
      btn.classList.remove("correct-flash", "wrong-flash");
      promptCard.classList.add("is-out");
      setTimeout(function () {
        state.index++;
        promptCard.classList.remove("is-out");
        if (state.index >= state.order.length) {
          progressFill.style.width = "100%";
          finish();
        } else {
          showPrompt(true);
        }
      }, 280);
    }, ok ? 650 : 900);
  }

  function finish() {
    if (!state || state.done) return;
    state.done = true;
    locked = true;

    var total = state.order.length;
    var accuracy = state.attempts
      ? Math.round((state.correct / total) * 100)
      : 0;

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      }
    } catch (e) {}

    // Progress for profile (if helper exists)
    try {
      if (window.LAProgress && typeof LAProgress.save === "function") {
        LAProgress.save({
          gameId: GAME_ID,
          score: state.correct,
          total: total,
          accuracy: accuracy
        });
      } else if (window.LAStars && typeof LAStars.saveProgress === "function") {
        LAStars.saveProgress(GAME_ID, { score: state.correct, total: total, accuracy: accuracy });
      }
    } catch (e) {}

    sfx("celebrate");

    if (window.LAFinish) {
      var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : null;
      LAFinish.show({
        gameId: GAME_ID,
        score: state.correct,
        total: total,
        stars: stars,
        timeMs: timeMs,
        onAgain: startGame,
        onModes: startGame,
        backHref: "../",
        save: true
      });
    } else {
      feedback.textContent = "Done! " + state.correct + " / " + total;
      feedback.className = "mg-feedback ok";
    }
  }

  function startGame() {
    state = {
      order: shuffle(ITEMS),
      index: 0,
      correct: 0,
      attempts: 0,
      done: false
    };
    startOverlay.classList.add("hidden");
    buildChips();
    progressFill.style.width = "0%";
    try {
      if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    } catch (e) {}
    showPrompt(true);
  }

  if (startBtn) startBtn.addEventListener("click", startGame);
})();
