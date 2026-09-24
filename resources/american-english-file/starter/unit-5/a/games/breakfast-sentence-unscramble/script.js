/* Breakfast Sentence Unscramble · force listen after correct · Unit 5A */
(function () {
  "use strict";

  var GAME_ID = "starter-5a-breakfast-sentence-unscramble";

  var ITEMS = [
    {
      sentence: "I have a croissant and coffee.",
      audio: "https://cdn.imgurl.ir/uploads/g702134_I_have_a_crossiant_and_coffee.mp3"
    },
    {
      sentence: "I have breakfast at home.",
      audio: "https://cdn.imgurl.ir/uploads/k31529_I_have_breakfast_at_home.mp3"
    },
    {
      sentence: "I don't eat in the morning.",
      audio: "https://cdn.imgurl.ir/uploads/v175209_I_dont__in_the_morning.mp3"
    },
    {
      sentence: "I really like breakfast.",
      audio: "https://cdn.imgurl.ir/uploads/q682732_I_really_like_breakfast.mp3"
    },
    {
      sentence: "I have breakfast at home with my family.",
      audio: "https://cdn.imgurl.ir/uploads/53825_I_have_breakfast_at_home_with_my_family.mp3"
    },
    {
      sentence: "We have rice, fish and miso soup.",
      audio: "https://cdn.imgurl.ir/uploads/x235164_We_have_rice_fish_and_miso_soup.mp3"
    },
    {
      sentence: "We don't drink coffee.",
      audio: "https://cdn.imgurl.ir/uploads/z748713_We_don39t_drink_coffee.mp3"
    }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | listen | done
  var index = 0;
  var tokens = []; // correct order
  var pool = []; // { id, text, used }
  var built = []; // ids in order
  var locked = false;
  var score = 0;
  var listened = false;
  var currentAudio = null;
  var sfxCtx = null;
  var uid = 0;

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

  function tokenize(sentence) {
    // Keep punctuation attached to words: "coffee." "soup." "morning."
    return sentence
      .trim()
      .split(/\s+/)
      .filter(Boolean);
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

  function sfxTap() {
    try {
      if (window.LASfx && LASfx.click) LASfx.click();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(640, ctx.currentTime, 0.05, "sine", 0.07);
  }

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.correct) LASfx.correct();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.12);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.12);
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

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".su-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio(forceListen) {
    var item = ITEMS[index];
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = app.querySelector(".su-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
      if (forceListen) {
        listened = true;
        enableNext();
      }
    };
  }

  function enableNext() {
    var next = document.getElementById("su-next");
    if (next) {
      next.disabled = false;
      next.classList.remove("is-disabled");
    }
    var hint = document.getElementById("su-listen-hint");
    if (hint) {
      hint.textContent = "Great — continue to the next sentence.";
      hint.className = "su-listen-hint ok";
    }
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    score = 0;
    phase = "play";
    startRound();
  }

  function startRound() {
    if (index >= TOTAL) {
      finishGame();
      return;
    }
    locked = false;
    listened = false;
    stopAudio();
    tokens = tokenize(ITEMS[index].sentence);
    var scrambled = shuffle(tokens.slice());
    // avoid identical order when possible
    var tries = 0;
    while (scrambled.join(" ") === tokens.join(" ") && tokens.length > 2 && tries < 15) {
      scrambled = shuffle(tokens.slice());
      tries++;
    }
    pool = scrambled.map(function (text) {
      return { id: "w" + ++uid, text: text, used: false };
    });
    built = [];
    phase = "play";
    render();
  }

  function pickWord(id) {
    if (locked || phase !== "play") return;
    var chip = pool.find(function (c) {
      return c.id === id;
    });
    if (!chip || chip.used) return;
    sfxTap();
    chip.used = true;
    built.push(id);
    updateTiles();
  }

  function unpickWord(id) {
    if (locked || phase !== "play") return;
    var i = built.indexOf(id);
    if (i < 0) return;
    sfxTap();
    built.splice(i, 1);
    var chip = pool.find(function (c) {
      return c.id === id;
    });
    if (chip) chip.used = false;
    updateTiles();
  }

  function clearAll() {
    if (locked || phase !== "play") return;
    sfxTap();
    built = [];
    pool.forEach(function (c) {
      c.used = false;
    });
    updateTiles();
    var fb = document.getElementById("su-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "su-fb";
    }
  }

  function builtText() {
    return built
      .map(function (id) {
        var c = pool.find(function (x) {
          return x.id === id;
        });
        return c ? c.text : "";
      })
      .join(" ");
  }

  function checkAnswer() {
    if (locked || phase !== "play") return;
    if (built.length !== tokens.length) {
      var fb0 = document.getElementById("su-fb");
      if (fb0) {
        fb0.textContent = "Use all the words.";
        fb0.className = "su-fb bad";
      }
      return;
    }

    var ok = builtText() === tokens.join(" ");
    if (!ok) {
      sfxBad();
      locked = true;
      document.querySelectorAll(".su-built-chip").forEach(function (el) {
        el.classList.add("bad");
      });
      var fb = document.getElementById("su-fb");
      if (fb) {
        fb.textContent = "Not quite — try again.";
        fb.className = "su-fb bad";
      }
      setTimeout(function () {
        locked = false;
        document.querySelectorAll(".su-built-chip").forEach(function (el) {
          el.classList.remove("bad");
        });
      }, 550);
      return;
    }

    // Correct → force listen
    locked = true;
    sfxOk();
    score += 1;
    document.querySelectorAll(".su-built-chip").forEach(function (el) {
      el.classList.add("ok");
    });
    var fb2 = document.getElementById("su-fb");
    if (fb2) {
      fb2.textContent = "✓ Correct! Now listen.";
      fb2.className = "su-fb ok";
    }
    phase = "listen";
    listened = false;
    setTimeout(function () {
      renderListenStep();
      playAudio(true);
    }, 500);
  }

  function renderListenStep() {
    var actions = document.getElementById("su-actions");
    var poolEl = document.getElementById("su-pool");
    var hint = document.getElementById("su-hint");
    if (poolEl) poolEl.style.display = "none";
    if (hint) hint.style.display = "none";
    if (actions) {
      actions.innerHTML =
        '<div class="su-listen-bar">' +
        '<button type="button" class="su-play" id="su-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<p class="su-listen-hint" id="su-listen-hint">Listen to the sentence to continue</p>' +
        "</div>" +
        '<button type="button" class="su-btn is-disabled" id="su-next" disabled>Next →</button>';
      document.getElementById("su-play").onclick = function () {
        playAudio(true);
      };
      document.getElementById("su-next").onclick = function () {
        if (!listened) return;
        index += 1;
        startRound();
      };
    }
  }

  function finishGame() {
    stopAudio();
    phase = "done";
    var stars = score >= TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn(e);
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

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateTiles() {
    var builtEl = document.getElementById("su-built");
    var poolEl = document.getElementById("su-pool");
    if (!builtEl || !poolEl) return;

    builtEl.innerHTML = built
      .map(function (id) {
        var c = pool.find(function (x) {
          return x.id === id;
        });
        return (
          '<button type="button" class="su-chip su-built-chip" data-id="' +
          id +
          '">' +
          escapeHtml(c.text) +
          "</button>"
        );
      })
      .join("");

    poolEl.innerHTML = pool
      .map(function (c) {
        return (
          '<button type="button" class="su-chip su-pool-chip' +
          (c.used ? " is-used" : "") +
          '" data-id="' +
          c.id +
          '"' +
          (c.used ? " disabled" : "") +
          ">" +
          escapeHtml(c.text) +
          "</button>"
        );
      })
      .join("");

    builtEl.querySelectorAll(".su-built-chip").forEach(function (btn) {
      btn.onclick = function () {
        unpickWord(btn.getAttribute("data-id"));
      };
    });
    poolEl.querySelectorAll(".su-pool-chip:not(.is-used)").forEach(function (btn) {
      btn.onclick = function () {
        pickWord(btn.getAttribute("data-id"));
      };
    });
  }

  function render() {
    if (phase === "start") {
      stopAudio();
      app.innerHTML =
        '<header class="su-topbar">' +
        '<a class="su-back" href="../" aria-label="Back">←</a>' +
        '<span class="su-title">Sentence Unscramble</span>' +
        '<span class="su-badge">5A</span></header>' +
        '<section class="su-start">' +
        '<div class="su-hero" aria-hidden="true">🔤</div>' +
        "<h1>Breakfast Sentences</h1>" +
        '<p class="su-sub">Unscramble the words, then listen to each sentence.</p>' +
        '<button type="button" class="su-btn" id="su-start">Start</button>' +
        "</section>";
      document.getElementById("su-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = score >= TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
      app.innerHTML =
        '<header class="su-topbar">' +
        '<a class="su-back" href="../" aria-label="Back">←</a>' +
        '<span class="su-title">Sentence Unscramble</span>' +
        '<span class="su-badge">Done</span></header>' +
        '<section class="su-start">' +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!") +
        "</h1>" +
        '<p class="su-sub">You built <strong>' +
        score +
        "</strong> of " +
        TOTAL +
        " sentences.</p>" +
        '<button type="button" class="su-btn" id="su-again">Play again</button>' +
        "</section>";
      document.getElementById("su-again").onclick = startGame;
      return;
    }

    var pct = Math.round((index / TOTAL) * 100);
    app.innerHTML =
      '<header class="su-topbar">' +
      '<a class="su-back" href="../" aria-label="Back">←</a>' +
      '<span class="su-title">Sentence Unscramble</span>' +
      '<span class="su-badge">' +
      (index + 1) +
      " / " +
      TOTAL +
      "</span></header>" +
      '<div class="su-progress"><div class="su-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<p class="su-hint" id="su-hint">Tap the words in the correct order</p>' +
      '<div class="su-built" id="su-built"></div>' +
      '<div class="su-pool" id="su-pool"></div>' +
      '<div class="su-actions" id="su-actions">' +
      '<button type="button" class="su-btn secondary" id="su-clear">Clear</button>' +
      '<button type="button" class="su-btn" id="su-check">Check ✓</button>' +
      "</div>" +
      '<div class="su-fb" id="su-fb" aria-live="polite"></div>';

    document.getElementById("su-clear").onclick = clearAll;
    document.getElementById("su-check").onclick = checkAnswer;
    updateTiles();
  }

  render();
})();
