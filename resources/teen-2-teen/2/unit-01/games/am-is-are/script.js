/* Am / Is / Are · Present Continuous · Teen2Teen 2 Unit 1 */
(function () {
  "use strict";

  /* === Shared UI sound effects === */
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

  var GAME_ID = "t2t2-u1-am-is-are";

  var POSITIVE = [
    {
      display: "I ___ doing my homework right now.",
      answer: "am",
      full: "I'm doing my homework right now.",
      explain: "I → am"
    },
    {
      display: "She ___ talking to her best friend.",
      answer: "is",
      full: "She's talking to her best friend.",
      explain: "She → is"
    },
    {
      display: "They ___ playing basketball after school.",
      answer: "are",
      full: "They're playing basketball after school.",
      explain: "They → are"
    },
    {
      display: "He ___ listening to music in his room.",
      answer: "is",
      full: "He's listening to music in his room.",
      explain: "He → is"
    },
    {
      display: "We ___ studying for the English test.",
      answer: "are",
      full: "We're studying for the English test.",
      explain: "We → are"
    }
  ];

  var NEGATIVE = [
    {
      display: "My brother ___ using his phone.",
      answer: "isn't",
      full: "My brother isn't using his phone.",
      explain: "he / she / it → isn't"
    },
    {
      display: "Sarah ___ talking to her friends.",
      answer: "isn't",
      full: "Sarah isn't talking to her friends.",
      explain: "she → isn't"
    },
    {
      display: "The students ___ working in the library.",
      answer: "aren't",
      full: "The students aren't working in the library.",
      explain: "they → aren't"
    },
    {
      display: "I ___ wearing my school uniform today.",
      answer: "'m not",
      full: "I'm not wearing my school uniform today.",
      explain: "I → 'm not"
    },
    {
      display: "They ___ waiting for the bus.",
      answer: "aren't",
      full: "They aren't waiting for the bus.",
      explain: "they → aren't"
    }
  ];

  var POS_CHIPS = [
    { label: "am", cls: "am" },
    { label: "is", cls: "is" },
    { label: "are", cls: "are" }
  ];
  var NEG_CHIPS = [
    { label: "'m not", cls: "amnot" },
    { label: "isn't", cls: "isnt" },
    { label: "aren't", cls: "arent" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; /* start | play | bridge | results */
  var section = "pos"; /* pos | neg */
  var questions = [];
  var qIndex = 0;
  var score = 0;
  var total = 0;
  var locked = false;
  var chips = POS_CHIPS;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sfxTap() {
    try { if (window.LASfx && LASfx.click) LASfx.click(); } catch (_) {}
    try { if (window.sfxTap) window.sfxTap(); } catch (_) {}
  }
  function sfxOk() {
    try { if (window.LASfx && LASfx.correct) LASfx.correct(); } catch (_) {}
    try { if (window.sfxCorrect) window.sfxCorrect(); } catch (_) {}
  }
  function sfxBad() {
    try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); } catch (_) {}
    try { if (window.sfxWrong) window.sfxWrong(); } catch (_) {}
  }
  function sfxCelebrate() {
    try { if (window.sfxCelebrate) window.sfxCelebrate(); } catch (_) {}
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "bridge") renderBridge();
    else if (phase === "play") renderPlay();
    else if (phase === "results") renderResults();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Am / Is / Are</span>' +
      '<span class="ai-badge">Unit 1</span></header>' +
      '<section class="ai-start">' +
      '<div class="ai-hero" aria-hidden="true">⚡</div>' +
      '<h1>Am · Is · Are</h1>' +
      '<p class="ai-sub">Present continuous right now!<br>Pick the correct verb for each sentence.</p>' +
      '<div class="ai-rules">' +
      '<div class="ai-rule"><span class="ai-rule-chip am">am</span><span>I → am</span></div>' +
      '<div class="ai-rule"><span class="ai-rule-chip is">is</span><span>he / she / it → is</span></div>' +
      '<div class="ai-rule"><span class="ai-rule-chip are">are</span><span>you / we / they → are</span></div>' +
      '</div>' +
      '<button type="button" class="ai-btn" id="ai-start">START</button>' +
      '</section>';
    document.getElementById("ai-start").onclick = startGame;
  }

  function renderBridge() {
    sfxCelebrate();
    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Am / Is / Are</span>' +
      '<span class="ai-badge">Nice!</span></header>' +
      '<section class="ai-phase">' +
      '<div class="ai-phase-icon" aria-hidden="true">🔥</div>' +
      '<h2>Awesome work!</h2>' +
      '<p>You got the positive forms.<br>Now try the <strong>negative</strong> ones — isn\'t, aren\'t, \'m not.</p>' +
      '<button type="button" class="ai-btn" id="ai-cont">CONTINUE</button>' +
      '</section>';
    document.getElementById("ai-cont").onclick = startNegative;
  }

  function renderPlay() {
    var q = questions[qIndex];
    if (!q) {
      if (section === "pos") {
        phase = "bridge";
        render();
        return;
      }
      endGame();
      return;
    }

    var done = (section === "pos" ? qIndex : 5 + qIndex);
    var all = 10;
    var pct = Math.round((done / all) * 100);
    var label = section === "pos"
      ? "Positive · " + (qIndex + 1) + "/5"
      : "Negative · " + (qIndex + 1) + "/5";

    var sentHtml = q.display.replace("___", '<span class="ai-blank">___</span>');

    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Am / Is / Are</span>' +
      '<span class="ai-badge">' + (section === "pos" ? "1/2" : "2/2") + "</span>" +
      '<div class="ai-stats">' +
      '<span class="ai-stat">SCORE ' + score + "/" + total + "</span>" +
      "</div></header>" +
      '<div class="ai-progress"><div class="ai-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="ai-qcard">' +
      '<div class="ai-qlabel">' + label + "</div>" +
      '<div class="ai-sentence">' + sentHtml + "</div>" +
      "</div>" +
      '<div class="ai-chips" id="ai-chips">' +
      chips.map(function (c) {
        return '<button type="button" class="ai-chip ' + c.cls + '" data-ans="' + c.label + '">' + c.label + "</button>";
      }).join("") +
      "</div>" +
      '<div id="ai-fb"></div>';

    app.querySelectorAll(".ai-chip").forEach(function (btn) {
      btn.onclick = function () { checkAnswer(btn.getAttribute("data-ans"), btn); };
    });
  }

  function showFeedback(ok, q) {
    var area = document.getElementById("ai-fb");
    if (!area) return;
    if (ok) {
      area.innerHTML =
        '<div class="ai-fb ok">' +
        '<div class="ai-fb-title">✓ Nice!</div>' +
        '<div class="ai-fb-sent">' + q.full + "</div>" +
        '<div class="ai-fb-exp">' + q.explain + "</div>" +
        "</div>";
    } else {
      area.innerHTML =
        '<div class="ai-fb bad">' +
        '<div class="ai-fb-title">✗ Not quite</div>' +
        '<div class="ai-fb-exp">The answer is <strong>' + q.answer + "</strong></div>" +
        '<div class="ai-fb-sent">' + q.full + "</div>" +
        '<div class="ai-fb-exp">' + q.explain + "</div>" +
        "</div>";
    }
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect! You really know am, is, and are."
      : accuracy >= 70
      ? "Great job! Keep practicing present continuous."
      : "Good try! Review I→am, he/she→is, you/we/they→are.";

    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Am / Is / Are</span>' +
      '<span class="ai-badge">Done</span></header>' +
      '<section class="ai-start">' +
      '<div class="ai-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="ai-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="ai-sub">' + msg + "</p>" +
      '<button type="button" class="ai-btn" id="ai-again">PLAY AGAIN</button>' +
      "</section>";

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
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    }

    document.getElementById("ai-again").onclick = startGame;
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) try { LAFinish.startTimer(); } catch (e) {}
    phase = "play";
    section = "pos";
    questions = shuffle(POSITIVE);
    qIndex = 0;
    score = 0;
    total = 0;
    locked = false;
    chips = POS_CHIPS;
    render();
  }

  function startNegative() {
    phase = "play";
    section = "neg";
    questions = shuffle(NEGATIVE);
    qIndex = 0;
    locked = false;
    chips = NEG_CHIPS;
    render();
  }

  function checkAnswer(chosen) {
    if (locked) return;
    locked = true;
    sfxTap();
    var q = questions[qIndex];
    var ok = chosen === q.answer;
    total++;

    app.querySelectorAll(".ai-chip").forEach(function (b) {
      var a = b.getAttribute("data-ans");
      if (a === q.answer) b.classList.add("correct");
      else if (a === chosen && !ok) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    if (ok) {
      score++;
      sfxOk();
    } else {
      sfxBad();
    }

    showFeedback(ok, q);

    setTimeout(function () {
      qIndex++;
      locked = false;
      if (qIndex >= questions.length) {
        if (section === "pos") {
          phase = "bridge";
          render();
        } else {
          endGame();
        }
      } else {
        render();
      }
    }, ok ? 1100 : 1400);
  }

  function endGame() {
    phase = "results";
    render();
  }

  /* Keyboard */
  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || locked) return;
    var key = e.key.toLowerCase();
    var map = section === "pos"
      ? { "1": "am", a: "am", "2": "is", i: "is", "3": "are", r: "are" }
      : { "1": "'m not", "2": "isn't", "3": "aren't" };
    var ans = map[key];
    if (ans) {
      var btn = app.querySelector('.ai-chip[data-ans="' + ans + '"]');
      if (btn) checkAnswer(ans);
    }
  });

  render();
})();
