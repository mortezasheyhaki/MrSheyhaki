/* Family Roleplay · Meet Alex · AEF Starter Unit 4A */
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


  const GAME_ID = "starter-4a-family-roleplay";

  const CHAR = {
    greeting: "https://cdn.imgurl.ir/uploads/m626076_greeting.png",
    asking: "https://cdn.imgurl.ir/uploads/x796603_asking2.png",
    writing: "https://cdn.imgurl.ir/uploads/q4148_writing.png",
    appreciating: "https://cdn.imgurl.ir/uploads/q462245_appreciating.png",
  };

  // Roles the player can fill in. Empty ones are skipped in play.
  const ROLES = [
    { key: "mother", label: "Mother", pronoun: "She", relation: "mother" },
    { key: "father", label: "Father", pronoun: "He", relation: "father" },
    { key: "sister", label: "Sister", pronoun: "She", relation: "sister" },
    { key: "brother", label: "Brother", pronoun: "He", relation: "brother" },
    { key: "grandmother", label: "Grandmother", pronoun: "She", relation: "grandmother" },
    { key: "grandfather", label: "Grandfather", pronoun: "He", relation: "grandfather" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | setup | play | done
  let names = {}; // key → name string
  let queue = []; // non-empty roles for this play
  let index = 0;
  let correct = 0;
  let checked = false;
  let recognition = null;
  let listening = false;

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\.+$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function expectedAnswer(role) {
    return role.pronoun + "'s my " + role.relation + ".";
  }

  function isCorrect(user, role) {
    const n = normalize(user);
    const targets = [
      role.pronoun.toLowerCase() + "'s my " + role.relation,
      role.pronoun.toLowerCase() + " is my " + role.relation,
      role.pronoun.toLowerCase() + "s my " + role.relation,
    ];
    return targets.some(function (t) {
      return n === t;
    });
  }

  function buildQueue() {
    queue = ROLES.filter(function (r) {
      return (names[r.key] || "").trim().length > 0;
    });
  }

  function ensureSpeech() {
    if (recognition) return recognition;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onresult = function (ev) {
      const text = (ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) || "";
      const input = document.getElementById("fr-input");
      if (input && text) {
        input.value = text.trim();
        // capitalise first letter for nicer display
        if (input.value.length) {
          input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1);
        }
      }
      stopListening();
    };
    recognition.onerror = function () {
      stopListening();
    };
    recognition.onend = function () {
      stopListening();
    };
    return recognition;
  }

  function stopListening() {
    listening = false;
    const btn = document.getElementById("fr-mic");
    if (btn) btn.classList.remove("listening");
    try {
      if (recognition) recognition.stop();
    } catch (_) {}
  }

  function toggleMic() {
    if (checked) return;
    const sr = ensureSpeech();
    if (!sr) {
      const fb = document.getElementById("fr-mic-hint");
      if (fb) fb.textContent = "Speech not supported in this browser.";
      return;
    }
    if (listening) {
      stopListening();
      return;
    }
    listening = true;
    const btn = document.getElementById("fr-mic");
    if (btn) btn.classList.add("listening");
    try {
      sr.start();
    } catch (_) {
      stopListening();
    }
  }

  function startSetup() {
    phase = "setup";
    names = {};
    ROLES.forEach(function (r) {
      names[r.key] = "";
    });
    render();
  }

  function startPlay() {
    // collect names from inputs
    ROLES.forEach(function (r) {
      const el = document.getElementById("fr-name-" + r.key);
      names[r.key] = el ? el.value.trim() : "";
    });
    buildQueue();
    if (queue.length === 0) {
      const err = document.getElementById("fr-setup-error");
      if (err) {
        err.textContent = "Please enter at least one name.";
        err.hidden = false;
      }
      return;
    }
    phase = "play";
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    correct = 0;
    checked = false;
    stopListening();
    render();
  }

  function checkAnswer() {
    if (checked) return;
    checked = true;
    stopListening();
    const role = queue[index];
    const input = document.getElementById("fr-input");
    const user = input ? input.value : "";
    const ok = isCorrect(user, role);
    if (ok) correct += 1;

    if (input) {
      input.disabled = true;
      input.classList.remove("is-correct", "is-wrong");
      input.classList.add(ok ? "is-correct" : "is-wrong");
    }

    const tick = document.getElementById("fr-tick");
    if (tick) {
      tick.textContent = ok ? "✓" : "";
      tick.className = "fr-tick " + (ok ? "ok" : "bad");
    }

    const fb = document.getElementById("fr-feedback");
    if (fb) {
      fb.textContent = ok ? "Great!" : "Answer: " + expectedAnswer(role);
      fb.className = "fr-feedback " + (ok ? "ok" : "bad");
    }

    const checkBtn = document.getElementById("fr-check");
    if (checkBtn) checkBtn.style.display = "none";
    const mic = document.getElementById("fr-mic");
    if (mic) mic.disabled = true;

    // switch character to appreciating if correct
    const charImg = document.getElementById("fr-char");
    if (charImg) charImg.src = ok ? CHAR.appreciating : CHAR.asking;

    setTimeout(function () {
      const cont = document.getElementById("fr-continue");
      if (cont) cont.style.display = "inline-flex";
    }, 350);
  }

  function nextQuestion() {
    if (index >= queue.length - 1) {
      phase = "done";
      stopListening();
      render();
      return;
    }
    index += 1;
    checked = false;
    stopListening();
    render();
  }

  function calcStars() {
    const total = queue.length || 1;
    if (correct >= total) return 3;
    if (correct >= Math.ceil(total * 0.7)) return 2;
    if (correct >= Math.ceil(total * 0.4)) return 1;
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
      app.innerHTML =
        '<header class="fr-topbar">' +
        '<a class="fr-back" href="../" aria-label="Back">←</a>' +
        '<span class="fr-title">Family Roleplay</span>' +
        '<span class="fr-badge">4A</span></header>' +
        '<section class="fr-start">' +
        '<div class="fr-char-wrap"><img class="fr-char" src="' + CHAR.greeting + '" alt="Alex" draggable="false" /></div>' +
        "<h1>Meet Alex</h1>" +
        '<p class="fr-desc">Tell Alex about your family. Answer questions like <strong>Who is …?</strong> with <em>He\'s / She\'s my …</em></p>' +
        '<button type="button" class="fr-btn" id="fr-start">Start</button>' +
        "</section>";
      document.getElementById("fr-start").onclick = startSetup;
      return;
    }

    if (phase === "setup") {
      const fields = ROLES.map(function (r) {
        return (
          '<label class="fr-field">' +
          '<span class="fr-field-label">' + r.label + "</span>" +
          '<input type="text" class="fr-name-input" id="fr-name-' + r.key + '" placeholder="Name (or leave empty)" autocomplete="off" spellcheck="false" />' +
          "</label>"
        );
      }).join("");

      app.innerHTML =
        '<header class="fr-topbar">' +
        '<a class="fr-back" href="../" aria-label="Back">←</a>' +
        '<span class="fr-title">Your family</span>' +
        '<span class="fr-badge">Setup</span></header>' +
        '<section class="fr-setup">' +
        '<div class="fr-char-wrap fr-char-sm"><img class="fr-char" src="' + CHAR.writing + '" alt="Alex" draggable="false" /></div>' +
        '<p class="fr-desc">Type the names of your family members. Leave empty if you don\'t have that person.</p>' +
        '<div class="fr-fields">' + fields + "</div>" +
        '<p class="fr-setup-error" id="fr-setup-error" hidden></p>' +
        '<button type="button" class="fr-btn" id="fr-go">Continue →</button>' +
        "</section>";
      document.getElementById("fr-go").onclick = startPlay;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: 10,
          timeMs: timeMs,
          onAgain: () => location.reload(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML =
        '<header class="fr-topbar">' +
        '<a class="fr-back" href="../" aria-label="Back">←</a>' +
        '<span class="fr-title">Family Roleplay</span>' +
        '<span class="fr-badge">Done</span></header>' +
        '<section class="fr-done">' +
        '<div class="fr-char-wrap"><img class="fr-char" src="' + CHAR.appreciating + '" alt="Alex" draggable="false" /></div>' +
        '<div class="fr-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) + "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="fr-desc">You got ' + correct + " of " + queue.length + " correct.</p>" +
        '<button type="button" class="fr-btn" id="fr-again">Play again</button>' +
        '<button type="button" class="fr-btn secondary" id="fr-menu">Back to start</button></section>';
      document.getElementById("fr-again").onclick = startSetup;
      document.getElementById("fr-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    // PLAY
    const role = queue[index];
    const personName = names[role.key];
    const progress = index + 1 + " / " + queue.length;

    app.innerHTML =
      '<header class="fr-topbar">' +
      '<a class="fr-back" href="../" aria-label="Back">←</a>' +
      '<span class="fr-title">Family Roleplay</span>' +
      '<span class="fr-progress">' + progress + "</span></header>" +
      '<div class="fr-play">' +
      '<div class="fr-char-wrap"><img class="fr-char" id="fr-char" src="' + CHAR.asking + '" alt="Alex" draggable="false" /></div>' +
      '<p class="fr-bubble" id="fr-bubble">Who is <strong>' + personName + "</strong>?</p>" +
      '<div class="fr-answer-panel">' +
      '<div class="fr-answer-row">' +
      '<input type="text" class="fr-input" id="fr-input" placeholder="She\'s my … / He\'s my …" autocomplete="off" spellcheck="false" />' +
      '<button type="button" class="fr-mic" id="fr-mic" aria-label="Speak answer" title="Speak">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 9a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 2h2v2h-2v-2z"/></svg>' +
      "</button>" +
      '<span class="fr-tick" id="fr-tick"></span>' +
      "</div>" +
      '<p class="fr-mic-hint" id="fr-mic-hint"></p>' +
      '<p class="fr-feedback" id="fr-feedback"></p>' +
      "</div>" +
      '<div class="fr-actions">' +
      '<button type="button" class="fr-btn" id="fr-check">Check</button>' +
      '<button type="button" class="fr-btn secondary" id="fr-continue" style="display:none">Next →</button>' +
      "</div></div>";

    document.getElementById("fr-check").onclick = checkAnswer;
    document.getElementById("fr-continue").onclick = nextQuestion;
    document.getElementById("fr-mic").onclick = toggleMic;

    const input = document.getElementById("fr-input");
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") checkAnswer();
      });
      input.addEventListener("focus", function () {
        const charImg = document.getElementById("fr-char");
        if (charImg && !checked) charImg.src = CHAR.writing;
        setTimeout(function () {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 280);
      });
    }
  }

  render();
})();
