(function () {
  const GAME_ID = "1-3a-match-sounds";


  function showStarBurst(n) {
    n = Math.max(0, Math.min(3, Number(n) || 0));
    if (n <= 0) return;
    var existing = document.getElementById("starBurst");
    if (existing) existing.remove();
    var wrap = document.createElement("div");
    wrap.id = "starBurst";
    wrap.className = "star-burst stars celebrate";
    wrap.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= 3; i++) {
      var s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled pop" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = ((i - 1) * 0.18) + "s";
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(function () {
      wrap.classList.add("star-burst-out");
      setTimeout(function () { wrap.remove(); }, 500);
    }, 2200);
  }

  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    if (window.LAStars) {
      LAStars.recordPlay(gameId || GAME_ID);
      LAStars.saveFromAccuracy(gameId || GAME_ID, pct);
    }
    showStarBurst(stars);
    return stars;
  }

  const ITEMS = [
    { id: 1, phrase: "speak German", audio: "audio/1-speak-german.mp3" },
    { id: 2, phrase: "drink water", audio: "audio/2-drink-water.mp3" },
    { id: 3, phrase: "watch TV", audio: "audio/3-watch-tv.mp3" },
    { id: 4, phrase: "play the guitar", audio: "audio/4-play-the-guitar.mp3" },
    { id: 5, phrase: "like animals", audio: "audio/5-like-animals.mp3" },
  ];

  const soundsEl = document.getElementById("sounds");
  const phrasesEl = document.getElementById("phrases");
  const scoreEl = document.getElementById("score");
  const feedbackEl = document.getElementById("feedback");
  const resetBtn = document.getElementById("resetBtn");
  const confettiEl = document.getElementById("confetti");

  let selectedSound = null;
  let selectedPhrase = null;
  let matched = new Set();
  let score = 0;
  let currentAudio = null;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    document.querySelectorAll(".sound-card.playing").forEach((c) => c.classList.remove("playing"));
  }

  function playSound(item, card) {
    stopAudio();
    const audio = new Audio(item.audio);
    currentAudio = audio;
    card.classList.add("playing");
    audio.play().catch(() => {});
    audio.onended = () => {
      card.classList.remove("playing");
      if (currentAudio === audio) currentAudio = null;
    };
  }

  function render() {
    soundsEl.innerHTML = "";
    phrasesEl.innerHTML = "";
    matched.clear();
    score = 0;
    scoreEl.textContent = "0";
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    selectedSound = null;
    selectedPhrase = null;
    stopAudio();

    const soundOrder = shuffle(ITEMS);
    const phraseOrder = shuffle(ITEMS);

    soundOrder.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "sound-card";
      card.dataset.id = item.id;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Play sound ${idx + 1}`);
      card.innerHTML = `
        <div class="play-btn" aria-hidden="true">
          <span class="wave"></span>
          <span class="wave"></span>
          <span class="wave"></span>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <div class="eq">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="sound-text">
          <div class="sound-label">Sound ${idx + 1}</div>
          <div class="sound-hint">Tap to listen</div>
        </div>
      `;
      card.addEventListener("click", () => onSoundClick(item, card));
      soundsEl.appendChild(card);
    });

    phraseOrder.forEach((item) => {
      const card = document.createElement("div");
      card.className = "phrase-card";
      card.dataset.id = item.id;
      card.textContent = item.phrase;
      card.addEventListener("click", () => onPhraseClick(item, card));
      phrasesEl.appendChild(card);
    });
  }

  function clearSelection() {
    document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
    selectedSound = null;
    selectedPhrase = null;
  }

  function onSoundClick(item, card) {
    if (matched.has(item.id)) return;
    playSound(item, card);

    if (selectedSound && selectedSound.card === card) {
      clearSelection();
      return;
    }
    document.querySelectorAll(".sound-card.selected").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedSound = { item, card };

    if (selectedPhrase) tryMatch();
  }

  function onPhraseClick(item, card) {
    if (matched.has(item.id)) return;

    if (selectedPhrase && selectedPhrase.card === card) {
      clearSelection();
      return;
    }
    document.querySelectorAll(".phrase-card.selected").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedPhrase = { item, card };

    if (selectedSound) tryMatch();
  }

  function tryMatch() {
    if (!selectedSound || !selectedPhrase) return;

    const s = selectedSound;
    const p = selectedPhrase;

    if (s.item.id === p.item.id) {
      // correct
      matched.add(s.item.id);
      s.card.classList.add("matched");
      p.card.classList.add("matched");
      s.card.classList.remove("selected");
      p.card.classList.remove("selected");
      score++;
      scoreEl.textContent = score;
      feedbackEl.textContent = "Great match!";
      feedbackEl.className = "feedback success";
      selectedSound = null;
      selectedPhrase = null;

      if (score === ITEMS.length) {
        feedbackEl.textContent = "Perfect! You matched all 5 🎉";
        awardStars(GAME_ID, score, ITEMS.length);
        launchConfetti();
      }
    } else {
      // wrong
      s.card.classList.add("wrong");
      p.card.classList.add("wrong");
      feedbackEl.textContent = "Try again!";
      feedbackEl.className = "feedback error";
      setTimeout(() => {
        s.card.classList.remove("wrong", "selected");
        p.card.classList.remove("wrong", "selected");
        selectedSound = null;
        selectedPhrase = null;
        feedbackEl.textContent = "";
      }, 600);
    }
  }

  function launchConfetti() {
    const colors = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];
    for (let i = 0; i < 60; i++) {
      const span = document.createElement("span");
      span.style.left = Math.random() * 100 + "%";
      span.style.background = colors[i % colors.length];
      span.style.animationDuration = 1.5 + Math.random() * 1.5 + "s";
      span.style.animationDelay = Math.random() * 0.4 + "s";
      confettiEl.appendChild(span);
      setTimeout(() => span.remove(), 3500);
    }
  }

  resetBtn.addEventListener("click", render);
  render();
})();
