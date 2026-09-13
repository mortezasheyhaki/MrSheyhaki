/* Listen & Repeat – Question Words · AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-listen-repeat-qw";

  const ITEMS = [
    {
      id: "how",
      word: "How",
      audio: "audio/how.mp3",
      answers: ["how", "how?"],
    },
    {
      id: "what",
      word: "What",
      audio: "audio/what.mp3",
      answers: ["what", "what?"],
    },
    {
      id: "where",
      word: "Where",
      audio: "audio/where.mp3",
      answers: ["where", "where?"],
    },
    {
      id: "who",
      word: "Who",
      audio: "audio/who.mp3",
      answers: ["who", "who?"],
    },
  ];

  const PARTS = [
    { id: "write", title: "Listen & Write", tip: "Listen to the question word, then type it." },
    { id: "repeat", title: "Listen & Repeat", tip: "Listen to the question word, then say it out loud." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let recognition = null;
  let isListening = false;
  let speechSupported = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) speechSupported = true;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"？]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrectAnswer(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    return item.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function stopRecognition() {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (_) {}
    }
    isListening = false;
    const mic = app.querySelector(".lw-mic");
    if (mic) mic.classList.remove("listening");
  }

  function playItemAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startPart(pi) {
    partIndex = pi;
    order = shuffle(ITEMS);
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    stopRecognition();
    phase = "play";
    render();
    setTimeout(playItemAudio, 350);
  }

  function checkWriteAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrectAnswer(lastUserInput, item);
    stopAudio();
    if (lastCorrect) {
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render();
      setTimeout(() => nextItem(), 900);
    } else {
      answered = false;
      phase = "tryagain";
      render();
    }
  }

  function skipAnswer() {
    if (answered) return;
    stopAudio();
    stopRecognition();
    lastSkipped = true;
    lastCorrect = false;
    lastUserInput = "";
    answered = true;
    phase = "feedback";
    render();
    setTimeout(() => nextItem(), 1100);
  }

  function startListening() {
    if (!speechSupported || answered) return;
    stopRecognition();
    stopAudio();

    const mic = app.querySelector(".lw-mic");
    const status = document.getElementById("lw-speech-status");

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening = true;
      if (mic) mic.classList.add("listening");
      if (status) status.textContent = "Listening… say the question word";
    };

    recognition.onresult = (event) => {
      const results = event.results[0];
      let best = "";
      let matched = false;
      const item = order[index];

      for (let i = 0; i < results.length; i++) {
        const transcript = results[i].transcript;
        if (isCorrectAnswer(transcript, item)) {
          matched = true;
          best = transcript;
          break;
        }
        if (!best) best = transcript;
      }

      lastUserInput = best;
      lastSkipped = false;
      lastCorrect = matched;
      stopRecognition();
      if (lastCorrect) {
        correctCount += 1;
        answered = true;
        phase = "feedback";
        render();
        setTimeout(() => nextItem(), 900);
      } else {
        answered = false;
        phase = "tryagain";
        render();
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      if (mic) mic.classList.remove("listening");
      if (status) {
        if (event.error === "not-allowed") {
          status.textContent = "Microphone blocked. Allow mic access and try again.";
        } else if (event.error === "no-speech") {
          status.textContent = "No speech heard. Tap the mic and try again.";
        } else {
          status.textContent = "Couldn't hear that. Tap the mic and try again.";
        }
      }
    };

    recognition.onend = () => {
      isListening = false;
      if (mic) mic.classList.remove("listening");
    };

    try {
      recognition.start();
    } catch (e) {
      if (status) status.textContent = "Speech not available. Try Chrome or Edge.";
    }
  }

  function nextItem() {
    stopRecognition();
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playItemAudio, 300);
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    const total = ITEMS.length;
    if (n >= total) return 3;
    if (n >= Math.ceil(total * 0.7)) return 2;
    if (n >= Math.ceil(total * 0.4)) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function progressHTML() {
    const total = order.length || 1;
    const fill = Math.round((index / total) * 100);
    return (
      '<div class="lw-track" aria-hidden="true"><div class="lw-track-fill" style="width:' +
      fill +
      '%"></div></div>' +
      '<div class="lw-scoreline"><span class="lw-score">' +
      correctCount +
      ' correct</span><span class="lw-step">' +
      (index + 1) +
      " / " +
      total +
      "</span></div>"
    );
  }

  function render() {
    const part = PARTS[partIndex];
    const progress = order.length ? index + 1 + " / " + order.length : "";

    if (phase === "menu") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Question Words</span>' +
        '<span class="lw-badge">2B</span>' +
        "</header>" +
        '<section class="lw-start">' +
        '<div class="lw-hero" aria-hidden="true">🎤</div>' +
        "<h1>Listen &amp; Repeat</h1>" +
        '<p class="lw-desc">Practice <strong>How · What · Where · Who</strong></p>' +
        '<div class="lw-mode-list">' +
        '<button type="button" class="lw-mode-card" data-part="0">' +
        '<span class="lw-mode-num">1</span>' +
        "<div><strong>Listen &amp; Write</strong><p>Type the question word you hear</p></div>" +
        "</button>" +
        '<button type="button" class="lw-mode-card" data-part="1">' +
        '<span class="lw-mode-num">2</span>' +
        "<div><strong>Listen &amp; Repeat</strong><p>Say the question word out loud</p></div>" +
        "</button>" +
        "</div>" +
        (!speechSupported
          ? '<p class="lw-speech-note">Voice recognition works best in Chrome or Edge.</p>'
          : "") +
        "</section>";
      app.querySelectorAll(".lw-mode-card").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">' +
        part.title +
        "</span>" +
        '<span class="lw-badge">Done</span>' +
        "</header>" +
        '<section class="lw-done">' +
        '<div class="trophy-scene' +
        (stars === 3 ? " perfect" : "") +
        '" aria-hidden="true"><div class="orbit-system">' +
        '<div class="trophy-float">🏆</div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 1 ? " filled" : "") +
        '">★</span></div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 2 ? " filled" : "") +
        '">★</span></div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 3 ? " filled" : "") +
        '">★</span></div>' +
        "</div></div>" +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") +
        "</h1>" +
        "<p>You got <strong>" +
        correctCount +
        " / " +
        ITEMS.length +
        "</strong> correct.</p>" +
        '<button type="button" class="lw-btn" id="lw-again">Play again</button>' +
        '<button type="button" class="lw-btn secondary" id="lw-menu">All parts</button>' +
        "</section>";
      document.getElementById("lw-again").onclick = () => startPart(partIndex);
      document.getElementById("lw-menu").onclick = () => {
        stopAudio();
        stopRecognition();
        phase = "menu";
        render();
      };
      return;
    }

    const item = order[index];

    if (phase === "play") {
      if (part.id === "write") {
        app.innerHTML =
          '<header class="lw-topbar">' +
          '<a class="lw-back" href="../" aria-label="Back">←</a>' +
          '<span class="lw-title">' +
          part.title +
          "</span>" +
          '<span class="lw-progress">' +
          progress +
          "</span>" +
          "</header>" +
          progressHTML() +
          '<section class="lw-play-area">' +
          '<button type="button" class="lw-play" aria-label="Play audio">' +
          '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
          '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
          "</button>" +
          '<p class="lw-tip">' +
          part.tip +
          "</p>" +
          '<div class="lw-input-wrap">' +
          '<input type="text" id="lw-input" class="lw-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the word…" maxlength="12" />' +
          "</div>" +
          '<div class="lw-actions">' +
          '<button type="button" class="lw-btn" id="lw-check">Check</button>' +
          '<button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>' +
          "</div>" +
          "</section>";
        document.querySelector(".lw-play").onclick = playItemAudio;
        document.getElementById("lw-check").onclick = checkWriteAnswer;
        document.getElementById("lw-skip").onclick = skipAnswer;
        const input = document.getElementById("lw-input");
        if (input) {
          input.focus();
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              checkWriteAnswer();
            }
          });
        }
      } else {
        app.innerHTML =
          '<header class="lw-topbar">' +
          '<a class="lw-back" href="../" aria-label="Back">←</a>' +
          '<span class="lw-title">' +
          part.title +
          "</span>" +
          '<span class="lw-progress">' +
          progress +
          "</span>" +
          "</header>" +
          progressHTML() +
          '<section class="lw-play-area">' +
          '<button type="button" class="lw-play" aria-label="Play audio">' +
          '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
          '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
          "</button>" +
          '<p class="lw-tip">' +
          part.tip +
          "</p>" +
          '<p class="lw-written" aria-label="Written form">' +
          item.word +
          "</p>" +
          '<button type="button" class="lw-mic" id="lw-mic" aria-label="Start microphone"' +
          (speechSupported ? "" : " disabled") +
          ">" +
          '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">' +
          '<path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>' +
          "</svg>" +
          '<span class="lw-mic-rings" aria-hidden="true"></span>' +
          "</button>" +
          '<p class="lw-speech-status" id="lw-speech-status">' +
          (speechSupported
            ? "Tap the mic and say the question word"
            : "Speech recognition not supported in this browser") +
          "</p>" +
          '<div class="lw-actions">' +
          '<button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>' +
          "</div>" +
          "</section>";
        document.querySelector(".lw-play").onclick = playItemAudio;
        const micBtn = document.getElementById("lw-mic");
        if (micBtn && speechSupported) micBtn.onclick = startListening;
        document.getElementById("lw-skip").onclick = skipAnswer;
      }
      return;
    }

    if (phase === "tryagain") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">' +
        part.title +
        "</span>" +
        '<span class="lw-progress">' +
        progress +
        "</span>" +
        "</header>" +
        progressHTML() +
        '<section class="lw-feedback is-wrong">' +
        '<div class="lw-fb-icon">❌</div>' +
        '<p class="lw-fb-msg">Try again</p>' +
        '<p class="lw-fb-hint">You said: <em>' +
        (lastUserInput || "—") +
        "</em></p>" +
        '<button type="button" class="lw-btn" id="lw-retry">Try again</button>' +
        "</section>";
      document.getElementById("lw-retry").onclick = () => {
        answered = false;
        lastUserInput = "";
        phase = "play";
        render();
        setTimeout(playItemAudio, 250);
      };
      return;
    }

    const msg = lastSkipped
      ? "Answer: <strong>" + item.word + "</strong>"
      : "Correct! <strong>" + item.word + "</strong>";

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">' +
      part.title +
      "</span>" +
      '<span class="lw-progress">' +
      progress +
      "</span>" +
      "</header>" +
      progressHTML() +
      '<section class="lw-feedback ' +
      (lastCorrect ? "is-correct" : "is-wrong") +
      '">' +
      '<div class="lw-fb-icon">' +
      (lastCorrect ? "✅" : "➡️") +
      "</div>" +
      '<p class="lw-fb-msg">' +
      msg +
      "</p>" +
      "</section>";
  }

  render();
})();
