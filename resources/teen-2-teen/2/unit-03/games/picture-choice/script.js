/* Picture Choice – Teen2Teen 2 Unit 3: see the picture, choose the phrase */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u3-picture-choice";
  var CDN = "https://cdn.imgurl.ir/uploads/";
  var CARDS = [
    { id: "singing", label: "take singing lessons", image: CDN + "f62866_.png", audio: CDN + "l25665_.mp3" },
    { id: "orchestra", label: "play in the school orchestra", image: CDN + "v87181_.png", audio: CDN + "a29751_.mp3" },
    { id: "band", label: "play in the school band", image: CDN + "e401415_.png", audio: CDN + "i6100_.mp3" },
    { id: "soccer", label: "play on the soccer team", image: CDN + "m52443_.png", audio: CDN + "p596381_.mp3" },
    { id: "language", label: "learn a new language", image: CDN + "d67725_.png", audio: CDN + "x52147_.mp3" },
    { id: "charity", label: "collect money for charity", image: CDN + "v17682_.png", audio: CDN + "l276680_.mp3" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  /* ---------- sound effects (synthesised, no files needed) ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("ua-muted") === "1"; } catch (e) {}
  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audioCtx(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    tap: function () { tone(640, 0.05, "triangle", 0.07); },
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var order = [], pos = 0, score = 0, misses = 0, locked = false, currentAudio = null, advanceTimer = null;
  var used = {};

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function stopAudio() {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
  }

  function playPhrase(card, done) {
    stopAudio();
    var a = new Audio(card.audio);
    currentAudio = a;
    var finished = false;
    function end() { if (finished) return; finished = true; if (currentAudio === a) currentAudio = null; if (done) done(); }
    a.onended = end;
    a.onerror = end;
    var p = a.play();
    if (p && p.catch) p.catch(end);
    // safety net in case the audio never ends
    advanceTimer = setTimeout(end, 4000);
  }

  function header(pct, badge) {
    return '<div class="pc-top"><a class="pc-back" href="../" aria-label="Back to games">←</a>' +
      '<span class="pc-title">Picture Choice</span><span class="pc-badge">' + badge + "</span></div>" +
      '<div class="pc-progress"><span style="width:' + pct + '%"></span></div>';
  }

  function renderRound(animateIn) {
    var card = CARDS[order[pos]];
    var chipOrder = shuffle(CARDS);
    var pct = Math.round((pos / CARDS.length) * 100);
    app.innerHTML =
      header(pct, (pos + 1) + " / " + CARDS.length) +
      '<div class="pc-stage"><div class="pc-card' + (animateIn ? " pc-enter" : "") + '" id="pc-card">' +
      '<img class="pc-img" src="' + card.image + '" alt="' + card.label + '" draggable="false" ' +
      "onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\" />" +
      '<div class="pc-fallback">' + card.label + "</div></div></div>" +
      '<div class="pc-chips" id="pc-chips">' +
      chipOrder.map(function (c, i) {
        var isUsed = !!used[c.id];
        return '<button class="pc-chip' + (isUsed ? " is-used" : "") + '" style="--i:' + i + '" data-id="' + c.id + '"' + (isUsed ? " disabled" : "") + ">" + c.label + "</button>";
      }).join("") +
      "</div>" +
      '<div class="pc-feedback" id="pc-feedback" aria-live="polite"></div>';
    locked = false;
  }

  function nextRound() {
    stopAudio();
    var old = document.getElementById("pc-card");
    if (old) old.classList.add("pc-leave");
    sfx("whoosh");
    setTimeout(function () {
      pos++;
      if (pos >= CARDS.length) finish();
      else renderRound(true);
    }, 300);
  }

  function setFeedback(text, kind) {
    var fb = document.getElementById("pc-feedback");
    if (!fb) return;
    fb.classList.remove("pc-fade");
    fb.className = "pc-feedback " + (kind || "");
    fb.textContent = text;
  }

  function handleChoice(btn) {
    if (locked || btn.disabled) return;
    var card = CARDS[order[pos]];
    var chosen = btn.getAttribute("data-id");
    if (chosen === card.id) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      sfx("correct");
      btn.classList.add("is-right");
      var picture = document.getElementById("pc-card");
      if (picture) picture.classList.add("is-correct");
      document.querySelectorAll(".pc-chip").forEach(function (c) {
        c.disabled = true;
        if (c !== btn) c.classList.add("is-dim");
      });
      setFeedback(["Yesss! 🎉","Awesome! ⭐","You got it! 🙌","Super! 🚀"][score % 4], "ok");
      burstConfetti();
      used[card.id] = true;
      playPhrase(card, function () { setTimeout(nextRound, 350); });
    } else {
      misses++;
      sfx("wrong");
      btn.classList.add("is-wrong");
      btn.disabled = true;
      setFeedback(["Oops! Try again 💪","Almost! Give it another go 🤔","Nope, try another one 👀"][misses % 3], "no");
    }
  }

  function burstConfetti() {
    var colours = ["#ff6fb1", "#ffb347", "#ffe066", "#5ee6a8", "#6ec8ff", "#b59cff"];
    for (var i = 0; i < 26; i++) {
      var el = document.createElement("span");
      el.className = "pc-confetti";
      el.style.left = (Math.random() * 100) + "vw";
      el.style.background = colours[i % colours.length];
      el.style.setProperty("--dx", ((Math.random() - 0.5) * 160) + "px");
      el.style.setProperty("--dur", (1.2 + Math.random() * 0.8) + "s");
      el.style.animationDelay = (Math.random() * 0.25) + "s";
      document.body.appendChild(el);
      setTimeout(function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; }(el), 2400);
    }
  }

  function finish() {
    stopAudio();
    sfx("win");
    var stars = score === CARDS.length ? 3 : score >= CARDS.length / 2 ? 2 : 1;
    // Shared end screen (same as the Teen 1 games). It records the play and stars itself.
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: CARDS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: start,
          onModes: start,
          backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    // Fallback if the shared screen is not available
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    app.innerHTML =
      header(100, CARDS.length + " / " + CARDS.length) +
      '<div class="pc-done"><div class="pc-trophy" aria-hidden="true">🏆</div><h1>You did it! 🎉</h1>' +
      "<p>You got " + score + " of " + CARDS.length + " on the first try. Amazing work! 🌟</p>" +
      '<button class="pc-btn" id="pc-again">Play again</button>' +
      '<a class="pc-btn secondary" href="../">Back to games</a></div>';
    document.getElementById("pc-again").onclick = start;
  }

  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    stopAudio();
    order = shuffle(CARDS.map(function (c, i) { return i; }));
    pos = 0; score = 0; misses = 0; used = {};
    renderRound(false);
  }

  app.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".pc-chip");
    if (btn) { sfx("tap"); handleChoice(btn); }
  });

  // unlock audio on the first tap of the page
  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });

  start();
})();
