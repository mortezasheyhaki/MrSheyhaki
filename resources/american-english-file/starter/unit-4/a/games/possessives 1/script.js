/* Possessives — AEF Starter Unit 4A
   my / your / his / her / its / our / their
*/

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

const GAME_ID = "starter-4a-possessives";

  const OPTIONS = ["my", "your", "his", "her", "its", "our", "their"];

  // Item 1 is already complete in the book (my) — still include as practice
  const ITEMS = [
    {
      n: 1,
      img: "images/q1.jpg",
      before: "Where's ",
      after: " umbrella?",
      answer: "my",
      note: "She is talking about her own umbrella."
    },
    {
      n: 2,
      img: "images/q2.jpg",
      before: "Is this ",
      after: " bag?",
      answer: "your",
      note: "Security is asking the woman about her bag."
    },
    {
      n: 3,
      img: "images/q3.jpg",
      before: "That's Josh and ",
      after: " wife.",
      answer: "his",
      note: "Josh is a man → his wife."
    },
    {
      n: 4,
      img: "images/q4.jpg",
      before: "Where are ",
      after: " coats?",
      answer: "our",
      note: "The couple is talking about their coats together → our."
    },
    {
      n: 5,
      img: "images/q5.jpg",
      before: "Where are ",
      after: " sunglasses?",
      answer: "my",
      note: "He is looking for his own sunglasses → my."
    },
    {
      n: 6,
      img: "images/q6.jpg",
      before: "Look, I think these are ",
      after: " keys.",
      answer: "their",
      note: "The keys belong to the boys → their."
    },
    {
      n: 7,
      img: "images/q7.jpg",
      before: "It's a great book. Now what's ",
      after: " name?",
      answer: "its",
      note: "The book → its name."
    },
    {
      n: 8,
      img: "images/q8.jpg",
      before: "That's Mr. Green. He's ",
      after: " French teacher.",
      answer: "our",
      note: "The family is talking about their teacher → our."
    }
  ];

  let index = 0;
  let score = 0;
  let selected = null;
  let locked = false;

  const $ = (id) => document.getElementById(id);
  const sceneImg = $("sceneImg");
  const sentence = $("sentence");
  const optionsEl = $("options");
  const checkBtn = $("checkBtn");
  const continueBtn = $("continueBtn");
  const feedback = $("feedback");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const qNum = $("qNum");
  const endOverlay = $("endOverlay");

  function render() {
    locked = false;
    selected = null;
    feedback.hidden = true;
    checkBtn.hidden = false;
    checkBtn.disabled = true;
    continueBtn.hidden = true;

    const item = ITEMS[index];
    sceneImg.src = item.img;
    sceneImg.alt = "Scene " + item.n;
    qNum.textContent = String(item.n);
    qProgress.textContent = (index + 1) + "/" + ITEMS.length;
    scoreText.textContent = String(score);

    sentence.innerHTML =
      item.before + '<span class="blank" id="blank">______</span>' + item.after;

    optionsEl.innerHTML = "";
    OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = opt;
      btn.dataset.val = opt;
      btn.addEventListener("click", () => {
        if (locked) return;
        optionsEl.querySelectorAll(".opt").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selected = opt;
        const blank = $("blank");
        blank.textContent = opt;
        blank.classList.add("filled");
        blank.classList.remove("wrong");
        checkBtn.disabled = false;
      });
      optionsEl.appendChild(btn);
    });
  }

  function check() {
    if (locked || !selected) return;
    locked = true;
    const item = ITEMS[index];
    const ok = selected === item.answer;
    const blank = $("blank");

    optionsEl.querySelectorAll(".opt").forEach((b) => {
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
      blank.classList.add("filled");
      blank.classList.remove("wrong");
      feedback.hidden = false;
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓"; try{sfxCorrect();}catch(e){}
    } else {
      blank.textContent = item.answer;
      blank.classList.remove("filled");
      blank.classList.add("wrong");
      // show correct in green after brief moment
      setTimeout(() => {
        blank.classList.remove("wrong");
        blank.classList.add("filled");
      }, 400);
      feedback.hidden = false;
      feedback.className = "feedback error";
      feedback.textContent = "Answer: " + item.answer + " — " + item.note;
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
    index = 0;
    score = 0;
    endOverlay.hidden = true;
    render();
  }

  checkBtn.addEventListener("click", check);
  continueBtn.addEventListener("click", next);
  $("againBtn").addEventListener("click", reset);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (endOverlay && !endOverlay.hidden) return;
    e.preventDefault();
    if (locked && !continueBtn.hidden) next();
    else if (!checkBtn.disabled && !checkBtn.hidden) check();
  });

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }

  render();
})();
