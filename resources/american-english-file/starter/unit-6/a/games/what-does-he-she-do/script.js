/* What does he / she do? – AEF Starter Unit 6A
   Part 1: chip sentence builder  ·  Part 2: write the full answer */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-what-does-he-she-do";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // Females listed by user; the rest are male
  var ITEMS = [
    { id: "teacher", job: "teacher", label: "a teacher", gender: "f",
      image: CDN + "y431285_1_teacher.png", audio: CDN + "e500251_1_a_teacher.mp3" },
    { id: "doctor", job: "doctor", label: "a doctor", gender: "m",
      image: CDN + "u765683_2_a_doctor.png", audio: CDN + "y03769_2_a_doctor.mp3" },
    { id: "nurse", job: "nurse", label: "a nurse", gender: "f",
      image: CDN + "o88045_3_a_nurse.png", audio: CDN + "h90124_3_a_nurse.mp3" },
    { id: "journalist", job: "journalist", label: "a journalist", gender: "m",
      image: CDN + "y033377_4_a_nurse.png", audio: CDN + "y108055_4_a_journalist.mp3" },
    { id: "waiter", job: "waiter", label: "a waiter", gender: "m",
      image: CDN + "j13538_5_a_waiter.png", audio: CDN + "i300299_5_a_waiter.mp3" },
    { id: "waitress", job: "waitress", label: "a waitress", gender: "f",
      image: CDN + "s032802_6_a_waitress.png", audio: CDN + "q243679_6_a_waitress.mp3" },
    { id: "salesperson", job: "salesperson", label: "a salesperson", gender: "m",
      image: CDN + "p208694_7_a_salesperson.png", audio: CDN + "c70645_7_a_salesperson.mp3" },
    { id: "receptionist", job: "receptionist", label: "a receptionist", gender: "f",
      image: CDN + "z996638_8_a_receptionist.png", audio: CDN + "c29486_8_a_recptionist.mp3" },
    { id: "policeman", job: "policeman", label: "a policeman", gender: "m",
      image: CDN + "d755786_9_a_policeman.png", audio: CDN + "k557960_9_a_policeman.mp3" },
    { id: "policewoman", job: "policewoman", label: "a policewoman", gender: "f",
      image: CDN + "s982850_10_a_policeman.png", audio: CDN + "l328420_10_a_policeowman.mp3" },
    { id: "factory-worker", job: "factory worker", label: "a factory worker", gender: "m",
      image: CDN + "k96301_11_a_factory_worker.png", audio: CDN + "s79925_11_a_factory_worker.mp3" },
    { id: "taxi-driver", job: "taxi driver", label: "a taxi driver", gender: "m",
      image: CDN + "q003095_12_a_taxi_driver.png", audio: CDN + "c56441_12_a_taxi_driver.mp3" }
  ];

  var MODES = [
    {
      id: "chips",
      title: "Build the answer",
      tip: "Look at the picture. Tap the chips to make the sentence."
    },
    {
      id: "write",
      title: "Write the answer",
      tip: "Look at the picture. Type the full sentence."
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | between | done
  var modeIndex = 0;
  var order = [];
  var index = 0;
  var score = 0;
  var wrongs = 0;
  var locked = false;
  var slots = []; // chip tokens placed
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

  function pronoun(item) {
    return item.gender === "f" ? "She" : "He";
  }

  function targetTokens(item) {
    // He / She + 's + a + job words (job may be multi-word)
    var jobParts = item.job.split(" ");
    return [pronoun(item), "'s", "a"].concat(jobParts);
  }

  function targetSentence(item) {
    // "He's a waiter" / "She's a teacher"
    return pronoun(item) + "'s " + item.label;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.,!?]/g, "")
      .trim();
  }

  function isWriteCorrect(user, item) {
    var n = norm(user);
    var targets = [
      norm(targetSentence(item)),
      norm(pronoun(item) + " is " + item.label),
      norm(pronoun(item) + " is " + item.job)
    ];
    return targets.indexOf(n) >= 0;
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

  function totalRounds() {
    return ITEMS.length * MODES.length;
  }

  function progressDone() {
    return modeIndex * ITEMS.length + index;
  }

  function current() {
    return order[index];
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = 0;
    score = 0;
    wrongs = 0;
    beginMode();
  }

  function beginMode() {
    order = shuffle(ITEMS.slice());
    index = 0;
    locked = false;
    slots = [];
    phase = "play";
    stopAudio();
    render();
  }

  function chipPool(item) {
    // Correct tokens + a few distractors
    var correct = targetTokens(item);
    var distractors = [];
    // opposite pronoun
    distractors.push(item.gender === "f" ? "He" : "She");
    // other jobs
    var others = shuffle(
      ITEMS.filter(function (x) {
        return x.id !== item.id;
      })
    ).slice(0, 3);
    others.forEach(function (o) {
      o.job.split(" ").forEach(function (w) {
        if (distractors.indexOf(w) < 0 && correct.indexOf(w) < 0) distractors.push(w);
      });
    });
    // optional "is" distractor
    if (distractors.indexOf("is") < 0) distractors.push("is");

    var pool = correct.concat(distractors);
    // unique by value but keep multiples if needed - for multi-word job no dupes needed
    var seen = {};
    var uniq = [];
    pool.forEach(function (tok) {
      var k = tok;
      if (!seen[k]) {
        seen[k] = true;
        uniq.push(tok);
      }
    });
    return shuffle(uniq);
  }

  function builtFromSlots() {
    // Join: He + 's + a + waiter → He's a waiter
    if (!slots.length) return "";
    var out = slots[0];
    for (var i = 1; i < slots.length; i++) {
      var t = slots[i];
      if (t === "'s") out += "'s";
      else out += " " + t;
    }
    return out;
  }

  function chipsCorrect(item) {
    var target = targetTokens(item);
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
    }, ok ? 700 : 1200);
  }

  function checkChips() {
    if (locked || phase !== "play") return;
    var item = current();
    if (!item) return;
    if (slots.length < targetTokens(item).length) return;
    var ok = chipsCorrect(item);
    var fb = document.getElementById("wd-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + targetSentence(item) : "Answer: " + targetSentence(item);
      fb.className = "wd-fb " + (ok ? "ok" : "bad");
    }
    afterAnswer(ok);
  }

  function checkWrite() {
    if (locked || phase !== "play") return;
    var input = document.getElementById("wd-input");
    if (!input) return;
    var item = current();
    var user = input.value;
    if (!norm(user)) {
      input.focus();
      return;
    }
    input.disabled = true;
    var ok = isWriteCorrect(user, item);
    var fb = document.getElementById("wd-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + targetSentence(item) : "Answer: " + targetSentence(item);
      fb.className = "wd-fb " + (ok ? "ok" : "bad");
    }
    input.classList.add(ok ? "ok" : "bad");
    afterAnswer(ok);
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

  function placeChip(tok) {
    if (locked) return;
    var item = current();
    var need = targetTokens(item).length;
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

  function renderPlayPartial() {
    var slotsEl = document.getElementById("wd-slots");
    var poolEl = document.getElementById("wd-pool");
    var item = current();
    if (!item) return;
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(item);
      slotsEl.querySelectorAll("[data-si]").forEach(function (btn) {
        btn.onclick = function () {
          removeChip(+btn.dataset.si);
        };
      });
    }
    if (poolEl) {
      // rebuild pool highlighting used tokens once
      var used = {};
      slots.forEach(function (s) {
        used[s] = (used[s] || 0) + 1;
      });
      var pool = chipPool(item);
      // Actually don't reshuffle pool on every place — store on item
    }
  }

  // Keep stable pool per round
  var poolCache = null;
  var poolItemId = null;

  function getPool(item) {
    if (poolItemId !== item.id || !poolCache) {
      poolCache = chipPool(item);
      poolItemId = item.id;
    }
    return poolCache;
  }

  function renderSlots(item) {
    var need = targetTokens(item);
    var html = "";
    for (var i = 0; i < need.length; i++) {
      if (slots[i]) {
        html +=
          '<button type="button" class="wd-slot filled" data-si="' +
          i +
          '">' +
          escapeHtml(slots[i]) +
          "</button>";
      } else {
        html += '<span class="wd-slot empty"></span>';
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
    var available = {};
    pool.forEach(function (t) {
      available[t] = (available[t] || 0) + 1;
    });
    // Mark used: each token can only be used as many times as in pool (1)
    return pool
      .map(function (tok) {
        var used = (usedCount[tok] || 0) > 0;
        // if multiple same tokens in pool we'd track better; pool is unique
        if (used) {
          return (
            '<button type="button" class="wd-chip used" disabled>' +
            escapeHtml(tok) +
            "</button>"
          );
        }
        return (
          '<button type="button" class="wd-chip" data-tok="' +
          escapeHtml(tok) +
          '">' +
          escapeHtml(tok) +
          "</button>"
        );
      })
      .join("");
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="wd-topbar">' +
        '<a class="wd-back" href="../" aria-label="Back">←</a>' +
        '<div class="wd-topbar-center">' +
        '<span class="wd-kicker">UNIT 6A</span>' +
        '<span class="wd-title">What does he / she do?</span>' +
        "</div></header>" +
        '<section class="wd-start">' +
        '<div class="wd-hero">💼</div>' +
        "<h1>What does he / she do?</h1>" +
        '<p class="wd-desc">Two parts · Build with chips, then write the full answer.</p>' +
        '<ol class="wd-parts">' +
        "<li><strong>Part 1</strong> — Tap chips to build <em>He's a waiter</em></li>" +
        "<li><strong>Part 2</strong> — Type the whole sentence</li>" +
        "</ol>" +
        '<button type="button" class="wd-btn" id="wd-start">Start Part 1</button>' +
        "</section>";
      document.getElementById("wd-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "between") {
      app.innerHTML =
        '<header class="wd-topbar">' +
        '<a class="wd-back" href="../" aria-label="Back">←</a>' +
        '<span class="wd-title">Part 1 complete!</span></header>' +
        '<section class="wd-start">' +
        '<div class="wd-hero">✨</div>' +
        "<h1>Nice work!</h1>" +
        '<p class="wd-desc">Now type the full answers — no chips this time.</p>' +
        '<button type="button" class="wd-btn" id="wd-next">Start Part 2</button>' +
        "</section>";
      document.getElementById("wd-next").onclick = function () {
        sfx("click");
        modeIndex = 1;
        beginMode();
      };
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        '<section class="wd-start"><h1>Done!</h1><p>Score: ' +
        score +
        " / " +
        totalRounds() +
        '</p><button type="button" class="wd-btn" id="wd-again">Play again</button></section>';
      document.getElementById("wd-again").onclick = startGame;
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var item = current();
    slots = slots || [];
    if (poolItemId !== item.id) {
      slots = [];
      poolCache = null;
      poolItemId = null;
    }

    var done = progressDone();
    var total = totalRounds();
    var pct = (done / total) * 100;
    var q = "What does " + (item.gender === "f" ? "she" : "he") + " do?";

    var answerArea = "";
    if (mode.id === "chips") {
      answerArea =
        '<div class="wd-slots" id="wd-slots">' +
        renderSlots(item) +
        "</div>" +
        '<div class="wd-pool" id="wd-pool">' +
        renderPool(item) +
        "</div>" +
        '<p class="wd-fb" id="wd-fb"></p>';
    } else {
      answerArea =
        '<div class="wd-write">' +
        '<input class="wd-input" id="wd-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="e.g. He\'s a waiter" enterkeyhint="done" />' +
        '<p class="wd-fb" id="wd-fb"></p>' +
        '<button type="button" class="wd-btn" id="wd-check">Check</button>' +
        "</div>";
    }

    app.innerHTML =
      '<header class="wd-topbar">' +
      '<a class="wd-back" href="../" aria-label="Back">←</a>' +
      '<div class="wd-topbar-center">' +
      '<span class="wd-kicker">PART ' +
      (modeIndex + 1) +
      " / 2</span>" +
      '<span class="wd-title">' +
      escapeHtml(mode.title) +
      "</span></div>" +
      '<span class="wd-badge">' +
      (index + 1) +
      "/" +
      order.length +
      "</span></header>" +
      '<p class="wd-instruction">' +
      escapeHtml(mode.tip) +
      "</p>" +
      '<div class="wd-progress"><div class="wd-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="wd-card">' +
      '<img class="wd-photo" src="' +
      item.image +
      '" alt="" draggable="false" />' +
      '<p class="wd-question">' +
      escapeHtml(q) +
      "</p>" +
      '<button type="button" class="wd-audio" id="wd-audio" aria-label="Play">🔊</button>' +
      "</div>" +
      answerArea;

    var audioBtn = document.getElementById("wd-audio");
    if (audioBtn) {
      audioBtn.onclick = function () {
        sfx("click");
        playAudio(item);
      };
    }

    if (mode.id === "chips") {
      document.querySelectorAll("#wd-pool .wd-chip:not(.used)").forEach(function (btn) {
        btn.onclick = function () {
          placeChip(btn.getAttribute("data-tok"));
          // re-render pool/slots
          var slotsEl = document.getElementById("wd-slots");
          var poolEl = document.getElementById("wd-pool");
          if (slotsEl) {
            slotsEl.innerHTML = renderSlots(item);
            slotsEl.querySelectorAll("[data-si]").forEach(function (b) {
              b.onclick = function () {
                removeChip(+b.dataset.si);
                document.getElementById("wd-slots").innerHTML = renderSlots(item);
                document.getElementById("wd-pool").innerHTML = renderPool(item);
                bindChipHandlers(item);
              };
            });
          }
          if (poolEl) {
            poolEl.innerHTML = renderPool(item);
            bindChipHandlers(item);
          }
          if (slots.length >= targetTokens(item).length) {
            setTimeout(checkChips, 180);
          }
        };
      });
      document.querySelectorAll("#wd-slots [data-si]").forEach(function (b) {
        b.onclick = function () {
          removeChip(+b.dataset.si);
          document.getElementById("wd-slots").innerHTML = renderSlots(item);
          document.getElementById("wd-pool").innerHTML = renderPool(item);
          bindChipHandlers(item);
        };
      });
    } else {
      var input = document.getElementById("wd-input");
      var check = document.getElementById("wd-check");
      if (check) {
        check.onclick = function () {
          sfx("click");
          checkWrite();
        };
      }
      if (input) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            checkWrite();
          }
        });
        setTimeout(function () {
          input.focus();
        }, 120);
      }
    }
  }

  function bindChipHandlers(item) {
    document.querySelectorAll("#wd-pool .wd-chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        placeChip(btn.getAttribute("data-tok"));
        document.getElementById("wd-slots").innerHTML = renderSlots(item);
        document.getElementById("wd-pool").innerHTML = renderPool(item);
        bindChipHandlers(item);
        if (slots.length >= targetTokens(item).length) {
          setTimeout(checkChips, 180);
        }
      };
    });
    document.querySelectorAll("#wd-slots [data-si]").forEach(function (b) {
      b.onclick = function () {
        removeChip(+b.dataset.si);
        document.getElementById("wd-slots").innerHTML = renderSlots(item);
        document.getElementById("wd-pool").innerHTML = renderPool(item);
        bindChipHandlers(item);
      };
    });
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
