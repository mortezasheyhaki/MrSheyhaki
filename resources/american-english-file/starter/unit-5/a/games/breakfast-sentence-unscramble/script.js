/* Sentence Unscramble · Unit 5A
   Layout matched to Sentence Builder · be (Unit 1A) */
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
  var selected = []; // texts in order (like SB)
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
    return sentence.trim().split(/\s+/).filter(Boolean);
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
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.1, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function sfxClick() {
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
    app.querySelectorAll(".su-play-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio(forceListen) {
    var item = ITEMS[index];
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = app.querySelector(".su-play-btn");
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
    var tries = 0;
    while (scrambled.join(" ") === tokens.join(" ") && tokens.length > 2 && tries < 15) {
      scrambled = shuffle(tokens.slice());
      tries++;
    }
    uid = 0;
    pool = scrambled.map(function (t) {
      return { id: ++uid, text: t, used: false };
    });
    selected = [];
    phase = "play";
    render();
  }

  function clearAll() {
    if (locked) return;
    sfxClick();
    selected = [];
    pool.forEach(function (p) {
      p.used = false;
    });
    updateSlotsAndChips();
    var checkBtn = document.getElementById("su-check");
    if (checkBtn) checkBtn.disabled = true;
    var fb = document.getElementById("su-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "su-fb";
    }
  }

  function checkAnswer() {
    if (locked || selected.length !== tokens.length) return;
    locked = true;
    var ok = selected.join(" ") === tokens.join(" ");
    var slots = app.querySelectorAll(".su-slot");
    slots.forEach(function (slot, i) {
      slot.classList.remove("filled");
      slot.classList.add(ok ? "correct" : "wrong");
    });

    var checkBtn = document.getElementById("su-check");
    if (checkBtn) checkBtn.disabled = true;

    if (ok) {
      sfxOk();
      score++;
      var fb = document.getElementById("su-fb");
      if (fb) {
        fb.textContent = "Perfect!";
        fb.className = "su-fb ok";
      }
      setTimeout(function () {
        phase = "listen";
        renderListenStep();
      }, 700);
    } else {
      sfxBad();
      var fb2 = document.getElementById("su-fb");
      if (fb2) {
        fb2.textContent = "Try again";
        fb2.className = "su-fb bad";
      }
      setTimeout(function () {
        locked = false;
        selected = [];
        pool.forEach(function (p) {
          p.used = false;
        });
        updateSlotsAndChips();
        if (checkBtn) checkBtn.disabled = true;
        if (fb2) {
          fb2.textContent = "";
          fb2.className = "su-fb";
        }
      }, 900);
    }
  }

  function renderListenStep() {
    var actions = document.getElementById("su-actions");
    var chipsEl = document.getElementById("su-chips");
    var label = app.querySelector(".su-prompt-label");
    if (label) label.textContent = "Listen to the sentence";
    if (chipsEl) chipsEl.innerHTML = "";
    if (actions) {
      actions.innerHTML =
        '<div class="su-listen-bar">' +
        '<button type="button" class="su-play-btn" id="su-play" aria-label="Play audio">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<span class="eq"><span></span><span></span><span></span><span></span></span>' +
        "</button>" +
        '<p class="su-listen-hint" id="su-listen-hint">Listening…</p>' +
        '<button type="button" class="su-btn su-btn-primary is-disabled" id="su-next" disabled style="max-width:260px;width:100%;">Next →</button>' +
        "</div>";
      document.getElementById("su-play").onclick = function () {
        playAudio(true);
      };
      document.getElementById("su-next").onclick = function () {
        if (!listened) return;
        index++;
        startRound();
      };
      // Auto-play audio after correct answer — no need to press Play
      setTimeout(function () {
        playAudio(true);
      }, 150);
    }
  }

  function updateSlotsAndChips() {
    var slotsEl = document.getElementById("su-slots");
    var chipsEl = document.getElementById("su-chips");
    if (!slotsEl || !chipsEl) return;

    // slots
    slotsEl.innerHTML = tokens
      .map(function (_, i) {
        var text = selected[i] || "";
        var cls = "su-slot" + (text ? " filled" : "");
        return (
          '<span class="' +
          cls +
          '" data-i="' +
          i +
          '">' +
          (text ? escapeHtml(text) : "") +
          "</span>"
        );
      })
      .join("");

    // chips
    chipsEl.innerHTML = pool
      .map(function (p) {
        return (
          '<button type="button" class="su-chip' +
          (p.used ? " used" : "") +
          '" data-id="' +
          p.id +
          '" data-text="' +
          escapeAttr(p.text) +
          '"' +
          (p.used ? " disabled" : "") +
          ">" +
          escapeHtml(p.text) +
          "</button>"
        );
      })
      .join("");

    // chip clicks
    chipsEl.querySelectorAll(".su-chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        if (locked) return;
        sfxClick();
        var id = +btn.dataset.id;
        var text = btn.dataset.text;
        var item = pool.find(function (p) {
          return p.id === id;
        });
        if (!item || item.used) return;
        item.used = true;
        selected.push(text);
        updateSlotsAndChips();
        var checkBtn = document.getElementById("su-check");
        if (checkBtn) checkBtn.disabled = selected.length !== tokens.length;
      };
    });

    // slot clicks (remove last matching)
    slotsEl.querySelectorAll(".su-slot.filled").forEach(function (slot) {
      slot.onclick = function () {
        if (locked) return;
        var i = +slot.dataset.i;
        if (i !== selected.length - 1) return; // only allow removing from end for simplicity
        sfxClick();
        var text = selected.pop();
        var item = pool
          .slice()
          .reverse()
          .find(function (p) {
            return p.used && p.text === text;
          });
        if (item) item.used = false;
        updateSlotsAndChips();
        var checkBtn = document.getElementById("su-check");
        if (checkBtn) checkBtn.disabled = selected.length !== tokens.length;
      };
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

  function progressPct() {
    return Math.round((index / TOTAL) * 100);
  }

  function finishGame() {
    phase = "done";
    stopAudio();
    var timeMs = 0;
    try {
      if (window.LAFinish && LAFinish.stopTimer) timeMs = LAFinish.stopTimer();
    } catch (_) {}
    if (window.LAFinish) {
      try {
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: score >= TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0,
          timeMs: timeMs,
          onAgain: function () {
            startGame();
          },
          backHref: "../"
        });
      } catch (_) {}
    }
    // Keep a simple fallback behind the overlay in case LAFinish is missing
    render();
  }

  function render() {
    if (phase === "start") {
      stopAudio();
      app.innerHTML =
        '<div class="su-top">' +
        '<a class="su-back" href="../" aria-label="Back">←</a>' +
        "</div>" +
        '<div class="su-start">' +
        '<div class="su-hero" aria-hidden="true">🔤</div>' +
        "<h1>Sentence Unscramble</h1>" +
        "<p>Unscramble the breakfast sentences, then listen to each one.</p>" +
        '<button type="button" class="su-btn su-btn-primary" id="su-start" style="max-width:280px;width:100%;margin:0 auto;display:block;">Start</button>' +
        "</div>";
      document.getElementById("su-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = score >= TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
      var title =
        stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!";
      app.innerHTML =
        '<div class="su-top">' +
        '<a class="su-back" href="../" aria-label="Back">←</a>' +
        "</div>" +
        '<div class="su-start">' +
        "<h1>" +
        title +
        "</h1>" +
        "<p>You built <strong>" +
        score +
        "</strong> of " +
        TOTAL +
        " sentences.</p>" +
        '<button type="button" class="su-btn su-btn-primary" id="su-again" style="max-width:280px;width:100%;margin:0 auto;display:block;">Play again</button>' +
        "</div>";
      document.getElementById("su-again").onclick = startGame;
      return;
    }

    // play phase
    app.innerHTML =
      '<div class="su-top">' +
      '<a class="su-back" href="../" aria-label="Back">←</a>' +
      '<div class="su-progress"><span style="width:' +
      progressPct() +
      '%"></span></div>' +
      '<span class="su-mode-tag">' +
      (index + 1) +
      " / " +
      TOTAL +
      "</span>" +
      "</div>" +
      '<div class="su-play">' +
      '<div class="su-phase">Sentence ' +
      (index + 1) +
      "</div>" +
      '<div class="su-prompt">' +
      '<div class="su-prompt-label">Tap the words in the correct order</div>' +
      '<div class="su-slots" id="su-slots"></div>' +
      "</div>" +
      '<div class="su-chips" id="su-chips"></div>' +
      '<div class="su-actions" id="su-actions">' +
      '<button type="button" class="su-btn su-btn-ghost" id="su-clear">Clear</button>' +
      '<button type="button" class="su-btn su-btn-primary" id="su-check" disabled>Check ✓</button>' +
      "</div>" +
      '<div class="su-fb" id="su-fb" aria-live="polite"></div>' +
      "</div>";

    document.getElementById("su-clear").onclick = clearAll;
    document.getElementById("su-check").onclick = checkAnswer;
    updateSlotsAndChips();
  }

  render();
})();
