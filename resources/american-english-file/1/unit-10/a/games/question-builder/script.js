/* Question Builder · Superlatives · AEF 1 Unit 10A
   Build questions with word chips.
   Layout & feel matched to Teen2Teen 2 · Picture Sentences.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-question-builder";

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
  })();

  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }

  /* adj / noun / place → full question words + display sentence */
  var BANK = [
    {
      adj: "big", noun: "country", place: "world",
      words: ["What's", "the", "biggest", "country", "in", "the", "world", "?"],
      sentence: "What's the biggest country in the world?"
    },
    {
      adj: "wet", noun: "town", place: "world",
      words: ["What's", "the", "wettest", "town", "in", "the", "world", "?"],
      sentence: "What's the wettest town in the world?"
    },
    {
      adj: "small", noun: "country", place: "world",
      words: ["What's", "the", "smallest", "country", "in", "the", "world", "?"],
      sentence: "What's the smallest country in the world?"
    },
    {
      adj: "high", noun: "city", place: "world",
      words: ["What's", "the", "highest", "city", "in", "the", "world", "?"],
      sentence: "What's the highest city in the world?"
    },
    {
      adj: "long", noun: "beach", place: "world",
      words: ["What's", "the", "longest", "beach", "in", "the", "world", "?"],
      sentence: "What's the longest beach in the world?"
    },
    {
      adj: "dry", noun: "desert", place: "world",
      words: ["What's", "the", "driest", "desert", "in", "the", "world", "?"],
      sentence: "What's the driest desert in the world?"
    },
    {
      adj: "busy", noun: "train station", place: "world",
      words: ["What's", "the", "busiest", "train", "station", "in", "the", "world", "?"],
      sentence: "What's the busiest train station in the world?"
    },
    {
      adj: "populated", noun: "city", place: "world",
      words: ["What's", "the", "most", "populated", "city", "in", "the", "world", "?"],
      sentence: "What's the most populated city in the world?"
    },
    {
      adj: "popular", noun: "tourist destination", place: "world",
      words: ["What's", "the", "most", "popular", "tourist", "destination", "in", "the", "world", "?"],
      sentence: "What's the most popular tourist destination in the world?"
    },
    {
      adj: "expensive", noun: "city", place: "world",
      words: ["What's", "the", "most", "expensive", "city", "in", "the", "world", "?"],
      sentence: "What's the most expensive city in the world?"
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var deck = [];
  var index = 0;
  var score = 0;
  var total = 0;
  var locked = false;
  var slots = [];
  var pool = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentItem() {
    return deck[index];
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    deck = shuffle(BANK);
    index = 0;
    score = 0;
    total = 0;
    locked = false;
    phase = "play";
    startRound();
  }

  function startRound() {
    if (index >= deck.length) {
      endGame();
      return;
    }
    locked = false;
    var item = currentItem();
    slots = new Array(item.words.length).fill(null);
    pool = shuffle(item.words.slice());
    render();
  }

  function firstEmpty() {
    for (var i = 0; i < slots.length; i++) if (slots[i] == null) return i;
    return -1;
  }

  function pickChip(label) {
    if (locked) return;
    var i = firstEmpty();
    if (i < 0) return;
    sfxTap();
    slots[i] = label;
    updateUI();
  }

  function clearSlot(i) {
    if (locked) return;
    if (slots[i] == null) return;
    sfxTap();
    slots[i] = null;
    updateUI();
  }

  function clearAll() {
    if (locked) return;
    sfxTap();
    slots = slots.map(function () { return null; });
    updateUI();
    var fb = document.getElementById("qb-fb");
    if (fb) { fb.textContent = ""; fb.className = "qb-fb"; }
  }

  function checkAnswer() {
    if (locked) return;
    var item = currentItem();
    var filled = slots.every(function (s) { return s != null; });
    if (!filled) {
      var fb = document.getElementById("qb-fb");
      if (fb) {
        fb.textContent = "Fill all the blanks first.";
        fb.className = "qb-fb is-hint";
      }
      return;
    }

    locked = true;
    var ok = slots.every(function (w, i) { return w === item.words[i]; });
    total++;

    var slotsEl = document.getElementById("qb-slots");
    var fbEl = document.getElementById("qb-fb");
    var checkBtn = document.getElementById("qb-check");

    if (ok) {
      score++;
      sfxOk();
      if (slotsEl) slotsEl.classList.add("is-correct");
      if (fbEl) {
        fbEl.textContent = "✓ " + item.sentence;
        fbEl.className = "qb-fb is-ok";
      }
      if (checkBtn) checkBtn.disabled = true;
      setTimeout(function () {
        index++;
        startRound();
      }, 1100);
    } else {
      sfxBad();
      if (slotsEl) {
        slotsEl.classList.add("is-wrong");
        setTimeout(function () { slotsEl.classList.remove("is-wrong"); }, 450);
      }
      if (fbEl) {
        fbEl.textContent = "Try again → " + item.sentence;
        fbEl.className = "qb-fb is-bad";
      }
      locked = false;
    }
  }

  function endGame() {
    phase = "results";
    render();
  }

  function updateUI() {
    var slotsEl = document.getElementById("qb-slots");
    var poolEl = document.getElementById("qb-pool");
    if (!slotsEl || !poolEl) return;

    slotsEl.innerHTML = slots.map(function (w, i) {
      if (w == null) return '<button type="button" class="qb-slot is-empty" data-i="' + i + '"></button>';
      return '<button type="button" class="qb-slot" data-i="' + i + '">' + escapeHtml(w) + "</button>";
    }).join("");

    slotsEl.querySelectorAll(".qb-slot").forEach(function (btn) {
      btn.onclick = function () {
        clearSlot(parseInt(btn.getAttribute("data-i"), 10));
      };
    });

    var remaining = pool.slice();
    slots.filter(Boolean).forEach(function (w) {
      var ix = remaining.indexOf(w);
      if (ix >= 0) remaining.splice(ix, 1);
    });
    var remCopy = remaining.slice();
    poolEl.innerHTML = pool.map(function (w) {
      var ix = remCopy.indexOf(w);
      var disabled = ix < 0;
      if (!disabled) remCopy.splice(ix, 1);
      return (
        '<button type="button" class="qb-chip' + (disabled ? " is-used" : "") + '" data-w="' + escapeHtml(w) + '"' +
        (disabled ? " disabled" : "") + ">" + escapeHtml(w) + "</button>"
      );
    }).join("");

    poolEl.querySelectorAll(".qb-chip:not([disabled])").forEach(function (btn) {
      btn.onclick = function () { pickChip(btn.getAttribute("data-w")); };
    });

    var checkBtn = document.getElementById("qb-check");
    if (checkBtn) checkBtn.disabled = locked;
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="qb-top">' +
      '<a class="qb-back" href="../" aria-label="Back">←</a>' +
      '<span class="qb-title">Question Builder</span>' +
      '<span class="qb-badge">Unit 10A</span></header>' +
      '<section class="qb-start">' +
      '<div class="qb-hero" aria-hidden="true">❓</div>' +
      '<h1>Question Builder</h1>' +
      '<p class="qb-sub">Use the chips to build superlative questions.</p>' +
      '<ul class="qb-tips">' +
      '<li>10 questions from the book</li>' +
      '<li>Tap chips to fill the slots</li>' +
      '<li>Tap a slot to remove a word</li>' +
      '</ul>' +
      '<button type="button" class="qb-btn" id="qb-start">START</button>' +
      '</section>';
    document.getElementById("qb-start").onclick = startGame;
  }

  function renderPlay() {
    var item = currentItem();
    var pct = deck.length ? Math.round((index / deck.length) * 100) : 0;

    app.innerHTML =
      '<header class="qb-top">' +
      '<a class="qb-back" href="../" aria-label="Back">←</a>' +
      '<span class="qb-title">Question Builder</span>' +
      '<span class="qb-badge">' + (index + 1) + "/" + deck.length + "</span>" +
      '<div class="qb-stats"><span class="qb-stat">SCORE ' + score + "/" + total + "</span></div>" +
      "</header>" +
      '<div class="qb-progress"><div class="qb-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="qb-prompt">' +
      '<span class="qb-prompt-chip">' + escapeHtml(item.adj) + "</span>" +
      '<span class="qb-prompt-sep">/</span>' +
      '<span class="qb-prompt-chip">' + escapeHtml(item.noun) + "</span>" +
      '<span class="qb-prompt-sep">/</span>' +
      '<span class="qb-prompt-chip">' + escapeHtml(item.place) + "</span>" +
      "</div>" +
      '<div class="qb-slots" id="qb-slots"></div>' +
      '<div class="qb-pool" id="qb-pool"></div>' +
      '<div class="qb-actions">' +
      '<button type="button" class="qb-btn secondary" id="qb-clear">Clear</button>' +
      '<button type="button" class="qb-btn" id="qb-check">Check</button>' +
      "</div>" +
      '<p class="qb-fb" id="qb-fb" aria-live="polite"></p>';

    document.getElementById("qb-clear").onclick = clearAll;
    document.getElementById("qb-check").onclick = checkAnswer;
    updateUI();
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : accuracy >= 25 ? 1 : 0;
    var msg =
      accuracy >= 75
        ? "Perfect questions!"
        : accuracy >= 50
        ? "Great superlative questions!"
        : "Keep practising those forms.";

    app.innerHTML =
      '<header class="qb-top">' +
      '<a class="qb-back" href="../" aria-label="Back">←</a>' +
      '<span class="qb-title">Question Builder</span>' +
      '<span class="qb-badge">Done</span></header>' +
      '<section class="qb-start">' +
      '<div class="qb-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="qb-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="qb-sub">' + msg + "</p>" +
      '<button type="button" class="qb-btn" id="qb-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          stars: stars,
          timeMs: timeMs,
          save: true,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    } else if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      } catch (e) {}
    }

    document.getElementById("qb-again").onclick = startGame;
  }

  render();
})();
