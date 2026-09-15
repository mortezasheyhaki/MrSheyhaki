/* Listen and Say the Plural · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-listen-say-plural";

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const ITEMS = [
    {
      singular: "It's a photo.",
      plural: "They're photos.",
      answers: ["they're photos", "they are photos", "photos"],
      audioS: "audio/s-photo.mp3",
      audioP: "audio/p-photos.mp3",
    },
    {
      singular: "It's a key.",
      plural: "They're keys.",
      answers: ["they're keys", "they are keys", "keys"],
      audioS: "audio/s-key.mp3",
      audioP: "audio/p-keys.mp3",
    },
    {
      singular: "It's a passport.",
      plural: "They're passports.",
      answers: ["they're passports", "they are passports", "passports"],
      audioS: "audio/s-passport.mp3",
      audioP: "audio/p-passports.mp3",
    },
    {
      singular: "It's a phone.",
      plural: "They're phones.",
      answers: ["they're phones", "they are phones", "phones"],
      audioS: "audio/s-phone.mp3",
      audioP: "audio/p-phones.mp3",
    },
    {
      singular: "It's a watch.",
      plural: "They're watches.",
      answers: ["they're watches", "they are watches", "watches"],
      audioS: "audio/s-watch.mp3",
      audioP: "audio/p-watches.mp3",
    },
    {
      singular: "It's a pencil.",
      plural: "They're pencils.",
      answers: ["they're pencils", "they are pencils", "pencils"],
      audioS: "audio/s-pencil.mp3",
      audioP: "audio/p-pencils.mp3",
    },
    {
      singular: "It's a book.",
      plural: "They're books.",
      answers: ["they're books", "they are books", "books"],
      audioS: "audio/s-book.mp3",
      audioP: "audio/p-books.mp3",
    },
    {
      singular: "It's a change purse.",
      plural: "They're change purses.",
      answers: ["they're change purses", "they are change purses", "change purses"],
      audioS: "audio/s-change-purse.mp3",
      audioP: "audio/p-change-purses.mp3",
    },
    {
      singular: "It's a credit card.",
      plural: "They're credit cards.",
      answers: ["they're credit cards", "they are credit cards", "credit cards"],
      audioS: "audio/s-credit-card.mp3",
      audioP: "audio/p-credit-cards.mp3",
    },
    {
      singular: "It's a page.",
      plural: "They're pages.",
      answers: ["they're pages", "they are pages", "pages"],
      audioS: "audio/s-page.mp3",
      audioP: "audio/p-pages.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

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
      .replace(/[.?!,]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    return answers.some((a) => {
      const n = normalize(a);
      return u === n || u.includes(n) || n.includes(u);
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".mc-play.playing, .lsp-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio(src, onEnd) {
    if (!src) {
      if (onEnd) onEnd();
      return;
    }
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    const btn = app.querySelector(".lsp-play, .mc-play");
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

  function start() {
    order = shuffle(ITEMS.slice());
    idx = 0;
    score = 0;
    locked = false;
    phase = "play";
    loadItem();
  }

  function loadItem() {
    locked = false;
    stopAudio();
    stopListening();
    render();
    const item = order[idx];
    setTimeout(() => playAudio(item.audioS), 350);
    setTimeout(() => {
      const input = document.getElementById("lsp-input");
      if (input) input.focus();
    }, 200);
  }

  function stopListening() {
    listening = false;
    const btn = document.getElementById("lsp-mic");
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

  function setFb(text, cls) {
    const fb = document.getElementById("lsp-feedback");
    if (!fb) return;
    fb.textContent = text || "";
    fb.className = "lsp-feedback" + (cls ? " " + cls : "");
  }

  function startListening() {
    if (locked) return;
    if (!SpeechRecognitionAPI) {
      setFb("Voice not supported — please type.", "warn");
      return;
    }
    if (listening) {
      stopListening();
      setFb("Tap 🎤 and say the plural.", "");
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
    const btn = document.getElementById("lsp-mic");
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
      const input = document.getElementById("lsp-input");
      if (input && best) input.value = best;
      stopListening();
      if (best) check();
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

  function check() {
    if (locked) return;
    const input = document.getElementById("lsp-input");
    if (!input) return;
    const user = input.value;
    if (!normalize(user)) {
      input.focus();
      setFb("Type or say the plural first.", "warn");
      return;
    }

    locked = true;
    input.disabled = true;
    const checkBtn = document.getElementById("lsp-check");
    if (checkBtn) checkBtn.disabled = true;
    const micBtn = document.getElementById("lsp-mic");
    if (micBtn) micBtn.disabled = true;
    stopListening();

    const item = order[idx];
    const ok = isCorrect(user, item.answers);

    if (ok) {
      score += 1;
      input.classList.add("is-correct");
      setFb("Correct! " + item.plural, "ok");
    } else {
      input.classList.add("is-wrong");
      setFb(item.plural, "bad");
    }

    // Play plural answer audio after submit
    playAudio(item.audioP, () => {
      setTimeout(() => {
        if (idx < order.length - 1) {
          idx += 1;
          loadItem();
        } else {
          phase = "done";
          render();
        }
      }, 450);
    });
  }

  function calcStars() {
    const t = ITEMS.length;
    if (score >= t - 1) return 3;
    if (score >= Math.ceil(t * 0.66)) return 2;
    if (score >= Math.ceil(t * 0.33)) return 1;
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
          <span class="mc-title">Listen & Say Plural</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🎧</div>
          <h1>Listen & Say the Plural</h1>
          <p class="mc-desc">Listen to the singular sentence.<br>Write or say the <strong>plural</strong>.</p>
          <button type="button" class="mc-btn" id="lsp-start">Start</button>
        </section>`;
      document.getElementById("lsp-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen & Say Plural</span>
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
          <p>You got <strong>${score} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="mc-btn" id="lsp-again">Play again</button>
        </section>`;
      document.getElementById("lsp-again").onclick = () => start();
      return;
    }

    const item = order[idx];
    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Listen & Say Plural</span>
        <span class="mc-progress">${idx + 1} / ${order.length}</span>
      </header>
      <div class="lsp-stage">
        <div class="lsp-card">
          <p class="lsp-task">Write the plural sentence</p>
          <div class="lsp-listen">
            <button type="button" class="mc-play lsp-play" aria-label="Play singular">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
            <span class="lsp-listen-label">Listen</span>
          </div>
          <div class="lsp-arrow" aria-hidden="true">↓</div>
          <div class="lsp-input-row">
            <input type="text" id="lsp-input" class="lsp-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="They're…" enterkeyhint="done">
            <button type="button" class="lsp-mic" id="lsp-mic" aria-label="Say the plural" title="Say the plural">🎤</button>
          </div>
          <p class="lsp-feedback" id="lsp-feedback">Tap 🎤 or type, then Check</p>
        </div>
        <button type="button" class="mc-btn lsp-check-btn" id="lsp-check">Check</button>
      </div>`;

    app.querySelector(".lsp-play").onclick = () => playAudio(item.audioS);
    document.getElementById("lsp-check").onclick = () => check();
    document.getElementById("lsp-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    });
    document.getElementById("lsp-mic").onclick = () => startListening();
  }

  render();
})();
