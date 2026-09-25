/* People Words — boy girl man woman men women children friends */

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

const GAME_ID = "starter-4a-people-words";
  const WORD_LIST = ["boy", "children", "friends", "girl", "man", "men", "woman", "women"];

  const ITEMS = [
    {
      n: 1,
      img: "https://cdn.imgurl.ir/uploads/q385676_Fabio_and_Anna.png",
      before: "Fabio and Anna are ",
      after: ".",
      answer: "friends"
    },
    {
      n: 2,
      img: "https://cdn.imgurl.ir/uploads/x90947_Mrs_DeSouza.png",
      before: "Mrs. DeSouza is a ",
      after: ".",
      answer: "woman"
    },
    {
      n: 3,
      img: "https://cdn.imgurl.ir/uploads/k66783_Kim.png",
      before: "Kim is a ",
      after: ".",
      answer: "girl"
    },
    {
      n: 4,
      img: "https://cdn.imgurl.ir/uploads/n16198_George_and_Michael.png",
      before: "George and Michael are ",
      after: ".",
      answer: "men"
    },
    {
      n: 5,
      img: "https://cdn.imgurl.ir/uploads/a3765_Alex.png",
      before: "Alex is a ",
      after: ".",
      answer: "boy"
    },
    {
      n: 6,
      img: "https://cdn.imgurl.ir/uploads/m899048_Mr_Husson.png",
      before: "Mr. Husson is a ",
      after: ".",
      answer: "man"
    },
    {
      n: 7,
      img: "https://cdn.imgurl.ir/uploads/j173778_Megan_and_Dan.png",
      before: "Megan and Dan are ",
      after: ".",
      answer: "children"
    },
    {
      n: 8,
      img: "https://cdn.imgurl.ir/uploads/v798959_Jessica_and_Helena.png",
      before: "Jessica and Helena are ",
      after: ".",
      answer: "women"
    }
  ];

  let index = 0;
  let score = 0;
  let selected = null;
  let locked = false;
  let usedWords = new Set();

  const $ = (id) => document.getElementById(id);
  const sceneImg = $("sceneImg");
  const sentence = $("sentence");
  const optionsEl = $("options");
  const wordBank = $("wordBank");
  const checkBtn = $("checkBtn");
  const continueBtn = $("continueBtn");
  const feedback = $("feedback");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const qNum = $("qNum");
  const endOverlay = $("endOverlay");

  function renderBank() {
    wordBank.innerHTML = "";
    WORD_LIST.forEach(function (w) {
      const chip = document.createElement("span");
      chip.className = "bank-chip" + (usedWords.has(w) ? " used" : "");
      chip.textContent = w;
      wordBank.appendChild(chip);
    });
  }

  function render() {
    locked = false;
    selected = null;
    feedback.hidden = true;
    checkBtn.hidden = false;
    checkBtn.disabled = true;
    continueBtn.hidden = true;

    const item = ITEMS[index];
    sceneImg.src = item.img;
    sceneImg.alt = "Photo " + item.n;
    qNum.textContent = String(item.n);
    qProgress.textContent = item.n + "/" + ITEMS.length;
    scoreText.textContent = String(score);

    sentence.innerHTML =
      item.before +
      '<span class="blank" id="blank">&nbsp;</span>' +
      item.after;

    // Options = remaining unused words (or all if none left)
    const available = WORD_LIST.filter(function (w) {
      return !usedWords.has(w);
    });
    const pool = available.length > 0 ? available : WORD_LIST.slice();

    optionsEl.innerHTML = "";
    pool.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-btn";
      btn.dataset.val = opt;
      btn.textContent = opt;
      btn.addEventListener("click", function () {
        if (locked) return;
        selected = opt;
        optionsEl.querySelectorAll(".opt-btn").forEach(function (b) {
          b.classList.toggle("selected", b.dataset.val === selected);
        });
        checkBtn.disabled = false;
        const blank = $("blank");
        if (blank) blank.textContent = opt;
      });
      optionsEl.appendChild(btn);
    });

    renderBank();
  }

  function check() {
    if (locked || !selected) return;
    locked = true;
    const item = ITEMS[index];
    const ok = selected === item.answer;
    const blank = $("blank");

    optionsEl.querySelectorAll(".opt-btn").forEach(function (b) {
      b.disabled = true;
      if (b.dataset.val === item.answer) b.classList.add("correct");
      else if (b.dataset.val === selected && !ok) b.classList.add("wrong");
    });

    checkBtn.hidden = true;
    continueBtn.hidden = false;
    continueBtn.textContent =
      index >= ITEMS.length - 1 ? "See results →" : "Continue →";

    if (ok) { try{sfxCorrect();}catch(e){}
      score++;
      scoreText.textContent = String(score);
      usedWords.add(item.answer);
      blank.classList.add("filled");
      blank.classList.remove("wrong");
      feedback.hidden = false;
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓"; try{sfxCorrect();}catch(e){}
      renderBank();
    } else {
      blank.textContent = item.answer;
      blank.classList.remove("filled");
      blank.classList.add("wrong");
      setTimeout(function () {
        blank.classList.remove("wrong");
        blank.classList.add("filled");
      }, 400);
      usedWords.add(item.answer);
      feedback.hidden = false;
      feedback.className = "feedback error";
      feedback.textContent = "Answer: " + item.answer;
      renderBank();
    }
  }

  function next() {
    if (index >= ITEMS.length - 1) {
      finish();
      return;
    }
    index++;
    render();
  }

  function finish() {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: score,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => location.reload(),
          onModes: () => { location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

    const total = ITEMS.length;
    const acc = Math.round((score / total) * 100);
    $("endTitle").textContent =
      acc === 100 ? "Perfect!" : acc >= 70 ? "Well done!" : "Good practice!";
    $("endMsg").textContent = "Score: " + score + " / " + total + " (" + acc + "%)";
    $("endEmoji").textContent = acc === 100 ? "🏆" : acc >= 70 ? "🎉" : "💪";
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}
    endOverlay.hidden = false;
  }

  function reset() {
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    score = 0;
    usedWords = new Set();
    endOverlay.hidden = true;
    render();
  }

  checkBtn.addEventListener("click", check);
  continueBtn.addEventListener("click", next);
  $("againBtn").addEventListener("click", reset);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    if (endOverlay && !endOverlay.hidden) return;
    e.preventDefault();
    if (locked && !continueBtn.hidden) next();
    else if (!checkBtn.disabled && !checkBtn.hidden) check();
  });

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }

  render();
})();
