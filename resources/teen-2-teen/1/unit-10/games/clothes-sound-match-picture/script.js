/* Sound Match Picture – Clothes · Teen2Teen 1 Unit 10
   Based on AEF Starter 5A Food Sound Match Picture + heart-break SFX */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u10-clothes-sound-match-picture";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ALL = [
    { id: "sweater", word: "a sweater", image: CDN + "q049292_swer.png", audio: CDN + "d159367_a_swer.mp3" },
    { id: "skirt", word: "a skirt", image: CDN + "a444189_st.png", audio: CDN + "b668114_st.mp3" },
    { id: "shorts", word: "shorts", image: CDN + "p155179_shorts.png", audio: CDN + "b61351_shorts_2.mp3" },
    { id: "shoes", word: "shoes", image: CDN + "i80933_shoes.png", audio: CDN + "y529847_shoes_3.mp3" },
    { id: "shirt", word: "a shirt", image: CDN + "y409033_shirt.png", audio: CDN + "f1066_a_shirt.mp3" },
    { id: "pants", word: "pants", image: CDN + "b63746_pants.png", audio: CDN + "e126543_pants_2.mp3" },
    { id: "jeans", word: "jeans", image: CDN + "s86734_jeans.png", audio: CDN + "p371082_jeans_3.mp3" },
    { id: "jacket", word: "a jacket", image: CDN + "n731967_jacket.png", audio: CDN + "c58647_a_jacket.mp3" },
    { id: "dress", word: "a dress", image: CDN + "e35407_dress.png", audio: CDN + "m241908_a_dress.mp3" },
    { id: "blouse", word: "a blouse", image: CDN + "d598847_blouse.png", audio: CDN + "m041818_a_blouse.mp3" }
  ];

  var SETS = [ALL.slice()];
  var TOTAL = ALL.length;

  var startScreen = document.getElementById("startScreen");
  var gameScreen = document.getElementById("gameScreen");
  var pictureGrid = document.getElementById("pictureGrid");
  var playBtn = document.getElementById("playBtn");
  var feedback = document.getElementById("feedback");
  var roundLabel = document.getElementById("roundLabel");
  var progressFill = document.getElementById("progressFill");
  var startBtn = document.getElementById("startBtn");

  var setIndex = 0;
  var order = [];
  var orderIndex = 0;
  var score = 0;
  var lives = 3;
  var accepting = false;
  var currentAudio = null;
  var sfxCtx = null;

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

  function tone(freq, start, dur, type, gain) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.correct) LASfx.correct();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.11);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.11);
    tone(783.99, t + 0.14, 0.12, "sine", 0.1);
  }

  function sfxBad() {
    try {
      if (window.LASfx && LASfx.wrong) LASfx.wrong();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }

  /** Heart-break SFX — crack + descending tones */
  function sfxHeartBreak() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    try {
      var t0 = ctx.currentTime;
      var bufferSize = Math.floor(ctx.sampleRate * 0.08);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      var noiseGain = ctx.createGain();
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1200;
      noiseFilter.Q.value = 0.8;
      noiseGain.gain.setValueAtTime(0.18, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t0);
      noise.stop(t0 + 0.1);

      function drop(freq, delay, dur, vol) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(freq, t0 + delay);
        o.frequency.exponentialRampToValueAtTime(freq * 0.45, t0 + delay + dur);
        g.gain.setValueAtTime(0.0001, t0 + delay);
        g.gain.exponentialRampToValueAtTime(vol, t0 + delay + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0 + delay);
        o.stop(t0 + delay + dur + 0.02);
      }
      drop(520, 0.02, 0.22, 0.12);
      drop(340, 0.06, 0.28, 0.09);
    } catch (_) {}
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    if (playBtn) playBtn.classList.remove("playing");
  }

  function currentPrompt() {
    return order[orderIndex] || null;
  }

  function playSound() {
    var p = currentPrompt();
    if (!p) return;
    stopAudio();
    var a = new Audio(p.audio);
    currentAudio = a;
    if (playBtn) playBtn.classList.add("playing");
    a.play().catch(function () {
      if (playBtn) playBtn.classList.remove("playing");
    });
    a.onended = function () {
      if (playBtn) playBtn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function renderHearts() {
    var root = document.getElementById("hearts");
    if (!root) return;
    var nodes = root.querySelectorAll(".heart");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.classList.remove("is-full", "is-broken", "is-breaking");
      if (i < lives) {
        el.classList.add("is-full");
        el.textContent = "♥";
      } else {
        el.classList.add("is-broken");
        el.textContent = "♡";
      }
    }
  }

  function breakHeart(done) {
    if (lives <= 0) {
      if (done) done();
      return;
    }
    var loseIndex = lives - 1;
    lives -= 1;
    sfxHeartBreak();
    var root = document.getElementById("hearts");
    var el = root ? root.querySelector('.heart[data-i="' + loseIndex + '"]') : null;
    if (el) {
      el.classList.remove("is-full");
      el.classList.add("is-breaking");
      el.textContent = "♥";
      setTimeout(function () {
        el.classList.remove("is-breaking");
        el.classList.add("is-broken");
        el.textContent = "♡";
        if (done) done();
      }, 480);
    } else {
      renderHearts();
      if (done) done();
    }
  }

  function updateHud() {
    var n = order.length || TOTAL;
    var cur = Math.min(orderIndex + 1, n);
    if (roundLabel) roundLabel.textContent = cur + " / " + n;
    if (progressFill) {
      progressFill.style.width = (Math.min(orderIndex, n) / n) * 100 + "%";
    }
    renderHearts();
  }

  function renderGrid() {
    var items = SETS[setIndex];
    var shuffled = shuffle(items);
    pictureGrid.innerHTML = "";
    shuffled.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "picture-card";
      btn.setAttribute("aria-label", item.word);
      btn.dataset.id = item.id;
      btn.innerHTML =
        '<img src="' + item.image + '" alt="" draggable="false" loading="lazy" />';
      btn.addEventListener("click", function () {
        onSelect(item, btn);
      });
      pictureGrid.appendChild(btn);
    });
  }

  function beginPrompt() {
    if (orderIndex >= order.length) {
      finishGame();
      return;
    }
    accepting = true;
    updateHud();
    feedback.textContent = "Tap the matching picture.";
    feedback.className = "listen-text-msg";
    setTimeout(playSound, 200);
  }

  function spawnParticles(cardEl) {
    if (!cardEl) return;
    var colors = ["#7c6af7", "#4caf50", "#ff9800", "#e91e63", "#2196f3", "#ffeb3b"];
    var container = document.createElement("div");
    container.className = "smp-particles";
    cardEl.appendChild(container);
    for (var i = 0; i < 12; i++) {
      var p = document.createElement("div");
      p.className = "smp-particle";
      var angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      var dist = 30 + Math.random() * 40;
      p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      p.style.background = colors[i % colors.length];
      var size = 5 + Math.random() * 5;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDelay = Math.random() * 0.08 + "s";
      container.appendChild(p);
    }
    setTimeout(function () {
      try {
        container.remove();
      } catch (_) {}
    }, 850);
  }

  function flashListenPanel() {
    var panel = document.querySelector(".listen-panel");
    if (!panel) return;
    panel.classList.remove("reward-flash");
    void panel.offsetWidth;
    panel.classList.add("reward-flash");
    setTimeout(function () {
      panel.classList.remove("reward-flash");
    }, 700);
  }

  function onSelect(item, button) {
    if (!accepting || button.disabled || button.classList.contains("matched")) return;
    var prompt = currentPrompt();
    if (!prompt) return;

    if (item.id !== prompt.id) {
      sfxBad();
      button.classList.add("wrong");
      feedback.textContent = "Try again — listen once more.";
      feedback.className = "listen-text-msg bad";
      accepting = false;
      setTimeout(function () {
        button.classList.remove("wrong");
      }, 500);
      breakHeart(function () {
        if (lives <= 0) {
          feedback.textContent = "Out of hearts!";
          setTimeout(finishGame, 600);
        } else {
          accepting = true;
        }
      });
      return;
    }

    accepting = false;
    stopAudio();
    sfxOk();
    button.disabled = true;
    button.classList.remove("wrong");
    button.classList.add("matched", "just-matched");
    spawnParticles(button);
    flashListenPanel();
    score += 1;
    feedback.textContent = "✓ " + item.word;
    feedback.className = "listen-text-msg ok";
    updateHud();

    setTimeout(function () {
      button.classList.remove("just-matched");
      orderIndex += 1;
      beginPrompt();
    }, 720);
  }

  function finishGame() {
    stopAudio();
    accepting = false;
    var stars = Math.max(0, Math.min(3, lives));

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
          onModes: function () {
            gameScreen.classList.add("hidden");
            startScreen.classList.remove("hidden");
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn(e);
      }
    }
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
        else LAStars.recordPlay(GAME_ID);
      } catch (_) {}
    }
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    setIndex = 0;
    order = shuffle(SETS[0]);
    orderIndex = 0;
    score = 0;
    lives = 3;
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    renderGrid();
    beginPrompt();
  }

  startBtn.addEventListener("click", startGame);
  playBtn.addEventListener("click", function () {
    if (currentPrompt()) playSound();
  });

  ALL.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });
})();
