/* Numbers Practice – Listen & write / Listen & say – AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-numbers-practice";

  const ITEMS = [
    { id: "11", num: "11", word: "eleven", audio: "audio/11.mp3" },
    { id: "12", num: "12", word: "twelve", audio: "audio/12.mp3" },
    { id: "13", num: "13", word: "thirteen", audio: "audio/13.mp3" },
    { id: "14", num: "14", word: "fourteen", audio: "audio/14.mp3" },
    { id: "15", num: "15", word: "fifteen", audio: "audio/15.mp3" },
    { id: "16", num: "16", word: "sixteen", audio: "audio/16.mp3" },
    { id: "17", num: "17", word: "seventeen", audio: "audio/17.mp3" },
    { id: "18", num: "18", word: "eighteen", audio: "audio/18.mp3" },
    { id: "19", num: "19", word: "nineteen", audio: "audio/19.mp3" },
    { id: "20", num: "20", word: "twenty", audio: "audio/20.mp3" },
    { id: "30", num: "30", word: "thirty", audio: "audio/30.mp3" },
    { id: "40", num: "40", word: "forty", audio: "audio/40.mp3" },
    { id: "50", num: "50", word: "fifty", audio: "audio/50.mp3" },
    { id: "60", num: "60", word: "sixty", audio: "audio/60.mp3" },
    { id: "70", num: "70", word: "seventy", audio: "audio/70.mp3" },
    { id: "80", num: "80", word: "eighty", audio: "audio/80.mp3" },
    { id: "90", num: "90", word: "ninety", audio: "audio/90.mp3" },
    { id: "100", num: "100", word: "a hundred", audio: "audio/100.mp3", alts: ["hundred", "one hundred"] },
  ];

  const MODES = [
    { id: "write", title: "Listen & write", tip: "Listen, then type the word." },
    { id: "say", title: "Listen & say", tip: "Listen, then say the number." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let modeIndex = 0;
  let queue = [];
  let qi = 0;
  let correct = 0;
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

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".np-play");
    if (btn) btn.classList.remove("playing");
  }

  function playItem(item) {
    if (!item || !item.audio) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".np-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function normalizeSpeech(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchWrite(val, item) {
    const raw = String(val || "").toLowerCase().trim();
    if (!raw) return false;
    // Prefer word answers (eleven, twelve, …)
    const cleaned = raw.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    const targets = [item.word].concat(item.alts || []).map(function (w) {
      return String(w).toLowerCase().trim();
    });
    if (targets.some(function (w) { return cleaned === w; })) return true;
    // Also accept "one hundred" / "hundred" for 100
    if (item.num === "100" && (cleaned === "hundred" || cleaned === "one hundred" || cleaned === "a hundred")) return true;
    return false;
  }

  function matchSay(transcript, item) {
    const t = normalizeSpeech(transcript);
    if (!t) return false;
    // digits spoken as digits
    const digits = t.replace(/\D/g, "");
    if (digits === item.num) return true;
    // word forms
    const targets = [item.word].concat(item.alts || []).map(normalizeSpeech);
    if (targets.some(function (w) { return t === w || t.indexOf(w) !== -1; })) return true;
    // number words sometimes come as "one hundred"
    if (item.num === "100" && (t.indexOf("hundred") !== -1)) return true;
    return false;
  }

  function tickHtml(label) {
    return '<span class="np-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> ' + label;
  }

  function stopListen() {
    listening = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    const mic = app.querySelector(".np-mic");
    if (mic) mic.classList.remove("listening");
  }

  function startListen(onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      onResult(null, "Speech recognition not supported in this browser.");
      return;
    }
    stopListen();
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    listening = true;
    const mic = app.querySelector(".np-mic");
    if (mic) mic.classList.add("listening");
    const status = document.getElementById("np-status");
    if (status) {
      status.className = "np-status";
      status.textContent = "Listening…";
    }
    recognition.onresult = function (e) {
      let best = "";
      for (let i = 0; i < e.results.length; i++) {
        for (let j = 0; j < e.results[i].length; j++) {
          const alt = e.results[i][j].transcript;
          if (alt && alt.length > best.length) best = alt;
        }
      }
      stopListen();
      onResult(best, null);
    };
    recognition.onerror = function () {
      stopListen();
      onResult(null, "Couldn’t hear that. Try again.");
    };
    recognition.onend = function () {
      if (listening) stopListen();
    };
    try {
      recognition.start();
    } catch (_) {
      stopListen();
      onResult(null, "Mic error. Try again.");
    }
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    queue = shuffle(ITEMS);
    qi = 0;
    correct = 0;
    phase = "play";
    stopAudio();
    stopListen();
    render();
    setTimeout(function () {
      playItem(queue[qi]);
    }, 300);
  }

  function nextOrDone() {
    if (qi >= queue.length - 1) {
      phase = "done";
      render();
      return;
    }
    qi += 1;
    render();
    setTimeout(function () {
      playItem(queue[qi]);
    }, 250);
  }

  function calcStars() {
    const n = queue.length || 1;
    const r = correct / n;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function render() {
    stopAudio();
    stopListen();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="np-topbar">' +
        '<a class="np-back" href="../" aria-label="Back">←</a>' +
        '<span class="np-title">Numbers Practice</span>' +
        '<span class="np-badge">2B</span>' +
        "</header>" +
        '<div class="np-body">' +
        '<section class="np-menu">' +
        '<div class="np-hero"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg></div>' +
        "<h1>Numbers Practice</h1>" +
        '<p class="np-menu-desc">11–20 and tens to 100<br>Choose a mode</p>' +
        '<div class="np-mode-list">' +
        '<button type="button" class="np-mode-btn" data-mi="0">' +
        '<span class="np-mode-num">1</span>' +
        "<div><strong>Listen &amp; write</strong><small>Hear the number → type the word</small></div>" +
        "</button>" +
        '<button type="button" class="np-mode-btn" data-mi="1">' +
        '<span class="np-mode-num">2</span>' +
        "<div><strong>Listen &amp; say</strong><small>Hear the number → say it</small></div>" +
        "</button>" +
        "</div>" +
        "</section>" +
        "</div>";
      app.querySelectorAll(".np-mode-btn").forEach(function (b) {
        b.onclick = function () { startMode(+b.dataset.mi); };
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correct,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startMode(modeIndex);
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const item = queue[qi];
    const pct = ((qi + 1) / queue.length) * 100;

    let main = "";
    if (mode.id === "write") {
      main =
        '<button type="button" class="np-play" id="np-play" aria-label="Play">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<div class="np-card is-hidden" id="np-card">' +'<span class="np-card-label">Number</span>' +'<span class="np-card-q">?</span>' +'<span class="np-card-num">' + item.num + '</span>' +'<span class="np-card-word">' + item.word + '</span>' +'</div>' +
        '<p class="np-tip">' + mode.tip + "</p>" +
        '<input type="text" class="np-input" id="np-input" placeholder="Type the word…" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
        '<button type="button" class="np-btn" id="np-check">Check</button>' +
        '<p class="np-status" id="np-status"></p>';
    } else {
      main =
        '<button type="button" class="np-play" id="np-play" aria-label="Play">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<div class="np-card is-hidden" id="np-card">' +'<span class="np-card-label">Number</span>' +'<span class="np-card-q">?</span>' +'<span class="np-card-num">' + item.num + '</span>' +'<span class="np-card-word">' + item.word + '</span>' +'</div>' +
        '<p class="np-tip">' + mode.tip + "</p>" +
        '<button type="button" class="np-mic" id="np-mic" aria-label="Speak">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        '<span class="np-mic-rings"><i></i><i></i><i></i></span>' +
        "</button>" +
        '<p class="np-status" id="np-status">Tap the microphone</p>';
    }

    app.innerHTML =
      '<header class="np-topbar">' +
      '<a class="np-back" href="../" aria-label="Back">←</a>' +
      '<span class="np-title">' + mode.title + "</span>" +
      '<span class="np-badge">' + (qi + 1) + " / " + queue.length + "</span>" +
      "</header>" +
      '<div class="np-track"><div class="np-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="np-body">' + main + "</div>";

    document.getElementById("np-play").onclick = function () {
      playItem(item);
    };

    if (mode.id === "write") {
      const input = document.getElementById("np-input");
      const status = document.getElementById("np-status");
      const check = function () {
        const val = input.value;
        if (!String(val || "").trim()) {
          status.className = "np-status is-bad";
          status.textContent = "Type the word first.";
          return;
        }
        if (matchWrite(val, item)) {
          correct += 1;
          status.className = "np-status is-ok";
          status.innerHTML = tickHtml("Correct!");
          input.disabled = true;
          var cardEl = document.getElementById("np-card");
          if (cardEl) { cardEl.classList.remove("is-hidden"); cardEl.classList.add("is-revealed"); }
          setTimeout(nextOrDone, 1100);
        } else {
          status.className = "np-status is-bad";
          status.textContent = "Try again!";
        }
      };
      document.getElementById("np-check").onclick = check;
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") check();
      });
      setTimeout(function () { input.focus(); }, 100);
    } else {
      const status = document.getElementById("np-status");
      const mic = document.getElementById("np-mic");
      mic.onclick = function () {
        if (listening) {
          stopListen();
          status.className = "np-status";
          status.textContent = "Tap the microphone";
          return;
        }
        startListen(function (transcript, err) {
          if (err) {
            status.className = "np-status is-bad";
            status.textContent = err;
            return;
          }
          if (matchSay(transcript, item)) {
            correct += 1;
            status.className = "np-status is-ok";
            status.innerHTML = tickHtml("Correct!");
            mic.classList.add("is-ok");
            var cardEl = document.getElementById("np-card");
            if (cardEl) { cardEl.classList.remove("is-hidden"); cardEl.classList.add("is-revealed"); }
            setTimeout(nextOrDone, 1100);
          } else {
            status.className = "np-status is-bad";
            status.textContent = "Try again! (heard: “" + (transcript || "…") + "”)";
          }
        });
      };
    }
  }

  render();
})();
