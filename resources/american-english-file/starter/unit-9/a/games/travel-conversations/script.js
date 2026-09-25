/* Travel Conversations – 4 dialogues · Part A: what are they doing? · Part B: choose details */
(function () {
  "use strict";

  

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
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

const GAME_ID = "starter-9a-travel-conversations";

  const CONVS = [
    {
      id: 1,
      title: "Conversation 1",
      audio: "audio/conversation-1.mp3",
      lines: [
        { who: "W", text: "Oh, look! An L.A. Galaxy shirt. It's perfect for Henry." },
        { who: "M", text: "Yes, good idea. Oh, it's very expensive." },
        { who: "W", text: "Soccer shirts are always expensive. Okay. What can we get for Jessica?" },
        { who: "M", text: "She likes soccer too." },
        { who: "W", text: "Yeah, but she never wears soccer shirts. What about this bag?" },
        { who: "M", text: "I don't know. Does she like bags?" },
        { who: "W", text: "She loves bags!" },
      ],
      doing: {
        prompt: "The man and the woman are …",
        correct: "buying presents",
        options: [
          "buying presents",
          "packing a suitcase",
          "renting a car",
          "waiting for a bus",
        ],
      },
      details: {
        // blanks: pairs of options; correct index 0 or 1
        template: "Henry's present is a {0} and Jessica's is a {1}.",
        blanks: [
          { choices: ["soccer ball", "soccer shirt"], correct: 1 },
          { choices: ["bag", "T-shirt"], correct: 0 },
        ],
      },
    },
    {
      id: 2,
      title: "Conversation 2",
      audio: "audio/conversation-2.mp3",
      lines: [
        { who: "W", text: "Emilio, do we need swimming things?" },
        { who: "M", text: "I can look at their website. Can you see my camera?" },
        { who: "W", text: "Yes, here it is. Do you want me to put the camera in the suitcase or in your bag?" },
        { who: "M", text: "In the suitcase, please. Okay, here's the page. Yes, it has a swimming pool." },
        { who: "W", text: "Great!" },
      ],
      doing: {
        prompt: "The woman is …",
        correct: "packing the suitcase",
        options: [
          "packing the suitcase",
          "buying presents",
          "renting a car",
          "waiting for a bus",
        ],
      },
      details: {
        template: "Their hotel {0} a swimming pool.",
        blanks: [{ choices: ["has", "doesn't have"], correct: 0 }],
      },
    },
    {
      id: 3,
      title: "Conversation 3",
      audio: "audio/conversation-3.mp3",
      lines: [
        { who: "W", text: "Good morning. How can I help you?" },
        { who: "M", text: "I need a car for three days." },
        { who: "W", text: "What kind of car are you looking for?" },
        { who: "M", text: "A small car. It's just for me." },
        { who: "W", text: "Front-wheel or all-wheel drive?" },
        { who: "M", text: "All-wheel drive, please." },
        { who: "W", text: "Can I see your driver's license?" },
        { who: "M", text: "Yes, here you are." },
      ],
      doing: {
        prompt: "The man is …",
        correct: "renting a car",
        options: [
          "renting a car",
          "packing a suitcase",
          "buying presents",
          "waiting for a bus",
        ],
      },
      details: {
        template: "The man is interested in a {0} {1} car for {2} days.",
        blanks: [
          { choices: ["small", "big"], correct: 0 },
          { choices: ["front-wheel drive", "all-wheel drive"], correct: 1 },
          { choices: ["three", "five"], correct: 0 },
        ],
      },
    },
    {
      id: 4,
      title: "Conversation 4",
      audio: "audio/conversation-4.mp3",
      lines: [
        { who: "M", text: "Is that a number 13?" },
        { who: "W", text: "Yes, I think it is. No, it's a 23." },
        { who: "M", text: "Another 23? I don't believe it. That's the third one. And no 13." },
        { who: "W", text: "Another one's coming now. Let's see. Yes, that's a thirteen." },
        { who: "M", text: "At last!" },
      ],
      doing: {
        prompt: "The man and the woman are …",
        correct: "waiting for a bus",
        options: [
          "waiting for a bus",
          "buying presents",
          "packing the suitcase",
          "renting a car",
        ],
      },
      details: {
        template: "The first bus is a number {0}. They are waiting for a number {1}.",
        blanks: [
          { choices: ["23", "25"], correct: 0 },
          { choices: ["13", "30"], correct: 0 },
        ],
      },
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  // phase: menu | listen | doing | details | done
  let phase = "menu";
  let convIndex = 0;
  let scoreDoing = 0;
  let scoreDetails = 0;
  let totalDoing = CONVS.length;
  let totalDetails = CONVS.reduce((n, c) => n + c.details.blanks.length, 0);
  let detailPicks = []; // selected choice index per blank
  let listenDone = false;
  let advancing = false;
  let advanceTimer = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let currentAudio = null;

  function stopAudioFile() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ""; } catch (_) {}
      currentAudio = null;
    }
  }

  function setAudioStatus(msg, kind) {
    // Prefer status next to the play button (doing / details phases)
    const status = document.getElementById("tc-audio-status");
    if (status) {
      status.textContent = msg || "";
      status.className = "tc-audio-status" + (kind ? " " + kind : "");
      return;
    }
    // Fallback: pure listen phase uses #tc-hint
    const hint = document.getElementById("tc-hint");
    if (hint) {
      hint.textContent = msg || "";
      hint.className = "tc-hint" + (kind ? " " + kind : "");
    }
  }

  function playConversation() {
    const conv = CONVS[convIndex];
    const btn = document.getElementById("tc-play");
    const cont = document.getElementById("tc-continue");

    // Toggle: if already playing this file, pause
    if (currentAudio && !currentAudio.paused && currentAudio.dataset && currentAudio.dataset.conv === String(conv.id)) {
      stopAudioFile();
      if (btn) btn.classList.remove("playing");
      setAudioStatus("Paused — tap to play again");
      return;
    }

    stopAudioFile();
    listenDone = false;
    if (cont) cont.disabled = true;
    if (btn) btn.classList.add("playing");
    setAudioStatus("Listening…");
    app.querySelectorAll(".tc-line").forEach((el) => el.classList.add("active"));

    const a = new Audio();
    a.preload = "auto";
    a.dataset.conv = String(conv.id);
    currentAudio = a;
    a.onended = () => {
      currentAudio = null;
      if (btn) btn.classList.remove("playing");
      listenDone = true;
      if (cont) cont.disabled = false;
      setAudioStatus("Done — tap to listen again", "ok");
    };
    a.onerror = () => {
      currentAudio = null;
      if (btn) btn.classList.remove("playing");
      listenDone = true;
      if (cont) cont.disabled = false;
      setAudioStatus("Could not load audio. Try again.", "bad");
    };
    a.src = conv.audio;
    const p = a.play();
    if (p && p.catch) {
      p.catch(() => {
        if (btn) btn.classList.remove("playing");
        setAudioStatus("Tap again to play (autoplay blocked)");
      });
    }
  }

  function startGame() {
    stopAudioFile();
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
    convIndex = 0;
    scoreDoing = 0;
    scoreDetails = 0;
    detailPicks = [];
    listenDone = true;
    advancing = false;
    phase = "doing";
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }


  function renderAudioBar(conv) {
    return `
      <div class="tc-audio-bar">
        <button type="button" class="tc-play" id="tc-play" aria-label="Play conversation">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="tc-audio-meta">
          <strong>${conv.title}</strong>
          <span id="tc-audio-status" class="tc-audio-status">Tap to listen anytime</span>
        </div>
      </div>`;
  }

  function bindAudioBar() {
    const play = document.getElementById("tc-play");
    if (play) play.onclick = playConversation;
  }

  function goDoing() {
    stopAudioFile();
    phase = "doing";
    render();
  }

  function goDetails() {
    phase = "details";
    detailPicks = CONVS[convIndex].details.blanks.map(() => null);
    render();
  }

  function nextConvOrDone() {
    if (advancing) return;
    advancing = true;
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
    stopAudioFile();
    convIndex += 1;
    if (convIndex >= CONVS.length) {
      phase = "done";
      advancing = false;
      render();
      return;
    }
    listenDone = true;
    phase = "doing";
    advancing = false;
    render();
  }

  function pickDoing(opt) {
    if (phase !== "doing" || advancing) return;
    advancing = true;
    const conv = CONVS[convIndex];
    const ok = opt === conv.doing.correct;
    if (ok) scoreDoing += 1;
    if (window.LASfx) { if (ok) LASfx.correct(); else LASfx.wrong(); }
    // show feedback
    app.querySelectorAll(".tc-choice").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.opt === conv.doing.correct) btn.classList.add("is-correct");
      else if (btn.dataset.opt === opt && !ok) btn.classList.add("is-wrong");
    });
    const hint = document.getElementById("tc-hint");
    if (hint) {
      hint.textContent = ok ? "Correct!" : "Answer: " + conv.doing.correct;
      hint.className = "tc-hint " + (ok ? "ok" : "bad");
    }
    if (advanceTimer) clearTimeout(advanceTimer);
    advanceTimer = setTimeout(() => {
      advancing = false;
      advanceTimer = null;
      goDetails();
    }, ok ? 900 : 1400);
  }

  function pickBlank(bi, ci) {
    if (phase !== "details") return;
    detailPicks[bi] = ci;
    renderDetailsOnly();
  }

  function checkDetails() {
    if (advancing) return;
    const conv = CONVS[convIndex];
    if (detailPicks.some((p) => p === null)) return;
    let allOk = true;
    conv.details.blanks.forEach((b, i) => {
      const ok = detailPicks[i] === b.correct;
      if (ok) scoreDetails += 1;
      else allOk = false;
    });
    if (window.LASfx) { if (allOk) LASfx.correct(); else LASfx.wrong(); }
    // lock UI
    app.querySelectorAll(".tc-opt button").forEach((btn) => {
      btn.disabled = true;
      const bi = +btn.dataset.bi;
      const ci = +btn.dataset.ci;
      if (ci === conv.details.blanks[bi].correct) btn.classList.add("is-correct");
      else if (detailPicks[bi] === ci) btn.classList.add("is-wrong");
    });
    const checkBtn = document.getElementById("tc-check-details");
    if (checkBtn) checkBtn.disabled = true;
    const hint = document.getElementById("tc-hint");
    if (hint) {
      hint.textContent = allOk ? "Perfect!" : "Check the green answers.";
      hint.className = "tc-hint " + (allOk ? "ok" : "bad");
    }
    const nextBtn = document.getElementById("tc-next-conv");
    if (nextBtn) nextBtn.classList.remove("hidden");
  }

  function renderDetailsOnly() {
    // re-render details section selections without full page reset if needed
    render();
  }

  function calcStars() {
    const total = totalDoing + totalDetails;
    const got = scoreDoing + scoreDetails;
    const acc = total ? got / total : 0;
    if (acc >= 0.9) return 3;
    if (acc >= 0.7) return 2;
    if (acc >= 0.4) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    return stars;
  }

  function spawnConfetti() {
    const wrap = document.createElement("div");
    wrap.className = "tc-confetti";
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#38bdf8"];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.8 + "s";
      p.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
      p.style.setProperty("--d", Math.random() * 80 - 40 + "px");
      wrap.appendChild(p);
    }
    app.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3000);
  }

  function renderDialogue(conv) {
    return conv.lines
      .map(
        (l, i) => `
      <div class="tc-line" data-i="${i}">
        <span class="tc-who ${l.who.toLowerCase()}">${l.who}</span>
        <span class="tc-line-text">${escapeHtml(l.text)}</span>
      </div>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderDetailSentence(conv) {
    const parts = conv.details.template.split(/\{(\d+)\}/);
    let html = "";
    parts.forEach((part, idx) => {
      if (idx % 2 === 1) {
        const bi = +part;
        const blank = conv.details.blanks[bi];
        const selected = detailPicks[bi];
        html += `<span class="tc-opt">`;
        blank.choices.forEach((ch, ci) => {
          html += `<button type="button" data-bi="${bi}" data-ci="${ci}" class="${
            selected === ci ? "selected" : ""
          }">${escapeHtml(ch)}</button>`;
          if (ci < blank.choices.length - 1) html += `<span class="tc-opt-slash">/</span>`;
        });
        html += `</span>`;
      } else {
        html += escapeHtml(part);
      }
    });
    return html;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="tc-top">
          <a class="tc-back" href="../" aria-label="Back">←</a>
          <div class="tc-top-center">
            <span class="tc-eyebrow">Starter · Unit 9A</span>
            <span class="tc-title">Travel Conversations</span>
          </div>
          <span style="width:42px"></span>
        </header>
        <div class="tc-body tc-start">
          <div class="tc-hero">🎧</div>
          <h1>4 conversations</h1>
          <div class="tc-how">
            <div class="tc-how-row"><span class="tc-how-num">1</span><span>Play the audio (you can replay anytime)</span></div>
            <div class="tc-how-row"><span class="tc-how-num">2</span><span><strong>Part 1</strong> — complete what they are doing</span></div>
            <div class="tc-how-row"><span class="tc-how-num">3</span><span><strong>Part 2</strong> — choose the correct details</span></div>
            <div class="tc-how-row"><span class="tc-how-num">4</span><span>Next conversation until all 4 are done</span></div>
          </div>
          <button type="button" class="tc-btn" id="tc-start">Start</button>
        </div>`;
      document.getElementById("tc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LASfx) LASfx.win();
      const stars = saveStars();
      const total = totalDoing + totalDetails;
      const got = scoreDoing + scoreDetails;
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: got,
          total: Math.max(total, 1),
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { phase = "menu"; render(); },
          backHref: "../",
          save: false
        });
        // Keep a minimal fallback shell in case overlay is closed
      }
      app.innerHTML = `
        <header class="tc-top">
          <a class="tc-back" href="../" aria-label="Back">←</a>
          <div class="tc-top-center">
            <span class="tc-eyebrow">Finished</span>
            <span class="tc-title">Travel Conversations</span>
          </div>
          <span style="width:42px"></span>
        </header>
        <div class="tc-body tc-done">
          <div class="trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="tc-stars">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <div class="tc-score-card">
            <div class="tc-score-row"><span>What are they doing?</span><strong>${scoreDoing}/${totalDoing}</strong></div>
            <div class="tc-score-row"><span>Details</span><strong>${scoreDetails}/${totalDetails}</strong></div>
            <div class="tc-score-row"><span>Total</span><strong>${got}/${total}</strong></div>
          </div>
          <button type="button" class="tc-btn" id="tc-again">Play again</button>
          <br>
          <button type="button" class="tc-btn secondary" id="tc-menu">Back to menu</button>
        </div>`;
      document.getElementById("tc-again").onclick = startGame;
      document.getElementById("tc-menu").onclick = () => {
        phase = "menu";
        render();
      };
      spawnConfetti();
      return;
    }

    const conv = CONVS[convIndex];
    const progress = `${convIndex + 1} / ${CONVS.length}`;

    if (phase === "listen") {
      app.innerHTML = `
        <header class="tc-top">
          <a class="tc-back" href="../" aria-label="Back">←</a>
          <div class="tc-top-center">
            <span class="tc-eyebrow">${conv.title}</span>
            <span class="tc-title">Listen</span>
          </div>
          <span class="tc-progress">${progress}</span>
        </header>
        <div class="tc-body">
          <span class="tc-phase-pill">Listen carefully</span>
          <div class="tc-dialogue" id="tc-dialogue">${renderDialogue(conv)}</div>
          <div class="tc-play-wrap">
            <button type="button" class="tc-play" id="tc-play" aria-label="Play conversation">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <p class="tc-hint" id="tc-hint">Tap play to hear the conversation.</p>
          </div>
          <div class="tc-actions">
            <button type="button" class="tc-btn" id="tc-continue" ${listenDone ? "" : "disabled"}>Continue →</button>
          </div>
        </div>`;
      document.getElementById("tc-play").onclick = playConversation;
      document.getElementById("tc-continue").onclick = () => {
        if (listenDone) goDoing();
      };
      return;
    }

    if (phase === "doing") {
      const opts = shuffle(conv.doing.options.slice());
      app.innerHTML = `
        <header class="tc-top">
          <a class="tc-back" href="../" aria-label="Back">←</a>
          <div class="tc-top-center">
            <span class="tc-eyebrow">${conv.title} · Part 1</span>
            <span class="tc-title">What are they doing?</span>
          </div>
          <span class="tc-progress">${progress}</span>
        </header>
        <div class="tc-body">
          <section class="tc-section tc-section-audio" aria-label="Audio">
            <p class="tc-section-label">Listen</p>
            ${renderAudioBar(conv)}
            <p class="tc-section-help">Use this button anytime to hear the conversation again.</p>
          </section>
          <section class="tc-section tc-section-task" aria-label="Part 1">
            <p class="tc-section-label">Part 1 · What are they doing?</p>
            <p class="tc-stem">${escapeHtml(conv.doing.prompt)}</p>
            <p class="tc-section-help">Tap the correct ending.</p>
            <div class="tc-choices">
              ${opts
                .map(
                  (o) =>
                    `<button type="button" class="tc-choice" data-opt="${escapeHtml(o)}">${escapeHtml(o)}</button>`
                )
                .join("")}
            </div>
            <p class="tc-hint" id="tc-hint"></p>
          </section>
        </div>`;
      bindAudioBar();
      app.querySelectorAll(".tc-choice").forEach((btn) => {
        btn.onclick = () => pickDoing(btn.dataset.opt);
      });
      return;
    }

    if (phase === "details") {
      const allPicked = detailPicks.every((p) => p !== null);
      app.innerHTML = `
        <header class="tc-top">
          <a class="tc-back" href="../" aria-label="Back">←</a>
          <div class="tc-top-center">
            <span class="tc-eyebrow">${conv.title} · Part 2</span>
            <span class="tc-title">Choose the details</span>
          </div>
          <span class="tc-progress">${progress}</span>
        </header>
        <div class="tc-body">
          <section class="tc-section tc-section-audio" aria-label="Audio">
            <p class="tc-section-label">Listen</p>
            ${renderAudioBar(conv)}
            <p class="tc-section-help">Replay the conversation if you need help.</p>
          </section>
          <section class="tc-section tc-section-task" aria-label="Part 2">
            <p class="tc-section-label">Part 2 · Choose the details</p>
            <p class="tc-section-help">Tap the correct word in each blue pair, then Check.</p>
            <div class="tc-detail">
              <p class="tc-detail-text">${renderDetailSentence(conv)}</p>
            </div>
            <p class="tc-hint" id="tc-hint"></p>
            <div class="tc-actions">
              <button type="button" class="tc-btn" id="tc-check-details" ${allPicked ? "" : "disabled"}>Check</button>
              <button type="button" class="tc-btn secondary hidden" id="tc-next-conv">${
                convIndex + 1 >= CONVS.length ? "Finish" : "Next conversation →"
              }</button>
            </div>
          </section>
        </div>`;
      bindAudioBar();
      app.querySelectorAll(".tc-opt button").forEach((btn) => {
        btn.onclick = () => pickBlank(+btn.dataset.bi, +btn.dataset.ci);
      });
      const checkBtn = document.getElementById("tc-check-details");
      if (checkBtn) checkBtn.onclick = checkDetails;
      const nextBtn = document.getElementById("tc-next-conv");
      if (nextBtn) nextBtn.onclick = nextConvOrDone;
      return;
    }
  }

  render();
})();
