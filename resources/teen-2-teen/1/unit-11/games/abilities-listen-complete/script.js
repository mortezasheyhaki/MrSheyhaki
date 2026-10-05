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
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; },
    cheer: function (i, n, msg) { if (msg) { var c = ["✨", "Nice!", msg]; burst(c); } }
  };
  function start() {}
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Listen & Complete – Abilities · Teen2Teen 1 Unit 11 */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u11-abilities-listen-complete";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  /*
    parts: alternating fixed strings and blank markers.
    blank answers go in `answers` in order.
    bank: answer chips + distractors (shuffled each round).
  */
  var ITEMS = [
    {
      audio: CDN + "t328395_She_can_ride_a_horse.mp3",
      parts: [{ t: "She" }, { blank: true }, { blank: true }, { t: "a" }, { t: "horse." }],
      answers: ["can", "ride"],
      bank: ["can", "can't", "ride", "swim", "dance"]
    },
    {
      audio: CDN + "e4778_She_can39t_ride_a_horse.mp3",
      parts: [{ t: "She" }, { blank: true }, { blank: true }, { t: "a" }, { t: "horse." }],
      answers: ["can't", "ride"],
      bank: ["can", "can't", "ride", "sing", "swim"]
    },
    {
      audio: CDN + "o783875_He_can_swim.mp3",
      parts: [{ t: "He" }, { blank: true }, { blank: true }, { t: "." }],
      answers: ["can", "swim"],
      bank: ["can", "can't", "swim", "ride", "dance"]
    },
    {
      audio: CDN + "s53349_He_can39t_swim.mp3",
      parts: [{ t: "He" }, { blank: true }, { blank: true }, { t: "." }],
      answers: ["can't", "swim"],
      bank: ["can", "can't", "swim", "sing", "ride"]
    },
    {
      audio: CDN + "w579678_She_can_dance_well.mp3",
      parts: [{ t: "She" }, { blank: true }, { blank: true }, { t: "well." }],
      answers: ["can", "dance"],
      bank: ["can", "can't", "dance", "sing", "swim"]
    },
    {
      audio: CDN + "n87417_She_can39t_dance_well.mp3",
      parts: [{ t: "She" }, { blank: true }, { blank: true }, { t: "well." }],
      answers: ["can't", "dance"],
      bank: ["can", "can't", "dance", "ride", "sing"]
    },
    {
      audio: CDN + "w74964_Yaya_can_sing_well.mp3",
      parts: [{ t: "Yaya" }, { blank: true }, { blank: true }, { t: "well." }],
      answers: ["can", "sing"],
      bank: ["can", "can't", "sing", "dance", "swim"]
    },
    {
      audio: CDN + "l66351_Yaya_can39t_sing_well.mp3",
      parts: [{ t: "Yaya" }, { blank: true }, { blank: true }, { t: "well." }],
      answers: ["can't", "sing"],
      bank: ["can", "can't", "sing", "ride", "dance"]
    }
  ];

  var TOTAL = ITEMS.length;

  var startScreen = document.getElementById("startScreen");
  var gameScreen = document.getElementById("gameScreen");
  var sentenceRow = document.getElementById("sentenceRow");
  var chipBank = document.getElementById("chipBank");
  var playBtn = document.getElementById("playBtn");
  var feedback = document.getElementById("feedback");
  var roundLabel = document.getElementById("roundLabel");
  var progressFill = document.getElementById("progressFill");
  var scoreNum = document.getElementById("scoreNum");
  var startBtn = document.getElementById("startBtn");

  var order = [];
  var index = 0;
  var score = 0;
  var accepting = false;
  var checking = false;
  var currentAudio = null;
  var sfxCtx = null;
  // placed[blankIndex] = { text, bankUid } | null
  var placed = [];
  var bankState = []; // { text, uid, used }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function getSfxCtx() {
    if (sfxCtx) return sfxCtx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) sfxCtx = new AC();
    } catch (e) {}
    return sfxCtx;
  }

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.ok) { LASfx.ok(); return; }
      var ctx = getSfxCtx(); if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      [523, 659, 784].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.08, t + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.18);
        o.connect(g); g.connect(ctx.destination);
        o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.2);
      });
    } catch (e) {}
  }

  function sfxBad() {
    try {
      if (window.LASfx && LASfx.bad) { LASfx.bad(); return; }
      var ctx = getSfxCtx(); if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.25);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.3);
    } catch (e) {}
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    playBtn.classList.remove("playing");
  }

  function playSound() {
    var item = currentItem();
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    playBtn.classList.add("playing");
    a.play().catch(function () {});
    a.onended = function () {
      if (currentAudio === a) {
        playBtn.classList.remove("playing");
        currentAudio = null;
      }
    };
    a.onerror = function () {
      playBtn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function currentItem() {
    if (index < 0 || index >= order.length) return null;
    return ITEMS[order[index]];
  }

  function blankCount(item) {
    return item.answers.length;
  }

  function updateHud() {
    roundLabel.textContent = (index + 1) + " / " + TOTAL;
    scoreNum.textContent = String(score);
    var pct = Math.round((index / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    if (window.ArcadeFX && ArcadeFX.bar) ArcadeFX.bar(pct);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nextEmptyBlank() {
    for (var i = 0; i < placed.length; i++) {
      if (!placed[i]) return i;
    }
    return -1;
  }

  function allFilled() {
    for (var i = 0; i < placed.length; i++) {
      if (!placed[i]) return false;
    }
    return placed.length > 0;
  }

  function renderSentence() {
    var item = currentItem();
    if (!item) return;
    sentenceRow.innerHTML = "";
    var bi = 0;
    item.parts.forEach(function (p) {
      if (p.blank) {
        var slot = document.createElement("button");
        slot.type = "button";
        slot.className = "lc-slot";
        slot.setAttribute("data-bi", String(bi));
        slot.setAttribute("aria-label", "Blank " + (bi + 1));
        var fill = placed[bi];
        if (fill) {
          slot.textContent = fill.text;
          slot.classList.add("is-filled");
        }
        slot.addEventListener("click", onSlotClick);
        sentenceRow.appendChild(slot);
        bi++;
      } else {
        var fixed = document.createElement("span");
        fixed.className = "lc-fixed";
        fixed.textContent = p.t;
        sentenceRow.appendChild(fixed);
      }
    });
  }

  function renderBank() {
    chipBank.innerHTML = "";
    bankState.forEach(function (chip) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lc-chip" + (chip.used ? " used" : "");
      btn.textContent = chip.text;
      btn.setAttribute("data-uid", String(chip.uid));
      if (chip.used) btn.disabled = true;
      btn.addEventListener("click", function () { onChipClick(chip.uid); });
      chipBank.appendChild(btn);
    });
  }

  function onChipClick(uid) {
    if (!accepting || checking) return;
    var chip = null;
    for (var i = 0; i < bankState.length; i++) {
      if (bankState[i].uid === uid) { chip = bankState[i]; break; }
    }
    if (!chip || chip.used) return;
    var bi = nextEmptyBlank();
    if (bi < 0) return;
    chip.used = true;
    placed[bi] = { text: chip.text, uid: chip.uid };
    renderSentence();
    renderBank();
    if (allFilled()) {
      setTimeout(checkAnswer, 280);
    }
  }

  function onSlotClick(e) {
    if (!accepting || checking) return;
    var bi = +e.currentTarget.getAttribute("data-bi");
    if (!placed[bi]) return;
    var uid = placed[bi].uid;
    placed[bi] = null;
    for (var i = 0; i < bankState.length; i++) {
      if (bankState[i].uid === uid) {
        bankState[i].used = false;
        break;
      }
    }
    renderSentence();
    renderBank();
  }

  function checkAnswer() {
    if (checking || !accepting) return;
    var item = currentItem();
    if (!item || !allFilled()) return;
    checking = true;
    accepting = false;
    stopAudio();

    var ok = true;
    for (var i = 0; i < item.answers.length; i++) {
      if (!placed[i] || placed[i].text !== item.answers[i]) {
        ok = false;
        break;
      }
    }

    var slots = sentenceRow.querySelectorAll(".lc-slot");
    slots.forEach(function (s) {
      s.disabled = true;
      var bi = +s.getAttribute("data-bi");
      if (ok) {
        s.classList.add("is-correct");
      } else {
        s.classList.add("is-wrong");
        // reveal correct on mismatch
        if (placed[bi] && placed[bi].text !== item.answers[bi]) {
          s.textContent = item.answers[bi];
        }
      }
    });

    // disable chips
    chipBank.querySelectorAll(".lc-chip").forEach(function (c) {
      c.disabled = true;
      c.classList.add("used");
    });

    if (ok) {
      score += 1;
      sfxOk();
      feedback.textContent = "✓ Correct!";
      feedback.className = "ok";
      if (window.ArcadeFX) ArcadeFX.ok();
    } else {
      sfxBad();
      feedback.textContent = "✗ Not quite — look at the answer.";
      feedback.className = "bad";
      if (window.ArcadeFX) ArcadeFX.bad();
    }

    updateHud();

    setTimeout(function () {
      checking = false;
      index += 1;
      if (index >= TOTAL) {
        progressFill.style.width = "100%";
        finishGame();
      } else {
        beginPrompt();
      }
    }, 1200);
  }

  function beginPrompt() {
    var item = currentItem();
    if (!item) return;
    accepting = true;
    checking = false;
    var n = blankCount(item);
    placed = [];
    for (var i = 0; i < n; i++) placed.push(null);

    bankState = shuffle(item.bank).map(function (text, i) {
      return { text: text, uid: i, used: false };
    });

    feedback.textContent = "Tap play, then complete the sentence.";
    feedback.className = "";
    updateHud();
    renderSentence();
    renderBank();

    setTimeout(function () {
      if (accepting && currentItem()) playSound();
    }, 350);
  }

  function starsFromScore(s, total) {
    if (s >= total) return 3;
    if (s >= total - 2) return 2;
    if (s >= Math.ceil(total / 2)) return 1;
    return 0;
  }

  function finishGame() {
    stopAudio();
    accepting = false;
    var stars = starsFromScore(score, TOTAL);

    // LAFinish owns stars + play count — do not also call LAStars (avoids double counting)
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
      } catch (_) {}
    }
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    if (window.ArcadeFX) ArcadeFX.reset();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    beginPrompt();
  }

  startBtn.addEventListener("click", startGame);
  playBtn.addEventListener("click", function () {
    if (currentItem()) playSound();
  });
})();
