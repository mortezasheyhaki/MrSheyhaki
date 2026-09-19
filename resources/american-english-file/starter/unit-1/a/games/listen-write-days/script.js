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
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML =
        '<span class="lw-play-ico" aria-hidden="true">⏸</span><span class="lw-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML =
        '<span class="lw-play-ico" aria-hidden="true">▶</span><span class="lw-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
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
    round = 0;
    used = [];
    startUnscrambleRound();
  }

  function beginPart2() {
    round = 0;
    used = [];
    startWriteRound();
  }

  // ── Unscramble interactions ──
  function pickLetter(id) {
    if (locked) return;
    const idx = poolLetters.findIndex(function (l) {
      return l.id === id;
    });
    if (idx < 0) return;
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
    const letter = builtLetters.splice(idx, 1)[0];
    poolLetters.push(letter);
    updateUnscrambleUI();
  }

  function updateUnscrambleUI() {
    const builtEl = document.getElementById("lw-built");
    const poolEl = document.getElementById("lw-pool");
    if (!builtEl || !poolEl) return;

    builtEl.innerHTML = builtLetters
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

    // empty slots hint
    const empty = target.label.length - builtLetters.length;
    for (let i = 0; i < empty; i++) {
      builtEl.innerHTML += '<span class="lw-slot"></span>';
    }

    poolEl.innerHTML = poolLetters
      .map(function (l) {
        return (
          '<button type="button" class="lw-tile lw-tile-pool" data-id="' +
          l.id +
          '">' +
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
    poolEl.querySelectorAll(".lw-tile-pool").forEach(function (btn) {
      btn.onclick = function () {
        pickLetter(btn.getAttribute("data-id"));
      };
    });
  }

  function checkUnscramble() {
    if (locked) return;
    const built = builtLetters.map(function (l) {
      return l.ch;
    }).join("");
    const ok = built === target.label;

    if (!ok) {
      // Flash wrong, return letters to pool
      const builtEl = document.getElementById("lw-built");
      if (builtEl) builtEl.classList.add("shake");
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML = '<span class="lw-fb-ico">✗</span> Try again';
        fb.className = "lw-fb bad";
      }
      setTimeout(function () {
        if (builtEl) builtEl.classList.remove("shake");
        // return all to pool
        poolLetters = poolLetters.concat(builtLetters);
        builtLetters = [];
        // reshuffle pool slightly
        poolLetters = shuffle(poolLetters);
        updateUnscrambleUI();
        if (fb) {
          fb.innerHTML = "";
          fb.className = "lw-fb";
        }
      }, 650);
      return;
    }

    // Correct
    locked = true;
    stopAudio();
    scoreUnscramble += 1;
    const fb = document.getElementById("lw-fb");
    if (fb) {
      fb.innerHTML =
        '<span class="lw-fb-ico">✓</span> Correct! <strong>' + target.label + "</strong>";
      fb.className = "lw-fb ok";
    }
    const builtEl = document.getElementById("lw-built");
    if (builtEl) builtEl.classList.add("ok");

    clearNextTimer();
    nextTimer = setTimeout(function () {
      nextTimer = null;
      if (round >= TOTAL) {
        // Transition to part 2
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
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML =
          '<span class="lw-fb-ico">A</span> Start with a <strong>capital letter</strong> (e.g. Monday)';
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
      input.classList.remove("ok");
      input.classList.add("bad", "shake");
      setTimeout(function () {
        input.classList.remove("shake");
      }, 400);
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML =
          '<span class="lw-fb-ico">✗</span> Try again — listen and write the day.';
        fb.className = "lw-fb bad";
      }
      input.focus();
      try {
        input.select();
      } catch (e) {}
      return;
    }

    locked = true;
    stopAudio();
    scoreWrite += 1;

    input.disabled = true;
    input.classList.remove("bad");
    input.classList.add("ok");
    input.value = target.label;

    const fb = document.getElementById("lw-fb");
    if (fb) {
      fb.innerHTML =
        '<span class="lw-fb-ico">✓</span> Correct! <strong>' + target.label + "</strong>";
      fb.className = "lw-fb ok";
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
        '<span class="lw-badge">✍️ Write</span></header>' +
        '<section class="lw-start">' +
        '<div class="lw-hero"><div class="lw-blob" aria-hidden="true"></div>' +
        '<div class="lw-icon-wrap"><span class="lw-icon">✍️</span></div></div>' +
        '<p class="lw-eyebrow">LISTENING · SPELLING</p>' +
        "<h1>Listen &amp; Write</h1>" +
        '<p class="lw-sub"><strong>Part 1:</strong> Unscramble the letters<br>' +
        "<strong>Part 2:</strong> Listen again and write the word</p>" +
        '<p class="lw-hint">' + TOTAL + " days · two parts</p>" +
        '<button type="button" class="lw-btn" id="lw-go">Start</button>' +
        "</section>";
      document.getElementById("lw-go").onclick = beginPart1;
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
        '<div class="lw-icon-wrap"><span class="lw-icon">🎧</span></div>' +
        "<h1>Nice work!</h1>" +
        '<p class="lw-sub">You unscrambled <strong>' + scoreUnscramble + "</strong> of " + TOTAL + " days.</p>" +
        '<p class="lw-sub">Now listen again and <strong>write</strong> each day.</p>' +
        '<button type="button" class="lw-btn" id="lw-part2">Part 2 →</button>' +
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
      const stars = got >= 12 ? 3 : got >= 8 ? 2 : got >= 4 ? 1 : 0;
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
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

    let body = "";
    if (mode === "unscramble") {
      body =
        '<p class="lw-instruction">Listen, then tap the letters in order.</p>' +
        '<div class="lw-unscramble">' +
        '<div class="lw-built" id="lw-built"></div>' +
        '<div class="lw-pool" id="lw-pool"></div>' +
        "</div>" +
        '<div class="lw-fb" id="lw-fb" aria-live="polite"></div>';
    } else {
      body =
        '<p class="lw-instruction">Listen again, then write the day (capital first).</p>' +
        '<div class="lw-write-card">' +
        '<label class="lw-label" for="lw-input">Day</label>' +
        '<input type="text" id="lw-input" class="lw-input" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Monday" maxlength="20" />' +
        '<button type="button" class="lw-btn lw-check" id="lw-check">Check</button>' +
        "</div>" +
        '<div class="lw-fb" id="lw-fb" aria-live="polite"></div>';
    }

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Part ' + partNum + " · " + partLabel + "</span>" +
      '<span class="lw-badge">' + round + " / " + TOTAL + "</span></header>" +
      '<div class="lw-player" id="lw-player">' +
      '<button type="button" class="lw-play-btn" id="lw-play" aria-label="Play audio">' +
      '<span class="lw-play-ico" aria-hidden="true">▶</span>' +
      '<span class="lw-play-label">Play audio</span></button>' +
      '<div class="lw-wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
      "</div>" +
      body;

    document.getElementById("lw-play").onclick = togglePlay;

    if (mode === "unscramble") {
      updateUnscrambleUI();
    } else {
      document.getElementById("lw-check").onclick = checkWrite;
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
