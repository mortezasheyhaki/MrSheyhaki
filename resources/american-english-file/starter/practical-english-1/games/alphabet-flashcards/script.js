/* Alphabet Flashcards – PE1 · swipe + animations */
(function () {
  const GAME_ID = "starter-pe1-alphabet-flashcards";
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const EXAMPLES = {
    A: { word: "apple", tip: "/æ/ as in apple" },
    B: { word: "book", tip: "/b/ as in book" },
    C: { word: "cat", tip: "/k/ as in cat" },
    D: { word: "door", tip: "/d/ as in door" },
    E: { word: "egg", tip: "/e/ as in egg" },
    F: { word: "fish", tip: "/f/ as in fish" },
    G: { word: "go", tip: "/g/ as in go" },
    H: { word: "hello", tip: "/h/ as in hello" },
    I: { word: "in", tip: "/ɪ/ as in in" },
    J: { word: "job", tip: "/dʒ/ as in job" },
    K: { word: "key", tip: "/k/ as in key" },
    L: { word: "like", tip: "/l/ as in like" },
    M: { word: "man", tip: "/m/ as in man" },
    N: { word: "name", tip: "/n/ as in name" },
    O: { word: "on", tip: "/ɒ/ as in on" },
    P: { word: "pen", tip: "/p/ as in pen" },
    Q: { word: "queen", tip: "/kw/ as in queen" },
    R: { word: "red", tip: "/r/ as in red" },
    S: { word: "see", tip: "/s/ as in see" },
    T: { word: "table", tip: "/t/ as in table" },
    U: { word: "up", tip: "/ʌ/ as in up" },
    V: { word: "very", tip: "/v/ as in very" },
    W: { word: "we", tip: "/w/ as in we" },
    X: { word: "six", tip: "/ks/ as in six" },
    Y: { word: "yes", tip: "/j/ as in yes" },
    Z: { word: "zoo", tip: "/z/ as in zoo" },
  };

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = null;
  let index = 0;
  let audio = null;
  let animating = false;
  let enterDir = null; // "left" | "right" | null

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function playLetter(letter) {
    if (audio) {
      try { audio.pause(); } catch (_) {}
      audio = null;
    }
    const folder = mode === "names" ? "names" : "sounds";
    audio = new Audio(`audio/${folder}/${letter}.mp3`);
    audio.play().catch(() => {});
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function showStart() {
    mode = null;
    index = 0;
    enterDir = null;
    const chips = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(
      (L) => `<span class="afc-alpha-chip">${L}</span>`
    ).join("");
    app.innerHTML = `
      <header class="afc-topbar">
        <a class="afc-back" href="../" aria-label="Back">←</a>
        <span class="afc-title">Alphabet Flashcards</span>
        <span class="afc-badge">PE1</span>
      </header>
      <section class="afc-start">
        <div class="afc-hero">
          <div class="afc-alpha-row">${chips}</div>
          <h1>The Alphabet</h1>
          <p>Learn letter <strong>names</strong> and letter <strong>sounds</strong>.<br>Swipe cards or use the buttons.</p>
        </div>
        <div class="afc-parts">
          <button type="button" class="afc-part-card" id="afc-part1">
            <span class="afc-part-num">1</span>
            <strong>Letter names</strong>
            <span>A, B, C, D… How we say the letter</span>
          </button>
          <button type="button" class="afc-part-card" id="afc-part2">
            <span class="afc-part-num">2</span>
            <strong>Letter sounds</strong>
            <span>How the letter sounds in a word</span>
          </button>
        </div>
      </section>`;
    document.getElementById("afc-part1").onclick = () => startDeck("names");
    document.getElementById("afc-part2").onclick = () => startDeck("sounds");
  }

  function startDeck(m) {
    mode = m;
    index = 0;
    enterDir = null;
    renderCard();
  }

  function goNext() {
    if (animating || index >= LETTERS.length - 1) {
      if (index >= LETTERS.length - 1 && !animating) showDone();
      return;
    }
    animateOut("left", () => {
      index++;
      enterDir = "right";
      renderCard();
    });
  }

  function goPrev() {
    if (animating || index <= 0) return;
    animateOut("right", () => {
      index--;
      enterDir = "left";
      renderCard();
    });
  }

  function animateOut(dir, cb) {
    const card = document.getElementById("afc-card");
    if (!card || animating) return;
    animating = true;
    card.classList.add(dir === "left" ? "exit-left" : "exit-right");
    setTimeout(() => {
      animating = false;
      cb();
    }, 320);
  }

  function renderCard() {
    const letter = LETTERS[index];
    const lower = letter.toLowerCase();
    const ex = EXAMPLES[letter];
    const modeLabel = mode === "names" ? "Letter name" : "Letter sound";
    const isLast = index === LETTERS.length - 1;
    const isFirst = index === 0;
    const enterClass =
      enterDir === "right" ? " enter-from-right" :
      enterDir === "left" ? " enter-from-left" : "";
    enterDir = null;

    const exampleHtml =
      mode === "sounds"
        ? `<strong>${escapeHtml(ex.word)}</strong><br><span style="font-size:0.88rem;color:#64748b">${escapeHtml(ex.tip)}</span>`
        : `<span style="color:#64748b">The letter <strong style="color:#312e81">${letter}</strong></span>`;

    app.innerHTML = `
      <header class="afc-topbar">
        <a class="afc-back" href="#" id="afc-back" aria-label="Back">←</a>
        <span class="afc-title">${mode === "names" ? "Part 1 · Names" : "Part 2 · Sounds"}</span>
        <span class="afc-badge">${index + 1} / 26</span>
      </header>
      <div class="afc-stage">
        <div class="afc-mode-label">${modeLabel}</div>
        <div class="afc-track" id="afc-track">
          <div class="afc-card${enterClass}" id="afc-card">
            <span class="afc-mode-tag">${modeLabel}</span>
            <div class="afc-letter">${letter}</div>
            <div class="afc-letter-lower">${lower}</div>
            <div class="afc-example">${exampleHtml}</div>
            <div class="afc-hint">Swipe · tap 🔊 to listen</div>
          </div>
        </div>
        <div class="afc-dots" aria-hidden="true">
          ${LETTERS.map((_, i) =>
            `<span class="afc-dot${i === index ? " on" : i < index ? " done" : ""}"></span>`
          ).join("")}
        </div>
      </div>
      <div class="afc-controls">
        <button type="button" class="afc-nav-btn" id="afc-prev" ${isFirst ? "disabled" : ""}>← Prev</button>
        <button type="button" class="afc-speaker" id="afc-play" aria-label="Play sound">🔊</button>
        <button type="button" class="afc-nav-btn primary" id="afc-next">${isLast ? "Done ✓" : "Next →"}</button>
      </div>`;

    document.getElementById("afc-back").onclick = (e) => {
      e.preventDefault();
      showStart();
    };
    document.getElementById("afc-play").onclick = () => playLetter(letter);
    document.getElementById("afc-prev").onclick = goPrev;
    document.getElementById("afc-next").onclick = () => {
      if (isLast) showDone();
      else goNext();
    };

    bindSwipe(document.getElementById("afc-card"));
    setTimeout(() => playLetter(letter), 280);
  }

  function bindSwipe(card) {
    if (!card) return;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dragging = false;

    const onStart = (x, y) => {
      if (animating) return;
      startX = x;
      startY = y;
      dx = 0;
      dragging = true;
      card.classList.add("dragging");
    };
    const onMove = (x, y) => {
      if (!dragging || animating) return;
      dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
        // vertical scroll intent – cancel
        dragging = false;
        card.classList.remove("dragging");
        card.style.transform = "";
        return;
      }
      const rot = dx * 0.06;
      card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("dragging");
      const threshold = Math.min(90, card.offsetWidth * 0.28);
      if (dx < -threshold) {
        card.style.transform = "";
        goNext();
      } else if (dx > threshold) {
        card.style.transform = "";
        goPrev();
      } else {
        card.style.transition = "transform 0.25s ease";
        card.style.transform = "";
        setTimeout(() => { card.style.transition = ""; }, 260);
      }
      dx = 0;
    };

    card.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });
    card.addEventListener("touchmove", (e) => {
      const t = e.changedTouches[0];
      onMove(t.clientX, t.clientY);
    }, { passive: true });
    card.addEventListener("touchend", onEnd, { passive: true });
    card.addEventListener("touchcancel", onEnd, { passive: true });

    // mouse drag (desktop)
    card.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      const move = (ev) => onMove(ev.clientX, ev.clientY);
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        onEnd();
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    });
  }

  function showDone() {
    saveStars(3);
    app.innerHTML = `
      <header class="afc-topbar">
        <a class="afc-back" href="../" aria-label="Back">←</a>
        <span class="afc-title">Complete</span>
        <span class="afc-badge">✓</span>
      </header>
      <section class="afc-done">
        <div class="afc-stars">⭐ ⭐ ⭐</div>
        <h1>Great job!</h1>
        <p>You finished <strong>${mode === "names" ? "letter names" : "letter sounds"}</strong>.</p>
        <button type="button" class="afc-btn" id="afc-other">
          ${mode === "names" ? "Practice sounds →" : "Practice names →"}
        </button>
        <button type="button" class="afc-btn secondary" id="afc-again">Again</button>
        <button type="button" class="afc-btn secondary" id="afc-home">Back to games</button>
      </section>`;
    document.getElementById("afc-other").onclick = () =>
      startDeck(mode === "names" ? "sounds" : "names");
    document.getElementById("afc-again").onclick = () => startDeck(mode);
    document.getElementById("afc-home").onclick = () => {
      window.location.href = "../";
    };
  }

  showStart();
})();
