/* Who are the people? · Listen & write · AEF Starter Unit 4A */
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


  const GAME_ID = "starter-4a-who-are-the-people";
  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/p0482_AEF3e_Starter_SB_4_mp3cut_net2.mp3";
  const HERO_IMG = "https://cdn.imgurl.ir/uploads/n760923_ChatGPT_Image_Sep_17_2026_01_02_41_PM.png";

  // Part 1 – complete the sentences (item 1 is example)
  const PART1 = [
    {
      num: 1,
      prompt: "Paul is",
      answer: "Paul is Carly's brother.",
      example: true,
      filled: "Carly's brother.",
    },
    {
      num: 2,
      prompt: "Hayley is",
      answer: "Hayley is Paul's girlfriend.",
      accepted: ["paul's girlfriend", "pauls girlfriend", "paul's girlfriend.", "pauls girlfriend."],
    },
    {
      num: 3,
      prompt: "Shira is",
      answer: "Shira is Jerry's wife.",
      accepted: ["jerry's wife", "jerrys wife", "jerry's wife.", "jerrys wife."],
    },
    {
      num: 4,
      prompt: "Nicole is",
      answer: "Nicole is Carly's sister.",
      accepted: ["carly's sister", "carlys sister", "carly's sister.", "carlys sister."],
    },
    {
      num: 5,
      prompt: "John is",
      answer: "John is Nicole's boyfriend.",
      accepted: ["nicole's boyfriend", "nicoles boyfriend", "nicole's boyfriend.", "nicoles boyfriend."],
    },
  ];

  // Part 2 – answer the questions
  const PART2 = [
    {
      num: 1,
      question: "How old are Paul and Nicole?",
      answer: "Paul is 30. Nicole is 26.",
      accepted: [
        "paul is 30. nicole is 26",
        "paul is 30 nicole is 26",
        "paul is 30, nicole is 26",
        "paul is 30 and nicole is 26",
      ],
    },
    {
      num: 2,
      question: "Who are Mia and Buddy?",
      answer: "Mia is Jerry's daughter (and Shira's). Buddy is Carly's dog.",
      accepted: [
        "mia is jerry's daughter (and shira's). buddy is carly's dog",
        "mia is jerry's daughter and shira's. buddy is carly's dog",
        "mia is jerry's daughter. buddy is carly's dog",
        "mia is jerrys daughter (and shiras). buddy is carlys dog",
        "mia is jerry's daughter (and shira's) buddy is carly's dog",
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | part1 | part2 | done
  let part1Correct = 0;
  let part2Correct = 0;
  let checked1 = false;
  let checked2 = false;
  let audio = null;
  let playing = false;

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\.+$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isPart1Correct(user, item) {
    if (item.example) return true;
    const n = normalize(user);
    // accept just the completion or the full sentence
    if (item.accepted && item.accepted.some(function (a) { return n === normalize(a); })) return true;
    if (normalize(item.prompt + " " + user) === normalize(item.answer)) return true;
    if (n === normalize(item.answer)) return true;
    return false;
  }

  function isPart2Correct(user, item) {
    const n = normalize(user);
    if (n === normalize(item.answer)) return true;
    if (item.accepted && item.accepted.some(function (a) { return n === a; })) return true;
    return false;
  }

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_URL);
      audio.preload = "auto";
      audio.addEventListener("ended", function () {
        playing = false;
        var btn = document.getElementById("wp-play");
        if (btn) btn.classList.remove("playing");
      });
      audio.addEventListener("error", function () {
        playing = false;
        var btn = document.getElementById("wp-play");
        if (btn) btn.classList.remove("playing");
      });
    }
    return audio;
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }
    playing = false;
    var btn = document.getElementById("wp-play");
    if (btn) btn.classList.remove("playing");
  }

  function togglePlay() {
    var a = ensureAudio();
    var btn = document.getElementById("wp-play");
    if (playing) {
      a.pause();
      playing = false;
      if (btn) btn.classList.remove("playing");
      return;
    }
    a.play()
      .then(function () {
        playing = true;
        if (btn) btn.classList.add("playing");
      })
      .catch(function () {
        playing = false;
        if (btn) btn.classList.remove("playing");
      });
  }

  function start() {
    if (window.LAFinish) LAFinish.startTimer();
    phase = "part1";
    part1Correct = 0;
    part2Correct = 0;
    checked1 = false;
    checked2 = false;
    stopAudio();
    render();
  }

  function checkPart1() {
    if (checked1) return;
    checked1 = true;
    part1Correct = 0;
    var scorable = 0;

    PART1.forEach(function (item, i) {
      if (item.example) return;
      scorable += 1;
      var input = document.getElementById("wp-input-" + i);
      if (!input) return;
      var ok = isPart1Correct(input.value, item);
      if (ok) part1Correct += 1;

      input.disabled = true;
      input.classList.remove("is-correct", "is-wrong");
      input.classList.add(ok ? "is-correct" : "is-wrong");

      var tick = document.getElementById("wp-tick-" + i);
      if (tick) {
        tick.textContent = ok ? "✓" : "";
        tick.className = "wp-tick " + (ok ? "ok" : "bad");
      }

      var fb = document.getElementById("wp-fb-" + i);
      if (fb) {
        fb.textContent = ok ? "" : item.answer;
        fb.className = "wp-line-fb " + (ok ? "ok" : "bad");
      }
    });

    var checkBtn = document.getElementById("wp-check");
    if (checkBtn) checkBtn.style.display = "none";

    var result = document.getElementById("wp-result");
    if (result) {
      result.textContent = "You got " + part1Correct + " of " + scorable + " correct.";
      result.className = "wp-result " + (part1Correct === scorable ? "ok" : "bad");
    }

    setTimeout(function () {
      var cont = document.getElementById("wp-continue");
      if (cont) cont.style.display = "inline-flex";
    }, 350);
  }

  function goToPart2() {
    phase = "part2";
    checked2 = false;
    stopAudio();
    render();
  }

  function checkPart2() {
    if (checked2) return;
    checked2 = true;
    part2Correct = 0;

    PART2.forEach(function (item, i) {
      var input = document.getElementById("wp2-input-" + i);
      if (!input) return;
      var ok = isPart2Correct(input.value, item);
      if (ok) part2Correct += 1;

      input.disabled = true;
      input.classList.remove("is-correct", "is-wrong");
      input.classList.add(ok ? "is-correct" : "is-wrong");

      var tick = document.getElementById("wp2-tick-" + i);
      if (tick) {
        tick.textContent = ok ? "✓" : "";
        tick.className = "wp-tick " + (ok ? "ok" : "bad");
      }

      var fb = document.getElementById("wp2-fb-" + i);
      if (fb) {
        fb.textContent = ok ? "" : item.answer;
        fb.className = "wp-line-fb " + (ok ? "ok" : "bad");
      }
    });

    var checkBtn = document.getElementById("wp-check");
    if (checkBtn) checkBtn.style.display = "none";

    var result = document.getElementById("wp-result");
    if (result) {
      result.textContent = "You got " + part2Correct + " of " + PART2.length + " correct.";
      result.className = "wp-result " + (part2Correct === PART2.length ? "ok" : "bad");
    }

    setTimeout(function () {
      var cont = document.getElementById("wp-continue");
      if (cont) cont.style.display = "inline-flex";
    }, 350);
  }

  function finish() {
    stopAudio();
    phase = "done";
    render();
  }

  function calcStars() {
    var total = 4 + PART2.length; // 4 scorable in part1 + 2 in part2
    var got = part1Correct + part2Correct;
    if (got >= total) return 3;
    if (got >= Math.ceil(total * 0.7)) return 2;
    if (got >= Math.ceil(total * 0.4)) return 1;
    return 0;
  }

  function saveStars() {
    var stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function playerBar(label) {
    return (
      '<div class="wp-player">' +
      '<button type="button" class="wp-play-btn" id="wp-play" aria-label="Play audio">' +
      '<svg class="wp-icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg class="wp-icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>' +
      '<div class="wp-eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="wp-player-meta"><strong>' + label + '</strong><span>Tap play, then complete the sentences</span></div>' +
      "</div>"
    );
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="wp-topbar">' +
        '<a class="wp-back" href="../" aria-label="Back">←</a>' +
        '<span class="wp-title">Who are the people?</span>' +
        '<span class="wp-badge">4A</span></header>' +
        '<section class="wp-start">' +
        '<div class="wp-hero-img"><img src="' + HERO_IMG + '" alt="Two friends with a birthday card" draggable="false" /></div>' +
        '<h1>Who are the people?</h1>' +
        '<p class="wp-desc">Listen and write the sentences. Use the names and \'s.</p>' +
        '<button type="button" class="wp-btn" id="wp-start">Start</button>' +
        "</section>";
      document.getElementById("wp-start").onclick = start;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: 10,
          timeMs: timeMs,
          onAgain: () => start(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      var stars = saveStars();
      var total = 4 + PART2.length;
      var got = part1Correct + part2Correct;
      app.innerHTML =
        '<header class="wp-topbar">' +
        '<a class="wp-back" href="../" aria-label="Back">←</a>' +
        '<span class="wp-title">Who are the people?</span>' +
        '<span class="wp-badge">Done</span></header>' +
        '<section class="wp-done">' +
        '<div class="wp-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) + "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="wp-desc">You got ' + got + " of " + total + " correct.</p>" +
        '<button type="button" class="wp-btn" id="wp-again">Play again</button>' +
        '<button type="button" class="wp-btn secondary" id="wp-menu">Back to start</button></section>';
      document.getElementById("wp-again").onclick = start;
      document.getElementById("wp-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    // ── PART 1 ──
    if (phase === "part1") {
      var lines = PART1.map(function (item, i) {
        if (item.example) {
          return (
            '<div class="wp-line is-example">' +
            '<span class="wp-num">' + item.num + "</span>" +
            '<span class="wp-prompt">' + item.prompt + "</span>" +
            '<span class="wp-example-text">' + item.filled + "</span>" +
            '<span class="wp-tick"></span>' +
            "</div>"
          );
        }
        return (
          '<div class="wp-line" data-i="' + i + '">' +
          '<span class="wp-num">' + item.num + "</span>" +
          '<span class="wp-prompt">' + item.prompt + "</span>" +
          '<div class="wp-input-wrap">' +
          '<input type="text" class="wp-input" id="wp-input-' + i + '" placeholder="…\'s …" autocomplete="off" spellcheck="false" />' +
          '<span class="wp-line-fb" id="wp-fb-' + i + '"></span>' +
          "</div>" +
          '<span class="wp-tick" id="wp-tick-' + i + '"></span>' +
          "</div>"
        );
      }).join("");

      app.innerHTML =
        '<header class="wp-topbar">' +
        '<a class="wp-back" href="../" aria-label="Back">←</a>' +
        '<span class="wp-title">Who are the people?</span>' +
        '<span class="wp-progress">1 / 2</span></header>' +
        '<div class="wp-play">' +
        '<div class="wp-pic-wrap"><img class="wp-pic" src="' + HERO_IMG + '" alt="Two friends with a birthday card" draggable="false" /></div>' +
        '<h2 class="wp-heading">Who are the people?</h2>' +
        playerBar("Listen and write") +
        '<div class="wp-write-list">' + lines + "</div>" +
        '<p class="wp-result" id="wp-result"></p>' +
        '<div class="wp-actions">' +
        '<button type="button" class="wp-btn" id="wp-check">Check answers</button>' +
        '<button type="button" class="wp-btn secondary" id="wp-continue" style="display:none">Next →</button>' +
        "</div></div>";

      document.getElementById("wp-play").onclick = togglePlay;
      document.getElementById("wp-check").onclick = checkPart1;
      document.getElementById("wp-continue").onclick = goToPart2;

      app.querySelectorAll(".wp-input").forEach(function (input) {
        input.addEventListener("focus", function () {
          setTimeout(function () {
            input.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 280);
        });
      });
      return;
    }

    // ── PART 2 ──
    if (phase === "part2") {
      var qlines = PART2.map(function (item, i) {
        return (
          '<div class="wp-q-block" data-i="' + i + '">' +
          '<p class="wp-q-text"><span class="wp-num">' + item.num + "</span> " + item.question + "</p>" +
          '<div class="wp-q-row">' +
          '<input type="text" class="wp-input wp-input-full" id="wp2-input-' + i + '" placeholder="Write your answer…" autocomplete="off" spellcheck="false" />' +
          '<span class="wp-tick" id="wp2-tick-' + i + '"></span>' +
          "</div>" +
          '<span class="wp-line-fb" id="wp2-fb-' + i + '"></span>' +
          "</div>"
        );
      }).join("");

      app.innerHTML =
        '<header class="wp-topbar">' +
        '<a class="wp-back" href="../" aria-label="Back">←</a>' +
        '<span class="wp-title">Who are the people?</span>' +
        '<span class="wp-progress">2 / 2</span></header>' +
        '<div class="wp-play">' +
        '<div class="wp-pic-wrap"><img class="wp-pic" src="' + HERO_IMG + '" alt="Two friends with a birthday card" draggable="false" /></div>' +
        '<h2 class="wp-heading">Listen again</h2>' +
        '<p class="wp-sub">Answer the questions.</p>' +
        playerBar("Listen again") +
        '<div class="wp-write-list">' + qlines + "</div>" +
        '<p class="wp-result" id="wp-result"></p>' +
        '<div class="wp-actions">' +
        '<button type="button" class="wp-btn" id="wp-check">Check answers</button>' +
        '<button type="button" class="wp-btn secondary" id="wp-continue" style="display:none">Continue</button>' +
        "</div></div>";

      document.getElementById("wp-play").onclick = togglePlay;
      document.getElementById("wp-check").onclick = checkPart2;
      document.getElementById("wp-continue").onclick = finish;

      app.querySelectorAll(".wp-input").forEach(function (input) {
        input.addEventListener("focus", function () {
          setTimeout(function () {
            input.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 280);
        });
      });
    }
  }

  render();
})();
