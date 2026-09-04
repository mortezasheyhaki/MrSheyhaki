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
    { short: "Exercise", blank: "How ______ exercise do you do a week?", key: "much", noun: "exercise", example: "I do about three hours of exercise a week." },
    { short: "Online", blank: "How ______ time do you spend online in a day?", key: "much", noun: "time", example: "I spend about two hours online every day." },
    { short: "Shoes", blank: "How ______ pairs of shoes do you have?", key: "many", noun: "pairs of shoes", example: "I have five pairs of shoes." },
    { short: "Water", blank: "How ______ water do you drink in a day?", key: "much", noun: "water", example: "I drink about one and a half litres of water a day." },
    { short: "Money", blank: "How ______ money did you spend on clothes last month?", key: "much", noun: "money", example: "I spent about fifty dollars on clothes last month." },
    { short: "Books", blank: "How ______ books did you read last month?", key: "many", noun: "books", example: "I read two books last month." },
    { short: "Countries", blank: "How ______ countries did you visit last year?", key: "many", noun: "countries", example: "I visited one country last year." },
    { short: "Free time", blank: "How ______ free time do you have during the week?", key: "much", noun: "free time", example: "I don't have much free time during the week." },
    { short: "Tea/coffee", blank: "How ______ tea or coffee did you drink yesterday?", key: "much", noun: "tea or coffee", example: "I drank two cups of coffee yesterday." },
    { short: "Pictures", blank: "How ______ pictures do you have on your bedroom wall?", key: "many", noun: "pictures", example: "I have three pictures on my bedroom wall." },
    { short: "Eat out", blank: "How ______ times do you eat out in a week?", key: "many", noun: "times", example: "I eat out once or twice a week." },
    { short: "Emails", blank: "How ______ emails do you get a day?", key: "many", noun: "emails", example: "I get about ten emails a day." },
    { short: "Games", blank: "How ______ games do you have on your phone and computer?", key: "many", noun: "games", example: "I have about twelve games on my phone and computer." },
    { short: "Homework", blank: "How ______ time did you spend doing English homework last week?", key: "much", noun: "time", example: "I spent about four hours on English homework last week." },
    { short: "Photos", blank: "How ______ photos do you have on your phone?", key: "many", noun: "photos", example: "I have hundreds of photos on my phone." },
    { short: "Family", blank: "How ______ people in your family speak English?", key: "many", noun: "people", example: "Three people in my family speak English." },
    { short: "Fruit", blank: "How ______ fruit do you eat in a day?", key: "much", noun: "fruit", example: "I eat one or two pieces of fruit a day." },
    { short: "Meat", blank: "How ______ meat do you eat in a week?", key: "much", noun: "meat", example: "I don't eat much meat in a week." },
    { short: "Messages", blank: "How ______ text messages did you send yesterday?", key: "many", noun: "text messages", example: "I sent about twenty text messages yesterday." },
    { short: "Friends", blank: "How ______ friends do you have on Facebook?", key: "many", noun: "friends", example: "I have about eighty friends on Facebook." }
  ];

  /** Cards still available on the board this game */
  var boardLeft = [];

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
          "That was too short. Say a full sentence (e.g. “I eat two pieces of fruit a day”).";
      }
      return;
    }
    state.saidIt = true;
    state.lastTranscript = transcript;
    if ($("transcriptText")) $("transcriptText").textContent = transcript;
    show($("transcriptBox"), true);
    if ($("speakStatus")) {
      $("speakStatus").textContent = "Heard! Tap Check to continue.";
    }
    if ($("micLabel")) $("micLabel").textContent = "Say again";
    var btn = $("btnMic");
    if (btn) btn.classList.add("is-done");
    // Grammar write box only
    if (state.mode !== "speaking" && $("answerInput")) {
      $("answerInput").value = transcript;
    }
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
    document.body.classList.add("hmm-playing");
    hideZoom();
    if ($("panelBoard")) $("panelBoard").hidden = false;
    if ($("panelAnswer")) $("panelAnswer").hidden = true;
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
    if ($("promptText")) $("promptText").textContent = "Tap the circle — a random card zooms in.";
    if ($("hubLabel")) $("hubLabel").textContent = "PICK";
    buildGrid();
    $("btnSpin").disabled = false;
    updateHud();
  }

  function buildGrid() {
    var grid = $("cardGrid");
    if (!grid) return;
    boardLeft = shuffle(CARDS.map(function (_, i) { return i; }));
    grid.innerHTML = "";
    grid.classList.remove("is-picking", "is-dimmed");
    CARDS.forEach(function (card, i) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "hmm-sq";
      el.setAttribute("role", "listitem");
      el.setAttribute("data-idx", String(i));
      el.setAttribute("data-key", card.key);
      el.setAttribute("aria-label", card.blank);
      el.innerHTML =
        '<span class="hmm-sq-glow" aria-hidden="true"></span>' +
        '<span class="hmm-sq-short">' + card.short + "</span>";
      el.disabled = true;
      grid.appendChild(el);
    });
  }

  function markUsed(idx) {
    var el = document.querySelector('.hmm-sq[data-idx="' + idx + '"]');
    if (el) {
      el.classList.add("is-used");
      el.disabled = true;
    }
  }

  function clearHighlights() {
    document.querySelectorAll(".hmm-sq.is-flash").forEach(function (el) {
      el.classList.remove("is-flash");
    });
  }

  function showZoom(card) {
    var board = $("panelBoard");
    var answer = $("panelAnswer");
    if ($("zoomText")) $("zoomText").textContent = card.blank;
    if ($("zoomTag")) $("zoomTag").textContent = card.short;
    if (board) board.hidden = true;
    if (answer) {
      answer.hidden = false;
      answer.classList.remove("is-out");
      void answer.offsetWidth;
      answer.classList.add("is-in");
    }
    document.body.classList.add("hmm-answering");
  }

  function hideZoom() {
    var board = $("panelBoard");
    var answer = $("panelAnswer");
    if (answer) {
      answer.classList.remove("is-in");
      answer.hidden = true;
    }
    if (board) board.hidden = false;
    document.body.classList.remove("hmm-answering");
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
  }

  function spin() {
    if (state.spinning) return;
    if (state.round >= ROUNDS) {
      endGame();
      return;
    }
    // Refresh board pool if empty
    if (!boardLeft.length) {
      boardLeft = shuffle(
        CARDS.map(function (_, i) { return i; }).filter(function (i) {
          return !document.querySelector('.hmm-sq[data-idx="' + i + '"].is-used');
        })
      );
      if (!boardLeft.length) {
        boardLeft = shuffle(CARDS.map(function (_, i) { return i; }));
        document.querySelectorAll(".hmm-sq.is-used").forEach(function (el) {
          el.classList.remove("is-used");
        });
      }
    }

    state.spinning = true;
    state.choiceOk = false;
    state.saidIt = false;
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
    show($("choiceFeedback"), false);
    show($("answerFeedback"), false);
    show($("modelAnswer"), false);
    hideZoom();
    $("btnSpin").disabled = true;
    $("btnSpin").classList.add("is-busy");
    if ($("hubLabel")) $("hubLabel").textContent = "…";
    if ($("promptText")) $("promptText").textContent = "Picking a card…";

    var grid = $("cardGrid");
    if (grid) grid.classList.add("is-picking");

    // Rapid random highlight, then land on winner
    var winIdx = boardLeft[Math.floor(Math.random() * boardLeft.length)];
    boardLeft = boardLeft.filter(function (i) { return i !== winIdx; });
    state.card = CARDS[winIdx];
    if (state.used.indexOf(winIdx) === -1) state.used.push(winIdx);

    var ticks = 0;
    var maxTicks = 14 + Math.floor(Math.random() * 8);
    var timer = setInterval(function () {
      clearHighlights();
      var flashIdx = boardLeft.length
        ? boardLeft[Math.floor(Math.random() * boardLeft.length)]
        : Math.floor(Math.random() * CARDS.length);
      // prefer flashing unused
      var flashEl = document.querySelector('.hmm-sq[data-idx="' + flashIdx + '"]:not(.is-used)');
      if (!flashEl) {
        flashEl = document.querySelector('.hmm-sq[data-idx="' + Math.floor(Math.random() * CARDS.length) + '"]');
      }
      if (flashEl) flashEl.classList.add("is-flash");
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(timer);
        clearHighlights();
        var winEl = document.querySelector('.hmm-sq[data-idx="' + winIdx + '"]');
        if (winEl) winEl.classList.add("is-flash", "is-winner");
        if ($("hubLabel")) $("hubLabel").textContent = "PICK";
        if ($("promptText")) $("promptText").textContent = state.card.blank;
        $("btnSpin").classList.remove("is-busy");

        // Zoom in
        setTimeout(function () {
          if (winEl) winEl.classList.remove("is-flash");
          markUsed(winIdx);
          showZoom(state.card);
          state.spinning = false;
          if (grid) grid.classList.remove("is-picking");
          openChoice();
        }, 420);
      }
    }, 70);
  }


  function openChoice() {
    show($("stepChoice"), true);
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
      if ($("answerStepTitle")) $("answerStepTitle").textContent = "Say a full answer";
      if ($("answerHint")) {
        $("answerHint").textContent =
          "Use the microphone only. Speak a complete sentence — not only “a lot” or “a few”.";
      }
      show($("speakBox"), true);
      if ($("writeBox")) $("writeBox").hidden = true;
      if ($("answerInput")) {
        $("answerInput").value = "";
        $("answerInput").hidden = true;
      }
      var mic = $("btnMic");
      if (mic) mic.classList.remove("is-listening", "is-done");
      if ($("micLabel")) $("micLabel").textContent = "Tap to speak";
      if ($("speakStatus")) {
        if (recognition) {
          $("speakStatus").textContent = "Tap the mic and say your full answer.";
        } else {
          $("speakStatus").textContent =
            "Speech recognition not supported in this browser. Try Chrome and allow the microphone.";
        }
      }
      if ($("btnSubmit")) $("btnSubmit").textContent = "Check spoken answer";
    } else {
      if ($("answerStepTitle")) $("answerStepTitle").textContent = "Write a full answer";
      if ($("answerHint")) {
        $("answerHint").textContent =
          "Use a complete sentence (not only “a lot” or “a few”).";
      }
      show($("speakBox"), false);
      if ($("writeBox")) $("writeBox").hidden = false;
      if ($("answerInput")) {
        $("answerInput").hidden = false;
        $("answerInput").readOnly = false;
        $("answerInput").value = "";
        $("answerInput").placeholder = "e.g. I drink about two litres of water a day.";
        $("answerInput").focus();
      }
      if ($("btnSubmit")) $("btnSubmit").textContent = "Check answer";
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
    if (state.mode === "speaking") {
      if (!state.saidIt || !looksLikeFullAnswer(state.lastTranscript)) {
        $("answerFeedback").textContent =
          "You must speak a full sentence with the microphone first.";
        $("answerFeedback").className = "hmm-feedback is-bad";
        show($("answerFeedback"), true);
        return;
      }
      state.spokenOk++;
      state.score += 8;
      $("answerFeedback").textContent = "Great speaking — answer accepted.";
      $("answerFeedback").className = "hmm-feedback is-ok";
      show($("answerFeedback"), true);
      $("modelText").textContent = state.card.example;
      show($("modelAnswer"), true);
      $("btnSubmit").hidden = true;
      $("btnSkip").hidden = false;
      $("btnSkip").textContent = state.round + 1 >= ROUNDS ? "See results" : "Next card";
      updateHud();
      return;
    }

    var text = ($("answerInput") && $("answerInput").value || "").trim();
    if (!looksLikeFullAnswer(text)) {
      $("answerFeedback").textContent =
        "Write a full sentence (at least a few words), not only a short phrase.";
      $("answerFeedback").className = "hmm-feedback is-bad";
      show($("answerFeedback"), true);
      return;
    }
    state.score += 5;
    $("answerFeedback").textContent = "Nice — full answer saved.";
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
    hideZoom();
    state.round++;
    if (state.round >= ROUNDS) {
      endGame();
      return;
    }
    show($("stepChoice"), false);
    show($("stepAnswer"), false);
    if ($("promptText")) $("promptText").textContent = "Tap the circle for the next card.";
    if ($("hubLabel")) $("hubLabel").textContent = "PICK";
    $("btnSpin").disabled = false;
    updateHud();
  }

  function endGame() {
    show($("screenPlay"), false);
    show($("screenResult"), true);
    document.body.classList.remove("hmm-playing");
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


  function stripProfileControls() {
    try {
      document.querySelectorAll("a.profile-fab, .profile-fab, a.nav-profile, .nav-profile").forEach(function (el) {
        el.remove();
      });
    } catch (e) {}
  }

  function backToBoard() {
    // Cancel current card attempt and return to grid
    try { if (recognition) recognition.stop(); } catch (e) {}
    state.listening = false;
    state.saidIt = false;
    state.lastTranscript = "";
    state.choiceOk = false;
    // Return last card to the pool if it was marked used this attempt
    if (state.card) {
      var idx = CARDS.indexOf(state.card);
      if (idx >= 0) {
        var el = document.querySelector('.hmm-sq[data-idx="' + idx + '"]');
        if (el) {
          el.classList.remove("is-used", "is-winner", "is-flash");
        }
        if (state.used.indexOf(idx) !== -1) {
          state.used = state.used.filter(function (u) { return u !== idx; });
        }
        if (boardLeft.indexOf(idx) === -1) boardLeft.push(idx);
      }
    }
    state.card = null;
    hideZoom();
    if ($("btnSpin")) {
      $("btnSpin").disabled = false;
      $("btnSpin").classList.remove("is-busy");
    }
    if ($("hubLabel")) $("hubLabel").textContent = "PICK";
    if ($("promptText")) $("promptText").textContent = "Tap the circle to pick a card";
    state.spinning = false;
  }

  function bind() {

    stripProfileControls();
    setTimeout(stripProfileControls, 0);
    setTimeout(stripProfileControls, 100);

    state.mode = isSpeakingMode() ? "speaking" : "grammar";
    initSpeech();

    if (state.mode === "speaking") {
      document.body.setAttribute("data-mode", "speaking");
      document.body.classList.add("speaking", "hmm-speaking");
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
      // Back always returns to Speaking arcade (not Grammar)
      var backMain = document.getElementById("hmmBack");
      if (backMain) {
        backMain.href = "../../speaking/";
        backMain.removeAttribute("data-back-one");
      }
      var backResult = document.getElementById("hmmBackResult");
      if (backResult) {
        backResult.href = "../../speaking/";
        backResult.textContent = "Back to Speaking";
      }
    } else {
      document.body.classList.add("grammar");
    }

    buildGrid();
    $("btnStart").addEventListener("click", startGame);
    $("btnSpin").addEventListener("click", spin);
    if ($("btnBackBoard")) $("btnBackBoard").addEventListener("click", backToBoard);
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
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
