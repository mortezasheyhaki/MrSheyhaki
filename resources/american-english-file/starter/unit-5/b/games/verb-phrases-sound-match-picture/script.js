/* Verb Phrases Sound Match Picture · AEF Starter Unit 5B
   Listen, then tap the matching picture — 5×3 grid of 15 verb phrases.
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-sound-match-picture";
  var ALL = [
    { id: "live-apartment", word: "live in an apartment", image: "https://cdn.imgurl.ir/uploads/a268498_1._live_in_an_apartment.png", audio: "https://cdn.imgurl.ir/uploads/v24239_1_live_in_an_apartment.mp3" },
    { id: "have-breakfast", word: "have breakfast", image: "https://cdn.imgurl.ir/uploads/i180939_2_have_breakfast.png", audio: "https://cdn.imgurl.ir/uploads/q068505_2_have_breakfast.mp3" },
    { id: "watch-tv", word: "watch TV", image: "https://cdn.imgurl.ir/uploads/z722778_3_watch_TV.png", audio: "https://cdn.imgurl.ir/uploads/j343700_3_watch_TV.mp3" },
    { id: "listen-radio", word: "listen to the radio", image: "https://cdn.imgurl.ir/uploads/r771582_4_listen_to_the_radio.png", audio: "https://cdn.imgurl.ir/uploads/v936094_4_Listen_to_the_radio.mp3" },
    { id: "read-newspaper", word: "read the newspaper", image: "https://cdn.imgurl.ir/uploads/m787410_5_read_the_newspaper.png", audio: "https://cdn.imgurl.ir/uploads/s054742_5_read_the_newspaper.mp3" },
    { id: "eat-fast-food", word: "eat fast food", image: "https://cdn.imgurl.ir/uploads/b044304_6__fastfood.png", audio: "https://cdn.imgurl.ir/uploads/l78660_6__fastfood.mp3" },
    { id: "drink-coffee", word: "drink coffee", image: "https://cdn.imgurl.ir/uploads/g296945_7_drink_coffee.png", audio: "https://cdn.imgurl.ir/uploads/g006864_7_drink_coffee.mp3" },
    { id: "speak-english", word: "speak English", image: "https://cdn.imgurl.ir/uploads/b781742_8_speak_English.png", audio: "https://cdn.imgurl.ir/uploads/z53147_8_speak_English.mp3" },
    { id: "want-coffee", word: "want a coffee", image: "https://cdn.imgurl.ir/uploads/e991538_9_want_a_coffee.png", audio: "https://cdn.imgurl.ir/uploads/f683333_9_want_a_coffee.mp3" },
    { id: "have-dog", word: "have a dog", image: "https://cdn.imgurl.ir/uploads/b92270_10_have_a_dog.png", audio: "https://cdn.imgurl.ir/uploads/q784020_10_have_a_dog.mp3" },
    { id: "like-cats", word: "like cats", image: "https://cdn.imgurl.ir/uploads/u544398_11_like_cats.png", audio: "https://cdn.imgurl.ir/uploads/v70276_11_like_cats.mp3" },
    { id: "work-bank", word: "work in a bank", image: "https://cdn.imgurl.ir/uploads/j72729_12_work_in_a_bank.png", audio: "https://cdn.imgurl.ir/uploads/a502_12_work_in_a_bank.mp3" },
    { id: "study-spanish", word: "study Spanish", image: "https://cdn.imgurl.ir/uploads/h46592_13_study_Spanish.png", audio: "https://cdn.imgurl.ir/uploads/q92916_13_study_Spanish.mp3" },
    { id: "go-classes", word: "go to English classes", image: "https://cdn.imgurl.ir/uploads/x832355_14_Go_to_English_cles.png", audio: "https://cdn.imgurl.ir/uploads/y124959_14_Go_to_English_cles.mp3" },
    { id: "need-car", word: "need a new car", image: "https://cdn.imgurl.ir/uploads/i19129_15_need_a_new_car.png", audio: "https://cdn.imgurl.ir/uploads/o807442_15_need_a_new_car.mp3" }
  ]

  var GRID_SIZE = 5; // 5 columns × 3 rows = 15 tiles

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var board = [];      // 15 items, fixed layout for the whole game
  var order = [];      // shuffled items-with-audio, one per round
  var roundIndex = 0;
  var score = 0;
  var lives = 3;
  var accepting = false;
  var currentAudio = null;
  var sfxCtx = null;

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

  /* ---------- sound effects ---------- */
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
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
    o.connect(g); g.connect(ctx.destination);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function sfxOk() {
    try { if (window.LASfx && LASfx.correct) LASfx.correct(); } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.11);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.11);
    tone(783.99, t + 0.14, 0.12, "sine", 0.1);
  }
  function sfxBad() {
    try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }
  function sfxCelebrate() {
    try { if (window.LASfx && LASfx.celebrate) { LASfx.celebrate(); return; } } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.07, 0.15, "sine", 0.1); });
  }
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
      noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
      noise.start(t0); noise.stop(t0 + 0.1);
      function drop(freq, delay, dur, vol) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(freq, t0 + delay);
        o.frequency.exponentialRampToValueAtTime(freq * 0.45, t0 + delay + dur);
        g.gain.setValueAtTime(0.0001, t0 + delay);
        g.gain.exponentialRampToValueAtTime(vol, t0 + delay + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + delay); o.stop(t0 + delay + dur + 0.02);
      }
      drop(520, 0.02, 0.22, 0.12);
      drop(340, 0.06, 0.28, 0.09);
    } catch (_) {}
  }

  /* ---------- audio playback ---------- */
  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    var btn = document.getElementById("sp-play");
    if (btn) btn.classList.remove("is-playing");
  }
  function currentPrompt() { return order[roundIndex] || null; }
  function playSound() {
    var p = currentPrompt();
    if (!p || !p.audio) return;
    stopAudio();
    var a = new Audio(p.audio);
    currentAudio = a;
    var btn = document.getElementById("sp-play");
    if (btn) btn.classList.add("is-playing");
    a.play().catch(function () { if (btn) btn.classList.remove("is-playing"); });
    a.onended = function () {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  /* ---------- game setup ---------- */
  function buildBoard() {
    board = shuffle(ALL); // fixed layout for the whole game — 15 tiles
  }
  function buildOrder() {
    var withAudio = ALL.filter(function (it) { return it.audio; });
    order = shuffle(withAudio);
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    buildBoard();
    buildOrder();
    roundIndex = 0;
    score = 0;
    lives = 3;
    accepting = false;
    phase = "play";
    render();
    beginRound();
  }

  function beginRound() {
    if (roundIndex >= order.length) { finishGame(); return; }
    accepting = true;
    updateHud();
    setFeedback("Listen, then tap the matching picture.", "");
    setTimeout(playSound, 250);
  }

  function onTileClick(item, tileEl) {
    if (phase !== "play" || !accepting || tileEl.classList.contains("is-matched")) return;
    var prompt = currentPrompt();
    if (!prompt) return;

    if (item.id !== prompt.id) {
      sfxBad();
      tileEl.classList.add("is-wrong");
      setFeedback("Try again — listen once more.", "is-bad");
      accepting = false;
      setTimeout(function () { tileEl.classList.remove("is-wrong"); }, 320);
      breakHeart(function () {
        if (lives <= 0) {
          setFeedback("Out of hearts!", "is-bad");
          setTimeout(finishGame, 500);
        } else {
          accepting = true;
        }
      });
      return;
    }

    accepting = false;
    stopAudio();
    sfxOk();
    tileEl.classList.add("is-matched");
    tileEl.disabled = true;
    score += 1;
    setFeedback("✓ " + item.word, "is-ok");
    updateHud();

    setTimeout(function () {
      roundIndex += 1;
      beginRound();
    }, 650);
  }

  function breakHeart(done) {
    if (lives <= 0) { if (done) done(); return; }
    lives -= 1;
    sfxHeartBreak();
    renderHearts();
    var root = document.getElementById("sp-hearts");
    var el = root ? root.querySelector('.sp-heart[data-i="' + lives + '"]') : null;
    if (el) {
      el.classList.add("is-breaking");
      setTimeout(function () {
        el.classList.remove("is-breaking");
        if (done) done();
      }, 480);
    } else if (done) {
      done();
    }
  }

  function renderHearts() {
    var root = document.getElementById("sp-hearts");
    if (!root) return;
    var html = "";
    for (var i = 0; i < 3; i++) {
      html += '<span class="sp-heart' + (i < lives ? "" : " is-empty") + '" data-i="' + i + '" aria-hidden="true">' + (i < lives ? "♥" : "♡") + "</span>";
    }
    root.innerHTML = html;
  }

  function setFeedback(text, cls) {
    var fb = document.getElementById("sp-fb");
    if (!fb) return;
    fb.textContent = text;
    fb.className = "sp-fb" + (cls ? " " + cls : "");
  }

  function updateHud() {
    var badge = document.getElementById("sp-badge");
    var fill = document.getElementById("sp-progress-fill");
    var cur = Math.min(roundIndex + 1, order.length);
    if (badge) badge.textContent = cur + " / " + order.length;
    if (fill) fill.style.width = (Math.min(roundIndex, order.length) / order.length) * 100 + "%";
    renderHearts();
  }

  function starsFromLives() {
    return Math.max(0, Math.min(3, lives));
  }

  function finishGame() {
    stopAudio();
    accepting = false;
    phase = "results";
    var stars = starsFromLives();
    renderResults(stars);

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: order.length,
          stars: stars,
          timeMs: timeMs,
          save: true,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
        return;
      } catch (e) { /* fall through to local results screen */ }
    }
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
  }

  /* ---------- rendering ---------- */
  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults(starsFromLives());
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="sp-topbar">' +
      '<a class="sp-back" href="../" aria-label="Back">←</a>' +
      '<span class="sp-title">Sound Match Picture</span>' +
      '<span class="sp-badge">Unit 5B</span></header>' +
      '<section class="sp-start">' +
      '<div class="sp-hero" aria-hidden="true">🔊</div>' +
      "<h1>Sound Match Picture</h1>" +
      '<p class="sp-sub">Listen to the word, then tap the matching picture in the grid.</p>' +
      '<ul class="sp-tips">' +
      "<li>5 × 3 grid — 15 pictures</li>" +
      "<li>15 rounds · 3 hearts</li>" +
      "<li>Tap the speaker to hear it again</li>" +
      "</ul>" +
      '<button type="button" class="sp-btn" id="sp-start">START</button>' +
      "</section>";
    document.getElementById("sp-start").onclick = startGame;
  }

  function renderPlay() {
    app.innerHTML =
      '<header class="sp-topbar">' +
      '<a class="sp-back" href="../" aria-label="Back">←</a>' +
      '<span class="sp-title">Sound Match Picture</span>' +
      '<span class="sp-badge" id="sp-badge">1 / ' + order.length + "</span>" +
      '<div class="sp-hearts" id="sp-hearts"></div>' +
      "</header>" +
      '<div class="sp-progress"><div class="sp-progress-fill" id="sp-progress-fill"></div></div>' +
      '<div class="sp-listen-panel">' +
      '<button type="button" class="sp-play-btn" id="sp-play" aria-label="Play sound">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="sp-listen-text">' +
      '<p class="sp-eyebrow">Listen</p>' +
      '<p class="sp-fb" id="sp-fb">Listen, then tap the matching picture.</p>' +
      "</div></div>" +
      '<div class="sp-grid" id="sp-grid"></div>';

    var grid = document.getElementById("sp-grid");
    board.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sp-tile";
      btn.setAttribute("aria-label", item.word);
      btn.dataset.id = item.id;
      btn.innerHTML = '<img src="' + item.image + '" alt="" draggable="false" loading="lazy">';
      btn.addEventListener("click", function () { onTileClick(item, btn); });
      grid.appendChild(btn);
    });

    renderHearts();
    document.getElementById("sp-play").addEventListener("click", function () {
      if (currentPrompt()) playSound();
    });
  }

  function renderResults(stars) {
    var msg =
      stars >= 3 ? "Perfect listening!" :
      stars === 2 ? "Great job!" :
      stars === 1 ? "Nice work — try again for full hearts!" :
      "Keep practising those sounds!";

    app.innerHTML =
      '<header class="sp-topbar">' +
      '<a class="sp-back" href="../" aria-label="Back">←</a>' +
      '<span class="sp-title">Sound Match Picture</span>' +
      '<span class="sp-badge">Done</span></header>' +
      '<section class="sp-done">' +
      '<div class="sp-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="sp-sub">You matched <strong>' + score + "</strong> of <strong>" + order.length + "</strong> phrases.</p>" +
      '<p class="sp-sub">' + escapeHtml(msg) + "</p>" +
      '<button type="button" class="sp-btn" id="sp-again">PLAY AGAIN</button>' +
      "</section>";
    sfxCelebrate();
    var again = document.getElementById("sp-again");
    if (again) again.onclick = startGame;
  }

  // Preload images
  ALL.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
