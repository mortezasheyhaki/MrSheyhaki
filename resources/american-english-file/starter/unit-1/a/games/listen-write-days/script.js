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
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong;
})();

/* Listen & Write – days of the week · Unscramble then Write */
(function () {
  const GAME_ID = "starter-1a-listen-write-days";
  const DAYS = [
    { id: "monday", label: "Monday", file: "audio/Monday.mp3" },
    { id: "tuesday", label: "Tuesday", file: "audio/Tuesday.mp3" },
    { id: "wednesday", label: "Wednesday", file: "audio/Wednesday.mp3" },
    { id: "thursday", label: "Thursday", file: "audio/Thursday.mp3" },
    { id: "friday", label: "Friday", file: "audio/Friday.mp3" },
    { id: "saturday", label: "Saturday", file: "audio/Saturday.mp3" },
    { id: "sunday", label: "Sunday", file: "audio/Sunday.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  // mode: start | unscramble | write | result
  let mode = "start";
  let target = null;
  let scoreUnscramble = 0;
  let scoreWrite = 0;
  let skippedCount = 0;
  let round = 0;
  const TOTAL = 7;
  let used = [];
  let audio = null;
  let audioToken = 0;
  let playing = false;
  let locked = false;
  let nextTimer = null;

  // Unscramble state
  let poolLetters = []; // {ch, id} available to pick
  let poolOrder = []; // fixed order for stable layout
  let builtLetters = []; // {ch, id} in answer slots

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function scrambleWord(word) {
    // Keep capital first letter in the set; scramble until different from original
    let letters = word.split("");
    let scrambled = shuffle(letters);
    let guard = 0;
    while (scrambled.join("") === word && guard < 20) {
      scrambled = shuffle(letters);
      guard++;
    }
    return scrambled.map(function (ch, i) {
      return { ch: ch, id: i + "-" + ch };
    });
  }

  function strip(s) {
    return String(s || "").trim().replace(/\s+/g, "");
  }

  function isCapitalizedDay(s) {
    const t = strip(s);
    if (!t) return false;
    return /^[A-Z][a-zA-Z]*$/.test(t);
  }

  function matchesDay(s, day) {
    const t = strip(s);
    if (t === day.label) return true;
    if (!isCapitalizedDay(t)) return false;
    return t.toLowerCase() === day.id;
  }

  function pickDay() {
    const pool = DAYS.filter(function (d) {
      return !used.includes(d.id);
    });
    if (!pool.length) {
      used = [];
      return DAYS[Math.floor(Math.random() * DAYS.length)];
    }
    const d = pool[Math.floor(Math.random() * pool.length)];
    used.push(d.id);
    return d;
  }

  function clearNextTimer() {
    if (nextTimer) {
      clearTimeout(nextTimer);
      nextTimer = null;
    }
  }

  function stopAudio() {
    audioToken += 1;
    playing = false;
    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.muted = true;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      } catch (e) {}
      audio = null;
    }
    setPlayUI(false);
  }

  function playTarget() {
    if (!target) return;
    stopAudio();
    const token = audioToken;
    const a = new Audio(target.file);
    audio = a;
    a.muted = false;
    a.volume = 1;
    a.preload = "auto";
    a.addEventListener("ended", function () {
      if (token !== audioToken) return;
      playing = false;
      setPlayUI(false);
    });
    a.addEventListener("error", function () {
      if (token !== audioToken) return;
      playing = false;
      setPlayUI(false);
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.textContent = "Audio could not load.";
        fb.className = "lw-fb bad";
      }
    });
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(function () {
        if (token !== audioToken || audio !== a) {
          try {
            a.muted = true;
            a.pause();
          } catch (e) {}
          return;
        }
        playing = true;
        setPlayUI(true);
      }).catch(function () {
        if (token !== audioToken) return;
        const fb = document.getElementById("lw-fb");
        if (fb) {
          fb.textContent = "Tap Play (browser may block autoplay).";
          fb.className = "lw-fb bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function setPlayUI(on) {
    const btn = document.getElementById("lw-play");
    const player = document.getElementById("lw-player");
    const label = player ? player.querySelector(".lw-play-label") : null;
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML = '<span class="lw-play-ico" aria-hidden="true">⏸</span>';
      btn.setAttribute("aria-label", "Pause");
      if (label) label.textContent = "Pause";
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML = '<span class="lw-play-ico" aria-hidden="true">▶</span>';
      btn.setAttribute("aria-label", "Play audio");
      if (label) label.textContent = "Play audio";
    }
  }

  function togglePlay() {
    if (playing && audio) {
      stopAudio();
      return;
    }
    playTarget();
  }

  function startUnscrambleRound() {
    mode = "unscramble";
    locked = false;
    round += 1;
    target = pickDay();
    poolLetters = scrambleWord(target.label);
    poolOrder = poolLetters.slice();
    builtLetters = [];
    stopAudio();
    render();
    setTimeout(function () {
      if (mode === "unscramble" && !locked) playTarget();
    }, 350);
  }

  function startWriteRound() {
    mode = "write";
    locked = false;
    round += 1;
    target = pickDay();
    stopAudio();
    render();
    setTimeout(function () {
      if (mode === "write" && !locked) playTarget();
    }, 350);
  }

  function beginPart1() {
    if (window.LAFinish) LAFinish.startTimer();
    scoreUnscramble = 0;
    scoreWrite = 0;
    skippedCount = 0;
    round = 0;
    used = [];
    startUnscrambleRound();
  }

  function beginPart2() {
    round = 0;
    used = [];
    startWriteRound();
  }

  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
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
    o.connect(g); g.connect(ctx.destination);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function sfxTap() {
    try { if (window.LASfx && LASfx.click) LASfx.click(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    tone(640, ctx.currentTime, 0.05, "sine", 0.07);
  }
  function sfxOk() {
    try { if (window.LASfx && LASfx.correct) LASfx.correct(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.1, "triangle", 0.13);
    tone(659.25, t + 0.08, 0.11, "triangle", 0.13);
    tone(783.99, t + 0.16, 0.14, "sine", 0.12);
    tone(1046.5, t + 0.28, 0.2, "sine", 0.1);
  }
  function sfxBad() {
    try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else sfxWrong(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    tone(220, t, 0.14, "sawtooth", 0.07);
    tone(180, t + 0.08, 0.16, "triangle", 0.06);
  }

  // ── Unscramble interactions ──
  function pickLetter(id) {
    if (locked) return;
    const idx = poolLetters.findIndex(function (l) {
      return l.id === id;
    });
    if (idx < 0) return;
    sfxTap();
    const letter = poolLetters.splice(idx, 1)[0];
    builtLetters.push(letter);
    updateUnscrambleUI();
    // Auto-check when all letters placed
    if (poolLetters.length === 0) {
      checkUnscramble();
    }
  }

  function unpickLetter(id) {
    if (locked) return;
    const idx = builtLetters.findIndex(function (l) {
      return l.id === id;
    });
    if (idx < 0) return;
    sfxTap();
    const letter = builtLetters.splice(idx, 1)[0];
    poolLetters.push(letter);
    updateUnscrambleUI();
  }

  function updateUnscrambleUI() {
    const builtEl = document.getElementById("lw-built");
    const poolEl = document.getElementById("lw-pool");
    if (!builtEl || !poolEl) return;

    var builtHtml = builtLetters
      .map(function (l) {
        return (
          '<button type="button" class="lw-tile lw-tile-built" data-id="' +
          l.id +
          '">' +
          l.ch +
          "</button>"
        );
      })
      .join("");
    var empty = target.label.length - builtLetters.length;
    for (var ei = 0; ei < empty; ei++) {
      builtHtml += '<span class="lw-slot"></span>';
    }
    builtEl.innerHTML = builtHtml;

    var available = {};
    poolLetters.forEach(function (l) {
      available[l.id] = true;
    });
    var order = poolOrder.length ? poolOrder : poolLetters;
    poolEl.innerHTML = order
      .map(function (l) {
        var used = !available[l.id];
        return (
          '<button type="button" class="lw-tile lw-tile-pool' +
          (used ? " is-used" : "") +
          '" data-id="' +
          l.id +
          '"' +
          (used ? " disabled" : "") +
          ">" +
          l.ch +
          "</button>"
        );
      })
      .join("");

    builtEl.querySelectorAll(".lw-tile-built").forEach(function (btn) {
      btn.onclick = function () {
        unpickLetter(btn.getAttribute("data-id"));
      };
    });
    poolEl.querySelectorAll(".lw-tile-pool:not(.is-used)").forEach(function (btn) {
      btn.onclick = function () {
        pickLetter(btn.getAttribute("data-id"));
      };
    });
  }


  function clearUnscramble() {
    if (locked) return;
    if (!builtLetters.length) return;
    sfxTap();
    poolLetters = poolLetters.concat(builtLetters);
    builtLetters = [];
    updateUnscrambleUI();
    var fb = document.getElementById("lw-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "lw-fb";
    }
  }

  function skipRound() {
    if (locked) return;
    locked = true;
    stopAudio();
    clearNextTimer();
    skippedCount += 1;
    var fb = document.getElementById("lw-fb");
    if (fb) {
      fb.textContent = "Skipped";
      fb.className = "lw-fb";
    }
    nextTimer = setTimeout(function () {
      nextTimer = null;
      locked = false;
      if (mode === "unscramble") {
        if (round >= TOTAL) {
          mode = "bridge";
          render();
        } else {
          startUnscrambleRound();
        }
      } else if (mode === "write") {
        if (round >= TOTAL) {
          mode = "result";
          render();
        } else {
          startWriteRound();
        }
      }
    }, 350);
  }

  function checkUnscramble() {
    if (locked) return;
    const built = builtLetters
      .map(function (l) {
        return l.ch;
      })
      .join("");
    const ok = built === target.label;

    if (!ok) {
      sfxBad();
      document.querySelectorAll(".lw-tile-built").forEach(function (el) {
        el.classList.add("bad");
      });
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.textContent = "Try again";
        fb.className = "lw-fb bad";
        try{sfxWrong();}catch(e){}
      }
      setTimeout(function () {
        poolLetters = poolLetters.concat(builtLetters);
        builtLetters = [];
        updateUnscrambleUI();
        if (fb) {
          fb.textContent = "";
          fb.className = "lw-fb";
        }
      }, 450);
      return;
    }

    locked = true;
    stopAudio();
    sfxOk();
    scoreUnscramble += 1;
    const fb = document.getElementById("lw-fb");
    if (fb) {
      fb.innerHTML = "✓ Correct! <strong>" + target.label + "</strong>";
      fb.className = "lw-fb ok";
      try{sfxCorrect();}catch(e){}
    }
    document.querySelectorAll(".lw-tile-built").forEach(function (el) {
      el.classList.add("ok");
    });

    clearNextTimer();
    nextTimer = setTimeout(function () {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "bridge";
        render();
      } else {
        startUnscrambleRound();
      }
    }, 900);
  }

  function checkWrite() {
    if (locked) return;
    const input = document.getElementById("lw-input");
    if (!input) return;
    const val = input.value;

    if (!strip(val)) {
      input.focus();
      return;
    }

    if (!isCapitalizedDay(val) && strip(val).toLowerCase() === target.id) {
      sfxBad();
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML = 'Start with a <strong>capital letter</strong> (e.g. Monday)';
        fb.className = "lw-fb bad";
      }
      input.focus();
      try {
        input.select();
      } catch (e) {}
      return;
    }

    const correct = matchesDay(val, target);

    if (!correct) {
      sfxBad();
      input.classList.remove("ok");
      input.classList.add("bad");
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.textContent = "Try again — listen and write the day.";
        fb.className = "lw-fb bad";
        try{sfxWrong();}catch(e){}
      }
      input.focus();
      try {
        input.select();
      } catch (e) {}
      return;
    }

    locked = true;
    stopAudio();
    sfxOk();
    scoreWrite += 1;

    input.disabled = true;
    input.classList.remove("bad");
    input.classList.add("ok");
    input.value = target.label;

    const fb = document.getElementById("lw-fb");
    if (fb) {
      fb.innerHTML = "✓ Correct! <strong>" + target.label + "</strong>";
      fb.className = "lw-fb ok";
      try{sfxCorrect();}catch(e){}
    }

    const checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;

    clearNextTimer();
    nextTimer = setTimeout(function () {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "result";
        render();
      } else {
        startWriteRound();
      }
    }, 900);
  }

  function totalScore() {
    return scoreUnscramble + scoreWrite;
  }

  function maxScore() {
    return TOTAL * 2;
  }

  function render() {
    if (mode === "start") {
      stopAudio();
      clearNextTimer();
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Days of the week</span>' +
        '<span class="lw-badge">1A</span></header>' +
        '<section class="lw-start">' +
        '<div class="lw-hero" aria-hidden="true">📅</div>' +
        '<p class="lw-eyebrow">Listening · Spelling</p>' +
        "<h1>Listen &amp; Write</h1>" +
        '<p class="lw-sub">7 days · two parts · listen carefully</p>' +
        '<div class="lw-modes">' +
        '<button type="button" class="lw-mode-btn" id="lw-go">' +
        '<span class="lw-mode-ico" aria-hidden="true">🔤</span>' +
        "<div><h3>Part 1 · Unscramble</h3><p>Listen, then tap the letters in order</p></div>" +
        "</button>" +
        '<button type="button" class="lw-mode-btn" id="lw-go-write">' +
        '<span class="lw-mode-ico" aria-hidden="true">✍️</span>' +
        "<div><h3>Part 2 · Write</h3><p>Listen again and type the day</p></div>" +
        "</button>" +
        "</div>" +
        "</section>";
      document.getElementById("lw-go").onclick = beginPart1;
      document.getElementById("lw-go-write").onclick = function () {
        if (window.LAFinish) LAFinish.startTimer();
        scoreUnscramble = 0;
        scoreWrite = 0;
        beginPart2();
      };
      return;
    }

    if (mode === "bridge") {
      stopAudio();
      clearNextTimer();
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Part 1 done</span>' +
        '<span class="lw-badge">' + scoreUnscramble + "/" + TOTAL + "</span></header>" +
        '<section class="lw-start">' +
        '<div class="lw-hero" aria-hidden="true">✨</div>' +
        "<h1>Nice work!</h1>" +
        '<p class="lw-sub">You unscrambled <strong>' + scoreUnscramble + "</strong> of " + TOTAL + " days.</p>" +
        '<p class="lw-sub">Now listen again and <strong>write</strong> each day.</p>' +
        '<button type="button" class="lw-btn" id="lw-part2">Part 2 · Write →</button>' +
        "</section>";
      document.getElementById("lw-part2").onclick = beginPart2;
      return;
    }

    if (mode === "result") {
      stopAudio();
      clearNextTimer();
      const got = totalScore();
      const max = maxScore();
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: got,
          total: max,
          timeMs: timeMs,
          onAgain: function () {
            if (window.LAFinish) LAFinish.startTimer();
            beginPart1();
          },
          onModes: function () {
            mode = "start";
            render();
          },
          backHref: "../",
        });
        return;
      }
      // No stars if they skipped everything (score 0)
      var stars = 0;
      if (got > 0) {
        stars = got >= 12 ? 3 : got >= 8 ? 2 : got >= 4 ? 1 : 0;
      }
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        if (got > 0) {
          LAStars.save(GAME_ID, stars);
        } else {
          // record play only — do not award stars for skip-all
          try {
            if (LAStars.saveFromAccuracy) LAStars.saveFromAccuracy(GAME_ID, 0);
          } catch (e) {}
        }
      }
      app.innerHTML =
        '<header class="lw-topbar"><a class="lw-back" href="../">←</a><span class="lw-title">Results</span></header>' +
        '<section class="lw-done"><div class="lw-done-inner"><h1>Done!</h1>' +
        "<p>" + got + "/" + max + "</p>" +
        '<button type="button" class="lw-btn" id="lw-again">Play again</button></div></section>';
      document.getElementById("lw-again").onclick = function () {
        mode = "start";
        render();
      };
      return;
    }

    // Shared player + header for unscramble / write
    const partLabel = mode === "unscramble" ? "Unscramble" : "Write";
    const partNum = mode === "unscramble" ? "1" : "2";
    const pct = Math.round(((round - 1) / TOTAL) * 100);

    let body = "";
    if (mode === "unscramble") {
      body =
        '<p class="lw-phase">Part ' + partNum + " · " + partLabel + "</p>" +
        '<div class="lw-player" id="lw-player">' +
        '<button type="button" class="lw-play-btn" id="lw-play" aria-label="Play audio">' +
        '<span class="lw-play-ico" aria-hidden="true">▶</span></button>' +
        '<span class="lw-play-label">Play audio</span>' +
        '<div class="lw-wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
        "</div>" +
        '<p class="lw-instruction">Listen, then tap the letters in order.</p>' +
        '<div class="lw-prompt-card">' +
        '<div class="lw-built" id="lw-built"></div>' +
        "</div>" +
        '<div class="lw-pool" id="lw-pool"></div>' +
        '<div class="lw-actions">' +
        '<button type="button" class="lw-btn secondary" id="lw-clear">Clear</button>' +
        '<button type="button" class="lw-btn secondary" id="lw-skip">Skip</button>' +
        "</div>" +
        '<div class="lw-fb" id="lw-fb" aria-live="polite"></div>';
    } else {
      body =
        '<p class="lw-phase">Part ' + partNum + " · " + partLabel + "</p>" +
        '<div class="lw-player" id="lw-player">' +
        '<button type="button" class="lw-play-btn" id="lw-play" aria-label="Play audio">' +
        '<span class="lw-play-ico" aria-hidden="true">▶</span></button>' +
        '<span class="lw-play-label">Play audio</span>' +
        '<div class="lw-wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
        "</div>" +
        '<p class="lw-instruction">Listen again, then write the day (capital first).</p>' +
        '<div class="lw-write-card">' +
        '<label class="lw-label" for="lw-input">Day</label>' +
        '<input type="text" id="lw-input" class="lw-input" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Monday" maxlength="20" />' +
        '<button type="button" class="lw-btn lw-check" id="lw-check">Check ✓</button>' +
        "</div>" +
        '<div class="lw-actions">' +
        '<button type="button" class="lw-btn secondary" id="lw-clear-write">Clear</button>' +
        '<button type="button" class="lw-btn secondary" id="lw-skip">Skip</button>' +
        "</div>" +
        '<div class="lw-fb" id="lw-fb" aria-live="polite"></div>';
    }

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<div class="lw-progress"><span style="width:' + Math.max(0, pct) + '%"></span></div>' +
      '<span class="lw-badge">' + round + " / " + TOTAL + "</span></header>" +
      '<div class="lw-play">' + body + "</div>";

    document.getElementById("lw-play").onclick = togglePlay;

    var skipBtn = document.getElementById("lw-skip");
    if (skipBtn) skipBtn.onclick = skipRound;

    if (mode === "unscramble") {
      updateUnscrambleUI();
      var clearBtn = document.getElementById("lw-clear");
      if (clearBtn) clearBtn.onclick = clearUnscramble;
    } else {
      document.getElementById("lw-check").onclick = checkWrite;
      var clearWrite = document.getElementById("lw-clear-write");
      if (clearWrite) {
        clearWrite.onclick = function () {
          if (locked) return;
          var input = document.getElementById("lw-input");
          if (!input) return;
          sfxTap();
          input.value = "";
          input.classList.remove("ok", "bad");
          input.focus();
          var fb = document.getElementById("lw-fb");
          if (fb) {
            fb.textContent = "";
            fb.className = "lw-fb";
          }
        };
      }
      const input = document.getElementById("lw-input");
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          checkWrite();
        }
      });
      setTimeout(function () {
        try {
          input.focus();
        } catch (e) {}
      }, 200);
    }
  }

  render();
})();
