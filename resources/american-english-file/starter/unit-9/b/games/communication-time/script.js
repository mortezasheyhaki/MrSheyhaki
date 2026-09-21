/* Communication Time – AEF Starter Unit 9B */
(function () {
  "use strict";

  var GAME_ID = "starter-9b-communication-time";
  var GREETING_IMAGE = "https://cdn.imgurl.ir/uploads/q964618_greeting.png";
  var ASKING_IMAGE = "https://cdn.imgurl.ir/uploads/a276511_asking2.png";
  var WRITING_IMAGE = "https://cdn.imgurl.ir/uploads/p646589_writing.png";
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

  // The player is free to choose the content of the answer, but the response
  // must look like a meaningful sentence rather than random/gibberish text.
  // Each question has a small set of natural sentence starters that are accepted.
  var ANSWER_STARTERS = [
    ["i'm wearing", "i am wearing", "today i'm wearing", "today i am wearing"],
    ["i like wearing", "i like to wear", "i love wearing", "i love to wear"],
    ["i usually wear", "i wear", "in summer i wear", "in the summer i wear"],
    ["i usually wear", "i wear", "in winter i wear", "in the winter i wear"],
    ["i usually wear", "i wear", "for work i wear", "to work i wear"],
    ["i usually wear", "i wear", "for school i wear", "to school i wear"],
    ["i usually wear", "i wear", "for a party i wear", "to a party i wear"]
  ];

  function normalizeAnswer(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9'\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function validateAnswer(text) {
    var answer = normalizeAnswer(text);
    if (!answer) return { ok: false, message: "Please give an answer first." };

    var starters = ANSWER_STARTERS[index] || [];
    var matchesStarter = starters.some(function (starter) {
      return answer === starter || answer.indexOf(starter + " ") === 0;
    });

    if (!matchesStarter) {
      return {
        ok: false,
        message: "Start your answer with a sentence starter such as “" + starters[0] + " …”"
      };
    }

    // Reject a starter followed only by another tiny fragment such as a single
    // random letter. A complete starter by itself is still accepted.
    var words = answer.split(" ").filter(Boolean);
    var starterLength = 0;
    for (var i = 0; i < starters.length; i += 1) {
      if (answer === starters[i] || answer.indexOf(starters[i] + " ") === 0) {
        starterLength = starters[i].split(" ").length;
        break;
      }
    }
    if (words.length > starterLength) {
      var addedWords = words.slice(starterLength).filter(function (word) {
        return /[a-z]{2,}/.test(word);
      });
      if (!addedWords.length) {
        return { ok: false, message: "Please add some clothes, colors, or other information to your answer." };
      }
    }

    return { ok: true };
  }

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var startScreen = document.getElementById("startScreen");
  var questionScreen = document.getElementById("questionScreen");
  var responseScreen = document.getElementById("responseScreen");
  var appreciationScreen = document.getElementById("appreciationScreen");
  var finishScreen = document.getElementById("finishScreen");
  var startButton = document.getElementById("startButton");
  var againButton = document.getElementById("againButton");
  var characterImage = document.getElementById("characterImage");
  var questionText = document.getElementById("questionText");
  var questionNumber = document.getElementById("questionNumber");
  var progress = document.getElementById("progress");
  var answerInput = document.getElementById("answerInput");
  var micButton = document.getElementById("micButton");
  var micLabel = document.getElementById("micLabel");
  var voiceStatus = document.getElementById("voiceStatus");
  var submitButton = document.getElementById("submitButton");

  var index = 0;
  var recognition = null;
  var listening = false;
  var submitted = false;
  var responseTimer = null;

  function sfx(name) {
    try { if (window.LASfx && typeof LASfx.play === "function") LASfx.play(name); } catch (_) {}
  }

  function stopRecognition() {
    if (recognition) { try { recognition.stop(); } catch (_) {} }
    listening = false;
    micButton.classList.remove("is-listening");
    micButton.setAttribute("aria-pressed", "false");
    micLabel.textContent = "Speak";
  }

  function setupRecognition() {
    if (!SpeechRecognition) {
      micButton.disabled = true;
      voiceStatus.textContent = "Voice recognition is not supported here. You can still type your answer.";
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      listening = true;
      micButton.classList.add("is-listening");
      micButton.setAttribute("aria-pressed", "true");
      micLabel.textContent = "Listening";
      voiceStatus.textContent = "Listening… speak your answer now.";
      sfx("click");
    };

    recognition.onresult = function (event) {
      var transcript = "";
      for (var i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      transcript = transcript.trim();
      if (transcript) answerInput.value = transcript;
      var finalResult = event.results[event.results.length - 1];
      if (finalResult && finalResult.isFinal) {
        voiceStatus.textContent = "I heard: “" + transcript + "”";
        stopRecognition();
        window.setTimeout(function () { submitAnswer(); }, 350);
      }
    };

    recognition.onerror = function (event) {
      stopRecognition();
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        voiceStatus.textContent = "Microphone access was blocked. You can type your answer instead.";
      } else if (event.error === "no-speech") {
        voiceStatus.textContent = "I didn't hear you. Press the microphone and try again.";
      } else {
        voiceStatus.textContent = "Voice recognition stopped. You can try again or type your answer.";
      }
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
    if (listening) { stopRecognition(); return; }
    try { recognition.start(); } catch (_) { stopRecognition(); }
  }

  function showOnly(section) {
    [startScreen, questionScreen, responseScreen, appreciationScreen, finishScreen].forEach(function (el) {
      el.classList.add("hidden");
    });
    section.classList.remove("hidden");
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
    progress.textContent = (index + 1) + " / " + QUESTIONS.length;
    voiceStatus.textContent = "Type your answer, or press the microphone.";
    showOnly(questionScreen);
    window.setTimeout(function () { answerInput.focus({ preventScroll: true }); }, 80);
  }

  function submitAnswer() {
    if (submitted) return;
    var answer = String(answerInput.value || "").trim();
    var validation = validateAnswer(answer);
    if (!validation.ok) {
      voiceStatus.textContent = validation.message;
      answerInput.focus();
      sfx("wrong");
      return;
    }

    submitted = true;
    stopRecognition();
    answerInput.disabled = true;
    submitButton.disabled = true;
    micButton.disabled = true;
    sfx("correct");

    document.getElementById("responseText").textContent = index === QUESTIONS.length - 1
      ? "Thank you! That's all my questions."
      : "Thanks for sharing! Let's go to the next question.";

    showOnly(responseScreen);
    responseTimer = window.setTimeout(function () {
      index += 1;
      if (index >= QUESTIONS.length) showAppreciation();
      else renderQuestion();
    }, 1250);
  }

  function showAppreciation() {
    stopRecognition();
    characterImage = characterImage || null;
    var img = appreciationScreen.querySelector("img");
    if (img) { img.src = APPRECIATION_IMAGE; img.alt = "Character appreciating the player"; }
    showOnly(appreciationScreen);
    sfx("correct");
    window.setTimeout(finishGame, 1700);
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
          onModes: function () { location.href = "../"; },
          backHref: "../",
          save: false
        });
      }
    } catch (_) {}
  }

  function startGame() {
    if (responseTimer) window.clearTimeout(responseTimer);
    index = 0;
    submitted = false;
    stopRecognition();
    try { if (window.LAFinish) LAFinish.startTimer(); } catch (_) {}
    setupRecognition();
    renderQuestion();
    sfx("click");
  }

  startButton.addEventListener("click", startGame);
  againButton.addEventListener("click", startGame);
  micButton.addEventListener("click", startListening);
  submitButton.addEventListener("click", submitAnswer);
  answerInput.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submitAnswer();
  });
  setupRecognition();
})();
