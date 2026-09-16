/* Flashcards · AEF Starter Unit 4A – People / Family */
(function () {
  const GAME_ID = "starter-4a-flashcards";

  const PEOPLE = [
    {
      word: "a boy",
      img: "https://cdn.imgurl.ir/uploads/j32676_a_boy.png",
      audio: "https://cdn.imgurl.ir/uploads/x49928_a_boy.mp3",
    },
    {
      word: "boys",
      img: "https://cdn.imgurl.ir/uploads/p89886_boys.png",
      audio: null,
    },
    {
      word: "a girl",
      img: "https://cdn.imgurl.ir/uploads/x380536_a_girl.png",
      audio: "https://cdn.imgurl.ir/uploads/u112773_a_girl.mp3",
    },
    {
      word: "girls",
      img: "https://cdn.imgurl.ir/uploads/s214064_girls.png",
      audio: null,
    },
    {
      word: "a man",
      img: "https://cdn.imgurl.ir/uploads/v783842_a_man.png",
      audio: "https://cdn.imgurl.ir/uploads/s917684_a_man.mp3",
    },
    {
      word: "men",
      img: "https://cdn.imgurl.ir/uploads/y680208_men.png",
      audio: "https://cdn.imgurl.ir/uploads/h502483_men.mp3",
    },
    {
      word: "a woman",
      img: "https://cdn.imgurl.ir/uploads/h323022_a_woman.png",
      audio: "https://cdn.imgurl.ir/uploads/v986812_a_woman.mp3",
    },
    {
      word: "women",
      img: "https://cdn.imgurl.ir/uploads/z383_women.png",
      audio: "https://cdn.imgurl.ir/uploads/m6698_women.mp3",
    },
    {
      word: "a child",
      img: "https://cdn.imgurl.ir/uploads/k129607_a_child.png",
      audio: "https://cdn.imgurl.ir/uploads/t473361_a_child.mp3",
    },
    {
      word: "children",
      img: "https://cdn.imgurl.ir/uploads/a886217_children.png",
      audio: "https://cdn.imgurl.ir/uploads/t396967_children.mp3",
    },
    {
      word: "friends",
      img: "https://cdn.imgurl.ir/uploads/f770775_friends.png",
      audio: "https://cdn.imgurl.ir/uploads/b838575_friends.mp3",
    },
    {
      word: "a person",
      img: "https://cdn.imgurl.ir/uploads/c7535_a_person.png",
      audio: "https://cdn.imgurl.ir/uploads/v15174_a_person.mp3",
    },
    {
      word: "people",
      img: "https://cdn.imgurl.ir/uploads/p77734_peoe.png",
      audio: "https://cdn.imgurl.ir/uploads/j853298_peoe.mp3",
    },
  ];

  // Family set
  const FAMILY = [
    {
      word: "husband",
      img: "https://cdn.imgurl.ir/uploads/v05888_husband_and_wife.png",
      audio: "audio/husband.mp3",
    },
    {
      word: "wife",
      img: "https://cdn.imgurl.ir/uploads/v05888_husband_and_wife.png",
      audio: "audio/wife.mp3",
    },
    {
      word: "mother",
      img: "https://cdn.imgurl.ir/uploads/w912873_family.png",
      audio: "audio/mother.mp3",
    },
    {
      word: "father",
      img: "https://cdn.imgurl.ir/uploads/w912873_family.png",
      audio: "audio/father.mp3",
    },
    {
      word: "son",
      img: "https://cdn.imgurl.ir/uploads/w912873_family.png",
      audio: "audio/son.mp3",
    },
    {
      word: "daughter",
      img: "https://cdn.imgurl.ir/uploads/w912873_family.png",
      audio: "audio/daughter.mp3",
    },
    {
      word: "brother",
      img: "https://cdn.imgurl.ir/uploads/o02428_siblings.png",
      audio: "audio/brother.mp3",
    },
    {
      word: "sister",
      img: "https://cdn.imgurl.ir/uploads/o02428_siblings.png",
      audio: "audio/sister.mp3",
    },
    {
      word: "grandmother",
      img: "https://cdn.imgurl.ir/uploads/m92485_grandparents.png",
      audio: "audio/grandmother.mp3",
    },
    {
      word: "grandfather",
      img: "https://cdn.imgurl.ir/uploads/m92485_grandparents.png",
      audio: "audio/grandfather.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = null; // "all" | "people" | "family"
  let deck = [];
  let index = 0;
  let flipped = false;
  let currentAudio = null;
  let playRecorded = false;

  function getDeck(m) {
    if (m === "people") return PEOPLE.slice();
    if (m === "family") return FAMILY.slice();
    // all = people + family
    return PEOPLE.concat(FAMILY);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(url) {
    if (!url) return;
    stopAudio();
    const a = new Audio(url);
    currentAudio = a;
    const btn = document.getElementById("fc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function recordPlay() {
    if (!playRecorded && window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      playRecorded = true;
      LAStars.save(GAME_ID, 1);
    }
  }

  function startMode(m) {
    if (m === "family" && FAMILY.length === 0) {
      // still allow opening with empty message
    }
    mode = m;
    deck = getDeck(m);
    index = 0;
    flipped = false;
    recordPlay();
    render();
  }

  function goMenu() {
    stopAudio();
    mode = null;
    render();
  }

  function next() {
    stopAudio();
    if (index < deck.length - 1) {
      index++;
      flipped = false;
      renderCard();
    }
  }

  function prev() {
    stopAudio();
    if (index > 0) {
      index--;
      flipped = false;
      renderCard();
    }
  }

  function flip() {
    flipped = !flipped;
    const card = document.getElementById("fc-card");
    if (card) card.classList.toggle("is-flipped", flipped);
  }

  function playCurrent() {
    const item = deck[index];
    if (item && item.audio) playAudio(item.audio);
  }

  function bindCardSwipe() {
    const stage = app.querySelector(".fc-stage");
    const card = document.getElementById("fc-card");
    if (!stage || !card) return;

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let tracking = false;
    let moved = false;
    const SWIPE = 60;
    const TAP = 12;

    function onStart(e) {
      const p = e.touches ? e.touches[0] : e;
      tracking = true;
      moved = false;
      startX = p.clientX;
      startY = p.clientY;
      dx = 0;
      dy = 0;
      card.style.transition = "none";
    }

    function onMove(e) {
      if (!tracking) return;
      const p = e.touches ? e.touches[0] : e;
      dx = p.clientX - startX;
      dy = p.clientY - startY;
      if (Math.abs(dx) > TAP || Math.abs(dy) > TAP) moved = true;
      // only drag horizontally for feedback
      if (Math.abs(dx) > Math.abs(dy)) {
        const rot = dx * 0.04;
        card.style.transform = "translateX(" + dx * 0.35 + "px) rotate(" + rot + "deg)";
        if (e.cancelable) e.preventDefault();
      }
    }

    function onEnd() {
      if (!tracking) return;
      tracking = false;
      card.style.transition = "";
      card.style.transform = "";

      if (!moved) {
        flip();
        return;
      }

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE) {
        if (dx < 0) next();
        else prev();
      }
    }

    // pointer events on stage so whole area works
    stage.addEventListener("pointerdown", onStart);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    stage.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }

  function renderMenu() {
    const familyDisabled = FAMILY.length === 0;
    app.innerHTML = `
      <header class="fc-topbar">
        <a class="fc-back-btn" href="../" aria-label="Back">←</a>
        <span class="fc-title">Flashcards</span>
        <span class="fc-badge">4A</span>
      </header>
      <section class="fc-menu">
        <div class="fc-hero" aria-hidden="true">📇</div>
        <h1>Flashcards</h1>
        <p class="fc-desc">Practice people and family words with pictures and audio.</p>
        <div class="fc-modes">
          <button type="button" class="fc-mode-btn" data-mode="all">
            <span class="fc-mode-icon">📚</span>
            <span class="fc-mode-label">Flashcards</span>
            <span class="fc-mode-count">${PEOPLE.length + FAMILY.length} cards</span>
          </button>
          <button type="button" class="fc-mode-btn" data-mode="people">
            <span class="fc-mode-icon">👥</span>
            <span class="fc-mode-label">People</span>
            <span class="fc-mode-count">${PEOPLE.length} cards</span>
          </button>
          <button type="button" class="fc-mode-btn ${familyDisabled ? "is-empty" : ""}" data-mode="family">
            <span class="fc-mode-icon">👨‍👩‍👧</span>
            <span class="fc-mode-label">Family</span>
            <span class="fc-mode-count">${familyDisabled ? "Coming soon" : FAMILY.length + " cards"}</span>
          </button>
        </div>
      </section>`;

    app.querySelectorAll(".fc-mode-btn").forEach((btn) => {
      btn.onclick = () => {
        const m = btn.dataset.mode;
        if (m === "family" && FAMILY.length === 0) return;
        startMode(m);
      };
    });
  }

  function renderCard() {
    const item = deck[index];
    if (!item) return;

    const hasImg = !!item.img;
    const imgHtml = hasImg
      ? `<img class="fc-img" src="${item.img}" alt="${item.word}" draggable="false">`
      : `<div class="fc-img-placeholder"><span>${item.word.charAt(0).toUpperCase()}</span></div>`;

    const hasAudio = !!item.audio;

    app.innerHTML = `
      <header class="fc-topbar">
        <button type="button" class="fc-back-btn" id="fc-menu" aria-label="Modes">←</button>
        <span class="fc-title">${mode === "people" ? "People" : mode === "family" ? "Family" : "Flashcards"}</span>
        <span class="fc-progress">${index + 1} / ${deck.length}</span>
      </header>

      <div class="fc-stage">
        <div class="fc-card ${flipped ? "is-flipped" : ""}" id="fc-card">
          <div class="fc-face fc-front">
            ${imgHtml}
            <p class="fc-tap-hint">Tap or swipe</p>
          </div>
          <div class="fc-face fc-back">
            <p class="fc-word">${item.word}</p>
            <p class="fc-tap-hint">Tap or swipe</p>
          </div>
        </div>

        <div class="fc-nav">
          <button type="button" class="fc-nav-btn" id="fc-prev" ${index === 0 ? "disabled" : ""} aria-label="Previous">←</button>
          <button type="button" class="fc-play ${hasAudio ? "" : "is-disabled"}" id="fc-play" aria-label="Play audio" ${hasAudio ? "" : "disabled"}>
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <button type="button" class="fc-nav-btn" id="fc-next" ${index >= deck.length - 1 ? "disabled" : ""} aria-label="Next">→</button>
        </div>
      </div>`;

    document.getElementById("fc-menu").onclick = goMenu;
    document.getElementById("fc-prev").onclick = prev;
    document.getElementById("fc-next").onclick = next;
    const playBtn = document.getElementById("fc-play");
    if (playBtn && hasAudio) {
      playBtn.onclick = () => playCurrent();
    }
    bindCardSwipe();
  }

  function render() {
    if (!mode) renderMenu();
    else if (deck.length === 0) {
      app.innerHTML = `
        <header class="fc-topbar">
          <button type="button" class="fc-back-btn" id="fc-menu" aria-label="Modes">←</button>
          <span class="fc-title">Family</span>
          <span class="fc-badge">4A</span>
        </header>
        <section class="fc-menu">
          <p class="fc-desc">Family cards coming soon.</p>
          <button type="button" class="fc-mode-btn" id="fc-back-menu">Back</button>
        </section>`;
      document.getElementById("fc-menu").onclick = goMenu;
      document.getElementById("fc-back-menu").onclick = goMenu;
    } else {
      renderCard();
    }
  }

  render();
})();
