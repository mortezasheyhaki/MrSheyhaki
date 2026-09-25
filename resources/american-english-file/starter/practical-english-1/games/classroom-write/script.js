/* Classroom Write – 2 parts · PE1
   Part 1: Listen & Write
   Part 2: Look & Write (pictures)
*/
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


  const GAME_ID = "starter-pe1-classroom-write";

  const ITEMS = [
    { id: "bag",        label: "a bag",            audio: "https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3",            image: "https://cdn.imgurl.ir/uploads/q131373_a-bag.png",
      answers: ["a bag", "bag"] },
    { id: "pen",        label: "a pen",            audio: "https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3",            image: "https://cdn.imgurl.ir/uploads/t81465_a-pen.png",
      answers: ["a pen", "pen"] },
    { id: "paper",      label: "a piece of paper", audio: "https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3", image: "https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png",
      answers: ["a piece of paper", "piece of paper", "paper"] },
    { id: "dictionary", label: "a dictionary",     audio: "https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3",     image: "https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png",
      answers: ["a dictionary", "dictionary"] },
    { id: "laptop",     label: "a laptop",         audio: "https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3",         image: "https://cdn.imgurl.ir/uploads/w410273_a-laptop.png",
      answers: ["a laptop", "laptop"] },
    { id: "table",      label: "a table",          audio: "https://cdn.imgurl.ir/uploads/d742794_a-table.mp3",          image: "https://cdn.imgurl.ir/uploads/a696837_a-table.png",
      answers: ["a table", "table"] },
    { id: "chair",      label: "a chair",          audio: "https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3",          image: "https://cdn.imgurl.ir/uploads/t901556_a-chair.png",
      answers: ["a chair", "chair"] },
    { id: "window",     label: "a window",         audio: "https://cdn.imgurl.ir/uploads/l543208_a-window.mp3",         image: "https://cdn.imgurl.ir/uploads/c480039_a-window.png",
      answers: ["a window", "window"] },
    { id: "door",       label: "the door",         audio: "https://cdn.imgurl.ir/uploads/g92275_the-door.mp3",         image: "https://cdn.imgurl.ir/uploads/o763819_the-door.png",
      answers: ["the door", "door", "a door"] },
    { id: "board",      label: "the board",        audio: "https://cdn.imgurl.ir/uploads/i034259_the-board.mp3",        image: "https://cdn.imgurl.ir/uploads/v58413_the-board.png",
      answers: ["the board", "board", "a board", "whiteboard", "the whiteboard", "a whiteboard"] },
  ];

  const PARTS = [
    { id: "listen", title: "Listen & Write", tip: "Listen, then type the word.", icon: "🎧" },
    { id: "look",   title: "Look & Write",   tip: "Look at the picture, then type the name.", icon: "🖼️" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | feedback | done
  let partIndex = 0;  // 0 = listen, 1 = look
  let order = [];
  let index = 0;
  let correctCount = 0;
  let partCorrect = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[’']/g, "'");
  }

  // Strip leading a / an / the so "a door" matches "the door"
  function core(str) {
    return normalize(str).replace(/^(a|an|the)\s+/, "");
  }

  function isCorrect(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    // exact match against any accepted answer
    if (item.answers.some((a) => normalize(a) === n)) return true;
    // article-flexible match (a/the/bare noun)
    const userCore = core(userInput);
    if (!userCore) return false;
    return item.answers.some((a) => core(a) === userCore);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".cw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function spawnSparks(el) {
    if (!el) return;
    el.classList.add("cw-spark-host");
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "cw-spark";
      const angle = (i / 10) * Math.PI * 2;
      const dist = 32 + Math.random() * 22;
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      s.style.setProperty("--delay", (i * 0.02) + "s");
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
    setTimeout(() => el.classList.remove("cw-spark-host"), 600);
  }

  function playAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".cw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startPart(pi) {
    partIndex = pi;
    order = shuffle(ITEMS);
    index = 0;
    partCorrect = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();;
    render();
    if (PARTS[partIndex].id === "listen") {
      setTimeout(playAudio, 350);
    }
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("cw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrect(lastUserInput, item);
    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      partCorrect += 1;
      correctCount += 1;
    }
    answered = true;
    stopAudio();
    // brief input flash before feedback
    if (input) {
      input.classList.add(lastCorrect ? "cw-ok" : "cw-bad");
      input.blur();
    }
    const checkBtn = document.getElementById("cw-check");
    if (checkBtn) checkBtn.disabled = true;

    // Play the word audio after a correct answer (Listen & Write + Look & Write)
    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      setTimeout(playAudio, 120);
    }

    setTimeout(() => {
      phase = "feedback";
      render();
    }, lastCorrect ? 280 : 380);
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    stopAudio();
    render();
  }

  function nextItem() {
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      if (PARTS[partIndex].id === "listen") {
        setTimeout(playAudio, 300);
      }
    } else {
      // finished this part
      if (partIndex === 0) {
        // offer part 2 or results
        phase = "part-done";
        render();
      } else {
        phase = "done";
        render();
      }
    }
  }

  function calcStars() {
    // total possible = 20 (10 + 10) if both parts played; use correctCount
    const total = ITEMS.length * (partIndex + 1); // approximate
    const n = correctCount;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
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

  function render() {
    const part = PARTS[partIndex];

    if (phase === "menu") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="../" aria-label="Back">←</a>
          <span class="cw-title">Classroom Write</span>
          <span class="cw-badge">PE1</span>
        </header>
        <section class="cw-start">
          <div class="cw-hero" aria-hidden="true">✍️</div>
          <h1>Classroom Write</h1>
          <p class="cw-desc">2 parts · 10 classroom objects</p>
          <div class="cw-part-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="cw-part-card" data-part="${i}">
                <span class="cw-part-num">${i + 1}</span>
                <div>
                  <strong>${p.icon} ${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
          <button type="button" class="cw-btn" id="cw-both">Play both parts →</button>
        </section>`;
      app.querySelectorAll(".cw-part-card").forEach((btn) => {
        btn.onclick = () => {
          correctCount = 0;
          startPart(+btn.dataset.part);
        };
      });
      document.getElementById("cw-both").onclick = () => {
        correctCount = 0;
        startPart(0);
      };
      return;
    }

    if (phase === "part-done") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="../" aria-label="Back">←</a>
          <span class="cw-title">${part.title}</span>
          <span class="cw-badge">Part 1 ✓</span>
        </header>
        <section class="cw-done">
          <div class="cw-trophy">👍</div>
          <h1>Part 1 complete!</h1>
          <p>You got <strong>${partCorrect} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="cw-btn" id="cw-part2">Continue to Part 2 →</button>
          <button type="button" class="cw-btn secondary" id="cw-menu">All parts</button>
        </section>`;
      document.getElementById("cw-part2").onclick = () => startPart(1);
      document.getElementById("cw-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === "function" ? saveStars() : 3;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: typeof correctCount !== "undefined" ? correctCount : stars,
          total: typeof ITEMS !== "undefined" ? ITEMS.length : (typeof order !== "undefined" ? order.length : 10),
          stars: stars,
          timeMs: timeMs,
          onAgain: typeof startGame === "function" ? startGame : () => { phase = "start"; render(); },
          onModes: () => { phase = "start"; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="cw-again">Again</button>`;
      document.getElementById("cw-again").onclick = () => { phase = "start"; render(); };
      return;
    }

    const item = order[index];
    const progress = `${index + 1} / ${order.length}`;
    const isListen = part.id === "listen";

    if (phase === "play") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="#" id="cw-back" aria-label="Back">←</a>
          <span class="cw-title">${part.title}</span>
          <span class="cw-progress">${progress}</span>
        </header>
        <div class="cw-bar"><div class="cw-bar-fill" style="width:${((index) / order.length) * 100}%"></div></div>
        <p class="cw-instruction">${part.tip}</p>
        <section class="cw-play-area">
          ${isListen ? `
            <button type="button" class="cw-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
          ` : `
            <div class="cw-pic-wrap">
              <img class="cw-pic" src="${item.image}" alt="Classroom object" draggable="false">
            </div>
          `}
          <div class="cw-input-wrap">
            <input type="text" id="cw-input" class="cw-input"
              placeholder="${isListen ? "Type what you hear…" : "Type the name…"}"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
          </div>
          <div class="cw-actions">
            <button type="button" class="cw-btn" id="cw-check" disabled>Check</button>
            <button type="button" class="cw-skip" id="cw-skip">Skip →</button>
          </div>
        </section>`;

      document.getElementById("cw-back").onclick = (e) => {
        e.preventDefault();
        stopAudio();
        phase = "menu";
        render();
      };
      if (isListen) {
        app.querySelector(".cw-play").onclick = playAudio;
      }
      const input = document.getElementById("cw-input");
      const checkBtn = document.getElementById("cw-check");
      input.focus();
      checkBtn.onclick = checkAnswer;
      document.getElementById("cw-skip").onclick = skipAnswer;
      const sync = () => { checkBtn.disabled = !input.value.trim(); };
      input.addEventListener("input", sync);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkAnswer();
      });
      return;
    }

    // feedback
    app.innerHTML = `
      <header class="cw-topbar">
        <a class="cw-back" href="#" id="cw-back" aria-label="Back">←</a>
        <span class="cw-title">${part.title}</span>
        <span class="cw-progress">${progress}</span>
      </header>
      <div class="cw-bar"><div class="cw-bar-fill" style="width:${((index + 1) / order.length) * 100}%"></div></div>
      <section class="cw-feedback ${lastCorrect ? "is-correct" : lastSkipped ? "is-skip" : "is-wrong"}">
        <div class="cw-result-icon">${lastCorrect ? "✅" : lastSkipped ? "⏭️" : "❌"}</div>
        <h2>${lastCorrect ? "Correct!" : lastSkipped ? "Skipped" : "Not quite"}</h2>
        <div class="cw-answer-card">
          <img class="cw-answer-img" src="${item.image}" alt="${item.label}">
          <strong>${item.label}</strong>
        </div>
        ${!lastCorrect && !lastSkipped ? `<p class="cw-your">You wrote: <em>${(lastUserInput || "—").trim() || "—"}</em></p>` : ""}
        <button type="button" class="cw-btn" id="cw-next">${index < order.length - 1 ? "Next →" : (partIndex === 0 ? "Finish Part 1 →" : "See results →")}</button>
      </section>`;
    document.getElementById("cw-back").onclick = (e) => {
      e.preventDefault();
      stopAudio();
      phase = "menu";
      render();
    };
    const nextBtn = document.getElementById("cw-next");
    nextBtn.onclick = nextItem;
    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      const card = app.querySelector(".cw-answer-card");
      setTimeout(() => spawnSparks(card), 80);
      // Auto-advance after a short celebration
      nextBtn.textContent = "Next →";
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.6";
      setTimeout(() => {
        nextItem();
      }, 1100);
    }
  }

  render();
})();
