/* Food Match – 3 modes × 4 sets (5+5+6+6) – AEF Starter Unit 5A */
(function () {
  "use strict";

  var GAME_ID = "starter-5a-food-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "orange-juice", label: "orange juice", image: CDN + "y474569_orange_juicve.png", audio: CDN + "m430952_orange_juice.mp3" },
    { id: "water", label: "water", image: CDN + "l28997_water.png", audio: CDN + "n0647_water_2.mp3" },
    { id: "milk", label: "milk", image: CDN + "o371209_milk.png", audio: CDN + "u575098_milk.mp3" },
    { id: "tea", label: "tea", image: CDN + "m857428_tea.png", audio: CDN + "i64279_tea.mp3" },
    { id: "coffee", label: "coffee", image: CDN + "d27147_coffee.png", audio: CDN + "p495679_coffee_2.mp3" },
    { id: "chocolate", label: "chocolate", image: CDN + "y725106_chocolate.png", audio: CDN + "d5050_chocolate.mp3" },
    { id: "cereal", label: "cereal", image: CDN + "w365421_cereal.png", audio: CDN + "i58138_cereal.mp3" },
    { id: "sandwich", label: "a sandwich", image: CDN + "g593040_a_sandwich.png", audio: CDN + "d503380_a_sandwich.mp3" },
    { id: "sugar", label: "sugar", image: CDN + "t65307_sugar.png", audio: CDN + "i330159_sugar.mp3" },
    { id: "cheese", label: "cheese", image: CDN + "186291_cheese.png", audio: CDN + "s1383_cheese.mp3" },
    { id: "butter", label: "butter", image: CDN + "q390114_butter.png", audio: CDN + "z611617_butter.mp3" },
    { id: "bread", label: "bread", image: CDN + "q54444_bread.png", audio: CDN + "l534951_bread.mp3" },
    { id: "fruit", label: "fruit", image: CDN + "g252280_fruit.png", audio: CDN + "l707897_fruit.mp3" },
    { id: "salad", label: "salad", image: CDN + "r6371_salad.png", audio: CDN + "p30139_salad.mp3" },
    { id: "potatoes", label: "potatoes", image: CDN + "w96375_potatoes.png", audio: CDN + "g067013_potatoes.mp3" },
    { id: "vegetables", label: "vegetables", image: CDN + "j10452_vegetables.png", audio: CDN + "n05883_vegetables_2.mp3" },
    { id: "yogurt", label: "yogurt", image: CDN + "b8972_yogurt.png", audio: CDN + "t99484_yogurt.mp3" },
    { id: "eggs", label: "eggs", image: CDN + "n773101_eggs.png", audio: CDN + "n595148_eggs.mp3" },
    { id: "rice", label: "rice", image: CDN + "y840090_rice.png", audio: CDN + "y43521_rice.mp3" },
    { id: "pasta", label: "pasta", image: CDN + "r41660_pasta.png", audio: CDN + "a446167_pasta.mp3" },
    { id: "meat", label: "meat", image: CDN + "x930201_m.png", audio: CDN + "d13610_m.mp3" },
    { id: "fish", label: "fish", image: CDN + "z779185_fish.png", audio: CDN + "i64676_fish.mp3" }
  ];

  // 2 sets of 5 + 2 sets of 6 = 22
  var SETS = [
    ["orange-juice", "water", "milk", "tea", "coffee"],
    ["chocolate", "cereal", "sandwich", "sugar", "cheese"],
    ["butter", "bread", "fruit", "salad", "potatoes", "vegetables"],
    ["yogurt", "eggs", "rice", "pasta", "meat", "fish"]
  ];

  var MODES = [
    {
      id: "word-pic",
      title: "Words → Pictures",
      left: "word",
      right: "picture",
      tip: "Tap a word, then the matching picture."
    },
    {
      id: "audio-word",
      title: "Audio → Words",
      left: "audio",
      right: "word",
      tip: "Listen, then tap the matching word."
    },
    {
      id: "audio-pic",
      title: "Audio → Pictures",
      left: "audio",
      right: "picture",
      tip: "Listen, then tap the matching picture."
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "menu"; // menu | play | done
  var modeIndex = 0;
  var setIndex = 0;
  var leftOrder = [];
  var rightOrder = [];
  var selectedLeft = null;
  var locked = {}; // leftIndex -> rightId
  var matches = {};
  var modeCorrect = 0;
  var lives = 3;
  var promptAudio = null;
  var matchAudio = null; // never cut on set change
  var busy = false;
  var sfxCtx = null;

  function byId(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

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

  function setSize() {
    return SETS[setIndex] ? SETS[setIndex].length : 5;
  }

  function totalPairs() {
    var n = 0;
    for (var i = 0; i < SETS.length; i++) n += SETS[i].length;
    return n;
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() >= setSize();
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

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.correct) LASfx.correct();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.11);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.11);
    tone(783.99, t + 0.14, 0.14, "sine", 0.1);
  }

  function sfxBad() {
    try {
      if (window.LASfx && LASfx.wrong) LASfx.wrong();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }

  function stopPromptAudio() {
    if (promptAudio) {
      try {
        promptAudio.pause();
      } catch (_) {}
      promptAudio = null;
    }
    app.querySelectorAll(".mc-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  // Match audio is allowed to finish even when the next set loads
  function playMatchAudio(src) {
    if (!src) return;
    if (matchAudio) {
      try {
        matchAudio.onended = null;
      } catch (_) {}
    }
    var a = new Audio(src);
    matchAudio = a;
    a.play().catch(function () {});
  }

  var playingLeft = null;

  function playPromptAudio(src, leftIndex) {
    if (playingLeft === leftIndex && promptAudio && !promptAudio.paused) {
      stopPromptAudio();
      playingLeft = null;
      return;
    }
    stopPromptAudio();
    if (!src) return;
    var a = new Audio(src);
    promptAudio = a;
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
      promptAudio = null;
    };
  }

  function playAudioFor(leftIndex) {
    var id = leftOrder[leftIndex];
    var c = byId(id);
    if (!c) return;
    playPromptAudio(c.audio, leftIndex);
  }

  function startMode(mi) {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    modeCorrect = 0;
    lives = 3;
    phase = "play";
    startSet(0);
  }

  function startSet(si) {
    // Do NOT stop matchAudio — last match sound may still be playing
    stopPromptAudio();
    setIndex = si;
    var ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    selectedLeft = null;
    locked = {};
    matches = {};
    busy = false;
    phase = "play";
    render();
  }

  function selectLeft(i) {
    if (busy || locked[i] != null) return;
    selectedLeft = i;
    var mode = MODES[modeIndex];
    if (mode.left === "audio") playAudioFor(i);
    renderPlaySelection();
  }


  function spawnParticles(cardEl) {
    if (!cardEl) return;
    var colors = ["#7c6af7", "#4caf50", "#ff9800", "#e91e63", "#2196f3", "#ffeb3b"];
    var container = document.createElement("div");
    container.className = "mc-particles";
    cardEl.appendChild(container);
    for (var i = 0; i < 10; i++) {
      var p = document.createElement("div");
      p.className = "mc-particle";
      var angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      var dist = 28 + Math.random() * 36;
      p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      p.style.background = colors[i % colors.length];
      var size = 5 + Math.random() * 5;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDelay = Math.random() * 0.06 + "s";
      container.appendChild(p);
    }
    setTimeout(function () {
      try {
        container.remove();
      } catch (_) {}
    }, 800);
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

  function selectRight(rightId) {
    if (busy || selectedLeft == null) return;
    if (Object.keys(locked).some(function (li) { return matches[li] === rightId; })) return;

    var leftId = leftOrder[selectedLeft];
    var leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    var rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (leftId !== rightId) {
      sfxBad();
      busy = true;
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(function () {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 500);
      breakHeart(function () {
        if (lives <= 0) {
          setTimeout(finishMode, 400);
        } else {
          busy = false;
        }
      });
      return;
    }

    // correct — update in place (no full re-render = no flicker)
    busy = true;
    sfxOk();
    var leftIdx = selectedLeft;
    locked[leftIdx] = rightId;
    matches[leftIdx] = rightId;
    modeCorrect += 1;

    var item = byId(leftId);
    // Words → Pictures: play audio after a match (do not cut on next set)
    if (MODES[modeIndex].id === "word-pic" && item) {
      playMatchAudio(item.audio);
    }

    // Mark tiles without rebuilding the board + matchPop + particles
    if (leftEl) {
      leftEl.classList.remove("is-selected", "is-wrong");
      leftEl.classList.add("is-correct");
      var playBtn = leftEl.querySelector(".mc-play");
      if (playBtn) playBtn.disabled = true;
      spawnParticles(leftEl);
    }
    if (rightEl) {
      rightEl.classList.remove("is-wrong");
      rightEl.classList.add("is-correct", "is-used");
      rightEl.disabled = true;
      spawnParticles(rightEl);
    }

    // Clear selection highlight on all left items
    app.querySelectorAll(".mc-left-item.is-selected").forEach(function (el) {
      el.classList.remove("is-selected");
    });
    selectedLeft = null;

    // Progress text only
    var prog = document.getElementById("mc-progress");
    if (prog) {
      prog.textContent =
        "Set " + (setIndex + 1) + "/4 · " + correctCount() + "/" + setSize();
    }

    if (allMatched()) {
      setTimeout(function () {
        if (setIndex < SETS.length - 1) {
          startSet(setIndex + 1);
        } else {
          finishMode();
        }
      }, 700);
    } else {
      busy = false;
    }
  }

  function finishMode() {
    phase = "done";
    stopPromptAudio();
    busy = true;
    var total = totalPairs();
    // Stars = hearts remaining (0–3)
    var stars = Math.max(0, Math.min(3, lives));

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: modeCorrect,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: function () {
            startMode(modeIndex);
          },
          onModes: function () {
            phase = "menu";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn("LAFinish", e);
      }
    }

    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }

    render();
  }

  function leftCell(id, i, kind) {
    var c = byId(id);
    var isLocked = locked[i] != null;
    var sel = selectedLeft === i ? " is-selected" : "";
    var ok = isLocked ? " is-correct" : "";

    if (kind === "audio") {
      return (
        '<div class="mc-left-item mc-audio-cell' + ok + sel + '" data-i="' + i + '">' +
        '<button type="button" class="mc-play" data-i="' + i + '" aria-label="Play ' + escapeAttr(c.label) + '"' +
        (isLocked ? " disabled" : "") + ">" +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button></div>"
      );
    }

    // word
    return (
      '<div class="mc-left-item mc-word-left' + ok + sel + '" data-i="' + i + '">' +
      '<span class="mc-word-label">' + escapeHtml(c.label) + "</span></div>"
    );
  }

  function rightCell(id, kind) {
    var c = byId(id);
    var used = Object.keys(locked).some(function (li) {
      return matches[li] === id;
    });
    var ok = used ? " is-correct is-used" : "";

    if (kind === "picture") {
      return (
        '<button type="button" class="mc-right-item mc-pic' + ok + '" data-id="' + id + '"' +
        (used ? " disabled" : "") + ' aria-label="' + escapeAttr(c.label) + '">' +
        '<img src="' + c.image + '" alt="" draggable="false" loading="lazy" />' +
        "</button>"
      );
    }

    // word
    return (
      '<button type="button" class="mc-right-item mc-word' + ok + '" data-id="' + id + '"' +
      (used ? " disabled" : "") + ">" +
      '<span class="mc-word-label">' + escapeHtml(c.label) + "</span></button>"
    );
  }

  function renderPlaySelection() {
    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.classList.toggle("is-selected", +el.dataset.i === selectedLeft);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function render() {
    if (phase === "menu") {
      stopPromptAudio();
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Food Match</span>' +
        '<span class="mc-badge">5A</span></header>' +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">🍽️</div>' +
        "<h1>Food Match</h1>" +
        '<p class="mc-desc">Choose a mode · 22 foods &amp; drinks (4 sets)</p>' +
        '<div class="mc-mode-list">' +
        MODES.map(function (m, i) {
          return (
            '<button type="button" class="mc-mode-card mc-mode-btn" data-mode="' + i + '">' +
            '<span class="mc-mode-num">' + (i + 1) + "</span>" +
            "<div><strong>" + escapeHtml(m.title) + "</strong><p>" + escapeHtml(m.tip) + "</p></div>" +
            "</button>"
          );
        }).join("") +
        "</div></section>";

      app.querySelectorAll(".mc-mode-btn").forEach(function (btn) {
        btn.onclick = function () {
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      var total = totalPairs();
      var stars = Math.max(0, Math.min(3, lives));
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Food Match</span>' +
        '<span class="mc-badge">Done</span></header>' +
        '<section class="mc-done">' +
        '<div class="mc-trophy">' + (stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪") + "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : "Well done!") + "</h1>" +
        "<p>You matched <strong>" + modeCorrect + " / " + total + "</strong> pairs.</p>" +
        '<button type="button" class="mc-btn" id="fb-again">Play again</button>' +
        '<button type="button" class="mc-btn secondary" id="fb-menu">All modes</button>' +
        "</section>";
      document.getElementById("fb-again").onclick = function () {
        startMode(modeIndex);
      };
      document.getElementById("fb-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var n = setSize();
    var left = leftOrder
      .map(function (id, i) {
        return leftCell(id, i, mode.left);
      })
      .join("");
    var right = rightOrder
      .map(function (id) {
        return rightCell(id, mode.right);
      })
      .join("");

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">' + escapeHtml(mode.title) + " · Set " + (setIndex + 1) + "/4</span>" +
      heartsHtml() +
      '<span class="mc-progress" id="mc-progress">Set ' +
      (setIndex + 1) +
      "/4 · " +
      correctCount() +
      "/" +
      n +
      "</span></header>" +
      '<p class="mc-instruction" id="mc-hint">' + escapeHtml(mode.tip) + "</p>" +
      '<div class="mc-board mc-set-' + n + '">' +
      '<div class="mc-col mc-col-left">' + left + "</div>" +
      '<div class="mc-col mc-col-right">' + right + "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>' +
      "</div>";

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () {
        selectLeft(+el.dataset.i);
      };
    });
    app.querySelectorAll(".mc-play").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        selectLeft(+btn.dataset.i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (btn) {
      btn.onclick = function () {
        selectRight(btn.dataset.id);
      };
    });
    document.getElementById("mc-reset").onclick = function () {
      startSet(setIndex);
    };
  }

  // Preload images
  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
