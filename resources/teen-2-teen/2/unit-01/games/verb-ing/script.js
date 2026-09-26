/* Verb + -ing · Present Continuous · Teen2Teen 2 Unit 1 */
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

  var GAME_ID = "t2t2-u1-verb-ing";

  var POSITIVE = [
    { base: "watch", ing: "watching", display: "My brother is ___ a new series.", full: "My brother is watching a new series.", explain: "is / are / am + verb-ing" },
    { base: "text", ing: "texting", display: "Sarah is ___ her friends.", full: "Sarah is texting her friends.", explain: "is + texting" },
    { base: "work", ing: "working", display: "The students are ___ on a group project.", full: "The students are working on a group project.", explain: "are + working" },
    { base: "wear", ing: "wearing", display: "I'm ___ my favorite hoodie today.", full: "I'm wearing my favorite hoodie today.", explain: "am + wearing" },
    { base: "take", ing: "taking", display: "Tom is ___ a photo of his friends.", full: "Tom is taking a photo of his friends.", explain: "is + taking" }
  ];

  var NEGATIVE = [
    { base: "watch", ing: "watching", display: "I'm not ___ TV right now.", full: "I'm not watching TV right now.", explain: "am not + watching" },
    { base: "do", ing: "doing", display: "She isn't ___ her homework.", full: "She isn't doing her homework.", explain: "isn't + doing" },
    { base: "play", ing: "playing", display: "They aren't ___ computer games.", full: "They aren't playing computer games.", explain: "aren't + playing" },
    { base: "listen", ing: "listening", display: "He isn't ___ to the teacher.", full: "He isn't listening to the teacher.", explain: "isn't + listening" },
    { base: "study", ing: "studying", display: "We aren't ___ at the moment.", full: "We aren't studying at the moment.", explain: "aren't + studying" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var section = "pos";
  var questions = [];
  var qIndex = 0;
  var score = 0;
  var total = 0;
  var locked = false;

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
      '<span class="ai-title">Verb + -ing</span>' +
      '<span class="ai-badge">Unit 1</span></header>' +
      '<section class="ai-start">' +
      '<div class="ai-hero" aria-hidden="true">📱</div>' +
      '<h1>Verb + -ing</h1>' +
      '<p class="ai-sub">Present continuous right now!<br>Choose the <strong>-ing</strong> form of the verb.</p>' +
      '<div class="ai-rules">' +
      '<div class="ai-rule"><span class="ai-rule-chip am">watch</span><span>base form ✗</span></div>' +
      '<div class="ai-rule"><span class="ai-rule-chip is">watching</span><span>am / is / are + -ing ✓</span></div>' +
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
      '<span class="ai-title">Verb + -ing</span>' +
      '<span class="ai-badge">Nice!</span></header>' +
      '<section class="ai-phase">' +
      '<div class="ai-phase-icon" aria-hidden="true">🔥</div>' +
      '<h2>Awesome work!</h2>' +
      '<p>You got the positive sentences.<br>Now try the <strong>negative</strong> ones.</p>' +
      '<button type="button" class="ai-btn" id="ai-cont">CONTINUE</button>' +
      '</section>';
    document.getElementById("ai-cont").onclick = startNegative;
  }

  function renderPlay() {
    var q = questions[qIndex];
    if (!q) {
      if (section === "pos") { phase = "bridge"; render(); return; }
      endGame();
      return;
    }

    var done = section === "pos" ? qIndex : 5 + qIndex;
    var pct = Math.round((done / 10) * 100);
    var label = section === "pos"
      ? "Positive · " + (qIndex + 1) + "/5"
      : "Negative · " + (qIndex + 1) + "/5";

    var sentHtml = q.display.replace("___", '<span class="ai-blank">___</span>');
    var chips = shuffle([
      { label: q.base, cls: "neutral" },
      { label: q.ing, cls: "neutral" }
    ]);

    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Verb + -ing</span>' +
      '<span class="ai-badge">' + (section === "pos" ? "1/2" : "2/2") + "</span>" +
      '<div class="ai-stats">' +
      '<span class="ai-stat">SCORE ' + score + "/" + total + "</span>" +
      "</div></header>" +
      '<div class="ai-progress"><div class="ai-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="ai-qcard">' +
      '<div class="ai-qlabel">' + label + "</div>" +
      '<div class="ai-sentence">' + sentHtml + "</div>" +
      "</div>" +
      '<div class="ai-chips ai-chips-2" id="ai-chips">' +
      chips.map(function (c) {
        return '<button type="button" class="ai-chip ' + c.cls + '" data-ans="' + c.label + '">' + c.label + "</button>";
      }).join("") +
      "</div>" +
      '<div id="ai-fb"></div>';

    app.querySelectorAll(".ai-chip").forEach(function (btn) {
      btn.onclick = function () { checkAnswer(btn.getAttribute("data-ans")); };
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
        '<div class="ai-fb-exp">Use the <strong>-ing</strong> form: <strong>' + q.ing + "</strong></div>" +
        '<div class="ai-fb-sent">' + q.full + "</div>" +
        '<div class="ai-fb-exp">' + q.explain + "</div>" +
        "</div>";
    }
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect! You know when to use -ing."
      : accuracy >= 70
      ? "Great job! Keep practicing verb + -ing."
      : "Good try! Remember: am / is / are + verb-ing.";

    app.innerHTML =
      '<header class="ai-top">' +
      '<a class="ai-back" href="../" aria-label="Back">←</a>' +
      '<span class="ai-title">Verb + -ing</span>' +
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
    render();
  }

  function startNegative() {
    phase = "play";
    section = "neg";
    questions = shuffle(NEGATIVE);
    qIndex = 0;
    locked = false;
    render();
  }

  function checkAnswer(chosen) {
    if (locked) return;
    locked = true;
    sfxTap();
    var q = questions[qIndex];
    var ok = chosen === q.ing;
    total++;

    app.querySelectorAll(".ai-chip").forEach(function (b) {
      var a = b.getAttribute("data-ans");
      if (a === q.ing) b.classList.add("correct");
      else if (a === chosen && !ok) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    if (ok) { score++; sfxOk(); }
    else { sfxBad(); }

    showFeedback(ok, q);

    setTimeout(function () {
      qIndex++;
      locked = false;
      if (qIndex >= questions.length) {
        if (section === "pos") { phase = "bridge"; render(); }
        else { endGame(); }
      } else {
        render();
      }
    }, ok ? 1100 : 1400);
  }

  function endGame() {
    phase = "results";
    render();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || locked) return;
    if (e.key === "1" || e.key === "2") {
      var btns = app.querySelectorAll(".ai-chip");
      var idx = parseInt(e.key, 10) - 1;
      if (btns[idx]) checkAnswer(btns[idx].getAttribute("data-ans"));
    }
  });

  render();
})();
