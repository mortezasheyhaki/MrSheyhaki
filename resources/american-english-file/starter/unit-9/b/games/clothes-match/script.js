/* Clothes Match – 3 modes × 4 sets of 4 pairs – AEF Starter Unit 9B */
(function () {
  const GAME_ID = "starter-9b-clothes-match";

  const COUNTRIES = [
    { id: "cap", label: "cap", flag: "🧢", audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3", image: "https://cdn.imgurl.ir/uploads/b4742_cap.png" },
    { id: "coat", label: "coat", flag: "🧥", audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3", image: "https://cdn.imgurl.ir/uploads/w043594_coat.png" },
    { id: "dress", label: "dress", flag: "👗", audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3", image: "https://cdn.imgurl.ir/uploads/d995053_dress.png" },
    { id: "hat", label: "hat", flag: "🎩", audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3", image: "https://cdn.imgurl.ir/uploads/o3351_hat.png" },
    { id: "jacket", label: "jacket", flag: "🧥", audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3", image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png" },
    { id: "jeans", label: "jeans", flag: "👖", audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3", image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png" },
    { id: "pants", label: "pants", flag: "👖", audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3", image: "https://cdn.imgurl.ir/uploads/i04627_pants.png" },
    { id: "shirt", label: "shirt", flag: "👔", audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3", image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png" },
    { id: "shoes", label: "shoes", flag: "👞", audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3", image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png" },
    { id: "shorts", label: "shorts", flag: "🩳", audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3", image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png" },
    { id: "skirt", label: "skirt", flag: "👗", audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3", image: "https://cdn.imgurl.ir/uploads/a444189_st.png" },
    { id: "sneakers", label: "sneakers", flag: "👟", audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3", image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png" },
    { id: "socks", label: "socks", flag: "🧦", audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3", image: "https://cdn.imgurl.ir/uploads/k600200_socks.png" },
    { id: "suit", label: "suit", flag: "🤵", audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3", image: "https://cdn.imgurl.ir/uploads/e98017_suit.png" },
    { id: "sweater", label: "sweater", flag: "🧶", audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3", image: "https://cdn.imgurl.ir/uploads/x441494_swer.png" },
    { id: "t-shirt", label: "T-shirt", flag: "👕", audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3", image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png" },
  ];

  // 4 fixed sets of 4 (covers all 16 clothes)
  const SETS = [
    ["cap", "coat", "dress", "hat"],
    ["jacket", "jeans", "pants", "shirt"],
    ["shoes", "shorts", "skirt", "sneakers"],
    ["socks", "suit", "sweater", "t-shirt"],
  ];


  /* ---------- sound effects (Web Audio, no files) ---------- */
  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function sfxTone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function sfxCorrect() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.11);
    sfxTone(659.25, t + 0.08, 0.12, "triangle", 0.11);
    sfxTone(783.99, t + 0.16, 0.18, "sine", 0.1);
  }
  function sfxWrong() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(220, t, 0.14, "sawtooth", 0.06, 140);
    sfxTone(180, t + 0.06, 0.16, "triangle", 0.05, 120);
  }
  function sfxSelect() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(640, ctx.currentTime, 0.06, "sine", 0.05);
  }
  function sfxSetComplete() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.12, "triangle", 0.1);
    sfxTone(659.25, t + 0.1, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.2, 0.14, "triangle", 0.11);
    sfxTone(1046.5, t + 0.34, 0.28, "sine", 0.09);
  }
  function sfxClick() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(880, ctx.currentTime, 0.04, "square", 0.03);
  }


  const MODES = [
    { id: "pic-word", title: "Pictures → Words", left: "picture", right: "word", tip: "Match each picture to the clothes word." },
    { id: "audio-word", title: "Audio → Words", left: "audio", right: "word", tip: "Listen, then match to the clothes word." },
    { id: "audio-pic", title: "Audio → Pictures", left: "audio", right: "picture", tip: "Listen, then match to the picture." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0; // 0..2 chosen by player
  let phase = "menu"; // menu | play | done
  let setIndex = 0; // 0..2 within current mode (3 sets of 5)
  let leftOrder = [];
  let rightOrder = [];
  let locked = {}; // leftIndex -> true
  let matches = {}; // leftIndex -> rightId
  let selectedLeft = null;
  let currentAudio = null;
  let playingLeft = null;
  let setCorrect = 0; // pairs correct in current set
  let modeCorrect = 0; // pairs correct across all 3 sets in mode

  function byId(id) {
    return COUNTRIES.find((c) => c.id === id);
  }

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
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    playingLeft = null;
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudioFor(leftIndex) {
    const id = leftOrder[leftIndex];
    const c = byId(id);
    if (!c) return;

    if (playingLeft === leftIndex && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    playingLeft = leftIndex;
    const btn = app.querySelector('.mc-play[data-i="' + leftIndex + '"]');
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      playingLeft = null;
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (playingLeft === leftIndex) playingLeft = null;
      currentAudio = null;
    };
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    const ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    locked = {};
    matches = {};
    selectedLeft = null;
    setCorrect = 0;
    stopAudio();
    phase = "play";
    render();
  }

  
  const PARTICLE_COLORS = [
    "#34d399", "#10b981", "#fbbf24", "#f59e0b", "#6366f1",
    "#8b5cf6", "#ec4899", "#f472b6", "#38bdf8", "#a78bfa",
  ];
  const WRONG_COLORS = ["#f87171", "#ef4444", "#fb923c", "#f97316", "#fda4af"];

  function spawnBurst(el, opts) {
    if (!el) return;
    opts = opts || {};
    var count = opts.count || 12;
    var colors = opts.colors || PARTICLE_COLORS;
    var minDist = opts.minDist || 24;
    var maxDist = opts.maxDist || 56;
    var shapes = opts.shapes || ["dot", "star", "square"];
    var dur = opts.dur || 700;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      var shape = shapes[i % shapes.length];
      s.className = "mc-particle mc-particle--" + shape;
      var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      var dist = minDist + Math.random() * (maxDist - minDist);
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      s.style.setProperty("--delay", (i * 0.012) + "s");
      s.style.setProperty("--rot", (Math.random() * 360) + "deg");
      s.style.setProperty("--size", (5 + Math.random() * 7) + "px");
      s.style.background = colors[i % colors.length];
      el.appendChild(s);
      (function (node) {
        setTimeout(function () { if (node.parentNode) node.remove(); }, dur + 80);
      })(s);
    }
  }

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach(function (el) {
      if (!el) return;
      el.classList.add("mc-match-pop");
      spawnBurst(el, { count: 14, minDist: 28, maxDist: 64, dur: 750 });
      setTimeout(function () { el.classList.remove("mc-match-pop"); }, 550);
    });
    // ring pulse between the two cards
    var flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.remove(); }, 500);
  }

  function spawnWrongFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach(function (el) {
      if (!el) return;
      spawnBurst(el, {
        count: 8,
        colors: WRONG_COLORS,
        minDist: 16,
        maxDist: 40,
        shapes: ["dot", "square"],
        dur: 550,
      });
    });
  }

  /** Full-board confetti for set / mode complete */
  function spawnCelebrateFX(intensity) {
    intensity = intensity || 1;
    var layer = document.createElement("div");
    layer.className = "mc-celebrate-layer";
    app.appendChild(layer);
    var count = intensity >= 2 ? 48 : 28;
    var w = app.clientWidth || 320;
    var h = app.clientHeight || 480;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      var shape = i % 3 === 0 ? "star" : i % 3 === 1 ? "square" : "dot";
      p.className = "mc-confetti mc-particle--" + shape;
      p.style.left = Math.random() * 100 + "%";
      p.style.top = -8 - Math.random() * 20 + "%";
      p.style.setProperty("--fall", 70 + Math.random() * 40 + "vh");
      p.style.setProperty("--drift", (Math.random() - 0.5) * 80 + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      p.style.setProperty("--dur", 1.1 + Math.random() * 1.1 + "s");
      p.style.setProperty("--delay", Math.random() * 0.35 + "s");
      p.style.setProperty("--size", (6 + Math.random() * 8) + "px");
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      layer.appendChild(p);
    }
    setTimeout(function () {
      if (layer.parentNode) layer.remove();
    }, 2800);
  }

  function playCountryAudio(countryId) {
    const c = byId(countryId);
    if (!c) return;
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === 4;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    sfxSelect();
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    const mode = MODES[modeIndex];
    if (mode.left === "audio") playAudioFor(i);
  }

  function selectRight(rightId) {
    if (selectedLeft === null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = MODES[modeIndex].left === "audio"
          ? "Play a sound first, then tap a match."
          : "Tap an item on the left first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(() => hint.classList.remove("mc-hint-warn"), 1200);
      }
      return;
    }
    const used = Object.keys(locked).some((li) => matches[li] === rightId);
    if (used) return;

    const leftId = leftOrder[selectedLeft];
    const ok = leftId === rightId;
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (ok) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      setCorrect += 1;
      modeCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      sfxCorrect();
      spawnMatchFX(leftEl, rightEl);
      // Picture → Words: play clothes audio on each successful match
      if (MODES[modeIndex].id === "pic-word") {
        playCountryAudio(leftId);
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (allMatched()) {
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            sfxSetComplete();
            spawnCelebrateFX(1);
            setTimeout(function () { startSet(setIndex + 1); }, 450);
          } else {
            sfxSetComplete();
            spawnCelebrateFX(2);
            setTimeout(function () {
              phase = "done";
              render();
            }, 550);
          }
        }, 700);
      }
    } else {
      sfxWrong();
      spawnWrongFX(leftEl, rightEl);
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 650);
    }
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) el.textContent = "Set " + (setIndex + 1) + "/4 · " + correctCount() + "/4";
  }

  function calcStars() {
    // modeCorrect is pairs across all 4 sets (max 16)
    const n = modeCorrect;
    if (n >= 15) return 3;
    if (n >= 12) return 2;
    if (n >= 8) return 1;
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

  function leftCell(id, i, kind) {
    const c = byId(id);
    const isLocked = !!locked[i];
    const sel = selectedLeft === i ? " is-selected" : "";
    const ok = isLocked ? " is-correct" : "";

    if (kind === "audio") {
      return `
        <div class="mc-left-item mc-audio-cell${ok}${sel}" data-i="${i}">
          <button type="button" class="mc-play" data-i="${i}" aria-label="Play ${c.label}" ${isLocked ? "disabled" : ""}>
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
        </div>`;
    }
    // picture
    return `
      <div class="mc-left-item mc-pic-cell${ok}${sel}" data-i="${i}">
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
      </div>`;
  }

  function rightCell(id, kind) {
    const c = byId(id);
    const used = Object.keys(locked).some((li) => matches[li] === id);
    if (kind === "word") {
      return `
        <button type="button" class="mc-right-item mc-word${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
          <span class="mc-word-label">${c.label}</span>
        </button>`;
    }
    // picture on the right (with flag overlay)
    return `
      <button type="button" class="mc-right-item mc-pic-btn${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
      </button>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Clothes Match</span>
          <span class="mc-badge">9B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">👕</div>
          <h1>Clothes Match</h1>
          <p class="mc-desc">Choose a mode · 16 clothes (4 sets of 4)</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="mc-mode-card mc-mode-btn" data-mode="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => {
          sfxClick();
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      const stars = calcStars();
      saveStars();
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: modeCorrect,
          total: 15,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = "menu"; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Clothes Match</span>
          <span class="mc-badge">Done</span>
        </header>
        <section class="mc-done">
          <div class="mc-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <h1>${stars === 3 ? "Perfect!" : "Well done!"}</h1>
          <p>You matched <strong>${modeCorrect} / 16</strong> pairs.</p>
          <button type="button" class="mc-btn" id="fb-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="fb-menu">All modes</button>
        </section>`;
      document.getElementById("fb-again").onclick = () => startMode(modeIndex);
      document.getElementById("fb-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id, mode.right)).join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title} · Set ${setIndex + 1}/4</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/4 · ${correctCount()}/4</span>
      </header>
      <p class="mc-instruction" id="mc-hint">${mode.tip}</p>
      <div class="mc-board">
        <div class="mc-col mc-col-left">${left}</div>
        <div class="mc-col mc-col-right">${right}</div>
      </div>
      <div class="mc-actions">
        <button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>
      </div>`;

    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.onclick = () => selectLeft(+el.dataset.i);
    });
    app.querySelectorAll(".mc-play").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        if (locked[i]) return;
        // selectLeft already calls playAudioFor for audio modes.
        // Calling playAudioFor again here immediately stopped the sound.
        selectLeft(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((btn) => {
      btn.onclick = () => selectRight(btn.dataset.id);
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
  }

  render();
})();
