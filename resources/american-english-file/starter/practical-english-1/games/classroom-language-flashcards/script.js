/* Classroom Language Flashcards – PE1 · Jobs-style layout */
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


  const GAME_ID = "starter-pe1-classroom-language-flashcards";

  const CARDS = [
    { id: "look-board", label: "Look at the board, please.",
      image: "https://cdn.imgurl.ir/uploads/p826615_look-at-the-board.png", audio: "https://cdn.imgurl.ir/uploads/t63176_look-at-the-board.mp3" },
    { id: "sorry-late", label: "Sorry, I'm late.",
      image: "https://cdn.imgurl.ir/uploads/e195266_sorry-im-late.png", audio: "https://cdn.imgurl.ir/uploads/u759904_sorry-im-late.mp3" },
    { id: "dont-know", label: "I don't know.",
      image: "https://cdn.imgurl.ir/uploads/g105297_i-dont-know.png", audio: "https://cdn.imgurl.ir/uploads/v35496_i-dont-know.mp3" },
    { id: "dont-under", label: "I don't understand.",
      image: "https://cdn.imgurl.ir/uploads/i965470_i-dont-understand.png", audio: "https://cdn.imgurl.ir/uploads/e84120_i-dont-understand.mp3" },
    { id: "gracias", label: "Excuse me, what's \"gracias\" in English?",
      image: "https://cdn.imgurl.ir/uploads/g788943_whats-gracias.png", audio: "https://cdn.imgurl.ir/uploads/o602381_whats-gracias.mp3" },
    { id: "repeat", label: "Sorry, can you repeat that, please?",
      image: "https://cdn.imgurl.ir/uploads/i846999_can-you-rep.png", audio: "https://cdn.imgurl.ir/uploads/t250762_can-you-rep.mp3" },
    { id: "spell", label: "How do you spell it?",
      image: "https://cdn.imgurl.ir/uploads/z267726_how-do-you-spell-it.png", audio: "https://cdn.imgurl.ir/uploads/p668959_how-do-you-spell-it.mp3" },
    { id: "sit", label: "Sit down.",
      image: "https://cdn.imgurl.ir/uploads/e602807_sit-down.png", audio: "https://cdn.imgurl.ir/uploads/r83490_sit-down.mp3" },
    { id: "stand", label: "Stand up, please.",
      image: "https://cdn.imgurl.ir/uploads/m612408_stand-up.png", audio: "https://cdn.imgurl.ir/uploads/562935_stand-up.mp3" },
    { id: "close", label: "Close your books.",
      image: "https://cdn.imgurl.ir/uploads/v60268_close-your-books.png", audio: "https://cdn.imgurl.ir/uploads/q78409_close-your-books.mp3" },
    { id: "page", label: "Go to page ten.",
      image: "https://cdn.imgurl.ir/uploads/y887190_go-to-page.png", audio: "https://cdn.imgurl.ir/uploads/e185615_go-to-page.mp3" },
    { id: "open", label: "Open your books.",
      image: "https://cdn.imgurl.ir/uploads/e652197_open-your-books.png", audio: "https://cdn.imgurl.ir/uploads/b36642_open-your-books.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let deck = CARDS.slice();
  let index = 0;
  let currentAudio = null;
  let phase = "play"
    if (window.LAFinish) LAFinish.startTimer();;
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
      if (typeof saveStars === 'function') saveStars();
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: 10,
          total: 10,
          timeMs: timeMs,
          onAgain: () => { phase = 'play'; render(); },
          onModes: () => { phase = 'play'; render(); },
          backHref: "../",
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="pe-again">Again</button>`;
      document.getElementById("pe-again").onclick = () => { phase = 'play'; render(); };
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
