/* Superlatives · AEF 1 Unit 10A
   See the adjective → choose the correct superlative form.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-superlatives";

  // adjective, correct, two wrong options
  var ITEMS = [
    { adj: "cold", correct: "the coldest", wrong: ["the most cold", "the cold"] },
    { adj: "high", correct: "the highest", wrong: ["the most high", "the high"] },
    { adj: "big", correct: "the biggest", wrong: ["the most big", "the bigger"] },
    { adj: "hot", correct: "the hottest", wrong: ["the most hot", "the hot"] },
    { adj: "dry", correct: "the driest", wrong: ["the most dry", "the dryer"] },
    { adj: "sunny", correct: "the sunniest", wrong: ["the most sunny", "the sunnier"] },
    { adj: "bored", correct: "the most bored", wrong: ["the boredest", "the boreder"] },
    { adj: "stressed", correct: "the most stressed", wrong: ["the stressedest", "the stresseder"] },
    { adj: "dangerous", correct: "the most dangerous", wrong: ["the dangerousest", "the more dangerous"] },
    { adj: "good", correct: "the best", wrong: ["the goodest", "the most good"] },
    { adj: "bad", correct: "the worst", wrong: ["the badest", "the most bad"] },
    { adj: "far", correct: "the farthest", wrong: ["the most far", "the farest"] },
    { adj: "old", correct: "the oldest", wrong: ["the most old", "the older"] },
    { adj: "popular", correct: "the most popular", wrong: ["the popularest", "the popularer"] },
    { adj: "tall", correct: "the tallest", wrong: ["the most tall", "the taller"] },
    { adj: "small", correct: "the smallest", wrong: ["the most small", "the smaller"] },
    { adj: "expensive", correct: "the most expensive", wrong: ["the expensivest", "the expensiver"] },
    { adj: "cheap", correct: "the cheapest", wrong: ["the most cheap", "the cheaper"] },
    { adj: "difficult", correct: "the most difficult", wrong: ["the difficultest", "the difficulter"] },
    { adj: "wet", correct: "the wettest", wrong: ["the most wet", "the weter"] },
    { adj: "near", correct: "the nearest", wrong: ["the most near", "the nearer"] },
    { adj: "clean", correct: "the cleanest", wrong: ["the most clean", "the cleaner"] },
    { adj: "dirty", correct: "the dirtiest", wrong: ["the most dirty", "the dirtier"] },
    { adj: "busy", correct: "the busiest", wrong: ["the most busy", "the busier"] },
    { adj: "wide", correct: "the widest", wrong: ["the most wide", "the wider"] },
    { adj: "comfortable", correct: "the most comfortable", wrong: ["the comfortablest", "the comfortabler"] },
    { adj: "noisy", correct: "the noisiest", wrong: ["the most noisy", "the noisier"] },
    { adj: "young", correct: "the youngest", wrong: ["the most young", "the younger"] },
    { adj: "beautiful", correct: "the most beautiful", wrong: ["the beautifulest", "the beautifuler"] }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var deck = [];
  var index = 0;
  var score = 0;
  var total = 0;
  var locked = false;

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
      correct: function () {
        tone(523, 0.1, "sine", 0.12, 0);
        tone(659, 0.12, "sine", 0.12, 0.08);
        tone(784, 0.18, "sine", 0.1, 0.16);
      },
      wrong: function () {
        tone(220, 0.12, "sawtooth", 0.06, 0);
        tone(180, 0.14, "sawtooth", 0.05, 0.08);
      },
      celebrate: function () {
        [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
      }
    };
  })();

  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }

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

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    deck = shuffle(ITEMS);
    index = 0;
    score = 0;
    total = 0;
    locked = false;
    phase = "play";
    render();
  }

  function choose(answer) {
    if (locked) return;
    locked = true;
    total++;
    var item = deck[index];
    var ok = answer === item.correct;
    var fb = document.getElementById("su-fb");
    var buttons = app.querySelectorAll(".su-choice");

    buttons.forEach(function (btn) {
      btn.disabled = true;
      var a = btn.getAttribute("data-answer");
      if (a === item.correct) btn.classList.add("is-ok");
      else if (a === answer && !ok) btn.classList.add("is-bad");
    });

    if (ok) {
      score++;
      sfxOk();
      if (fb) {
        fb.textContent = "Correct!";
        fb.className = "su-fb is-ok";
      }
      setTimeout(function () {
        index++;
        locked = false;
        if (index >= deck.length) endGame();
        else render();
      }, 850);
    } else {
      sfxBad();
      if (fb) {
        fb.textContent = "It's " + item.correct;
        fb.className = "su-fb is-bad";
      }
      setTimeout(function () {
        index++;
        locked = false;
        if (index >= deck.length) endGame();
        else render();
      }, 1200);
    }
  }

  function endGame() {
    phase = "results";
    render();
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="su-topbar">' +
      '<a class="su-back" href="../" aria-label="Back">←</a>' +
      '<span class="su-title">Superlatives</span>' +
      '<span class="su-badge">Unit 10A</span></header>' +
      '<section class="su-start">' +
      '<div class="su-hero" aria-hidden="true">🏆</div>' +
      '<h1>Superlatives</h1>' +
      '<p class="su-sub">Choose the correct superlative form for each adjective.</p>' +
      '<ul class="su-tips">' +
      '<li>' + ITEMS.length + ' adjectives</li>' +
      '<li>-est · most · irregular forms</li>' +
      '<li>One adjective at a time</li>' +
      '</ul>' +
      '<button type="button" class="su-btn" id="su-start">START</button>' +
      '</section>';
    document.getElementById("su-start").onclick = startGame;
  }

  function renderPlay() {
    var item = deck[index];
    var pct = Math.round((index / deck.length) * 100);
    var options = shuffle([item.correct].concat(item.wrong));

    app.innerHTML =
      '<header class="su-topbar">' +
      '<a class="su-back" href="../" aria-label="Back">←</a>' +
      '<span class="su-title">Superlatives</span>' +
      '<span class="su-badge">' + (index + 1) + "/" + deck.length + "</span>" +
      '<span class="su-stat">SCORE ' + score + "/" + total + "</span>" +
      "</header>" +
      '<div class="su-progress"><div class="su-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="su-card">' +
      '<p class="su-label">Adjective</p>' +
      '<p class="su-adj">' + escapeHtml(item.adj) + "</p>" +
      "</div>" +
      '<p class="su-prompt">Choose the correct superlative</p>' +
      '<div class="su-choices">' +
      options.map(function (opt) {
        return (
          '<button type="button" class="su-choice" data-answer="' +
          escapeHtml(opt) +
          '">' +
          escapeHtml(opt) +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<p class="su-fb" id="su-fb" aria-live="polite">Tap your answer</p>';

    app.querySelectorAll(".su-choice").forEach(function (btn) {
      btn.onclick = function () {
        choose(btn.getAttribute("data-answer"));
      };
    });
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg =
      accuracy >= 90
        ? "Superlative master!"
        : accuracy >= 70
        ? "Great work with -est and most!"
        : "Keep practising the irregular forms.";

    app.innerHTML =
      '<header class="su-topbar">' +
      '<a class="su-back" href="../" aria-label="Back">←</a>' +
      '<span class="su-title">Superlatives</span>' +
      '<span class="su-badge">Done</span></header>' +
      '<section class="su-start">' +
      '<div class="su-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="su-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="su-sub">' + msg + "</p>" +
      '<button type="button" class="su-btn" id="su-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          accuracy: accuracy,
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
        LAStars.save(GAME_ID, stars);
      } catch (e) {}
    }

    document.getElementById("su-again").onclick = startGame;
  }

  render();
})();
