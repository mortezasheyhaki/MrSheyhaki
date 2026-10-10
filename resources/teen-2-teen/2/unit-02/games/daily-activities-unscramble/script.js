/* ===== Arcade FX: progress bar, combo, milestone celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [["🌟","Awesome!","10 correct answers!"],["🚀","Superstar!","20 correct — unstoppable!"],["👑","Legend!","30 correct — the best of the best!"]];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) { return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : ""; }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) { el = document.createElement("div"); el.id = "afx-combo"; el.className = "afx-combo"; document.body.appendChild(el); }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = (document.getElementById("game-app") || document.getElementById("app"));
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) { burst(CHEERS[Math.min(Math.floor(n / 10) - 1, 2)]); }
  function burst(c) {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.1, i * 0.09); });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div"); ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 44; i++) h += '<i style="left:' + Math.random() * 100 + "%;background:" + cols[i % 6] + ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" + (1.3 + Math.random() * 0.9).toFixed(2) + 's"></i>';
    ov.innerHTML = h + '<div class="afx-card"><div class="afx-emoji">' + c[0] + '</div><div class="afx-title">' + c[1] + '</div><div class="afx-sub">' + c[2] + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) { var st = L.startTimer; L.__afx = 1; L.startTimer = function () { api.reset(); return st.apply(this, arguments); }; }
  }
  var api = window.ArcadeFX = {
    track: null,
    bar: function (pct) {
      var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
      var bar = app.querySelector(".afx-bar");
      if (!bar) {
        var anchor = app.querySelector('[id*="rogress"]') || app.querySelector("header"); if (!anchor) return;
        var host = anchor.closest("header") || anchor.parentElement;
        bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
        host.parentNode.insertBefore(bar, host.nextSibling);
      }
      var fill = bar.firstChild; lastPct = pct;
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
    },
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0 && !api.noMilestone) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || ("Part " + (i + 1) + " of " + n + " complete")]);
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"],[id*="rogress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^(?:[A-Za-z]{1,9}\s*)?\d+\s*(?:\/|of)\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class*="-bar-fill"],[class*="-progress-fill"]')) return;
    if (!badge && api.track) { try { api.bar(api.track()); } catch (e) {} return; }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(?:[A-Za-z]{1,9}\s*)?(\d+)\s*(?:\/|of)\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
    if (!bar) {
      var host = badge.closest("header") || badge.parentElement;
      bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
      host.parentNode.insertBefore(bar, host.nextSibling);
    }
    var fill = bar.firstChild; lastPct = pct;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
  }
  var q = 0;
  function start() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Unscramble Daily Activities – Teen2Teen 2 Unit 2 */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-daily-activities-unscramble";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "babysit", label: "babysit my little brother", word: "babysit my little brother", emoji: "👶",
      image: CDN + "m7207_babysit_my_little_brother.png", audio: CDN + "j07180_babysit_my_little_brother.mp3" },
    { id: "homework", label: "do homework", word: "do homework", emoji: "📚",
      image: CDN + "q952971_do_homework_2.png", audio: CDN + "t69422_do_homework.mp3" },
    { id: "breakfast", label: "have breakfast", word: "have breakfast", emoji: "🍳",
      image: CDN + "w781607__breakfast.png", audio: CDN + "h90907__breakfast.mp3" },
    { id: "dinner", label: "have dinner", word: "have dinner", emoji: "🍽️",
      image: CDN + "w4137__dinner.png", audio: CDN + "h990237__dinner.mp3" },
    { id: "lunch", label: "have lunch", word: "have lunch", emoji: "🥗",
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
      image: CDN + "q36681_Watch_TV_2.png", audio: CDN + "h993857_watch_TV.mp3" },
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | feedback | done
  var order = [];
  var index = 0;
  var correctCount = 0;
  var currentAudio = null;
  var slots = [];
  var pool = [];
  var checked = false;
  var lastCorrect = false;
  var uidCounter = 0;
  var sfxCtx = null;
  var playingAudio = false;

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
    if (sfxCtx.state === "suspended") {
      try {
        sfxCtx.resume();
      } catch (_) {}
    }
    return sfxCtx;
  }

  function tone(freq, dur, type, gain, delay) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.12), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    if (window.ArcadeFX) { if (name === "good" || name === "correct") ArcadeFX.ok(); else if (name === "bad" || name === "wrong") ArcadeFX.bad(); }
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) LASfx.correct();
        else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
        else if (name === "click" && LASfx.click) LASfx.click();
        else if (name === "pop" && LASfx.pop) LASfx.pop();
        else if (name === "win" && LASfx.win) LASfx.win();
      }
    } catch (_) {}
    try {
      if (name === "click" || name === "place") {
        tone(480, 0.04, "triangle", 0.08);
      } else if (name === "correct") {
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
    } catch (_) {}
  }

  function current() {
    return ITEMS[order[index]];
  }

  function letterList(word) {
    return word.split("").map(function (ch) {
      return ch === " " || ch === "-" ? ch : ch;
    });
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(
      ITEMS.map(function (_, i) {
        return i;
      })
    );
    index = 0;
    correctCount = 0;
    startRound();
  }

  function startRound() {
    var c = current();
    var letters = letterList(c.word);
    slots = letters.map(function (ch) {
      if (ch === " " || ch === "-") return { type: "space", ch: ch };
      return { type: "empty", ch: null, uid: null };
    });
    var scramble = letters.filter(function (ch) {
      return ch !== " " && ch !== "-";
    });
    var scrambled = shuffle(scramble);
    var tries = 0;
    while (
      scrambled.join("") === scramble.join("") &&
      scramble.length > 1 &&
      tries < 20
    ) {
      scrambled = shuffle(scramble);
      tries++;
    }
    pool = scrambled.map(function (ch) {
      return { ch: ch, uid: ++uidCounter, used: false };
    });
    checked = false;
    lastCorrect = false;
    phase = "play";
    render();
    setTimeout(function () {
      playAudio();
    }, 350);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    playingAudio = false;
    var btn = document.getElementById("uc-play");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    var c = current();
    if (!c || !c.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(c.audio);
      playingAudio = true;
      var btn = document.getElementById("uc-play");
      if (btn) btn.classList.add("is-playing");
      currentAudio.onended = function () {
        playingAudio = false;
        if (btn) btn.classList.remove("is-playing");
        currentAudio = null;
      };
      currentAudio.onerror = function () {
        playingAudio = false;
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.play().catch(function () {
        playingAudio = false;
        if (btn) btn.classList.remove("is-playing");
      });
    } catch (_) {
      playingAudio = false;
    }
  }

  function firstEmptySlot() {
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].type === "empty" && !slots[i].ch) return i;
    }
    return -1;
  }

  function placeLetter(uid) {
    if (checked) return;
    var tile = null;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].uid === uid && !pool[i].used) {
        tile = pool[i];
        break;
      }
    }
    if (!tile) return;
    var si = firstEmptySlot();
    if (si < 0) return;
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    sfx("place");
    renderPlayPartial();
    if (firstEmptySlot() < 0) {
      setTimeout(checkAnswer, 200);
    }
  }

  function removeFromSlot(si) {
    if (checked) return;
    var s = slots[si];
    if (!s || s.type !== "empty" || !s.ch) return;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].uid === s.uid) {
        pool[i].used = false;
        break;
      }
    }
    slots[si] = { type: "empty", ch: null, uid: null };
    sfx("click");
    renderPlayPartial();
  }

  function builtWord() {
    return slots
      .map(function (s) {
        if (s.type === "space") return s.ch || " ";
        return s.ch || "";
      })
      .join("");
  }

  function checkAnswer() {
    if (checked) return;
    var c = current();
    if (
      slots.some(function (s) {
        return s.type === "empty" && !s.ch;
      })
    ) {
      return;
    }
    lastCorrect = builtWord().toLowerCase() === c.word.toLowerCase();
    if (lastCorrect) {
      checked = true;
      correctCount++;
      sfx("correct");
      phase = "feedback";
      render();
    } else {
      // Wrong — shake, then unlock so player can remove letters (like the tile game)
      checked = true;
      sfx("wrong");
      renderPlayPartial();
      setTimeout(function () {
        checked = false;
        // clear "bad" styling by re-render
        renderPlayPartial();
      }, 550);
    }
  }

  function nextRound() {
    stopAudio();
    sfx("click");
    if (index < order.length - 1) {
      if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
      index++;
      startRound();
    } else {
      phase = "done";
      sfx("win");
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlots(interactive) {
    return slots
      .map(function (s, i) {
        if (s.type === "space") {
          return (
            '<span class="uc-space" aria-hidden="true">' +
            (s.ch === "-" ? "-" : "") +
            "</span>"
          );
        }
        if (s.ch) {
          var cls = checked
            ? lastCorrect
              ? "uc-slot filled ok"
              : "uc-slot filled bad"
            : "uc-slot filled";
          var click = interactive && !checked ? ' data-slot="' + i + '"' : "";
          return (
            '<button type="button" class="' +
            cls +
            '"' +
            click +
            ' aria-label="letter ' +
            escapeHtml(s.ch) +
            '">' +
            escapeHtml(s.ch) +
            "</button>"
          );
        }
        return '<span class="uc-slot empty" aria-hidden="true"></span>';
      })
      .join("");
  }

  function renderPool() {
    return pool
      .map(function (tile) {
        if (tile.used) {
          return (
            '<button type="button" class="uc-tile used" disabled aria-hidden="true" tabindex="-1">' +
            escapeHtml(tile.ch) +
            "</button>"
          );
        }
        return (
          '<button type="button" class="uc-tile" data-uid="' +
          tile.uid +
          '" aria-label="letter ' +
          escapeHtml(tile.ch) +
          '">' +
          escapeHtml(tile.ch) +
          "</button>"
        );
      })
      .join("");
  }

  function renderPlayPartial() {
    var slotsEl = document.getElementById("uc-slots");
    var poolEl = document.getElementById("uc-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(true);
      slotsEl.querySelectorAll("[data-slot]").forEach(function (btn) {
        btn.onclick = function () {
          removeFromSlot(+btn.dataset.slot);
        };
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool();
      poolEl.querySelectorAll("[data-uid]").forEach(function (btn) {
        btn.onclick = function () {
          placeLetter(+btn.dataset.uid);
        };
      });
    }
  }

  function bindPlay() {
    var play = document.getElementById("uc-play");
    if (play) {
      play.onclick = function () {
        sfx("click");
        playAudio();
      };
    }
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="uc-topbar">' +
        '<a class="uc-back" href="../" aria-label="Back">←</a>' +
        '<div class="uc-topbar-center">' +
        '<span class="uc-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
        '<span class="uc-title">Unscramble Daily Activities</span>' +
        "</div>" +
        '<span class="uc-badge">' +
        ITEMS.length +
        "</span>" +
        "</header>" +
        '<section class="uc-start">' +
        '<div class="uc-hero">🔤</div>' +
        "<h1>Unscramble Daily Activities</h1>" +
        '<p class="uc-desc">Look at the picture, listen to the word, then put the letters in the right order.</p>' +
        '<button type="button" class="uc-btn" id="uc-start">Start</button>' +
        "</section>";
      document.getElementById("uc-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "done") {
      var total = ITEMS.length;
      var stars =
        correctCount === total
          ? 3
          : correctCount >= total - 2
            ? 2
            : correctCount >= Math.ceil(total / 2)
              ? 1
              : 0;
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: total,
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
      }
      if (window.LAStars) {
        try {
          LAStars.recordPlay(GAME_ID);
          LAStars.save(GAME_ID, stars);
        } catch (_) {}
      }
      app.innerHTML =
        '<section class="uc-start"><h1>Done!</h1><p>' +
        correctCount +
        "/" +
        total +
        '</p><button type="button" class="uc-btn" id="fb-again">Again</button></section>';
      document.getElementById("fb-again").onclick = startGame;
      return;
    }

    var c = current();
    var progress = index + 1 + "/" + order.length;

    if (phase === "feedback") {
      app.innerHTML =
        '<header class="uc-topbar">' +
        '<a class="uc-back" href="../" aria-label="Back">←</a>' +
        '<div class="uc-topbar-center">' +
        '<span class="uc-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
        '<span class="uc-title">Unscramble Daily Activities</span>' +
        "</div>" +
        '<span class="uc-badge">' +
        progress +
        "</span>" +
        "</header>" +
        '<div class="uc-scroll">' +
        '<div class="uc-card uc-card-photo">' +
        '<img class="uc-photo" src="' +
        c.image +
        '" alt="' +
        escapeHtml(c.label) +
        '" draggable="false" onerror="this.style.display=\'none\'" />' +
        '<button type="button" class="uc-audio-btn mc-play" id="uc-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        "</div>" +
        '<div class="uc-card uc-card-word">' +
        '<p class="uc-feedback ' +
        (lastCorrect ? "ok" : "bad") +
        '">' +
        (lastCorrect ? "✓ Correct!" : "✗ Not quite") +
        "</p>" +
        '<div class="uc-slots locked">' +
        renderSlots(false) +
        "</div>" +
        (!lastCorrect
          ? '<p class="uc-answer-reveal">Answer: <strong>' +
            escapeHtml(c.word) +
            "</strong></p>"
          : "") +
        '<p class="uc-country-name">' +
        escapeHtml(c.label) +
        "</p>" +
        "</div>" +
        '<button type="button" class="uc-btn uc-btn-next" id="uc-next">' +
        (index < order.length - 1 ? "Next →" : "See results") +
        "</button>" +
        "</div>";
      document.getElementById("uc-next").onclick = nextRound;
      bindPlay();
      return;
    }

    // play
    app.innerHTML =
      '<header class="uc-topbar">' +
      '<a class="uc-back" href="../" aria-label="Back">←</a>' +
      '<div class="uc-topbar-center">' +
      '<span class="uc-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
      '<span class="uc-title">Unscramble Daily Activities</span>' +
      "</div>" +
      '<span class="uc-badge">' +
      progress +
      "</span>" +
      "</header>" +
      '<p class="uc-instruction">Tap letters to spell the word · use <strong>Play</strong> to listen</p>' +
      '<div class="uc-scroll">' +
      '<div class="uc-card uc-card-photo">' +
      '<img class="uc-photo" src="' +
      c.image +
      '" alt="' +
      escapeHtml(c.label) +
      '" draggable="false" onerror="this.style.display=\'none\'" />' +
      '<button type="button" class="uc-audio-btn mc-play" id="uc-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
      "</div>" +
      '<div class="uc-card uc-card-word">' +
      '<div class="uc-slots" id="uc-slots">' +
      renderSlots(true) +
      "</div>" +
      "</div>" +
      '<div class="uc-card uc-card-pool">' +
      '<div class="uc-pool" id="uc-pool">' +
      renderPool() +
      "</div>" +
      '<button type="button" class="uc-btn-check" id="uc-check">Check</button>' +
      "</div>" +
      "</div>";

    bindPlay();
    document.getElementById("uc-check").onclick = function () {
      sfx("click");
      checkAnswer();
    };
    document.getElementById("uc-slots").querySelectorAll("[data-slot]").forEach(function (btn) {
      btn.onclick = function () {
        removeFromSlot(+btn.dataset.slot);
      };
    });
    document.getElementById("uc-pool").querySelectorAll("[data-uid]").forEach(function (btn) {
      btn.onclick = function () {
        placeLetter(+btn.dataset.uid);
      };
    });
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
