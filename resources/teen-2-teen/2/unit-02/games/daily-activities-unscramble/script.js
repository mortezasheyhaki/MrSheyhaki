/* Unscramble Daily Activities – Teen2Teen 2 · Unit 2 */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-daily-activities-unscramble";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "babysit", label: "babysit my little brother", word: "babysit my little brother", emoji: "👶",
      image: CDN + "m7207_babysit_my_little_brother.png", audio: CDN + "j07180_babysit_my_little_brother.mp3" },
    { id: "homework", label: "do homework", word: "do homework", emoji: "📚",
      image: CDN + "q952971_do_homework_2.png", audio: CDN + "t69422_do_homework.mp3" },
    { id: "breakfast", label: "eat breakfast", word: "eat breakfast", emoji: "🍳",
      image: CDN + "w781607__breakfast.png", audio: CDN + "h90907__breakfast.mp3" },
    { id: "dinner", label: "eat dinner", word: "eat dinner", emoji: "🍽️",
      image: CDN + "w4137__dinner.png", audio: CDN + "h990237__dinner.mp3" },
    { id: "lunch", label: "eat lunch", word: "eat lunch", emoji: "🥗",
      image: CDN + "i005905__lunch.png", audio: CDN + "h01685__lunch.mp3" },
    { id: "help-mom", label: "help my mom", word: "help my mom", emoji: "🧺",
      image: CDN + "k787298_help_my_mom.png", audio: CDN + "h55057_help_my_mom.mp3" },
    { id: "music", label: "listen to music", word: "listen to music", emoji: "🎧",
      image: CDN + "p170331_listen_to_music_2.png", audio: CDN + "k631484_listen_to_music.mp3" },
    { id: "computer-games", label: "play computer games", word: "play computer games", emoji: "🎮",
      image: CDN + "x9833_ay_computer_games.png", audio: CDN + "m776279_ay_computer_games.mp3" },
    { id: "cat", label: "play with my cat", word: "play with my cat", emoji: "🐱",
      image: CDN + "d307932_ay_with_my_cat.png", audio: CDN + "m702010_ay_with_my_cat.mp3" },
    { id: "book", label: "read a book", word: "read a book", emoji: "📖",
      image: CDN + "e170364_read_a_book_2.png", audio: CDN + "q536626_read_a_book.mp3" },
    { id: "phone", label: "talk on the phone", word: "talk on the phone", emoji: "📱",
      image: CDN + "o283420_talk_on_the_phone.png", audio: CDN + "h4106_talk_on_the_phone.mp3" },
    { id: "tv", label: "watch TV", word: "watch TV", emoji: "📺",
      image: CDN + "q36681_Watch_TV_2.png", audio: CDN + "h993857_watch_TV.mp3" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var S = {
    phase: "start",      // start | play | feedback | done
    order: [],
    index: 0,
    correct: 0,
    slots: [],           // null or { ch, uid }
    pool: [],            // { ch, uid, used }
    bad: false,          // briefly true after a wrong check
    seq: 0,
    lastUid: 0,          // word that was just placed (for pop animation)
    playing: false,
    audio: null,
    stars: 0,
    lastPct: 0
  };

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function current() {
    return ITEMS[S.order[S.index]];
  }

  function progressPct() {
    var n = S.order.length || ITEMS.length;
    if (S.phase === "done") return 100;
    if (S.phase === "start") return 0;
    var done = S.phase === "feedback" ? S.index + 1 : S.index;
    return Math.round((done / n) * 100);
  }

  /* ---------- sound ---------- */

  var ctx = null;

  function audioCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(freq, dur, type, gain, delay) {
    var c = audioCtx();
    if (!c) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function sfx(name) {
    // Use the site's shared sound pack when present
    try {
      if (window.LASfx && typeof window.LASfx[name] === "function") {
        window.LASfx[name]();
        return;
      }
    } catch (e) {}
    try {
      if (name === "place") tone(480, 0.04, "triangle", 0.08);
      else if (name === "click") tone(420, 0.04, "triangle", 0.06);
      else if (name === "correct") {
        tone(523.25, 0.08, "triangle", 0.12);
        tone(659.25, 0.1, "triangle", 0.11, 0.06);
        tone(783.99, 0.12, "sine", 0.1, 0.12);
      } else if (name === "wrong") {
        tone(220, 0.1, "square", 0.07);
        tone(165, 0.14, "square", 0.05, 0.05);
      } else if (name === "win") {
        tone(523.25, 0.12, "triangle", 0.12);
        tone(659.25, 0.12, "triangle", 0.11, 0.08);
        tone(783.99, 0.14, "triangle", 0.12, 0.16);
        tone(1046.5, 0.22, "sine", 0.1, 0.26);
      }
    } catch (e) {}
  }

  /* ---------- audio playback ---------- */

  function setPlaying(on) {
    S.playing = on;
    var btn = document.getElementById("ua-play");
    if (btn) btn.classList.toggle("is-playing", on);
  }

  function stopAudio() {
    if (S.audio) {
      try { S.audio.pause(); } catch (e) {}
      S.audio = null;
    }
    setPlaying(false);
  }

  function playAudio() {
    var c = current();
    if (!c || !c.audio) return;
    stopAudio();
    var a;
    try { a = new Audio(c.audio); } catch (e) { return; }
    S.audio = a;
    setPlaying(true);
    var done = function () {
      if (S.audio === a) { S.audio = null; setPlaying(false); }
    };
    a.onended = done;
    a.onerror = done;
    var p = a.play();
    if (p && typeof p.catch === "function") p.catch(done);
  }

  /* ---------- game flow ---------- */

  function startGame() {
    audioCtx();
    if (window.LAFinish && typeof window.LAFinish.startTimer === "function") {
      window.LAFinish.startTimer();
    }
    S.order = shuffle(ITEMS.map(function (_, i) { return i; }));
    S.index = 0;
    S.correct = 0;
    startRound();
  }

  function startRound() {
    var c = current();
    var words = c.word.split(/\s+/);
    var scrambled = shuffle(words);
    for (var tries = 0; tries < 30 && words.length > 1 && scrambled.join(" ") === words.join(" "); tries++) {
      scrambled = shuffle(words);
    }
    S.slots = words.map(function () { return null; });
    S.pool = scrambled.map(function (w) {
      return { ch: w, uid: ++S.seq, used: false };
    });
    S.bad = false;
    S.lastUid = 0;
    S.phase = "play";
    render();
  }

  function placeTile(uid) {
    if (S.phase !== "play" || S.bad) return;
    var tile = null;
    for (var i = 0; i < S.pool.length; i++) {
      if (S.pool[i].uid === uid && !S.pool[i].used) { tile = S.pool[i]; break; }
    }
    var slot = S.slots.indexOf(null);
    if (!tile || slot < 0) return;

    S.slots[slot] = { ch: tile.ch, uid: tile.uid };
    tile.used = true;
    S.lastUid = tile.uid;
    sfx("place");
    renderBoard();
    setTimeout(function () { S.lastUid = 0; }, 400);

    if (S.slots.indexOf(null) < 0) setTimeout(check, 220);
  }

  function removeSlot(i) {
    if (S.phase !== "play" || S.bad) return;
    var s = S.slots[i];
    if (!s) return;
    for (var k = 0; k < S.pool.length; k++) {
      if (S.pool[k].uid === s.uid) { S.pool[k].used = false; break; }
    }
    S.slots[i] = null;
    sfx("click");
    renderBoard();
  }

  function check() {
    if (S.phase !== "play" || S.slots.indexOf(null) >= 0) return;
    var c = current();
    var built = S.slots.map(function (s) { return s.ch; }).join(" ");

    if (built.toLowerCase() === c.word.toLowerCase()) {
      S.correct++;
      S.phase = "feedback";
      sfx("correct");
      enterFeedback();
      // Play the phrase after the success chime; skip if the player already moved on
      setTimeout(function () {
        if (S.phase === "feedback") playAudio();
      }, 450);
    } else {
      S.bad = true;
      sfx("wrong");
      renderBoard();
      setTimeout(function () {
        S.bad = false;
        renderBoard();
      }, 650);
    }
  }

  // Switch to the feedback state in place. The picture and screen are not
  // rebuilt, so nothing re-animates or flickers after a correct answer.
  function enterFeedback() {
    var root = app.querySelector(".ua-shell");
    if (!root) { render(); return; }

    var count = app.querySelector(".ua-count");
    if (count) count.textContent = (S.index + 1) + "/" + S.order.length;

    var bar = app.querySelector(".ua-bar i");
    var pct = progressPct();
    if (bar) bar.style.width = pct + "%";
    var barWrap = app.querySelector(".ua-bar");
    if (barWrap) barWrap.setAttribute("aria-valuenow", pct);
    S.lastPct = pct;

    var hint = app.querySelector(".ua-hint");
    if (hint) hint.textContent = "";

    var bank = app.querySelector(".ua-bank");
    if (bank) bank.remove();

    var work = app.querySelector(".ua-work");
    if (work && !app.querySelector(".ua-next")) {
      var last = S.index === S.order.length - 1;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ua-btn ua-next ua-fade-in";
      btn.setAttribute("data-act", "next");
      btn.textContent = last ? "See results" : "Next →";
      work.appendChild(btn);
    }

    renderBoard();
  }

  function nextRound() {
    stopAudio();
    sfx("click");
    if (S.index < S.order.length - 1) {
      S.index++;
      startRound();
    } else {
      finish();
    }
  }

  function computeStars() {
    var total = ITEMS.length;
    if (S.correct === total) return 3;
    if (S.correct >= total - 2) return 2;
    if (S.correct >= Math.ceil(total / 2)) return 1;
    return 0;
  }

  function finish() {
    S.phase = "done";
    S.stars = computeStars();
    sfx("win");

    var timeMs = null;
    try {
      if (window.LAFinish && typeof window.LAFinish.stopTimer === "function") {
        timeMs = window.LAFinish.stopTimer();
      }
    } catch (e) {}

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, S.stars);
      }
    } catch (e) {}

    render();

    try {
      if (window.LAFinish && typeof window.LAFinish.show === "function") {
        window.LAFinish.show({
          gameId: GAME_ID,
          score: S.correct,
          total: ITEMS.length,
          stars: S.stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { S.phase = "start"; render(); },
          backHref: "../"
        });
      }
    } catch (e) {}
  }

  /* ---------- rendering ---------- */

  function topbar(countText, pct) {
    return (
      '<header class="ua-top">' +
        '<a class="ua-back" href="../" aria-label="Back">←</a>' +
        '<div class="ua-top-mid">' +
          '<span class="ua-kicker">Teen2Teen 2 · Unit 2</span>' +
          '<span class="ua-title">Unscramble Daily Activities</span>' +
        "</div>" +
        '<span class="ua-count">' + countText + "</span>" +
      "</header>" +
      '<div class="ua-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<i></i>' +
      "</div>"
    );
  }

  function picture(c) {
    return (
      '<div class="ua-pic">' +
        '<img src="' + esc(c.image) + '" alt="' + esc(c.label) + '" draggable="false" ' +
          'onerror="this.parentNode.classList.add(\'no-img\')">' +
        '<span class="ua-emoji" aria-hidden="true">' + c.emoji + "</span>" +
        '<button type="button" id="ua-play" class="ua-play' + (S.playing ? " is-playing" : "") +
          '" data-act="play" aria-label="Play audio">' +
          '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
            '<path fill="currentColor" d="M8 5v14l11-7z"/>' +
          "</svg>" +
        "</button>" +
      "</div>"
    );
  }

  function renderStart() {
    return (
      '<section class="ua-card ua-start">' +
        '<div class="ua-hero" aria-hidden="true">🔤</div>' +
        "<h1>Unscramble Daily Activities</h1>" +
        "<p>Look at the picture, listen, then put the words in the right order.</p>" +
        '<button type="button" class="ua-btn" data-act="start">Start</button>' +
      "</section>"
    );
  }

  function renderDone() {
    var msg = ["Keep practising!", "Good effort!", "Great work!", "Perfect! 🎉"][S.stars];
    var stars = [1, 2, 3].map(function (n) {
      return '<span class="' + (n <= S.stars ? "on" : "") + '">★</span>';
    }).join("");
    return (
      '<section class="ua-card ua-done">' +
        '<div class="ua-hero" aria-hidden="true">' + (S.stars === 3 ? "🏆" : "🎉") + "</div>" +
        "<h1>" + msg + "</h1>" +
        '<div class="ua-stars" aria-label="' + S.stars + ' of 3 stars">' + stars + "</div>" +
        "<p>You got " + S.correct + " of " + ITEMS.length + " right.</p>" +
        '<div class="ua-done-actions">' +
          '<button type="button" class="ua-btn" data-act="again">Play again</button>' +
          '<a class="ua-btn ghost" href="../">Back</a>' +
        "</div>" +
      "</section>"
    );
  }

  function renderRound() {
    var c = current();
    var fb = S.phase === "feedback";
    var last = S.index === S.order.length - 1;
    return (
      '<div class="ua-round">' +
        '<section class="ua-media">' + picture(c) + "</section>" +
        '<section class="ua-work">' +
          '<p class="ua-hint">' +
            (fb ? "" : "Tap the words in the right order. Tap a word in the answer to undo it.") +
          "</p>" +
          '<div class="ua-card ua-answer"><div class="ua-slots" id="ua-slots"></div></div>' +
          (fb ? "" : '<div class="ua-card ua-bank"><div class="ua-pool" id="ua-pool"></div></div>') +
          '<p class="ua-feedback" id="ua-feedback" role="status"></p>' +
          (fb
            ? '<button type="button" class="ua-btn ua-next" data-act="next">' +
              (last ? "See results" : "Next →") + "</button>"
            : "") +
        "</section>" +
      "</div>"
    );
  }

  function render() {
    var pct = progressPct();
    var prev = S.lastPct;
    var count;
    var body;

    if (S.phase === "start") {
      count = ITEMS.length + " words";
      body = renderStart();
    } else if (S.phase === "done") {
      count = ITEMS.length + "/" + ITEMS.length;
      body = renderDone();
    } else {
      count = (S.index + 1) + "/" + S.order.length;
      body = renderRound();
    }

    app.innerHTML =
      '<div class="ua-shell ua-screen">' +
        topbar(count, pct) +
        body +
      "</div>";

    // Animate the progress bar from its previous value
    var bar = app.querySelector(".ua-bar i");
    if (bar) {
      bar.style.width = prev + "%";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.width = pct + "%"; });
      });
    }
    S.lastPct = pct;

    renderBoard();
  }

  // Updates only the answer row, word bank and feedback line (no full rebuild)
  function renderBoard() {
    var slotsEl = document.getElementById("ua-slots");
    var poolEl = document.getElementById("ua-pool");
    var fbEl = document.getElementById("ua-feedback");
    var fb = S.phase === "feedback";

    if (slotsEl) {
      slotsEl.innerHTML = S.slots.map(function (s, i) {
        if (fb && s) {
          return '<span class="ua-chip is-ok">' + esc(s.ch) + "</span>";
        }
        if (!s) return '<span class="ua-gap" aria-hidden="true"></span>';
        var cls = "ua-chip" +
          (S.bad ? " is-bad" : "") +
          (s.uid === S.lastUid ? " is-pop" : "");
        return '<button type="button" class="' + cls + '" data-act="undo" data-i="' + i +
          '" aria-label="Remove ' + esc(s.ch) + '">' + esc(s.ch) + "</button>";
      }).join("");
    }

    if (poolEl) {
      poolEl.innerHTML = S.pool.map(function (t) {
        if (t.used) {
          return '<span class="ua-tile is-used" aria-hidden="true">' + esc(t.ch) + "</span>";
        }
        return '<button type="button" class="ua-tile" data-act="pick" data-uid="' + t.uid +
          '" aria-label="Add ' + esc(t.ch) + '">' + esc(t.ch) + "</button>";
      }).join("");
    }

    if (fbEl) {
      if (fb) {
        fbEl.className = "ua-feedback ok";
        fbEl.textContent = "✓ Correct!";
      } else if (S.bad) {
        fbEl.className = "ua-feedback bad";
        fbEl.textContent = "Not quite — try again";
      } else {
        fbEl.className = "ua-feedback";
        fbEl.textContent = "";
      }
    }
  }

  /* ---------- events (delegated, bound once) ---------- */

  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    var act = el.getAttribute("data-act");

    if (act === "start") { sfx("click"); startGame(); }
    else if (act === "play") { sfx("click"); playAudio(); }
    else if (act === "pick") { placeTile(+el.getAttribute("data-uid")); }
    else if (act === "undo") { removeSlot(+el.getAttribute("data-i")); }
    else if (act === "next") { nextRound(); }
    else if (act === "again") { startGame(); }
  });

  // Stop audio when the page is hidden
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopAudio();
  });

  // Preload images
  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  S.phase = "start";
  render();
})();
