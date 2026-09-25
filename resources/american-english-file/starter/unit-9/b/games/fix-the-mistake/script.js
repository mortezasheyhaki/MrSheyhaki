/* Fix the Mistake — correct the present simple / continuous error · Starter Unit 9B */
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
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

const GAME_ID = "starter-9b-fix-the-mistake";

  const ITEMS = [
    {
      wrong: "She is usually going to work by bus.",
      answers: [
        "She usually goes to work by bus.",
        "She usually goes to work by bus",
      ],
      display: "She usually goes to work by bus.",
    },
    {
      wrong: "I am drink coffee every morning.",
      answers: [
        "I drink coffee every morning.",
        "I drink coffee every morning",
      ],
      display: "I drink coffee every morning.",
    },
    {
      wrong: "They play football now.",
      answers: [
        "They are playing football now.",
        "They are playing football now",
        "They're playing football now.",
        "They're playing football now",
        "They are playing soccer now.",
        "They are playing soccer now",
      ],
      display: "They are playing football now.",
    },
    {
      wrong: "He is watching TV every evening.",
      answers: [
        "He watches TV every evening.",
        "He watches TV every evening",
        "He watches television every evening.",
        "He watches television every evening",
      ],
      display: "He watches TV every evening.",
    },
    {
      wrong: "We are study English at the moment.",
      answers: [
        "We are studying English at the moment.",
        "We are studying English at the moment",
        "We're studying English at the moment.",
        "We're studying English at the moment",
      ],
      display: "We are studying English at the moment.",
    },
    {
      wrong: "My mother cook dinner every day.",
      answers: [
        "My mother cooks dinner every day.",
        "My mother cooks dinner every day",
      ],
      display: "My mother cooks dinner every day.",
    },
  ];

  const startScreen = document.getElementById("startScreen");
  const playScreen = document.getElementById("playScreen");
  const wrongText = document.getElementById("wrongText");
  const sentenceCard = document.getElementById("sentenceCard");
  const answerInput = document.getElementById("answerInput");
  const checkBtn = document.getElementById("checkBtn");
  const feedback = document.getElementById("feedback");
  const progressLabel = document.getElementById("progressLabel");
  const scorePill = document.getElementById("scorePill");
  const inputRow = document.querySelector(".fm-input-row");

  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let advanceTimer = null;

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

  function restartAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
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

    sentenceCard.className = "fm-card";
    wrongText.textContent = item.wrong;

    feedback.innerHTML = "";
    feedback.className = "fm-feedback";

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.className = "fm-input";
    checkBtn.disabled = true;
    if (inputRow) inputRow.className = "fm-input-row";
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

    const ok = isCorrect(val, item);

    if (ok) { try{sfxCorrect();}catch(e){}
      score += 1;
      scorePill.textContent = String(score);
      restartAnim(scorePill, "score-bump");
      answerInput.className = "fm-input is-ok";
      sentenceCard.classList.add("is-correct");
      feedback.innerHTML = '<span class="fm-answer-label">Correct!</span>';
      feedback.className = "fm-feedback ok feedback-in";
      if (window.LASfx) LASfx.correct();
      advanceTimer = setTimeout(next, 800);
    } else {
      // Keep player's text; show answer below only
      answerInput.className = "fm-input is-bad";
      sentenceCard.classList.add("is-wrong");
      feedback.innerHTML =
        '<span class="fm-answer-label">Answer:</span> <span class="fm-answer-word">' +
        escapeHtml(item.display) +
        "</span>";
      feedback.className = "fm-feedback bad feedback-in";
      if (window.LASfx) LASfx.wrong();
      advanceTimer = setTimeout(next, 1600);
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
    answerInput.className = "fm-input";
    feedback.innerHTML = "";
    feedback.className = "fm-feedback";
  });
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!locked && answerInput.value.trim()) check();
    }
  });
})();
