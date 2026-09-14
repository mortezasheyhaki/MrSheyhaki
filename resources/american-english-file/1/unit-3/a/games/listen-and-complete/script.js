(function () {
  const GAME_ID = "aef1-u3a-listen-and-complete";

  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (window.LAStars) {
      LAStars.recordPlay(gameId);
      LAStars.saveFromAccuracy(gameId, pct);
    }
    return pct;
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
  let currentAudio = null;
  let answered = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[?.!]/g, "")
      .replace(/\s+/g, " ");
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    playBtn.classList.remove("playing");
  }

  function playSrc(src, isShort) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    if (isShort) playBtn.classList.add("playing");
    a.play().catch(() => {});
    a.onended = () => {
      playBtn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function playShort() {
    if (!queue[currentIndex]) return;
    playSrc(queue[currentIndex].short, true);
  }

  function playFull() {
    if (!queue[currentIndex]) return;
    playSrc(queue[currentIndex].fullAudio, false);
  }

  function updateUI() {
    progressEl.textContent = currentIndex;
    scoreEl.textContent = score;
    progressFill.style.width = (currentIndex / ITEMS.length * 100) + "%";
  }

  function showFeedback(type, message, correctText) {
    feedbackEl.className = "feedback " + type;
    if (correctText) {
      feedbackEl.innerHTML = message + '<span class="correct-answer">Answer: ' + correctText + '</span>';
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
    setTimeout(playShort, 350);
    answerInput.focus();
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
      if (score === queue.length) launchConfetti();
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
      playFull();                       // play the complete phrase
      setTimeout(nextItem, 1600);
    } else {
      answerInput.classList.add("wrong");
      showFeedback("error", "Not quite", queue[currentIndex].full);
      playFull();                       // still let them hear the correct full phrase
      setTimeout(() => {
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

  function launchConfetti() {
    const colors = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];
    for (let i = 0; i < 50; i++) {
      const span = document.createElement("span");
      span.style.left = Math.random() * 100 + "%";
      span.style.background = colors[i % colors.length];
      span.style.animationDuration = (1.3 + Math.random() * 1.5) + "s";
      span.style.animationDelay = (Math.random() * 0.4) + "s";
      confettiEl.appendChild(span);
      setTimeout(() => span.remove(), 3400);
    }
  }

  function start() {
    queue = shuffle(ITEMS);
    currentIndex = 0;
    score = 0;
    restartBtn.classList.add("hidden");
    loadCurrent();
  }

  playBtn.addEventListener("click", playShort);
  answerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    checkAnswer();
  });
  skipBtn.addEventListener("click", skip);
  restartBtn.addEventListener("click", start);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") playShort();
  });

  start();
})();
