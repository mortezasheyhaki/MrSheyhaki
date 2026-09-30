/* Communication Time – AEF Starter Unit 9B (polished) */
(function () {
  "use strict";

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
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, 0.15, "sine", 0.1, i * 0.07);
      });
    }
    window.__laUiSfx = {
      tap: sfxTap,
      correct: sfxCorrect,
      wrong: sfxWrong,
      celebrate: sfxCelebrate
    };
    window.sfxTap = sfxTap;
    window.sfxCorrect = sfxCorrect;
    window.sfxWrong = sfxWrong;
    window.sfxCelebrate = sfxCelebrate;
  })();

  var GAME_ID = "starter-9b-communication-time";
  var ASKING_IMAGE = "https://cdn.imgurl.ir/uploads/a276511_asking2.png";
  var APPRECIATION_IMAGE = "https://cdn.imgurl.ir/uploads/h86617_appreciating.png";

  var QUESTIONS = [
    "What are you wearing today?",
    "What colors do you like wearing?",
    "What clothes do you usually wear in the summer?",
    "What clothes do you usually wear in the winter?",
    "What clothes do you usually wear to work?",
    "What clothes do you usually wear to school?",
    "What clothes do you usually wear for a party?"
  ];

  var REACTIONS = [
    "Nice! Thanks for sharing.",
    "Great answer!",
    "That sounds good!",
    "Thanks — interesting!",
    "Cool, thanks!",
    "I like that answer!",
    "Well said!"
  ];

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  var startScreen = document.getElementById("startScreen");
  var questionScreen = document.getElementById("questionScreen");
  var responseScreen = document.getElementById("responseScreen");
  var appreciationScreen = document.getElementById("appreciationScreen");
  var finishScreen = document.getElementById("finishScreen");
  var startButton = document.getElementById("startButton");
  var againButton = document.getElementById("againButton");
  var nextButton = document.getElementById("nextButton");
  var characterImage = document.getElementById("characterImage");
  var questionText = document.getElementById("questionText");
  var questionNumber = document.getElementById("questionNumber");
  var progress = document.getElementById("progress");
  var progressFill = document.getElementById("progressFill");
  var answerInput = document.getElementById("answerInput");
  var micButton = document.getElementById("micButton");
  var micLabel = document.getElementById("micLabel");
  var voiceStatus = document.getElementById("voiceStatus");
  var charCount = document.getElementById("charCount");
  var submitButton = document.getElementById("submitButton");
  var inputRow = document.getElementById("inputRow");
  var answerEcho = document.getElementById("answerEcho");
  var responseTitle = document.getElementById("responseTitle");
  var responseText = document.getElementById("responseText");

  var index = 0;
  var recognition = null;
  var listening = false;
  var submitted = false;
  var responseTimer = null;
  var answers = [];

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx.play === "function") LASfx.play(name);
      else if (name === "correct" && window.sfxCorrect) sfxCorrect();
      else if (name === "wrong" && window.sfxWrong) sfxWrong();
      else if (name === "click" && window.sfxTap) sfxTap();
    } catch (_) {}
  }

  function stopRecognition() {
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    listening = false;
    if (micButton) {
      micButton.classList.remove("is-listening");
      micButton.setAttribute("aria-pressed", "false");
    }
    if (micLabel) micLabel.textContent = "Speak";
  }

  function setupRecognition() {
    if (!SpeechRecognition) {
      if (micButton) micButton.disabled = true;
      if (voiceStatus) {
        voiceStatus.textContent =
          "Voice recognition is not supported here. You can still type your answer.";
      }
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = function () {
      listening = true;
      micButton.classList.add("is-listening");
      micButton.setAttribute("aria-pressed", "true");
      micLabel.textContent = "Listening";
      voiceStatus.textContent = "Listening… speak your answer now.";
      voiceStatus.classList.remove("is-error");
    };

    recognition.onresult = function (event) {
      var transcript = "";
      try {
        transcript = event.results[0][0].transcript || "";
      } catch (_) {}
      if (transcript) {
        answerInput.value = transcript.trim();
        updateCharCount();
        voiceStatus.textContent = "I heard: “" + transcript.trim() + "”";
        voiceStatus.classList.remove("is-error");
      }
    };

    recognition.onerror = function (event) {
      stopRecognition();
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        voiceStatus.textContent =
          "Microphone access was blocked. You can type your answer instead.";
      } else if (event.error === "no-speech") {
        voiceStatus.textContent =
          "I didn't hear you. Press the microphone and try again.";
      } else {
        voiceStatus.textContent =
          "Voice recognition stopped. You can try again or type your answer.";
      }
      voiceStatus.classList.add("is-error");
    };

    recognition.onend = function () {
      listening = false;
      micButton.classList.remove("is-listening");
      micButton.setAttribute("aria-pressed", "false");
      micLabel.textContent = "Speak";
    };
  }

  function startListening() {
    if (submitted || !SpeechRecognition) return;
    if (!recognition) setupRecognition();
    if (!recognition) return;
    if (listening) {
      stopRecognition();
      return;
    }
    try {
      recognition.start();
    } catch (_) {
      stopRecognition();
    }
  }

  function showOnly(section) {
    [startScreen, questionScreen, responseScreen, appreciationScreen, finishScreen].forEach(
      function (el) {
        if (el) el.classList.add("hidden");
      }
    );
    if (section) {
      section.classList.remove("hidden");
      // restart enter animation on cards inside
      var card = section.querySelector(".cg-enter");
      if (card) {
        card.classList.remove("cg-enter");
        void card.offsetWidth;
        card.classList.add("cg-enter");
      }
    }
  }

  function updateCharCount() {
    if (!charCount || !answerInput) return;
    var n = String(answerInput.value || "").length;
    charCount.textContent = n + " / 200";
    charCount.classList.toggle("is-near-limit", n >= 180);
  }

  function startsWithI(text) {
    // Must answer about yourself: I / I'm / I've / I'd / I'll ...
    return /^i(?:\s|'m|'ve|'d|'ll|’m|’ve|’d|’ll)\b/i.test(String(text || "").trim());
  }

  function isValidAnswer(text) {
    var t = String(text || "").trim();
    if (t.length < 3) return false;
    if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t)) return false;

    // Questions are about YOU → answer must start with I / I'm / I've ...
    if (!startsWithI(t)) return false;

    var compact = t.replace(/\s+/g, "");
    if (compact.length < 3) return false;

    // same char repeated
    if (/^(.)\1{3,}$/i.test(compact)) return false;

    var lower = compact.toLowerCase();
    var unique = {};
    for (var i = 0; i < lower.length; i++) unique[lower[i]] = true;
    var uniqueCount = Object.keys(unique).length;
    if (lower.length >= 6 && uniqueCount <= 3) return false;
    if (lower.length >= 10 && uniqueCount <= 5) return false;

    // alternating short patterns: asd asd asd, qweqwe
    if (/^(.{1,3})\1{2,}$/i.test(lower)) return false;

    var letters = (t.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length;
    if (letters / t.replace(/\s/g, "").length < 0.5) return false;

    return true;
  }

  function shakeInput() {
    if (!inputRow) return;
    inputRow.classList.remove("cg-shake");
    void inputRow.offsetWidth;
    inputRow.classList.add("cg-shake");
    window.setTimeout(function () {
      inputRow.classList.remove("cg-shake");
    }, 500);
  }

  function renderQuestion() {
    stopRecognition();
    submitted = false;
    answerInput.value = "";
    answerInput.disabled = false;
    submitButton.disabled = false;
    micButton.disabled = !SpeechRecognition;
    characterImage.src = ASKING_IMAGE;
    characterImage.alt = "Character asking a question";
    questionText.textContent = QUESTIONS[index];
    questionNumber.textContent = "Question " + (index + 1);
    progress.textContent = index + 1 + " / " + QUESTIONS.length;
    if (progressFill) {
      progressFill.style.width =
        ((index + 1) / QUESTIONS.length) * 100 + "%";
    }
    voiceStatus.textContent = "Start with I… Type or use the microphone.";
    voiceStatus.classList.remove("is-error");
    updateCharCount();
    showOnly(questionScreen);
    window.setTimeout(function () {
      try {
        answerInput.focus({ preventScroll: true });
      } catch (_) {
        answerInput.focus();
      }
    }, 80);
  }

  function submitAnswer() {
    if (submitted) return;
    var answer = String(answerInput.value || "").trim();

    if (!answer) {
      voiceStatus.textContent =
        "Please write an answer or use the microphone first.";
      voiceStatus.classList.add("is-error");
      answerInput.focus();
      shakeInput();
      sfx("wrong");
      return;
    }

    if (!startsWithI(answer)) {
      voiceStatus.textContent =
        "Start your answer with I… (example: I am wearing a T-shirt.)";
      voiceStatus.classList.add("is-error");
      answerInput.focus();
      shakeInput();
      sfx("wrong");
      return;
    }
    if (!isValidAnswer(answer)) {
      voiceStatus.textContent =
        "Please write a real answer in English (not random letters).";
      voiceStatus.classList.add("is-error");
      answerInput.focus();
      answerInput.select();
      shakeInput();
      sfx("wrong");
      return;
    }

    submitted = true;
    stopRecognition();
    answerInput.disabled = true;
    submitButton.disabled = true;
    micButton.disabled = true;
    sfx("correct");

    answers.push(answer);

    var isLast = index >= QUESTIONS.length - 1;
    if (responseTitle) {
      responseTitle.textContent = isLast ? "All done!" : REACTIONS[index % REACTIONS.length];
    }
    if (responseText) {
      responseText.textContent = isLast
        ? "That was the last question."
        : "Press Next to continue.";
    }
    if (answerEcho) {
      answerEcho.hidden = false;
      answerEcho.innerHTML =
        '<span class="cg-echo-label">You said</span><span class="cg-echo-text"></span>';
      answerEcho.querySelector(".cg-echo-text").textContent = answer;
    }
    if (nextButton) {
      nextButton.textContent = isLast ? "Finish" : "Next question";
    }

    showOnly(responseScreen);
  }

  function goNext() {
    if (responseTimer) {
      window.clearTimeout(responseTimer);
      responseTimer = null;
    }
    index += 1;
    if (index >= QUESTIONS.length) showAppreciation();
    else renderQuestion();
  }

  function showAppreciation() {
    stopRecognition();
    var img = appreciationScreen.querySelector("img");
    if (img) {
      img.src = APPRECIATION_IMAGE;
      img.alt = "Character appreciating the player";
    }
    showOnly(appreciationScreen);
    sfx("correct");
    try {
      if (window.sfxCelebrate) sfxCelebrate();
    } catch (_) {}
    responseTimer = window.setTimeout(finishGame, 1600);
  }

  function finishGame() {
    showOnly(finishScreen);
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, 100);
      }
    } catch (_) {}
    try {
      if (window.LAFinish) {
        LAFinish.show({
          gameId: GAME_ID,
          score: QUESTIONS.length,
          total: QUESTIONS.length,
          stars: 3,
          timeMs: 0,
          onAgain: startGame,
          onModes: function () {
            location.href = "../";
          },
          backHref: "../",
          save: false
        });
      }
    } catch (_) {}
  }

  function startGame() {
    if (responseTimer) {
      window.clearTimeout(responseTimer);
      responseTimer = null;
    }
    index = 0;
    answers = [];
    submitted = false;
    stopRecognition();
    try {
      if (window.LAFinish) LAFinish.startTimer();
    } catch (_) {}
    setupRecognition();
    renderQuestion();
    sfx("click");
  }

  // Events
  if (startButton) startButton.addEventListener("click", startGame);
  if (againButton) againButton.addEventListener("click", startGame);
  if (micButton) micButton.addEventListener("click", startListening);
  if (submitButton) submitButton.addEventListener("click", submitAnswer);
  if (nextButton) nextButton.addEventListener("click", goNext);

  if (answerInput) {
    answerInput.addEventListener("input", updateCharCount);
    answerInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitAnswer();
      }
    });
  }

  setupRecognition();
})();
