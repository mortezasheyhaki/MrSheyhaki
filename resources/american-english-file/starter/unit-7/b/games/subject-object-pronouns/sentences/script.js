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

const GAME_ID = "starter-7b-pronouns-sentences";

  const ITEMS = [
    {
      prompt: "I love Scarlett.",
      target: ["I", "love", "her."],
      targetText: "I love her.",
      nounAudio: "../audio/s1-noun.mp3",
      pronounAudio: "../audio/s1-pronoun.mp3",
    },
    {
      prompt: "I don't like dogs.",
      target: ["I", "don't", "like", "them."],
      targetText: "I don't like them.",
      nounAudio: "../audio/s2-noun.mp3",
      pronounAudio: "../audio/s2-pronoun.mp3",
    },
    {
      prompt: "I like your house.",
      target: ["I", "like", "it."],
      targetText: "I like it.",
      nounAudio: "../audio/s3-noun.mp3",
      pronounAudio: "../audio/s3-pronoun.mp3",
    },
    {
      prompt: "Wait for Daniel.",
      target: ["Wait", "for", "him."],
      targetText: "Wait for him.",
      nounAudio: "../audio/s4-noun.mp3",
      pronounAudio: "../audio/s4-pronoun.mp3",
    },
    {
      prompt: "Read the book.",
      target: ["Read", "it."],
      targetText: "Read it.",
      nounAudio: "../audio/s5-noun.mp3",
      pronounAudio: "../audio/s5-pronoun.mp3",
    },
    {
      prompt: "I love cats.",
      target: ["I", "love", "them."],
      targetText: "I love them.",
      nounAudio: "../audio/s6-noun.mp3",
      pronounAudio: "../audio/s6-pronoun.mp3",
    },
    {
      prompt: "Speak to your mother.",
      target: ["Speak", "to", "her."],
      targetText: "Speak to her.",
      nounAudio: "../audio/s7-noun.mp3",
      pronounAudio: "../audio/s7-pronoun.mp3",
    },
    {
      prompt: "I don't like your brother.",
      target: ["I", "don't", "like", "him."],
      targetText: "I don't like him.",
      nounAudio: "../audio/s8-noun.mp3",
      pronounAudio: "../audio/s8-pronoun.mp3",
    },
  ];

  const $ = (id) => document.getElementById(id);

  let order = [];
  let index = 0;
  let built = [];
  let bankOrder = [];
  let score = 0;
  let correctCount = 0;
  let attempts = 0;
  let locked = false;
  let currentAudio = null;

  const promptText = $("promptText");
  const answerLine = $("answerLine");
  const wordBank = $("wordBank");
  const feedback = $("feedback");
  const checkBtn = $("checkBtn");
  const playBtn = $("playPromptBtn");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function show(screen) {
    $("startScreen").hidden = screen !== "start";
    $("gameScreen").hidden = screen !== "game";
    $("endScreen").hidden = screen !== "end";
  }

  function setFb(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶";
  }

  function playSrc(src, isPrompt) {
    stopAudio();
    var a = new Audio(src);
    currentAudio = a;
    if (isPrompt) {
      playBtn.classList.add("playing");
      playBtn.textContent = "■";
    }
    a.play().catch(function () {
      if (isPrompt) {
        playBtn.classList.remove("playing");
        playBtn.textContent = "▶";
      }
    });
    a.onended = function () {
      if (isPrompt) {
        playBtn.classList.remove("playing");
        playBtn.textContent = "▶";
      }
      if (currentAudio === a) currentAudio = null;
    };
  }

  function current() {
    return ITEMS[order[index]];
  }

  function renderItem() {
    locked = false;
    built = [];
    var item = current();
    promptText.textContent = item.prompt;
    bankOrder = shuffle(item.target.map(function (w, i) {
      return { word: w, key: i + "-" + w };
    }));
    // Ensure unique keys when words repeat (none do, but safe)
    bankOrder = shuffle(item.target.map(function (w, i) {
      return { word: w, origIndex: i };
    }));

    $("itemText").textContent = (index + 1) + " / " + ITEMS.length;
    $("scoreText").textContent = String(score);
    $("correctText").textContent = String(correctCount);
    setFb("");
    checkBtn.disabled = true;
    renderBank();
    renderAnswer();
    stopAudio();
  }

  function renderAnswer() {
    answerLine.innerHTML = "";
    built.forEach(function (token, i) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "built-chip";
      chip.textContent = token.word;
      chip.addEventListener("click", function () {
        if (locked) return;
        built.splice(i, 1);
        renderAnswer();
        renderBank();
        checkBtn.disabled = built.length === 0;
      });
      answerLine.appendChild(chip);
    });
  }

  function renderBank() {
    wordBank.innerHTML = "";
    var used = {};
    built.forEach(function (t) {
      used[t.origIndex] = true;
    });
    bankOrder.forEach(function (token) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "word-chip" + (used[token.origIndex] ? " used" : "");
      chip.textContent = token.word;
      chip.disabled = !!used[token.origIndex];
      chip.addEventListener("click", function () {
        if (locked || used[token.origIndex]) return;
        built.push(token);
        renderAnswer();
        renderBank();
        checkBtn.disabled = false;
        // Auto-check when all tiles placed
        if (built.length === current().target.length) {
          checkAnswer();
        }
      });
      wordBank.appendChild(chip);
    });
  }

  function normalizeWord(w) {
    return String(w || "").toLowerCase().replace(/[.,!?]/g, "").trim();
  }

  function checkAnswer() {
    if (locked) return;
    locked = true;
    attempts++;
    var item = current();
    var ok = built.length === item.target.length;
    if (ok) { try{sfxCorrect();}catch(e){}
      for (var i = 0; i < item.target.length; i++) {
        if (normalizeWord(built[i].word) !== normalizeWord(item.target[i])) {
          ok = false;
          break;
        }
      }
    }

    if (ok) { try{sfxCorrect();}catch(e){}
      correctCount++;
      score += 10;
      $("scoreText").textContent = String(score);
      $("correctText").textContent = String(correctCount);
      setFb("Perfect!", "ok");
      playSrc(item.pronounAudio, false);
      setTimeout(function () {
        if (index < ITEMS.length - 1) {
          index++;
          renderItem();
        } else {
          finish();
        }
      }, 1600);
    } else {
      setFb("Not quite — try again", "bad");
      setTimeout(function () {
        locked = false;
        built = [];
        renderAnswer();
        renderBank();
        checkBtn.disabled = true;
        setFb("");
      }, 700);
    }
  }

  function finish() {
    stopAudio();
    var acc = attempts ? Math.round((correctCount / attempts) * 100) : 100;
    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = acc + "%";
    $("endSummary").textContent = "You finished all " + ITEMS.length + " sentences.";
    $("endTitle").textContent = acc >= 80 ? "Excellent!" : "Well done!";

    var stars = document.querySelectorAll("#endScreen .star");
    var fill = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
    stars.forEach(function (s, i) {
      s.classList.toggle("is-filled", i < fill);
      s.textContent = i < fill ? "★" : "☆";
    });

    try {
      if (window.LAStars) {
        window.LAStars.recordPlay(GAME_ID);
        window.LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}

    show("end");
  }

  playBtn.addEventListener("click", function () {
    if (locked) return;
    playSrc(current().nounAudio, true);
  });

  checkBtn.addEventListener("click", checkAnswer);
  $("clearBtn").addEventListener("click", function () {
    if (locked) return;
    built = [];
    renderAnswer();
    renderBank();
    checkBtn.disabled = true;
    setFb("");
  });

  $("startBtn").addEventListener("click", function () {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    correctCount = 0;
    attempts = 0;
    show("game");
    renderItem();
  });

  $("playAgainBtn").addEventListener("click", function () {
    show("start");
  });

  show("start");
})();
