/* Unscramble Countries – AEF Starter Unit 1B */
(function () {
  const GAME_ID = "starter-1b-unscramble-countries";

  const COUNTRIES = [
    { id: "argentina", label: "Argentina", word: "Argentina", flag: "🇦🇷", audio: "audio/argentina.mp3", image: "https://cdn.imgurl.ir/uploads/g12204_argentina.png" },
    { id: "brazil", label: "Brazil", word: "Brazil", flag: "🇧🇷", audio: "audio/brazil.mp3", image: "https://cdn.imgurl.ir/uploads/g4042_brazil.png" },
    { id: "canada", label: "Canada", word: "Canada", flag: "🇨🇦", audio: "audio/canada.mp3", image: "https://cdn.imgurl.ir/uploads/o728577_canada.png" },
    { id: "chile", label: "Chile", word: "Chile", flag: "🇨🇱", audio: "audio/chile.mp3", image: "https://cdn.imgurl.ir/uploads/l1448_chile.png" },
    { id: "china", label: "China", word: "China", flag: "🇨🇳", audio: "audio/china.mp3", image: "https://cdn.imgurl.ir/uploads/n904682_china.png" },
    { id: "england", label: "England", word: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", audio: "audio/england.mp3", image: "https://cdn.imgurl.ir/uploads/z55730_england.png" },
    { id: "japan", label: "Japan", word: "Japan", flag: "🇯🇵", audio: "audio/japan.mp3", image: "https://cdn.imgurl.ir/uploads/j223970_japan.png" },
    { id: "korea", label: "Korea", word: "Korea", flag: "🇰🇷", audio: "audio/korea.mp3", image: "https://cdn.imgurl.ir/uploads/k198270_korea.png" },
    { id: "mexico", label: "Mexico", word: "Mexico", flag: "🇲🇽", audio: "audio/mexico.mp3", image: "https://cdn.imgurl.ir/uploads/i551631_mexico.png" },
    { id: "peru", label: "Peru", word: "Peru", flag: "🇵🇪", audio: "audio/peru.mp3", image: "https://cdn.imgurl.ir/uploads/d81228_peru.png" },
    { id: "saudi-arabia", label: "Saudi Arabia", word: "Saudi Arabia", flag: "🇸🇦", audio: "audio/saudi-arabia.mp3", image: "https://cdn.imgurl.ir/uploads/k062762_saudi-arabia.png" },
    { id: "spain", label: "Spain", word: "Spain", flag: "🇪🇸", audio: "audio/spain.mp3", image: "https://cdn.imgurl.ir/uploads/g67497_spain.png" },
    { id: "turkey", label: "Turkey", word: "Turkey", flag: "🇹🇷", audio: "audio/turkey.mp3", image: "https://cdn.imgurl.ir/uploads/u314547_turkey.png" },
    { id: "vietnam", label: "Vietnam", word: "Vietnam", flag: "🇻🇳", audio: "audio/vietnam.mp3", image: "https://cdn.imgurl.ir/uploads/x094160_vietnam.png" },
    { id: "usa", label: "the United States", word: "United States", flag: "🇺🇸", audio: "audio/usa.mp3", image: "https://cdn.imgurl.ir/uploads/r43930_usa.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "start"; // start | play | feedback | done
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let slots = []; // array of letters or null for filled answer
  let pool = []; // remaining letter tiles { ch, uid }
  let checked = false;
  let lastCorrect = false;
  let uidCounter = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return COUNTRIES[order[index]];
  }

  function letterList(word) {
    // Keep spaces as fixed slots; preserve original case (first letter capital)
    return word.split("").map((ch) => (ch === " " ? " " : ch));
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(COUNTRIES.map((_, i) => i));
    index = 0;
    correctCount = 0;
    startRound();
  }

  function startRound() {
    const c = current();
    const letters = letterList(c.word);
    slots = letters.map((ch) => (ch === " " ? { type: "space" } : { type: "empty", ch: null, uid: null }));
    const scramble = letters.filter((ch) => ch !== " ");
    // Ensure scramble is not already solved
    let scrambled = shuffle(scramble);
    let tries = 0;
    while (scrambled.join("") === scramble.join("") && scramble.length > 1 && tries < 20) {
      scrambled = shuffle(scramble);
      tries++;
    }
    pool = scrambled.map((ch) => ({ ch, uid: ++uidCounter, used: false }));
    checked = false;
    lastCorrect = false;
    phase = "play";
    render();
    // auto-play audio shortly after render
    setTimeout(() => playAudio(), 350);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio() {
    const c = current();
    if (!c || !c.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(c.audio);
      currentAudio.play().catch(() => {});
    } catch (_) {}
  }

  function firstEmptySlot() {
    return slots.findIndex((s) => s.type === "empty" && !s.ch);
  }

  function placeLetter(uid) {
    if (checked) return;
    const tile = pool.find((t) => t.uid === uid && !t.used);
    if (!tile) return;
    const si = firstEmptySlot();
    if (si < 0) return;
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    renderPlayPartial();
    // auto-check when all filled
    if (firstEmptySlot() < 0) {
      // small delay so user sees last letter land
      setTimeout(checkAnswer, 200);
    }
  }

  function removeFromSlot(si) {
    if (checked) return;
    const s = slots[si];
    if (!s || s.type !== "empty" || !s.ch) return;
    const tile = pool.find((t) => t.uid === s.uid);
    if (tile) tile.used = false;
    slots[si] = { type: "empty", ch: null, uid: null };
    renderPlayPartial();
  }

  function builtWord() {
    return slots
      .map((s) => {
        if (s.type === "space") return " ";
        return s.ch || "";
      })
      .join("");
  }

  function checkAnswer() {
    if (checked) return;
    const c = current();
    const built = builtWord().trim();
    // require all non-space slots filled
    if (slots.some((s) => s.type === "empty" && !s.ch)) return;
    checked = true;
    lastCorrect = built.toUpperCase() === c.word.toUpperCase();
    if (lastCorrect) correctCount++;
    phase = "feedback";
    render();
  }

  function nextRound() {
    stopAudio();
    if (index < order.length - 1) {
      index++;
      startRound();
    } else {
      phase = "done";
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlots(interactive) {
    return slots
      .map((s, i) => {
        if (s.type === "space") {
          return `<span class="uc-space" aria-hidden="true"></span>`;
        }
        if (s.ch) {
          const cls = checked
            ? lastCorrect
              ? "uc-slot filled ok"
              : "uc-slot filled bad"
            : "uc-slot filled";
          const click = interactive && !checked ? `data-slot="${i}"` : "";
          return `<button type="button" class="${cls}" ${click} aria-label="letter ${s.ch}">${escapeHtml(s.ch)}</button>`;
        }
        return `<span class="uc-slot empty" aria-hidden="true"></span>`;
      })
      .join("");
  }

  function renderPool() {
    return pool
      .map((t) => {
        if (t.used) {
          return `<span class="uc-tile used" aria-hidden="true">${escapeHtml(t.ch)}</span>`;
        }
        return `<button type="button" class="uc-tile" data-uid="${t.uid}">${escapeHtml(t.ch)}</button>`;
      })
      .join("");
  }

  function renderPlayPartial() {
    const slotsEl = document.getElementById("uc-slots");
    const poolEl = document.getElementById("uc-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(true);
      slotsEl.querySelectorAll("[data-slot]").forEach((btn) => {
        btn.onclick = () => removeFromSlot(+btn.dataset.slot);
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool();
      poolEl.querySelectorAll("[data-uid]").forEach((btn) => {
        btn.onclick = () => placeLetter(+btn.dataset.uid);
      });
    }
  }

  function render() {
    if (phase === "start") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · UNIT 1B</span>
            <span class="uc-title">Unscramble Countries</span>
          </div>
          <span class="uc-badge">15</span>
        </header>
        <section class="uc-start">
          <div class="uc-hero">🔤</div>
          <h1>Unscramble Countries</h1>
          <p class="uc-desc">Look at the picture and flag, listen, then put the letters in the right order to spell the country.</p>
          <button type="button" class="uc-btn" id="uc-start">Start</button>
        </section>`;
      document.getElementById("uc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const total = COUNTRIES.length;
      const stars = correctCount === total ? 3 : correctCount >= total - 2 ? 2 : correctCount >= Math.ceil(total / 2) ? 1 : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: () => { phase = "start"; render(); },
          backHref: "../",
        });
        return;
      }
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
      app.innerHTML = `<p>Done ${correctCount}/${total}</p><button type="button" id="fb-again">Again</button>`;
      document.getElementById("fb-again").onclick = startGame;
      return;
    }

    const c = current();
    const progress = `${index + 1}/${order.length}`;

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · UNIT 1B</span>
            <span class="uc-title">Unscramble Countries</span>
          </div>
          <span class="uc-badge">${progress}</span>
        </header>
        <div class="uc-scroll">
          <div class="uc-card uc-card-photo">
            <span class="uc-flag-badge">${c.flag}</span>
            <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
                 onerror="this.style.display='none'" />
          </div>
          <div class="uc-card uc-card-word">
            <p class="uc-feedback ${lastCorrect ? "ok" : "bad"}">
              ${lastCorrect ? "✓ Correct!" : "✗ Not quite"}
            </p>
            <div class="uc-slots locked">${renderSlots(false)}</div>
            ${!lastCorrect ? `<p class="uc-answer-reveal">Answer: <strong>${escapeHtml(c.word)}</strong></p>` : ""}
            <p class="uc-country-name">${c.flag} ${escapeHtml(c.label)}</p>
          </div>
          <button type="button" class="uc-btn uc-btn-next" id="uc-next">
            ${index < order.length - 1 ? "Next →" : "See results"}
          </button>
        </div>`;
      document.getElementById("uc-next").onclick = nextRound;
      return;
    }

    // play
    app.innerHTML = `
      <header class="uc-topbar">
        <a class="uc-back" href="../" aria-label="Back">←</a>
        <div class="uc-topbar-center">
          <span class="uc-kicker">STARTER · UNIT 1B</span>
          <span class="uc-title">Unscramble Countries</span>
        </div>
        <span class="uc-badge">${progress}</span>
      </header>
      <p class="uc-instruction">Tap the letters to spell the country.</p>
      <div class="uc-scroll">
        <div class="uc-card uc-card-photo">
          <span class="uc-flag-badge">${c.flag}</span>
          <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
               onerror="this.style.display='none'" />
          <button type="button" class="uc-audio-btn" id="uc-play" aria-label="Play audio">🔊</button>
        </div>

        <div class="uc-card uc-card-word">
          <div class="uc-slots" id="uc-slots">${renderSlots(true)}</div>
        </div>

        <div class="uc-card uc-card-pool">
          <div class="uc-pool" id="uc-pool">${renderPool()}</div>
          <button type="button" class="uc-btn-check" id="uc-check">Check</button>
        </div>
      </div>`;

    document.getElementById("uc-play").onclick = playAudio;
    document.getElementById("uc-check").onclick = checkAnswer;
    document.getElementById("uc-slots").querySelectorAll("[data-slot]").forEach((btn) => {
      btn.onclick = () => removeFromSlot(+btn.dataset.slot);
    });
    document.getElementById("uc-pool").querySelectorAll("[data-uid]").forEach((btn) => {
      btn.onclick = () => placeLetter(+btn.dataset.uid);
    });
  }

  render();
})();
