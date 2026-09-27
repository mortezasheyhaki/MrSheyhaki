/* Write Superlatives · AEF 1 Unit 10A
   Complete each sentence with the correct superlative form.
   One sentence at a time. Type the answer, then Check.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-superlatives-write";

  // prompt with ___ for blank, base adjective, accepted answers (normalized later)
  var ITEMS = [
    {
      prompt: "Our house is ___ house on the street.",
      adj: "big",
      answers: ["the biggest", "biggest"]
    },
    {
      prompt: "For me, Saturday is ___ day of the week.",
      adj: "good",
      answers: ["the best", "best"]
    },
    {
      prompt: "My bedroom is ___ room in our house.",
      adj: "small",
      answers: ["the smallest", "smallest"]
    },
    {
      prompt: "Sit here – it’s ___ chair in the room.",
      adj: "comfortable",
      answers: ["the most comfortable", "most comfortable"]
    },
    {
      prompt: "My neighbors upstairs are ___ people in the world.",
      adj: "noisy",
      answers: ["the noisiest", "noisiest"]
    },
    {
      prompt: "My boss is ___ person I know.",
      adj: "stressed",
      answers: ["the most stressed", "most stressed"]
    },
    {
      prompt: "Sophie is ___ student in our English class.",
      adj: "young",
      answers: ["the youngest", "youngest"]
    },
    {
      prompt: "___ building in my town is the museum.",
      adj: "beautiful",
      answers: ["the most beautiful", "most beautiful"]
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
      tap: function () { tone(520, 0.05, "triangle", 0.07); },
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

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(user, answers) {
    var n = normalize(user);
    if (!n) return false;
    for (var i = 0; i < answers.length; i++) {
      if (n === normalize(answers[i])) return true;
    }
    // also accept with extra "the" or without
    if (n.indexOf("the ") === 0) {
      var without = n.slice(4);
      for (var j = 0; j < answers.length; j++) {
        if (without === normalize(answers[j]).replace(/^the\s+/, "")) return true;
      }
    }
    return false;
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

  function check() {
    if (locked) return;
    var input = document.getElementById("sw-input");
    if (!input) return;
    var user = input.value;
    if (!normalize(user)) return;

    locked = true;
    total++;
    var item = deck[index];
    var ok = isMatch(user, item.answers);
    var fb = document.getElementById("sw-fb");
    var checkBtn = document.getElementById("sw-check");
    if (checkBtn) checkBtn.disabled = true;

    if (ok) {
      score++;
      sfxOk();
      input.classList.remove("is-bad");
      input.classList.add("is-ok");
      if (fb) {
        fb.textContent = "Correct! " + item.answers[0];
        fb.className = "sw-fb is-ok";
      }
      setTimeout(function () {
        index++;
        locked = false;
        if (index >= deck.length) endGame();
        else render();
      }, 950);
    } else {
      sfxBad();
      input.classList.remove("is-ok");
      input.classList.add("is-bad");
      if (fb) {
        fb.textContent = "Not quite — try again.";
        fb.className = "sw-fb is-bad";
      }
      setTimeout(function () {
        input.classList.remove("is-bad");
        input.value = "";
        if (fb) {
          fb.textContent = "Type the superlative, then Check.";
          fb.className = "sw-fb";
        }
        locked = false;
        if (checkBtn) checkBtn.disabled = false;
        input.focus();
      }, 900);
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
      '<header class="sw-topbar">' +
      '<a class="sw-back" href="../" aria-label="Back">←</a>' +
      '<span class="sw-title">Write Superlatives</span>' +
      '<span class="sw-badge">Unit 10A</span></header>' +
      '<section class="sw-start">' +
      '<div class="sw-hero" aria-hidden="true">✍️</div>' +
      '<h1>Write Superlatives</h1>' +
      '<p class="sw-sub">Complete each sentence with the correct superlative form.</p>' +
      '<ul class="sw-tips">' +
      '<li>8 sentences from the book</li>' +
      '<li>Write the full form (e.g. the biggest)</li>' +
      '<li>One sentence at a time</li>' +
      '</ul>' +
      '<button type="button" class="sw-btn" id="sw-start">START</button>' +
      '</section>';
    document.getElementById("sw-start").onclick = startGame;
  }

  function renderPlay() {
    var item = deck[index];
    var progress = deck.length ? ((index / deck.length) * 100) : 0;
    var displayPrompt = escapeHtml(item.prompt).replace("___", '<span class="sw-blank">&nbsp;</span>');

    app.innerHTML =
      '<header class="sw-topbar">' +
      '<a class="sw-back" href="../" aria-label="Back">←</a>' +
      '<span class="sw-title">Write Superlatives</span>' +
      '<span class="sw-badge">' + (index + 1) + "/" + deck.length + "</span></header>" +
      '<div class="sw-progress"><div class="sw-progress-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="sw-card">' +
      '<p class="sw-prompt">' + displayPrompt + "</p>" +
      '<span class="sw-adj">(' + escapeHtml(item.adj) + ")</span>" +
      "</div>" +
      '<div class="sw-input-wrap">' +
      '<input type="text" id="sw-input" class="sw-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the superlative…">' +
      "</div>" +
      '<div class="sw-actions">' +
      '<button type="button" class="sw-btn secondary" id="sw-clear">Clear</button>' +
      '<button type="button" class="sw-btn" id="sw-check">Check</button>' +
      "</div>" +
      '<p class="sw-fb" id="sw-fb" aria-live="polite">Type the superlative, then Check.</p>' +
      '<p class="sw-hint">Example: the most dangerous · the biggest</p>';

    var input = document.getElementById("sw-input");
    document.getElementById("sw-clear").onclick = function () {
      input.value = "";
      input.focus();
    };
    document.getElementById("sw-check").onclick = check;
    input.onkeydown = function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    };
    input.focus();
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : accuracy >= 25 ? 1 : 0;
    var msg =
      accuracy >= 75
        ? "Superlative star!"
        : accuracy >= 50
        ? "Great job with the forms!"
        : "Keep practising those superlatives.";

    app.innerHTML =
      '<header class="sw-topbar">' +
      '<a class="sw-back" href="../" aria-label="Back">←</a>' +
      '<span class="sw-title">Write Superlatives</span>' +
      '<span class="sw-badge">Done</span></header>' +
      '<section class="sw-start">' +
      '<div class="sw-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="sw-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="sw-sub">' + msg + "</p>" +
      '<button type="button" class="sw-btn" id="sw-again">PLAY AGAIN</button>' +
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
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      } catch (e) {}
    }

    document.getElementById("sw-again").onclick = startGame;
  }

  render();
})();
