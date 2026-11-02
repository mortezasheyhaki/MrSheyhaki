(function () {
  const GAME_ID = "1-3a-listen-and-write";

  // Shared Learning Arcade finish screen. Stars/plays are already saved above,
  // so LAFinish is told not to save again (save: false).
  function showFinish(score, total, again) {
    if (!window.LAFinish) return;
    LAFinish.show({
      gameId: GAME_ID,
      score: score,
      total: total,
      save: false,
      onAgain: again || function () { location.reload(); },
      backHref: "../"
    });
  }

  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (window.LAStars) {
      LAStars.recordPlay(gameId);
      LAStars.saveFromAccuracy(gameId, pct);
    }
    return pct;
  }

  const PHRASES = [
    { text: "cook dinner",          audio: "https://cdn.imgurl.ir/uploads/o673860_.mp3" },
    { text: "do homework",          audio: "https://cdn.imgurl.ir/uploads/p09599_.mp3" },
    { text: "do housework",         audio: "https://cdn.imgurl.ir/uploads/o80603_.mp3" },
    { text: "do yoga",              audio: "https://cdn.imgurl.ir/uploads/u74460_.mp3" },
    { text: "drink water",          audio: "https://cdn.imgurl.ir/uploads/e95233_.mp3" },
    { text: "drive a car",          audio: "https://cdn.imgurl.ir/uploads/e808976_.mp3" },
    { text: "eat vegetables",       audio: "https://cdn.imgurl.ir/uploads/k804902_.mp3" },
    { text: "go to the movies",     audio: "https://cdn.imgurl.ir/uploads/e24429_.mp3" },
    { text: "have a garden",        audio: "https://cdn.imgurl.ir/uploads/m64217_.mp3" },
    { text: "like animals",         audio: "https://cdn.imgurl.ir/uploads/n22603_.mp3" },
    { text: "listen to music",      audio: "https://cdn.imgurl.ir/uploads/m558203_.mp3" },
    { text: "live in an apartment", audio: "https://cdn.imgurl.ir/uploads/k443109_.mp3" },
    { text: "need a new phone",     audio: "https://cdn.imgurl.ir/uploads/q430686_.mp3" },
    { text: "play tennis",          audio: "https://cdn.imgurl.ir/uploads/x185579_.mp3" },
    { text: "play the guitar",      audio: "https://cdn.imgurl.ir/uploads/p690767_.mp3" },
    { text: "read a book",          audio: "https://cdn.imgurl.ir/uploads/x041368_.mp3" },
    { text: "say sorry",            audio: "https://cdn.imgurl.ir/uploads/n903104_.mp3" },
    { text: "speak German",         audio: "https://cdn.imgurl.ir/uploads/s391734_.mp3" },
    { text: "study history",        audio: "https://cdn.imgurl.ir/uploads/q43071_.mp3" },
    { text: "take an umbrella",     audio: "https://cdn.imgurl.ir/uploads/f29577_.mp3" },
    { text: "want a coffee",        audio: "https://cdn.imgurl.ir/uploads/d50989_.mp3" },
    { text: "watch TV",             audio: "https://cdn.imgurl.ir/uploads/c92596_.mp3" },
    { text: "wear glasses",         audio: "https://cdn.imgurl.ir/uploads/s37443_.mp3" },
    { text: "work in an office",    audio: "https://cdn.imgurl.ir/uploads/z267_.mp3" },
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

  function playCurrent() {
    if (!queue[currentIndex]) return;
    stopAudio();
    const a = new Audio(queue[currentIndex].audio);
    currentAudio = a;
    playBtn.classList.add("playing");
    a.play().catch(() => {});
    a.onended = () => {
      playBtn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function updateUI() {
    progressEl.textContent = currentIndex;
    scoreEl.textContent = score;
    const pct = (currentIndex / PHRASES.length) * 100;
    progressFill.style.width = pct + "%";
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
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    updateUI();
    // auto-play after a short delay
    setTimeout(playCurrent, 350);
    answerInput.focus();
  }

  function nextPhrase() {
    currentIndex++;
    if (currentIndex >= queue.length) {
      // finished
      stopAudio();
      answerInput.disabled = true;
      checkBtn.disabled = true;
      skipBtn.disabled = true;
      progressEl.textContent = queue.length;
      progressFill.style.width = "100%";
      showFeedback("success", "Finished! You got " + score + " out of " + queue.length);
      restartBtn.classList.remove("hidden");
      awardStars(GAME_ID, score, queue.length);
      showFinish(score, queue.length, function () { restartBtn.click(); });
      if (score === queue.length) launchConfetti();
      return;
    }
    loadCurrent();
  }

  function checkAnswer() {
    if (answered || !queue[currentIndex]) return;
    const user = normalize(answerInput.value);
    const correct = normalize(queue[currentIndex].text);

    if (!user) {
      showFeedback("info", "Type something first");
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
      // small delay then next
      setTimeout(nextPhrase, 1100);
    } else {
      answerInput.classList.add("wrong");
      showFeedback("error", "Not quite", queue[currentIndex].text);
      // allow continue after seeing the answer
      setTimeout(() => {
        skipBtn.textContent = "Next →";
        skipBtn.disabled = false;
      }, 400);
    }
  }

  function skip() {
    if (!queue[currentIndex]) return;
    if (!answered) {
      // show the answer then move on
      answered = true;
      answerInput.disabled = true;
      checkBtn.disabled = true;
      showFeedback("info", "Skipped", queue[currentIndex].text);
      setTimeout(nextPhrase, 1400);
    } else {
      // already answered incorrectly, go next
      skipBtn.textContent = "Skip";
      nextPhrase();
    }
  }

  function launchConfetti() {
    const colors = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];
    for (let i = 0; i < 55; i++) {
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
    queue = shuffle(PHRASES);
    currentIndex = 0;
    score = 0;
    restartBtn.classList.add("hidden");
    skipBtn.textContent = "Skip";
    loadCurrent();
  }

  // Events
  playBtn.addEventListener("click", playCurrent);

  answerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    checkAnswer();
  });

  skipBtn.addEventListener("click", skip);
  restartBtn.addEventListener("click", start);

  // keyboard: Enter already handled by form; Esc could replay
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") playCurrent();
  });

  start();
})();
