/* Listen & Complete (chips) — AEF Starter Unit 6A
   Listen to the audio, then build the sentence with chip buttons.
   Only two distractors per round. */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-listen-and-complete";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "american-company",
      text: "I work for an American company",
      tokens: ["I", "work", "for", "an", "American", "company"],
      audio: CDN + "f156704_I_work_for_an_American_company.mp3"
    },
    {
      id: "college",
      text: "I'm in college",
      tokens: ["I'm", "in", "college"],
      audio: CDN + "f868566_I39m_in_collegue.mp3"
    },
    {
      id: "student",
      text: "I'm a student",
      tokens: ["I'm", "a", "student"],
      audio: CDN + "v673671_I39m_a_student.mp3"
    },
    {
      id: "economics",
      text: "I study economics",
      tokens: ["I", "study", "economics"],
      audio: CDN + "n218278_I_study_economics.mp3"
    },
    {
      id: "school",
      text: "I'm at school",
      tokens: ["I'm", "at", "school"],
      audio: CDN + "p6754_I39m_at_school.mp3"
    },
    {
      id: "unemployed",
      text: "I'm unemployed right now",
      tokens: ["I'm", "unemployed", "right", "now"],
      audio: CDN + "u765196_I39m_unemoyeed_right_now.mp3"
    },
    {
      id: "retired",
      text: "I'm retired",
      tokens: ["I'm", "retired"],
      audio: CDN + "v08385_I39m_retired.mp3"
    }
  ];

  // Shared distractor word bank (theme-related but not exact matches)
  var DISTRACTOR_BANK = [
    "teacher", "doctor", "job", "hospital", "office",
    "nurse", "waiter", "work", "study", "home",
    "factory", "taxi", "police", "school", "college"
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | done
  var order = [];
  var index = 0;
  var score = 0;
  var wrongs = 0;
  var locked = false;
  var slots = [];
  var poolCache = null;
  var poolItemId = null;
  var currentAudio = null;

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

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(item) {
    if (!item || !item.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      currentAudio.play().catch(function () {});
    } catch (_) {}
  }

  function current() {
    return order[index];
  }

  function totalRounds() {
    return ITEMS.length;
  }

  /** Build pool: exact correct tokens + exactly 2 distractors */
  function chipPool(item) {
    var correct = item.tokens.slice();
    var used = {};
    correct.forEach(function (t) {
      used[t.toLowerCase()] = true;
    });

    // Prefer words from other items, then bank
    var candidates = [];
    ITEMS.forEach(function (other) {
      if (other.id === item.id) return;
      other.tokens.forEach(function (t) {
        var k = t.toLowerCase();
        if (!used[k] && candidates.indexOf(t) < 0) {
          candidates.push(t);
        }
      });
    });
    DISTRACTOR_BANK.forEach(function (t) {
      var k = t.toLowerCase();
      if (!used[k] && candidates.indexOf(t) < 0) {
        candidates.push(t);
      }
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

  function afterAnswer(ok) {
    locked = true;
    if (ok) {
      score += 1;
      sfx("correct");
    } else {
      wrongs += 1;
      sfx("wrong");
    }
    setTimeout(function () {
      index += 1;
      locked = false;
      slots = [];
      poolCache = null;
      poolItemId = null;
      if (index >= order.length) {
        finishGame();
      } else {
        render();
      }
    }, ok ? 750 : 1300);
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
    // Highlight slots
    var slotsEl = document.getElementById("lc-slots");
    if (slotsEl) {
      slotsEl.querySelectorAll(".lc-slot").forEach(function (el) {
        el.classList.add(ok ? "ok" : "bad");
      });
    }
    afterAnswer(ok);
  }

  function placeChip(tok) {
    if (locked) return;
    var item = current();
    if (!item) return;
    var need = item.tokens.length;
    if (slots.length >= need) return;
    slots.push(tok);
    sfx("click");
    renderPlayPartial();
    if (slots.length >= need) {
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
          // consume one use
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

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.slice());
    index = 0;
    score = 0;
    wrongs = 0;
    locked = false;
    slots = [];
    poolCache = null;
    poolItemId = null;
    phase = "play";
    stopAudio();
    render();
  }

  function finishGame() {
    phase = "done";
    sfx("win");
    var stars = calcStars();
    var accuracy = calcAccuracy();
    var total = totalRounds();
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
    } catch (_) {}
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          accuracy: accuracy,
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {}
    }
    render();
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<div class="lc-topbar-center">' +
        '<span class="lc-kicker">UNIT 6A</span>' +
        '<span class="lc-title">Listen &amp; Complete</span>' +
        "</div></header>" +
        '<section class="lc-start">' +
        '<div class="lc-hero">🎧</div>' +
        "<h1>Listen &amp; Complete</h1>" +
        '<p class="lc-desc">Listen to the audio, then tap the chips in the correct order to build the sentence.</p>' +
        '<ul class="lc-tips">' +
        "<li>Only the right words + <strong>2 distractors</strong></li>" +
        "<li>Tap a placed chip to remove it</li>" +
        "<li>7 sentences about work &amp; study</li>" +
        "</ul>" +
        '<button type="button" class="lc-btn" id="lc-start">Start</button>' +
        "</section>";
      document.getElementById("lc-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        '<section class="lc-start">' +
        '<div class="lc-hero">🏆</div>' +
        "<h1>Done!</h1>" +
        "<p>Score: " +
        score +
        " / " +
        totalRounds() +
        "</p>" +
        '<button type="button" class="lc-btn" id="lc-again">Play again</button>' +
        '<a class="lc-link" href="../">Back to games</a>' +
        "</section>";
      document.getElementById("lc-again").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    // play
    var item = current();
    if (!item) return;
    if (poolItemId !== item.id) {
      slots = [];
      poolCache = null;
    }

    var progressPct = Math.round((index / totalRounds()) * 100);

    app.innerHTML =
      '<header class="lc-topbar">' +
      '<a class="lc-back" href="../" aria-label="Back">←</a>' +
      '<div class="lc-topbar-center">' +
      '<span class="lc-kicker">LISTEN &amp; COMPLETE</span>' +
      '<span class="lc-title">Build the sentence</span>' +
      "</div>" +
      '<span class="lc-badge">' +
      (index + 1) +
      "/" +
      totalRounds() +
      "</span>" +
      "</header>" +
      '<div class="lc-progress"><div class="lc-progress-fill" style="width:' +
      progressPct +
      '%"></div></div>' +
      '<p class="lc-instruction">Listen, then tap the chips in order.</p>' +
      '<div class="lc-audio-wrap">' +
      '<button type="button" class="lc-audio-btn" id="lc-play" aria-label="Play audio">▶ Play</button>' +
      "</div>" +
      '<div class="lc-slots" id="lc-slots">' +
      renderSlots(item) +
      "</div>" +
      '<div class="lc-pool" id="lc-pool">' +
      renderPool(item) +
      "</div>" +
      '<div class="lc-fb" id="lc-fb"></div>';

    document.getElementById("lc-play").onclick = function () {
      sfx("click");
      playAudio(item);
    };

    // auto-play once when the card appears
    setTimeout(function () {
      playAudio(item);
    }, 280);

    document.getElementById("lc-slots").querySelectorAll("[data-si]").forEach(function (btn) {
      btn.onclick = function () {
        removeChip(+btn.dataset.si);
      };
    });
    document.getElementById("lc-pool").querySelectorAll("[data-tok]").forEach(function (btn) {
      btn.onclick = function () {
        placeChip(btn.dataset.tok);
      };
    });
  }

  // boot
  render();
})();
