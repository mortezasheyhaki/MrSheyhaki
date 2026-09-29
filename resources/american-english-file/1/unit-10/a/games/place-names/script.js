/* Place Names · AEF 1 Unit 10A
   Complete the sentence with Bridge / Castle / Gallery / Park / Square / Street
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-place-names";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var WORDS = [
    { id: "bridge",  label: "Bridge",  audio: CDN + "11295_bridge.mp3" },
    { id: "castle",  label: "Castle",  audio: CDN + "l860993_castle.mp3" },
    { id: "gallery", label: "Gallery", audio: CDN + "y329432_gallery.mp3" },
    { id: "park",    label: "Park",    audio: CDN + "m43426_central_park.mp3" },
    { id: "square",  label: "Square",  audio: CDN + "n291755_square.mp3" },
    { id: "street",  label: "Street",  audio: CDN + "b542529_street.mp3" }
  ];

  var ITEMS = [
    {
      id: 1,
      before: "The Brooklyn ",
      after: " connects Manhattan and Brooklyn.",
      answer: "bridge",
      image: CDN + "w23326_Brooklyn_Bridge.png"
    },
    {
      id: 2,
      before: "Downing ",
      after: " is where the British prime minister lives.",
      answer: "street",
      image: CDN + "s945103_Downing_Street.png"
    },
    {
      id: 3,
      before: "Windsor ",
      after: " is the royal family's weekend home and the largest inhabited castle in the world.",
      answer: "castle",
      image: CDN + "m11184_Windsor_Castle.png"
    },
    {
      id: 4,
      before: "Central ",
      after: " is a green space in the middle of New York.",
      answer: "park",
      image: CDN + "n043903_Central_Park.png"
    },
    {
      id: 5,
      before: "The National ",
      after: " is London's most famous art museum.",
      answer: "gallery",
      image: CDN + "o179510_National_Gallery.png"
    },
    {
      id: 6,
      before: "Times ",
      after: " is the center of New York's theater district.",
      answer: "square",
      image: CDN + "h449778_Times_Square.png"
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var index = 0;
  var score = 0;
  var total = 0;
  var missed = false; // wrong attempt on the current round
  var selected = null;
  var locked = false;
  var currentAudio = null;

  /* ── SFX ── */
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

  function wordById(id) {
    for (var i = 0; i < WORDS.length; i++) {
      if (WORDS[i].id === id) return WORDS[i];
    }
    return null;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playAnswerAudio(wordId, onDone) {
    var w = wordById(wordId);
    if (!w || !w.audio) {
      if (onDone) onDone();
      return;
    }
    stopAudio();
    var a = new Audio(w.audio);
    currentAudio = a;
    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      if (currentAudio === a) currentAudio = null;
      if (onDone) onDone();
    }
    a.onended = done;
    a.onerror = done;
    a.play().catch(function () { done(); });
    // Safety fallback if audio never ends (e.g. missing file)
    setTimeout(done, 8000);
  }

  function currentItem() {
    return order[index];
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
    var el = document.getElementById("pn-combo");
    if (!el) return;
    el.className = "pn-combo is-on is-bump";
    el.innerHTML = '<span class="pn-combo-fire">🔥</span> x' + streak + " <em>" + comboLabel(streak) + "</em>";
    if (streak >= 5) el.classList.add("is-hot");
    var pop = document.createElement("span");
    pop.className = "pn-plus"; pop.textContent = "+1";
    el.appendChild(pop);
  }
  function breakCombo() {
    var el = document.getElementById("pn-combo");
    if (!el) return;
    el.className = "pn-combo is-lost";
    el.textContent = "Combo lost";
  }
  function fillMeters(afterCorrect) {
    var p = document.querySelector(".pn-progress-fill");
    var r = document.querySelector(".pn-reward-fill");
    if (p) p.style.width = Math.round(((index + (afterCorrect ? 1 : 0)) / order.length) * 100) + "%";
    if (r) r.style.width = (afterCorrect && score % 10 === 0 ? 100 : (score % 10) * 10) + "%";
  }
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, CHEERS.length - 1)];
    sfxMilestone();
    var ov = document.createElement("div");
    ov.className = "pn-burst";
    var conf = "";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"];
    for (var i = 0; i < 44; i++) {
      conf += '<i style="left:' + (Math.random() * 100) + "%;background:" + cols[i % cols.length] +
        ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" +
        (1.3 + Math.random() * 0.9).toFixed(2) + "s;transform:rotate(" + Math.round(Math.random() * 360) + 'deg)"></i>';
    }
    ov.innerHTML = conf +
      '<div class="pn-burst-card"><div class="pn-burst-emoji">' + c.e + '</div>' +
      '<div class="pn-burst-title">' + c.t + '</div><div class="pn-burst-sub">' + c.s + "</div></div>";
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
      var pf = document.querySelector(".pn-progress-fill"), r = document.querySelector(".pn-reward-fill");
      if (pf) pf.style.width = p + "%";
      if (r) r.style.width = ((score % 10) * 10) + "%";
      lastPct = p; lastRw = (score % 10) * 10;
    }, 40);
    return '<div class="pn-meta"><span id="pn-combo" class="pn-combo' + (streak >= 2 ? " is-on" + (streak >= 5 ? " is-hot" : "") : "") + '">' +
      (streak >= 2 ? '<span class="pn-combo-fire">🔥</span> x' + streak + " <em>" + comboLabel(streak) + "</em>" : "") + "</span>" +
      '<span class="pn-reward" title="Next reward at 10 correct"><span class="pn-reward-ico">🎁</span>' +
      '<span class="pn-reward-bar"><span class="pn-reward-fill" style="width:' + lastRw + '%"></span></span></span></div>';
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    total = 0;
    missed = false;
    FXreset();
    selected = null;
    locked = false;
    phase = "play";
    render();
  }

  function selectWord(id) {
    if (locked) return;
    sfxTap();
    selected = id;
    updateBlank();
    updateChips();
    var checkBtn = document.getElementById("pn-check");
    if (checkBtn) checkBtn.disabled = !selected;
  }

  function updateBlank() {
    var blank = document.getElementById("pn-blank");
    if (!blank) return;
    blank.classList.remove("is-ok", "is-bad");
    if (selected) {
      var w = wordById(selected);
      blank.textContent = w ? w.label : "";
      blank.classList.remove("is-empty");
    } else {
      blank.textContent = "";
      blank.classList.add("is-empty");
    }
  }

  function updateChips() {
    app.querySelectorAll(".pn-chip").forEach(function (btn) {
      var id = btn.getAttribute("data-id");
      btn.classList.toggle("is-selected", id === selected);
    });
  }

  function check() {
    if (locked || !selected) return;
    locked = true;

    var item = currentItem();
    var ok = selected === item.answer;
    var blank = document.getElementById("pn-blank");
    var fb = document.getElementById("pn-fb");
    var checkBtn = document.getElementById("pn-check");
    if (checkBtn) checkBtn.disabled = true;

    if (ok) {
      var firstTry = !missed;
      if (firstTry) score++;
      total++;
      missed = false;
      FXok(firstTry);
      sfxOk();
      if (blank) {
        blank.classList.remove("is-empty");
        blank.classList.add("is-ok");
        blank.textContent = wordById(item.answer).label;
      }
      if (fb) {
        fb.textContent = "Correct!";
        fb.className = "pn-fb is-ok";
      }
      app.querySelectorAll(".pn-chip").forEach(function (b) { b.disabled = true; });
      playAnswerAudio(item.answer, function () {
        index++;
        selected = null;
        locked = false;
        if (index >= order.length) endGame();
        else render();
      });
      return;
    } else {
      sfxBad();
      missed = true;
      FXbad();
      if (blank) {
        blank.classList.remove("is-empty");
        blank.classList.add("is-bad");
      }
      if (fb) {
        fb.textContent = "Try again — listen to the answer.";
        fb.className = "pn-fb is-bad";
      }
      playAnswerAudio(item.answer);
      setTimeout(function () {
        selected = null;
        locked = false;
        if (blank) {
          blank.classList.remove("is-bad");
          blank.classList.add("is-empty");
          blank.textContent = "";
        }
        if (fb) {
          fb.textContent = "Choose a word, then press Check.";
          fb.className = "pn-fb";
        }
        updateChips();
        if (checkBtn) checkBtn.disabled = true;
        app.querySelectorAll(".pn-chip").forEach(function (b) { b.disabled = false; });
      }, 1200);
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
      '<header class="pn-topbar">' +
      '<a class="pn-back" href="../" aria-label="Back">←</a>' +
      '<span class="pn-title">Place Names</span>' +
      '<span class="pn-badge">Unit 10A</span></header>' +
      '<section class="pn-start">' +
      '<div class="pn-hero" aria-hidden="true">🏙️</div>' +
      '<h1>Place Names</h1>' +
      '<p class="pn-sub">Complete each sentence with the correct place word.</p>' +
      '<ul class="pn-tips">' +
      '<li>Bridge · Castle · Gallery</li>' +
      '<li>Park · Square · Street</li>' +
      '<li>' + ITEMS.length + ' sentences · listen after Check</li>' +
      '</ul>' +
      '<button type="button" class="pn-btn" id="pn-start">START</button>' +
      '</section>';
    document.getElementById("pn-start").onclick = startGame;
  }

  function renderPlay() {
    var item = currentItem();
    var pct = Math.round((index / order.length) * 100);
    var chips = shuffle(WORDS);

    app.innerHTML =
      '<header class="pn-topbar">' +
      '<a class="pn-back" href="../" aria-label="Back">←</a>' +
      '<span class="pn-title">Place Names</span>' +
      '<span class="pn-badge">' + (index + 1) + "/" + order.length + "</span>" +
      '<span class="pn-stat">SCORE ' + score + "/" + total + "</span>" +
      "</header>" +
      '<div class="pn-progress"><div class="pn-progress-fill" style="width:' + lastPct + '%"></div></div>' +
      FXmeta(pct) +
      '<div class="pn-card">' +
      '<p class="pn-qnum">Sentence ' + (index + 1) + " of " + order.length + "</p>" +
      (item.image
        ? '<div class="pn-picwrap"><img class="pn-pic" src="' + item.image + '" alt="" draggable="false"></div>'
        : "") +
      '<p class="pn-sentence">' +
      escapeHtml(item.before) +
      '<span class="pn-blank is-empty" id="pn-blank"></span>' +
      escapeHtml(item.after) +
      "</p></div>" +
      '<p class="pn-bank-label">Choose a word</p>' +
      '<div class="pn-bank" id="pn-bank">' +
      chips.map(function (w) {
        return (
          '<button type="button" class="pn-chip" data-id="' + w.id + '">' +
          escapeHtml(w.label) +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<div class="pn-actions">' +
      '<button type="button" class="pn-btn" id="pn-check" disabled>Check</button>' +
      "</div>" +
      '<p class="pn-fb" id="pn-fb" aria-live="polite">Choose a word, then press Check.</p>';

    app.querySelectorAll(".pn-chip").forEach(function (btn) {
      btn.onclick = function () {
        selectWord(btn.getAttribute("data-id"));
      };
    });
    document.getElementById("pn-check").onclick = check;
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect knowledge of place names!"
      : accuracy >= 70
      ? "Great job with the place words!"
      : "Keep practising Bridge, Castle, Gallery, Park, Square, and Street.";

    app.innerHTML =
      '<header class="pn-topbar">' +
      '<a class="pn-back" href="../" aria-label="Back">←</a>' +
      '<span class="pn-title">Place Names</span>' +
      '<span class="pn-badge">Done</span></header>' +
      '<section class="pn-start">' +
      '<div class="pn-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="pn-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="pn-sub">Best combo: <strong>🔥 x' + bestStreak + "</strong></p>" +
      '<p class="pn-sub">' + msg + "</p>" +
      '<button type="button" class="pn-btn" id="pn-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    // Persist stars (must match course-render id: level-unit+lesson-slug)
    try {
      if (window.LAStars) {
        if (LAStars.recordPlay) LAStars.recordPlay(GAME_ID);
        if (LAStars.save) LAStars.save(GAME_ID, stars);
      }
    } catch (e) {}

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
    }

    document.getElementById("pn-again").onclick = startGame;
  }

  // Preload place images
  ITEMS.forEach(function (it) {
    if (it.image) {
      var img = new Image();
      img.src = it.image;
    }
  });

  render();
})();
