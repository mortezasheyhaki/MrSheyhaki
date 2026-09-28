/* Question Builder · Do you…? · AEF Starter Unit 5B
   Set 1: build questions with chips
   Set 2: answer Yes, I do. / No, I don't. (polarity shown)
   No distractors.
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-questions";

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
    window.__laUiSfx = {
      tap: function () { tone(520, 0.06, "triangle", 0.08); },
      correct: function () {
        tone(523, 0.1, "sine", 0.12, 0);
        tone(659, 0.12, "sine", 0.12, 0.08);
        tone(784, 0.18, "sine", 0.1, 0.16);
      },
      wrong: function () {
        tone(220, 0.14, "sawtooth", 0.07, 0);
        tone(180, 0.18, "sawtooth", 0.06, 0.1);
      },
      celebrate: function () {
        [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
      }
    };
  })();

  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }

  /* Set 1 — build Do-questions */
  var QUESTIONS = [
    {
      words: ["Do", "you", "have", "breakfast", "in", "the", "morning", "?"],
      sentence: "Do you have breakfast in the morning?",
      hint: "you / have breakfast / morning"
    },
    {
      words: ["Do", "you", "watch", "TV", "in", "the", "evening", "?"],
      sentence: "Do you watch TV in the evening?",
      hint: "you / watch TV / evening"
    },
    {
      words: ["Do", "they", "live", "in", "an", "apartment", "?"],
      sentence: "Do they live in an apartment?",
      hint: "they / live in an apartment"
    },
    {
      words: ["Do", "you", "listen", "to", "the", "radio", "?"],
      sentence: "Do you listen to the radio?",
      hint: "you / listen to the radio"
    },
    {
      words: ["Do", "they", "eat", "fast", "food", "?"],
      sentence: "Do they eat fast food?",
      hint: "they / eat fast food"
    },
    {
      words: ["Do", "you", "drink", "coffee", "in", "the", "morning", "?"],
      sentence: "Do you drink coffee in the morning?",
      hint: "you / drink coffee / morning"
    },
    {
      words: ["Do", "you", "speak", "English", "?"],
      sentence: "Do you speak English?",
      hint: "you / speak English"
    },
    {
      words: ["Do", "they", "have", "a", "dog", "?"],
      sentence: "Do they have a dog?",
      hint: "they / have a dog"
    }
  ];

  /* Set 2 — answer (polarity forced) */
  var ANSWERS = [
    {
      question: "Do you have breakfast in the morning?",
      polarity: "pos",
      words: ["Yes,", "I", "do."],
      sentence: "Yes, I do.",
      hint: "Yes / I / do"
    },
    {
      question: "Do you watch TV in the evening?",
      polarity: "neg",
      words: ["No,", "I", "don't."],
      sentence: "No, I don't.",
      hint: "No / I / don't"
    },
    {
      question: "Do they live in an apartment?",
      polarity: "pos",
      words: ["Yes,", "they", "do."],
      sentence: "Yes, they do.",
      hint: "Yes / they / do"
    },
    {
      question: "Do you listen to the radio?",
      polarity: "neg",
      words: ["No,", "I", "don't."],
      sentence: "No, I don't.",
      hint: "No / I / don't"
    },
    {
      question: "Do they eat fast food?",
      polarity: "neg",
      words: ["No,", "they", "don't."],
      sentence: "No, they don't.",
      hint: "No / they / don't"
    },
    {
      question: "Do you drink coffee in the morning?",
      polarity: "pos",
      words: ["Yes,", "I", "do."],
      sentence: "Yes, I do.",
      hint: "Yes / I / do"
    },
    {
      question: "Do you speak English?",
      polarity: "pos",
      words: ["Yes,", "I", "do."],
      sentence: "Yes, I do.",
      hint: "Yes / I / do"
    },
    {
      question: "Do they have a dog?",
      polarity: "neg",
      words: ["No,", "they", "don't."],
      sentence: "No, they don't.",
      hint: "No / they / don't"
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | set1 | between | set2 | results
  var order = [];
  var index = 0;
  var score = 0;
  var totalItems = 0;
  var locked = false;
  var tray = [];
  var bank = [];
  var currentSet = 1;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function currentBank() {
    return currentSet === 1 ? QUESTIONS : ANSWERS;
  }

  function currentItem() {
    return currentBank()[order[index]];
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    score = 0;
    totalItems = QUESTIONS.length + ANSWERS.length;
    currentSet = 1;
    order = shuffle(QUESTIONS.map(function (_, i) { return i; }));
    index = 0;
    locked = false;
    phase = "set1";
    loadItem();
  }

  function startSet2() {
    currentSet = 2;
    order = shuffle(ANSWERS.map(function (_, i) { return i; }));
    index = 0;
    locked = false;
    phase = "set2";
    loadItem();
  }

  function loadItem() {
    if (index >= order.length) {
      if (currentSet === 1) {
        phase = "between";
        renderBetween();
        return;
      }
      endGame();
      return;
    }
    locked = false;
    tray = [];
    var item = currentItem();
    bank = shuffle(item.words.slice());
    renderPlay();
  }

  function progressLabel() {
    var done = (currentSet === 1 ? 0 : QUESTIONS.length) + index;
    return done + 1 + "/" + totalItems;
  }

  function updateHud() {
    var q = document.getElementById("qPill");
    var s = document.getElementById("scorePill");
    if (q) q.textContent = progressLabel();
    if (s) s.textContent = "SCORE " + score + "/" + totalItems;
  }

  function renderTray() {
    var el = document.getElementById("tray");
    var checkBtn = document.getElementById("checkBtn");
    if (!el) return;
    el.className = "tray";
    if (!tray.length) {
      el.innerHTML = '<p class="tray-empty">Tap chips to build the sentence</p>';
      if (checkBtn) checkBtn.disabled = true;
      return;
    }
    el.innerHTML = tray
      .map(function (t, i) {
        return (
          '<button type="button" class="chip in-tray" data-tray="' +
          i +
          '">' +
          escapeHtml(t) +
          "</button>"
        );
      })
      .join("");
    el.querySelectorAll("[data-tray]").forEach(function (btn) {
      btn.onclick = function () {
        if (locked) return;
        sfxTap();
        tray.splice(+btn.dataset.tray, 1);
        renderTray();
        renderBank();
      };
    });
    if (checkBtn) checkBtn.disabled = false;
  }

  function renderBank() {
    var el = document.getElementById("bank");
    if (!el) return;
    var remaining = {};
    tray.forEach(function (w) {
      remaining[w] = (remaining[w] || 0) + 1;
    });
    el.innerHTML = bank
      .map(function (w, i) {
        var isUsed = false;
        if (remaining[w] > 0) {
          remaining[w]--;
          isUsed = true;
        }
        return (
          '<button type="button" class="chip' +
          (isUsed ? " used" : "") +
          '" data-bank="' +
          i +
          '"' +
          (isUsed ? " disabled" : "") +
          ">" +
          escapeHtml(w) +
          "</button>"
        );
      })
      .join("");
    el.querySelectorAll(".chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        if (locked) return;
        sfxTap();
        tray.push(bank[+btn.dataset.bank]);
        renderTray();
        renderBank();
      };
    });
  }

  function clearAll() {
    if (locked) return;
    sfxTap();
    tray = [];
    renderTray();
    renderBank();
    var fb = document.getElementById("feedback");
    if (fb) {
      fb.textContent = "";
      fb.className = "feedback";
    }
  }

  function check() {
    if (locked) return;
    var item = currentItem();
    if (!tray.length) return;
    locked = true;
    var ok =
      tray.length === item.words.length &&
      tray.every(function (w, i) {
        return w === item.words[i];
      });
    var trayEl = document.getElementById("tray");
    var fb = document.getElementById("feedback");
    var checkBtn = document.getElementById("checkBtn");

    if (ok) {
      score++;
      sfxOk();
      updateHud();
      if (trayEl) trayEl.className = "tray ok";
      if (fb) {
        fb.textContent = "✓ " + item.sentence;
        fb.className = "feedback ok";
      }
      if (checkBtn) checkBtn.disabled = true;
      setTimeout(function () {
        index++;
        loadItem();
      }, 1100);
    } else {
      sfxBad();
      if (trayEl) {
        trayEl.className = "tray bad shake";
        setTimeout(function () {
          if (trayEl) trayEl.classList.remove("shake");
        }, 300);
      }
      if (fb) {
        fb.textContent = "Try again.";
        fb.className = "feedback bad";
      }
      locked = false;
    }
  }

  function renderStart() {
    phase = "start";
    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>Question Builder</h1>" +
      '<p class="start-lead"><strong>Set 1:</strong> Build questions with <em>Do…?</em><br>' +
      "<strong>Set 2:</strong> Answer with <em>Yes, I do.</em> or <em>No, I don't.</em></p>" +
      '<button type="button" class="primary-btn" id="startBtn">START</button>' +
      "</div></div>";
    document.getElementById("startBtn").onclick = startGame;
  }

  function renderBetween() {
    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>Set 1 complete!</h1>" +
      '<p class="start-lead">Now answer the questions. Look for <strong>POSITIVE +</strong> or <strong>NEGATIVE −</strong>.</p>' +
      '<button type="button" class="primary-btn" id="set2Btn">START SET 2</button>' +
      "</div></div>";
    document.getElementById("set2Btn").onclick = startSet2;
  }

  function renderPlay() {
    var item = currentItem();
    var isQ = currentSet === 1;
    var section =
      (isQ ? "Questions" : "Answers") +
      " · " +
      (index + 1) +
      "/" +
      order.length;

    var promptInner = "";
    if (isQ) {
      promptInner =
        '<span class="polarity pos">Question</span>' +
        '<p class="prompt-text">Build the question</p>' +
        '<p class="example">' +
        escapeHtml(item.hint) +
        "</p>";
    } else {
      var isPos = item.polarity === "pos";
      promptInner =
        '<span class="polarity ' +
        (isPos ? "pos" : "neg") +
        '">' +
        (isPos ? "Positive +" : "Negative −") +
        "</span>" +
        '<p class="prompt-text">Answer the question</p>' +
        '<p class="question-display">' +
        escapeHtml(item.question) +
        "</p>";
    }

    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="pill" id="qPill">' +
      progressLabel() +
      "</span>" +
      '<span class="pill score" id="scorePill">SCORE ' +
      score +
      "/" +
      totalItems +
      "</span>" +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="play-body">' +
      '<p class="section-label">' +
      section +
      "</p>" +
      '<div class="prompt-card">' +
      promptInner +
      "</div>" +
      '<div class="tray" id="tray"></div>' +
      '<div class="chip-bank" id="bank"></div>' +
      '<p class="feedback" id="feedback" aria-live="polite"></p>' +
      '<div class="action-row">' +
      '<button type="button" class="ghost-btn" id="clearBtn">Clear</button>' +
      '<button type="button" class="primary-btn" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      "</div></div>";

    document.getElementById("clearBtn").onclick = clearAll;
    document.getElementById("checkBtn").onclick = check;
    renderTray();
    renderBank();
  }

  function endGame() {
    phase = "results";
    var accuracy = totalItems ? Math.round((score / totalItems) * 100) : 0;
    var stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : accuracy >= 25 ? 1 : 0;

    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>" +
      (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") +
      "</h1>" +
      '<p class="start-lead">You scored <strong>' +
      score +
      "</strong> of <strong>" +
      totalItems +
      "</strong>.</p>" +
      '<button type="button" class="primary-btn" id="againBtn">PLAY AGAIN</button>' +
      "</div></div>";

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: totalItems,
          accuracy: accuracy,
          stars: stars,
          timeMs: timeMs,
          save: true,
          onAgain: startGame,
          onModes: renderStart,
          backHref: "../"
        });
      } catch (e) {}
    } else if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      } catch (e) {}
    }

    document.getElementById("againBtn").onclick = startGame;
  }

  renderStart();
})();
