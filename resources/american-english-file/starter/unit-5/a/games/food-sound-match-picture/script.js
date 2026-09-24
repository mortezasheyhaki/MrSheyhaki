/* Sound Match Picture – Food · 2 sets × 10 · AEF Starter Unit 5A */
(function () {
  "use strict";

  var GAME_ID = "starter-5a-food-sound-match-picture";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // 20 items — no coffee, no tea
  var ALL = [
    { id: "orange-juice", word: "orange juice", image: CDN + "y474569_orange_juicve.png", audio: CDN + "m430952_orange_juice.mp3" },
    { id: "water", word: "water", image: CDN + "l28997_water.png", audio: CDN + "n0647_water_2.mp3" },
    { id: "milk", word: "milk", image: CDN + "o371209_milk.png", audio: CDN + "u575098_milk.mp3" },
    { id: "chocolate", word: "chocolate", image: CDN + "y725106_chocolate.png", audio: CDN + "d5050_chocolate.mp3" },
    { id: "cereal", word: "cereal", image: CDN + "w365421_cereal.png", audio: CDN + "i58138_cereal.mp3" },
    { id: "sandwich", word: "a sandwich", image: CDN + "g593040_a_sandwich.png", audio: CDN + "d503380_a_sandwich.mp3" },
    { id: "sugar", word: "sugar", image: CDN + "t65307_sugar.png", audio: CDN + "i330159_sugar.mp3" },
    { id: "cheese", word: "cheese", image: CDN + "186291_cheese.png", audio: CDN + "s1383_cheese.mp3" },
    { id: "butter", word: "butter", image: CDN + "q390114_butter.png", audio: CDN + "z611617_butter.mp3" },
    { id: "bread", word: "bread", image: CDN + "q54444_bread.png", audio: CDN + "l534951_bread.mp3" },
    { id: "fruit", word: "fruit", image: CDN + "g252280_fruit.png", audio: CDN + "l707897_fruit.mp3" },
    { id: "salad", word: "salad", image: CDN + "r6371_salad.png", audio: CDN + "p30139_salad.mp3" },
    { id: "potatoes", word: "potatoes", image: CDN + "w96375_potatoes.png", audio: CDN + "g067013_potatoes.mp3" },
    { id: "vegetables", word: "vegetables", image: CDN + "j10452_vegetables.png", audio: CDN + "n05883_vegetables_2.mp3" },
    { id: "yogurt", word: "yogurt", image: CDN + "b8972_yogurt.png", audio: CDN + "t99484_yogurt.mp3" },
    { id: "eggs", word: "eggs", image: CDN + "n773101_eggs.png", audio: CDN + "n595148_eggs.mp3" },
    { id: "rice", word: "rice", image: CDN + "y840090_rice.png", audio: CDN + "y43521_rice.mp3" },
    { id: "pasta", word: "pasta", image: CDN + "r41660_pasta.png", audio: CDN + "a446167_pasta.mp3" },
    { id: "meat", word: "meat", image: CDN + "x930201_m.png", audio: CDN + "d13610_m.mp3" },
    { id: "fish", word: "fish", image: CDN + "z779185_fish.png", audio: CDN + "i64676_fish.mp3" }
  ];

  var SETS = [ALL.slice()]; // one set of 20

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
  var TOTAL = 20;

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
    var loseIndex = lives - 1; // break from rightmost full heart
    lives -= 1;
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
    progressFill.style.width = (Math.min(orderIndex, n) / n) * 100 + "%";
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
      btn.innerHTML = '<img src="' + item.image + '" alt="" draggable="false" loading="lazy" />';
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
      try { container.remove(); } catch (_) {}
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
    // Stars = hearts remaining (0–3)
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

  // Preload images
  ALL.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });
})();
