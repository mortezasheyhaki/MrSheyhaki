/* Listen & Write · AEF 1 Unit 10A
   Listen to each superlative question, then type it.
   Play button style from places-sound-match-picture.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-listen-and-write";

  var ITEMS = [
    {
      audio: "https://cdn.imgurl.ir/uploads/y722789_what39s_the_noisiest_city_in_the_world.mp3",
      answers: [
        "what's the noisiest city in the world",
        "whats the noisiest city in the world",
        "what is the noisiest city in the world"
      ],
      display: "What's the noisiest city in the world?"
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/o04736_What39s_the_driest_city_in_the_US.mp3",
      answers: [
        "what's the driest city in the us",
        "whats the driest city in the us",
        "what is the driest city in the us",
        "what's the driest city in the u.s.",
        "what's the driest city in the u.s",
        "whats the driest city in the u.s."
      ],
      display: "What's the driest city in the US?"
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/q253270_Which_US_city_has_the_biggest_population.mp3",
      answers: [
        "which us city has the biggest population",
        "which u.s. city has the biggest population",
        "which u.s city has the biggest population",
        "which us city has the biggest population?"
      ],
      display: "Which US city has the biggest population?"
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/f269337_What39s_the_highest_capital_city_in_the_world.mp3",
      answers: [
        "what's the highest capital city in the world",
        "whats the highest capital city in the world",
        "what is the highest capital city in the world"
      ],
      display: "What's the highest capital city in the world?"
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/q439236_Which_city_has_the_busiest_airport_in_the_world.mp3",
      answers: [
        "which city has the busiest airport in the world",
        "which city has the busiest airport in the world?"
      ],
      display: "Which city has the busiest airport in the world?"
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/s331735_Which_city_has_the_worst_traffic_in_the_world.mp3",
      answers: [
        "which city has the worst traffic in the world",
        "which city has the worst traffic in the world?"
      ],
      display: "Which city has the worst traffic in the world?"
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var deck = [];
  var index = 0;
  var score = 0;
  var total = 0;
  var missed = false; // wrong attempt on the current round
  var locked = false;
  var currentAudio = null;

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

  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
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
      .replace(/[?.!,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(user, answers) {
    var n = normalize(user);
    if (!n) return false;
    for (var i = 0; i < answers.length; i++) {
      if (n === normalize(answers[i])) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    var btn = document.getElementById("lw-play");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    var item = deck[index];
    if (!item || !item.audio) return;
    stopAudio();
    sfxTap();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = document.getElementById("lw-play");
    if (btn) btn.classList.add("is-playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("is-playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function playIconSvg() {
    return '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  }

  var streak = 0, bestStreak = 0, lastPct = 0, lastRw = 0;
  var CHEERS = [
    { e: "🌟", t: "Awesome!", s: "10 correct answers!" },
    { e: "🚀", t: "Superstar!", s: "20 correct — unstoppable!" },
    { e: "👑", t: "Legend!", s: "30 correct — the best of the best!" }
  ];
  /* ---------- combo + milestone effects ---------- */
  var fxCtx = null;
  function fxTone(f, d, type, v, when) {
    try {
      if (!fxCtx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; fxCtx = new AC(); }
      if (fxCtx.state === "suspended") fxCtx.resume();
      var t0 = fxCtx.currentTime + (when || 0), o = fxCtx.createOscillator(), g = fxCtx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.1, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
      o.connect(g); g.connect(fxCtx.destination); o.start(t0); o.stop(t0 + d + 0.03);
    } catch (_) {}
  }
  function sfxCombo(n) {
    var base = 660 * Math.pow(1.0595, Math.min(n, 12));
    fxTone(base, 0.09, "triangle", 0.09, 0);
    fxTone(base * 1.5, 0.14, "triangle", 0.08, 0.07);
  }
  function sfxMilestone() {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { fxTone(f, 0.22, "triangle", 0.11, i * 0.09); });
    fxTone(1568, 0.6, "sine", 0.09, 0.5);
    fxTone(392, 0.7, "sine", 0.07, 0.45);
  }
  function sfxBreak() { fxTone(300, 0.12, "sawtooth", 0.05, 0); fxTone(200, 0.2, "sawtooth", 0.05, 0.09); }

  function comboLabel(n) {
    return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : "";
  }
  function bumpCombo() {
    var el = document.getElementById("lw-combo");
    if (!el) return;
    el.className = "lw-combo is-on is-bump";
    el.innerHTML = '<span class="lw-combo-fire">🔥</span> x' + streak + " <em>" + comboLabel(streak) + "</em>";
    if (streak >= 5) el.classList.add("is-hot");
    var pop = document.createElement("span");
    pop.className = "lw-plus"; pop.textContent = "+1";
    el.appendChild(pop);
  }
  function breakCombo() {
    var el = document.getElementById("lw-combo");
    if (!el) return;
    el.className = "lw-combo is-lost";
    el.textContent = "Combo lost";
  }
  function fillMeters(afterCorrect) {
    var p = document.querySelector(".lw-progress-fill");
    var r = document.querySelector(".lw-reward-fill");
    if (p) p.style.width = Math.round(((index + (afterCorrect ? 1 : 0)) / deck.length) * 100) + "%";
    if (r) r.style.width = (afterCorrect && score % 10 === 0 ? 100 : (score % 10) * 10) + "%";
  }
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, CHEERS.length - 1)];
    sfxMilestone();
    var ov = document.createElement("div");
    ov.className = "lw-burst";
    var conf = "";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"];
    for (var i = 0; i < 44; i++) {
      conf += '<i style="left:' + (Math.random() * 100) + "%;background:" + cols[i % cols.length] +
        ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" +
        (1.3 + Math.random() * 0.9).toFixed(2) + "s;transform:rotate(" + Math.round(Math.random() * 360) + 'deg)"></i>';
    }
    ov.innerHTML = conf +
      '<div class="lw-burst-card"><div class="lw-burst-emoji">' + c.e + '</div>' +
      '<div class="lw-burst-title">' + c.t + '</div><div class="lw-burst-sub">' + c.s + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }

  function FXok(firstTry) {
    if (firstTry) {
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      if (streak >= 2) sfxCombo(streak);
      bumpCombo();
    }
    fillMeters(true);
    if (firstTry && score % 10 === 0) setTimeout(function () { celebrate(score); }, 250);
  }
  function FXbad() {
    if (streak >= 3) sfxBreak();
    var had = streak >= 2;
    streak = 0;
    if (had) breakCombo();
  }
  function FXreset() { streak = 0; bestStreak = 0; lastPct = 0; lastRw = 0; }
  function FXmeta(p) {
    setTimeout(function () {
      var pf = document.querySelector(".lw-progress-fill"), r = document.querySelector(".lw-reward-fill");
      if (pf) pf.style.width = p + "%";
      if (r) r.style.width = ((score % 10) * 10) + "%";
      lastPct = p; lastRw = (score % 10) * 10;
    }, 40);
    return '<div class="lw-meta"><span id="lw-combo" class="lw-combo' + (streak >= 2 ? " is-on" + (streak >= 5 ? " is-hot" : "") : "") + '">' +
      (streak >= 2 ? '<span class="lw-combo-fire">🔥</span> x' + streak + " <em>" + comboLabel(streak) + "</em>" : "") + "</span>" +
      '<span class="lw-reward" title="Next reward at 10 correct"><span class="lw-reward-ico">🎁</span>' +
      '<span class="lw-reward-bar"><span class="lw-reward-fill" style="width:' + lastRw + '%"></span></span></span></div>';
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    deck = shuffle(ITEMS);
    index = 0;
    score = 0;
    total = 0;
    missed = false;
    FXreset();
    locked = false;
    phase = "play";
    render();
    setTimeout(playAudio, 320);
  }

  function check() {
    if (locked) return;
    var input = document.getElementById("lw-input");
    if (!input) return;
    var user = input.value;
    if (!normalize(user)) return;

    locked = true;
    var item = deck[index];
    var ok = isMatch(user, item.answers);
    var fb = document.getElementById("lw-fb");
    var checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;

    if (ok) {
      var firstTry = !missed;
      if (firstTry) score++;
      total++;
      missed = false;
      FXok(firstTry);
      sfxOk();
      input.classList.remove("is-bad");
      input.classList.add("is-ok");
      if (fb) {
        fb.textContent = "Correct! " + item.display;
        fb.className = "lw-fb is-ok";
      }
      setTimeout(function () {
        index++;
        locked = false;
        if (index >= deck.length) endGame();
        else {
          render();
          setTimeout(playAudio, 280);
        }
      }, 1000);
    } else {
      sfxBad();
      missed = true;
      FXbad();
      input.classList.remove("is-ok");
      input.classList.add("is-bad");
      if (fb) {
        fb.textContent = "Try again — listen carefully.";
        fb.className = "lw-fb is-bad";
      }
      setTimeout(function () {
        input.classList.remove("is-bad");
        input.value = "";
        if (fb) {
          fb.textContent = "Type what you hear, then Check.";
          fb.className = "lw-fb";
        }
        locked = false;
        if (checkBtn) checkBtn.disabled = false;
        input.focus();
      }, 900);
    }
  }

  function endGame() {
    stopAudio();
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
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Listen & Write</span>' +
      '<span class="lw-badge">Unit 10A</span></header>' +
      '<section class="lw-start">' +
      '<div class="lw-hero" aria-hidden="true">🎧</div>' +
      '<h1>Listen & Write</h1>' +
      '<p class="lw-sub">Listen to each question and write what you hear.</p>' +
      '<ul class="lw-tips">' +
      '<li>6 superlative questions</li>' +
      '<li>Tap the purple button to listen again</li>' +
      '<li>One sentence at a time</li>' +
      '</ul>' +
      '<button type="button" class="lw-btn" id="lw-start">START</button>' +
      '</section>';
    document.getElementById("lw-start").onclick = startGame;
  }

  function renderPlay() {
    var progress = deck.length ? (index / deck.length) * 100 : 0;

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Listen & Write</span>' +
      '<span class="lw-badge">' + (index + 1) + "/" + deck.length + "</span></header>" +
      '<div class="lw-progress"><div class="lw-progress-fill" style="width:' + lastPct + '%"></div></div>' +
      FXmeta(progress) +
      '<div class="lw-listen">' +
      '<button type="button" class="lw-play-btn" id="lw-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      playIconSvg() +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="lw-listen-text">' +
      '<p class="lw-eyebrow">Listen</p>' +
      '<p class="lw-listen-hint">Tap to play the question</p>' +
      "</div></div>" +
      '<div class="lw-input-wrap">' +
      '<input type="text" id="lw-input" class="lw-input" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" placeholder="Type what you hear…">' +
      "</div>" +
      '<div class="lw-actions">' +
      '<button type="button" class="lw-btn secondary" id="lw-clear">Clear</button>' +
      '<button type="button" class="lw-btn" id="lw-check">Check</button>' +
      "</div>" +
      '<p class="lw-fb" id="lw-fb" aria-live="polite">Type what you hear, then Check.</p>' +
      '<p class="lw-hint">Example: What\'s the biggest city in the world?</p>';

    document.getElementById("lw-play").onclick = playAudio;
    var input = document.getElementById("lw-input");
    document.getElementById("lw-clear").onclick = function () {
      input.value = "";
      input.focus();
    };
    document.getElementById("lw-check").onclick = check;
    input.onkeydown = function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    };
    input.focus();
  }

  function renderResults() {
    var qTotal = deck.length;
    var accuracy = qTotal ? Math.round((score / qTotal) * 100) : 0;
    var stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : accuracy >= 25 ? 1 : 0;
    var msg =
      accuracy >= 75
        ? "Perfect listening!"
        : accuracy >= 50
        ? "Great ear for superlatives!"
        : "Keep practising — listen again.";

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Listen & Write</span>' +
      '<span class="lw-badge">Done</span></header>' +
      '<section class="lw-start">' +
      '<div class="lw-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="lw-sub">You got <strong>' + score + "</strong> of <strong>" + qTotal + "</strong> correct.</p>" +
      '<p class="lw-sub">Best combo: <strong>🔥 x' + bestStreak + "</strong></p>" +
      '<p class="lw-sub">' + msg + "</p>" +
      '<button type="button" class="lw-btn" id="lw-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: qTotal,
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

    document.getElementById("lw-again").onclick = startGame;
  }

  render();
})();
