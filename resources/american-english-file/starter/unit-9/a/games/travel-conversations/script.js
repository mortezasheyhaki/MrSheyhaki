/* Travel Conversations – 4 dialogues · Part A: what are they doing? · Part B: choose details */
(function () {
  "use strict";

  const GAME_ID = "starter-12a-travel-conversations";

  const CONVS = [
    {
      id: 1,
      title: "Conversation 1",
      audio: "https://cdn.imgurl.ir/uploads/v801486_conversation_1.mp3",
      lines: [
        { who: "W", text: "Oh look! An LA Galaxy shirt. It's perfect for Henry!" },
        { who: "M", text: "Yes, good idea. Oh… it's very expensive." },
        { who: "W", text: "Soccer shirts are always expensive. OK. What can we get for Jessica?" },
        { who: "M", text: "She likes soccer, too." },
        { who: "W", text: "Yeah, but she never wears soccer shirts. What about this bag?" },
        { who: "M", text: "I don't know. Does she like bags?" },
        { who: "W", text: "She loves bags…" },
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
      audio: "https://cdn.imgurl.ir/uploads/b0219_conversation_2.mp3",
      lines: [
        { who: "W", text: "Emilio, do we need swimming things?" },
        { who: "M", text: "I can look at their website. Can you see my camera?" },
        { who: "W", text: "Yes, here it is. Do you want me to put the camera in the suitcase or in your bag?" },
        { who: "M", text: "In the suitcase, please. OK, here's the page. Yes, it has a swimming pool." },
        { who: "W", text: "Great." },
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
      audio: "https://cdn.imgurl.ir/uploads/n458685_conversation_3.mp3",
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
      audio: "https://cdn.imgurl.ir/uploads/f632670_conversation_4.mp3",
      lines: [
        { who: "M", text: "Is that a number 13?" },
        { who: "W", text: "Yes. I think it is. No, it's a 23." },
        { who: "M", text: "Another 23? I don't believe it! That's the third one. And no 13…" },
        { who: "W", text: "Another one's coming now. Let's see. Yes. That's a 13." },
        { who: "M", text: "At last." },
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

  const canSpeak = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);

  // phase: menu | listen | doing | details | done
  let phase = "menu";
  let convIndex = 0;
  let scoreDoing = 0;
  let scoreDetails = 0;
  let totalDoing = CONVS.length;
  let totalDetails = CONVS.reduce((n, c) => n + c.details.blanks.length, 0);
  let detailPicks = []; // selected choice index per blank
  let speaking = false;
  let lineIndex = -1;
  let listenDone = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopSpeak() {
    speaking = false;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (_) {}
    lineIndex = -1;
    const btn = document.getElementById("tc-play");
    if (btn) btn.classList.remove("playing");
    app.querySelectorAll(".tc-line").forEach((el) => el.classList.remove("active"));
  }

  function getVoice(preferFemale) {
    const voices = window.speechSynthesis.getVoices() || [];
    const en = voices.filter((v) => /en[-_]?US|en[-_]?GB|English/i.test(v.lang + v.name));
    const pool = en.length ? en : voices;
    if (!pool.length) return null;
    if (preferFemale) {
      const f = pool.find((v) => /female|samantha|victoria|zira|karen|moira/i.test(v.name));
      if (f) return f;
    } else {
      const m = pool.find((v) => /male|david|daniel|alex|fred|tom/i.test(v.name));
      if (m) return m;
    }
    return pool[preferFemale ? 0 : Math.min(1, pool.length - 1)];
  }

  let currentAudio = null;

  function stopAudioFile() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ""; } catch (_) {}
      currentAudio = null;
    }
  }

  function playConversation() {
    const conv = CONVS[convIndex];
    const btn = document.getElementById("tc-play");
    const cont = document.getElementById("tc-continue");
    const hint = document.getElementById("tc-hint");

    // Prefer real MP3 when available
    if (conv.audio) {
      stopSpeak();
      // Toggle: if already playing this file, stop
      if (currentAudio && !currentAudio.paused && currentAudio.dataset && currentAudio.dataset.conv === String(conv.id)) {
        stopAudioFile();
        if (btn) btn.classList.remove("playing");
        if (hint) {
          hint.textContent = "Paused. Tap to play again.";
          hint.className = "tc-hint";
        }
        return;
      }
      stopAudioFile();
      listenDone = false;
      if (cont) cont.disabled = true;
      if (btn) btn.classList.add("playing");
      if (hint) {
        hint.textContent = "Listening…";
        hint.className = "tc-hint";
      }
      app.querySelectorAll(".tc-line").forEach((el) => el.classList.add("active"));

      const url = conv.audio + (conv.audio.includes("?") ? "&" : "?") + "v=2";
      const a = new Audio();
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      a.dataset.conv = String(conv.id);
      currentAudio = a;
      a.onended = () => {
        currentAudio = null;
        if (btn) btn.classList.remove("playing");
        listenDone = true;
        if (cont) cont.disabled = false;
        if (hint) {
          hint.textContent = "Done. Tap play to listen again.";
          hint.className = "tc-hint ok";
        }
      };
      a.onerror = () => {
        currentAudio = null;
        if (btn) btn.classList.remove("playing");
        if (hint) {
          hint.textContent = "Could not load audio. Trying voice…";
          hint.className = "tc-hint bad";
        }
        playConversationTTS();
      };
      a.src = url;
      const p = a.play();
      if (p && p.catch) {
        p.catch(() => {
          if (btn) btn.classList.remove("playing");
          if (hint) {
            hint.textContent = "Tap again to play (browser blocked autoplay).";
            hint.className = "tc-hint";
          }
        });
      }
      return;
    }

    playConversationTTS();
  }

  function playConversationTTS() {
    if (!canSpeak) {
      listenDone = true;
      const hint = document.getElementById("tc-hint");
      if (hint) {
        hint.textContent = "Audio not available — read the dialogue, then continue.";
        hint.className = "tc-hint";
      }
      const cont = document.getElementById("tc-continue");
      if (cont) cont.disabled = false;
      app.querySelectorAll(".tc-line").forEach((el) => el.classList.add("active"));
      return;
    }

    stopSpeak();
    stopAudioFile();
    const conv = CONVS[convIndex];
    const btn = document.getElementById("tc-play");
    if (btn) btn.classList.add("playing");
    speaking = true;
    listenDone = false;
    const cont = document.getElementById("tc-continue");
    if (cont) cont.disabled = true;

    let i = 0;
    function nextLine() {
      if (!speaking || i >= conv.lines.length) {
        speaking = false;
        if (btn) btn.classList.remove("playing");
        listenDone = true;
        app.querySelectorAll(".tc-line").forEach((el) => el.classList.remove("active"));
        if (cont) cont.disabled = false;
        const hint = document.getElementById("tc-hint");
        if (hint) {
          hint.textContent = "Done. Continue to the questions.";
          hint.className = "tc-hint ok";
        }
        return;
      }
      lineIndex = i;
      app.querySelectorAll(".tc-line").forEach((el, idx) => {
        el.classList.toggle("active", idx === i);
        if (idx === i) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      const line = conv.lines[i];
      const u = new SpeechSynthesisUtterance(line.text);
      u.rate = 0.95;
      u.pitch = line.who === "W" ? 1.15 : 0.9;
      const voice = getVoice(line.who === "W");
      if (voice) u.voice = voice;
      u.onend = () => {
        i += 1;
        setTimeout(nextLine, 280);
      };
      u.onerror = () => {
        i += 1;
        setTimeout(nextLine, 100);
      };
      window.speechSynthesis.speak(u);
    }
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        nextLine();
      };
      setTimeout(nextLine, 400);
    } else {
      nextLine();
    }
  }

  function startGame() {
    stopSpeak();
    stopAudioFile();
    convIndex = 0;
    scoreDoing = 0;
    scoreDetails = 0;
    detailPicks = [];
    listenDone = true;
    phase = "doing";
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
          <span>Tap to listen anytime</span>
        </div>
      </div>`;
  }

  function bindAudioBar() {
    const play = document.getElementById("tc-play");
    if (play) play.onclick = playConversation;
  }

  function goDoing() {
    stopSpeak();
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
    stopSpeak();
    stopAudioFile();
    convIndex += 1;
    if (convIndex >= CONVS.length) {
      phase = "done";
      render();
      return;
    }
    listenDone = true;
    phase = "doing";
    render();
  }

  function pickDoing(opt) {
    if (phase !== "doing") return;
    const conv = CONVS[convIndex];
    const ok = opt === conv.doing.correct;
    if (ok) scoreDoing += 1;
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
    setTimeout(goDetails, ok ? 900 : 1400);
  }

  function pickBlank(bi, ci) {
    if (phase !== "details") return;
    detailPicks[bi] = ci;
    renderDetailsOnly();
  }

  function checkDetails() {
    const conv = CONVS[convIndex];
    if (detailPicks.some((p) => p === null)) return;
    let allOk = true;
    conv.details.blanks.forEach((b, i) => {
      const ok = detailPicks[i] === b.correct;
      if (ok) scoreDetails += 1;
      else allOk = false;
    });
    // lock UI
    app.querySelectorAll(".tc-opt button").forEach((btn) => {
      btn.disabled = true;
      const bi = +btn.dataset.bi;
      const ci = +btn.dataset.ci;
      if (ci === conv.details.blanks[bi].correct) btn.classList.add("is-correct");
      else if (detailPicks[bi] === ci) btn.classList.add("is-wrong");
    });
    const hint = document.getElementById("tc-hint");
    if (hint) {
      hint.textContent = allOk ? "Perfect!" : "Check the green answers.";
      hint.className = "tc-hint " + (allOk ? "ok" : "bad");
    }
    const nextBtn = document.getElementById("tc-next-conv");
    if (nextBtn) nextBtn.classList.remove("hidden");
    // auto-advance to next conversation
    setTimeout(() => nextConvOrDone(), allOk ? 1000 : 1600);
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
            <span class="tc-eyebrow">Starter · Unit 12A</span>
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
      const stars = saveStars();
      const total = totalDoing + totalDetails;
      const got = scoreDoing + scoreDetails;
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
        if (listenDone || !canSpeak) goDoing();
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

  // pre-load voices
  if (canSpeak) {
    try {
      window.speechSynthesis.getVoices();
    } catch (_) {}
  }

  render();
})();
