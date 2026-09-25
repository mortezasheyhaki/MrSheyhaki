/* Clothes Flashcards – AEF Starter Unit 9B
   Layout from Practical English 1 Classroom Flashcards */
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


  const GAME_ID = "starter-9b-clothes-flashcards";

  const CARDS = [
    { id: "cap", label: "a cap",
      image: "https://cdn.imgurl.ir/uploads/b4742_cap.png",
      audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3" },
    { id: "coat", label: "a coat",
      image: "https://cdn.imgurl.ir/uploads/w043594_coat.png",
      audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3" },
    { id: "dress", label: "a dress",
      image: "https://cdn.imgurl.ir/uploads/d995053_dress.png",
      audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3" },
    { id: "hat", label: "a hat",
      image: "https://cdn.imgurl.ir/uploads/o3351_hat.png",
      audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3" },
    { id: "jacket", label: "a jacket",
      image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png",
      audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3" },
    { id: "jeans", label: "jeans",
      image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png",
      audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3" },
    { id: "pants", label: "pants",
      image: "https://cdn.imgurl.ir/uploads/i04627_pants.png",
      audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3" },
    { id: "shirt", label: "a shirt",
      image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png",
      audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3" },
    { id: "shoes", label: "shoes",
      image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png",
      audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3" },
    { id: "shorts", label: "shorts",
      image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png",
      audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3" },
    { id: "skirt", label: "a skirt",
      image: "https://cdn.imgurl.ir/uploads/a444189_st.png",
      audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3" },
    { id: "sneakers", label: "sneakers",
      image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png",
      audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3" },
    { id: "socks", label: "socks",
      image: "https://cdn.imgurl.ir/uploads/k600200_socks.png",
      audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3" },
    { id: "suit", label: "a suit",
      image: "https://cdn.imgurl.ir/uploads/e98017_suit.png",
      audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3" },
    { id: "sweater", label: "a sweater",
      image: "https://cdn.imgurl.ir/uploads/x441494_swer.png",
      audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3" },
    { id: "t-shirt", label: "a T-shirt",
      image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png",
      audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3" },
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
    if (window.LAFinish) LAFinish.startTimer();
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
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: CARDS.length,
          total: CARDS.length,
          stars: 3,
          timeMs: timeMs,
          onAgain: restart,
          onModes: () => { phase = "play"; restart(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="fc-again">Again</button>`;
      document.getElementById("fc-again").onclick = restart;
      return;
    }

    const card = deck[index];
    const isFirst = index === 0;
    const isLast = index === deck.length - 1;
    const pct = ((index + 1) / deck.length) * 100;

    app.innerHTML = `
      <header class="fc-topbar">
        <a class="fc-back" href="../" aria-label="Back">←</a>
        <span class="fc-title">Clothes Flashcards</span>
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

  if (window.LAFinish) LAFinish.startTimer();
  render();
})();
