/* Classroom Objects Flashcards – PE1 */
(function () {
  const GAME_ID = "starter-pe1-classroom-flashcards";

  const CARDS = [
    { id: "bag",        label: "a bag",            image: "images/a-bag.png",            audio: "audio/a-bag.mp3" },
    { id: "pen",        label: "a pen",            image: "images/a-pen.png",            audio: "audio/a-pen.mp3" },
    { id: "paper",      label: "a piece of paper", image: "images/a-piece-of-paper.png", audio: "audio/a-piece-of-paper.mp3" },
    { id: "dictionary", label: "a dictionary",     image: "images/a-dictionary.png",     audio: "audio/a-dictionary.mp3" },
    { id: "laptop",     label: "a laptop",         image: "images/a-laptop.png",         audio: "audio/a-laptop.mp3" },
    { id: "table",      label: "a table",          image: "images/a-table.png",          audio: "audio/a-table.mp3" },
    { id: "chair",      label: "a chair",          image: "images/a-chair.png",          audio: "audio/a-chair.mp3" },
    { id: "window",     label: "a window",         image: "images/a-window.png",         audio: "audio/a-window.mp3" },
    { id: "door",       label: "the door",         image: "images/the-door.png",         audio: "audio/the-door.mp3" },
    { id: "board",      label: "the board",        image: "images/the-board.png",        audio: "audio/the-board.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let deck = CARDS.slice();
  let index = 0;
  let flipped = false;
  let currentAudio = null;
  let phase = "play"; // play | done

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
    app.querySelectorAll(".fc-audio-btn.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playCurrent() {
    const card = deck[index];
    if (!card) return;
    stopAudio();
    const a = new Audio(card.audio);
    currentAudio = a;
    const btn = app.querySelector(".fc-audio-btn");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function saveStars() {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, 3);
    }
  }

  function go(delta) {
    const next = index + delta;
    if (next < 0 || next >= deck.length) return;
    stopAudio();
    flipped = false;
    index = next;
    render();
  }

  function flip() {
    flipped = !flipped;
    const card = app.querySelector(".fc-card");
    if (card) card.classList.toggle("is-flipped", flipped);
    if (flipped) {
      setTimeout(playCurrent, 220);
    } else {
      stopAudio();
    }
  }

  function doShuffle() {
    stopAudio();
    deck = shuffle(CARDS);
    index = 0;
    flipped = false;
    phase = "play";
    render();
  }

  function restart() {
    stopAudio();
    deck = CARDS.slice();
    index = 0;
    flipped = false;
    phase = "play";
    render();
  }

  function finish() {
    stopAudio();
    saveStars();
    phase = "done";
    render();
  }

  function bindSwipe(el) {
    if (!el) return;
    let startX = 0, startY = 0, dx = 0, dragging = false;

    const onStart = (x, y) => {
      startX = x; startY = y; dx = 0; dragging = true;
      el.classList.add("dragging");
    };
    const onMove = (x, y) => {
      if (!dragging) return;
      dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 14) {
        dragging = false;
        el.classList.remove("dragging");
        el.style.transform = "";
        return;
      }
      el.style.transform = `translateX(${dx * 0.45}px) rotate(${dx * 0.04}deg)`;
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      const threshold = Math.min(80, el.offsetWidth * 0.25);
      if (dx < -threshold) {
        el.style.transform = "";
        if (index < deck.length - 1) go(1);
        else finish();
      } else if (dx > threshold) {
        el.style.transform = "";
        go(-1);
      } else {
        el.style.transition = "transform 0.22s ease";
        el.style.transform = "";
        setTimeout(() => { el.style.transition = ""; }, 240);
      }
      dx = 0;
    };

    el.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener("touchmove", (e) => {
      const t = e.changedTouches[0];
      onMove(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    el.addEventListener("mousedown", (e) => {
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

  function render() {
    if (phase === "done") {
      app.innerHTML = `
        <header class="fc-topbar">
          <a class="fc-back" href="../" aria-label="Back">←</a>
          <span class="fc-title">Classroom Flashcards</span>
          <span class="fc-badge">Done</span>
        </header>
        <section class="fc-done">
          <div class="fc-trophy">⭐</div>
          <div class="fc-stars">⭐ ⭐ ⭐</div>
          <h1>Great job!</h1>
          <p>You reviewed all <strong>${CARDS.length}</strong> classroom objects.</p>
          <button type="button" class="fc-btn" id="fc-again">Practice again</button>
          <button type="button" class="fc-btn secondary" id="fc-shuffle">Shuffle &amp; restart</button>
          <a class="fc-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("fc-again").onclick = restart;
      document.getElementById("fc-shuffle").onclick = doShuffle;
      return;
    }

    const card = deck[index];
    const isFirst = index === 0;
    const isLast = index === deck.length - 1;
    const pct = ((index + 1) / deck.length) * 100;

    app.innerHTML = `
      <header class="fc-topbar">
        <a class="fc-back" href="../" aria-label="Back">←</a>
        <span class="fc-title">Classroom Flashcards</span>
        <span class="fc-badge">${index + 1} / ${deck.length}</span>
      </header>
      <div class="fc-progress"><div class="fc-progress-fill" style="width:${pct}%"></div></div>
      <div class="fc-stage">
        <div class="fc-card${flipped ? " is-flipped" : ""}" id="fc-card" tabindex="0" role="button" aria-label="Flashcard — tap to flip">
          <div class="fc-card-inner">
            <div class="fc-face fc-front">
              <img class="fc-img" src="${card.image}" alt="${card.label}" draggable="false">
              <span class="fc-hint">Tap to flip · Swipe for next</span>
            </div>
            <div class="fc-face fc-back">
              <p class="fc-word">${card.label}</p>
              <button type="button" class="fc-audio-btn" id="fc-audio" aria-label="Play audio">
                <span class="wave"></span><span class="wave"></span><span class="wave"></span>
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                  <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <div class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="fc-controls">
        <button type="button" class="fc-nav" id="fc-prev" ${isFirst ? "disabled" : ""} aria-label="Previous">←</button>
        <button type="button" class="fc-nav primary" id="fc-flip">Flip</button>
        <button type="button" class="fc-nav" id="fc-next" aria-label="Next">${isLast ? "✓" : "→"}</button>
      </div>
      <div class="fc-actions">
        <button type="button" class="fc-btn secondary" id="fc-shuffle">Shuffle</button>
        <button type="button" class="fc-btn secondary" id="fc-restart">Restart</button>
      </div>`;

    const cardEl = document.getElementById("fc-card");
    cardEl.onclick = (e) => {
      if (e.target.closest(".fc-audio-btn")) return;
      flip();
    };
    document.getElementById("fc-audio").onclick = (e) => {
      e.stopPropagation();
      playCurrent();
    };
    document.getElementById("fc-prev").onclick = () => go(-1);
    document.getElementById("fc-next").onclick = () => {
      if (isLast) finish();
      else go(1);
    };
    document.getElementById("fc-flip").onclick = flip;
    document.getElementById("fc-shuffle").onclick = doShuffle;
    document.getElementById("fc-restart").onclick = restart;

    bindSwipe(cardEl);

    // Keyboard
    cardEl.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isLast) finish(); else go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
  }

  render();
})();
