/* Choose the Verb — simple present vs present continuous · Starter Unit 9B */
(function () {
  "use strict";

  const GAME_ID = "starter-9b-verb-choice";

  const ITEMS = [
    // —— original set ——
    {
      before: "I usually",
      after: "to work by bus.",
      options: ["go", "am going"],
      correct: "go",
    },
    {
      before: "Look! The baby",
      after: ".",
      options: ["cries", "is crying"],
      correct: "is crying",
    },
    {
      before: "My brother",
      after: "soccer every Saturday.",
      options: ["plays", "is playing"],
      correct: "plays",
    },
    {
      before: "We",
      after: "dinner now.",
      options: ["have", "are having"],
      correct: "are having",
    },
    {
      before: "She usually",
      after: "jeans.",
      options: ["wears", "is wearing"],
      correct: "wears",
    },
    {
      before: "Listen! Someone",
      after: "the piano.",
      options: ["plays", "is playing"],
      correct: "is playing",
    },
    {
      before: "They",
      after: "in Tehran.",
      options: ["live", "are living"],
      correct: "live",
    },
    {
      before: "I",
      after: "TV at the moment.",
      options: ["watch", "am watching"],
      correct: "am watching",
    },
    {
      before: "He",
      after: "coffee every morning.",
      options: ["drinks", "is drinking"],
      correct: "drinks",
    },
    {
      before: "The students",
      after: "their homework now.",
      options: ["do", "are doing"],
      correct: "are doing",
    },
    // —— book set (circle the correct form) ——
    {
      before: "Hiro usually",
      after: "to school in the morning.",
      options: ["goes", "is going"],
      correct: "goes",
    },
    {
      before: "But today he",
      after: "at home.",
      options: ["studies", "'s studying"],
      correct: "'s studying",
    },
    {
      before: "B: No. I",
      after: "at home today.",
      options: ["work", "I'm working"],
      correct: "I'm working",
    },
    {
      before: "A: ",
      after: "your homework?",
      options: ["Do you do", "Are you doing"],
      correct: "Are you doing",
    },
    {
      before: "B: I don't have any homework today. I",
      after: "a video game.",
      options: ["play", "I'm playing"],
      correct: "I'm playing",
    },
    {
      before: "My wife is a nurse. She",
      after: "in a children's hospital.",
      options: ["works", "She's working"],
      correct: "works",
    },
    {
      before: "We're on vacation in Brazil. We",
      after: "in a nice little hotel.",
      options: ["stay", "We're staying"],
      correct: "We're staying",
    },
    {
      before: "A: Hi. Can you talk or",
      after: "?",
      options: ["are you driving", "do you drive"],
      correct: "are you driving",
    },
    {
      before: "B: I",
      after: ", but I can't talk now.",
      options: ["don't drive", "I'm not driving"],
      correct: "I'm not driving",
    },
    {
      before: "B: I",
      after: "lunch with my boss.",
      options: ["have", "I'm having"],
      correct: "I'm having",
    },
    {
      before: "It always",
      after: "a lot here in the winter.",
      options: ["rains", "is raining"],
      correct: "rains",
    },
    {
      before: "I usually",
      after: "toast for breakfast.",
      options: ["have", "am having"],
      correct: "have",
    },
    {
      before: "But today I",
      after: "cereal.",
      options: ["have", "I'm having"],
      correct: "I'm having",
    },
  ];

  const startScreen = document.getElementById("startScreen");
  const playScreen = document.getElementById("playScreen");
  const sentenceText = document.getElementById("sentenceText");
  const sentenceCard = document.getElementById("sentenceCard");
  const optionsEl = document.getElementById("options");
  const feedback = document.getElementById("feedback");
  const progressLabel = document.getElementById("progressLabel");
  const scorePill = document.getElementById("scorePill");

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

  function showStart() {
    clearTimer();
    locked = false;
    startScreen.classList.remove("hidden");
    playScreen.classList.add("hidden");
  }

  function start() {
    clearTimer();
    order = shuffle(ITEMS.map((_, i) => i));
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

    sentenceCard.className = "vc-card";
    sentenceText.innerHTML =
      escapeHtml(item.before) +
      ' <span class="vc-blank" id="blank">····</span> ' +
      escapeHtml(item.after);

    feedback.textContent = "";
    feedback.className = "vc-feedback";

    // Shuffle option order per question so first button isn't always the simple form
    const opts = shuffle(item.options.slice());
    optionsEl.className = "vc-options";
    restartAnim(sentenceCard, "anim-in");
    restartAnim(optionsEl, "anim-in");
    optionsEl.innerHTML = opts
      .map(function (opt) {
        return (
          '<button type="button" class="vc-opt" data-opt="' +
          escapeAttr(opt) +
          '">' +
          escapeHtml(opt) +
          "</button>"
        );
      })
      .join("");

    optionsEl.querySelectorAll(".vc-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onChoose(btn.getAttribute("data-opt"), btn);
      });
    });
  }

  function onChoose(chosen, btn) {
    if (locked) return;
    locked = true;

    const item = ITEMS[order[index]];
    const ok = chosen === item.correct;
    const blank = document.getElementById("blank");
    const buttons = optionsEl.querySelectorAll(".vc-opt");

    restartAnim(btn, "opt-pop");

    buttons.forEach(function (b) {
      b.disabled = true;
      const val = b.getAttribute("data-opt");
      if (val === item.correct) b.classList.add("is-correct");
      else if (b === btn && !ok) b.classList.add("is-wrong");
      else b.classList.add("is-dim");
    });

    if (ok) {
      score += 1;
      scorePill.textContent = String(score);
      restartAnim(scorePill, "score-bump");
      if (blank) {
        blank.textContent = item.correct;
        blank.classList.add("filled-ok");
        restartAnim(blank, "blank-fill");
      }
      sentenceCard.classList.add("is-correct");
      feedback.textContent = "Correct!";
      feedback.className = "vc-feedback ok feedback-in";
      if (window.LASfx) LASfx.correct();
      advanceTimer = setTimeout(next, 750);
    } else {
      // Keep blank empty — don't flash the wrong word into the sentence.
      // Buttons already show wrong (red) vs correct (green); feedback states the answer.
      sentenceCard.classList.add("is-wrong");
      feedback.textContent = "Answer: " + item.correct;
      feedback.className = "vc-feedback bad feedback-in";
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
    // Fallback without LAFinish
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

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("exitBtn").addEventListener("click", function () {
    clearTimer();
    showStart();
  });
})();
