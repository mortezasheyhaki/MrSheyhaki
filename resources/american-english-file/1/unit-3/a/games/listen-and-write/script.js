(function () {
  const GAME_ID = "aef1-u3a-listen-and-write";

  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (window.LAStars) {
      LAStars.recordPlay(gameId);
      LAStars.saveFromAccuracy(gameId, pct);
    }
    return pct;
  }

  const PHRASES = [
    { text: "cook dinner",          audio: "audio/cook-dinner.mp3" },
    { text: "do homework",          audio: "audio/do-homework.mp3" },
    { text: "do housework",         audio: "audio/do-housework.mp3" },
    { text: "do yoga",              audio: "audio/do-yoga.mp3" },
    { text: "drink water",          audio: "audio/drink-water.mp3" },
    { text: "drive a car",          audio: "audio/drive-a-car.mp3" },
    { text: "eat vegetables",       audio: "audio/eat-vegetables.mp3" },
    { text: "go to the movies",     audio: "audio/go-to-the-movies.mp3" },
    { text: "have a garden",        audio: "audio/have-a-garden.mp3" },
    { text: "like animals",         audio: "audio/like-animals.mp3" },
    { text: "listen to music",      audio: "audio/listen-to-music.mp3" },
    { text: "live in an apartment", audio: "audio/live-in-an-apartment.mp3" },
    { text: "need a new phone",     audio: "audio/need-a-new-phone.mp3" },
    { text: "play tennis",          audio: "audio/play-tennis.mp3" },
    { text: "play the guitar",      audio: "audio/play-the-guitar.mp3" },
    { text: "read a book",          audio: "audio/read-a-book.mp3" },
    { text: "say sorry",            audio: "audio/say-sorry.mp3" },
    { text: "speak German",         audio: "audio/speak-german.mp3" },
    { text: "study history",        audio: "audio/study-history.mp3" },
    { text: "take an umbrella",     audio: "audio/take-an-umbrella.mp3" },
    { text: "want a coffee",        audio: "audio/want-a-coffee.mp3" },
    { text: "watch TV",             audio: "audio/watch-tv.mp3" },
    { text: "wear glasses",         audio: "audio/wear-glasses.mp3" },
    { text: "work in an office",    audio: "audio/work-in-an-office.mp3" },
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
