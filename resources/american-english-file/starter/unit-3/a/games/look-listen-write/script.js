/* Look & Listen Write – 2 modes + voice recognition – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-look-listen-write";

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const ITEMS = [
    { id: "cellphone",   label: "a cell phone",  answers: ["cellphone", "cell phone", "a cell phone", "cell-phone", "mobile", "a mobile", "phone", "a phone", "mobile phone", "a mobile phone"], audio: "audio/cellphone.mp3", image: "images/cellphone.png" },
    { id: "newspaper",   label: "a newspaper",   answers: ["newspaper", "a newspaper", "paper", "a paper", "news paper"], audio: "audio/newspaper.mp3", image: "images/newspaper.png" },
    { id: "key",         label: "a key",         answers: ["key", "a key", "keys"], audio: "audio/key.mp3", image: "images/key.png" },
    { id: "credit-card", label: "a credit card", answers: ["credit card", "a credit card", "creditcard", "credit-card", "card", "a card"], audio: "audio/credit-card.mp3", image: "images/credit-card.png" },
    { id: "camera",      label: "a camera",      answers: ["camera", "a camera"], audio: "audio/camera.mp3", image: "images/camera.png" },
    { id: "umbrella",    label: "an umbrella",   answers: ["umbrella", "an umbrella", "a umbrella"], audio: "audio/umbrella.mp3", image: "images/umbrella.png" },
    { id: "passport",    label: "a passport",    answers: ["passport", "a passport"], audio: "audio/passport.mp3", image: "images/passport.png" },
    { id: "charger",     label: "a charger",     answers: ["charger", "a charger", "phone charger", "a phone charger"], audio: "audio/charger.mp3", image: "images/charger.png" },
    { id: "photo",       label: "a photo",       answers: ["photo", "a photo", "photograph", "a photograph", "picture", "a picture"], audio: "audio/photo.mp3", image: "images/photo.png" },
    { id: "glasses",     label: "glasses",       answers: ["glasses", "a glasses", "eyeglasses", "spectacles", "eye glasses"], audio: "audio/glasses.mp3", image: "images/glasses.png" },
    { id: "notebook",    label: "a notebook",    answers: ["notebook", "a notebook", "note book", "a note book", "notepad", "a notepad"], audio: "audio/notebook.mp3", image: "images/notebook.png" },
    { id: "pencil",      label: "a pencil",      answers: ["pencil", "a pencil"], audio: "audio/pencil.mp3", image: "images/pencil.png" },
    { id: "wallet",      label: "a wallet",      answers: ["wallet", "a wallet"], audio: "audio/wallet.mp3", image: "images/wallet.png" },
    { id: "tablet",      label: "a tablet",      answers: ["tablet", "a tablet", "ipad", "an ipad", "i pad"], audio: "audio/tablet.mp3", image: "images/tablet.png" },
    { id: "watch",       label: "a watch",       answers: ["watch", "a watch"], audio: "audio/watch.mp3", image: "images/watch.png" },
  ];

  const SETS = [
    ["cellphone", "newspaper", "key", "credit-card", "camera"],
    ["umbrella", "passport", "charger", "photo", "glasses"],
    ["notebook", "pencil", "wallet", "tablet", "watch"],
  ];

  const MODES = [
    {
      id: "look-write",
      title: "Look & Write",
      tip: "Look at the picture. Write or say the word.",
      showPic: true,
      playOnCorrect: true,
      autoPlayOnShow: false,
    },
    {
      id: "listen-write",
      title: "Listen & Write",
      tip: "Listen carefully. Write or say the word.",
      showPic: false,
      playOnCorrect: false,
      autoPlayOnShow: true,
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu";
  let setIndex = 0;
  let itemIndex = 0;
  let order = [];
  let currentAudio = null;
  let locked = false;
  let modeCorrect = 0;
  let recognition = null;
  let listening = false;

  function byId(id) {
    return ITEMS.find((c) => c.id === id);
  }

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

  /** Flexible match: exact, contains, or contained (speech-friendly). */
  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    for (let i = 0; i < answers.length; i++) {
      const a = normalize(answers[i]);
      if (!a) continue;
      if (u === a || u.includes(a) || a.includes(u)) return true;
    }
    // also try without spaces (cellphone vs cell phone)
    const uFlat = u.replace(/[\s\-]/g, "");
    for (let i = 0; i < answers.length; i++) {
      const aFlat = normalize(answers[i]).replace(/[\s\-]/g, "");
      if (aFlat && (uFlat === aFlat || uFlat.includes(aFlat) || aFlat.includes(uFlat))) return true;
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
    const btn = app.querySelector(".mc-play");
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

  function ensureRecognition() {
    if (!SpeechRecognitionAPI) return null;
    if (recognition) return recognition;
    const r = new SpeechRecognitionAPI();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    recognition = r;
    return r;
  }

  function setMicUI(on) {
    const btn = document.getElementById("ll-mic");
    if (btn) btn.classList.toggle("is-listening", !!on);
  }

  function setFeedback(text, cls) {
    const fb = document.getElementById("ll-feedback");
    if (!fb) return;
    fb.textContent = text || "";
    fb.className = "ll-feedback" + (cls ? " " + cls : "");
  }

  function stopListening() {
    listening = false;
    setMicUI(false);
    if (recognition) {
      try { recognition.onresult = null; recognition.onerror = null; recognition.onend = null; recognition.abort(); } catch (_) {}
    }
  }

  function startListening() {
    if (locked) return;

    if (!SpeechRecognitionAPI) {
      setFeedback("Voice not supported in this browser — please type.", "warn");
      const input = document.getElementById("ll-input");
      if (input) input.focus();
      return;
    }

    if (listening) {
      stopListening();
      setFeedback("Tap 🎤 and say the word.", "");
      return;
    }

    // Stop any playing audio so the mic hears the student, not the prompt
    stopAudio();

    const r = ensureRecognition();
    if (!r) return;

    listening = true;
    setMicUI(true);
    setFeedback("Listening… say the word!", "");

    r.onresult = (ev) => {
      const alts = [];
      try {
        const res = ev.results[0];
        for (let i = 0; i < res.length; i++) {
          if (res[i] && res[i].transcript) alts.push(res[i].transcript.trim());
        }
      } catch (_) {}

      const best = alts[0] || "";
      const input = document.getElementById("ll-input");
      if (input && best) input.value = best;

      stopListening();

      if (!best) {
        setFeedback("Didn't catch that — try again or type.", "warn");
        return;
      }

      // Try every alternative against accepted answers
      const item = byId(order[itemIndex]);
      let matched = false;
      for (let i = 0; i < alts.length; i++) {
        if (isCorrect(alts[i], item.answers)) {
          if (input) input.value = alts[i];
          matched = true;
          break;
        }
      }
      // Always run check so correct/wrong feedback is consistent
      checkAnswer();
    };

    r.onerror = (ev) => {
      stopListening();
      const err = (ev && ev.error) || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        setFeedback("Microphone blocked — allow mic or type the word.", "warn");
      } else if (err === "no-speech") {
        setFeedback("No speech heard — tap 🎤 and try again.", "warn");
      } else {
        setFeedback("Couldn't hear — try typing.", "warn");
      }
    };

    r.onend = () => {
      if (listening) {
        listening = false;
        setMicUI(false);
      }
    };

    try {
      r.start();
    } catch (_) {
      stopListening();
      setFeedback("Mic busy — tap again in a moment.", "warn");
    }
  }

  function startMode(mi) {
    modeIndex = mi;
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    order = shuffle(SETS[setIndex].slice());
    itemIndex = 0;
    loadItem();
  }

  function loadItem() {
    locked = false;
    stopAudio();
    stopListening();
    phase = "play";
    render();
    const mode = MODES[modeIndex];
    const item = byId(order[itemIndex]);
    if (mode.autoPlayOnShow && item) {
      setTimeout(() => playAudio(item.audio), 300);
    }
    setTimeout(() => {
      const input = document.getElementById("ll-input");
      if (input) input.focus();
    }, 200);
  }

  function checkAnswer() {
    if (locked) return;
    const input = document.getElementById("ll-input");
    if (!input) return;
    const user = input.value;
    if (!normalize(user)) {
      input.focus();
      setFeedback("Type or say the word first.", "warn");
      return;
    }

    locked = true;
    input.disabled = true;
    const checkBtn = document.getElementById("ll-check");
    if (checkBtn) checkBtn.disabled = true;
    const micBtn = document.getElementById("ll-mic");
    if (micBtn) micBtn.disabled = true;
    stopListening();

    const item = byId(order[itemIndex]);
    const mode = MODES[modeIndex];
    const ok = isCorrect(user, item.answers);

    if (ok) {
      modeCorrect += 1;
      input.classList.add("is-correct");
      setFeedback("Correct!", "ok");
      const advance = () => {
        setTimeout(() => {
          if (itemIndex < order.length - 1) {
            itemIndex += 1;
            loadItem();
          } else if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 500);
      };
      if (mode.playOnCorrect) {
        playAudio(item.audio, advance);
      } else {
        advance();
      }
    } else {
      input.classList.add("is-wrong");
      setFeedback('It\'s "' + item.label + '"', "bad");
      if (mode.playOnCorrect) {
        playAudio(item.audio);
      }
      setTimeout(() => {
        if (itemIndex < order.length - 1) {
          itemIndex += 1;
          loadItem();
        } else if (setIndex < SETS.length - 1) {
          startSet(setIndex + 1);
        } else {
          phase = "done";
          render();
        }
      }, 1600);
    }
    updateProgress();
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) {
      el.textContent =
        "Set " + (setIndex + 1) + "/" + SETS.length + " · " + (itemIndex + 1) + "/" + order.length;
    }
  }

  function calcStars() {
    const total = ITEMS.length;
    const n = modeCorrect;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
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
          <span class="mc-title">Look & Listen Write</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">✍️</div>
          <h1>Look & Listen Write</h1>
          <p class="mc-desc">Write or say the word · 15 items (3 sets)</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="mc-mode-card mc-mode-btn" data-mode="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mode);
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const m = MODES[modeIndex];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Look & Listen Write</span>
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
          <p><strong>${m.title}</strong><br>You got <strong>${modeCorrect} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="mc-btn" id="ll-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="ll-menu">All modes</button>
        </section>`;
      document.getElementById("ll-again").onclick = () => startMode(modeIndex);
      document.getElementById("ll-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    // play — mic always visible for both modes
    const mode = MODES[modeIndex];
    const item = byId(order[itemIndex]);

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title} · Set ${setIndex + 1}/${SETS.length}</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/${SETS.length} · ${itemIndex + 1}/${order.length}</span>
      </header>
      <p class="mc-instruction" id="mc-hint">${mode.tip}</p>
      <div class="ll-stage">
        ${mode.showPic ? `
          <div class="ll-pic-wrap">
            <img class="ll-pic" src="${item.image}" alt="What is this?" draggable="false">
          </div>` : `
          <div class="ll-audio-only">
            <button type="button" class="mc-play ll-big-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
            <p class="ll-tap-hint">Tap to listen again</p>
          </div>`}
        <div class="ll-input-row">
          <input type="text" id="ll-input" class="ll-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type or say the word…" enterkeyhint="done">
          <button type="button" class="ll-mic" id="ll-mic" aria-label="Say the word" title="Say the word">🎤</button>
        </div>
        <p class="ll-feedback" id="ll-feedback">Tap 🎤 to speak, or type and Check</p>
        <button type="button" class="mc-btn" id="ll-check">Check</button>
      </div>`;

    const input = document.getElementById("ll-input");
    document.getElementById("ll-check").onclick = () => checkAnswer();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    document.getElementById("ll-mic").onclick = () => startListening();

    if (!mode.showPic) {
      const playBtn = app.querySelector(".ll-big-play");
      if (playBtn) playBtn.onclick = () => {
        stopListening();
        playAudio(item.audio);
      };
    }
  }

  render();
})();
