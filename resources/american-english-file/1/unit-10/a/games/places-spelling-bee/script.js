/* Places Spelling Bee · AEF 1 Unit 10A
   Look at the picture, listen, type the place word.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-places-spelling-bee";
  var CDN = "https://cdn.imgurl.ir/uploads/";
  var ROUND_COUNT = 10;

  var ALL = [
    { id: "bridge", word: "a bridge", answers: ["a bridge", "bridge"], image: CDN + "h18216_a_bridge.png", audio: CDN + "d503350_a_bridge.mp3" },
    { id: "bus-station", word: "a bus station", answers: ["a bus station", "bus station"], image: CDN + "p36317_a_bus_station.png", audio: CDN + "n21592_a_bus_station.mp3" },
    { id: "castle", word: "a castle", answers: ["a castle", "castle"], image: CDN + "r395416_a_castle.png", audio: CDN + "f541850_a_castle.mp3" },
    { id: "church", word: "a church", answers: ["a church", "church"], image: CDN + "w103625_a_church.png", audio: CDN + "z95099_a_church.mp3" },
    { id: "department-store", word: "a department store", answers: ["a department store", "department store"], image: CDN + "v83970_a_department_store.png", audio: CDN + "a002092_a_department_store.mp3" },
    { id: "hospital", word: "a hospital", answers: ["a hospital", "hospital"], image: CDN + "f294937_a_hospital.png", audio: CDN + "a919004_a_hospital.mp3" },
    { id: "hotel", word: "a hotel", answers: ["a hotel", "hotel"], image: CDN + "k52351_a_hotel.png", audio: "" },
    { id: "market", word: "a market", answers: ["a market", "market"], image: CDN + "w132251_a_market.png", audio: CDN + "s812708_a_market.mp3" },
    { id: "museum", word: "a museum", answers: ["a museum", "museum"], image: CDN + "z93575_a_museum.png", audio: CDN + "k084715_a_museum.mp3" },
    { id: "park", word: "a park", answers: ["a park", "park"], image: CDN + "i966284_a_park.png", audio: CDN + "c58663_a_park.mp3" },
    { id: "parking-lot", word: "a parking lot", answers: ["a parking lot", "parking lot"], image: CDN + "j382816_a_parking_lot.png", audio: CDN + "w042351_a_parking_lot_2.mp3" },
    { id: "pharmacy", word: "a pharmacy", answers: ["a pharmacy", "pharmacy"], image: CDN + "n44231_a_pharmacy.png", audio: CDN + "t918024_a_pharmacy.mp3" },
    { id: "police-station", word: "a police station", answers: ["a police station", "police station"], image: CDN + "d996395_a_police_station.png", audio: CDN + "v586632_a_police_station.mp3" },
    { id: "post-office", word: "a post office", answers: ["a post office", "post office"], image: CDN + "i45672_a_post_office.png", audio: CDN + "o718529_a_post_office.mp3" },
    { id: "river", word: "a river", answers: ["a river", "river"], image: CDN + "q794912_a_river.png", audio: CDN + "w59975_a_river.mp3" },
    { id: "road", word: "a road", answers: ["a road", "road"], image: CDN + "l34840_a_road.png", audio: CDN + "e692892_a_road.mp3" },
    { id: "shopping-mall", word: "a shopping mall", answers: ["a shopping mall", "shopping mall"], image: CDN + "k10295_a_shopping_mall.png", audio: CDN + "s33410_a_shopping_mall.mp3" },
    { id: "square", word: "a square", answers: ["a square", "square"], image: CDN + "q450339_a_square.png", audio: CDN + "c067424_a_square.mp3" },
    { id: "street", word: "a street", answers: ["a street", "street"], image: CDN + "i942216_a_street.png", audio: CDN + "90876_a_street.mp3" },
    { id: "supermarket", word: "a supermarket", answers: ["a supermarket", "supermarket"], image: CDN + "k75207_a_supermarket.png", audio: CDN + "x131344_a_supermarket.mp3" },
    { id: "theater", word: "a theater", answers: ["a theater", "theater", "a theatre", "theatre"], image: CDN + "r05545_a_ther.png", audio: CDN + "h926231_a_ther.mp3" },
    { id: "town-hall", word: "a town hall", answers: ["a town hall", "town hall"], image: CDN + "x4057_a_town_hall.png", audio: CDN + "u194392_a_town_hall.mp3" },
    { id: "train-station", word: "a train station", answers: ["a train station", "train station"], image: CDN + "j204995_a_train_station.png", audio: CDN + "w332684_a_train_sation.mp3" },
    { id: "zoo", word: "a zoo", answers: ["a zoo", "zoo"], image: CDN + "e384525_a_zoo.png", audio: CDN + "s762603_a_zoo.mp3" },
    { id: "art-gallery", word: "an art gallery", answers: ["an art gallery", "art gallery", "a art gallery"], image: CDN + "l009706_an_art_gallery.png", audio: CDN + "t474039_an_art_gallery.mp3" }
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
    s = String(s || "").toLowerCase().trim();
    s = s.replace(/[’']/g, "'");
    s = s.replace(/[.?!,:;]+/g, "");
    s = s.replace(/\s+/g, " ").trim();
    return s;
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
    var btn = document.getElementById("sb-listen");
    if (btn) btn.classList.remove("is-playing");
  }

  function playWord() {
    var item = deck[index];
    if (!item || !item.audio) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = document.getElementById("sb-listen");
    if (btn) btn.classList.add("is-playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("is-playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("is-playing");
      currentAudio = null;
    };
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
    var el = document.getElementById("sb-combo");
    if (!el) return;
    el.className = "sb-combo is-on is-bump";
    el.innerHTML = '<span class="sb-combo-fire">🔥</span> x' + streak + " <em>" + comboLabel(streak) + "</em>";
    if (streak >= 5) el.classList.add("is-hot");
    var pop = document.createElement("span");
    pop.className = "sb-plus"; pop.textContent = "+1";
    el.appendChild(pop);
  }
  function breakCombo() {
    var el = document.getElementById("sb-combo");
    if (!el) return;
    el.className = "sb-combo is-lost";
    el.textContent = "Combo lost";
  }
  function fillMeters(afterCorrect) {
    var p = document.querySelector(".sb-progress-fill");
    var r = document.querySelector(".sb-reward-fill");
    if (p) p.style.width = Math.round(((index + (afterCorrect ? 1 : 0)) / deck.length) * 100) + "%";
    if (r) r.style.width = (afterCorrect && score % 10 === 0 ? 100 : (score % 10) * 10) + "%";
  }
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, CHEERS.length - 1)];
    sfxMilestone();
    var ov = document.createElement("div");
    ov.className = "sb-burst";
    var conf = "";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"];
    for (var i = 0; i < 44; i++) {
      conf += '<i style="left:' + (Math.random() * 100) + "%;background:" + cols[i % cols.length] +
        ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" +
        (1.3 + Math.random() * 0.9).toFixed(2) + "s;transform:rotate(" + Math.round(Math.random() * 360) + 'deg)"></i>';
    }
    ov.innerHTML = conf +
      '<div class="sb-burst-card"><div class="sb-burst-emoji">' + c.e + '</div>' +
      '<div class="sb-burst-title">' + c.t + '</div><div class="sb-burst-sub">' + c.s + "</div></div>";
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
      var pf = document.querySelector(".sb-progress-fill"), r = document.querySelector(".sb-reward-fill");
      if (pf) pf.style.width = p + "%";
      if (r) r.style.width = ((score % 10) * 10) + "%";
      lastPct = p; lastRw = (score % 10) * 10;
    }, 40);
    return '<div class="sb-meta"><span id="sb-combo" class="sb-combo' + (streak >= 2 ? " is-on" + (streak >= 5 ? " is-hot" : "") : "") + '">' +
      (streak >= 2 ? '<span class="sb-combo-fire">🔥</span> x' + streak + " <em>" + comboLabel(streak) + "</em>" : "") + "</span>" +
      '<span class="sb-reward" title="Next reward at 10 correct"><span class="sb-reward-ico">🎁</span>' +
      '<span class="sb-reward-bar"><span class="sb-reward-fill" style="width:' + lastRw + '%"></span></span></span></div>';
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    deck = shuffle(ALL).slice(0, ROUND_COUNT);
    index = 0;
    score = 0;
    total = 0;
    missed = false;
    FXreset();
    locked = false;
    phase = "play";
    render();
    setTimeout(playWord, 280);
  }

  function check() {
    if (locked) return;
    var input = document.getElementById("sb-input");
    if (!input) return;
    var user = input.value;
    if (!normalize(user)) return;

    locked = true;
    var item = deck[index];
    var ok = isMatch(user, item.answers);
    var fb = document.getElementById("sb-fb");
    var checkBtn = document.getElementById("sb-check");
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
        fb.textContent = "Correct! " + item.word;
        fb.className = "sb-fb is-ok";
      }
      setTimeout(function () {
        index++;
        locked = false;
        if (index >= deck.length) endGame();
        else {
          render();
          setTimeout(playWord, 220);
        }
      }, 900);
    } else {
      sfxBad();
      missed = true;
      FXbad();
      input.classList.remove("is-ok");
      input.classList.add("is-bad");
      if (fb) {
        fb.textContent = "Try again — listen and spell carefully.";
        fb.className = "sb-fb is-bad";
      }
      setTimeout(function () {
        input.classList.remove("is-bad");
        input.value = "";
        if (fb) {
          fb.textContent = "Type the place word, then Check.";
          fb.className = "sb-fb";
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

  function speakerSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a3.5 3.5 0 0 0-1.8-3.05v6.1A3.5 3.5 0 0 0 16.5 12zM14 5.05v1.6a6 6 0 0 1 0 10.7v1.6A7.5 7.5 0 0 0 14 5.05z"/></svg>';
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="sb-topbar">' +
      '<a class="sb-back" href="../" aria-label="Back">←</a>' +
      '<span class="sb-title">Places Spelling Bee</span>' +
      '<span class="sb-badge">Unit 10A</span></header>' +
      '<section class="sb-start">' +
      '<div class="sb-hero" aria-hidden="true">🐝</div>' +
      '<h1>Places Spelling Bee</h1>' +
      '<p class="sb-sub">Look at the picture, listen, and type the place word.</p>' +
      '<ul class="sb-tips">' +
      '<li>' + ROUND_COUNT + ' places each game</li>' +
      '<li>Include a / an when you can</li>' +
      '<li>Spelling must be correct</li>' +
      '</ul>' +
      '<button type="button" class="sb-btn" id="sb-start">START</button>' +
      '</section>';
    document.getElementById("sb-start").onclick = startGame;
  }

  function renderPlay() {
    var item = deck[index];
    var pct = Math.round((index / deck.length) * 100);

    app.innerHTML =
      '<header class="sb-topbar">' +
      '<a class="sb-back" href="../" aria-label="Back">←</a>' +
      '<span class="sb-title">Places Spelling Bee</span>' +
      '<span class="sb-badge">' + (index + 1) + "/" + deck.length + "</span>" +
      '<span class="sb-stat">SCORE ' + score + "/" + total + "</span>" +
      "</header>" +
      '<div class="sb-progress"><div class="sb-progress-fill" style="width:' + lastPct + '%"></div></div>' +
      FXmeta(pct) +
      '<div class="sb-card">' +
      '<div class="sb-picwrap"><img class="sb-pic" src="' + item.image + '" alt="" draggable="false"></div>' +
      (item.audio
        ? '<button type="button" class="sb-listen" id="sb-listen" aria-label="Play word">' + speakerSvg() + " Hear the word</button>"
        : '<p class="sb-hint" style="margin:0">No audio for this one — spell what you see.</p>') +
      "</div>" +
      '<p class="sb-prompt">Spell the place</p>' +
      '<div class="sb-input-wrap">' +
      '<input type="text" class="sb-input" id="sb-input" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Type here…">' +
      "</div>" +
      '<div class="sb-actions">' +
      '<button type="button" class="sb-btn secondary" id="sb-clear">Clear</button>' +
      '<button type="button" class="sb-btn" id="sb-check">Check</button>' +
      "</div>" +
      '<p class="sb-fb" id="sb-fb" aria-live="polite">Type the place word, then Check.</p>' +
      '<p class="sb-hint">Example: a park · an art gallery</p>';

    var input = document.getElementById("sb-input");
    var listenBtn = document.getElementById("sb-listen");
    if (listenBtn) listenBtn.onclick = playWord;
    document.getElementById("sb-clear").onclick = function () {
      input.value = "";
      input.focus();
    };
    document.getElementById("sb-check").onclick = check;
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
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg =
      accuracy >= 90
        ? "Spelling champion!"
        : accuracy >= 70
        ? "Great spelling!"
        : "Keep practising those place words.";

    app.innerHTML =
      '<header class="sb-topbar">' +
      '<a class="sb-back" href="../" aria-label="Back">←</a>' +
      '<span class="sb-title">Places Spelling Bee</span>' +
      '<span class="sb-badge">Done</span></header>' +
      '<section class="sb-start">' +
      '<div class="sb-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="sb-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="sb-sub">Best combo: <strong>🔥 x' + bestStreak + "</strong></p>" +
      '<p class="sb-sub">' + msg + "</p>" +
      '<button type="button" class="sb-btn" id="sb-again">PLAY AGAIN</button>' +
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

    document.getElementById("sb-again").onclick = startGame;
  }

  ALL.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
