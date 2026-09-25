/* Possessive Sentences 2 · choose the correct possessive · AEF Starter Unit 4A */
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


  const GAME_ID = "starter-4a-possessive-sentences-2";

  const ITEMS = [
    {
      sentence: "They're from Vietnam. ___ names are Bihn and Vu.",
      answer: "Their",
    },
    {
      sentence: "A: What's ___ name?\nB: I'm Julia. Nice to meet you.",
      answer: "your",
    },
    {
      sentence: "He's Chilean. ___ name is Roberto.",
      answer: "His",
    },
    {
      sentence: "It's a good hotel, and ___ restaurant is fantastic.",
      answer: "its",
    },
    {
      sentence: "They're Mexican. ___ last name is Romero.",
      answer: "Their",
    },
    {
      sentence: "I know a very good restaurant in Paris. ___ name is Café des Fleurs.",
      answer: "Its",
    },
    {
      sentence: "___ name is Tina. She's Brazilian.",
      answer: "Her",
    },
    {
      sentence: "Lisa and Amy are American, but ___ husbands are British.",
      answer: "their",
    },
    {
      sentence: "A: We're Jane and Mark Kelley. We have a reservation.\nB: You're in room 22. This is ___ key.",
      answer: "your",
    },
    {
      sentence: "Here are ___ coffees. The cappuccino is for you, the latte is for Tom, and the Americano is for me.",
      answer: "our",
    },
    {
      sentence: "I'm Azra, and this is ___ husband, Ahmet.",
      answer: "my",
    },
    {
      sentence: "A: Are those your children?\nB: No, they aren't. ___ children are over there.",
      answer: "Our",
    },
  ];

  // Options shown to the student (capitalized for consistency)
  const ALL_OPTIONS = ["My", "Your", "His", "Her", "Its", "Our", "Their"];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correct = 0;
  let answered = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function norm(s) {
    return (s || "").toLowerCase();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correct = 0;
    answered = false;
    phase = "play";
    render();
  }

  function pickOption(opt) {
    if (answered) return;
    answered = true;
    const item = ITEMS[order[index]];
    const isCorrect = norm(opt) === norm(item.answer);
    if (isCorrect) correct += 1;

    app.querySelectorAll(".ps-opt").forEach((el) => {
      const v = el.dataset.opt;
      el.disabled = true;
      if (norm(v) === norm(item.answer)) el.classList.add("is-correct");
      if (norm(v) === norm(opt) && !isCorrect) el.classList.add("is-wrong");
    });

    // Fill the blank with the correct possessive
    const displayAns = item.answer.charAt(0).toUpperCase() + item.answer.slice(1);
    const blank = app.querySelector(".ps-blank");
    if (blank) {
      blank.textContent = displayAns;
      blank.classList.add(isCorrect ? "is-filled-ok" : "is-filled-bad");
    }

    const fb = document.getElementById("ps-feedback");
    if (fb) {
      fb.textContent = isCorrect
        ? "Correct!"
        : 'Not quite — it\'s "' + displayAns + '".';
      fb.className = "ps-feedback " + (isCorrect ? "ok" : "bad");
    }

    setTimeout(() => {
      if (index < order.length - 1) {
        index += 1;
        answered = false;
        render();
      } else {
        phase = "done";
        render();
      }
    }, isCorrect ? 900 : 1400);
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
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function renderSentence(text) {
    return text
      .replace(/\n/g, "<br>")
      .replace("___", '<span class="ps-blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>');
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Possessive Sentences 2</span>' +
        '<span class="ps-badge">4A</span></header>' +
        '<section class="ps-start">' +
        '<div class="ps-hero" aria-hidden="true">📝</div>' +
        "<h1>Possessive Sentences 2</h1>" +
        '<p class="ps-desc">Read each sentence and choose the correct possessive.<br>12 sentences</p>' +
        '<button type="button" class="ps-btn" id="ps-start">Start</button></section>';
      document.getElementById("ps-start").onclick = startGame;
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
          onAgain: () => startGame(),
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
        '<span class="ps-title">Possessive Sentences 2</span>' +
        '<span class="ps-badge">Done</span></header>' +
        '<section class="ps-done">' +
        '<div class="ps-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="ps-desc">You got ' + correct + " of " + ITEMS.length + " correct.</p>" +
        '<button type="button" class="ps-btn" id="ps-again">Play again</button>' +
        '<button type="button" class="ps-btn secondary" id="ps-menu">Back to start</button></section>';
      document.getElementById("ps-again").onclick = startGame;
      document.getElementById("ps-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    const item = ITEMS[order[index]];
    const opts = shuffle(ALL_OPTIONS);

    const optHtml = opts
      .map(function (o) {
        return (
          '<button type="button" class="ps-opt" data-opt="' +
          o +
          '">' +
          o +
          "</button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Possessive Sentences 2</span>' +
      '<span class="ps-progress">' +
      (index + 1) +
      " / " +
      ITEMS.length +
      "</span></header>" +
      '<div class="ps-play">' +
      '<p class="ps-sentence">' +
      renderSentence(item.sentence) +
      "</p>" +
      '<div class="ps-options">' +
      optHtml +
      "</div>" +
      '<p class="ps-feedback" id="ps-feedback"></p>' +
      "</div>";

    app.querySelectorAll(".ps-opt").forEach(function (el) {
      el.onclick = function () {
        pickOption(el.dataset.opt);
      };
    });
  }

  render();
})();
