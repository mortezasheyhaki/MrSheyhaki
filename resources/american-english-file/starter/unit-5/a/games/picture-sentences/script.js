/* Picture Sentences – build the sentence from the picture · AEF Starter 5A */
(function () {
  "use strict";

  var GAME_ID = "starter-5a-picture-sentences";

  /* === Shared UI sound effects (Web Audio fallback) === */
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
  })();

  var ITEMS = [
    {
      image: "https://cdn.imgurl.ir/uploads/l405492_we_have_sandwich_for_lunch.png",
      words: ["We", "have", "sandwiches", "for", "lunch"],
      sentence: "We have sandwiches for lunch",
      audio: "audio/sandwiches.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/m486648_we__rice_in_the_evening.png",
      words: ["We", "eat", "rice", "in", "the", "evening"],
      sentence: "We eat rice in the evening",
      audio: "audio/rice.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/v228255_We_don39t_drink_tea_in_the_evening.png",
      words: ["We", "don't", "drink", "tea", "in", "the", "evening"],
      sentence: "We don't drink tea in the evening",
      audio: "audio/tea.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/a970191_They_like_chocolate.png",
      words: ["They", "like", "chocolate"],
      sentence: "They like chocolate",
      audio: "audio/chocolate.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/o46619_the_children__vegetables.png",
      words: ["The", "children", "eat", "vegetables"],
      sentence: "The children eat vegetables",
      audio: "audio/vegetables.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/n830550_I_have_eggs_for_breakfast.png",
      words: ["I", "have", "eggs", "for", "breakfast"],
      sentence: "I have eggs for breakfast",
      audio: "audio/eggs.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/u679647_I_don39t_like_fish.png",
      words: ["I", "don't", "like", "fish"],
      sentence: "I don't like fish",
      audio: "audio/fish.mp3"
    },
    {
      image: "https://cdn.imgurl.ir/uploads/t71_I_don39t_have_sugar_in_my_coffee.png",
      words: ["I", "don't", "have", "sugar", "in", "my", "coffee"],
      sentence: "I don't have sugar in my coffee",
      audio: "audio/sugar.mp3"
    }
  ];

  /* Extra distractors drawn from the whole set */
  var EXTRA_POOL = [
    "We", "I", "They", "The", "children", "have", "eat", "drink", "like",
    "don't", "sandwiches", "rice", "tea", "chocolate", "vegetables", "eggs",
    "fish", "sugar", "coffee", "for", "in", "the", "my", "lunch", "breakfast", "evening"
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var index = 0;
  var slots = [];
  var pool = [];
  var used = {};
  var locked = false;
  var score = 0;
  var sfxCtx = null;
  var currentAudio = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
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

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }

  function playTap() {
    try { if (window.LASfx && LASfx.click) { LASfx.click(); return; } } catch (_) {}
    try { if (window.sfxTap) sfxTap(); } catch (_) {}
  }
  function playOk() {
    try { if (window.LASfx && LASfx.correct) { LASfx.correct(); return; } } catch (_) {}
    try { if (window.sfxCorrect) sfxCorrect(); } catch (_) {}
  }
  function playBad() {
    try { if (window.LASfx && LASfx.wrong) { LASfx.wrong(); return; } } catch (_) {}
    try { if (window.sfxWrong) sfxWrong(); } catch (_) {}
  }
  function playCelebrate() {
    try { if (window.LASfx && LASfx.celebrate) { LASfx.celebrate(); return; } } catch (_) {}
    try { if (window.sfxCelebrate) sfxCelebrate(); } catch (_) {}
  }

  function stopSentenceAudio() {
    if (currentAudio) {
      try {
        currentAudio.onended = null;
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playSentenceAudio(item, onDone) {
    stopSentenceAudio();
    if (!item || !item.audio) {
      if (onDone) onDone();
      return;
    }
    try {
      var a = new Audio(item.audio);
      currentAudio = a;
      var finished = false;
      function done() {
        if (finished) return;
        finished = true;
        currentAudio = null;
        if (onDone) onDone();
      }
      a.onended = done;
      a.onerror = done;
      a.play().catch(done);
      // safety: never hang more than 5s
      setTimeout(function () {
        if (!finished) done();
      }, 5000);
    } catch (_) {
      if (onDone) onDone();
    }
  }

  function buildPool(correctWords) {
    var need = 2; /* always exactly two extra distractor words */
    var distractors = [];
    var seen = {};
    correctWords.forEach(function (w) { seen[w.toLowerCase()] = true; });
    var candidates = shuffle(EXTRA_POOL.slice());
    for (var i = 0; i < candidates.length && distractors.length < need; i++) {
      var w = candidates[i];
      if (!seen[w.toLowerCase()]) {
        seen[w.toLowerCase()] = true;
        distractors.push(w);
      }
    }
    return shuffle(correctWords.concat(distractors));
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    phase = "play";
    startRound();
  }

  function startRound() {
    if (index >= TOTAL) {
      finishGame();
      return;
    }
    stopSentenceAudio();
    locked = false;
    var item = ITEMS[order[index]];
    slots = new Array(item.words.length).fill(null);
    pool = buildPool(item.words);
    used = {};
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
    playTap();
    slots[i] = label;
    used[label] = (used[label] || 0) + 1;
    updateUI();
  }

  function clearSlot(i) {
    if (locked || slots[i] == null) return;
    playTap();
    var label = slots[i];
    slots[i] = null;
    used[label] = Math.max(0, (used[label] || 1) - 1);
    updateUI();
  }

  function clearAll() {
    if (locked) return;
    playTap();
    slots = slots.map(function () { return null; });
    used = {};
    updateUI();
    var fb = document.getElementById("ps-fb");
    if (fb) { fb.textContent = ""; fb.className = "ps-fb"; }
  }

  function checkAnswer() {
    if (locked) return;
    var item = ITEMS[order[index]];
    var filled = slots.every(function (s) { return s != null; });
    if (!filled) {
      var fb = document.getElementById("ps-fb");
      if (fb) {
        fb.textContent = "Fill all the blanks first.";
        fb.className = "ps-fb is-hint";
      }
      return;
    }

    locked = true;
    var ok = slots.every(function (w, i) { return w === item.words[i]; });

    if (ok) {
      score++;
      playOk();
      var sent = document.getElementById("ps-slots");
      if (sent) sent.classList.add("is-correct");
      var fb = document.getElementById("ps-fb");
      if (fb) {
        fb.textContent = "Correct!";
        fb.className = "ps-fb is-ok";
      }
      // Play full sentence audio, then advance
      playSentenceAudio(item, function () {
        index++;
        startRound();
      });
    } else {
      playBad();
      var sent2 = document.getElementById("ps-slots");
      if (sent2) {
        sent2.classList.add("is-wrong");
        setTimeout(function () { sent2.classList.remove("is-wrong"); }, 500);
      }
      var fb2 = document.getElementById("ps-fb");
      if (fb2) {
        fb2.textContent = "Try again!";
        fb2.className = "ps-fb is-bad";
      }
      locked = false;
    }
  }

  function finishGame() {
    phase = "done";
    var stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.7) ? 2 : score >= Math.ceil(TOTAL * 0.4) ? 1 : 0;
    playCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    }

    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (e) {}
    }

    /* Fallback results if LAFinish not available */
    if (!window.LAFinish) {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Picture Sentences</span>' +
        '<span class="ps-badge">Done</span></header>' +
        '<section class="ps-done">' +
        '<div class="ps-hero" aria-hidden="true">' + (stars === 3 ? "🏆" : stars > 0 ? "🎉" : "💪") + "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="ps-sub">You got <strong>' + score + "</strong> / " + TOTAL + "</p>" +
        '<div class="ps-stars" aria-label="' + stars + ' stars">' +
        [0, 1, 2].map(function (i) {
          return '<span class="' + (i < stars ? "on" : "") + '">★</span>';
        }).join("") +
        "</div>" +
        '<button type="button" class="ps-btn" id="ps-again">Play again</button>' +
        '<a class="ps-link" href="../">Back to games</a>' +
        "</section>";
      document.getElementById("ps-again").onclick = startGame;
    }
  }

  function countInPool(label) {
    var n = 0;
    pool.forEach(function (w) { if (w === label) n++; });
    return n;
  }

  function updateUI() {
    var slotsEl = document.getElementById("ps-slots");
    if (slotsEl) {
      slotsEl.innerHTML = slots
        .map(function (w, i) {
          if (w == null) {
            return '<button type="button" class="ps-slot is-empty" data-slot="' + i + '" aria-label="Empty slot ' + (i + 1) + '"></button>';
          }
          return (
            '<button type="button" class="ps-slot is-filled" data-slot="' + i + '">' +
            escapeHtml(w) +
            "</button>"
          );
        })
        .join("");
      slotsEl.querySelectorAll(".ps-slot").forEach(function (btn) {
        btn.onclick = function () {
          clearSlot(+btn.getAttribute("data-slot"));
        };
      });
    }

    var poolEl = document.getElementById("ps-pool");
    if (poolEl) {
      var shown = {};
      poolEl.innerHTML = pool
        .map(function (label) {
          if (shown[label]) return "";
          shown[label] = true;
          var total = countInPool(label);
          var u = used[label] || 0;
          var disabled = u >= total;
          return (
            '<button type="button" class="ps-chip' +
            (disabled ? " is-used" : "") +
            '" data-label="' +
            escapeHtml(label) +
            '"' +
            (disabled ? " disabled" : "") +
            ">" +
            escapeHtml(label) +
            "</button>"
          );
        })
        .join("");
      poolEl.querySelectorAll(".ps-chip:not(.is-used)").forEach(function (btn) {
        btn.onclick = function () {
          pickChip(btn.getAttribute("data-label"));
        };
      });
    }

    var prog = document.getElementById("ps-prog");
    if (prog) prog.textContent = index + 1 + " / " + TOTAL;
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Picture Sentences</span>' +
        '<span class="ps-badge">5A</span></header>' +
        '<section class="ps-start">' +
        '<div class="ps-hero" aria-hidden="true">🖼️</div>' +
        "<h1>Picture Sentences</h1>" +
        '<p class="ps-sub">Look at the picture. Build the sentence with the word chips — one sentence at a time.</p>' +
        '<ul class="ps-tips">' +
        "<li>Tap chips to fill the blanks</li>" +
        "<li>Tap a blank to remove a word</li>" +
        "<li>" + TOTAL + " sentences · stars for accuracy</li>" +
        "</ul>" +
        '<button type="button" class="ps-btn" id="ps-start">Start</button>' +
        "</section>";
      document.getElementById("ps-start").onclick = startGame;
      return;
    }

    if (phase === "done") return;

    var item = ITEMS[order[index]];
    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Picture Sentences</span>' +
      '<span class="ps-badge" id="ps-prog">' + (index + 1) + " / " + TOTAL + "</span></header>" +
      '<section class="ps-play">' +
      '<div class="ps-pic-wrap">' +
      '<img class="ps-pic" src="' + escapeHtml(item.image) + '" alt="Sentence picture" decoding="async">' +
      "</div>" +
      '<div class="ps-slots" id="ps-slots" aria-label="Sentence slots"></div>' +
      '<div class="ps-pool" id="ps-pool" aria-label="Word chips"></div>' +
      '<div class="ps-actions">' +
      '<button type="button" class="ps-btn secondary" id="ps-clear">Clear</button>' +
      '<button type="button" class="ps-btn" id="ps-check">Check ✓</button>' +
      "</div>" +
      '<div class="ps-fb" id="ps-fb" aria-live="polite"></div>' +
      "</section>";

    document.getElementById("ps-clear").onclick = clearAll;
    document.getElementById("ps-check").onclick = checkAnswer;
    updateUI();
  }

  render();
})();
