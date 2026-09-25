/* Listen & Write Numbers – per-item play + input – AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-listen-write-numbers";

  const ITEMS = [
    { ans: "15", audio: "audio/01.mp3" },
    { ans: "97", audio: "audio/02.mp3" },
    { ans: "11", audio: "audio/03.mp3" },
    { ans: "100", audio: "audio/04.mp3" },
    { ans: "40", audio: "audio/05.mp3" },
    { ans: "29", audio: "audio/06.mp3" },
    { ans: "16", audio: "audio/07.mp3" },
    { ans: "62", audio: "audio/08.mp3" },
    { ans: "56", audio: "audio/09.mp3" },
    { ans: "78", audio: "audio/10.mp3" },
    { ans: "34", audio: "audio/11.mp3" },
    { ans: "81", audio: "audio/12.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
  let currentAudio = null;
  let playingIndex = null;
  let correctCount = 0;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    playingIndex = null;
    app.querySelectorAll(".lw-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playItem(i) {
    const item = ITEMS[i];
    if (!item) return;
    if (playingIndex === i && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    playingIndex = i;
    const btn = app.querySelector('.lw-play[data-i="' + i + '"]');
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
      playingIndex = null;
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (playingIndex === i) playingIndex = null;
      if (currentAudio === a) currentAudio = null;
    };
  }

  function normalize(v) {
    return String(v || "").replace(/\D/g, "");
  }

  function check() {
    let ok = 0;
    ITEMS.forEach(function (item, i) {
      const input = document.getElementById("lw-in-" + i);
      if (!input) return;
      const val = normalize(input.value);
      input.classList.remove("is-ok", "is-bad");
      if (!val) {
        input.classList.add("is-bad");
        return;
      }
      if (val === item.ans) {
        input.classList.add("is-ok");
        input.disabled = true;
        ok += 1;
      } else {
        input.classList.add("is-bad");
      }
    });
    correctCount = ok;
    const result = document.getElementById("lw-result");
    if (ok === ITEMS.length) {
      result.className = "lw-result is-ok";
      result.textContent = "Perfect! All " + ok + " correct.";
      setTimeout(function () {
        phase = "done";
        render();
      }, 900);
    } else if (ok > 0) {
      result.className = "lw-result is-partial";
      result.textContent = ok + " / " + ITEMS.length + " correct — try the rest!";
    } else {
      result.className = "lw-result is-bad";
      result.textContent = "Try again!";
    }
  }

  function reset() {
    stopAudio();
    phase = "play";
    correctCount = 0;
    render();
  }

  function calcStars() {
    const r = correctCount / ITEMS.length;
    if (r >= 1) return 3;
    if (r >= 0.75) return 2;
    if (r >= 0.5) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function playBtnHtml(i) {
    return (
      '<button type="button" class="lw-play" data-i="' + i + '" aria-label="Play ' + (i + 1) + '">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>"
    );
  }

  function rowHtml(i) {
    return (
      '<div class="lw-row">' +
      playBtnHtml(i) +
      '<input type="text" class="lw-input" id="lw-in-' + i + '" ' +
      'placeholder="' + (i + 1) + '" inputmode="numeric" autocomplete="off" spellcheck="false" maxlength="4" />' +
      "</div>"
    );
  }

  function render() {
    stopAudio();

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    // Two columns: 0–5 left, 6–11 right
    const leftRows = [];
    const rightRows = [];
    for (let i = 0; i < 6; i++) {
      leftRows.push(rowHtml(i));
      rightRows.push(rowHtml(i + 6));
    }

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Listen &amp; Write</span>' +
      '<span class="lw-badge">2B</span>' +
      "</header>" +
      '<p class="lw-instruction">Listen and write the numbers.</p>' +
      '<div class="lw-list">' +
      '<div class="lw-col">' + leftRows.join("") + "</div>" +
      '<div class="lw-col">' + rightRows.join("") + "</div>" +
      "</div>" +
      '<div class="lw-actions">' +
      '<button type="button" class="lw-btn secondary" id="lw-reset">Reset</button>' +
      '<button type="button" class="lw-btn" id="lw-check">Check</button>' +
      "</div>" +
      '<p class="lw-result" id="lw-result"></p>';

    app.querySelectorAll(".lw-play").forEach(function (btn) {
      btn.onclick = function () {
        playItem(+btn.dataset.i);
      };
    });
    document.getElementById("lw-check").onclick = check;
    document.getElementById("lw-reset").onclick = function () {
      stopAudio();
      ITEMS.forEach(function (_, i) {
        const input = document.getElementById("lw-in-" + i);
        if (input) {
          input.value = "";
          input.disabled = false;
          input.classList.remove("is-ok", "is-bad");
        }
      });
      document.getElementById("lw-result").className = "lw-result";
      document.getElementById("lw-result").textContent = "";
    };
  }

  render();
})();
