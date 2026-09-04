/**
 * How much / How many — board spin → choose much/many → write full answer
 */
(function () {
  "use strict";

  var ROUNDS = 8;
  var GAME_ID = "grammar-how-much-how-many";
  var SPEAKING_ID = "speaking-how-much-how-many";

  /** Board prompts from AEF-style communicative activity */
  var CARDS = [
    { blank: "How ______ exercise do you do a week?", key: "much", noun: "exercise", example: "I do about three hours of exercise a week." },
    { blank: "How ______ time do you spend online in a day?", key: "much", noun: "time", example: "I spend about two hours online every day." },
    { blank: "How ______ pairs of shoes do you have?", key: "many", noun: "pairs of shoes", example: "I have five pairs of shoes." },
    { blank: "How ______ water do you drink in a day?", key: "much", noun: "water", example: "I drink about one and a half litres of water a day." },
    { blank: "How ______ money did you spend on clothes last month?", key: "much", noun: "money", example: "I spent about fifty dollars on clothes last month." },
    { blank: "How ______ books did you read last month?", key: "many", noun: "books", example: "I read two books last month." },
    { blank: "How ______ countries did you visit last year?", key: "many", noun: "countries", example: "I visited one country last year." },
    { blank: "How ______ free time do you have during the week?", key: "much", noun: "free time", example: "I don't have much free time during the week." },
    { blank: "How ______ tea or coffee did you drink yesterday?", key: "much", noun: "tea or coffee", example: "I drank two cups of coffee yesterday." },
    { blank: "How ______ pictures do you have on your bedroom wall?", key: "many", noun: "pictures", example: "I have three pictures on my bedroom wall." },
    { blank: "How ______ times do you eat out in a week?", key: "many", noun: "times", example: "I eat out once or twice a week." },
    { blank: "How ______ emails do you get a day?", key: "many", noun: "emails", example: "I get about ten emails a day." },
    { blank: "How ______ games do you have on your phone and computer?", key: "many", noun: "games", example: "I have about twelve games on my phone and computer." },
    { blank: "How ______ time did you spend doing English homework last week?", key: "much", noun: "time", example: "I spent about four hours on English homework last week." },
    { blank: "How ______ photos do you have on your phone?", key: "many", noun: "photos", example: "I have hundreds of photos on my phone." },
    { blank: "How ______ people in your family speak English?", key: "many", noun: "people", example: "Three people in my family speak English." },
    { blank: "How ______ fruit do you eat in a day?", key: "much", noun: "fruit", example: "I eat one or two pieces of fruit a day." },
    { blank: "How ______ meat do you eat in a week?", key: "much", noun: "meat", example: "I don't eat much meat in a week." },
    { blank: "How ______ text messages did you send yesterday?", key: "many", noun: "text messages", example: "I sent about twenty text messages yesterday." },
    { blank: "How ______ friends do you have on Facebook?", key: "many", noun: "friends", example: "I have about eighty friends on Facebook." }
  ];

  var state = {
    mode: "grammar",
    round: 0,
    score: 0,
    correctChoices: 0,
    answered: 0,
    spokenOk: 0,
    used: [],
    card: null,
    choiceOk: false,
    spinning: false,
    saidIt: false,
    listening: false,
    lastTranscript: ""
  };

  var recognition = null;

  var $ = function (id) { return document.getElementById(id); };

  function initSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      recognition = null;
      return false;
    }
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = function () {
      state.listening = true;
      var btn = $("btnMic");
      if (btn) btn.classList.add("is-listening");
      if ($("micLabel")) $("micLabel").textContent = "Listening…";
      if ($("speakStatus")) $("speakStatus").textContent = "Listening — say a full sentence answer.";
    };

    recognition.onresult = function (event) {
      var transcript = "";
      var final = false;
      for (var i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) final = true;
      }
      transcript = (transcript || "").trim();
      if (!transcript) return;

      state.lastTranscript = transcript;
      if ($("transcriptText")) $("transcriptText").textContent = transcript;
      show($("transcriptBox"), true);

      if (final) {
        applySpokenAnswer(transcript);
      }
    };

    recognition.onerror = function (e) {
      state.listening = false;
      var btn = $("btnMic");
      if (btn) btn.classList.remove("is-listening");
      if ($("micLabel")) $("micLabel").textContent = "Tap to speak";
      var msg = "Could not hear you. Tap the mic and try again.";
      if (e && e.error === "not-allowed") {
        msg = "Microphone blocked. Allow mic access in the browser, then try again.";
      } else if (e && e.error === "no-speech") {
        msg = "No speech detected. Tap the mic and speak clearly.";
      }
      if ($("speakStatus")) $("speakStatus").textContent = msg;
    };

    recognition.onend = function () {
      state.listening = false;
      var btn = $("btnMic");
      if (btn) btn.classList.remove("is-listening");
      if ($("micLabel")) $("micLabel").textContent = state.saidIt ? "Say again" : "Tap to speak";
      if (!state.saidIt && $("speakStatus") && ($("speakStatus").textContent || "").indexOf("Listening") === 0) {
        $("speakStatus").textContent = "Tap the mic and say your full answer.";
      }
    };

    return true;
  }

  function applySpokenAnswer(transcript) {
    if (!looksLikeFullAnswer(transcript)) {
      state.saidIt = false;
      if ($("speakStatus")) {
        $("speakStatus").textContent =
          "That was too short. Say a full sentence (e.g. “I drink two litres of water a day”).";
      }
      return;
    }
    state.saidIt = true;
    state.lastTranscript = transcript;
    if ($("answerInput")) {
      $("answerInput").value = transcript;
      $("answerInput").readOnly = false;
    }
    if ($("speakStatus")) {
      $("speakStatus").textContent = "Heard! You can edit the text, then press Check answer.";
    }
    if ($("micLabel")) $("micLabel").textContent = "Say again";
    var btn = $("btnMic");
    if (btn) btn.classList.add("is-done");
  }

  function startListening() {
    if (state.mode !== "speaking") return;
    if (!recognition) {
      if ($("speakStatus")) {
        $("speakStatus").textContent =
          "Speech recognition is not supported in this browser. Try Chrome on Android/desktop.";
      }
      return;
    }
    if (state.listening) {
      try { recognition.stop(); } catch (e) {}
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      if ($("speakStatus")) $("speakStatus").textContent = "Mic busy — wait a moment and tap again.";
    }
  }

  function isSpeakingMode() {
    try {
      return /(?:\?|&)mode=speaking\b/i.test(location.search) ||
        /speaking/i.test(document.body.getAttribute("data-mode") || "");
    } catch (e) {
      return false;
    }
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function pickCard() {
    if (state.used.length >= CARDS.length) state.used = [];
    var pool = CARDS.map(function (c, i) { return i; }).filter(function (i) {
      return state.used.indexOf(i) === -1;
    });
    var idx = pool[Math.floor(Math.random() * pool.length)];
    state.used.push(idx);
    return CARDS[idx];
  }

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
  }

  function setStarsDisplay(el, n) {
    if (!el) return;
    var s = "";
    for (var i = 1; i <= 3; i++) s += i <= n ? "★" : "☆";
    el.textContent = s;
  }

  function starsFromAccuracy(acc) {
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 45) return 1;
    return 0;
  }

  function updateHud() {
    $("roundNum").textContent = String(Math.min(state.round + 1, ROUNDS));
    $("roundMax").textContent = String(ROUNDS);
    $("scoreNum").textContent = String(state.score);
    var acc = state.answered ? Math.round((state.correctChoices / state.answered) * 100) : 0;
    setStarsDisplay($("liveStars"), starsFromAccuracy(acc));
  }

  function filledQuestion(card, key) {
    return card.blank.replace("______", key);
  }

  function startGame() {
    state.round = 0;
    state.score = 0;
    state.correctChoices = 0;
    state.answered = 0;
    state.spokenOk = 0;
    state.used = [];
    state.card = null;
    state.choiceOk = false;
    state.saidIt = false;
    state.lastTranscript = "";
    state.listening = false;
    try { if (recognition) recognition.stop(); } catch (e) {}
    show($("screenStart"), false);
    show($("screenResult"), false);
    show($("screenPlay"), true);
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
    $("promptText").textContent = "Tap SPIN to get a question.";
    $("promptCard").querySelector(".hmm-card-label").textContent = "Ready";
    $("btnSpin").disabled = false;
    updateHud();
  }

  function spin() {
    if (state.spinning) return;
    if (state.round >= ROUNDS) {
      endGame();
      return;
    }
    state.spinning = true;
    state.choiceOk = false;
    state.saidIt = false;
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
    show($("choiceFeedback"), false);
    show($("answerFeedback"), false);
    show($("modelAnswer"), false);
    $("btnSpin").disabled = true;

    var ring = $("spinnerRing");
    ring.classList.add("is-spinning");
    $("promptCard").querySelector(".hmm-card-label").textContent = "Selecting…";

    var ticks = 0;
    var maxTicks = 12 + Math.floor(Math.random() * 6);
    var timer = setInterval(function () {
      var preview = CARDS[Math.floor(Math.random() * CARDS.length)];
      $("promptText").textContent = preview.blank;
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(timer);
        ring.classList.remove("is-spinning");
        state.card = pickCard();
        $("promptText").textContent = state.card.blank;
        $("promptCard").querySelector(".hmm-card-label").textContent = "Your card";
        state.spinning = false;
        openChoice();
      }
    }, 90);
  }

  function openChoice() {
    show($("stepChoice"), true);
    $("questionLine").textContent = state.card.blank;
    var btns = document.querySelectorAll(".hmm-choice-btn");
    btns.forEach(function (b) {
      b.classList.remove("is-correct", "is-wrong", "is-selected");
      b.disabled = false;
    });
    show($("choiceFeedback"), false);
  }

  function onChoice(key) {
    if (!state.card || state.choiceOk) return;
    var btns = document.querySelectorAll(".hmm-choice-btn");
    btns.forEach(function (b) {
      b.disabled = true;
      b.classList.toggle("is-selected", b.getAttribute("data-choice") === key);
    });

    var ok = key === state.card.key;
    state.answered++;
    if (ok) {
      state.correctChoices++;
      state.score += 10;
      state.choiceOk = true;
      $("choiceFeedback").textContent = "Correct — How " + key + ".";
      $("choiceFeedback").className = "hmm-feedback is-ok";
      btns.forEach(function (b) {
        if (b.getAttribute("data-choice") === key) b.classList.add("is-correct");
      });
      openAnswer(key);
    } else {
      $("choiceFeedback").textContent =
        "Not quite. “" + state.card.noun + "” needs How " + state.card.key + ".";
      $("choiceFeedback").className = "hmm-feedback is-bad";
      btns.forEach(function (b) {
        if (b.getAttribute("data-choice") === key) b.classList.add("is-wrong");
        if (b.getAttribute("data-choice") === state.card.key) b.classList.add("is-correct");
      });
      // Still continue with correct form so they can write a full answer
      state.choiceOk = true;
      openAnswer(state.card.key);
    }
    show($("choiceFeedback"), true);
    updateHud();
  }

  function openAnswer(key) {
    show($("stepAnswer"), true);
    $("fullQuestion").textContent = filledQuestion(state.card, key);
    $("answerInput").value = "";
    $("btnSubmit").disabled = false;
    $("btnSubmit").hidden = false;
    $("btnSkip").hidden = true;
    show($("answerFeedback"), false);
    show($("modelAnswer"), false);
    show($("transcriptBox"), false);
    state.saidIt = false;
    state.lastTranscript = "";
    state.listening = false;

    if (state.mode === "speaking") {
      if ($("answerStepTitle")) $("answerStepTitle").textContent = "2. Say a full answer";
      if ($("answerHint")) {
        $("answerHint").textContent =
          "Use the microphone. You must speak a complete sentence — not only “a lot” or “a few”.";
      }
      show($("speakBox"), true);
      $("answerInput").readOnly = true;
      $("answerInput").placeholder = "Your spoken answer will appear here…";
      var mic = $("btnMic");
      if (mic) {
        mic.classList.remove("is-listening", "is-done");
      }
      if ($("micLabel")) $("micLabel").textContent = "Tap to speak";
      if ($("speakStatus")) {
        if (recognition) {
          $("speakStatus").textContent = "Tap the mic and say your full answer.";
        } else {
          $("speakStatus").textContent =
            "Speech recognition not supported here. Use Chrome, then allow the microphone.";
        }
      }
      if ($("btnSubmit")) $("btnSubmit").textContent = "Check spoken answer";
    } else {
      if ($("answerStepTitle")) $("answerStepTitle").textContent = "2. Write a full answer";
      if ($("answerHint")) {
        $("answerHint").textContent =
          "Use a complete sentence (not only “a lot” or “a few”).";
      }
      show($("speakBox"), false);
      $("answerInput").readOnly = false;
      $("answerInput").placeholder = "e.g. I drink about two litres of water a day.";
      if ($("btnSubmit")) $("btnSubmit").textContent = "Check answer";
      $("answerInput").focus();
    }
  }

  function looksLikeFullAnswer(text) {
    var t = (text || "").trim();
    if (t.length < 12) return false;
    var words = t.split(/\s+/).filter(Boolean);
    if (words.length < 4) return false;
    return true;
  }

  function submitAnswer() {
    var text = ($("answerInput").value || "").trim();

    if (state.mode === "speaking") {
      if (!state.saidIt || !state.lastTranscript) {
        $("answerFeedback").textContent =
          "You must speak your answer with the microphone first.";
        $("answerFeedback").className = "hmm-feedback is-bad";
        show($("answerFeedback"), true);
        return;
      }
      if (!looksLikeFullAnswer(state.lastTranscript) && !looksLikeFullAnswer(text)) {
        $("answerFeedback").textContent =
          "Say a longer full sentence, then check again.";
        $("answerFeedback").className = "hmm-feedback is-bad";
        show($("answerFeedback"), true);
        return;
      }
      state.spokenOk++;
      state.score += 8;
      $("answerFeedback").textContent = "Great speaking — full answer accepted.";
    } else {
      if (!looksLikeFullAnswer(text)) {
        $("answerFeedback").textContent =
          "Write a full sentence (at least a few words), not only a short phrase.";
        $("answerFeedback").className = "hmm-feedback is-bad";
        show($("answerFeedback"), true);
        return;
      }
      state.score += 5;
      $("answerFeedback").textContent = "Nice — full answer saved.";
    }

    $("answerFeedback").className = "hmm-feedback is-ok";
    show($("answerFeedback"), true);

    $("modelText").textContent = state.card.example;
    show($("modelAnswer"), true);

    $("btnSubmit").hidden = true;
    $("btnSkip").hidden = false;
    $("btnSkip").textContent = state.round + 1 >= ROUNDS ? "See results" : "Next card";
    updateHud();
  }

  function nextRound() {
    state.round++;
    if (state.round >= ROUNDS) {
      endGame();
      return;
    }
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
    $("promptText").textContent = "Tap SPIN for the next question.";
    $("promptCard").querySelector(".hmm-card-label").textContent = "Ready";
    $("btnSpin").disabled = false;
    updateHud();
  }

  function endGame() {
    show($("screenPlay"), false);
    show($("screenResult"), true);
    var acc = state.answered ? Math.round((state.correctChoices / state.answered) * 100) : 0;
    var stars = starsFromAccuracy(acc);
    setStarsDisplay($("resultStars"), stars);
    $("resultTitle").textContent = stars >= 2 ? "Great work!" : "Good practice!";
    var summary =
      "You scored " + state.score + " points. How much / How many accuracy: " +
      acc + "% (" + state.correctChoices + "/" + state.answered + ").";
    if (state.mode === "speaking") {
      summary +=
        " Spoken answers accepted: " + state.spokenOk + "/" + ROUNDS + ".";
    }
    $("resultSummary").textContent = summary;

    try {
      if (window.LAStars) {
        if (state.mode === "speaking") {
          var speakAcc = Math.round(
            ((state.correctChoices + state.spokenOk) / Math.max(1, state.answered + ROUNDS)) * 100
          );
          // Weight: grammar choice accuracy + completed spoken rounds
          speakAcc = Math.round(
            (acc * 0.5) + (Math.round((state.spokenOk / ROUNDS) * 100) * 0.5)
          );
          LAStars.recordPlay(SPEAKING_ID);
          LAStars.saveFromAccuracy(SPEAKING_ID, speakAcc);
        } else {
          LAStars.recordPlay(GAME_ID);
          LAStars.saveFromAccuracy(GAME_ID, acc);
        }
      }
    } catch (e) {}
  }

  function bind() {
    state.mode = isSpeakingMode() ? "speaking" : "grammar";
    initSpeech();

    if (state.mode === "speaking") {
      document.body.setAttribute("data-mode", "speaking");
      var kicker = document.querySelector("#screenStart .hmm-kicker");
      if (kicker) kicker.textContent = "SPEAKING · A1–A2";
      var lead = document.querySelector("#screenStart .hmm-lead");
      if (lead) {
        lead.innerHTML =
          "Spin a board card, choose <strong>much</strong> or <strong>many</strong>, " +
          "then <strong>speak</strong> a full-sentence answer with your microphone.";
      }
      var tips = document.querySelector("#screenStart .hmm-tips");
      if (tips) {
        tips.innerHTML =
          "<li><strong>How many</strong> → countable (books, friends, emails)</li>" +
          "<li><strong>How much</strong> → uncountable (water, money, time)</li>" +
          "<li><strong>Speaking</strong> → you must use the mic (typing alone does not count)</li>";
      }
      var back = document.querySelector(".hmm-screen a.hmm-btn--ghost[href='../']");
      if (back) {
        back.href = "../../speaking/";
        back.textContent = "Back to Speaking";
      }
    }

    $("btnStart").addEventListener("click", startGame);
    $("btnSpin").addEventListener("click", spin);
    $("btnSubmit").addEventListener("click", submitAnswer);
    $("btnSkip").addEventListener("click", nextRound);
    $("btnAgain").addEventListener("click", startGame);

    document.querySelectorAll(".hmm-choice-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onChoice(btn.getAttribute("data-choice"));
      });
    });

    var mic = $("btnMic");
    if (mic) {
      mic.addEventListener("click", startListening);
    }

    var themeBtn = $("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var html = document.documentElement;
        var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        themeBtn.textContent = next === "dark" ? "☀" : "☾";
        try { localStorage.setItem("la-theme", next); } catch (e) {}
      });
      try {
        var saved = localStorage.getItem("la-theme");
        if (saved === "dark" || saved === "light") {
          document.documentElement.setAttribute("data-theme", saved);
          themeBtn.textContent = saved === "dark" ? "☀" : "☾";
        }
      } catch (e) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
