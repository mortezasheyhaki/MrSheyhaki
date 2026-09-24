/* Food Type – picture + listen + type · AEF Starter Unit 5A */
(function () {
  "use strict";

  var GAME_ID = "starter-5a-food-type";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var WORDS = [
    { id: "orange-juice", label: "orange juice", image: CDN + "y474569_orange_juicve.png", audio: CDN + "m430952_orange_juice.mp3" },
    { id: "water", label: "water", image: CDN + "l28997_water.png", audio: CDN + "n0647_water_2.mp3" },
    { id: "milk", label: "milk", image: CDN + "o371209_milk.png", audio: CDN + "u575098_milk.mp3" },
    { id: "tea", label: "tea", image: CDN + "m857428_tea.png", audio: CDN + "i64279_tea.mp3" },
    { id: "coffee", label: "coffee", image: CDN + "d27147_coffee.png", audio: CDN + "p495679_coffee_2.mp3" },
    { id: "chocolate", label: "chocolate", image: CDN + "y725106_chocolate.png", audio: CDN + "d5050_chocolate.mp3" },
    { id: "cereal", label: "cereal", image: CDN + "w365421_cereal.png", audio: CDN + "i58138_cereal.mp3" },
    { id: "sandwich", label: "a sandwich", image: CDN + "g593040_a_sandwich.png", audio: CDN + "d503380_a_sandwich.mp3" },
    { id: "sugar", label: "sugar", image: CDN + "t65307_sugar.png", audio: CDN + "i330159_sugar.mp3" },
    { id: "cheese", label: "cheese", image: CDN + "186291_cheese.png", audio: CDN + "s1383_cheese.mp3" },
    { id: "butter", label: "butter", image: CDN + "q390114_butter.png", audio: CDN + "z611617_butter.mp3" },
    { id: "bread", label: "bread", image: CDN + "q54444_bread.png", audio: CDN + "l534951_bread.mp3" },
    { id: "fruit", label: "fruit", image: CDN + "g252280_fruit.png", audio: CDN + "l707897_fruit.mp3" },
    { id: "salad", label: "salad", image: CDN + "r6371_salad.png", audio: CDN + "p30139_salad.mp3" },
    { id: "potatoes", label: "potatoes", image: CDN + "w96375_potatoes.png", audio: CDN + "g067013_potatoes.mp3" },
    { id: "vegetables", label: "vegetables", image: CDN + "j10452_vegetables.png", audio: CDN + "n05883_vegetables_2.mp3" },
    { id: "yogurt", label: "yogurt", image: CDN + "b8972_yogurt.png", audio: CDN + "t99484_yogurt.mp3" },
    { id: "eggs", label: "eggs", image: CDN + "n773101_eggs.png", audio: CDN + "n595148_eggs.mp3" },
    { id: "rice", label: "rice", image: CDN + "y840090_rice.png", audio: CDN + "y43521_rice.mp3" },
    { id: "pasta", label: "pasta", image: CDN + "r41660_pasta.png", audio: CDN + "a446167_pasta.mp3" },
    { id: "meat", label: "meat", image: CDN + "x930201_m.png", audio: CDN + "d13610_m.mp3" },
    { id: "fish", label: "fish", image: CDN + "z779185_fish.png", audio: CDN + "i64676_fish.mp3" }
  ];

  var TOTAL = WORDS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var deck = [];
  var index = 0;
  var target = null;
  var locked = false;
  var lives = 3;
  var score = 0;
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

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
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
    tone(523.25, t, 0.09, "triangle", 0.12);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.12);
    tone(783.99, t + 0.14, 0.14, "sine", 0.1);
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
    app.querySelectorAll(".fu-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio() {
    if (!target || !target.audio) return;
    stopAudio();
    var a = new Audio(target.audio);
    currentAudio = a;
    var btn = app.querySelector(".fu-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function heartsHtml() {
    var h = '<div class="fu-hearts" id="fu-hearts" aria-label="Lives">';
    for (var i = 0; i < 3; i++) {
      if (i < lives) h += '<span class="fu-heart is-full" data-i="' + i + '">♥</span>';
      else h += '<span class="fu-heart is-broken" data-i="' + i + '">♡</span>';
    }
    return h + "</div>";
  }

  function breakHeart(done) {
    if (lives <= 0) {
      if (done) done();
      return;
    }
    var loseIndex = lives - 1;
    lives -= 1;
    var el = app.querySelector('.fu-heart[data-i="' + loseIndex + '"]');
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
    } else if (done) done();
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    deck = shuffle(WORDS);
    index = 0;
    score = 0;
    lives = 3;
    phase = "play";
    startRound();
  }

  function startRound() {
    if (index >= deck.length || lives <= 0) {
      finishGame();
      return;
    }
    locked = false;
    target = deck[index];
    stopAudio();
    render();
    setTimeout(function () {
      if (!locked && phase === "play") playAudio();
      var input = document.getElementById("fu-input");
      if (input) {
        try {
          input.focus();
        } catch (_) {}
      }
    }, 280);
  }

  function checkAnswer() {
    if (locked) return;
    var input = document.getElementById("fu-input");
    if (!input) return;
    var val = input.value;
    if (!norm(val)) {
      input.focus();
      return;
    }

    var ok = norm(val) === norm(target.label);
    // Accept "sandwich" for "a sandwich"? User said a sandwich separately - require full phrase
    // Also accept without article for sandwich? Stick to exact label match normalized.

    if (!ok) {
      sfxBad();
      locked = true;
      input.classList.add("bad");
      var fb = document.getElementById("fu-fb");
      if (fb) {
        fb.textContent = "Not quite — try again.";
        fb.className = "lw-fb bad";
      }
      breakHeart(function () {
        if (lives <= 0) {
          setTimeout(finishGame, 500);
          return;
        }
        setTimeout(function () {
          locked = false;
          input.classList.remove("bad");
          input.value = "";
          input.focus();
          if (fb) {
            fb.textContent = "";
            fb.className = "lw-fb";
          }
        }, 400);
      });
      return;
    }

    locked = true;
    stopAudio();
    sfxOk();
    score += 1;
    input.disabled = true;
    input.classList.remove("bad");
    input.classList.add("ok");
    input.value = target.label;
    var fb2 = document.getElementById("fu-fb");
    if (fb2) {
      fb2.innerHTML = "✓ <strong>" + target.label + "</strong>";
      fb2.className = "lw-fb ok";
    }
    setTimeout(function () {
      index += 1;
      startRound();
    }, 900);
  }

  function clearInput() {
    if (locked) return;
    var input = document.getElementById("fu-input");
    if (!input) return;
    input.value = "";
    input.classList.remove("ok", "bad");
    input.focus();
    var fb = document.getElementById("fu-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "lw-fb";
    }
  }

  function finishGame() {
    stopAudio();
    phase = "done";
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
            phase = "start";
            render();
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
      } catch (_) {}
    }
    render();
  }

  function render() {
    if (phase === "start") {
      stopAudio();
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Food Type</span>' +
        '<span class="lw-badge">5A</span></header>' +
        '<section class="lw-start">' +
        '<div class="lw-hero" aria-hidden="true">⌨️</div>' +
        "<h1>Food Type</h1>" +
        '<p class="lw-sub">Look, listen, and type ' +
        TOTAL +
        " food words</p>" +
        '<button type="button" class="lw-btn" id="fu-start">Start</button>' +
        "</section>";
      document.getElementById("fu-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = Math.max(0, Math.min(3, lives));
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Food Type</span>' +
        '<span class="lw-badge">Done</span></header>' +
        '<section class="lw-start">' +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!") +
        "</h1>" +
        '<p class="lw-sub">You typed <strong>' +
        score +
        "</strong> of " +
        TOTAL +
        "</p>" +
        '<button type="button" class="lw-btn" id="fu-again">Play again</button>' +
        "</section>";
      document.getElementById("fu-again").onclick = startGame;
      return;
    }

    var pct = Math.round((index / TOTAL) * 100);
    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Food Type</span>' +
      heartsHtml() +
      '<span class="lw-badge">' +
      (index + 1) +
      " / " +
      TOTAL +
      "</span></header>" +
      '<div class="lw-progress"><div class="lw-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="fu-card">' +
      '<div class="fu-pic-wrap"><img class="fu-pic" src="' +
      target.image +
      '" alt="" draggable="false" /></div>' +
      '<div class="fu-listen">' +
      '<button type="button" class="fu-play" id="fu-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      "<span>Listen, then type the word</span>" +
      "</div>" +
      '<input type="text" class="fu-input" id="fu-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type here…" />' +
      '<div class="fu-actions">' +
      '<button type="button" class="lw-btn secondary" id="fu-clear">Clear</button>' +
      '<button type="button" class="lw-btn" id="fu-check">Check ✓</button>' +
      "</div>" +
      '<div class="lw-fb" id="fu-fb" aria-live="polite"></div>' +
      "</div>";

    document.getElementById("fu-play").onclick = playAudio;
    document.getElementById("fu-clear").onclick = clearInput;
    document.getElementById("fu-check").onclick = checkAnswer;
    var input = document.getElementById("fu-input");
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
  }

  WORDS.forEach(function (w) {
    var img = new Image();
    img.src = w.image;
  });

  render();
})();
