/* What is it? / What are they? – 2 parts · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-what-is-it";

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const SINGULAR = [
    {
      id: "book",
      image: "images/book.png",
      answers: ["it's a book", "it is a book", "a book", "book"],
      label: "It's a book.",
      answerAudio: "audio/its-a-book.mp3",
    },
    {
      id: "watch",
      image: "images/watch.png",
      answers: ["it's a watch", "it is a watch", "a watch", "watch"],
      label: "It's a watch.",
      answerAudio: "audio/its-a-watch.mp3",
    },
    {
      id: "dictionary",
      image: "images/dictionary.png",
      answers: ["it's a dictionary", "it is a dictionary", "a dictionary", "dictionary"],
      label: "It's a dictionary.",
      answerAudio: "audio/its-a-dictionary.mp3",
    },
    {
      id: "key",
      image: "images/key.png",
      answers: ["it's a key", "it is a key", "a key", "key"],
      label: "It's a key.",
      answerAudio: "audio/its-a-key.mp3",
    },
  ];

  const PLURAL = [
    {
      id: "books",
      image: "images/books.png",
      answers: ["they're books", "they are books", "books"],
      label: "They're books.",
      answerAudio: "audio/theyre-books.mp3",
    },
    {
      id: "watches",
      image: "images/watches.png",
      answers: ["they're watches", "they are watches", "watches"],
      label: "They're watches.",
      answerAudio: "audio/theyre-watches.mp3",
    },
    {
      id: "dictionaries",
      image: "images/dictionaries.png",
      answers: ["they're dictionaries", "they are dictionaries", "dictionaries"],
      label: "They're dictionaries.",
      answerAudio: "audio/theyre-dictionaries.mp3",
    },
    {
      id: "keys",
      image: "images/keys.png",
      answers: ["they're keys", "they are keys", "keys"],
      label: "They're keys.",
      answerAudio: "audio/theyre-keys.mp3",
    },
  ];

  const PARTS = [
    {
      id: "singular",
      title: "What is it?",
      tip: "Look at the picture. Answer: It's a…",
      question: "What is it?",
      questionAudio: "audio/what-is-it.mp3",
      items: SINGULAR,
    },
    {
      id: "plural",
      title: "What are they?",
      tip: "Look at the picture. Answer: They're…",
      question: "What are they?",
      questionAudio: "audio/what-are-they.mp3",
      items: PLURAL,
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let phase = "menu";
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;
  let currentAudio = null;
  let recognition = null;
  let listening = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s\-']/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    for (let i = 0; i < answers.length; i++) {
      const a = normalize(answers[i]);
      if (!a) continue;
      if (u === a || u.includes(a) || a.includes(u)) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio(src, onEnd) {
    if (!src) {
      if (onEnd) onEnd();
      return;
    }
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    const btn = app.querySelector(".wi-q-play, .mc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      if (onEnd) onEnd();
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function startPart(pi) {
    partIndex = pi;
    order = shuffle(PARTS[partIndex].items.slice());
    idx = 0;
    score = 0;
    loadItem();
  }

  function loadItem() {
    locked = false;
    stopAudio();
    stopListening();
    phase = "play";
    render();
    const part = PARTS[partIndex];
    setTimeout(() => playAudio(part.questionAudio), 350);
    setTimeout(() => {
      const input = document.getElementById("wi-input");
      if (input) input.focus();
    }, 200);
  }

  function stopListening() {
    listening = false;
    const btn = document.getElementById("wi-mic");
    if (btn) btn.classList.remove("is-listening");
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (_) {}
    }
  }

  function startListening() {
    if (locked) return;
    if (!SpeechRecognitionAPI) {
      setFb("Voice not supported — please type.", "warn");
      return;
    }
    if (listening) {
      stopListening();
      setFb("Tap 🎤 and say the answer.", "");
      return;
    }
    stopAudio();
    if (!recognition) {
      recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.continuous = false;
    }
    listening = true;
    const btn = document.getElementById("wi-mic");
    if (btn) btn.classList.add("is-listening");
    setFb("Listening…", "");

    recognition.onresult = (ev) => {
      const alts = [];
      try {
        const res = ev.results[0];
        for (let i = 0; i < res.length; i++) {
          if (res[i] && res[i].transcript) alts.push(res[i].transcript.trim());
        }
      } catch (_) {}
      const best = alts[0] || "";
      const input = document.getElementById("wi-input");
      if (input && best) input.value = best;
      stopListening();
      if (best) checkAnswer();
      else setFb("Didn't catch that — try again.", "warn");
    };
    recognition.onerror = (ev) => {
      stopListening();
      const err = (ev && ev.error) || "";
      if (err === "not-allowed") setFb("Microphone blocked — type the answer.", "warn");
      else setFb("Couldn't hear — try typing.", "warn");
    };
    recognition.onend = () => {
      if (listening) {
        listening = false;
        if (btn) btn.classList.remove("is-listening");
      }
    };
    try {
      recognition.start();
    } catch (_) {
      stopListening();
      setFb("Mic busy — try again.", "warn");
    }
  }

  function setFb(text, cls) {
    const fb = document.getElementById("wi-feedback");
    if (!fb) return;
    fb.textContent = text || "";
    fb.className = "wi-feedback" + (cls ? " " + cls : "");
  }

  function checkAnswer() {
    if (locked) return;
    const input = document.getElementById("wi-input");
    if (!input) return;
    const user = input.value;
    if (!normalize(user)) {
      input.focus();
      setFb("Type or say the answer first.", "warn");
      return;
    }

    locked = true;
    input.disabled = true;
    const checkBtn = document.getElementById("wi-check");
    if (checkBtn) checkBtn.disabled = true;
    const micBtn = document.getElementById("wi-mic");
    if (micBtn) micBtn.disabled = true;
    stopListening();

    const item = order[idx];
    const ok = isCorrect(user, item.answers);

    if (ok) {
      score += 1;
      input.classList.add("is-correct");
      setFb("Correct! " + item.label, "ok");
    } else {
      input.classList.add("is-wrong");
      setFb(item.label, "bad");
    }

    // Play answer audio after submit, then advance
    playAudio(item.answerAudio, () => {
      setTimeout(() => {
        if (idx < order.length - 1) {
          idx += 1;
          loadItem();
        } else {
          phase = "done";
          render();
        }
      }, 500);
    });
  }

  function calcStars() {
    const total = order.length;
    if (score >= total) return 3;
    if (score >= Math.ceil(total * 0.66)) return 2;
    if (score >= Math.ceil(total * 0.33)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">What is it?</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">❓</div>
          <h1>What is it?</h1>
          <p class="mc-desc">Look · Listen · Answer</p>
          <div class="mc-mode-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="mc-mode-card mc-mode-btn" data-part="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const part = PARTS[partIndex];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">What is it?</span>
          <span class="mc-badge">Done</span>
        </header>
        <section class="mc-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div>
            </div>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${part.title}</strong><br>You got <strong>${score} / ${order.length}</strong> correct.</p>
          <button type="button" class="mc-btn" id="wi-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="wi-menu">Both parts</button>
        </section>`;
      document.getElementById("wi-again").onclick = () => startPart(partIndex);
      document.getElementById("wi-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    // play
    const part = PARTS[partIndex];
    const item = order[idx];

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${part.title}</span>
        <span class="mc-progress">${idx + 1} / ${order.length}</span>
      </header>
      <div class="wi-stage">
        <div class="wi-question">
          <button type="button" class="mc-play wi-q-play" aria-label="Play question">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <span class="wi-q-text">${part.question}</span>
        </div>
        <div class="wi-pic-wrap">
          <img class="wi-pic" src="${item.image}" alt="Look" draggable="false">
        </div>
        <div class="wi-input-row">
          <input type="text" id="wi-input" class="wi-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer…" enterkeyhint="done">
          <button type="button" class="wi-mic" id="wi-mic" aria-label="Say the answer" title="Say the answer">🎤</button>
        </div>
        <p class="wi-feedback" id="wi-feedback">Tap 🎤 or type, then Check</p>
        <button type="button" class="mc-btn" id="wi-check">Check</button>
      </div>`;

    app.querySelector(".wi-q-play").onclick = () => playAudio(part.questionAudio);
    document.getElementById("wi-check").onclick = () => checkAnswer();
    document.getElementById("wi-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    document.getElementById("wi-mic").onclick = () => startListening();
  }

  render();
})();
