/* Verb Phrases Preferences · AEF Starter Unit 5B
   Do you…? → Yes, I do. / No, I don't. (both accepted)
   Typing + voice recognition.
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-preferences";

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
    window.__laUiSfx = {
      tap: function () { tone(520, 0.06, "triangle", 0.08); },
      correct: function () {
        tone(523, 0.1, "sine", 0.12, 0);
        tone(659, 0.12, "sine", 0.12, 0.08);
        tone(784, 0.18, "sine", 0.1, 0.16);
      },
      wrong: function () {
        tone(220, 0.14, "sawtooth", 0.07, 0);
        tone(180, 0.18, "sawtooth", 0.06, 0.1);
      },
      celebrate: function () {
        [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
      }
    };
  })();

  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }

  var ITEMS = [
    {
      question: "Do you live in an apartment?",
      image: "https://cdn.imgurl.ir/uploads/a268498_1._live_in_an_apartment.png"
    },
    {
      question: "Do you have breakfast in the morning?",
      image: "https://cdn.imgurl.ir/uploads/i180939_2_have_breakfast.png"
    },
    {
      question: "Do you watch TV in the evening?",
      image: "https://cdn.imgurl.ir/uploads/z722778_3_watch_TV.png"
    },
    {
      question: "Do you listen to the radio?",
      image: "https://cdn.imgurl.ir/uploads/r771582_4_listen_to_the_radio.png"
    },
    {
      question: "Do you read the newspaper?",
      image: "https://cdn.imgurl.ir/uploads/m787410_5_read_the_newspaper.png"
    },
    {
      question: "Do you eat fast food?",
      image: "https://cdn.imgurl.ir/uploads/b044304_6__fastfood.png"
    },
    {
      question: "Do you drink coffee?",
      image: "https://cdn.imgurl.ir/uploads/g296945_7_drink_coffee.png"
    },
    {
      question: "Do you speak English?",
      image: "https://cdn.imgurl.ir/uploads/b781742_8_speak_English.png"
    },
    {
      question: "Do you want a coffee?",
      image: "https://cdn.imgurl.ir/uploads/e991538_9_want_a_coffee.png"
    },
    {
      question: "Do you have a dog?",
      image: "https://cdn.imgurl.ir/uploads/b92270_10_have_a_dog.png"
    },
    {
      question: "Do you like cats?",
      image: "https://cdn.imgurl.ir/uploads/u544398_11_like_cats.png"
    },
    {
      question: "Do you work in a bank?",
      image: "https://cdn.imgurl.ir/uploads/j72729_12_work_in_a_bank.png"
    },
    {
      question: "Do you study Spanish?",
      image: "https://cdn.imgurl.ir/uploads/h46592_13_study_Spanish.png"
    },
    {
      question: "Do you go to English classes?",
      image: "https://cdn.imgurl.ir/uploads/x832355_14_Go_to_English_cles.png"
    },
    {
      question: "Do you need a new car?",
      image: "https://cdn.imgurl.ir/uploads/i19129_15_need_a_new_car.png"
    }
  ];

  var YES_FORMS = [
    "yes i do",
    "yes i do.",
    "yes, i do",
    "yes, i do.",
    "yes"
  ];
  var NO_FORMS = [
    "no i don't",
    "no i dont",
    "no i do not",
    "no, i don't",
    "no, i dont",
    "no, i do not",
    "no i don't.",
    "no, i don't.",
    "no"
  ];

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var speechSupported = !!SpeechRecognition;

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var index = 0;
  var score = 0;
  var locked = false;
  var listening = false;
  var recognition = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[?.!,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isValidAnswer(user) {
    var n = normalize(user);
    if (!n) return false;
    // Accept yes/no with or without "I do" / "I don't"
    if (YES_FORMS.indexOf(n) >= 0) return true;
    if (NO_FORMS.indexOf(n) >= 0) return true;
    // Flexible: starts with yes/no and contains do/don't
    if (/^yes\b/.test(n) && /\bdo\b/.test(n)) return true;
    if (/^no\b/.test(n) && (/\bdon'?t\b/.test(n) || /\bdo not\b/.test(n))) return true;
    return false;
  }

  function currentItem() {
    return ITEMS[order[index]];
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
      recognition = null;
    }
    var btn = document.getElementById("micBtn");
    var hint = document.getElementById("micHint");
    if (btn) btn.classList.remove("is-listening");
    if (hint) {
      hint.textContent = speechSupported ? "Tap the mic to speak" : "";
      hint.className = "mic-hint";
    }
  }

  function startListening() {
    if (locked || !speechSupported) return;
    if (listening) {
      stopListening();
      return;
    }
    sfxTap();
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    listening = true;
    var btn = document.getElementById("micBtn");
    var hint = document.getElementById("micHint");
    if (btn) btn.classList.add("is-listening");
    if (hint) {
      hint.textContent = "Listening…";
      hint.className = "mic-hint is-listening";
    }

    recognition.onresult = function (event) {
      var best = "";
      try {
        best = event.results[0][0].transcript || "";
      } catch (_) {}
      var input = document.getElementById("answerInput");
      if (input && best) {
        input.value = best;
      }
      stopListening();
      if (best && isValidAnswer(best)) {
        // auto-check when speech is clearly yes/no
        setTimeout(check, 200);
      }
    };
    recognition.onerror = function () {
      stopListening();
      var hintEl = document.getElementById("micHint");
      if (hintEl) {
        hintEl.textContent = "Couldn’t hear — try again or type.";
        hintEl.className = "mic-hint";
      }
    };
    recognition.onend = function () {
      if (listening) stopListening();
    };

    try {
      recognition.start();
    } catch (e) {
      stopListening();
    }
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    locked = false;
    loadItem();
  }

  function loadItem() {
    if (index >= order.length) {
      endGame();
      return;
    }
    locked = false;
    stopListening();
    renderPlay();
    setTimeout(function () {
      var input = document.getElementById("answerInput");
      if (input) input.focus();
    }, 80);
  }

  function updateHud() {
    var q = document.getElementById("qPill");
    var s = document.getElementById("scorePill");
    if (q) q.textContent = index + 1 + "/" + order.length;
    if (s) s.textContent = "SCORE " + score + "/" + order.length;
  }

  function clearAll() {
    if (locked) return;
    stopListening();
    var input = document.getElementById("answerInput");
    if (input) {
      input.value = "";
      input.className = "answer-input";
      input.focus();
    }
    var fb = document.getElementById("feedback");
    if (fb) {
      fb.textContent = "";
      fb.className = "feedback";
    }
  }

  function check() {
    if (locked) return;
    stopListening();
    var input = document.getElementById("answerInput");
    if (!input) return;
    var user = input.value;
    if (!normalize(user)) return;

    locked = true;
    var ok = isValidAnswer(user);
    var fb = document.getElementById("feedback");
    var checkBtn = document.getElementById("checkBtn");

    if (ok) {
      score++;
      sfxOk();
      updateHud();
      input.className = "answer-input ok";
      input.disabled = true;
      if (fb) {
        fb.textContent = "✓ Nice! Your answer is fine.";
        fb.className = "feedback ok";
      }
      if (checkBtn) checkBtn.disabled = true;
      setTimeout(function () {
        index++;
        loadItem();
      }, 1000);
    } else {
      sfxBad();
      input.className = "answer-input bad shake";
      if (fb) {
        fb.textContent = "Try: Yes, I do.  or  No, I don't.";
        fb.className = "feedback bad";
      }
      setTimeout(function () {
        input.classList.remove("shake");
        input.className = "answer-input";
        locked = false;
        input.focus();
      }, 900);
    }
  }

  function endGame() {
    stopListening();
    var total = order.length;
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : accuracy >= 25 ? 1 : 0;

    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>" +
      (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") +
      "</h1>" +
      '<p class="start-lead">You answered <strong>' +
      score +
      "</strong> of <strong>" +
      total +
      "</strong>.</p>" +
      '<button type="button" class="primary-btn" id="againBtn">PLAY AGAIN</button>' +
      "</div></div>";

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          accuracy: accuracy,
          stars: stars,
          timeMs: timeMs,
          save: true,
          onAgain: startGame,
          onModes: renderStart,
          backHref: "../"
        });
      } catch (e) {}
    } else if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      } catch (e) {}
    }

    document.getElementById("againBtn").onclick = startGame;
  }

  function renderStart() {
    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>About You</h1>" +
      '<p class="start-lead">Look at the picture and answer <strong>Do you…?</strong> with your real preference.<br>' +
      "Type or speak: <em>Yes, I do.</em> or <em>No, I don't.</em></p>" +
      '<button type="button" class="primary-btn" id="startBtn">START</button>' +
      "</div></div>";
    document.getElementById("startBtn").onclick = startGame;
  }

  function renderPlay() {
    var item = currentItem();
    var micHtml = speechSupported
      ? '<button type="button" class="mic-btn" id="micBtn" aria-label="Speak your answer">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/>' +
        "</svg></button>"
      : "";

    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="pill" id="qPill">' +
      (index + 1) +
      "/" +
      order.length +
      "</span>" +
      '<span class="pill score" id="scorePill">SCORE ' +
      score +
      "/" +
      order.length +
      "</span>" +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="play-body">' +
      '<p class="section-label">About you · ' +
      (index + 1) +
      "/" +
      order.length +
      "</p>" +
      '<div class="pic-card">' +
      '<img src="' +
      item.image +
      '" alt="" draggable="false">' +
      "</div>" +
      '<p class="question-big">' +
      item.question +
      "</p>" +
      '<p class="example">Answer with your preference</p>' +
      '<div class="input-row">' +
      '<input type="text" class="answer-input" id="answerInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Yes, I do.  /  No, I don\'t.">' +
      micHtml +
      "</div>" +
      (speechSupported ? '<p class="mic-hint" id="micHint">Tap the mic to speak</p>' : "") +
      '<p class="feedback" id="feedback" aria-live="polite"></p>' +
      '<div class="action-row">' +
      '<button type="button" class="ghost-btn" id="clearBtn">Clear</button>' +
      '<button type="button" class="primary-btn" id="checkBtn">Check</button>' +
      "</div>" +
      "</div></div>";

    document.getElementById("clearBtn").onclick = clearAll;
    document.getElementById("checkBtn").onclick = check;
    var input = document.getElementById("answerInput");
    input.onkeydown = function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    };
    var micBtn = document.getElementById("micBtn");
    if (micBtn) micBtn.onclick = startListening;
  }

  renderStart();
})();
