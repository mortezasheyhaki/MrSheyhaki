/* Sound Match Picture – Teen2Teen 2 Unit 2
   Listen, then tap the matching picture. 3 hearts; a wrong tap costs one.
   Uses the shared UA Kit for sound, progress and the result screen. */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-daily-activities-sound-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ALL = [
    { id: "babysit", word: "babysit my little brother", image: CDN + "m7207_babysit_my_little_brother.png", audio: CDN + "j07180_babysit_my_little_brother.mp3" },
    { id: "homework", word: "do homework", image: CDN + "q952971_do_homework_2.png", audio: CDN + "t69422_do_homework.mp3" },
    { id: "breakfast", word: "eat breakfast", image: CDN + "w781607__breakfast.png", audio: CDN + "h90907__breakfast.mp3" },
    { id: "dinner", word: "eat dinner", image: CDN + "w4137__dinner.png", audio: CDN + "h990237__dinner.mp3" },
    { id: "lunch", word: "eat lunch", image: CDN + "i005905__lunch.png", audio: CDN + "h01685__lunch.mp3" },
    { id: "help-mom", word: "help my mom", image: CDN + "k787298_help_my_mom.png", audio: CDN + "h55057_help_my_mom.mp3" },
    { id: "music", word: "listen to music", image: CDN + "p170331_listen_to_music_2.png", audio: CDN + "k631484_listen_to_music.mp3" },
    { id: "computer-games", word: "play computer games", image: CDN + "x9833_ay_computer_games.png", audio: CDN + "m776279_ay_computer_games.mp3" },
    { id: "cat", word: "play with my cat", image: CDN + "d307932_ay_with_my_cat.png", audio: CDN + "m702010_ay_with_my_cat.mp3" },
    { id: "book", word: "read a book", image: CDN + "e170364_read_a_book_2.png", audio: CDN + "q536626_read_a_book.mp3" },
    { id: "phone", word: "talk on the phone", image: CDN + "o283420_talk_on_the_phone.png", audio: CDN + "h4106_talk_on_the_phone.mp3" },
    { id: "tv", word: "watch TV", image: CDN + "q36681_Watch_TV_2.png", audio: CDN + "h993857_watch_TV.mp3" }
  ];
  var TOTAL = ALL.length;
  var MAX_LIVES = 3;

  var app = document.getElementById("app");
  if (!app) return;

  var K = window.UAKit;
  var phase = "start";
  var order = [];
  var orderIndex = 0;
  var score = 0;
  var lives = MAX_LIVES;
  var accepting = false;
  var currentAudio = null;
  var timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sfx(n) { if (K) K.sfx(n); }
  function current() { return order[orderIndex] || null; }

  function setPlayingUI(on) {
    var b = document.getElementById("smp-play");
    if (b) b.classList.toggle("playing", on);
  }

  function stopAudio() {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    setPlayingUI(false);
  }

  function playSound() {
    var p = current();
    if (!p) return;
    stopAudio();
    try {
      var a = new Audio(p.audio);
      currentAudio = a;
      setPlayingUI(true);
      var done = function () { if (currentAudio === a) currentAudio = null; setPlayingUI(false); };
      a.onended = done;
      a.onerror = done;
      var pr = a.play();
      if (pr && pr.catch) pr.catch(done);
    } catch (e) { setPlayingUI(false); }
  }

  function heartsHTML() {
    var out = "";
    for (var i = 0; i < MAX_LIVES; i++) {
      out += '<span class="smp-heart ' + (i < lives ? "is-full" : "is-broken") + '" data-i="' + i + '" aria-hidden="true">' +
        (i < lives ? "♥" : "♡") + "</span>";
    }
    return '<span class="smp-hearts" id="smp-hearts" aria-label="' + lives + ' lives left">' + out + "</span>";
  }

  function setHearts() {
    var root = document.getElementById("smp-hearts");
    if (!root) return;
    root.setAttribute("aria-label", lives + " lives left");
    root.querySelectorAll(".smp-heart").forEach(function (el) {
      var i = +el.getAttribute("data-i");
      el.classList.toggle("is-full", i < lives);
      el.classList.toggle("is-broken", i >= lives);
      el.textContent = i < lives ? "♥" : "♡";
    });
  }

  function breakHeart(done) {
    if (lives <= 0) { done(); return; }
    var idx = lives - 1;
    lives -= 1;
    sfx("heartbreak");
    var el = document.querySelector('.smp-heart[data-i="' + idx + '"]');
    if (el) {
      el.classList.remove("is-full");
      el.classList.add("is-breaking");
      later(function () {
        el.classList.remove("is-breaking");
        el.classList.add("is-broken");
        el.textContent = "♡";
        done();
      }, 480);
    } else {
      setHearts();
      done();
    }
  }

  function setFeedback(text, kind) {
    var fb = document.getElementById("smp-feedback");
    if (!fb) return;
    fb.textContent = text;
    fb.className = "smp-feedback" + (kind ? " " + kind : "");
  }

  function renderStart() {
    app.innerHTML =
      K.topbar({ title: "Sound Match Picture", pct: 0 }) +
      '<section class="smp-start ua-screen">' +
        '<div class="smp-hero" aria-hidden="true">🎧</div>' +
        "<h1>Sound Match Picture</h1>" +
        '<p class="smp-lead">Listen, then tap the matching daily activity picture.</p>' +
        '<p class="smp-muted">' + TOTAL + " activities · " + MAX_LIVES + " hearts</p>" +
        '<button type="button" class="ua-btn" id="smp-start">Start</button>' +
      "</section>";
    K.afterRender(app, "smp");
    document.getElementById("smp-start").onclick = function () { sfx("tap"); startGame(); };
  }

  function renderGame() {
    var n = order.length;
    var cur = Math.min(orderIndex + 1, n);
    var pct = (orderIndex / n) * 100;

    app.innerHTML =
      K.topbar({
        title: "Sound Match Picture",
        extra: heartsHTML(),
        count: cur + " / " + n,
        pct: pct
      }) +
      '<div class="ua-screen smp-game">' +
        '<div class="smp-listen">' +
          '<button type="button" class="smp-play" id="smp-play" aria-label="Play sound">' +
            '<span class="smp-wave"></span><span class="smp-wave"></span><span class="smp-wave"></span>' +
            '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          "</button>" +
          '<div class="smp-listen-text"><strong>Listen</strong>' +
            '<span class="smp-feedback" id="smp-feedback">Tap the matching picture.</span></div>' +
        "</div>" +
        '<div class="smp-grid" id="smp-grid"></div>' +
      "</div>";

    K.afterRender(app, "smp");
    document.getElementById("smp-play").onclick = function () { sfx("tap"); playSound(); };
    renderGrid();
  }

  function renderGrid() {
    var grid = document.getElementById("smp-grid");
    if (!grid) return;
    grid.innerHTML = "";
    shuffle(ALL).forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "smp-card";
      btn.setAttribute("aria-label", item.word);
      btn.dataset.id = item.id;
      btn.innerHTML = '<img src="' + item.image + '" alt="" draggable="false" loading="lazy" />';
      btn.addEventListener("click", function () { onSelect(item, btn); });
      grid.appendChild(btn);
    });
  }

  function beginPrompt() {
    if (orderIndex >= order.length) { finishGame(); return; }
    accepting = true;
    renderGame();
    setFeedback("Tap the matching picture.", "");
    later(playSound, 250);
  }

  function burst(cardEl) {
    if (!cardEl) return;
    var colors = ["#7c6af7", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#facc15"];
    var layer = document.createElement("div");
    layer.className = "smp-burst";
    for (var i = 0; i < 12; i++) {
      var p = document.createElement("i");
      var angle = (i / 12) * Math.PI * 2;
      var dist = 40 + Math.random() * 30;
      p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      p.style.background = colors[i % colors.length];
      layer.appendChild(p);
    }
    cardEl.appendChild(layer);
    later(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 900);
  }

  function onSelect(item, button) {
    if (!accepting || button.disabled || button.classList.contains("matched")) return;
    var prompt = current();
    if (!prompt) return;

    if (item.id !== prompt.id) {
      sfx("wrong");
      button.classList.add("wrong");
      setFeedback("Try again — listen once more.", "bad");
      accepting = false;
      later(function () { button.classList.remove("wrong"); }, 500);
      breakHeart(function () {
        if (lives <= 0) {
          setFeedback("Out of hearts!", "bad");
          later(finishGame, 600);
        } else {
          accepting = true;
        }
      });
      return;
    }

    accepting = false;
    stopAudio();
    sfx("correct");
    button.disabled = true;
    button.classList.remove("wrong");
    button.classList.add("matched", "just-matched");
    burst(button);
    score += 1;
    setFeedback("✓ " + item.word, "ok");

    var nextIndex = orderIndex + 1;
    K.setProgress(app, (nextIndex / order.length) * 100);
    var count = app.querySelector(".ua-count");
    if (count) count.textContent = Math.min(nextIndex + 1, order.length) + " / " + order.length;

    later(function () {
      button.classList.remove("just-matched");
      orderIndex += 1;
      beginPrompt();
    }, 720);
  }

  function finishGame() {
    clearTimers();
    stopAudio();
    accepting = false;
    var stars = Math.max(0, Math.min(3, lives));
    try {
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); if (stars > 0) LAStars.save(GAME_ID, stars); }
    } catch (e) {}
    sfx(stars >= 2 ? "win" : "lose");
    app.innerHTML =
      K.topbar({ title: "Sound Match Picture", count: TOTAL + " / " + TOTAL, pct: 100 }) +
      '<div class="ua-screen">' +
        K.done({
          score: score, total: TOTAL, stars: stars,
          scoreText: score + " / " + TOTAL + " matched",
          againId: "smp-again"
        }) +
      "</div>";
    K.afterRender(app, "smp");
    document.getElementById("smp-again").onclick = function () { sfx("tap"); startGame(); };
    K.celebrate(app.querySelector(".ua-done"));
  }

  function startGame() {
    clearTimers();
    if (K) K.unlock();
    phase = "play";
    order = shuffle(ALL);
    orderIndex = 0;
    score = 0;
    lives = MAX_LIVES;
    beginPrompt();
  }

  renderStart();
})();
