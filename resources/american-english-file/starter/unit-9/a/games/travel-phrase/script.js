/* Travel Phrase Chips – complete the phrase with word chips · Starter 12A */
(function () {
  "use strict";

  const GAME_ID = "starter-9a-travel-phrase-chips";

  const ITEMS = [
    {
      id: "leave-house",
      label: "leave the house",
      chips: ["leave", "the", "house"],
      audio: "audio/leave-the-house.mp3",
      image: "https://cdn.imgurl.ir/uploads/g04403_leave_the_house.png",
    },
    {
      id: "pack-suitcase",
      label: "pack a suitcase",
      chips: ["pack", "a", "suitcase"],
      audio: "audio/pack-a-suitcase.mp3",
      image: "https://cdn.imgurl.ir/uploads/p39229_pack_a_siuitcase.png",
    },
    {
      id: "rent-car",
      label: "rent a car",
      chips: ["rent", "a", "car"],
      audio: "audio/rent-a-car.mp3",
      image: "https://cdn.imgurl.ir/uploads/p927759_rent_a_car.png",
    },
    {
      id: "stay-hotel",
      label: "stay in a hotel",
      chips: ["stay", "in", "a", "hotel"],
      audio: "audio/stay-in-a-hotel.mp3",
      image: "https://cdn.imgurl.ir/uploads/e87389_stay_in_a_hotel.png",
    },
    {
      id: "wait-flight",
      label: "wait for a flight",
      chips: ["wait", "for", "a", "flight"],
      audio: "audio/wait-for-a-flight.mp3",
      image: "https://cdn.imgurl.ir/uploads/v22740_wait_for_a_flight.png",
    },
    {
      id: "wear-sunglasses",
      label: "wear sunglasses",
      chips: ["wear", "sunglasses"],
      audio: "audio/wear-sunglasses.mp3",
      image: "https://cdn.imgurl.ir/uploads/j600481_wear_sungles.png",
    },
    {
      id: "arrive-hotel",
      label: "arrive at a hotel",
      chips: ["arrive", "at", "a", "hotel"],
      audio: "audio/arrive-at-a-hotel.mp3",
      image: "https://cdn.imgurl.ir/uploads/c880373_arrive_at_a_hotel.png",
    },
    {
      id: "book-tickets",
      label: "book tickets",
      chips: ["book", "tickets"],
      audio: "audio/book-tickets.mp3",
      image: "https://cdn.imgurl.ir/uploads/g8412_book_tickets.png",
    },
    {
      id: "buy-presents",
      label: "buy presents",
      chips: ["buy", "presents"],
      audio: "audio/buy-presents.mp3",
      image: "https://cdn.imgurl.ir/uploads/h82868_buy_presents.png",
    },
    {
      id: "call-home",
      label: "call home",
      chips: ["call", "home"],
      audio: "audio/call-home.mp3",
      image: "https://cdn.imgurl.ir/uploads/t810563_call_home.png",
    },
    {
      id: "carry-suitcase",
      label: "carry a suitcase",
      chips: ["carry", "a", "suitcase"],
      audio: "audio/carry-a-suitcase.mp3",
      image: "https://cdn.imgurl.ir/uploads/u551356_carry_a_suitcase.png",
    },
    {
      id: "get-taxi",
      label: "get a taxi",
      chips: ["get", "a", "taxi"],
      audio: "audio/get-a-taxi.mp3",
      image: "https://cdn.imgurl.ir/uploads/m22232_get_in_a_taxi.png",
    },
  ];

  // Extra distractor words mixed into the bank
  const DISTRACTORS = [
    "go", "take", "buy", "the", "a", "to", "for", "in", "at", "on",
    "plane", "bag", "ticket", "room", "drive", "put", "my",
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | feedback | done
  let order = [];
  let index = 0;
  let score = 0;          // correct count
  let points = 0;         // total points
  let streak = 0;
  let bestStreak = 0;
  let attempts = 0;       // attempts on current item
  let bank = []; // { word, used }
  let answer = []; // selected words in order
  let locked = false;
  let currentAudio = null;
  let lastGained = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio = null;
      } catch (_) {}
    }
    app.querySelectorAll(".tpc-audio-btn.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playItemAudio(item, btn) {
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function currentItem() {
    return ITEMS[order[index]];
  }

  function buildBank(item) {
    const needed = item.chips.slice();
    // add 2–3 distractors not already in the phrase
    const extraPool = DISTRACTORS.filter(
      (w) => !needed.map((x) => x.toLowerCase()).includes(w.toLowerCase())
    );
    const extras = shuffle(extraPool).slice(0, Math.min(3, Math.max(2, 5 - needed.length)));
    const words = shuffle(needed.concat(extras));
    bank = words.map((w) => ({ word: w, used: false }));
    answer = [];
  }

  function startGame() {
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    score = 0;
    points = 0;
    streak = 0;
    bestStreak = 0;
    attempts = 0;
    locked = false;
    phase = "play";
    buildBank(currentItem());
    render();
  }

  function addChip(bankIndex) {
    if (locked || bank[bankIndex].used) return;
    bank[bankIndex].used = true;
    answer.push({ word: bank[bankIndex].word, bankIndex });
    renderPlay(false);
  }

  function removeChip(answerIndex) {
    if (locked) return;
    const entry = answer[answerIndex];
    if (!entry) return;
    bank[entry.bankIndex].used = false;
    answer.splice(answerIndex, 1);
    renderPlay(false);
  }

  function clearAnswer() {
    if (locked) return;
    answer.forEach((e) => {
      bank[e.bankIndex].used = false;
    });
    answer = [];
    renderPlay(false);
  }


  const PARTICLE_COLORS = ["#34d399", "#6366f1", "#fbbf24", "#38bdf8", "#a78bfa", "#f472b6", "#fde68a"];

  function spawnParticles(el, opts) {
    if (!el) return;
    const { count = 12, kind = "dot", spread = 50, duration = 700 } = opts || {};
    const rect = el.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const layer = document.createElement("div");
    layer.className = "tpc-particle-layer";
    document.body.appendChild(layer);
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "tpc-particle tpc-particle--" + kind;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const dist = spread * (0.4 + Math.random() * 0.75);
      const size = kind === "star" ? 11 + Math.random() * 8 : kind === "ring" ? 16 + Math.random() * 10 : 5 + Math.random() * 7;
      p.style.left = originX + "px";
      p.style.top = originY + "px";
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", (Math.sin(angle) * dist - (kind === "star" ? 14 : 0)) + "px");
      p.style.setProperty("--size", size + "px");
      p.style.setProperty("--rot", Math.random() * 360 + "deg");
      p.style.setProperty("--delay", Math.random() * 0.08 + "s");
      p.style.setProperty("--dur", 0.45 + Math.random() * 0.4 + "s");
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      if (kind === "star") p.textContent = "✦";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), duration + 250);
  }

  function spawnCorrectFX() {
    const box = document.getElementById("tpc-answer") || app.querySelector(".tpc-pic-card");
    if (!box) return;
    spawnParticles(box, { count: 14, kind: "star", spread: 80, duration: 900 });
    spawnParticles(box, { count: 10, kind: "dot", spread: 55, duration: 700 });
    spawnParticles(box, { count: 5, kind: "ring", spread: 30, duration: 600 });
    const flash = document.createElement("div");
    flash.className = "tpc-match-flash";
    app.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function shakeScreen(ms) {
    const el = app;
    if (!el) return;
    el.classList.remove("tpc-screen-shake");
    void el.offsetWidth;
    el.classList.add("tpc-screen-shake");
    setTimeout(() => el.classList.remove("tpc-screen-shake"), ms || 420);
  }

  function spawnWrongFX() {
    const box = document.getElementById("tpc-answer");
    if (!box) return;
    spawnParticles(box, { count: 9, kind: "dot", spread: 42, duration: 550 });
  }

  function checkAnswer() {
    if (locked) return;
    const item = currentItem();
    if (answer.length === 0) return;

    const built = answer.map((e) => e.word).join(" ").toLowerCase();
    const target = item.chips.join(" ").toLowerCase();
    const ok = built === target;

    locked = true;
    phase = "feedback";

    if (ok) {
      score += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      // 100 base, +20 per streak level (cap +100), first-try bonus +50
      let gained = 100 + Math.min(100, (streak - 1) * 20);
      if (attempts === 0) gained += 50;
      points += gained;
      lastGained = gained;
      renderPlay(true, true);
      requestAnimationFrame(() => spawnCorrectFX());
      setTimeout(() => {
        const btn = app.querySelector(".tpc-audio-btn");
        playItemAudio(item, btn);
      }, 280);
    } else {
      attempts += 1;
      streak = 0;
      lastGained = 0;
      renderPlay(true, false);
      requestAnimationFrame(() => {
        spawnWrongFX();
        shakeScreen(420);
      });
      setTimeout(() => {
        locked = false;
        phase = "play";
        answer.forEach((e) => {
          bank[e.bankIndex].used = false;
        });
        answer = [];
        renderPlay(false);
      }, 900);
    }
  }

  function nextItem() {
    stopAudio();
    locked = false;
    attempts = 0;
    lastGained = 0;
    index += 1;
    if (index >= order.length) {
      phase = "done";
      render();
      return;
    }
    phase = "play";
    buildBank(currentItem());
    render();
  }

  function saveStars() {
    const acc = order.length ? Math.round((score / order.length) * 100) : 0;
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    return stars;
  }


  function spawnFinishFX(stars) {
    const wrap = document.createElement("div");
    wrap.className = "tpc-confetti";
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#38bdf8", "#a78bfa", "#fde68a"];
    const n = stars >= 3 ? 48 : stars >= 1 ? 32 : 16;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      if (i % 4 === 0) {
        p.className = "is-star";
        p.textContent = "✦";
      }
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.85 + "s";
      p.style.animationDuration = 1.4 + Math.random() * 1.3 + "s";
      p.style.setProperty("--drift", (Math.random() * 90 - 45) + "px");
      p.style.setProperty("--spin", (360 + Math.random() * 720) + "deg");
      wrap.appendChild(p);
    }
    const burst = document.createElement("div");
    burst.className = "tpc-finish-burst";
    wrap.appendChild(burst);
    app.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3200);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="tpc-top">
          <a class="tpc-back" href="../" aria-label="Back">←</a>
          <div class="tpc-top-center">
            <span class="tpc-eyebrow">Starter · Unit 9A</span>
            <span class="tpc-title">Travel Phrases</span>
          </div>
          <span style="width:42px"></span>
        </header>
        <div class="tpc-body tpc-start">
          <div class="tpc-hero">🧩</div>
          <h1>Complete the phrase</h1>
          <p>Look at the picture. Tap the chips in order to build the travel phrase. Then listen!</p>
          <button type="button" class="tpc-btn" id="tpc-start">Start · 12 phrases</button>
        </div>`;
      document.getElementById("tpc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const acc = order.length ? Math.round((score / order.length) * 100) : 0;
      app.innerHTML = `
        <header class="tpc-top">
          <a class="tpc-back" href="../" aria-label="Back">←</a>
          <div class="tpc-top-center">
            <span class="tpc-eyebrow">Finished</span>
            <span class="tpc-title">Travel Phrases</span>
          </div>
          <span style="width:42px"></span>
        </header>
        <div class="tpc-body tpc-done">
          <div class="trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="tpc-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <div class="tpc-score-card">
            <div class="tpc-score-row"><span>Score</span><strong>${points}</strong></div>
            <div class="tpc-score-row"><span>Correct</span><strong>${score} / ${order.length}</strong></div>
            <div class="tpc-score-row"><span>Accuracy</span><strong>${acc}%</strong></div>
            <div class="tpc-score-row"><span>Best streak</span><strong>${bestStreak}×</strong></div>
          </div>
          <button type="button" class="tpc-btn" id="tpc-again">Play again</button>
          <br>
          <button type="button" class="tpc-btn secondary" id="tpc-menu">Back to menu</button>
        </div>`;
      document.getElementById("tpc-again").onclick = startGame;
      document.getElementById("tpc-menu").onclick = () => {
        phase = "menu";
        render();
      };
      spawnFinishFX(stars);
      return;
    }

    // play / feedback
    renderPlay(phase === "feedback", phase === "feedback" ? null : null);
  }

  function renderPlay(isFeedback, wasCorrect) {
    const item = currentItem();
    const progress = `${index + 1} / ${order.length}`;
    const builtOk = wasCorrect === true;
    const builtBad = wasCorrect === false;

    let answerHTML;
    if (answer.length === 0) {
      answerHTML = item.chips.map(() => `<span class="tpc-slot"></span>`).join("");
    } else {
      answerHTML = answer
        .map(
          (e, i) =>
            `<button type="button" class="tpc-answer-chip" data-ai="${i}">${e.word}</button>`
        )
        .join("");
    }

    const bankHTML = bank
      .map(
        (b, i) =>
          `<button type="button" class="tpc-chip${b.used ? " used" : ""}" data-bi="${i}" ${
            b.used || locked ? "disabled" : ""
          }>${b.word}</button>`
      )
      .join("");

    let actionsHTML = "";
    let hintText = "Tap the chips to complete the phrase.";
    let hintClass = "tpc-hint";

    if (isFeedback && builtOk) {
      hintText = lastGained > 0
        ? `Correct! +${lastGained} pts — listen to the phrase.`
        : "Correct! Listen to the phrase.";
      hintClass = "tpc-hint ok";
      actionsHTML = `
        <div class="tpc-listen-wrap">
          <button type="button" class="tpc-audio-btn" id="tpc-replay" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <span class="tpc-hint ok">${item.label}</span>
        </div>
        <div class="tpc-actions">
          <button type="button" class="tpc-btn" id="tpc-next">${
            index + 1 >= order.length ? "Finish" : "Next →"
          }</button>
        </div>`;
    } else if (isFeedback && builtBad) {
      hintText = "Not quite — try again.";
      hintClass = "tpc-hint bad";
      actionsHTML = "";
    } else {
      actionsHTML = `
        <div class="tpc-actions">
          <button type="button" class="tpc-btn secondary" id="tpc-clear" ${
            answer.length === 0 ? "disabled" : ""
          }>Clear</button>
          <button type="button" class="tpc-btn" id="tpc-check" ${
            answer.length === 0 ? "disabled" : ""
          }>Check</button>
        </div>`;
    }

    const streakLabel = streak > 1 ? ` · ${streak}×` : "";
    const pointsLabel = points > 0 ? points : "0";
    app.innerHTML = `
      <header class="tpc-top">
        <a class="tpc-back" href="../" aria-label="Back">←</a>
        <div class="tpc-top-center">
          <span class="tpc-eyebrow">Complete the phrase</span>
          <span class="tpc-title">Travel Phrases</span>
        </div>
        <div class="tpc-hud">
          <span class="tpc-progress">${progress}</span>
          <span class="tpc-score-pill" title="Score">${pointsLabel} pts${streakLabel}</span>
        </div>
      </header>
      <div class="tpc-body">
        <div class="tpc-pic-card">
          <img src="${item.image}" alt="" draggable="false">
        </div>
        <div class="tpc-answer${builtOk ? " is-ok" : ""}${builtBad ? " is-bad" : ""}" id="tpc-answer">
          ${answerHTML}
        </div>
        <p class="${hintClass}" id="tpc-hint">${hintText}</p>
        ${
          isFeedback && builtOk
            ? ""
            : `<div class="tpc-bank">${bankHTML}</div>`
        }
        ${actionsHTML}
      </div>`;

    // events
    if (!isFeedback || builtBad === false) {
      app.querySelectorAll(".tpc-chip:not(.used)").forEach((btn) => {
        btn.onclick = () => addChip(+btn.dataset.bi);
      });
      app.querySelectorAll(".tpc-answer-chip").forEach((btn) => {
        btn.onclick = () => removeChip(+btn.dataset.ai);
      });
      const clearBtn = document.getElementById("tpc-clear");
      if (clearBtn) clearBtn.onclick = clearAnswer;
      const checkBtn = document.getElementById("tpc-check");
      if (checkBtn) checkBtn.onclick = checkAnswer;
    }

    if (builtOk) {
      const replay = document.getElementById("tpc-replay");
      if (replay) {
        replay.onclick = () => playItemAudio(item, replay);
      }
      const next = document.getElementById("tpc-next");
      if (next) next.onclick = nextItem;
    }
  }

  render();
})();
