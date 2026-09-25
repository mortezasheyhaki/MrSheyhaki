/* Souvenirs Shop – supermarket-style speaking role-play · AEF Starter Unit 3B */
(function () {

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-3b-souvenirs-shop";

  const IMG = {
    idle: "images/girl1.png",
    help: "images/girl3.png",
    lookA: "images/girl4.png", // caps, toys, maps, pens
    lookB: "images/girl5.png", // t-shirt, mugs, notebooks
    phone: "images/girl6.png", // keychains
    phoneStart: "images/girl2.png", // after pressing Speak / listening
    bag: "images/girl8.png",
    money: "images/girl9.png",
  };

  const ITEMS = [
    { keys: ["cap", "caps"], label: "cap", price: 15, pose: "lookA" },
    { keys: ["t-shirt", "tshirt", "t shirt", "t-shirts", "tshirts", "tee shirt", "tee shirts"], label: "T-shirt", price: 18, pose: "lookB" },
    { keys: ["toy", "toys"], label: "toy", price: 12, pose: "lookA" },
    { keys: ["mug", "mugs"], label: "mug", price: 12, pose: "lookB" },
    { keys: ["keychain", "key chain", "key-chain", "keychains", "key chains", "keyring", "key ring"], label: "keychain", price: 5, pose: "phone" },
    { keys: ["map", "maps"], label: "map", price: 4, pose: "lookA" },
    { keys: ["pen", "pens"], label: "pen", price: 3, pose: "lookA" },
    { keys: ["notebook", "notebooks", "note book", "note books"], label: "notebook", price: 8, pose: "lookB" },
  ];

  const character = document.getElementById("character");
  const dialogue = document.getElementById("dialogue");
  const speakBtn = document.getElementById("speakBtn");
  const textBtn = document.getElementById("textBtn");
  const submitText = document.getElementById("submitText");
  const textInput = document.getElementById("textInput");
  const fallback = document.getElementById("fallback");
  const statusEl = document.getElementById("status");
  const musicBtn = document.getElementById("musicBtn");

  let isBusy = false;
  let idleTimer = null;
  let idleIndex = 0;
  const idleKeys = ["idle"];
  const idleTexts = {
    idle: "…",
    phoneStart: "Just a second…",
    help: "How can I help you?",
  };

  let greeted = false;
  let askedPrice = false;
  let buying = false;
  let paid = false;
  let lastItem = null;
  const askedItems = new Set();
  let playRecorded = false;

  let bgMusic = null;
  let musicMuted = false;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s\-']/g, " ")
      .replace(/\s+/g, " ");
  }

  function setImage(key) {
    const src = IMG[key] || IMG.idle;
    character.style.opacity = "0.35";
    setTimeout(() => {
      character.src = src;
      character.style.opacity = "1";
    }, 120);
  }

  function setText(txt) {
    dialogue.textContent = txt;
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function startIdleCycle() {
    stopIdleCycle();
    idleTimer = setInterval(() => {
      if (isBusy) return;
      idleIndex = (idleIndex + 1) % idleKeys.length;
      const key = idleKeys[idleIndex];
      setImage(key);
      setText(idleTexts[key] || "…");
    }, 7000);
  }

  function stopIdleCycle() {
    if (idleTimer) {
      clearInterval(idleTimer);
      idleTimer = null;
    }
  }

  function startMusic() {
    if (bgMusic) return;
    try {
      bgMusic = new Audio("audio/shop-bg.mp3");
      bgMusic.loop = true;
      bgMusic.volume = musicMuted ? 0 : 0.2;
      bgMusic.play().catch(() => {});
    } catch (_) {}
  }

  function toggleMusic() {
    musicMuted = !musicMuted;
    if (bgMusic) bgMusic.volume = musicMuted ? 0 : 0.2;
    if (musicBtn) musicBtn.textContent = musicMuted ? "🔇" : "🎵";
  }

  function updateStars() {
    if (!window.LAStars) return;
    const n = askedItems.size + (buying ? 1 : 0) + (paid ? 1 : 0);
    const stars = n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (stars > 0) {
      if (!playRecorded) {
        LAStars.recordPlay(GAME_ID);
        playRecorded = true;
      }
      LAStars.save(GAME_ID, stars);
    }
  }

  function findItem(text) {
    const n = normalize(text);
    let best = null;
    let bestLen = 0;
    for (const item of ITEMS) {
      for (const k of item.keys) {
        if (n.includes(k) && k.length > bestLen) {
          best = item;
          bestLen = k.length;
        }
      }
    }
    return best;
  }

  function isHowMuch(text) {
    const n = normalize(text);
    return /how much (is|are)/.test(n) || /how much for/.test(n) || /what(?:'s| is) the price/.test(n);
  }

  function isPluralQuestion(text) {
    return /how much are/.test(normalize(text));
  }

  function isBuy(text) {
    const n = normalize(text);
    return (
      /\bi('d| would)? like\b/.test(n) ||
      /\bi want\b/.test(n) ||
      /\bcan i (have|get|buy)\b/.test(n) ||
      /\bi('ll| will) take\b/.test(n) ||
      /\bbuy\b/.test(n)
    );
  }

  function isPay(text) {
    const n = normalize(text);
    return (
      /here you go/.test(n) ||
      /here you are/.test(n) ||
      /here(?:'s| is) the money/.test(n) ||
      /\b(dollar|dollars)\b/.test(n) ||
      /take this/.test(n)
    );
  }

  function isGreeting(text) {
    return /^(hi|hello|hey|good morning|good afternoon|excuse me)\b/.test(normalize(text));
  }

  function isBye(text) {
    return /^(bye|goodbye|thanks|thank you|see you)\b/.test(normalize(text));
  }

  function resetButtons() {
    speakBtn.classList.remove("listening");
    speakBtn.textContent = "Speak";
    speakBtn.disabled = false;
    textBtn.disabled = false;
  }

  async function handleInput(raw) {
    const text = String(raw || "").trim();
    if (!text || isBusy) return;

    isBusy = true;
    stopIdleCycle();
    speakBtn.disabled = true;
    textBtn.disabled = true;
    statusEl.textContent = "";

    // first interaction: if greeting (hi/hello) or any first speak → girl 3 replies
    if (!greeted) {
      greeted = true;
      // brief girl 2 then switch to girl 3
      setImage("phoneStart");
      await wait(400);
      setImage("help");  // girl 3
      if (isGreeting(text)) {
        setText("Hi! How can I help you?");
      } else {
        setText("How can I help you?");
      }
      updateStars();
      await wait(1800);
      isBusy = false;
      resetButtons();
      // now allow fuller idle poses after greeting
      idleKeys.length = 0;
      idleKeys.push("idle", "phoneStart", "help");
      return;
    }

    // pay
    if (buying && isPay(text)) {
      paid = true;
      setImage("money");
      setText("Thank you! Have a nice day!");
      updateStars();
      await wait(3200);
      isBusy = false;
      resetButtons();
      finishShop();
      startIdleCycle();
      return;
    }

    // buy
    if (isBuy(text) || (askedPrice && /^(yes|ok|okay|sure|please|that one|this one)\b/.test(normalize(text)))) {
      buying = true;
      const item = findItem(text) || lastItem;
      setImage("bag");
      if (item) {
        lastItem = item;
        setText("Sure! That'll be $" + item.price + ".");
      } else {
        setText("Sure! Here you are.");
      }
      updateStars();
      await wait(3000);
      isBusy = false;
      resetButtons();
      startIdleCycle();
      return;
    }

    // price question
    if (isHowMuch(text) || findItem(text)) {
      const item = findItem(text);
      if (!item) {
        setImage("help");
        setText("Sorry, which one?");
        await wait(2000);
        isBusy = false;
        resetButtons();
        startIdleCycle();
        return;
      }
      lastItem = item;
      askedPrice = true;
      askedItems.add(item.label);
      setImage(item.pose);
      setText("Let me check…");
      await wait(900);
      setImage("help");
      const usePlural = isPluralQuestion(text);
      if (usePlural) setText("They're $" + item.price + ".");
      else setText("It's $" + item.price + ".");
      updateStars();
      await wait(2800);
      isBusy = false;
      resetButtons();
      startIdleCycle();
      return;
    }

    if (isGreeting(text)) {
      setImage("help");
      setText("Hi! How can I help you?");
      await wait(2000);
      isBusy = false;
      resetButtons();
      startIdleCycle();
      return;
    }

    if (isBye(text)) {
      setImage("help");
      setText(paid ? "Bye! Come again!" : "Bye!");
      await wait(2000);
      isBusy = false;
      resetButtons();
      startIdleCycle();
      return;
    }

    setImage("help");
    setText('Try “How much is a cap?” or “How much are the mugs?”');
    await wait(2500);
    isBusy = false;
    resetButtons();
    startIdleCycle();
  }

  // Speech recognition
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    recognition.onstart = () => {
      speakBtn.classList.add("listening");
      speakBtn.textContent = "Listening…";
      statusEl.textContent = "Speak now…";
      // Only show girl 2 the first time the player presses Speak
      if (!greeted) setImage("phoneStart");
    };

    recognition.onresult = (event) => {
      let best = event.results[0][0].transcript.trim();
      for (let i = 0; i < event.results[0].length; i++) {
        const t = event.results[0][i].transcript.trim();
        if (findItem(t) || isHowMuch(t) || isBuy(t) || isPay(t) || isGreeting(t)) {
          best = t;
          break;
        }
      }
      statusEl.textContent = 'Heard: “' + best + '”';
      handleInput(best);
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") statusEl.textContent = "No speech detected. Try again.";
      else if (e.error === "not-allowed") statusEl.textContent = "Microphone permission denied.";
      else statusEl.textContent = "Could not hear you clearly.";
      if (!isBusy) resetButtons();
    };

    recognition.onend = () => {
      if (!isBusy) resetButtons();
    };
  } else {
    speakBtn.disabled = true;
    statusEl.textContent = "Speech not supported. Use Type instead.";
  }

  speakBtn.addEventListener("click", () => {
    if (isBusy || !recognition) return;
    try {
      recognition.start();
    } catch (_) {}
  });

  textBtn.addEventListener("click", () => {
    fallback.style.display = fallback.style.display === "flex" ? "none" : "flex";
    if (fallback.style.display === "flex") textInput.focus();
  });

  submitText.addEventListener("click", () => {
    const v = textInput.value;
    textInput.value = "";
    handleInput(v);
  });

  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = textInput.value;
      textInput.value = "";
      handleInput(v);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement !== textInput && !isBusy && recognition) {
      e.preventDefault();
      try { recognition.start(); } catch (_) {}
    }
  });

  if (musicBtn) musicBtn.addEventListener("click", toggleMusic);

  // boot
  setImage("idle");
  setText("…");
  if (window.LAFinish) LAFinish.startTimer();

  function finishShop() {
    if (!window.LAFinish) return;
    const timeMs = LAFinish.stopTimer();
    const n = askedItems.size + (buying ? 1 : 0) + (paid ? 1 : 0);
    LAFinish.show({
      gameId: GAME_ID,
      score: n,
      total: 6,
      timeMs: timeMs,
      onAgain: () => location.reload(),
      onModes: () => { location.href = "../"; },
      backHref: "../",
      save: false,
    });
  }

  startIdleCycle();
  startMusic();
})();
