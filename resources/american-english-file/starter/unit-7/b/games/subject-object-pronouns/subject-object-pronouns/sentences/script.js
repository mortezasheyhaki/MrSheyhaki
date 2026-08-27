(function () {
  "use strict";

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
    if (ok) {
      for (var i = 0; i < item.target.length; i++) {
        if (normalizeWord(built[i].word) !== normalizeWord(item.target[i])) {
          ok = false;
          break;
        }
      }
    }

    if (ok) {
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
