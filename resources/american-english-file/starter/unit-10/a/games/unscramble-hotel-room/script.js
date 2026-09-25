/* Unscramble Hotel Room – 3 modes – AEF Starter Unit 10A */
(function () {
  "use strict";

  

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();

var GAME_ID = "starter-10a-unscramble-hotel-room";

  var ITEMS = [
    { id: "bed", label: "a bed", image: "https://cdn.imgurl.ir/uploads/w156592_a_bed.png", audio: "https://cdn.imgurl.ir/uploads/k079888_a_bed.mp3" },
    { id: "pillow", label: "a pillow", image: "https://cdn.imgurl.ir/uploads/p010495_a_pillow.png", audio: "https://cdn.imgurl.ir/uploads/k982929_a_pillow.mp3" },
    { id: "lamp", label: "a lamp", image: "https://cdn.imgurl.ir/uploads/v696561_a_lamp.png", audio: "https://cdn.imgurl.ir/uploads/e308997_a_lamp.mp3" },
    { id: "light", label: "a light", image: "https://cdn.imgurl.ir/uploads/j614692_a_light.png", audio: "https://cdn.imgurl.ir/uploads/c0025_a_light.mp3" },
    { id: "remote", label: "a remote control", image: "https://cdn.imgurl.ir/uploads/e652023_a_remove_control.png", audio: "https://cdn.imgurl.ir/uploads/l2390_a_remote_control.mp3" },
    { id: "floor", label: "the floor", image: "https://cdn.imgurl.ir/uploads/o904724_the_floor.png", audio: "https://cdn.imgurl.ir/uploads/m188759_the_floor.mp3" },
    { id: "bathroom", label: "the bathroom", image: "https://cdn.imgurl.ir/uploads/n04774_the_bathroom.png", audio: "https://cdn.imgurl.ir/uploads/b0956_the_bathroom.mp3" },
    { id: "bathtub", label: "a bathtub", image: "https://cdn.imgurl.ir/uploads/t193497_a_bathtub.png", audio: "https://cdn.imgurl.ir/uploads/w654862_a_bathtub.mp3" },
    { id: "shower", label: "a shower", image: "https://cdn.imgurl.ir/uploads/o196841_a_shower.png", audio: "https://cdn.imgurl.ir/uploads/k048616_a_shower.mp3" },
    { id: "towel", label: "a towel", image: "https://cdn.imgurl.ir/uploads/m945704_a_towel.png", audio: "https://cdn.imgurl.ir/uploads/b252792_a_towel.mp3" },
    { id: "toilet", label: "a toilet", image: "https://cdn.imgurl.ir/uploads/v467822_a_toilet.png", audio: "https://cdn.imgurl.ir/uploads/f60235_a_toilet.mp3" },
    { id: "closet", label: "a closet", image: "https://cdn.imgurl.ir/uploads/n887137_a_closet.png", audio: "https://cdn.imgurl.ir/uploads/t492243_a_closet.mp3" }
  ];

  var MODES = [
    { id: "unscramble", title: "Unscramble", tip: "Tap the letters to spell the word.", nextTip: "Nice work! Try Mode 2 — fill each letter box." },
    { id: "boxes", title: "Letter boxes", tip: "Type one letter in each box.", nextTip: "Great spelling! Try Mode 3 — write the whole word." },
    { id: "type", title: "Write the word", tip: "Type the whole word in the box.", nextTip: null }
  ];

  var BOOSTS = [
    { at: 4, word: "Awesome!", emoji: "🌟" },
    { at: 8, word: "Great job!", emoji: "💪" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "menu"; // menu | play | boost | done
  var modeIndex = 0;
  var order = [];
  var index = 0;
  var score = 0;
  var busy = false;
  var currentAudio = null;
  var sfxCtx = null;

  // Mode 1 state
  var slots = [];
  var pool = [];
  var uidSeq = 0;

  // Mode 2/3 checked flags
  var lockedItem = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function norm(s) {
    return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function lettersOf(label) {
    return label.split("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function tone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(start); osc.stop(start + dur + 0.02);
  }
  function unlockAudio() {
    getSfxCtx();
    try { if (window.LASfx && typeof LASfx.unlock === "function") LASfx.unlock(); } catch (_) {}
  }
  function sfxClick() {
    unlockAudio();
    try { if (window.LASfx && LASfx.click) { LASfx.click(); return; } } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    tone(720, ctx.currentTime, 0.05, "sine", 0.06);
  }
  /** Clear success chime for correct answers (all modes) */
  function sfxOk() {
    unlockAudio();
    var played = false;
    try {
      if (window.LASfx && typeof LASfx.correct === "function") {
        LASfx.correct();
        played = true;
      }
    } catch (_) {}
    // Always also play a local bright arpeggio so feedback is reliable
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime + (played ? 0.02 : 0);
    tone(523.25, t, 0.11, "triangle", 0.14);       // C5
    tone(659.25, t + 0.09, 0.11, "triangle", 0.14); // E5
    tone(783.99, t + 0.18, 0.14, "sine", 0.13);     // G5
    tone(1046.5, t + 0.30, 0.22, "sine", 0.12);     // C6 sparkle
  }
  function sfxBad() {
    unlockAudio();
    try { if (window.LASfx && LASfx.wrong) { LASfx.wrong(); return; } } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    tone(220, t, 0.14, "sawtooth", 0.07, 140);
    tone(180, t + 0.08, 0.16, "triangle", 0.06, 120);
  }
  function sfxBoost() {
    unlockAudio();
    try { if (window.LASfx && LASfx.win) LASfx.win(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.12, "triangle", 0.13);
    tone(659.25, t + 0.1, 0.12, "triangle", 0.13);
    tone(783.99, t + 0.2, 0.14, "triangle", 0.14);
    tone(1046.5, t + 0.34, 0.28, "sine", 0.12);
    tone(1318.5, t + 0.5, 0.35, "sine", 0.1);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".uc-audio-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playItemAudio(item) {
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = app.querySelector(".uc-audio-btn");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function currentItem() {
    return ITEMS[order[index]];
  }

  function progressPct() {
    return Math.round((index / ITEMS.length) * 100);
  }

  function startMode(mi) {
    modeIndex = mi;
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    busy = false;
    lockedItem = false;
    unlockAudio();
    if (window.LAFinish) LAFinish.startTimer();
    phase = "play";
    setupItem();
    render();
    setTimeout(function () {
      var it = currentItem();
      if (it) playItemAudio(it);
    }, 280);
  }

  function setupItem() {
    lockedItem = false;
    busy = false;
    var item = currentItem();
    if (!item) return;
    if (MODES[modeIndex].id === "unscramble") {
      setupUnscramble(item.label);
    }
  }

  function setupUnscramble(label) {
    uidSeq = 0;
    var chars = lettersOf(label);
    slots = chars.map(function (ch) {
      if (ch === " ") return { type: "space" };
      return { type: "empty", ch: null, uid: null };
    });
    var scramble = chars.filter(function (ch) { return ch !== " "; });
    var scrambled = shuffle(scramble);
    var guard = 0;
    while (scrambled.join("") === scramble.join("") && scramble.length > 1 && guard < 12) {
      scrambled = shuffle(scramble);
      guard++;
    }
    pool = scrambled.map(function (ch) {
      return { ch: ch, uid: "t" + (++uidSeq), used: false };
    });
  }

  function answerFromSlots() {
    return slots.map(function (s) {
      if (s.type === "space") return " ";
      return s.ch || "";
    }).join("");
  }

  function slotsFull() {
    return slots.every(function (s) {
      return s.type === "space" || s.ch;
    });
  }

  function placeTile(uid) {
    if (busy || lockedItem) return;
    var tile = null;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].uid === uid && !pool[i].used) { tile = pool[i]; break; }
    }
    if (!tile) return;
    var si = -1;
    for (var j = 0; j < slots.length; j++) {
      if (slots[j].type === "empty" && !slots[j].ch) { si = j; break; }
    }
    if (si < 0) return;
    sfxClick();
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    renderPlayPartial();
    if (slotsFull()) {
      setTimeout(checkUnscramble, 120);
    }
  }

  function clearSlot(si) {
    if (busy || lockedItem) return;
    var s = slots[si];
    if (!s || s.type !== "empty" || !s.ch) return;
    sfxClick();
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].uid === s.uid) pool[i].used = false;
    }
    slots[si] = { type: "empty", ch: null, uid: null };
    renderPlayPartial();
  }


  function showWordReveal(label) {
    var el = app.querySelector(".uc-word-reveal");
    if (!el) {
      el = document.createElement("div");
      el.className = "uc-word-reveal";
      var card = app.querySelector(".uc-card");
      var slots = app.querySelector(".uc-slots");
      if (card && slots) card.insertBefore(el, slots.nextSibling);
      else if (card) card.appendChild(el);
    }
    el.textContent = label;
    el.classList.add("is-on");
  }

  function showFeedback(text, ok) {
    var el = app.querySelector(".uc-live-feedback");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("ok", "bad");
    el.classList.add(ok ? "ok" : "bad", "is-on");
  }
  function hideFeedback() {
    var el = app.querySelector(".uc-live-feedback");
    if (!el) return;
    el.textContent = "";
    el.classList.remove("ok", "bad", "is-on");
  }

  function checkUnscramble() {
    if (busy || lockedItem) return;
    var item = currentItem();
    var ans = answerFromSlots();
    if (norm(ans) === norm(item.label)) {
      lockedItem = true;
      score += 1;
      sfxOk();
      markSlots("ok");
      showWordReveal(item.label);
      setTimeout(function () { advance(); }, 1100);
    } else {
      sfxBad();
      markSlots("bad");
      setTimeout(function () {
        setupUnscramble(item.label);
        renderPlayPartial();
      }, 500);
    }
  }

  function markSlots(cls) {
    app.querySelectorAll(".uc-slot").forEach(function (el) {
      el.classList.remove("ok", "bad");
      if (!el.classList.contains("uc-space")) el.classList.add(cls);
    });
  }

  function boxesValue() {
    var inputs = app.querySelectorAll(".uc-box");
    var chars = lettersOf(currentItem().label);
    var out = [];
    var bi = 0;
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === " ") out.push(" ");
      else {
        out.push((inputs[bi] && inputs[bi].value) || "");
        bi++;
      }
    }
    return out.join("");
  }

  function checkBoxes() {
    if (busy || lockedItem) return;
    var item = currentItem();
    var ans = boxesValue();
    var inputs = app.querySelectorAll(".uc-box");
    if (norm(ans) === norm(item.label)) {
      lockedItem = true;
      score += 1;
      sfxOk();
      inputs.forEach(function (inp) { inp.disabled = true; });
      showFeedback("✓ Correct!", true);
      setTimeout(function () { advance(); }, 700);
    } else {
      sfxBad();
      inputs.forEach(function (inp) { inp.classList.add("bad"); });
      showFeedback("Try again", false);
      setTimeout(function () {
        inputs.forEach(function (inp) { inp.classList.remove("bad"); });
        hideFeedback();
      }, 450);
    }
  }

  function checkType() {
    if (busy || lockedItem) return;
    var item = currentItem();
    var input = app.querySelector(".uc-type-input");
    if (!input) return;
    if (norm(input.value) === norm(item.label)) {
      lockedItem = true;
      score += 1;
      sfxOk();
      input.disabled = true;
      showFeedback("✓ Correct!", true);
      setTimeout(function () { advance(); }, 700);
    } else {
      sfxBad();
      input.classList.add("bad");
      showFeedback("Try again", false);
      setTimeout(function () {
        input.classList.remove("bad");
        hideFeedback();
      }, 450);
    }
  }

  function advance() {
    var next = index + 1;
    var boost = null;
    for (var i = 0; i < BOOSTS.length; i++) {
      if (BOOSTS[i].at === next) boost = BOOSTS[i];
    }
    if (boost) {
      phase = "boost";
      renderBoost(boost, function () {
        index = next;
        if (index >= ITEMS.length) {
          finishMode();
        } else {
          phase = "play";
          setupItem();
          render();
          setTimeout(function () {
            var it = currentItem();
            if (it) playItemAudio(it);
          }, 200);
        }
      });
      return;
    }
    index = next;
    if (index >= ITEMS.length) {
      finishMode();
      return;
    }
    setupItem();
    render();
    setTimeout(function () {
      var it = currentItem();
      if (it) playItemAudio(it);
    }, 200);
  }

  function renderBoost(boost, done) {
    sfxBoost();
    var layer = document.createElement("div");
    layer.className = "uc-boost";
    layer.innerHTML =
      '<div class="uc-boost-card">' +
        '<div class="uc-boost-emoji">' + boost.emoji + "</div>" +
        '<div class="uc-boost-word">' + escapeHtml(boost.word) + "</div>" +
      "</div>";
    app.appendChild(layer);
    setTimeout(function () {
      if (layer.parentNode) layer.remove();
      if (done) done();
    }, 750);
  }

  function finishMode() {
    stopAudio();
    phase = "done";
    var isLast = modeIndex >= MODES.length - 1;
    if (isLast && window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, 3);
      } catch (_) {}
    }
    if (isLast && window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: ITEMS.length,
          stars: 3,
          timeMs: timeMs,
          onAgain: function () { startMode(modeIndex); },
          onModes: function () { phase = "menu"; render(); },
          backHref: "../"
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }
    render();
  }

  function topbar(title, badge) {
    return (
      '<header class="uc-topbar">' +
        '<a class="uc-back" href="../" aria-label="Back">←</a>' +
        '<div class="uc-topbar-center">' +
          '<span class="uc-kicker">Starter · Unit 10A</span>' +
          '<span class="uc-title">' + escapeHtml(title) + "</span>" +
        "</div>" +
        '<span class="uc-badge">' + escapeHtml(badge) + "</span>" +
      "</header>"
    );
  }

  function photoBlock(item) {
    return (
      '<div class="uc-photo-wrap">' +
        '<img class="uc-photo" src="' + item.image + '" alt="' + escapeHtml(item.label) + '" draggable="false">' +
        '<button type="button" class="uc-audio-btn" id="uc-audio" aria-label="Play audio">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        "</button>" +
      "</div>"
    );
  }

  function renderSlots() {
    return slots.map(function (s, i) {
      if (s.type === "space") return '<span class="uc-space" aria-hidden="true"></span>';
      if (s.ch) {
        return (
          '<button type="button" class="uc-slot filled" data-si="' + i + '" aria-label="Remove letter">' +
            escapeHtml(s.ch) +
          "</button>"
        );
      }
      return '<span class="uc-slot empty" data-si="' + i + '"></span>';
    }).join("");
  }

  function renderPool() {
    return pool.map(function (t) {
      if (t.used) {
        return '<span class="uc-tile used" aria-hidden="true">' + escapeHtml(t.ch) + "</span>";
      }
      return '<button type="button" class="uc-tile" data-uid="' + t.uid + '">' + escapeHtml(t.ch) + "</button>";
    }).join("");
  }

  function renderBoxes(label) {
    var html = "";
    var chars = lettersOf(label);
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === " ") {
        html += '<span class="uc-box-space" aria-hidden="true"></span>';
      } else {
        html +=
          '<input class="uc-box" type="text" maxlength="1" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Letter ' +
          (i + 1) + '">';
      }
    }
    return html;
  }

  function renderPlayPartial() {
    var slotsEl = app.querySelector(".uc-slots");
    var poolEl = app.querySelector(".uc-pool");
    if (slotsEl) slotsEl.innerHTML = renderSlots();
    if (poolEl) poolEl.innerHTML = renderPool();
    bindUnscramble();
  }

  function bindUnscramble() {
    app.querySelectorAll(".uc-tile[data-uid]").forEach(function (btn) {
      btn.onclick = function () { placeTile(btn.dataset.uid); };
    });
    app.querySelectorAll(".uc-slot.filled").forEach(function (btn) {
      btn.onclick = function () { clearSlot(+btn.dataset.si); };
    });
  }

  function bindAudio() {
    var btn = document.getElementById("uc-audio");
    if (btn) {
      btn.onclick = function () {
        getSfxCtx();
        playItemAudio(currentItem());
      };
    }
  }

  function bindBoxes() {
    var inputs = Array.prototype.slice.call(app.querySelectorAll(".uc-box"));
    inputs.forEach(function (inp, i) {
      inp.addEventListener("input", function () {
        var v = inp.value.slice(-1).toLowerCase();
        inp.value = v;
        if (v && i < inputs.length - 1) inputs[i + 1].focus();
        if (inputs.every(function (x) { return x.value; })) {
          setTimeout(checkBoxes, 80);
        }
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !inp.value && i > 0) {
          inputs[i - 1].focus();
        }
        if (e.key === "Enter") {
          e.preventDefault();
          checkBoxes();
        }
      });
    });
    if (inputs[0]) setTimeout(function () { inputs[0].focus(); }, 50);
    var check = document.getElementById("uc-check");
    if (check) check.onclick = function () { checkBoxes(); };
  }

  function bindType() {
    var input = app.querySelector(".uc-type-input");
    if (input) {
      setTimeout(function () { input.focus(); }, 50);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          checkType();
        }
      });
    }
    var check = document.getElementById("uc-check");
    if (check) check.onclick = function () { checkType(); };
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        topbar("Unscramble Hotel Room", "10A") +
        '<section class="uc-scroll" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12px 8px;">' +
          '<div class="uc-hero" aria-hidden="true">🔤</div>' +
          "<h1 style=\"margin:0 0 6px;font-size:1.4rem;font-weight:900;\">Hotel room words</h1>" +
          '<p class="uc-instruction" style="margin-bottom:4px;">3 modes · 12 words · listen anytime</p>' +
          '<div class="uc-mode-list">' +
            MODES.map(function (m, i) {
              return (
                '<button type="button" class="uc-mode-card" data-mode="' + i + '">' +
                  '<span class="uc-mode-num">' + (i + 1) + "</span>" +
                  "<div><strong>" + escapeHtml(m.title) + "</strong><p>" + escapeHtml(m.tip) + "</p></div>" +
                "</button>"
              );
            }).join("") +
          "</div>" +
        "</section>";
      app.querySelectorAll(".uc-mode-card").forEach(function (btn) {
        btn.onclick = function () {
          unlockAudio();
          sfxClick();
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      var mode = MODES[modeIndex];
      var isLast = modeIndex >= MODES.length - 1;
      var next = MODES[modeIndex + 1];
      app.innerHTML =
        topbar(mode.title, "Done") +
        '<section class="uc-scroll" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 10px;">' +
          '<div class="uc-hero" aria-hidden="true">' + (isLast ? "🏆" : "✨") + "</div>" +
          "<h1 style=\"margin:0 0 6px;font-size:1.45rem;font-weight:900;\">" +
            (isLast ? "Perfect!" : "Mode complete!") +
          "</h1>" +
          "<p class=\"uc-instruction\">You finished <strong>" + score + " / " + ITEMS.length + "</strong> words.</p>" +
          (next
            ? '<p style="font-weight:700;margin:8px 12px 4px;max-width:320px;">' +
                escapeHtml(mode.nextTip || ("Next up: " + next.title)) +
              "</p>" +
              '<button type="button" class="uc-btn uc-done-cta" id="uc-next-mode">Start Mode ' +
                (modeIndex + 2) + " · " + escapeHtml(next.title) +
              "</button>"
            : '<p style="font-weight:700;margin:8px 12px;">You earned <strong>3 stars</strong>!</p>') +
          '<button type="button" class="uc-btn secondary uc-done-cta" id="uc-again">Play this mode again</button>' +
          '<button type="button" class="uc-btn secondary uc-done-cta" id="uc-menu">All modes</button>' +
        "</section>";
      var nextBtn = document.getElementById("uc-next-mode");
      if (nextBtn) nextBtn.onclick = function () { sfxClick(); startMode(modeIndex + 1); };
      document.getElementById("uc-again").onclick = function () { sfxClick(); startMode(modeIndex); };
      document.getElementById("uc-menu").onclick = function () { phase = "menu"; render(); };
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var item = currentItem();
    var body = "";

    if (mode.id === "unscramble") {
      body =
        '<div class="uc-slots" aria-label="Answer slots">' + renderSlots() + "</div>" +
        '<div class="uc-word-reveal" aria-live="polite"></div>' +
        '<div class="uc-pool" aria-label="Letter tiles">' + renderPool() + "</div>" +
        '<div class="uc-actions">' +
          '<button type="button" class="uc-btn secondary" id="uc-clear">Clear</button>' +
          '<button type="button" class="uc-btn" id="uc-check">Check</button>' +
        "</div>";
    } else if (mode.id === "boxes") {
      body =
        '<p class="uc-hint-line">Type one letter in each box</p>' +
        '<div class="uc-boxes">' + renderBoxes(item.label) + "</div>" +
        '<div class="uc-live-feedback" aria-live="polite"></div>' +
        '<div class="uc-actions">' +
          '<button type="button" class="uc-btn secondary" id="uc-clear">Clear</button>' +
          '<button type="button" class="uc-btn" id="uc-check">Check</button>' +
        "</div>";
    } else {
      body =
        '<div class="uc-type-wrap">' +
          '<input class="uc-type-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="type the word…">' +
        "</div>" +
        '<div class="uc-live-feedback" aria-live="polite"></div>' +
        '<div class="uc-actions">' +
          '<button type="button" class="uc-btn secondary" id="uc-clear">Clear</button>' +
          '<button type="button" class="uc-btn" id="uc-check">Check</button>' +
        "</div>";
    }

    app.innerHTML =
      topbar(mode.title, index + 1 + " / " + ITEMS.length) +
      '<div class="uc-progress-bar"><div class="uc-progress-fill" style="width:' + progressPct() + '%"></div></div>' +
      '<p class="uc-instruction">' + escapeHtml(mode.tip) + "</p>" +
      '<div class="uc-scroll">' +
        '<div class="uc-card">' +
          photoBlock(item) +
          body +
        "</div>" +
      "</div>";

    bindAudio();
    if (mode.id === "unscramble") {
      bindUnscramble();
      var clear1 = document.getElementById("uc-clear");
      if (clear1) clear1.onclick = function () {
        if (lockedItem) return;
        setupUnscramble(item.label);
        renderPlayPartial();
      };
      var check1 = document.getElementById("uc-check");
      if (check1) check1.onclick = function () { checkUnscramble(); };
    } else if (mode.id === "boxes") {
      bindBoxes();
      var clear2 = document.getElementById("uc-clear");
      if (clear2) clear2.onclick = function () {
        if (lockedItem) return;
        app.querySelectorAll(".uc-box").forEach(function (inp) {
          inp.value = "";
          inp.classList.remove("ok", "bad");
          inp.disabled = false;
        });
        var first = app.querySelector(".uc-box");
        if (first) first.focus();
      };
    } else {
      bindType();
      var clear3 = document.getElementById("uc-clear");
      if (clear3) clear3.onclick = function () {
        if (lockedItem) return;
        var input = app.querySelector(".uc-type-input");
        if (input) {
          input.value = "";
          input.classList.remove("ok", "bad");
          input.disabled = false;
          input.focus();
        }
      };
    }
  }

  // Preload images
  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
