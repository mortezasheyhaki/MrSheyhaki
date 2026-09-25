/* Listen & Write / Listen & Say · AEF Starter Unit 4A – People & Family */
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


  const GAME_ID = "starter-4a-listen-write-say";

  const MIC_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/></svg>';

  const PLAY_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  const ITEMS = [
    { id: "boy", word: "boy", accept: ["boy", "a boy"], audio: "audio/boy.mp3" },
    { id: "girl", word: "girl", accept: ["girl", "a girl"], audio: "audio/girl.mp3" },
    { id: "man", word: "man", accept: ["man", "a man"], audio: "audio/man.mp3" },
    { id: "woman", word: "woman", accept: ["woman", "a woman"], audio: "audio/woman.mp3" },
    { id: "men", word: "men", accept: ["men"], audio: "audio/men.mp3" },
    { id: "women", word: "women", accept: ["women"], audio: "audio/women.mp3" },
    { id: "child", word: "child", accept: ["child", "a child"], audio: "audio/child.mp3" },
    { id: "children", word: "children", accept: ["children"], audio: "audio/children.mp3" },
    { id: "friends", word: "friends", accept: ["friends", "friend"], audio: "audio/friends.mp3" },
    { id: "person", word: "person", accept: ["person", "a person"], audio: "audio/person.mp3" },
    { id: "people", word: "people", accept: ["people"], audio: "audio/people.mp3" },
    { id: "husband", word: "husband", accept: ["husband"], audio: "audio/husband.mp3" },
    { id: "wife", word: "wife", accept: ["wife"], audio: "audio/wife.mp3" },
    { id: "mother", word: "mother", accept: ["mother", "mom", "mum"], audio: "audio/mother.mp3" },
    { id: "father", word: "father", accept: ["father", "dad"], audio: "audio/father.mp3" },
    { id: "son", word: "son", accept: ["son"], audio: "audio/son.mp3" },
    { id: "daughter", word: "daughter", accept: ["daughter"], audio: "audio/daughter.mp3" },
    { id: "brother", word: "brother", accept: ["brother"], audio: "audio/brother.mp3" },
    { id: "sister", word: "sister", accept: ["sister"], audio: "audio/sister.mp3" },
    { id: "grandmother", word: "grandmother", accept: ["grandmother", "grandma", "granny"], audio: "audio/grandmother.mp3" },
    { id: "grandfather", word: "grandfather", accept: ["grandfather", "grandpa"], audio: "audio/grandfather.mp3" },
  ];

  const MODES = [
    { id: "write", title: "Listen & Write", tip: "Listen to the word, then type what you hear." },
    { id: "say", title: "Listen & Say", tip: "Listen, then say the word out loud." },
  ];

  const ROUND_SIZE = ITEMS.length; // all 21 words

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let modeIndex = 0;
  let deck = [];
  let qIndex = 0;
  let score = 0;
  let answered = false;
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
    app.querySelectorAll(".lw-audio-btn.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playItem(item) {
    stopAudio();
    const btn = app.querySelector(".lw-audio-btn");
    if (!item.audio) return;
    const a = new Audio(item.audio);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
    a.onerror = function () {
      if (btn) btn.classList.remove("playing");
    };
  }

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s']/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(input, item) {
    var n = normalize(input);
    if (!n) return false;
    return item.accept.some(function (a) {
      return normalize(a) === n;
    });
  }

  function calcStars() {
    var total = deck.length || 1;
    var pct = score / total;
    if (pct >= 0.9) return 3;
    if (pct >= 0.6) return 2;
    if (pct >= 0.3) return 1;
    return 0;
  }

  function saveStars() {
    var stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    deck = shuffle(ITEMS).slice(0, ROUND_SIZE);
    qIndex = 0;
    score = 0;
    answered = false;
    stopRecognition();
    phase = "play";
    render();
    setTimeout(function () {
      if (deck[0]) playItem(deck[0]);
    }, 350);
  }

  function goNext() {
    stopAudio();
    stopRecognition();
    answered = false;
    if (qIndex >= deck.length - 1) {
      phase = "done";
      render();
      return;
    }
    qIndex++;
    render();
    setTimeout(function () {
      playItem(deck[qIndex]);
    }, 300);
  }

  function stopRecognition() {
    listening = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
      recognition = null;
    }
    app.querySelectorAll(".say-mic.listening").forEach(function (b) {
      b.classList.remove("listening");
    });
  }

  function hasSpeech() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function startRecognition(item) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var fb = document.getElementById("lw-feedback");
    if (!SR) {
      if (fb) {
        fb.textContent = "Speech not available on this device. Use Show answer.";
        fb.className = "lw-feedback hint";
      }
      return;
    }
    stopRecognition();
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    listening = true;
    var mic = app.querySelector(".say-mic");
    if (mic) mic.classList.add("listening");
    var heard = document.getElementById("say-heard");
    if (fb) {
      fb.textContent = "Listening… say the word";
      fb.className = "lw-feedback hint";
    }

    recognition.onresult = function (ev) {
      var alts = [];
      for (var i = 0; i < ev.results[0].length; i++) {
        alts.push(ev.results[0][i].transcript);
      }
      var said = alts[0] || "";
      if (heard) heard.textContent = "You said: " + said;
      var ok = alts.some(function (t) {
        return isCorrect(t, item);
      });
      finishSay(ok, item);
    };
    recognition.onerror = function () {
      stopRecognition();
      if (fb) {
        fb.textContent = "Couldn't hear you — try again.";
        fb.className = "lw-feedback bad";
      }
    };
    recognition.onend = function () {
      listening = false;
      if (mic) mic.classList.remove("listening");
    };
    try {
      recognition.start();
    } catch (_) {
      stopRecognition();
    }
  }

  function finishSay(ok, item) {
    if (answered) return;
    answered = true;
    stopRecognition();
    if (ok) score++;
    var fb = document.getElementById("lw-feedback");
    if (fb) {
      fb.textContent = ok
        ? "Correct!"
        : "Not quite — the word is \"" + item.word + "\".";
      fb.className = "lw-feedback " + (ok ? "ok" : "bad");
    }
    setTimeout(goNext, ok ? 900 : 1400);
  }

  function checkWrite(item) {
    if (answered) return;
    var input = document.getElementById("lw-input");
    if (!input) return;
    var ok = isCorrect(input.value, item);
    answered = true;
    if (ok) score++;
    input.classList.add(ok ? "is-correct" : "is-wrong");
    input.disabled = true;
    var fb = document.getElementById("lw-feedback");
    if (fb) {
      fb.textContent = ok
        ? "Correct!"
        : "Answer: \"" + item.word + "\".";
      fb.className = "lw-feedback " + (ok ? "ok" : "bad");
    }
    var check = document.getElementById("lw-check");
    if (check) check.disabled = true;
    var replay = document.getElementById("lw-replay");
    if (replay) replay.disabled = true;
    setTimeout(goNext, ok ? 900 : 1400);
  }

  function markSelfCorrect(item, ok) {
    if (answered) return;
    answered = true;
    stopRecognition();
    if (ok) score++;
    var fb = document.getElementById("lw-feedback");
    if (fb) {
      fb.textContent = ok
        ? "Marked correct — \"" + item.word + "\""
        : "The word is \"" + item.word + "\".";
      fb.className = "lw-feedback " + (ok ? "ok" : "hint");
    }
    setTimeout(goNext, ok ? 900 : 1400);
  }

  function render() {
    stopAudio();
    stopRecognition();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Listen & Write / Say</span>' +
        '<span class="mc-badge">4A</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">' + MIC_SVG + "</div>" +
        "<h1>Listen & Write / Say</h1>" +
        '<p class="mc-desc">People & family words · ' + ITEMS.length + " words</p>" +
        '<div class="mc-mode-list">' +
        MODES.map(function (m, i) {
          return (
            '<button type="button" class="mc-mode-card mc-mode-btn" data-mode="' + i + '">' +
            '<span class="mc-mode-num">' + (i + 1) + "</span>" +
            "<div><strong>" + m.title + "</strong><p>" + m.tip + "</p></div>" +
            "</button>"
          );
        }).join("") +
        "</div></section>";
      app.querySelectorAll(".mc-mode-btn").forEach(function (btn) {
        btn.onclick = function () {
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: score,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => startMode(typeof modeIndex !== 'undefined' ? modeIndex : 0),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      var stars = saveStars();
      var m = MODES[modeIndex];
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Listen & Write / Say</span>' +
        '<span class="mc-badge">Done</span>' +
        "</header>" +
        '<section class="mc-done">' +
        '<div class="mc-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") +
        "</h1>" +
        '<p class="mc-desc"><strong>' + m.title + "</strong><br>You got <strong>" +
        score + " / " + deck.length + "</strong> correct.</p>" +
        '<div class="lw-actions">' +
        '<button type="button" class="mc-btn" id="lw-again">Play again</button>' +
        '<button type="button" class="mc-btn secondary" id="lw-menu">All modes</button>' +
        "</div></section>";
      document.getElementById("lw-again").onclick = function () {
        startMode(modeIndex);
      };
      document.getElementById("lw-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    var mode = MODES[modeIndex];
    var item = deck[qIndex];
    var progress = qIndex + 1 + " / " + deck.length;

    if (mode.id === "write") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">' + mode.title + "</span>" +
        '<span class="mc-progress">' + progress + "</span>" +
        "</header>" +
        '<div class="lw-play">' +
        '<button type="button" class="lw-audio-btn" aria-label="Play word">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        PLAY_SVG +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<p class="lw-hint">Listen, then type the word</p>' +
        '<div class="lw-input-wrap">' +
        '<input class="lw-input" id="lw-input" type="text" autocomplete="off" ' +
        'autocapitalize="off" spellcheck="false" placeholder="Type what you hear…" aria-label="Your answer">' +
        "</div>" +
        '<p class="lw-feedback" id="lw-feedback"></p>' +
        '<div class="lw-actions">' +
        '<button type="button" class="mc-btn secondary" id="lw-replay">Play again</button>' +
        '<button type="button" class="mc-btn" id="lw-check">Check</button>' +
        "</div></div>";

      var input = document.getElementById("lw-input");
      app.querySelector(".lw-audio-btn").onclick = function () {
        playItem(item);
      };
      document.getElementById("lw-replay").onclick = function () {
        playItem(item);
      };
      document.getElementById("lw-check").onclick = function () {
        checkWrite(item);
      };
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") checkWrite(item);
      });
      setTimeout(function () {
        input.focus();
      }, 100);
      return;
    }

    // Listen & Say
    var speechOk = hasSpeech();
    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">' + mode.title + "</span>" +
      '<span class="mc-progress">' + progress + "</span>" +
      "</header>" +
      '<div class="lw-play">' +
      '<button type="button" class="lw-audio-btn" aria-label="Play word">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        PLAY_SVG +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
      '<p class="lw-hint">' +
      (speechOk
        ? "Listen, then tap the mic and say the word"
        : "Listen, say the word, then mark yourself") +
      "</p>" +
      '<button type="button" class="say-mic" id="say-mic" aria-label="Speak">' +
      MIC_SVG +
      "</button>" +
      '<p class="say-heard" id="say-heard"></p>' +
      '<p class="lw-feedback" id="lw-feedback">' +
      (speechOk ? "" : "Tap I said it after you speak, or Show answer.") +
      "</p>" +
      '<div class="lw-actions">' +
      '<button type="button" class="mc-btn secondary" id="lw-replay">Play again</button>' +
      (speechOk
        ? ""
        : '<button type="button" class="mc-btn" id="lw-said">I said it</button>') +
      '<button type="button" class="mc-btn secondary" id="lw-show">Show answer</button>' +
      "</div></div>";

    app.querySelector(".lw-audio-btn").onclick = function () {
      playItem(item);
    };
    document.getElementById("lw-replay").onclick = function () {
      playItem(item);
    };
    document.getElementById("say-mic").onclick = function () {
      if (answered) return;
      if (speechOk) startRecognition(item);
      else {
        var fb = document.getElementById("lw-feedback");
        if (fb) {
          fb.textContent = "Say the word, then tap I said it.";
          fb.className = "lw-feedback hint";
        }
      }
    };
    var saidBtn = document.getElementById("lw-said");
    if (saidBtn) {
      saidBtn.onclick = function () {
        markSelfCorrect(item, true);
      };
    }
    document.getElementById("lw-show").onclick = function () {
      if (answered) return;
      markSelfCorrect(item, false);
    };
  }

  render();
})();
