/* Adverbs Listen & Complete – 3 parts – AEF 1 Unit 11A
   Part 1: Listen + chips
   Part 2: Chips only (no audio)
   Part 3: Listen + type
*/
(function () {
  "use strict";

  var GAME_ID = "1-11a-adverbs-listen-complete";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "independently",
      text: "She wants to live independently.",
      tokens: ["She", "wants", "to", "live", "independently"],
      audio: CDN + "f90700_1_she_wants_to_live_independently.mp3"
    },
    {
      id: "politely",
      text: "Her children always speak politely.",
      tokens: ["Her", "children", "always", "speak", "politely"],
      audio: CDN + "n806735_2_Her_children_always_speak_politely.mp3"
    },
    {
      id: "quickly",
      text: "She eats very quickly.",
      tokens: ["She", "eats", "very", "quickly"],
      audio: CDN + "m313329_3_She_s_very_quickly.mp3"
    },
    {
      id: "hard",
      text: "I work hard.",
      tokens: ["I", "work", "hard"],
      audio: CDN + "e650030_4_I_work_hard.mp3"
    },
    {
      id: "well",
      text: "We speak English well.",
      tokens: ["We", "speak", "English", "well"],
      audio: CDN + "r3338_5_We_speak_English_well.mp3"
    },
    {
      id: "expensive",
      text: "It isn't very expensive.",
      tokens: ["It", "isn't", "very", "expensive"],
      audio: CDN + "q608288_6_It_isn39t_very_expensive.mp3"
    },
    {
      id: "incredibly",
      text: "She drives incredibly fast.",
      tokens: ["She", "drives", "incredibly", "fast"],
      audio: CDN + "p994503_7_She_drives_incrdibly_fast.mp3"
    },
    {
      id: "slowly",
      text: "They speak really slowly.",
      tokens: ["They", "speak", "really", "slowly"],
      audio: CDN + "x49458_8_They_speak_really_slowly.mp3"
    }
  ];

  var DISTRACTOR_BANK = [
    "carefully", "badly", "easily", "healthily", "possibly",
    "good", "bad", "slow", "quick", "nice",
    "always", "never", "really", "very", "fast",
    "live", "speak", "drive", "work", "eat",
    "children", "English", "expensive", "independently"
  ];

  var MODES = [
    {
      id: "listen-chips",
      title: "Listen & Complete",
      tip: "Listen, then build the sentence with the chips.",
      hasAudio: true,
      input: "chips",
      encourage: "Great listening! 🎧"
    },
    {
      id: "chips-only",
      title: "Complete the Sentence",
      tip: "Build the sentence with the chips. No audio this time!",
      hasAudio: false,
      input: "chips",
      encourage: "Nice work! ✨"
    },
    {
      id: "listen-type",
      title: "Listen & Type",
      tip: "Listen, then type the full sentence.",
      hasAudio: true,
      input: "type",
      encourage: "Amazing! 🎉 You finished all 3 parts."
    }
  ];

  var TOTAL_ROUNDS = MODES.length * ITEMS.length;

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "menu"; // menu | play | between | done
  var modeIndex = 0;
  var order = [];
  var index = 0;
  var score = 0;
  var wrongs = 0;
  var locked = false;
  var slots = [];
  var poolCache = null;
  var poolItemId = null;
  var currentAudio = null;
  var typeValue = "";

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) return LASfx.correct();
        if (name === "wrong" && LASfx.wrong) return LASfx.wrong();
        if (name === "click" && LASfx.click) return LASfx.click();
        if (name === "win" && LASfx.win) return LASfx.win();
      }
    } catch (_) {}
  }

  function setPlaying(on) {
    var btn = document.getElementById("lc-play");
    if (btn) btn.classList.toggle("playing", !!on);
  }

  function playAudio(item) {
    if (!item || !item.audio) return;
    // toggle off if already playing
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      setPlaying(false);
      return;
    }
    stopAudio();
    setPlaying(false);
    try {
      currentAudio = new Audio(item.audio);
      setPlaying(true);
      currentAudio.play().catch(function () {
        setPlaying(false);
      });
      currentAudio.onended = function () {
        setPlaying(false);
        currentAudio = null;
      };
    } catch (_) {
      setPlaying(false);
    }
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    setPlaying(false);
  }

  function current() {
    return order[index];
  }

  function mode() {
    return MODES[modeIndex];
  }

  function chipPool(item) {
    var correct = item.tokens.slice();
    var used = {};
    correct.forEach(function (t) {
      used[t.toLowerCase()] = true;
    });
    var candidates = [];
    ITEMS.forEach(function (other) {
      if (other.id === item.id) return;
      other.tokens.forEach(function (t) {
        var k = t.toLowerCase();
        if (!used[k] && candidates.indexOf(t) < 0) candidates.push(t);
      });
    });
    DISTRACTOR_BANK.forEach(function (t) {
      var k = t.toLowerCase();
      if (!used[k] && candidates.indexOf(t) < 0) candidates.push(t);
    });
    var distractors = shuffle(candidates).slice(0, 2);
    return shuffle(correct.concat(distractors));
  }

  function getPool(item) {
    if (poolItemId !== item.id || !poolCache) {
      poolCache = chipPool(item);
      poolItemId = item.id;
    }
    return poolCache;
  }

  function chipsCorrect(item) {
    var target = item.tokens;
    if (slots.length !== target.length) return false;
    for (var i = 0; i < target.length; i++) {
      if (slots[i] !== target[i]) return false;
    }
    return true;
  }

  function normalizeType(s) {
    return String(s)
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function typeCorrect(item) {
    var target = normalizeType(item.text);
    var typed = normalizeType(typeValue);
    return typed === target;
  }

  function goNext() {
    index += 1;
    locked = false;
    slots = [];
    typeValue = "";
    poolCache = null;
    poolItemId = null;
    stopAudio();
    if (index >= order.length) {
      if (modeIndex < MODES.length - 1) {
        phase = "between";
        render();
      } else {
        finishGame();
      }
    } else {
      render();
    }
  }

  function tryAgain() {
    locked = false;
    slots = [];
    typeValue = "";
    poolCache = null;
    poolItemId = null;
    // re-render same item so chips / input reset
    render();
  }

  function showWrongActions() {
    var fb = document.getElementById("lc-fb");
    if (!fb) return;
    if (document.getElementById("lc-wrong-actions")) return;

    var wrap = document.createElement("div");
    wrap.id = "lc-wrong-actions";
    wrap.className = "lc-wrong-actions";

    var tryBtn = document.createElement("button");
    tryBtn.type = "button";
    tryBtn.id = "lc-try-again";
    tryBtn.className = "lc-icon-btn lc-try-btn";
    tryBtn.setAttribute("aria-label", "Try again");
    tryBtn.title = "Try again";
    tryBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    tryBtn.onclick = function () {
      sfx("click");
      tryAgain();
    };

    var contBtn = document.createElement("button");
    contBtn.type = "button";
    contBtn.id = "lc-continue";
    contBtn.className = "lc-icon-btn lc-continue-btn is-primary";
    contBtn.setAttribute("aria-label", "Continue");
    contBtn.title = "Continue";
    contBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
    contBtn.onclick = function () {
      sfx("click");
      goNext();
    };

    wrap.appendChild(tryBtn);
    wrap.appendChild(contBtn);
    fb.parentNode.insertBefore(wrap, fb.nextSibling);
  }

  function afterAnswer(ok) {
    locked = true;
    if (ok) {
      score += 1;
      sfx("correct");
      setTimeout(goNext, 750);
    } else {
      wrongs += 1;
      sfx("wrong");
      // freeze chips / input so player can review the mistake
      var poolEl = document.getElementById("lc-pool");
      if (poolEl) {
        poolEl.querySelectorAll("button").forEach(function (b) {
          b.disabled = true;
        });
      }
      var slotsEl = document.getElementById("lc-slots");
      if (slotsEl) {
        slotsEl.querySelectorAll("button").forEach(function (b) {
          b.disabled = true;
        });
      }
      var checkBtn = document.getElementById("lc-check");
      if (checkBtn) checkBtn.disabled = true;
      var typeInput = document.getElementById("lc-type");
      if (typeInput) typeInput.disabled = true;
      showWrongActions();
    }
  }

  function checkChips() {
    if (locked || phase !== "play") return;
    var item = current();
    if (!item) return;
    if (slots.length < item.tokens.length) return;
    var ok = chipsCorrect(item);
    var fb = document.getElementById("lc-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + item.text : "Answer: " + item.text;
      fb.className = "lc-fb " + (ok ? "ok" : "bad");
    }
    var slotsEl = document.getElementById("lc-slots");
    if (slotsEl) {
      slotsEl.querySelectorAll(".lc-slot").forEach(function (el) {
        el.classList.add(ok ? "ok" : "bad");
      });
    }
    afterAnswer(ok);
  }

  function checkType() {
    if (locked || phase !== "play") return;
    var item = current();
    if (!item) return;
    var input = document.getElementById("lc-type");
    if (input) typeValue = input.value;
    if (!typeValue.trim()) return;
    var ok = typeCorrect(item);
    if (input) {
      input.classList.add(ok ? "ok" : "bad");
      input.disabled = true;
    }
    var fb = document.getElementById("lc-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + item.text : "Answer: " + item.text;
      fb.className = "lc-fb " + (ok ? "ok" : "bad");
    }
    afterAnswer(ok);
  }

  function placeChip(tok) {
    if (locked) return;
    var item = current();
    if (!item) return;
    if (slots.length >= item.tokens.length) return;
    slots.push(tok);
    sfx("click");
    renderPlayPartial();
    if (slots.length >= item.tokens.length) {
      setTimeout(checkChips, 180);
    }
  }

  function removeChip(i) {
    if (locked) return;
    slots.splice(i, 1);
    sfx("click");
    renderPlayPartial();
  }

  function renderSlots(item) {
    var need = item.tokens;
    var html = "";
    for (var i = 0; i < need.length; i++) {
      if (slots[i]) {
        html +=
          '<button type="button" class="lc-slot filled" data-si="' +
          i +
          '">' +
          escapeHtml(slots[i]) +
          "</button>";
      } else {
        html += '<span class="lc-slot empty"></span>';
      }
    }
    return html;
  }

  function renderPool(item) {
    var pool = getPool(item);
    var usedCount = {};
    slots.forEach(function (s) {
      usedCount[s] = (usedCount[s] || 0) + 1;
    });
    return pool
      .map(function (tok) {
        var used = (usedCount[tok] || 0) > 0;
        if (used) {
          usedCount[tok] -= 1;
          return (
            '<button type="button" class="lc-chip used" disabled>' +
            escapeHtml(tok) +
            "</button>"
          );
        }
        return (
          '<button type="button" class="lc-chip" data-tok="' +
          escapeHtml(tok) +
          '">' +
          escapeHtml(tok) +
          "</button>"
        );
      })
      .join("");
  }

  function renderPlayPartial() {
    var item = current();
    if (!item) return;
    var slotsEl = document.getElementById("lc-slots");
    var poolEl = document.getElementById("lc-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(item);
      slotsEl.querySelectorAll("[data-si]").forEach(function (btn) {
        btn.onclick = function () {
          removeChip(+btn.dataset.si);
        };
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool(item);
      poolEl.querySelectorAll("[data-tok]").forEach(function (btn) {
        btn.onclick = function () {
          placeChip(btn.dataset.tok);
        };
      });
    }
  }

  function calcAccuracy() {
    var attempts = score + wrongs;
    if (attempts <= 0) return 0;
    return Math.round((score / attempts) * 100);
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

  function startPart(mi) {
    modeIndex = mi;
    order = shuffle(ITEMS.slice());
    index = 0;
    locked = false;
    slots = [];
    typeValue = "";
    poolCache = null;
    poolItemId = null;
    phase = "play";
    if (mi === 0 && window.LAFinish) LAFinish.startTimer();
    render();
  }

  function finishGame() {
    phase = "done";
    sfx("win");
    stopAudio();
    var stars = saveStars();
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL_ROUNDS,
          accuracy: calcAccuracy(),
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: function () {
            score = 0;
            wrongs = 0;
            startPart(0);
          },
          onModes: function () {
            phase = "menu";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {}
    }
    render();
  }

  function topbar(title) {
    var m = mode();
    var prog =
      "P" +
      (modeIndex + 1) +
      " · " +
      (index + 1) +
      "/" +
      order.length;
    return (
      '<header class="lc-topbar">' +
      '<a class="lc-back" href="../" aria-label="Back">←</a>' +
      '<div class="lc-topbar-center">' +
      '<span class="lc-kicker">UNIT 11A · PART ' +
      (modeIndex + 1) +
      "/3</span>" +
      '<span class="lc-title">' +
      escapeHtml(title || m.title) +
      "</span>" +
      "</div>" +
      '<span class="lc-badge">' +
      prog +
      "</span>" +
      "</header>"
    );
  }

  function progressBar() {
    var pct = order.length
      ? Math.round((index / order.length) * 100)
      : 0;
    return (
      '<div class="lc-progress"><div class="lc-progress-fill" style="width:' +
      pct +
      '%"></div></div>'
    );
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<div class="lc-topbar-center">' +
        '<span class="lc-kicker">UNIT 11A</span>' +
        '<span class="lc-title">Adverbs Practice</span>' +
        "</div>" +
        '<span class="lc-badge">3 parts</span>' +
        "</header>" +
        '<section class="lc-start">' +
        '<div class="lc-hero">🎧</div>' +
        "<h1>Adverbs · Listen &amp; Complete</h1>" +
        '<p class="lc-desc">8 sentences · 3 parts</p>' +
        '<ol class="lc-part-list">' +
        "<li><strong>Part 1</strong> — Listen &amp; complete (chips)</li>" +
        "<li><strong>Part 2</strong> — Complete (no audio)</li>" +
        "<li><strong>Part 3</strong> — Listen &amp; type</li>" +
        "</ol>" +
        '<button type="button" class="lc-btn" id="lc-start">Start Part 1</button>' +
        "</section>";
      document.getElementById("lc-start").onclick = function () {
        sfx("click");
        score = 0;
        wrongs = 0;
        startPart(0);
      };
      return;
    }

    if (phase === "between") {
      var finished = MODES[modeIndex];
      var next = MODES[modeIndex + 1];
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<div class="lc-topbar-center">' +
        '<span class="lc-kicker">UNIT 11A</span>' +
        '<span class="lc-title">Adverbs Practice</span>' +
        "</div></header>" +
        '<section class="lc-between">' +
        '<div class="lc-hero">✨</div>' +
        "<h1>Part " +
        (modeIndex + 1) +
        " complete!</h1>" +
        "<p>" +
        finished.encourage +
        "</p>" +
        '<p style="opacity:0.7;margin-top:12px">Up next:</p>' +
        "<p><strong>Part " +
        (modeIndex + 2) +
        "</strong> — " +
        next.title +
        "</p>" +
        '<button type="button" class="lc-btn" id="lc-continue" style="margin-top:16px">Continue</button>' +
        "</section>";
      document.getElementById("lc-continue").onclick = function () {
        sfx("click");
        startPart(modeIndex + 1);
      };
      return;
    }

    if (phase === "done") {
      var stars = calcStars();
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<div class="lc-topbar-center">' +
        '<span class="lc-kicker">UNIT 11A</span>' +
        '<span class="lc-title">Done!</span>' +
        "</div></header>" +
        '<section class="lc-start">' +
        '<div class="lc-hero">🏆</div>' +
        "<h1>All done!</h1>" +
        "<p>Score: " +
        score +
        "/" +
        TOTAL_ROUNDS +
        "</p>" +
        "<p>Accuracy: " +
        calcAccuracy() +
        "%</p>" +
        '<p style="font-size:1.6rem;color:#f59e0b;letter-spacing:4px">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</p>" +
        '<button type="button" class="lc-btn" id="lc-again">Again</button>' +
        "</section>";
      document.getElementById("lc-again").onclick = function () {
        sfx("click");
        score = 0;
        wrongs = 0;
        startPart(0);
      };
      return;
    }

    // play
    var item = current();
    var m = mode();
    if (!item) return;

    var body = "";
    if (m.hasAudio) {
      body +=
        '<div class="lc-audio-wrap">' +
        '<button type="button" class="mc-play" id="lc-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button></div>";
    } else {
      body +=
        '<p class="lc-hint-blank">Build the sentence — no audio</p>';
    }

    if (m.input === "chips") {
      body +=
        '<div class="lc-slots" id="lc-slots">' +
        renderSlots(item) +
        "</div>" +
        '<div class="lc-pool" id="lc-pool">' +
        renderPool(item) +
        "</div>";
    } else {
      body +=
        '<div class="lc-type-wrap">' +
        '<input type="text" class="lc-type-input" id="lc-type" placeholder="Type the sentence…" autocomplete="off" autocapitalize="sentences" spellcheck="false" />' +
        '<button type="button" class="lc-check-btn" id="lc-check">Check</button>' +
        "</div>";
    }

    body += '<p class="lc-fb" id="lc-fb"></p>';

    app.innerHTML =
      topbar() +
      progressBar() +
      '<p class="lc-instruction">' +
      escapeHtml(m.tip) +
      "</p>" +
      '<section class="lc-play-area">' +
      body +
      "</section>";

    if (m.hasAudio) {
      var playBtn = document.getElementById("lc-play");
      if (playBtn) {
        playBtn.onclick = function () {
          playAudio(item);
        };
        // auto-play once
        playAudio(item);
      }
    }

    if (m.input === "chips") {
      renderPlayPartial();
    } else {
      var input = document.getElementById("lc-type");
      var checkBtn = document.getElementById("lc-check");
      if (input) {
        input.focus();
        input.onkeydown = function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            checkType();
          }
        };
      }
      if (checkBtn) {
        checkBtn.onclick = function () {
          checkType();
        };
      }
    }
  }

  render();
})();
