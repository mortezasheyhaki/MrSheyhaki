(function () {
  "use strict";

  const GAME_ID = "1-3b-make-questions";

  // answer = expected start of the question (case-insensitive, flexible punctuation)
  // verbHighlight = the bold verb from the original for display
  const ITEMS = [
    {
      original: "He likes sports.",
      verb: "likes",
      ending: "tennis?",
      answers: ["Does he like", "Does he like sports"]
    },
    {
      original: "She speaks foreign languages.",
      verb: "speaks",
      ending: "Chinese?",
      answers: ["Does she speak", "Does she speak foreign languages"]
    },
    {
      original: "I don't eat fast food.",
      verb: "eat",
      ending: "sushi?",
      answers: ["Do you eat", "Do you eat fast food"]
    },
    {
      original: "They cook Italian food.",
      verb: "cook",
      ending: "lasagna?",
      answers: ["Do they cook", "Do they cook Italian food"]
    },
    {
      original: "Ali doesn't live in an apartment.",
      verb: "live",
      ending: "in a house?",
      answers: ["Does he live", "Does Ali live"]
    },
    {
      original: "I want a new phone.",
      verb: "want",
      ending: "an iPhone?",
      answers: ["Do you want", "Do you want a new phone"]
    },
    {
      original: "My dad drives a Ferrari.",
      verb: "drives",
      ending: "fast?",
      answers: ["Does he drive", "Does my dad drive", "Does he drive a Ferrari"]
    },
    {
      original: "Sarah drinks a lot of tea.",
      verb: "drinks",
      ending: "it with milk?",
      answers: ["Does she drink", "Does Sarah drink"]
    },
    {
      original: "We have two children.",
      verb: "have",
      ending: "boys or girls?",
      answers: ["Do you have", "Do we have"]
    },
    {
      original: "I don't listen to the radio.",
      verb: "listen",
      ending: "to music on your phone?",
      answers: ["Do you listen", "Do you listen to the radio"]
    }
  ];

  function normalize(s) {
    return s
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[?.!,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    return answers.some(function (a) {
      const n = normalize(a);
      // exact or user typed a bit more that still starts correctly
      return u === n || u.startsWith(n + " ") || n.startsWith(u);
    });
  }

  let order = [];
  let index = 0;
  let score = 0;
  let answered = {}; // id -> true if correct
  let locked = false;

  const originalBox = document.getElementById("originalBox");
  const endingText = document.getElementById("endingText");
  const answerInput = document.getElementById("answerInput");
  const answerRow = document.getElementById("answerRow");
  const feedback = document.getElementById("feedback");
  const progressLabel = document.getElementById("progressLabel");
  const scoreLabel = document.getElementById("scoreLabel");
  const progressFill = document.getElementById("progressFill");
  const playCard = document.getElementById("playCard");
  const doneBox = document.getElementById("done");
  const checkBtn = document.getElementById("checkBtn");
  const skipBtn = document.getElementById("skipBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const hint = document.getElementById("hint");

  function highlightVerb(text, verb) {
    if (!verb) return text;
    const re = new RegExp("\\b(" + verb.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "i");
    return text.replace(re, '<span class="verb">$1</span>');
  }

  function showItem(animate) {
    const item = order[index];
    originalBox.innerHTML = highlightVerb(item.original, item.verb);
    endingText.textContent = item.ending;

    answerInput.value = "";
    answerInput.disabled = false;
    answerRow.className = "answer-row";
    feedback.textContent = "";
    feedback.className = "feedback";
    locked = false;
    checkBtn.disabled = false;
    skipBtn.disabled = false;
    hint.style.display = "";

    progressLabel.textContent = (index + 1) + " / " + order.length;
    progressFill.style.width = ((index + 1) / order.length) * 100 + "%";
    scoreLabel.textContent = score + " correct";

    prevBtn.disabled = index === 0;
    nextBtn.disabled = false;

    if (animate) {
      playCard.style.animation = "none";
      void playCard.offsetWidth;
      playCard.style.animation = "cardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both";
    }

    setTimeout(function () {
      answerInput.focus();
    }, 120);
  }

  function check() {
    if (locked) return;
    const item = order[index];
    const user = answerInput.value;
    if (!user.trim()) {
      answerInput.focus();
      return;
    }
    locked = true;
    checkBtn.disabled = true;
    skipBtn.disabled = true;
    answerInput.disabled = true;
    hint.style.display = "none";

    if (isCorrect(user, item.answers)) {
      if (!answered[item.original]) {
        answered[item.original] = true;
        score++;
        scoreLabel.textContent = score + " correct";
      }
      answerRow.classList.add("correct");
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓";
      setTimeout(function () {
        goNext();
      }, 900);
    } else {
      answerRow.classList.add("wrong");
      feedback.className = "feedback error";
      feedback.innerHTML =
        'Not quite. <span class="answer-reveal">' +
        item.answers[0] +
        " " +
        item.ending +
        "</span>";
      // allow moving on after seeing the answer
      setTimeout(function () {
        locked = false;
        nextBtn.disabled = false;
      }, 400);
    }
  }

  function skip() {
    if (locked) return;
    const item = order[index];
    locked = true;
    checkBtn.disabled = true;
    skipBtn.disabled = true;
    answerInput.disabled = true;
    hint.style.display = "none";
    answerRow.classList.add("wrong");
    feedback.className = "feedback error";
    feedback.innerHTML =
      'Answer: <span class="answer-reveal">' +
      item.answers[0] +
      " " +
      item.ending +
      "</span>";
    setTimeout(function () {
      locked = false;
    }, 300);
  }

  function goNext() {
    if (index >= order.length - 1) {
      finish();
      return;
    }
    index++;
    showItem(true);
  }

  function goPrev() {
    if (index <= 0 || locked) return;
    index--;
    showItem(true);
  }

  function starsFromPct(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function renderStars(n) {
    const el = document.getElementById("stars");
    el.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = (i - 1) * 0.14 + "s";
      el.appendChild(s);
    }
  }

  function finish() {
    playCard.classList.add("hidden");
    doneBox.classList.remove("hidden");
    const pct = Math.round((score / order.length) * 100);
    document.getElementById("finalScore").textContent =
      score + " / " + order.length + " correct (" + pct + "%)";
    renderStars(starsFromPct(pct));
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, pct);
      } catch (e) {}
    }
  }

  function start() {
    order = ITEMS.slice(); // keep book order (1–10)
    index = 0;
    score = 0;
    answered = {};
    locked = false;
    doneBox.classList.add("hidden");
    playCard.classList.remove("hidden");
    showItem(true);
  }

  checkBtn.addEventListener("click", check);
  skipBtn.addEventListener("click", skip);
  nextBtn.addEventListener("click", function () {
    if (locked) return;
    // if they haven't checked, treat as skip-and-go
    goNext();
  });
  prevBtn.addEventListener("click", goPrev);

  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      check();
    }
  });

  document.getElementById("restartBtn").addEventListener("click", start);
  start();
})();
