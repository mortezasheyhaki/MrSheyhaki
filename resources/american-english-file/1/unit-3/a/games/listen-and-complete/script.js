(function () {
  const GAME_ID = "1-3a-listen-and-complete";

  function starsFromPct(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }
  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const stars = starsFromPct(pct);
    if (window.LAStars) {
      LAStars.recordPlay(gameId || GAME_ID);
      LAStars.saveFromAccuracy(gameId || GAME_ID, pct);
    }
    return stars;
  }

  const ITEMS = [
    { ending: "TV",              full: "watch TV",          short: "audio-short/tv.mp3",              fullAudio: "audio-full/watch-tv.mp3" },
    { ending: "yoga",            full: "do yoga",           short: "audio-short/yoga.mp3",            fullAudio: "audio-full/do-yoga.mp3" },
    { ending: "history",         full: "study history",     short: "audio-short/history.mp3",         fullAudio: "audio-full/study-history.mp3" },
    { ending: "to the movies",   full: "go to the movies",  short: "audio-short/to-the-movies.mp3",   fullAudio: "audio-full/go-to-the-movies.mp3" },
    { ending: "vegetables",      full: "eat vegetables",    short: "audio-short/vegetables.mp3",      fullAudio: "audio-full/eat-vegetables.mp3" },
    { ending: "a garden",        full: "have a garden",     short: "audio-short/a-garden.mp3",        fullAudio: "audio-full/have-a-garden.mp3" },
    { ending: "glasses",         full: "wear glasses",      short: "audio-short/glasses.mp3",         fullAudio: "audio-full/wear-glasses.mp3" },
    { ending: "to music",        full: "listen to music",   short: "audio-short/to-music.mp3",        fullAudio: "audio-full/listen-to-music.mp3" },
    { ending: "water",           full: "drink water",       short: "audio-short/water.mp3",           fullAudio: "audio-full/drink-water.mp3" },
    { ending: "the guitar",      full: "play the guitar",   short: "audio-short/the-guitar.mp3",      fullAudio: "audio-full/play-the-guitar.mp3" },
  ];

  const playBtn      = document.getElementById("playBtn");
  const answerInput  = document.getElementById("answerInput");
  const answerForm   = document.getElementById("answerForm");
  const checkBtn     = document.getElementById("checkBtn");
  const skipBtn      = document.getElementById("skipBtn");
  const feedbackEl   = document.getElementById("feedback");
  const progressEl   = document.getElementById("progress");
  const scoreEl      = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");
  const restartBtn   = document.getElementById("restartBtn");
  const confettiEl   = document.getElementById("confetti");

  let queue = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let currentAudio = null;
  let audioUnlocked = false;
  let pendingPlay = null; // { src, isShort } waiting for gesture

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[?.!,]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    playBtn.classList.remove("playing");
  }

  /** Preload an Audio element so play is faster after unlock */
  function makeAudio(src) {
    const a = new Audio();
    a.preload = "auto";
    a.src = src;
    try { a.load(); } catch (e) {}
    return a;
  }

  function playSrc(src, isShort) {
    stopAudio();
    const a = makeAudio(src);
    currentAudio = a;
    if (isShort) playBtn.classList.add("playing");

    const onEnd = function () {
      playBtn.classList.remove("playing");
      playBtn.classList.remove("needs-gesture");
      if (currentAudio === a) currentAudio = null;
    };
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", function () {
      playBtn.classList.remove("playing");
      console.warn("Audio failed to load:", src);
    });

    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(function () {
        audioUnlocked = true;
        pendingPlay = null;
        playBtn.classList.remove("needs-gesture");
      }).catch(function () {
        // Autoplay blocked — queue this clip and wait for any user gesture
        pendingPlay = { src: src, isShort: isShort };
        playBtn.classList.add("needs-gesture");
        playBtn.classList.remove("playing");
      });
    }
  }

  function playShort() {
    if (!queue[currentIndex]) return;
    playSrc(queue[currentIndex].short, true);
  }

  function playFull() {
    if (!queue[currentIndex]) return;
    playSrc(queue[currentIndex].fullAudio, false);
  }

  /** Called on first user gesture anywhere — unlocks audio and plays pending clip */
  function unlockAndPlay() {
    if (audioUnlocked && !pendingPlay) return;
    audioUnlocked = true;
    if (pendingPlay) {
      const job = pendingPlay;
      pendingPlay = null;
      playSrc(job.src, job.isShort);
    } else if (queue[currentIndex] && !answered) {
      // First gesture with nothing pending — still play current short if silent
      playShort();
    }
  }

  function updateUI() {
    progressEl.textContent = currentIndex;
    scoreEl.textContent = score;
    progressFill.style.width = ((currentIndex / ITEMS.length) * 100) + "%";
  }

  function showFeedback(type, message, correctText) {
    feedbackEl.className = "feedback " + type;
    if (correctText) {
      feedbackEl.innerHTML = message + '<span class="correct-answer">Answer: ' + correctText + "</span>";
    } else {
      feedbackEl.textContent = message;
    }
  }

  function loadCurrent() {
    answered = false;
    answerInput.value = "";
    answerInput.classList.remove("correct", "wrong");
    answerInput.disabled = false;
    checkBtn.disabled = false;
    skipBtn.disabled = false;
    skipBtn.textContent = "Skip";
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    updateUI();
    answerInput.focus();
    // Always attempt play immediately
    playShort();
  }

  function nextItem() {
    currentIndex++;
    if (currentIndex >= queue.length) {
      stopAudio();
      answerInput.disabled = true;
      checkBtn.disabled = true;
      skipBtn.disabled = true;
      progressEl.textContent = queue.length;
      progressFill.style.width = "100%";
      showFeedback("success", "Finished! You got " + score + " out of " + queue.length);
      restartBtn.classList.remove("hidden");
      awardStars(GAME_ID, score, queue.length);
      return;
    }
    loadCurrent();
  }

  function checkAnswer() {
    if (answered || !queue[currentIndex]) return;
    const user = normalize(answerInput.value);
    const correct = normalize(queue[currentIndex].full);

    if (!user) {
      showFeedback("info", "Type the full phrase first");
      answerInput.focus();
      return;
    }

    answered = true;
    answerInput.disabled = true;
    checkBtn.disabled = true;

    if (user === correct) {
      score++;
      scoreEl.textContent = score;
      answerInput.classList.add("correct");
      showFeedback("success", "Correct! ✓");
      playFull();
      setTimeout(nextItem, 1600);
    } else {
      answerInput.classList.add("wrong");
      showFeedback("error", "Not quite", queue[currentIndex].full);
      playFull();
      setTimeout(function () {
        skipBtn.textContent = "Next →";
        skipBtn.disabled = false;
      }, 400);
    }
  }

  function skip() {
    if (!queue[currentIndex]) return;
    if (!answered) {
      answered = true;
      answerInput.disabled = true;
      checkBtn.disabled = true;
      showFeedback("info", "Skipped", queue[currentIndex].full);
      playFull();
      setTimeout(nextItem, 1600);
    } else {
      skipBtn.textContent = "Skip";
      nextItem();
    }
  }

  function start() {
    queue = shuffle(ITEMS.slice());
    currentIndex = 0;
    score = 0;
    restartBtn.classList.add("hidden");
    // Preload first few clips
    queue.slice(0, 3).forEach(function (item) {
      makeAudio(item.short);
    });
    loadCurrent();
  }

  // Unlock audio on the first real gesture (no visible "tap to start")
  ["pointerdown", "touchstart", "keydown"].forEach(function (evt) {
    document.addEventListener(
      evt,
      function () {
        unlockAndPlay();
      },
      { capture: true, passive: true }
    );
  });

  playBtn.addEventListener("click", function (e) {
    e.preventDefault();
    audioUnlocked = true;
    pendingPlay = null;
    playShort();
  });

  answerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    checkAnswer();
  });
  skipBtn.addEventListener("click", skip);
  restartBtn.addEventListener("click", start);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") playShort();
  });

  // Start game (and attempt autoplay)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
