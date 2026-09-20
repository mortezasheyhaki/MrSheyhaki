/* Write the Verb — simple present / continuous forms · Starter Unit 9B */
(function () {
  "use strict";

  const GAME_ID = "starter-9b-write-the-verb";

  const ITEMS = [
    // —— original set ——
    {
      before: "Sara usually",
      after: "at 7:00.",
      base: "get up",
      answers: ["gets up", "gets-up"],
      display: "gets up",
    },
    {
      before: "She",
      after: "breakfast now.",
      base: "have",
      answers: ["is having", "she's having", "she is having"],
      display: "is having",
    },
    {
      before: "Tom",
      after: "in a bank.",
      base: "work",
      answers: ["works"],
      display: "works",
    },
    {
      before: "He",
      after: "to his boss at the moment.",
      base: "talk",
      answers: ["is talking", "he's talking", "he is talking"],
      display: "is talking",
    },
    {
      before: "We",
      after: "English every week.",
      base: "study",
      answers: ["study"],
      display: "study",
    },
    {
      before: "We",
      after: "English now.",
      base: "study",
      answers: ["are studying", "we're studying", "we are studying"],
      display: "are studying",
    },
    {
      before: "My father",
      after: "TV every evening.",
      base: "watch",
      answers: ["watches"],
      display: "watches",
    },
    {
      before: "He",
      after: "the newspaper now.",
      base: "read",
      answers: ["is reading", "he's reading", "he is reading"],
      display: "is reading",
    },
    {
      before: "They",
      after: "to the gym on Mondays.",
      base: "go",
      answers: ["go"],
      display: "go",
    },
    {
      before: "They",
      after: "now.",
      base: "exercise",
      answers: ["are exercising", "they're exercising", "they are exercising"],
      display: "are exercising",
    },
    // —— book set (complete the sentences) ——
    {
      before: "Do you usually",
      after: "to work?",
      base: "walk",
      answers: ["walk"],
      display: "walk",
    },
    {
      before: "Oh no! It",
      after: "and I don't have my umbrella.",
      base: "rain",
      answers: ["is raining", "it's raining", "it is raining"],
      display: "is raining",
    },
    {
      before: "My father and I",
      after: "dinner together every week.",
      base: "have",
      answers: ["have"],
      display: "have",
    },
    {
      before: "Maya and Jack are on vacation this week. They",
      after: "in Canada.",
      base: "ski",
      answers: ["are skiing", "they're skiing", "they are skiing"],
      display: "are skiing",
    },
    {
      before: "A: Hi, Sam.",
      after: "the basketball game on TV?",
      base: "watch",
      answers: [
        "are you watching",
        "are you watch",
      ],
      display: "Are you watching",
    },
    {
      before: "B: No, I",
      after: "my Spanish homework.",
      base: "do",
      answers: ["am doing", "I'm doing", "i'm doing", "i am doing"],
      display: "am doing",
    },
    {
      before: "I always",
      after: "late.",
      base: "get up",
      answers: ["get up", "get-up"],
      display: "get up",
    },
    {
      before: "I never",
      after: "time for breakfast.",
      base: "have",
      answers: ["have"],
      display: "have",
    },
    {
      before: "My sister",
      after: "in Thailand right now.",
      base: "travel",
      answers: [
        "is traveling",
        "is travelling",
        "she's traveling",
        "she's travelling",
        "she is traveling",
        "she is travelling",
      ],
      display: "is traveling",
    },
    {
      before: "A: What time",
      after: "you usually go to bed?",
      base: "do / go",
      answers: ["do"],
      display: "do",
    },
    {
      before: "A: What time do you usually",
      after: "to bed?",
      base: "go",
      answers: ["go"],
      display: "go",
    },
    {
      before: "Look. That's my brother over there. Can you see him? He",
      after: "a blue hat.",
      base: "wear",
      answers: ["is wearing", "he's wearing", "he is wearing"],
      display: "is wearing",
    },
    {
      before: "A: Hello, Nick. Where",
      after: "?",
      base: "go",
      answers: [
        "are you going",
        "are you go",
      ],
      display: "are you going",
    },
    {
      before: "B: To the gym. I always",
      after: "on Tuesdays.",
      base: "go",
      answers: ["go"],
      display: "go",
    },
  ];

  const startScreen = document.getElementById("startScreen");
  const playScreen = document.getElementById("playScreen");
  const sentenceText = document.getElementById("sentenceText");
  const sentenceCard = document.getElementById("sentenceCard");
  const promptHint = document.getElementById("promptHint");
  const answerInput = document.getElementById("answerInput");
  const checkBtn = document.getElementById("checkBtn");
  const feedback = document.getElementById("feedback");
  const progressLabel = document.getElementById("progressLabel");
  const scorePill = document.getElementById("scorePill");
  const inputRow = document.querySelector(".vw-input-row");

  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let advanceTimer = null;

  function restartAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }


  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, " ")
      // ignore final . ! ? so answers work with or without a period
      .replace(/[.!?]+\s*$/g, "")
      .trim();
  }

  function isCorrect(input, item) {
    const n = normalize(input);
    if (!n) return false;
    return item.answers.some(function (a) {
      return normalize(a) === n;
    });
  }

  function showStart() {
    clearTimer();
    locked = false;
    startScreen.classList.remove("hidden");
    playScreen.classList.add("hidden");
  }

  function start() {
    clearTimer();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    locked = false;
    scorePill.textContent = "0";
    startScreen.classList.add("hidden");
    playScreen.classList.remove("hidden");
    if (window.LAFinish) LAFinish.startTimer();
    loadItem();
  }

  function loadItem() {
    locked = false;
    clearTimer();
    const item = ITEMS[order[index]];
    progressLabel.textContent = index + 1 + " / " + order.length;
    scorePill.textContent = String(score);

    sentenceCard.className = "vw-card";
    promptHint.innerHTML = '<span>(' + escapeHtml(item.base) + ')</span>';
    sentenceText.innerHTML =
      escapeHtml(item.before) +
      ' <span class="vw-blank" id="blank">····</span> ' +
      escapeHtml(item.after);

    feedback.innerHTML = "";
    feedback.className = "vw-feedback";

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.className = "vw-input";
    checkBtn.disabled = true;
    if (inputRow) inputRow.className = "vw-input-row";
    restartAnim(sentenceCard, "anim-in");
    if (inputRow) restartAnim(inputRow, "anim-in");

    setTimeout(function () {
      try { answerInput.focus(); } catch (e) {}
    }, 80);
  }

  function check() {
    if (locked) return;
    const item = ITEMS[order[index]];
    const val = answerInput.value;
    if (!val.trim()) return;

    locked = true;
    answerInput.disabled = true;
    checkBtn.disabled = true;
    restartAnim(checkBtn, "opt-pop");

    const blank = document.getElementById("blank");
    const ok = isCorrect(val, item);

    if (ok) {
      score += 1;
      scorePill.textContent = String(score);
      restartAnim(scorePill, "score-bump");
      answerInput.className = "vw-input is-ok";
      if (blank) {
        blank.textContent = item.display;
        blank.classList.add("filled-ok");
        restartAnim(blank, "blank-fill");
      }
      sentenceCard.classList.add("is-correct");
      feedback.innerHTML = '<span class="vw-answer-label">Correct!</span>';
      feedback.className = "vw-feedback ok feedback-in";
      if (window.LASfx) LASfx.correct();
      advanceTimer = setTimeout(next, 800);
    } else {
      // Keep the player's text; only show the answer below.
      answerInput.className = "vw-input is-bad";
      sentenceCard.classList.add("is-wrong");
      feedback.innerHTML = '<span class="vw-answer-label">Answer:</span> <span class="vw-answer-word">' + escapeHtml(item.display) + "</span>";
      feedback.className = "vw-feedback bad feedback-in";
      if (window.LASfx) LASfx.wrong();
      advanceTimer = setTimeout(next, 1400);
    }
  }

  function next() {
    clearTimer();
    if (index + 1 >= order.length) {
      finish();
      return;
    }
    index += 1;
    loadItem();
  }

  function finish() {
    clearTimer();
    if (window.LASfx) LASfx.win();
    var total = order.length;
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: Math.max(total, 1),
        timeMs: timeMs,
        onAgain: start,
        onModes: showStart,
        backHref: "../",
        save: true,
      });
      return;
    }
    if (window.LAStars) {
      try {
        var acc = Math.round((score / total) * 100);
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      } catch (e) {}
    }
    alert("Done! Score: " + score + " / " + total);
    showStart();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("exitBtn").addEventListener("click", function () {
    clearTimer();
    showStart();
  });
  checkBtn.addEventListener("click", check);
  answerInput.addEventListener("input", function () {
    if (locked) return;
    checkBtn.disabled = !answerInput.value.trim();
    answerInput.className = "vw-input";
    feedback.textContent = "";
    feedback.className = "vw-feedback";
  });
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!locked && answerInput.value.trim()) check();
    }
  });
})();
