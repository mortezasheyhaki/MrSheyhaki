/* Parents & Grandparents – drag floating words into baskets · Unit 4A */
(function () {
  const GAME_ID = "starter-4a-parents-grandparents";

  /* SVG face icons */
  const SVG = {
    father:
      '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="14" r="10" fill="#FCD34D"/><circle class="pg-eye" cx="12" cy="13" r="1.5" fill="#1e293b"/><circle class="pg-eye" cx="20" cy="13" r="1.5" fill="#1e293b"/><path d="M12 18c1.5 2 6.5 2 8 0" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M8 8c2-3 14-3 16 0" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="10" y="24" width="12" height="6" rx="2" fill="#3B82F6"/></svg>',
    mother:
      '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="14" r="10" fill="#FDBA74"/><circle class="pg-eye" cx="12" cy="13" r="1.5" fill="#1e293b"/><circle class="pg-eye" cx="20" cy="13" r="1.5" fill="#1e293b"/><path d="M12 18c1.5 2 6.5 2 8 0" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M6 12c0-6 4-10 10-10s10 4 10 10" stroke="#9F1239" stroke-width="4" fill="none"/><path d="M6 12c2 2 4 2 5 0M21 12c1 2 3 2 5 0" stroke="#9F1239" stroke-width="2" fill="none"/><rect x="10" y="24" width="12" height="6" rx="2" fill="#EC4899"/></svg>',
    grandfather:
      '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="14" r="10" fill="#FDE68A"/><circle class="pg-eye" cx="12" cy="13" r="1.5" fill="#1e293b"/><circle class="pg-eye" cx="20" cy="13" r="1.5" fill="#1e293b"/><path d="M12 19c1.5 1.5 6.5 1.5 8 0" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M7 10c3-4 15-4 18 0" stroke="#E5E7EB" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M10 22c2 3 10 3 12 0" stroke="#E5E7EB" stroke-width="2.5" fill="none"/><rect x="10" y="24" width="12" height="6" rx="2" fill="#6366F1"/><circle cx="11" cy="13" r="3.5" fill="none" stroke="#94A3B8" stroke-width="1"/><circle cx="21" cy="13" r="3.5" fill="none" stroke="#94A3B8" stroke-width="1"/><path d="M14.5 13h3" stroke="#94A3B8" stroke-width="1"/></svg>',
    grandmother:
      '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="14" r="10" fill="#FED7AA"/><circle class="pg-eye" cx="12" cy="13" r="1.5" fill="#1e293b"/><circle class="pg-eye" cx="20" cy="13" r="1.5" fill="#1e293b"/><path d="M12 18c1.5 2 6.5 2 8 0" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M6 11c1-5 5-8 10-8s9 3 10 8" stroke="#F9A8D4" stroke-width="3.5" fill="none"/><path d="M7 14c0 2 1 3 2 2M23 14c0 2-1 3-2 2" stroke="#F9A8D4" stroke-width="2" fill="none"/><rect x="10" y="24" width="12" height="6" rx="2" fill="#10B981"/><circle cx="11" cy="13" r="3.5" fill="none" stroke="#94A3B8" stroke-width="1"/><circle cx="21" cy="13" r="3.5" fill="none" stroke="#94A3B8" stroke-width="1"/><path d="M14.5 13h3" stroke="#94A3B8" stroke-width="1"/></svg>',
    parentsBasket:
      '<svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="40" cy="50" rx="28" ry="4" fill="rgba(99,102,241,0.12)"/>' +
      /* father */
      '<circle cx="28" cy="22" r="10" fill="#FCD34D"/>' +
      '<circle cx="24.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<circle cx="31.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<path d="M24.5 26c1.2 1.5 5 1.5 6.2 0" stroke="#1e293b" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M20 16c2-3 12-3 14 0" stroke="#78350f" stroke-width="2.5" fill="none"/>' +
      '<path d="M20 32h16v10a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V32z" fill="#3B82F6"/>' +
      /* mother */
      '<circle cx="52" cy="22" r="10" fill="#FDBA74"/>' +
      '<circle cx="48.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<circle cx="55.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<path d="M48.5 26c1.2 1.5 5 1.5 6.2 0" stroke="#1e293b" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M42 18c1-4 4-7 10-7s9 3 10 7" stroke="#9F1239" stroke-width="3" fill="none"/>' +
      '<path d="M44 32h16v10a4 4 0 0 1-4 4H48a4 4 0 0 1-4-4V32z" fill="#EC4899"/>' +
      '</svg>',
    grandparentsBasket:
      '<svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="40" cy="50" rx="28" ry="4" fill="rgba(16,185,129,0.12)"/>' +
      /* grandfather */
      '<circle cx="28" cy="22" r="10" fill="#FDE68A"/>' +
      '<circle cx="24.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<circle cx="31.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<path d="M24.5 26.5c1.2 1.2 5 1.2 6.2 0" stroke="#1e293b" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M19 17c2.5-3.5 13-3.5 15.5 0" stroke="#E5E7EB" stroke-width="3" fill="none"/>' +
      '<path d="M22 30c1.5 2.5 9 2.5 10.5 0" stroke="#E5E7EB" stroke-width="2" fill="none"/>' +
      '<circle cx="24" cy="21" r="3" fill="none" stroke="#94A3B8" stroke-width="0.9"/>' +
      '<circle cx="32" cy="21" r="3" fill="none" stroke="#94A3B8" stroke-width="0.9"/>' +
      '<path d="M27 21h2" stroke="#94A3B8" stroke-width="0.9"/>' +
      '<path d="M20 32h16v10a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V32z" fill="#6366F1"/>' +
      /* grandmother */
      '<circle cx="52" cy="22" r="10" fill="#FED7AA"/>' +
      '<circle cx="48.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<circle cx="55.5" cy="21" r="1.3" fill="#1e293b"/>' +
      '<path d="M48.5 26c1.2 1.5 5 1.5 6.2 0" stroke="#1e293b" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M43 17c1-4 4-7 9-7s8 3 9 7" stroke="#F9A8D4" stroke-width="3" fill="none"/>' +
      '<circle cx="48" cy="21" r="3" fill="none" stroke="#94A3B8" stroke-width="0.9"/>' +
      '<circle cx="56" cy="21" r="3" fill="none" stroke="#94A3B8" stroke-width="0.9"/>' +
      '<path d="M51 21h2" stroke="#94A3B8" stroke-width="0.9"/>' +
      '<path d="M44 32h16v10a4 4 0 0 1-4 4H48a4 4 0 0 1-4-4V32z" fill="#10B981"/>' +
      '</svg>',
    hero:
      '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#34d399"/></linearGradient></defs>' +
      '<rect width="96" height="96" rx="24" fill="url(#hg)"/>' +
      '<circle cx="36" cy="40" r="14" fill="#FCD34D"/>' +
      '<circle cx="60" cy="40" r="14" fill="#FDBA74"/>' +
      '<circle cx="31" cy="38" r="1.8" fill="#1e293b"/>' +
      '<circle cx="41" cy="38" r="1.8" fill="#1e293b"/>' +
      '<circle cx="55" cy="38" r="1.8" fill="#1e293b"/>' +
      '<circle cx="65" cy="38" r="1.8" fill="#1e293b"/>' +
      '<path d="M31 45c1.5 2 8 2 9.5 0M55 45c1.5 2 8 2 9.5 0" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M28 58h16v16a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V58z" fill="#3B82F6"/>' +
      '<path d="M52 58h16v16a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V58z" fill="#EC4899"/>' +
      '</svg>',
  };

  const WORDS = [
    { id: "father", label: "father", basket: "parents", audio: "audio/father.mp3", svg: SVG.father },
    { id: "mother", label: "mother", basket: "parents", audio: "audio/mother.mp3", svg: SVG.mother },
    { id: "grandfather", label: "grandfather", basket: "grandparents", audio: "audio/grandfather.mp3", svg: SVG.grandfather },
    { id: "grandmother", label: "grandmother", basket: "grandparents", audio: "audio/grandmother.mp3", svg: SVG.grandmother },
  ];

  const BASKETS = [
    { id: "parents", label: "Parents", art: SVG.parentsBasket },
    { id: "grandparents", label: "Grandparents", art: SVG.grandparentsBasket },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let remaining = [];
  let placed = { parents: [], grandparents: [] };
  let mistakes = 0;
  let dragState = null;
  let currentAudio = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function playAudio(src) {
    if (!src) return;
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
    }
    const a = new Audio(src);
    currentAudio = a;
    a.play().catch(function () {});
  }

  function playCorrectSfx() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!playCorrectSfx.ctx) playCorrectSfx.ctx = new Ctx();
      var ctx = playCorrectSfx.ctx;
      if (ctx.state === "suspended") ctx.resume();
      var now = ctx.currentTime;
      [523.25, 783.99].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02 + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + i * 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + 0.35 + i * 0.08);
      });
    } catch (_) {}
  }

  function playWrongSfx() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!playCorrectSfx.ctx) playCorrectSfx.ctx = new Ctx();
      var ctx = playCorrectSfx.ctx;
      if (ctx.state === "suspended") ctx.resume();
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  function calcStars() {
    if (mistakes === 0) return 3;
    if (mistakes <= 1) return 2;
    if (mistakes <= 3) return 1;
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

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    remaining = shuffle(WORDS.map(function (w) { return w.id; }));
    placed = { parents: [], grandparents: [] };
    mistakes = 0;
    phase = "play";
    render();
  }

  function wordById(id) {
    return WORDS.find(function (w) { return w.id === id; });
  }

  function isComplete() {
    return remaining.length === 0;
  }

  function tryDrop(wordId, basketId) {
    const word = wordById(wordId);
    if (!word) return false;
    if (word.basket !== basketId) {
      mistakes++;
      playWrongSfx();
      const basketEl = app.querySelector('.pg-basket[data-basket="' + basketId + '"]');
      if (basketEl) {
        basketEl.classList.add("is-wrong");
        setTimeout(function () { basketEl.classList.remove("is-wrong"); }, 400);
      }
      return false;
    }
    remaining = remaining.filter(function (id) { return id !== wordId; });
    placed[basketId].push(wordId);
    playCorrectSfx();
    setTimeout(function () { playAudio(word.audio); }, 120);
    return true;
  }

  function onPointerDown(e) {
    if (phase !== "play") return;
    const el = e.target.closest(".pg-word");
    if (!el || el.classList.contains("is-placed")) return;
    e.preventDefault();
    const wordId = el.dataset.id;
    const word = wordById(wordId);
    dragState = { wordId: wordId, el: el };
    el.classList.add("is-dragging");
    var play = app.querySelector(".pg-play");
    if (play) play.classList.add("is-dragging");
    el.setPointerCapture(e.pointerId);

    const ghost = document.createElement("div");
    ghost.className = "pg-ghost";
    ghost.id = "pg-ghost";
    ghost.innerHTML =
      '<span class="pg-word-ico" aria-hidden="true">' + word.svg + "</span>" +
      "<span>" + word.label + "</span>";
    ghost.style.left = e.clientX + "px";
    ghost.style.top = e.clientY + "px";
    document.body.appendChild(ghost);
    el.style.opacity = "0.3";
  }

  function onPointerMove(e) {
    if (!dragState) return;
    e.preventDefault();
    const ghost = document.getElementById("pg-ghost");
    if (ghost) {
      ghost.style.left = e.clientX + "px";
      ghost.style.top = e.clientY + "px";
    }
    app.querySelectorAll(".pg-basket").forEach(function (b) {
      const r = b.getBoundingClientRect();
      const over =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
      b.classList.toggle("is-over", over);
    });
  }

  function onPointerUp(e) {
    if (!dragState) return;
    const wordId = dragState.wordId;
    const el = dragState.el;
    el.classList.remove("is-dragging");
    var play = app.querySelector(".pg-play");
    if (play) play.classList.remove("is-dragging");
    el.style.opacity = "";
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}

    const ghost = document.getElementById("pg-ghost");
    if (ghost) ghost.remove();

    let targetBasket = null;
    app.querySelectorAll(".pg-basket").forEach(function (b) {
      b.classList.remove("is-over");
      const r = b.getBoundingClientRect();
      if (
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom
      ) {
        targetBasket = b.dataset.basket;
      }
    });

    dragState = null;

    if (targetBasket) {
      const ok = tryDrop(wordId, targetBasket);
      if (ok) {
        el.classList.add("is-placed");
        renderPlay();
        if (isComplete()) {
          setTimeout(function () {
            phase = "done";
            render();
          }, 550);
        }
      }
    }
  }

  function scatterPositions(count) {
    const spots = [
      { left: 6, top: 14 },
      { left: 52, top: 10 },
      { left: 12, top: 48 },
      { left: 50, top: 52 },
    ];
    return spots.slice(0, count);
  }

  function renderPlay() {
    const progress = placed.parents.length + placed.grandparents.length + " / " + WORDS.length;
    const spots = scatterPositions(remaining.length);

    let skyWords = "";
    remaining.forEach(function (id, i) {
      const w = wordById(id);
      const pos = spots[i] || { left: 10 + i * 18, top: 20 };
      skyWords +=
        '<button type="button" class="pg-word" data-id="' + id +
        '" style="left:' + pos.left + "%;top:" + pos.top + '%">' +
        '<span class="pg-word-ico" aria-hidden="true">' + w.svg + "</span>" +
        "<span>" + w.label + "</span></button>";
    });

    function chips(basketId) {
      return placed[basketId]
        .map(function (id) {
          const w = wordById(id);
          return (
            '<span class="pg-chip">' +
            w.svg +
            "<span>" + w.label + "</span></span>"
          );
        })
        .join("");
    }

    const basketsHtml = BASKETS.map(function (b) {
      const done = placed[b.id].length >= 2;
      return (
        '<div class="pg-basket' + (done ? " is-complete" : "") +
        '" data-basket="' + b.id + '">' +
        '<div class="pg-basket-art" aria-hidden="true">' + b.art + "</div>" +
        '<div class="pg-basket-label">' + b.label + "</div>" +
        '<div class="pg-basket-slots">' + chips(b.id) + "</div></div>"
      );
    }).join("");

    const deco =
      '<svg class="pg-sky-deco" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' +
      '<circle cx="40" cy="40" r="3"/><circle cx="120" cy="80" r="2"/><circle cx="300" cy="50" r="2.5"/>' +
      '<circle cx="360" cy="120" r="2"/><circle cx="80" cy="200" r="2"/><circle cx="250" cy="220" r="3"/>' +
      '<circle cx="180" cy="30" r="1.5"/><circle cx="320" cy="180" r="2"/></svg>';

    app.innerHTML =
      '<header class="pg-topbar">' +
      '<a class="pg-back" href="../" aria-label="Back">←</a>' +
      '<span class="pg-title">Parents & Grandparents</span>' +
      '<span class="pg-progress">' + progress + "</span></header>" +
      '<div class="pg-play">' +
      '<p class="pg-hint">Drag each word into the correct basket</p>' +
      '<div class="pg-sky" id="pg-sky">' + deco + skyWords + "</div>" +
      '<div class="pg-baskets">' + basketsHtml + "</div></div>";

    app.querySelectorAll(".pg-word").forEach(function (el) {
      el.addEventListener("pointerdown", onPointerDown);
    });
    app.addEventListener("pointermove", onPointerMove);
    app.addEventListener("pointerup", onPointerUp);
    app.addEventListener("pointercancel", onPointerUp);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="pg-topbar">' +
        '<a class="pg-back" href="../" aria-label="Back">←</a>' +
        '<span class="pg-title">Parents & Grandparents</span>' +
        '<span class="pg-badge">4A</span></header>' +
        '<section class="pg-start">' +
        '<div class="pg-hero" aria-hidden="true">' + SVG.hero + "</div>" +
        "<h1>Parents & Grandparents</h1>" +
        '<p class="pg-desc">Drag the floating words into the correct basket.</p>' +
        '<button type="button" class="pg-btn" id="pg-start">Start</button></section>';
      document.getElementById("pg-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: WORDS.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML =
        '<header class="pg-topbar">' +
        '<a class="pg-back" href="../" aria-label="Back">←</a>' +
        '<span class="pg-title">Parents & Grandparents</span>' +
        '<span class="pg-badge">Done</span></header>' +
        '<section class="pg-done">' +
        '<div class="pg-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) + "</div>" +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") +
        "</h1>" +
        '<p class="pg-desc">You sorted all 4 family words' +
        (mistakes ? " · " + mistakes + " wrong drop" + (mistakes > 1 ? "s" : "") : " with no mistakes") +
        ".</p>" +
        '<button type="button" class="pg-btn" id="pg-again">Play again</button>' +
        '<button type="button" class="pg-btn secondary" id="pg-menu">Back to start</button></section>';
      document.getElementById("pg-again").onclick = startGame;
      document.getElementById("pg-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    renderPlay();
  }

  render();
})();
