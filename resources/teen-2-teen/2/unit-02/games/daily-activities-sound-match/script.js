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

/* Sound Match Picture – Daily Activities · Teen2Teen 2 Unit 2
   Based on Unit 10 Clothes Sound Match Picture + heart-break SFX */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-daily-activities-sound-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ALL = [
    { id: "babysit", word: "babysit my little brother", emoji: "👶", image: CDN + "m7207_babysit_my_little_brother.png", audio: CDN + "j07180_babysit_my_little_brother.mp3" },
    { id: "homework", word: "do homework", emoji: "📚", image: CDN + "q952971_do_homework_2.png", audio: CDN + "t69422_do_homework.mp3" },
    { id: "breakfast", word: "have breakfast", emoji: "🍳", image: CDN + "w781607__breakfast.png", audio: CDN + "h90907__breakfast.mp3" },
    { id: "dinner", word: "have dinner", emoji: "🍽️", image: CDN + "w4137__dinner.png", audio: CDN + "h990237__dinner.mp3" },
    { id: "lunch", word: "have lunch", emoji: "🥗", image: CDN + "i005905__lunch.png", audio: CDN + "h01685__lunch.mp3" },
    { id: "help-mom", word: "help my mom", emoji: "🧺", image: CDN + "k787298_help_my_mom.png", audio: CDN + "h55057_help_my_mom.mp3" },
    { id: "music", word: "listen to music", emoji: "🎧", image: CDN + "p170331_listen_to_music_2.png", audio: CDN + "k631484_listen_to_music.mp3" },
    { id: "computer-games", word: "play computer games", emoji: "🎮", image: CDN + "x9833_ay_computer_games.png", audio: CDN + "m776279_ay_computer_games.mp3" },
    { id: "cat", word: "play with my cat", emoji: "🐱", image: CDN + "d307932_ay_with_my_cat.png", audio: CDN + "m702010_ay_with_my_cat.mp3" },
    { id: "book", word: "read a book", emoji: "📖", image: CDN + "e170364_read_a_book_2.png", audio: CDN + "q536626_read_a_book.mp3" },
    { id: "phone", word: "talk on the phone", emoji: "📱", image: CDN + "o283420_talk_on_the_phone.png", audio: CDN + "h4106_talk_on_the_phone.mp3" },
    { id: "tv", word: "watch TV", emoji: "📺", image: CDN + "q36681_Watch_TV_2.png", audio: CDN + "h993857_watch_TV.mp3" },
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

  function sfxOk() { window.ArcadeFX && ArcadeFX.ok();
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

  function sfxBad() { window.ArcadeFX && ArcadeFX.bad();
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
      if (window.ArcadeFX && order.length >= 8 && orderIndex === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + orderIndex + " of " + order.length + " done");
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
