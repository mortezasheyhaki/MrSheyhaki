/* Correct Sentence · Present Continuous · Teen2Teen 2 Unit 1 */
(function () {
  "use strict";

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

  var GAME_ID = "t2t2-u1-choose-sentence";

  /* options: [A, B], correct: 0 or 1 */
  var ITEMS = [
    {
      options: ["She is listen to music.", "She is listening to music."],
      correct: 1,
      explain: "Use listening (verb + -ing)."
    },
    {
      options: ["They are playing basketball.", "They are play basketball."],
      correct: 0,
      explain: "Use playing (verb + -ing)."
    },
    {
      options: ["He is text his friend.", "He is texting his friend."],
      correct: 1,
      explain: "Use texting (verb + -ing)."
    },
    {
      options: ["We are making a video.", "We are make a video."],
      correct: 0,
      explain: "Use making (verb + -ing)."
    },
    {
      options: ["I am chat with my friends.", "I am chatting with my friends."],
      correct: 1,
      explain: "Use chatting (verb + -ing)."
    },
    {
      options: ["She is wearing a new jacket.", "She wearing a new jacket."],
      correct: 0,
      explain: "Need is + wearing."
    },
    {
      options: ["They are study for the test.", "They are studying for the test."],
      correct: 1,
      explain: "Use studying (verb + -ing)."
    },
    {
      options: ["He is taking a selfie.", "He taking a selfie."],
      correct: 0,
      explain: "Need is + taking."
    },
    {
      options: ["We are watching a movie.", "We watching a movie."],
      correct: 0,
      explain: "Need are + watching."
    },
    {
      options: ["I am doing my homework.", "I doing my homework."],
      correct: 0,
      explain: "Need am + doing."
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var questions = [];
  var qIndex = 0;
  var score = 0;
  var total = 0;
  var locked = false;
  var displayOrder = [];

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
    else if (phase === "play") renderPlay();
    else if (phase === "results") renderResults();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Correct Sentence</span>' +
      '<span class="ai-badge">Unit 1</span></header>' +
      '<section class="ai-start">' +
      '<div class="ai-hero" aria-hidden="true">✅</div>' +
      '<h1>Correct Sentence</h1>' +
      '<p class="ai-sub">Which sentence is correct?<br>Tap the one with the right present continuous form.</p>' +
      '<div class="ai-rules">' +
      '<div class="ai-rule"><span class="ai-rule-chip am">✗</span><span>She is <strong>listen</strong> to music.</span></div>' +
      '<div class="ai-rule"><span class="ai-rule-chip is">✓</span><span>She is <strong>listening</strong> to music.</span></div>' +
      '</div>' +
      '<button type="button" class="ai-btn" id="ai-start">START</button>' +
      '</section>';
    document.getElementById("ai-start").onclick = startGame;
  }

  function renderPlay() {
    var q = questions[qIndex];
    if (!q) {
      endGame();
      return;
    }

    var pct = Math.round((qIndex / questions.length) * 100);
    var label = (qIndex + 1) + " / " + questions.length;

    /* Shuffle A/B display so correct isn't always top or bottom */
    displayOrder = shuffle([0, 1]);
    var letters = ["A", "B"];

    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Correct Sentence</span>' +
      '<span class="ai-badge">' + label + "</span>" +
      '<div class="ai-stats">' +
      '<span class="ai-stat">SCORE ' + score + "/" + total + "</span>" +
      "</div></header>" +
      '<div class="ai-progress"><div class="ai-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="cs-prompt">Which sentence is correct?</p>' +
      '<div class="cs-options" id="cs-options">' +
      displayOrder.map(function (optIdx, i) {
        return (
          '<button type="button" class="cs-opt" data-opt="' + optIdx + '">' +
          '<span class="cs-letter">' + letters[i] + "</span>" +
          '<span class="cs-text">' + q.options[optIdx] + "</span>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<div id="ai-fb"></div>';

    app.querySelectorAll(".cs-opt").forEach(function (btn) {
      btn.onclick = function () {
        checkAnswer(parseInt(btn.getAttribute("data-opt"), 10), btn);
      };
    });
  }

  function showFeedback(ok, q) {
    var area = document.getElementById("ai-fb");
    if (!area) return;
    var right = q.options[q.correct];
    if (ok) {
      area.innerHTML =
        '<div class="ai-fb ok">' +
        '<div class="ai-fb-title">✓ Nice!</div>' +
        '<div class="ai-fb-sent">' + right + "</div>" +
        '<div class="ai-fb-exp">' + q.explain + "</div>" +
        "</div>";
    } else {
      area.innerHTML =
        '<div class="ai-fb bad">' +
        '<div class="ai-fb-title">✗ Not quite</div>' +
        '<div class="ai-fb-sent">' + right + "</div>" +
        '<div class="ai-fb-exp">' + q.explain + "</div>" +
        "</div>";
    }
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect! You spot the correct forms every time."
      : accuracy >= 70
      ? "Great job! Keep practicing present continuous."
      : "Good try! Remember: am / is / are + verb-ing.";

    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Correct Sentence</span>' +
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
    questions = shuffle(ITEMS);
    qIndex = 0;
    score = 0;
    total = 0;
    locked = false;
    render();
  }

  function checkAnswer(optIdx) {
    if (locked) return;
    locked = true;
    sfxTap();
    var q = questions[qIndex];
    var ok = optIdx === q.correct;
    total++;

    app.querySelectorAll(".cs-opt").forEach(function (b) {
      var idx = parseInt(b.getAttribute("data-opt"), 10);
      if (idx === q.correct) b.classList.add("correct");
      else if (idx === optIdx && !ok) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    if (ok) { score++; sfxOk(); }
    else { sfxBad(); }

    showFeedback(ok, q);

    setTimeout(function () {
      qIndex++;
      locked = false;
      if (qIndex >= questions.length) endGame();
      else render();
    }, ok ? 1100 : 1500);
  }

  function endGame() {
    phase = "results";
    render();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || locked) return;
    if (e.key === "1" || e.key === "a" || e.key === "A") {
      var btns = app.querySelectorAll(".cs-opt");
      if (btns[0]) checkAnswer(parseInt(btns[0].getAttribute("data-opt"), 10));
    }
    if (e.key === "2" || e.key === "b" || e.key === "B") {
      var btns2 = app.querySelectorAll(".cs-opt");
      if (btns2[1]) checkAnswer(parseInt(btns2[1].getAttribute("data-opt"), 10));
    }
  });

  render();
})();
