/* Possessive 's · picture + choose OR build sentence · AEF Starter Unit 4A */
(function () {

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


  const GAME_ID = "starter-4a-possessive-s";

  const ITEMS = [
    {
      image: "https://cdn.imgurl.ir/uploads/y405186_this_is_jack39s_car.png",
      sentence: "This is ______ car.",
      options: ["Jack", "Jack's", "Jacks"],
      answer: "Jack's",
      build: ["This", "is", "Jack", "'", "s", "car."],
    },
    {
      image: "https://cdn.imgurl.ir/uploads/q98815_Ella_is_Ben39s_wife.png",
      sentence: "Ella is ____ wife.",
      options: ["Ben", "Ben's", "Bens"],
      answer: "Ben's",
      build: ["Ella", "is", "Ben", "'", "s", "wife."],
    },
    {
      image: "https://cdn.imgurl.ir/uploads/o819039_Maria_is_Carlos39s_sister.png",
      sentence: "Maria is _____ sister.",
      options: ["Carlos", "Carlos's", "Carloss"],
      answer: "Carlos's",
      build: ["Maria", "is", "Carlos", "'", "s", "sister."],
    },
    {
      image: "https://cdn.imgurl.ir/uploads/a675712_My_sister39s_name_is_Molly.png",
      sentence: "My _____ name is Molly.",
      options: ["Sister", "Sister's", "Sisters"],
      answer: "Sister's",
      build: ["My", "sister", "'", "s", "name", "is", "Molly."],
    },
    {
      image: "https://cdn.imgurl.ir/uploads/d693036_This_is_my_parents39_house.png",
      sentence: "This is my ____ house.",
      options: ["parents", "parents's", "parents'"],
      answer: "parents'",
      build: ["This", "is", "my", "parents", "'", "house."],
    },
    {
      image: "https://cdn.imgurl.ir/uploads/u265346_He39s_Ann39s_brother.png",
      sentence: "He's _____ brother.",
      options: ["Ann", "Ann's", "Anns"],
      answer: "Ann's",
      build: ["He", "'", "s", "Ann", "'", "s", "brother."],
    },
  ];

  const MODES = [
    { id: "choose", title: "Choose the form", tip: "Look at the picture and pick the correct word." },
    { id: "build", title: "Build the sentence", tip: "Put the words in the correct order." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let modeIndex = 0;
  let order = [];
  let index = 0;
  let correct = 0;
  let answered = false;

  // Build mode state
  let bank = [];      // remaining tiles {text, id}
  let built = [];     // chosen tiles in order {text, id}
  let tileId = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correct = 0;
    answered = false;
    phase = "play";
    if (MODES[modeIndex].id === "build") setupBuild();
    render();
  }

  function setupBuild() {
    const item = ITEMS[order[index]];
    tileId = 0;
    bank = shuffle(item.build.map((t) => ({ text: t, id: tileId++ })));
    built = [];
    answered = false;
  }

  function pickOption(opt) {
    if (answered) return;
    answered = true;
    const item = ITEMS[order[index]];
    const isCorrect = opt === item.answer;
    if (isCorrect) correct += 1;

    app.querySelectorAll(".ps-opt").forEach((el) => {
      const v = el.textContent.trim();
      el.disabled = true;
      if (v === item.answer) el.classList.add("is-correct");
      if (v === opt && !isCorrect) el.classList.add("is-wrong");
    });

    const blank = app.querySelector(".ps-blank");
    if (blank) {
      blank.textContent = item.answer;
      blank.classList.add(isCorrect ? "is-filled-ok" : "is-filled-bad");
    }

    const fb = document.getElementById("ps-feedback");
    if (fb) {
      fb.textContent = isCorrect ? "Correct!" : 'Not quite — it\'s "' + item.answer + '".';
      fb.className = "ps-feedback " + (isCorrect ? "ok" : "bad");
    }

    advanceAfter(isCorrect ? 850 : 1350);
  }

  function advanceAfter(ms) {
    setTimeout(() => {
      if (index < order.length - 1) {
        index += 1;
        answered = false;
        if (MODES[modeIndex].id === "build") setupBuild();
        render();
      } else {
        phase = "done";
        render();
      }
    }, ms);
  }

  function addTile(id) {
    if (answered) return;
    const i = bank.findIndex((t) => t.id === id);
    if (i < 0) return;
    built.push(bank[i]);
    bank.splice(i, 1);
    render();
    // Auto-check when all tiles are placed
    if (bank.length === 0) {
      setTimeout(checkBuild, 280);
    }
  }

  function removeTile(id) {
    if (answered) return;
    const i = built.findIndex((t) => t.id === id);
    if (i < 0) return;
    bank.push(built[i]);
    built.splice(i, 1);
    render();
  }

  function checkBuild() {
    if (answered || built.length === 0) return;
    const item = ITEMS[order[index]];
    const user = built.map((t) => t.text).join(" ");
    const target = item.build.join(" ");
    const isCorrect = user === target;
    answered = true;
    if (isCorrect) correct += 1;

    const slot = document.getElementById("ps-build-slot");
    if (slot) slot.classList.add(isCorrect ? "is-correct" : "is-wrong");

    app.querySelectorAll(".ps-tile").forEach((el) => {
      el.disabled = true;
    });

    const fb = document.getElementById("ps-feedback");
    if (fb) {
      fb.textContent = isCorrect
        ? "Correct!"
        : "Not quite — " + item.build.join(" ");
      fb.className = "ps-feedback " + (isCorrect ? "ok" : "bad");
    }

    const checkBtn = document.getElementById("ps-check");
    if (checkBtn) checkBtn.style.display = "none";

    advanceAfter(isCorrect ? 1000 : 1700);
  }

  function calcStars() {
    const total = ITEMS.length;
    if (correct >= total) return 3;
    if (correct >= Math.ceil(total * 0.7)) return 2;
    if (correct >= Math.ceil(total * 0.4)) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID + "-" + MODES[modeIndex].id);
      LAStars.save(GAME_ID + "-" + MODES[modeIndex].id, stars);
    }
    return stars;
  }

  function renderSentence(text) {
    return text.replace(/_+/g, '<span class="ps-blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>');
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Possessive \'s</span>' +
        '<span class="ps-badge">4A</span></header>' +
        '<section class="ps-start">' +
        '<div class="ps-hero" aria-hidden="true">👤</div>' +
        "<h1>Possessive 's</h1>" +
        '<p class="ps-desc">Practice possessive forms with pictures.</p>' +
        '<div class="ps-mode-list">' +
        MODES.map(function (m, i) {
          return (
            '<button type="button" class="ps-mode-card" data-mode="' +
            i +
            '">' +
            '<span class="ps-mode-num">' +
            (i + 1) +
            "</span>" +
            "<div><strong>" +
            m.title +
            "</strong><p>" +
            m.tip +
            "</p></div></button>"
          );
        }).join("") +
        "</div></section>";
      app.querySelectorAll(".ps-mode-card").forEach(function (btn) {
        btn.onclick = function () {
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => startMode(typeof modeIndex !== 'undefined' ? modeIndex : 0),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Possessive \'s</span>' +
        '<span class="ps-badge">Done</span></header>' +
        '<section class="ps-done">' +
        '<div class="ps-stars" aria-hidden="true">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") +
        "</h1>" +
        '<p class="ps-desc">You got ' +
        correct +
        " of " +
        ITEMS.length +
        " correct.</p>" +
        '<button type="button" class="ps-btn" id="ps-again">Play again</button>' +
        '<button type="button" class="ps-btn secondary" id="ps-menu">Back to start</button></section>';
      document.getElementById("ps-again").onclick = function () {
        startMode(modeIndex);
      };
      document.getElementById("ps-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    const item = ITEMS[order[index]];
    const mode = MODES[modeIndex];

    if (mode.id === "choose") {
      const opts = shuffle(item.options.slice());
      const optHtml = opts
        .map(function (o, i) {
          return (
            '<button type="button" class="ps-opt" data-i="' +
            i +
            '">' +
            o +
            "</button>"
          );
        })
        .join("");

      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Possessive \'s</span>' +
        '<span class="ps-progress">' +
        (index + 1) +
        " / " +
        ITEMS.length +
        "</span></header>" +
        '<div class="ps-play">' +
        '<div class="ps-pic-wrap"><img class="ps-pic" src="' +
        item.image +
        '" alt="" draggable="false" /></div>' +
        '<p class="ps-sentence">' +
        renderSentence(item.sentence) +
        "</p>" +
        '<div class="ps-options">' +
        optHtml +
        "</div>" +
        '<p class="ps-feedback" id="ps-feedback"></p></div>';

      app.querySelectorAll(".ps-opt").forEach(function (el) {
        el.onclick = function () {
          pickOption(opts[+el.dataset.i]);
        };
      });
      return;
    }

    // Build mode
    const builtHtml = built
      .map(function (t) {
        return (
          '<button type="button" class="ps-tile ps-tile-built" data-id="' +
          t.id +
          '">' +
          t.text +
          "</button>"
        );
      })
      .join("");

    const bankHtml = bank
      .map(function (t) {
        return (
          '<button type="button" class="ps-tile" data-id="' +
          t.id +
          '">' +
          t.text +
          "</button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Build the sentence</span>' +
      '<span class="ps-progress">' +
      (index + 1) +
      " / " +
      ITEMS.length +
      "</span></header>" +
      '<div class="ps-play ps-play-build">' +
      '<div class="ps-pic-wrap"><img class="ps-pic" src="' +
      item.image +
      '" alt="" draggable="false" /></div>' +
      '<div class="ps-build-slot" id="ps-build-slot">' +
      (builtHtml || '<span class="ps-build-hint">Tap words below to build the sentence</span>') +
      "</div>" +
      '<div class="ps-bank">' +
      bankHtml +
      "</div>" +
      '<div class="ps-build-actions">' +
      '<button type="button" class="ps-btn" id="ps-check" ' +
      (built.length === 0 || answered ? "disabled" : "") +
      ">Check</button>" +
      "</div>" +
      '<p class="ps-feedback" id="ps-feedback"></p></div>';

    app.querySelectorAll(".ps-bank .ps-tile").forEach(function (el) {
      el.onclick = function () {
        addTile(+el.dataset.id);
      };
    });
    app.querySelectorAll(".ps-tile-built").forEach(function (el) {
      el.onclick = function () {
        removeTile(+el.dataset.id);
      };
    });
    const checkBtn = document.getElementById("ps-check");
    if (checkBtn) checkBtn.onclick = checkBuild;
  }

  render();
})();
