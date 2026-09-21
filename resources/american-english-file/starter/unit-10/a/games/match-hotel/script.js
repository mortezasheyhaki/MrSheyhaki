/* Match Hotel – 3 modes × sets of 6 pairs – AEF Starter Unit 10A */
(function () {
  "use strict";

  var GAME_ID = "starter-10a-match-hotel";

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

  /* 2 sets of 6 pairs (in a hotel room only) */
  var SETS = [
    ["bed", "pillow", "lamp", "light", "remote", "floor"],
    ["bathroom", "bathtub", "shower", "towel", "toilet", "closet"]
  ];

  var MODES = [
    { id: "pic-word", title: "Pictures → Words", left: "picture", right: "word", tip: "Match each picture to the room word." },
    { id: "audio-word", title: "Audio → Words", left: "audio", right: "word", tip: "Listen, then match to the word." },
    { id: "audio-pic", title: "Audio → Pictures", left: "audio", right: "picture", tip: "Listen, then match to the picture." }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var modeIndex = 0;
  var phase = "menu";
  var setIndex = 0;
  var leftOrder = [];
  var rightOrder = [];
  var locked = {};
  var matches = {};
  var selectedLeft = null;
  var currentAudio = null;
  var playingLeft = null;
  var setCorrect = 0;
  var modeCorrect = 0;
  var sfxCtx = null;
  var busy = false;
  var imagesReady = false;

  function byId(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function setSize() {
    return SETS[setIndex] ? SETS[setIndex].length : 6;
  }

  function totalPairs() {
    var n = 0;
    for (var i = 0; i < SETS.length; i++) n += SETS[i].length;
    return n;
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function sfxTone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function sfxCorrect() {
    try { if (window.LASfx && LASfx.correct) return LASfx.correct(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.11);
    sfxTone(659.25, t + 0.08, 0.12, "triangle", 0.11);
    sfxTone(783.99, t + 0.16, 0.18, "sine", 0.1);
  }
  function sfxWrong() {
    try { if (window.LASfx && LASfx.wrong) return LASfx.wrong(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(220, t, 0.14, "sawtooth", 0.06, 140);
    sfxTone(180, t + 0.06, 0.16, "triangle", 0.05, 120);
  }
  function sfxSelect() {
    try { if (window.LASfx && LASfx.click) return LASfx.click(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    sfxTone(640, ctx.currentTime, 0.06, "sine", 0.05);
  }
  function sfxSetComplete() {
    try { if (window.LASfx && LASfx.win) return LASfx.win(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.12, "triangle", 0.1);
    sfxTone(659.25, t + 0.1, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.2, 0.14, "triangle", 0.11);
    sfxTone(1046.5, t + 0.34, 0.28, "sine", 0.09);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    playingLeft = null;
    app.querySelectorAll(".mc-play.playing").forEach(function (b) { b.classList.remove("playing"); });
  }

  function playAudioFor(leftIndex) {
    var id = leftOrder[leftIndex];
    var c = byId(id);
    if (!c) return;
    if (playingLeft === leftIndex && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    var a = new Audio(c.audio);
    currentAudio = a;
    playingLeft = leftIndex;
    var btn = app.querySelector('.mc-play[data-i="' + leftIndex + '"]');
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
      playingLeft = null;
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (playingLeft === leftIndex) playingLeft = null;
      currentAudio = null;
    };
  }

  function playItemAudio(itemId) {
    var c = byId(itemId);
    if (!c) return;
    stopAudio();
    var a = new Audio(c.audio);
    currentAudio = a;
    a.play().catch(function () {});
    a.onended = function () { if (currentAudio === a) currentAudio = null; };
  }


  function preloadImages(cb) {
    if (imagesReady) { if (cb) cb(); return; }
    var urls = ITEMS.map(function (it) { return it.image; });
    var left = urls.length;
    if (!left) { imagesReady = true; if (cb) cb(); return; }
    urls.forEach(function (src) {
      var img = new Image();
      img.onload = img.onerror = function () {
        left -= 1;
        if (left <= 0) {
          imagesReady = true;
          if (cb) cb();
        }
      };
      img.src = src;
    });
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    modeCorrect = 0;
    busy = false;
    preloadImages(function () { startSet(0); });
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
    stopAudio();
    phase = "play";
    render({ enter: true });
  }

  var PARTICLE_COLORS = [
    "#34d399", "#10b981", "#fbbf24", "#f59e0b", "#6366f1",
    "#8b5cf6", "#ec4899", "#f472b6", "#38bdf8", "#a78bfa"
  ];
  var WRONG_COLORS = ["#f87171", "#ef4444", "#fb923c", "#f97316", "#fda4af"];

  function spawnBurst(el, opts) {
    if (!el) return;
    opts = opts || {};
    var count = opts.count || 12;
    var colors = opts.colors || PARTICLE_COLORS;
    var minDist = opts.minDist || 24;
    var maxDist = opts.maxDist || 56;
    var shapes = opts.shapes || ["dot", "star", "square"];
    var dur = opts.dur || 700;
    var rect = el.getBoundingClientRect();
    var appRect = app.getBoundingClientRect();
    var cx = rect.left + rect.width / 2 - appRect.left;
    var cy = rect.top + rect.height / 2 - appRect.top;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      var shape = shapes[i % shapes.length];
      s.className = "mc-particle mc-particle--" + shape;
      var ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      var dist = minDist + Math.random() * (maxDist - minDist);
      s.style.left = cx + "px";
      s.style.top = cy + "px";
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      s.style.setProperty("--dur", dur + "ms");
      s.style.background = colors[i % colors.length];
      app.appendChild(s);
      (function (node) {
        setTimeout(function () { if (node.parentNode) node.remove(); }, dur + 40);
      })(s);
    }
  }

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach(function (el) {
      if (!el) return;
      el.classList.add("mc-match-pop");
      spawnBurst(el, { count: 10, minDist: 22, maxDist: 52, dur: 600 });
      setTimeout(function () { el.classList.remove("mc-match-pop"); }, 550);
    });
    var flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.remove(); }, 500);
  }

  function spawnWrongFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach(function (el) {
      if (!el) return;
      spawnBurst(el, {
        count: 8,
        colors: WRONG_COLORS,
        minDist: 16,
        maxDist: 40,
        shapes: ["dot", "square"],
        dur: 550
      });
    });
  }

  function spawnCelebrateFX(intensity) {
    intensity = intensity || 1;
    var layer = document.createElement("div");
    layer.className = "mc-celebrate-layer";
    app.appendChild(layer);
    var count = intensity >= 2 ? 32 : 18;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      var shape = i % 3 === 0 ? "star" : i % 3 === 1 ? "square" : "dot";
      p.className = "mc-confetti mc-particle--" + shape;
      p.style.left = Math.random() * 100 + "%";
      p.style.top = -8 - Math.random() * 20 + "%";
      p.style.setProperty("--fall", 70 + Math.random() * 40 + "vh");
      p.style.setProperty("--drift", (Math.random() - 0.5) * 80 + "px");
      p.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
      p.style.setProperty("--dur", 1.1 + Math.random() * 1.1 + "s");
      p.style.setProperty("--delay", Math.random() * 0.35 + "s");
      p.style.setProperty("--size", 6 + Math.random() * 8 + "px");
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      layer.appendChild(p);
    }
    setTimeout(function () {
      if (layer.parentNode) layer.remove();
    }, 2800);
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === setSize();
  }

  function selectLeft(i) {
    if (busy || locked[i]) return;
    selectedLeft = i;
    sfxSelect();
    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    var mode = MODES[modeIndex];
    if (mode.left === "audio") playAudioFor(i);
  }

  function selectRight(rightId) {
    if (busy) return;
    if (selectedLeft === null) {
      var hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = MODES[modeIndex].left === "audio"
          ? "Play a sound first, then tap a match."
          : "Tap an item on the left first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(function () { hint.classList.remove("mc-hint-warn"); }, 1200);
      }
      return;
    }
    var used = Object.keys(locked).some(function (li) { return matches[li] === rightId; });
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
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      sfxCorrect();
      spawnMatchFX(leftEl, rightEl);
      if (MODES[modeIndex].id === "pic-word") playItemAudio(leftId);
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach(function (el) { el.classList.remove("is-selected"); });
      updateProgress();
      if (allMatched()) {
        busy = true;
        setTimeout(function () {
          if (setIndex < SETS.length - 1) {
            sfxSetComplete();
            spawnCelebrateFX(1);
            var board = app.querySelector(".mc-board");
            if (board) board.classList.add("is-swapping");
            setTimeout(function () { startSet(setIndex + 1); }, 280);
          } else {
            sfxSetComplete();
            spawnCelebrateFX(2);
            setTimeout(function () {
              phase = "done";
              render();
            }, 480);
          }
        }, 520);
      }
    } else {
      busy = true;
      sfxWrong();
      spawnWrongFX(leftEl, rightEl);
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(function () {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
        busy = false;
      }, 420);
    }
  }

  function updateProgress() {
    var el = document.getElementById("mc-progress");
    if (el) {
      el.textContent = "Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + setSize();
    }
  }

  function calcStars() {
    var n = modeCorrect;
    var total = totalPairs();
    var acc = total ? (n / total) * 100 : 0;
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function leftCell(id, i, kind) {
    var c = byId(id);
    var isLocked = !!locked[i];
    var sel = selectedLeft === i ? " is-selected" : "";
    var ok = isLocked ? " is-correct" : "";
    if (kind === "audio") {
      return (
        '<div class="mc-left-item mc-audio-cell' + ok + sel + '" data-i="' + i + '">' +
          '<button type="button" class="mc-play" data-i="' + i + '" aria-label="Play ' + c.label + '"' + (isLocked ? " disabled" : "") + ">" +
            '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
            '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
            '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
          "</button>" +
        "</div>"
      );
    }
    return (
      '<div class="mc-left-item mc-pic-cell' + ok + sel + '" data-i="' + i + '">' +
        '<img class="mc-thumb" src="' + c.image + '" alt="' + c.label + '" draggable="false">' +
      "</div>"
    );
  }

  function rightCell(id, kind) {
    var c = byId(id);
    var used = Object.keys(locked).some(function (li) { return matches[li] === id; });
    if (kind === "word") {
      return (
        '<button type="button" class="mc-right-item mc-word' + (used ? " is-correct is-used" : "") + '" data-id="' + id + '"' + (used ? " disabled" : "") + ">" +
          '<span class="mc-word-label">' + c.label + "</span>" +
        "</button>"
      );
    }
    return (
      '<button type="button" class="mc-right-item mc-pic-btn' + (used ? " is-correct is-used" : "") + '" data-id="' + id + '"' + (used ? " disabled" : "") + ">" +
        '<img class="mc-thumb" src="' + c.image + '" alt="' + c.label + '" draggable="false">' +
      "</button>"
    );
  }

  function render(opts) {
    opts = opts || {};
    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
          '<a class="mc-back" href="../" aria-label="Back">←</a>' +
          '<span class="mc-title">Match Hotel</span>' +
          '<span class="mc-badge">10A</span>' +
        "</header>" +
        '<section class="mc-start">' +
          '<div class="mc-hero" aria-hidden="true">🏨</div>' +
          "<h1>Match Hotel</h1>" +
          '<p class="mc-desc">Choose a mode · 12 room items (2 sets)</p>' +
          '<div class="mc-mode-list">' +
            MODES.map(function (m, i) {
              return (
                '<button type="button" class="mc-mode-card mc-mode-btn" data-mode="' + i + '">' +
                  '<span class="mc-mode-num">' + (i + 1) + "</span>" +
                  "<div><strong>" + m.title + "</strong><p>" + m.tip + "</p></div>" +
                "</button>"
              );
            }).join("") +
          "</div>" +
        "</section>";
      preloadImages();
      app.querySelectorAll(".mc-mode-btn").forEach(function (btn) {
        btn.onclick = function () {
          getSfxCtx();
          sfxSelect();
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      var stars = calcStars();
      var total = totalPairs();
      if (window.LAFinish) {
        try {
          var timeMs = LAFinish.stopTimer();
          LAFinish.show({
            gameId: GAME_ID,
            score: modeCorrect,
            total: total,
            stars: stars,
            timeMs: timeMs,
            onAgain: function () { startMode(modeIndex); },
            onModes: function () { phase = "menu"; render(); },
            backHref: "../"
          });
          return;
        } catch (e) { console.warn("LAFinish", e); }
      }
      if (window.LAStars) {
        try {
          LAStars.recordPlay(GAME_ID);
          LAStars.save(GAME_ID, stars);
        } catch (_) {}
      }
      app.innerHTML =
        '<header class="mc-topbar">' +
          '<a class="mc-back" href="../" aria-label="Back">←</a>' +
          '<span class="mc-title">Match Hotel</span>' +
          '<span class="mc-badge">Done</span>' +
        "</header>" +
        '<section class="mc-done">' +
          '<div class="mc-trophy">' + (stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪") + "</div>" +
          "<h1>" + (stars === 3 ? "Perfect!" : "Well done!") + "</h1>" +
          "<p>You matched <strong>" + modeCorrect + " / " + total + "</strong> pairs.</p>" +
          '<button type="button" class="mc-btn" id="fb-again">Play again</button>' +
          '<button type="button" class="mc-btn secondary" id="fb-menu">All modes</button>' +
        "</section>";
      document.getElementById("fb-again").onclick = function () { startMode(modeIndex); };
      document.getElementById("fb-menu").onclick = function () { phase = "menu"; render(); };
      return;
    }

    var mode = MODES[modeIndex];
    var left = leftOrder.map(function (id, i) { return leftCell(id, i, mode.left); }).join("");
    var right = rightOrder.map(function (id) { return rightCell(id, mode.right); }).join("");

    var boardClass = opts.enter ? "mc-board is-entering" : "mc-board";
    app.innerHTML =
      '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">' + mode.title + " · Set " + (setIndex + 1) + "/" + SETS.length + "</span>" +
        '<span class="mc-progress" id="mc-progress">Set ' + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + setSize() + "</span>" +
      "</header>" +
      '<p class="mc-instruction" id="mc-hint">' + mode.tip + "</p>" +
      '<div class="' + boardClass + '">' +
        '<div class="mc-col mc-col-left">' + left + "</div>" +
        '<div class="mc-col mc-col-right">' + right + "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
        '<button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>' +
      "</div>";

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () { selectLeft(+el.dataset.i); };
    });
    app.querySelectorAll(".mc-play").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        selectLeft(+btn.dataset.i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (btn) {
      btn.onclick = function () { selectRight(btn.dataset.id); };
    });
    document.getElementById("mc-reset").onclick = function () { startSet(setIndex); };
  }

  render();
})();
