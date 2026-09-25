/* What do they buy? · AEF Starter Practical English 2 */
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


  const GAME_ID = "starter-pe2-jenny-amy-buy";

  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/o46953_Jenny_and_Amy.mp3";

  // Jenny: tuna salad, mineral water
  // Amy: cheese sandwich, cappuccino, brownie
  const ANSWERS = {
    jenny: [
      ["tuna salad", "a tuna salad", "salad", "tuna"],
      ["mineral water", "water", "a mineral water", "bottle of water"],
    ],
    amy: [
      ["cheese sandwich", "a cheese sandwich", "sandwich", "cheese"],
      ["cappuccino", "a cappuccino", "coffee", "capp"],
      ["brownie", "a brownie", "cake"],
    ],
  };

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let currentAudio = null;
  let checked = false;
  let correctCount = 0;
  const totalSlots = 5; // 2 Jenny + 3 Amy

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchSlot(value, answerList) {
    const n = normalize(value);
    if (!n) return false;
    return answerList.some((a) => {
      const e = normalize(a);
      return n === e || n.includes(e) || e.includes(n);
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".ja-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(AUDIO_URL);
    currentAudio = a;
    const btn = app.querySelector(".ja-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function calcStars() {
    if (correctCount >= 5) return 3;
    if (correctCount >= 3) return 2;
    if (correctCount >= 1) return 1;
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

  function checkAnswers() {
    if (checked) return;
    checked = true;
    correctCount = 0;

    // Jenny slots
    ANSWERS.jenny.forEach((_, i) => {
      const input = document.getElementById("jenny-" + i);
      const row = input && input.closest(".ja-slot");
      const val = input ? input.value : "";
      const ok = matchSlot(val, ANSWERS.jenny[i]);
      if (ok) correctCount++;
      if (row) {
        row.classList.add(ok ? "is-correct" : "is-wrong");
        input.disabled = true;
      }
    });

    // Amy slots
    ANSWERS.amy.forEach((_, i) => {
      const input = document.getElementById("amy-" + i);
      const row = input && input.closest(".ja-slot");
      const val = input ? input.value : "";
      const ok = matchSlot(val, ANSWERS.amy[i]);
      if (ok) correctCount++;
      if (row) {
        row.classList.add(ok ? "is-correct" : "is-wrong");
        input.disabled = true;
      }
    });

    // show results button
    const next = document.getElementById("ja-next");
    if (next) {
      next.style.display = "block";
      next.textContent = "See results";
    }

    const feedback = document.getElementById("ja-feedback");
    if (feedback) {
      feedback.textContent = correctCount + " / " + totalSlots + " correct";
      feedback.className = "ja-feedback " + (correctCount === totalSlots ? "ok" : "mid");
    }
  }

  function goResults() {
    stopAudio();
    phase = "done";
    render();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    checked = false;
    correctCount = 0;
    phase = "play";
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="ja-topbar">
          <a class="ja-back" href="../" aria-label="Back">←</a>
          <span class="ja-title">What do they buy?</span>
          <span class="ja-badge">PE2</span>
        </header>
        <section class="ja-start">
          <div class="ja-hero" aria-hidden="true">🛒</div>
          <h1>What do they buy?</h1>
          <p class="ja-desc">Listen to the conversation and write the food and drinks Jenny and Amy buy.</p>
          <button type="button" class="ja-btn" id="ja-start">Start</button>
        </section>`;
      document.getElementById("ja-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: totalSlots,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML = `
        <header class="ja-topbar">
          <a class="ja-back" href="../" aria-label="Back">←</a>
          <span class="ja-title">What do they buy?</span>
          <span class="ja-badge">Done</span>
        </header>
        <section class="ja-done">
          <div class="ja-stars" aria-hidden="true">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Nice work!" : "Keep listening!"}</h1>
          <p>You got <strong>${correctCount} / ${totalSlots}</strong> items right.</p>
          <div class="ja-key">
            <p><strong>Jenny:</strong> tuna salad, mineral water</p>
            <p><strong>Amy:</strong> cheese sandwich, cappuccino, brownie</p>
          </div>
          <button type="button" class="ja-btn" id="ja-again">Play again</button>
          <button type="button" class="ja-btn secondary" id="ja-menu">Back to start</button>
        </section>`;
      document.getElementById("ja-again").onclick = startGame;
      document.getElementById("ja-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play
    app.innerHTML = `
      <header class="ja-topbar">
          <a class="ja-back" href="../" aria-label="Back">←</a>
          <span class="ja-title">What do they buy?</span>
        </header>
      <div class="game-toolbar">
        <div class="stats-bar">
          <div class="stat"><span class="stat-label">TASK</span><strong>Write</strong></div>
          <div class="stat"><span class="stat-label">ITEMS</span><strong>${totalSlots}</strong></div>
        </div>
      </div>

      <div class="ja-content">
        <div class="ja-audio-row">
          <button type="button" class="ja-play" aria-label="Play conversation">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <p class="ja-hint">Listen, then write the items from the list</p>
        </div>

        <div class="ja-wordbank">
          <p class="ja-wordbank-title">Items</p>
          <div class="ja-chips">
            <span class="ja-chip">tuna salad</span>
            <span class="ja-chip">mineral water</span>
            <span class="ja-chip">cheese sandwich</span>
            <span class="ja-chip">cappuccino</span>
            <span class="ja-chip">brownie</span>
          </div>
        </div>

        <div class="ja-table">
          <div class="ja-row">
            <div class="ja-name">Jenny</div>
            <div class="ja-slots">
              <div class="ja-slot">
                <input type="text" id="jenny-0" class="ja-input" placeholder="1 …" autocomplete="off" spellcheck="false">
              </div>
              <div class="ja-slot">
                <input type="text" id="jenny-1" class="ja-input" placeholder="2 …" autocomplete="off" spellcheck="false">
              </div>
            </div>
          </div>
          <div class="ja-row">
            <div class="ja-name">Amy</div>
            <div class="ja-slots">
              <div class="ja-slot">
                <input type="text" id="amy-0" class="ja-input" placeholder="1 …" autocomplete="off" spellcheck="false">
              </div>
              <div class="ja-slot">
                <input type="text" id="amy-1" class="ja-input" placeholder="2 …" autocomplete="off" spellcheck="false">
              </div>
              <div class="ja-slot">
                <input type="text" id="amy-2" class="ja-input" placeholder="3 …" autocomplete="off" spellcheck="false">
              </div>
            </div>
          </div>
        </div>

        <p class="ja-feedback" id="ja-feedback"></p>
        <button type="button" class="ja-btn" id="ja-check">Check answers</button>
        <button type="button" class="ja-btn" id="ja-next" style="display:none">See results</button>
      </div>`;

    app.querySelector(".ja-play").onclick = playAudio;
    document.getElementById("ja-check").onclick = checkAnswers;
    const next = document.getElementById("ja-next");
    if (next) next.onclick = goResults;

    // Enter key advances focus or checks
    app.querySelectorAll(".ja-input").forEach((input, idx, list) => {
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (idx < list.length - 1) list[idx + 1].focus();
          else checkAnswers();
        }
      };
    });
  }

  render();
})();
