/* Classroom Language Flashcards – PE1 · Jobs-style layout */
(function () {
  const GAME_ID = "starter-pe1-classroom-language-flashcards";

  const CARDS = [
    { id: "look-board", label: "Look at the board, please.",
      image: "images/look-at-the-board.png", audio: "audio/look-at-the-board.mp3" },
    { id: "sorry-late", label: "Sorry, I'm late.",
      image: "images/sorry-im-late.png", audio: "audio/sorry-im-late.mp3" },
    { id: "dont-know", label: "I don't know.",
      image: "images/i-dont-know.png", audio: "audio/i-dont-know.mp3" },
    { id: "dont-under", label: "I don't understand.",
      image: "images/i-dont-understand.png", audio: "audio/i-dont-understand.mp3" },
    { id: "gracias", label: "Excuse me, what's \"gracias\" in English?",
      image: "images/whats-gracias.png", audio: "audio/whats-gracias.mp3" },
    { id: "repeat", label: "Sorry, can you repeat that, please?",
      image: "images/can-you-repeat.png", audio: "audio/can-you-repeat.mp3" },
    { id: "spell", label: "How do you spell it?",
      image: "images/how-do-you-spell-it.png", audio: "audio/how-do-you-spell-it.mp3" },
    { id: "sit", label: "Sit down.",
      image: "images/sit-down.png", audio: "audio/sit-down.mp3" },
    { id: "stand", label: "Stand up, please.",
      image: "images/stand-up.png", audio: "audio/stand-up.mp3" },
    { id: "close", label: "Close your books.",
      image: "images/close-your-books.png", audio: "audio/close-your-books.mp3" },
    { id: "page", label: "Go to page ten.",
      image: "images/go-to-page.png", audio: "audio/go-to-page.mp3" },
    { id: "open", label: "Open your books.",
      image: "images/open-your-books.png", audio: "audio/open-your-books.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let deck = CARDS.slice();
  let index = 0;
  let currentAudio = null;
  let phase = "play";
  let showLabel = true;

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
    app.querySelectorAll(".clf-audio.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playCurrent() {
    const card = deck[index];
    if (!card) return;
    stopAudio();
    const a = new Audio(card.audio);
    currentAudio = a;
    const btn = app.querySelector(".clf-audio");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
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
    index = next;
    render();
    setTimeout(playCurrent, 200);
  }

  function doShuffle() {
    stopAudio();
    deck = shuffle(CARDS);
    index = 0;
    phase = "play";
    render();
    setTimeout(playCurrent, 250);
  }

  function restart() {
    stopAudio();
    deck = CARDS.slice();
    index = 0;
    phase = "play";
    render();
    setTimeout(playCurrent, 250);
  }

  function finish() {
    stopAudio();
    saveStars();
    phase = "done";
    render();
  }

  function bindSwipe(el) {
    if (!el) return;
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, locked = null;
    const card = () => el.querySelector(".clf-card");

    const onStart = (x, y) => {
      startX = x; startY = y; dx = 0; dy = 0; dragging = true; locked = null;
      const c = card();
      if (c) c.style.transition = "none";
    };
    const onMove = (x, y, e) => {
      if (!dragging) return;
      dx = x - startX;
      dy = y - startY;
      if (locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        locked = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      }
      if (locked === "v") return;
      if (locked === "h" && e && e.cancelable) e.preventDefault();
      const c = card();
      if (c && locked === "h") {
        c.style.transform = `translateX(${dx * 0.55}px) rotate(${dx * 0.03}deg)`;
        c.style.opacity = String(Math.max(0.55, 1 - Math.abs(dx) / 320));
      }
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      const c = card();
      const threshold = Math.min(72, (el.offsetWidth || 280) * 0.22);
      if (locked === "h" && dx < -threshold) {
        if (c) {
          c.style.transition = "transform 0.22s ease, opacity 0.22s ease";
          c.style.transform = "translateX(-120%)";
          c.style.opacity = "0";
        }
        setTimeout(() => {
          if (index < deck.length - 1) go(1); else finish();
        }, 160);
      } else if (locked === "h" && dx > threshold) {
        if (c) {
          c.style.transition = "transform 0.22s ease, opacity 0.22s ease";
          c.style.transform = "translateX(120%)";
          c.style.opacity = "0";
        }
        setTimeout(() => go(-1), 160);
      } else if (c) {
        c.style.transition = "transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease";
        c.style.transform = "";
        c.style.opacity = "1";
      }
      dx = 0; dy = 0; locked = null;
    };

    el.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener("touchmove", (e) => {
      const t = e.changedTouches[0];
      onMove(t.clientX, t.clientY, e);
    }, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    // mouse drag (desktop)
    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      onStart(e.clientX, e.clientY);
      const move = (ev) => onMove(ev.clientX, ev.clientY, ev);
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
        <header class="clf-top">
          <a class="clf-back" href="../" aria-label="Back">←</a>
          <div class="clf-head-text">
            <span class="clf-eyebrow">PE1 · Classroom language</span>
            <h1>Classroom Language</h1>
          </div>
        </header>
        <section class="clf-done">
          <div class="clf-stars">⭐ ⭐ ⭐</div>
          <h2>Great job!</h2>
          <p>You reviewed all <strong>${CARDS.length}</strong> phrases.</p>
          <button type="button" class="clf-btn" id="clf-again">Practice again</button>
          <button type="button" class="clf-btn secondary" id="clf-shuffle">Shuffle &amp; restart</button>
          <a class="clf-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("clf-again").onclick = restart;
      document.getElementById("clf-shuffle").onclick = doShuffle;
      return;
    }

    const card = deck[index];
    const isFirst = index === 0;
    const isLast = index === deck.length - 1;
    const pct = ((index + 1) / deck.length) * 100;

    app.innerHTML = `
      <header class="clf-top">
        <a class="clf-back" href="../" aria-label="Back">←</a>
        <div class="clf-head-text">
          <span class="clf-eyebrow">PE1 · Classroom language</span>
          <h1>Classroom Language</h1>
        </div>
        <button type="button" class="clf-icon-btn" id="clf-shuffle" aria-label="Shuffle">⇄</button>
      </header>
      <div class="clf-progress-row">
        <span class="clf-count">${index + 1} / ${deck.length}</span>
        <div class="clf-bar"><div class="clf-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="clf-stage" id="clf-stage">
        <div class="clf-card">
          <span class="clf-tag">PICTURE</span>
          <img class="clf-img" src="${card.image}" alt="" draggable="false">
          <div class="clf-caption${showLabel ? "" : " is-hidden"}">${card.label}</div>
        </div>
      </div>
      <div class="clf-controls">
        <button type="button" class="clf-nav" id="clf-prev" ${isFirst ? "disabled" : ""} aria-label="Previous">‹</button>
        <button type="button" class="clf-audio" id="clf-audio" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <div class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        </button>
        <button type="button" class="clf-nav" id="clf-next" aria-label="Next">${isLast ? "✓" : "›"}</button>
      </div>
      <div class="clf-actions">
        <button type="button" class="clf-text-btn" id="clf-toggle">${showLabel ? "Hide text" : "Show text"}</button>
        <button type="button" class="clf-text-btn" id="clf-restart">Restart</button>
      </div>`;

    document.getElementById("clf-prev").onclick = () => go(-1);
    document.getElementById("clf-next").onclick = () => {
      if (isLast) finish(); else go(1);
    };
    document.getElementById("clf-audio").onclick = playCurrent;
    document.getElementById("clf-shuffle").onclick = doShuffle;
    document.getElementById("clf-restart").onclick = restart;
    document.getElementById("clf-toggle").onclick = () => {
      showLabel = !showLabel;
      const cap = app.querySelector(".clf-caption");
      const btn = document.getElementById("clf-toggle");
      if (cap) cap.classList.toggle("is-hidden", !showLabel);
      if (btn) btn.textContent = showLabel ? "Hide text" : "Show text";
    };
    bindSwipe(document.getElementById("clf-stage"));
  }

  render();
  setTimeout(playCurrent, 300);
})();
