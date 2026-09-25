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

const GAME_ID = "starter-3b-this-that-sentences";
  const ITEMS = [
    { img: "images/book.jpg", sentence: "This is a book.", words: ["This", "is", "a", "book."], opener: "This is", rest: "a book." },
    { img: "images/tv.jpg", sentence: "That is a TV.", words: ["That", "is", "a", "TV."], opener: "That is", rest: "a TV." },
    { img: "images/umbrella.jpg", sentence: "This is an umbrella.", words: ["This", "is", "an", "umbrella."], opener: "This is", rest: "an umbrella." },
    { img: "images/apple.jpg", sentence: "That is an apple.", words: ["That", "is", "an", "apple."], opener: "That is", rest: "an apple." },
    { img: "images/ice-cream.jpg", sentence: "This is an ice cream.", words: ["This", "is", "an", "ice", "cream."], opener: "This is", rest: "an ice cream." },
    { img: "images/board.jpg", sentence: "That is a board.", words: ["That", "is", "a", "board."], opener: "That is", rest: "a board." },
    { img: "images/keychains.jpg", sentence: "These are keychains.", words: ["These", "are", "keychains."], opener: "These are", rest: "keychains." },
    { img: "images/cars.jpg", sentence: "Those are cars.", words: ["Those", "are", "cars."], opener: "Those are", rest: "cars." },
    { img: "images/mugs.jpg", sentence: "These are mugs.", words: ["These", "are", "mugs."], opener: "These are", rest: "mugs." },
    { img: "images/pictures.jpg", sentence: "Those are pictures.", words: ["Those", "are", "pictures."], opener: "Those are", rest: "pictures." },
    { img: "images/pens.jpg", sentence: "These are pens.", words: ["These", "are", "pens."], opener: "These are", rest: "pens." },
    { img: "images/birds.jpg", sentence: "Those are birds.", words: ["Those", "are", "birds."], opener: "Those are", rest: "birds." },
  ];

  const LEVEL_HINTS = [
    "Tap the words in the correct order",
    "Type This is / That is / These are / Those are",
    "Type the whole sentence",
  ];

  const $ = function (id) { return document.getElementById(id); };

  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const sceneImg = $("sceneImg");
  const answerLine = $("answerLine");
  const wordBank = $("wordBank");
  const level1UI = $("level1UI");
  const typeUI = $("typeUI");
  const typeInput = $("typeInput");
  const promptLine = $("promptLine");
  const checkBtn = $("checkBtn");
  const clearBtn = $("clearBtn");
  const feedback = $("feedback");

  let level = 0; // 0,1,2
  let order = [];
  let itemIndex = 0;
  let built = []; // level 1 tokens chosen
  let bankOrder = [];
  let score = 0;
  let correctCount = 0;
  let attempts = 0;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function show(screen) {
    // Toggle both property and attribute so [hidden] CSS always applies
    // (mobile .panel { display:flex } would otherwise override the attribute alone).
    function setHidden(el, isHidden) {
      if (!el) return;
      el.hidden = isHidden;
      if (isHidden) el.setAttribute("hidden", "");
      else el.removeAttribute("hidden");
    }
    setHidden(startScreen, screen !== "start");
    setHidden(gameScreen, screen !== "game");
    setHidden(endScreen, screen !== "end");
  }

  function setFeedback(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function updateStats() {
    $("levelText").textContent = level + 1 + " / 3";
    $("itemText").textContent = itemIndex + 1 + " / " + order.length;
    $("scoreText").textContent = String(score);
    $("levelHint").textContent = LEVEL_HINTS[level];
  }

  function currentItem() {
    return ITEMS[order[itemIndex]];
  }

  function renderItem() {
    locked = false;
    built = [];
    setFeedback("", "");
    typeInput.classList.remove("wrong", "correct");
    typeInput.value = "";

    const item = currentItem();
    sceneImg.src = item.img;
    sceneImg.alt = item.sentence;

    if (level === 0) {
      level1UI.hidden = false;
      typeUI.hidden = true;
      renderLevel1(item);
      checkBtn.disabled = true;
    } else {
      level1UI.hidden = true;
      typeUI.hidden = false;
      if (level === 1) {
        promptLine.innerHTML =
          '<span class="gap">______</span> ' + escapeHtml(item.rest);
        typeInput.placeholder = "This is / That is / These are / Those are";
      } else {
        promptLine.textContent = "Write the full sentence.";
        typeInput.placeholder = "e.g. This is a book.";
      }
      checkBtn.disabled = true;
      setTimeout(function () { typeInput.focus(); }, 50);
    }
    updateStats();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderLevel1(item) {
    bankOrder = shuffle(item.words.map(function (w, i) { return { w: w, i: i }; }));
    answerLine.innerHTML = "";
    wordBank.innerHTML = "";
    bankOrder.forEach(function (tok, bi) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "word-chip";
      btn.textContent = tok.w;
      btn.dataset.bi = String(bi);
      btn.dataset.word = tok.w;
      btn.addEventListener("click", function () {
        if (locked || btn.classList.contains("used")) return;
        btn.classList.add("used");
        built.push({ word: tok.w, bi: bi });
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "built-chip";
        chip.textContent = tok.w;
        chip.addEventListener("click", function () {
          if (locked) return;
          // remove this chip and free bank button
          const idx = built.findIndex(function (b) { return b.bi === bi && b.word === tok.w; });
          if (idx >= 0) built.splice(idx, 1);
          chip.remove();
          btn.classList.remove("used");
          checkBtn.disabled = built.length === 0;
        });
        answerLine.appendChild(chip);
        checkBtn.disabled = built.length === 0;
      });
      wordBank.appendChild(btn);
    });
  }

  function clearAnswer() {
    if (locked) return;
    if (level === 0) {
      built = [];
      answerLine.innerHTML = "";
      wordBank.querySelectorAll(".word-chip.used").forEach(function (b) {
        b.classList.remove("used");
      });
      checkBtn.disabled = true;
    } else {
      typeInput.value = "";
      typeInput.classList.remove("wrong", "correct");
      checkBtn.disabled = true;
      typeInput.focus();
    }
    setFeedback("", "");
  }

  function checkAnswer() {
    if (locked) return;
    const item = currentItem();
    let ok = false;
    let user = "";

    if (level === 0) {
      if (!built.length) return;
      user = built.map(function (b) { return b.word; }).join(" ");
      ok = normalize(user) === normalize(item.sentence);
    } else if (level === 1) {
      user = typeInput.value;
      ok = normalize(user) === normalize(item.opener);
    } else {
      user = typeInput.value;
      ok = normalize(user) === normalize(item.sentence);
    }

    locked = true;
    attempts++;
    checkBtn.disabled = true;

    if (ok) { try{sfxCorrect();}catch(e){}
      correctCount++;
      score += level === 0 ? 100 : level === 1 ? 120 : 150;
      setFeedback("Correct!", "ok");
      if (level !== 0) typeInput.classList.add("correct");
      updateStats();
      setTimeout(function () {
        nextItem();
      }, 700);
    } else {
      setFeedback("Not quite — try again", "bad");
      if (level !== 0) typeInput.classList.add("wrong");
      setTimeout(function () {
        locked = false;
        if (level === 0) {
          clearAnswer();
        } else {
          typeInput.classList.remove("wrong");
          checkBtn.disabled = !typeInput.value.trim();
          typeInput.select();
        }
        setFeedback("", "");
      }, 700);
    }
  }

  function nextItem() {
    itemIndex++;
    if (itemIndex >= order.length) {
      level++;
      if (level >= 3) {
        finish();
        return;
      }
      // new level: reshuffle items
      order = shuffle(ITEMS.map(function (_, i) { return i; }));
      itemIndex = 0;
    }
    locked = false;
    renderItem();
  }

  function finish() {
    const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 0;
    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = accuracy + "%";
    $("endTitle").textContent =
      accuracy === 100 ? "Perfect!" : accuracy >= 70 ? "Great job!" : "Good practice!";
    $("endSummary").textContent =
      "You got " + correctCount + " correct in " + attempts + " tries across 3 levels.";

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
        LAStars.apply(endScreen);
      }
    } catch (e) {}

    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    endScreen.querySelectorAll(".end-stars .star").forEach(function (el) {
      const n = Number(el.getAttribute("data-n") || 0);
      if (n <= stars) {
        el.classList.add("is-filled");
        el.textContent = "★";
      } else {
        el.classList.remove("is-filled");
        el.textContent = "☆";
      }
    });
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      const acc = (typeof accuracy !== "undefined") ? accuracy : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: correctCount,
        total: attempts || correctCount,
        timeMs: timeMs,
        onAgain: () => startGame(),
        onModes: () => startGame(),
        backHref: "../",
        save: false,
      });
      return;
    }
    show("end");
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    level = 0;
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    itemIndex = 0;
    score = 0;
    correctCount = 0;
    attempts = 0;
    show("game");
    renderItem();
  }

  $("startBtn").addEventListener("click", startGame);
  $("playAgainBtn").addEventListener("click", startGame);
  checkBtn.addEventListener("click", checkAnswer);
  clearBtn.addEventListener("click", clearAnswer);

  typeInput.addEventListener("input", function () {
    if (locked) return;
    checkBtn.disabled = !typeInput.value.trim();
  });
  typeInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !checkBtn.disabled && !locked) {
      e.preventDefault();
      checkAnswer();
    }
  });
})();
