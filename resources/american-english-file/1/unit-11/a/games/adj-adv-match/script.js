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

/* Adjectives → Adverbs Match – 1 part × 2 sets of 5 – AEF 1 Unit 11A */
(function () {
  "use strict";

  var GAME_ID = "1-11a-adj-adv-match";

  var ITEMS = [
    { id: "slow",     adj: "slow",     adv: "slowly" },
    { id: "quick",    adj: "quick",    adv: "quickly" },
    { id: "bad",      adj: "bad",      adv: "badly" },
    { id: "careful",  adj: "careful",  adv: "carefully" },
    { id: "healthy",  adj: "healthy",  adv: "healthily" },
    { id: "easy",     adj: "easy",     adv: "easily" },
    { id: "possible", adj: "possible", adv: "possibly" },
    { id: "good",     adj: "good",     adv: "well" },
    { id: "fast",     adj: "fast",     adv: "fast" },
    { id: "hard",     adj: "hard",     adv: "hard" }
  ];

  // 2 fixed sets of 5
  var SETS = [
    ["slow", "quick", "bad", "careful", "healthy"],
    ["easy", "possible", "good", "fast", "hard"]
  ];

  var MODES = [
    {
      id: "adj-adv",
      title: "Adjectives → Adverbs",
      left: "adj",
      right: "adv",
      tip: "Tap an adjective, then match the adverb.",
      encourage: "Awesome matching! 🌟 You finished Adjectives → Adverbs."
    }
  ];

  var TOTAL_PAIRS = MODES.length * SETS.reduce(function (n, set) { return n + set.length; }, 0);
  var SET_SIZE = 5;

  var app = document.getElementById("game-app");
  if (!app) return;

  var modeIndex = 0;
  var phase = "menu"; // menu | play | done
  var setIndex = 0;
  var leftOrder = [];
  var rightOrder = [];
  var locked = {};
  var matches = {};
  var selectedLeft = null;
  var setCorrect = 0;
  var modeCorrect = 0;
  var totalCorrect = 0;
  var totalWrong = 0;
  var lives = 3;
  var busy = false;

  function byId(id) {
    return ITEMS.find(function (c) {
      return c.id === id;
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var SCREEN_LEAVE_MS = 190;

  function playExit(cb) {
    var scr = app.querySelector(".mc-screen");
    if (!scr) {
      cb();
      return;
    }
    scr.classList.add("mc-screen-leave");
    setTimeout(cb, SCREEN_LEAVE_MS);
  }

  var sfxCtx = null;

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") {
      try { sfxCtx.resume(); } catch (e) {}
    }
    return sfxCtx;
  }

  function sfx(type) {
    if (window.LASfx && typeof window.LASfx.play === "function") {
      try { window.LASfx.play(type); return; } catch (e) {}
    }
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime;
    try {
      if (type === "click") {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = 880;
        g.gain.setValueAtTime(0.06, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
        o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.1);
      } else if (type === "correct" || type === "pop") {
        [523, 659, 784].forEach(function (f, i) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "triangle"; o.frequency.value = f;
          g.gain.setValueAtTime(0.07, t0 + i * 0.05); g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.05 + 0.15);
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
          g.gain.setValueAtTime(0.08, t0 + i * 0.1); g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.1 + 0.3);
          o.connect(g); g.connect(ctx.destination); o.start(t0 + i * 0.1); o.stop(t0 + i * 0.1 + 0.35);
        });
      }
    } catch (e) {}
  }

  function sfxHeartBreak() {
    sfx("wrong");
  }

  function startPart(mi) {
    if (window.LAFinish && mi === 0) LAFinish.startTimer();
    modeIndex = mi;
    if (mi === 0) lives = 3;
    phase = "play";
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    var ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    locked = {};
    matches = {};
    selectedLeft = null;
    setCorrect = 0;
    busy = false;
    phase = "play";
    render();
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === SETS[setIndex].length;
  }

  function heartsHtml() {
    var h = '<div class="mc-hearts" id="mc-hearts" aria-label="Lives">';
    for (var i = 0; i < 3; i++) {
      if (i < lives) {
        h += '<span class="mc-heart is-full" data-i="' + i + '">♥</span>';
      } else {
        h += '<span class="mc-heart is-broken" data-i="' + i + '">♡</span>';
      }
    }
    return h + "</div>";
  }

  function renderHearts() {
    var root = document.getElementById("mc-hearts");
    if (!root) return;
    var nodes = root.querySelectorAll(".mc-heart");
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
    var root = document.getElementById("mc-hearts");
    var el = root ? root.querySelector('.mc-heart[data-i="' + loseIndex + '"]') : null;
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

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach(function (el) {
      if (!el) return;
      el.classList.add("mc-match-pop");
      for (var i = 0; i < 8; i++) {
        var s = document.createElement("span");
        s.className = "mc-spark";
        var angle = (i / 8) * Math.PI * 2;
        var dist = 28 + Math.random() * 18;
        s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        s.style.setProperty("--delay", i * 0.02 + "s");
        el.appendChild(s);
        setTimeout(function (node) {
          return function () { node.remove(); };
        }(s), 700);
      }
      setTimeout(function (node) {
        return function () { node.classList.remove("mc-match-pop"); };
      }(el), 520);
    });
    var flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 500);
    if (window.ArcadeFX) ArcadeFX.ok();
  }

  function selectLeft(i) {
    if (busy || locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    sfx("click");
  }

  function selectRight(rightId) {
    if (busy) return;
    if (selectedLeft === null) {
      var hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = "Tap an adjective on the left first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(function () {
          hint.classList.remove("mc-hint-warn");
          hint.textContent = MODES[modeIndex].tip;
        }, 1200);
      }
      sfx("wrong");
      return;
    }
    var used = Object.keys(locked).some(function (li) {
      return matches[li] === rightId;
    });
    if (used) return;

    var leftId = leftOrder[selectedLeft];
    var ok = leftId === rightId;
    var leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    var rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (ok) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      setCorrect += 1;
      modeCorrect += 1;
      totalCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      spawnMatchFX(leftEl, rightEl);
      sfx("pop");
      sfx("correct");
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach(function (el) {
        el.classList.remove("is-selected");
      });
      updateProgress();
      if (allMatched()) {
        busy = true;
        setTimeout(function () {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            sfx("win");
            if (window.ArcadeFX) ArcadeFX.cheer(modeIndex, MODES.length);
            phase = "done";
            render();
          }
        }, 650);
      }
    } else {
      busy = true;
      totalWrong += 1;
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      sfx("wrong");
      if (window.ArcadeFX) ArcadeFX.bad();
      setTimeout(function () {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 500);
      breakHeart(function () {
        busy = false;
      });
    }
  }

  function updateProgress() {
    var el = document.getElementById("mc-progress");
    if (!el) return;
    var full =
      "Set " +
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/" +
      SET_SIZE;
    var short =
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/" +
      SET_SIZE;
    var fullEl = el.querySelector(".mc-prog-full");
    var shortEl = el.querySelector(".mc-prog-short");
    if (fullEl && shortEl) {
      fullEl.textContent = full;
      shortEl.textContent = short;
    } else {
      el.textContent = full;
    }
    var fill = document.getElementById("mc-set-progress-fill");
    if (fill) fill.style.width = Math.round((correctCount() / SET_SIZE) * 100) + "%";
  }

  function calcAccuracy() {
    var attempts = totalCorrect + totalWrong;
    if (attempts <= 0) return 0;
    return Math.round((totalCorrect / attempts) * 100);
  }

  function calcStars() {
    // Accuracy-based (same thresholds as LAStars.saveFromAccuracy)
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

  function leftCell(id, i) {
    var c = byId(id);
    var isLocked = !!locked[i];
    var sel = selectedLeft === i ? " is-selected" : "";
    var ok = isLocked ? " is-correct" : "";
    return (
      '<div class="mc-left-item mc-word-left' +
      ok +
      sel +
      '" data-i="' +
      i +
      '">' +
      '<span class="mc-word-label">' +
      c.adj +
      "</span></div>"
    );
  }

  function rightCell(id) {
    var c = byId(id);
    var used = Object.keys(locked).some(function (li) {
      return matches[li] === id;
    });
    var usedClass = used ? " is-correct is-used" : "";
    var disabled = used ? " disabled" : "";
    return (
      '<button type="button" class="mc-right-item mc-word' +
      usedClass +
      '" data-id="' +
      id +
      '"' +
      disabled +
      ">" +
      '<span class="mc-word-label">' +
      c.adv +
      "</span></button>"
    );
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<div class="mc-screen">' +
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Adj → Adv Match</span>' +
        '<span class="mc-badge">Unit 11A</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">📝</div>' +
        "<h1>Adjectives → Adverbs</h1>" +
        '<p class="mc-desc">2 sets of 5 · 3 hearts</p>' +
        '<p class="mc-desc" style="margin-top:8px">Match each adjective to its adverb.</p>' +
        '<button type="button" class="mc-btn mc-start-btn" id="mc-start">Start</button>' +
        "</section>" +
        "</div>";
      document.getElementById("mc-start").onclick = function () {
        sfx("click");
        playExit(function () {
          totalCorrect = 0;
          totalWrong = 0;
          startPart(0);
        });
      };
      return;
    }

    if (phase === "done") {
      var stars = saveStars();
      if (window.LAFinish) {
        try {
          var timeMs = LAFinish.stopTimer();
          LAFinish.show({
            gameId: GAME_ID,
            score: totalCorrect,
            total: TOTAL_PAIRS,
            accuracy: calcAccuracy(),
            stars: stars,
            timeMs: timeMs,
            save: false,
            onAgain: function () {
              playExit(function () {
                totalCorrect = 0;
                totalWrong = 0;
                startPart(0);
              });
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
      // Fallback finish UI with stars
      app.innerHTML =
        '<div class="mc-screen">' +
        '<section class="mc-done">' +
        "<h1>Done!</h1>" +
        "<p>You matched " + totalCorrect + "/" + TOTAL_PAIRS + ".</p>" +
        '<p class="mc-stars-fallback" style="font-size:1.6rem;margin:12px 0">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) +
        "</p>" +
        "<p>Accuracy: " + calcAccuracy() + "%</p>" +
        '<button type="button" class="mc-btn" id="cm-again">Again</button>' +
        "</section>" +
        "</div>";
      document.getElementById("cm-again").onclick = function () {
        sfx("click");
        playExit(function () {
          totalCorrect = 0;
          totalWrong = 0;
          startPart(0);
        });
      };
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var left = leftOrder
      .map(function (id, i) {
        return leftCell(id, i);
      })
      .join("");
    var right = rightOrder
      .map(function (id) {
        return rightCell(id);
      })
      .join("");

    var progressPct = Math.round((correctCount() / SET_SIZE) * 100);
    app.innerHTML =
      '<div class="mc-screen">' +
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title" title="' +
      mode.title +
      '"><span class="mc-title-full">' +
      mode.title +
      '</span><span class="mc-title-short">Adj → Adv</span></span>' +
      heartsHtml() +
      '<span class="mc-progress" id="mc-progress">' +
      '<span class="mc-prog-full">Set ' +
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/" +
      SET_SIZE +
      '</span><span class="mc-prog-short">' +
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/" +
      SET_SIZE +
      "</span></span>" +
      "</header>" +
      '<p class="mc-instruction" id="mc-hint">' +
      mode.tip +
      "</p>" +
      '<div class="mc-set-progress" aria-hidden="true">' +
      '<span class="mc-set-progress-fill" id="mc-set-progress-fill" style="width:' +
      progressPct +
      '%"></span>' +
      "</div>" +
      '<div class="mc-board is-entering">' +
      '<div class="mc-col mc-col-left">' +
      left +
      "</div>" +
      '<div class="mc-col mc-col-right">' +
      right +
      "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>' +
      "</div>" +
      "</div>";

    setTimeout(function () {
      var board = app.querySelector(".mc-board");
      if (board) board.classList.remove("is-entering");
    }, 500);

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () {
        selectLeft(+el.dataset.i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (btn) {
      btn.onclick = function () {
        selectRight(btn.dataset.id);
      };
    });
    document.getElementById("mc-reset").onclick = function () {
      sfx("click");
      playExit(function () {
        startSet(setIndex);
      });
    };
  }

  render();
})();
