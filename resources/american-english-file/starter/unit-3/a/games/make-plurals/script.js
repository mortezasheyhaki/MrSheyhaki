/* Make Plurals – add -s / -es / y→i+es · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-make-plurals";


  /* ---------- sound effects (Web Audio) ---------- */
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
    sfxTone(523.25, t, 0.1, "triangle", 0.1);
    sfxTone(659.25, t + 0.08, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.16, 0.16, "sine", 0.09);
  }
  function sfxWrong() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(220, t, 0.14, "sawtooth", 0.05, 140);
    sfxTone(180, t + 0.05, 0.14, "triangle", 0.04, 120);
  }
  function sfxClick() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(720, ctx.currentTime, 0.045, "sine", 0.04);
  }
  function sfxComplete() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.09);
    sfxTone(659.25, t + 0.1, 0.1, "triangle", 0.09);
    sfxTone(783.99, t + 0.2, 0.12, "triangle", 0.1);
    sfxTone(1046.5, t + 0.32, 0.22, "sine", 0.08);
  }

  // 4 × -s | 4 × -es (ss/ch/sh/x) | 4 × -ies (consonant + y)
  const ITEMS = [
    { id: "pen",     base: "pen",     type: "s",   ending: "s" },
    { id: "bag",     base: "bag",     type: "s",   ending: "s" },
    { id: "book",    base: "book",    type: "s",   ending: "s" },
    { id: "phone",   base: "phone",   type: "s",   ending: "s" },
    { id: "watch",   base: "watch",   type: "es",  ending: "es" },
    { id: "box",     base: "box",     type: "es",  ending: "es" },
    { id: "class",   base: "class",   type: "es",  ending: "es" },
    { id: "brush",   base: "brush",   type: "es",  ending: "es" },
    { id: "city",    base: "city",    type: "ies", ending: "es" },
    { id: "country", base: "country", type: "ies", ending: "es" },
    { id: "baby",    base: "baby",    type: "ies", ending: "es" },
    { id: "dictionary",  base: "dictionary",  type: "ies", ending: "es" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;

  // Per-item state
  let stem = "";       // visible stem (may have y→i applied)
  let yChanged = false;
  let attached = null; // "s" | "es" | null

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return order[idx];
  }

  function start() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.slice());
    idx = 0;
    score = 0;
    loadItem();
  }

  function loadItem() {
    locked = false;
    const it = current();
    stem = it.base;
    yChanged = false;
    attached = null;
    phase = "play";
    render();
  }

  function onYClick() {
    if (locked) return;
    const it = current();
    if (it.type !== "ies") return;
    if (yChanged) {
      // undo
      stem = it.base;
      yChanged = false;
      attached = null;
    } else {
      sfxWrong();
      // y → i
      stem = it.base.slice(0, -1) + "i";
      yChanged = true;
      attached = null;
    }
    renderPlay();
  }

  function attachEnding(end) {
    if (locked) return;
    const it = current();
    // For -ies words, must change y first
    if (it.type === "ies" && !yChanged) {
      flashHint("Tap the y first — change it to i.");
      return;
    }
    attached = end;
    renderPlay();
    // auto-check after short moment
    setTimeout(check, 280);
  }

  function clearEnding() {
    if (locked) return;
    attached = null;
    renderPlay();
  }

  function flashHint(msg) {
    const el = document.getElementById("mp-hint");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-warn");
    setTimeout(() => {
      el.classList.remove("is-warn");
      el.textContent = hintFor(current());
    }, 1400);
  }

  function hintFor(it) {
    if (it.type === "s") return "Add -s to make the plural.";
    if (it.type === "es") return "Add -es (words ending in ch, sh, ss, x…).";
    return "Tap y → i, then add -es.";
  }

  function check() {
    if (locked || !attached) return;
    locked = true;
    const it = current();
    let ok = false;

    if (it.type === "s") {
      ok = attached === "s" && stem === it.base;
    } else if (it.type === "es") {
      ok = attached === "es" && stem === it.base;
    } else {
      // ies: stem must be base without y + i, ending es
      const expectedStem = it.base.slice(0, -1) + "i";
      ok = yChanged && stem === expectedStem && attached === "es";
    }

    const wordEl = document.getElementById("mp-word");
    const fb = document.getElementById("mp-feedback");

    if (ok) {
      sfxCorrect();
      score += 1;
      if (wordEl) wordEl.classList.add("is-correct");
      if (fb) {
        fb.textContent = "Correct! " + pluralOf(it);
        fb.className = "mp-feedback ok";
      }
    } else {
      if (wordEl) wordEl.classList.add("is-wrong");
      if (fb) {
        fb.textContent = "It's \"" + pluralOf(it) + "\"";
        fb.className = "mp-feedback bad";
      }
    }

    setTimeout(() => {
      if (idx < order.length - 1) {
        idx += 1;
        loadItem();
      } else {
        phase = "done";
        render();
      }
    }, ok ? 900 : 1500);
  }

  function pluralOf(it) {
    if (it.type === "s") return it.base + "s";
    if (it.type === "es") return it.base + "es";
    return it.base.slice(0, -1) + "ies";
  }

  function calcStars() {
    if (score >= 11) return 3;
    if (score >= 8) return 2;
    if (score >= 5) return 1;
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

  /* ---- drag helpers ---- */
  let dragEnd = null;

  function onTilePointerDown(end, e) {
    if (locked) return;
    dragEnd = end;
    const tile = e.currentTarget;
    tile.classList.add("is-dragging");
  }

  function onTilePointerUp(end, e) {
    const tile = e.currentTarget;
    tile.classList.remove("is-dragging");
    if (locked) return;
    // tap = attach
    attachEnding(end);
    dragEnd = null;
  }

  function onDropZoneUp(e) {
    if (locked) return;
    if (dragEnd) {
      attachEnding(dragEnd);
      dragEnd = null;
    }
  }

  function renderPlay() {
    const it = current();
    const showY = it.type === "ies" && !yChanged;
    const stemBody = showY ? it.base.slice(0, -1) : stem;
    const yPart = showY
      ? `<button type="button" class="mp-y" id="mp-y" title="Tap to change y → i">y</button>`
      : "";

    const endingSlot = attached
      ? `<button type="button" class="mp-ending is-filled" id="mp-ending">${attached}</button>`
      : `<span class="mp-ending is-empty" id="mp-ending"></span>`;

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Make Plurals</span>
        <span class="mc-progress">${idx + 1} / ${order.length}</span>
      </header>
      <p class="mc-instruction" id="mp-hint">${hintFor(it)}</p>
      <div class="mp-stage">
        <div class="mp-word" id="mp-word">
          <span class="mp-stem">${stemBody}</span>${yPart}${endingSlot}
        </div>
        <p class="mp-feedback" id="mp-feedback"></p>
        <div class="mp-tiles">
          <button type="button" class="mp-tile" data-end="s" ${locked ? "disabled" : ""}>s</button>
          <button type="button" class="mp-tile" data-end="es" ${locked ? "disabled" : ""}>es</button>
        </div>
        <p class="mp-tip">Tap an ending — or drag it onto the word</p>
      </div>`;

    // Drop zone = whole word
    const word = document.getElementById("mp-word");
    word.addEventListener("pointerup", onDropZoneUp);

    const yBtn = document.getElementById("mp-y");
    if (yBtn) yBtn.onclick = (e) => { e.stopPropagation(); onYClick(); };

    const filled = document.getElementById("mp-ending");
    if (filled && attached) {
      filled.onclick = (e) => { e.stopPropagation(); clearEnding(); };
    }

    app.querySelectorAll(".mp-tile").forEach((tile) => {
      const end = tile.dataset.end;
      tile.addEventListener("pointerdown", (e) => onTilePointerDown(end, e));
      tile.addEventListener("pointerup", (e) => onTilePointerUp(end, e));
      // HTML5 drag fallback
      tile.draggable = true;
      tile.addEventListener("dragstart", (e) => {
        dragEnd = end;
        e.dataTransfer.setData("text/plain", end);
        tile.classList.add("is-dragging");
      });
      tile.addEventListener("dragend", () => tile.classList.remove("is-dragging"));
    });

    word.addEventListener("dragover", (e) => e.preventDefault());
    word.addEventListener("drop", (e) => {
      e.preventDefault();
      const end = e.dataTransfer.getData("text/plain") || dragEnd;
      if (end) attachEnding(end);
      dragEnd = null;
    });
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Make Plurals</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🔤</div>
          <h1>Make Plurals</h1>
          <p class="mc-desc">Add <strong>-s</strong>, <strong>-es</strong>, or change <strong>y → i + es</strong></p>
          <ul class="mp-rules">
            <li>Most nouns → add <b>s</b></li>
            <li>ch / sh / ss / x → add <b>es</b></li>
            <li>consonant + y → <b>y → i</b>, then <b>es</b></li>
          </ul>
          <button type="button" class="mc-btn" id="mp-start">Start</button>
        </section>`;
      document.getElementById("mp-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => start(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u3a-again">Again</button>`;
      document.getElementById("u3a-again").onclick = () => start();
      return;
    }

    renderPlay();
  }

  render();
})();
