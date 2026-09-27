/* Places Sound Match Picture · AEF 1 Unit 10A
   Listen, then tap the matching picture — persistent 5x5 grid of 25 places.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-places-sound-match-picture";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ALL = [
    { id: "bridge", word: "a bridge", image: CDN + "h18216_a_bridge.png", audio: CDN + "d503350_a_bridge.mp3" },
    { id: "bus-station", word: "a bus station", image: CDN + "p36317_a_bus_station.png", audio: CDN + "n21592_a_bus_station.mp3" },
    { id: "castle", word: "a castle", image: CDN + "r395416_a_castle.png", audio: CDN + "f541850_a_castle.mp3" },
    { id: "church", word: "a church", image: CDN + "w103625_a_church.png", audio: CDN + "z95099_a_church.mp3" },
    { id: "department-store", word: "a department store", image: CDN + "v83970_a_department_store.png", audio: CDN + "a002092_a_department_store.mp3" },
    { id: "hospital", word: "a hospital", image: CDN + "f294937_a_hospital.png", audio: CDN + "a919004_a_hospital.mp3" },
    { id: "hotel", word: "a hotel", image: CDN + "k52351_a_hotel.png", audio: "" },
    { id: "market", word: "a market", image: CDN + "w132251_a_market.png", audio: CDN + "s812708_a_market.mp3" },
    { id: "museum", word: "a museum", image: CDN + "z93575_a_museum.png", audio: CDN + "k084715_a_museum.mp3" },
    { id: "park", word: "a park", image: CDN + "i966284_a_park.png", audio: CDN + "c58663_a_park.mp3" },
    { id: "parking-lot", word: "a parking lot", image: CDN + "j382816_a_parking_lot.png", audio: CDN + "w042351_a_parking_lot_2.mp3" },
    { id: "pharmacy", word: "a pharmacy", image: CDN + "n44231_a_pharmacy.png", audio: CDN + "t918024_a_pharmacy.mp3" },
    { id: "police-station", word: "a police station", image: CDN + "d996395_a_police_station.png", audio: CDN + "v586632_a_police_station.mp3" },
    { id: "post-office", word: "a post office", image: CDN + "i45672_a_post_office.png", audio: CDN + "o718529_a_post_office.mp3" },
    { id: "river", word: "a river", image: CDN + "q794912_a_river.png", audio: CDN + "w59975_a_river.mp3" },
    { id: "road", word: "a road", image: CDN + "l34840_a_road.png", audio: CDN + "e692892_a_road.mp3" },
    { id: "shopping-mall", word: "a shopping mall", image: CDN + "k10295_a_shopping_mall.png", audio: CDN + "s33410_a_shopping_mall.mp3" },
    { id: "square", word: "a square", image: CDN + "q450339_a_square.png", audio: CDN + "c067424_a_square.mp3" },
    { id: "street", word: "a street", image: CDN + "i942216_a_street.png", audio: CDN + "90876_a_street.mp3" },
    { id: "supermarket", word: "a supermarket", image: CDN + "k75207_a_supermarket.png", audio: CDN + "x131344_a_supermarket.mp3" },
    { id: "theater", word: "a theater", image: CDN + "r05545_a_ther.png", audio: CDN + "h926231_a_ther.mp3" },
    { id: "town-hall", word: "a town hall", image: CDN + "x4057_a_town_hall.png", audio: CDN + "u194392_a_town_hall.mp3" },
    { id: "train-station", word: "a train station", image: CDN + "j204995_a_train_station.png", audio: CDN + "w332684_a_train_sation.mp3" },
    { id: "zoo", word: "a zoo", image: CDN + "e384525_a_zoo.png", audio: CDN + "s762603_a_zoo.mp3" },
    { id: "art-gallery", word: "an art gallery", image: CDN + "l009706_an_art_gallery.png", audio: CDN + "t474039_an_art_gallery.mp3" }
  ];

  var GRID_SIZE = 5; // 5 x 5 = 25 tiles, one per place in ALL

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var board = [];      // 25 items, fixed layout for the whole game
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
    board = shuffle(ALL); // fixed layout for the whole game — always 25 tiles
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
      '<span class="sp-badge">Unit 10A</span></header>' +
      '<section class="sp-start">' +
      '<div class="sp-hero" aria-hidden="true">🔊</div>' +
      "<h1>Sound Match Picture</h1>" +
      '<p class="sp-sub">Listen to the word, then tap the matching picture in the grid.</p>' +
      '<ul class="sp-tips">' +
      "<li>5 × 5 grid — 25 pictures</li>" +
      "<li>24 rounds · 3 hearts</li>" +
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
      '<span class="sp-wave"></span><span class="sp-wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
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
      '<p class="sp-sub">You matched <strong>' + score + "</strong> of <strong>" + order.length + "</strong> places.</p>" +
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
