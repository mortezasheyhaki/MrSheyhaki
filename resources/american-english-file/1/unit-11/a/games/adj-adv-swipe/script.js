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
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class$="-track"],[class*="-bar-fill"],[class*="-track-fill"],[class*="-progress-fill"]')) return;
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

/* Adjective or Adverb? – Swipe left = adj, right = adv – AEF 1 Unit 11A */
(function () {
  "use strict";

  var GAME_ID = "1-11a-adj-adv-swipe";

  // type: "adj" | "adv" | "both" (fast / hard work as either)
  var CARDS = [
    { word: "slow", type: "adj" },
    { word: "slowly", type: "adv" },
    { word: "quick", type: "adj" },
    { word: "quickly", type: "adv" },
    { word: "bad", type: "adj" },
    { word: "badly", type: "adv" },
    { word: "careful", type: "adj" },
    { word: "carefully", type: "adv" },
    { word: "healthy", type: "adj" },
    { word: "healthily", type: "adv" },
    { word: "easy", type: "adj" },
    { word: "easily", type: "adv" },
    { word: "possible", type: "adj" },
    { word: "possibly", type: "adv" },
    { word: "good", type: "adj" },
    { word: "well", type: "adv" },
    { word: "fast", type: "both" },
    { word: "hard", type: "both" }
  ];

  var TOTAL = CARDS.length;
  var THRESHOLD = 90; // px to commit swipe

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "menu"; // menu | play | done
  var deck = [];
  var index = 0;
  var correct = 0;
  var wrong = 0;
  var lives = 3;
  var busy = false;

  // drag state
  var dragging = false;
  var startX = 0;
  var startY = 0;
  var curX = 0;
  var cardEl = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function playExit(cb) {
    var scr = app.querySelector(".sw-screen");
    if (!scr) { cb(); return; }
    scr.classList.add("sw-leave");
    setTimeout(cb, 180);
  }

  function sfx(type) {
    if (window.LASfx && typeof window.LASfx.play === "function") {
      try { window.LASfx.play(type); return; } catch (e) {}
    }
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var t0 = ctx.currentTime;
      if (type === "click") {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 880; o.type = "sine";
        g.gain.setValueAtTime(0.06, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
        o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.1);
      } else if (type === "correct" || type === "pop") {
        [523, 659, 784].forEach(function (f, i) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "triangle"; o.frequency.value = f;
          g.gain.setValueAtTime(0.07, t0 + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.05 + 0.15);
          o.connect(g); g.connect(ctx.destination); o.start(t0 + i * 0.05); o.stop(t0 + i * 0.05 + 0.18);
        });
      } else if (type === "wrong") {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sawtooth"; o.frequency.value = 180;
        g.gain.setValueAtTime(0.06, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
        o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.28);
      } else if (type === "win") {
        [523, 659, 784, 1047].forEach(function (f, i) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "sine"; o.frequency.value = f;
          g.gain.setValueAtTime(0.08, t0 + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.1 + 0.3);
          o.connect(g); g.connect(ctx.destination); o.start(t0 + i * 0.1); o.stop(t0 + i * 0.1 + 0.35);
        });
      }
    } catch (e) {}
  }

  function calcAccuracy() {
    var attempts = correct + wrong;
    if (attempts <= 0) return 0;
    return Math.round((correct / attempts) * 100);
  }

  function calcStars() {
    var acc = calcAccuracy();
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function saveStars() {
    var stars = calcStars();
    var acc = calcAccuracy();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (typeof LAStars.saveFromAccuracy === "function") {
          stars = LAStars.saveFromAccuracy(GAME_ID, acc);
        } else {
          LAStars.save(GAME_ID, stars);
        }
      } catch (_) {}
    }
    return stars;
  }

  function heartsHtml() {
    var h = '<div class="sw-hearts" id="sw-hearts" aria-label="Lives">';
    for (var i = 0; i < 3; i++) {
      h += i < lives
        ? '<span class="sw-heart is-full" data-i="' + i + '">♥</span>'
        : '<span class="sw-heart is-broken" data-i="' + i + '">♡</span>';
    }
    return h + "</div>";
  }

  function breakHeart(done) {
    if (lives <= 0) { if (done) done(); return; }
    var loseIndex = lives - 1;
    lives -= 1;
    sfx("wrong");
    var root = document.getElementById("sw-hearts");
    var el = root ? root.querySelector('.sw-heart[data-i="' + loseIndex + '"]') : null;
    if (el) {
      el.classList.remove("is-full");
      el.classList.add("is-breaking");
      setTimeout(function () {
        el.classList.remove("is-breaking");
        el.classList.add("is-broken");
        el.textContent = "♡";
        if (done) done();
      }, 450);
    } else if (done) done();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    deck = shuffle(CARDS);
    index = 0;
    correct = 0;
    wrong = 0;
    lives = 3;
    busy = false;
    phase = "play";
    render();
  }

  function isCorrect(choice) {
    // choice: "adj" | "adv"
    var card = deck[index];
    if (!card) return false;
    if (card.type === "both") return true;
    return card.type === choice;
  }

  function answer(choice) {
    if (busy || phase !== "play") return;
    busy = true;
    var card = deck[index];
    var ok = isCorrect(choice);
    var el = cardEl || app.querySelector(".sw-card");

    // show stamp
    if (el) {
      var stampAdj = el.querySelector(".sw-stamp-adj");
      var stampAdv = el.querySelector(".sw-stamp-adv");
      if (choice === "adj" && stampAdj) stampAdj.classList.add("is-show");
      if (choice === "adv" && stampAdv) stampAdv.classList.add("is-show");
    }

    if (ok) {
      correct += 1;
      if (el) el.classList.add("is-correct");
      sfx("correct");
      if (window.ArcadeFX) ArcadeFX.ok();
      flyOut(choice, function () {
        nextCard();
      });
    } else {
      wrong += 1;
      if (el) el.classList.add("is-wrong");
      sfx("wrong");
      if (window.ArcadeFX) ArcadeFX.bad();
      breakHeart(function () {
        setTimeout(function () {
          if (el) {
            el.classList.remove("is-wrong");
            el.querySelectorAll(".sw-stamp").forEach(function (s) {
              s.classList.remove("is-show");
            });
            el.style.transform = "";
          }
          busy = false;
        }, 400);
      });
    }
    updateBar();
  }

  function flyOut(choice, cb) {
    var el = cardEl || app.querySelector(".sw-card");
    if (!el) { cb(); return; }
    var dir = choice === "adj" ? -1 : 1;
    el.style.transition = "transform 0.28s ease, opacity 0.28s ease";
    el.style.transform = "translateX(" + (dir * 420) + "px) rotate(" + (dir * 18) + "deg)";
    el.style.opacity = "0";
    setTimeout(cb, 280);
  }

  function nextCard() {
    index += 1;
    if (index >= deck.length) {
      finish();
      return;
    }
    busy = false;
    renderPlayCard();
  }

  function finish() {
    phase = "done";
    sfx("win");
    var stars = saveStars();
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correct,
          total: TOTAL,
          accuracy: calcAccuracy(),
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: function () {
            playExit(function () { startGame(); });
          },
          onModes: function () {
            playExit(function () {
              phase = "menu";
              render();
            });
          },
          backHref: "../"
        });
        return;
      } catch (e) {}
    }
    render();
  }

  function updateBar() {
    var fill = app.querySelector(".sw-bar > i");
    if (fill) fill.style.width = Math.round(((index + (busy ? 1 : 0)) / TOTAL) * 100) + "%";
    var prog = document.getElementById("sw-progress");
    if (prog) prog.textContent = Math.min(index + 1, TOTAL) + "/" + TOTAL;
  }

  /* ── Drag / swipe handlers ── */
  function onPointerDown(e) {
    if (busy || phase !== "play") return;
    var el = e.target.closest(".sw-card");
    if (!el) return;
    dragging = true;
    cardEl = el;
    el.classList.add("is-dragging");
    el.style.transition = "none";
    var pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX;
    startY = pt.clientY;
    curX = 0;
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging || !cardEl) return;
    var pt = e.touches ? e.touches[0] : e;
    curX = pt.clientX - startX;
    var dy = (pt.clientY - startY) * 0.15;
    var rot = curX * 0.06;
    cardEl.style.transform = "translate(" + curX + "px," + dy + "px) rotate(" + rot + "deg)";

    // side highlights + stamps
    var leftSide = app.querySelector(".sw-side-left");
    var rightSide = app.querySelector(".sw-side-right");
    var stampAdj = cardEl.querySelector(".sw-stamp-adj");
    var stampAdv = cardEl.querySelector(".sw-stamp-adv");
    if (curX < -30) {
      if (leftSide) leftSide.classList.add("is-active");
      if (rightSide) rightSide.classList.remove("is-active");
      if (stampAdj) stampAdj.classList.add("is-show");
      if (stampAdv) stampAdv.classList.remove("is-show");
    } else if (curX > 30) {
      if (rightSide) rightSide.classList.add("is-active");
      if (leftSide) leftSide.classList.remove("is-active");
      if (stampAdv) stampAdv.classList.add("is-show");
      if (stampAdj) stampAdj.classList.remove("is-show");
    } else {
      if (leftSide) leftSide.classList.remove("is-active");
      if (rightSide) rightSide.classList.remove("is-active");
      if (stampAdj) stampAdj.classList.remove("is-show");
      if (stampAdv) stampAdv.classList.remove("is-show");
    }
    e.preventDefault();
  }

  function onPointerUp() {
    if (!dragging || !cardEl) return;
    dragging = false;
    cardEl.classList.remove("is-dragging");
    app.querySelectorAll(".sw-side").forEach(function (s) {
      s.classList.remove("is-active");
    });

    if (Math.abs(curX) >= THRESHOLD) {
      var choice = curX < 0 ? "adj" : "adv";
      answer(choice);
    } else {
      // snap back
      cardEl.style.transition = "transform 0.25s ease";
      cardEl.style.transform = "";
      cardEl.querySelectorAll(".sw-stamp").forEach(function (s) {
        s.classList.remove("is-show");
      });
    }
    curX = 0;
  }

  function bindDrag() {
    var track = app.querySelector(".sw-track");
    if (!track) return;
    track.addEventListener("mousedown", onPointerDown);
    track.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
  }

  function renderPlayCard() {
    // only re-render the card area to keep listeners simple
    phase = "play";
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<div class="sw-screen">' +
        '<header class="sw-topbar">' +
        '<a class="sw-back" href="../" aria-label="Back">←</a>' +
        '<span class="sw-title">Adj or Adv?</span>' +
        '<span class="sw-badge">Unit 11A</span>' +
        "</header>" +
        '<section class="sw-start">' +
        '<div class="sw-hero" aria-hidden="true">👆</div>' +
        "<h1>Adjective or Adverb?</h1>" +
        '<p class="sw-desc">Swipe or tap — left for adjective, right for adverb.</p>' +
        '<div class="sw-hint-row">' +
        '<span class="sw-hint-left">← Adjective</span>' +
        '<span class="sw-hint-right">Adverb →</span>' +
        "</div>" +
        '<p class="sw-desc">' + TOTAL + ' cards · 3 hearts</p>' +
        '<button type="button" class="sw-btn" id="sw-start">Start</button>' +
        "</section>" +
        "</div>";
      document.getElementById("sw-start").onclick = function () {
        sfx("click");
        playExit(function () { startGame(); });
      };
      return;
    }

    if (phase === "done") {
      var stars = calcStars();
      app.innerHTML =
        '<div class="sw-screen">' +
        '<section class="sw-done">' +
        "<h1>Done!</h1>" +
        '<p class="sw-stars">' + "★".repeat(stars) + "☆".repeat(3 - stars) + "</p>" +
        "<p>Correct: " + correct + "/" + TOTAL + "</p>" +
        "<p>Accuracy: " + calcAccuracy() + "%</p>" +
        '<button type="button" class="sw-btn" id="sw-again">Again</button>' +
        '<button type="button" class="sw-btn secondary" id="sw-menu" style="margin-top:8px">Menu</button>' +
        "</section>" +
        "</div>";
      document.getElementById("sw-again").onclick = function () {
        sfx("click");
        playExit(function () { startGame(); });
      };
      document.getElementById("sw-menu").onclick = function () {
        sfx("click");
        playExit(function () {
          phase = "menu";
          render();
        });
      };
      return;
    }

    // play
    var card = deck[index];
    var pct = Math.round((index / TOTAL) * 100);
    app.innerHTML =
      '<div class="sw-screen">' +
      '<header class="sw-topbar">' +
      '<a class="sw-back" href="../" aria-label="Back">←</a>' +
      '<span class="sw-title">Adj or Adv?</span>' +
      heartsHtml() +
      '<span class="sw-progress" id="sw-progress">' + (index + 1) + "/" + TOTAL + "</span>" +
      "</header>" +
      '<div class="sw-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<div class="sw-play">' +
      '<p class="sw-instruction">Swipe left = adjective · right = adverb</p>' +
      '<div class="sw-track" id="sw-track">' +
      '<div class="sw-side sw-side-left"><span class="sw-side-arrow">←</span>Adjective</div>' +
      '<div class="sw-side sw-side-right"><span class="sw-side-arrow">→</span>Adverb</div>' +
      '<div class="sw-card" id="sw-card">' +
      '<span class="sw-stamp sw-stamp-adj">ADJ</span>' +
      '<span class="sw-stamp sw-stamp-adv">ADV</span>' +
      '<span class="sw-word">' + card.word + "</span>" +
      "</div>" +
      "</div>" +
      '<div class="sw-actions">' +
      '<button type="button" class="sw-choice sw-choice-left" id="sw-adj" aria-label="Adjective">' +
      '<span class="sw-choice-ico">←</span>Adjective</button>' +
      '<button type="button" class="sw-choice sw-choice-right" id="sw-adv" aria-label="Adverb">' +
      '<span class="sw-choice-ico">→</span>Adverb</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    cardEl = document.getElementById("sw-card");
    bindDrag();
    document.getElementById("sw-adj").onclick = function () {
      if (busy) return;
      answer("adj");
    };
    document.getElementById("sw-adv").onclick = function () {
      if (busy) return;
      answer("adv");
    };
  }

  render();
})();
