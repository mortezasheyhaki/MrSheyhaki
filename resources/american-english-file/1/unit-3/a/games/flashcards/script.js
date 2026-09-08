(function () {

  function showStarBurst(n) {
    n = Math.max(0, Math.min(3, Number(n) || 0));
    if (n <= 0) return;
    var existing = document.getElementById("starBurst");
    if (existing) existing.remove();
    var wrap = document.createElement("div");
    wrap.id = "starBurst";
    wrap.className = "star-burst stars celebrate";
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

  const GAME_ID = "1-3a-flashcards";

  const CARDS = [
    { phrase: "cook dinner",          image: "images/cook-dinner.png",          audio: "audio/cook-dinner.mp3" },
    { phrase: "do homework",          image: "images/do-homework.png",          audio: "audio/do-homework.mp3" },
    { phrase: "do housework",         image: "images/do-housework.png",         audio: "audio/do-housework.mp3" },
    { phrase: "do yoga",              image: "images/do-yoga.png",              audio: "audio/do-yoga.mp3" },
    { phrase: "drink water",          image: "images/drink-water.png",          audio: "audio/drink-water.mp3" },
    { phrase: "drive a car",          image: "images/drive-a-car.png",          audio: "audio/drive-a-car.mp3" },
    { phrase: "eat vegetables",       image: "images/eat-vegetables.png",       audio: "audio/eat-vegetables.mp3" },
    { phrase: "go to the movies",     image: "images/go-to-the-movies.png",     audio: "audio/go-to-the-movies.mp3" },
    { phrase: "have a garden",        image: "images/have-a-garden.png",        audio: "audio/have-a-garden.mp3" },
    { phrase: "like animals",         image: "images/like-animals.png",         audio: "audio/like-animals.mp3" },
    { phrase: "listen to music",      image: "images/listen-to-music.png",      audio: "audio/listen-to-music.mp3" },
    { phrase: "live in an apartment", image: "images/live-in-an-apartment.png", audio: "audio/live-in-an-apartment.mp3" },
    { phrase: "need a new phone",     image: "images/need-a-new-phone.png",     audio: "audio/need-a-new-phone.mp3" },
    { phrase: "play tennis",          image: "images/play-tennis.png",          audio: "audio/play-tennis.mp3" },
    { phrase: "play the guitar",      image: "images/play-the-guitar.png",      audio: "audio/play-the-guitar.mp3" },
    { phrase: "read a book",          image: "images/read-a-book.png",          audio: "audio/read-a-book.mp3" },
    { phrase: "say sorry",            image: "images/say-sorry.png",            audio: "audio/say-sorry.mp3" },
    { phrase: "speak German",         image: "images/speak-german.png",         audio: "audio/speak-german.mp3" },
    { phrase: "study history",        image: "images/study-history.png",        audio: "audio/study-history.mp3" },
    { phrase: "take an umbrella",     image: "images/take-an-umbrella.png",     audio: "audio/take-an-umbrella.mp3" },
    { phrase: "want a coffee",        image: "images/want-a-coffee.png",        audio: "audio/want-a-coffee.mp3" },
    { phrase: "watch TV",             image: "images/watch-tv.png",             audio: "audio/watch-tv.mp3" },
    { phrase: "wear glasses",         image: "images/wear-glasses.png",         audio: "audio/wear-glasses.mp3" },
    { phrase: "work in an office",    image: "images/work-in-an-office.png",    audio: "audio/work-in-an-office.mp3" },
  ];

  const cardEl      = document.getElementById("card");
  const cardImage   = document.getElementById("cardImage");
  const cardPhrase  = document.getElementById("cardPhrase");
  const audioBtn    = document.getElementById("audioBtn");
  const prevBtn     = document.getElementById("prevBtn");
  const nextBtn     = document.getElementById("nextBtn");
  const flipBtn     = document.getElementById("flipBtn");
  const shuffleBtn  = document.getElementById("shuffleBtn");
  const restartBtn  = document.getElementById("restartBtn");
  const currentEl   = document.getElementById("current");
  const totalEl     = document.getElementById("total");
  const progressFill= document.getElementById("progressFill");

  let deck = [];
  let index = 0;
  let flipped = false;
  let currentAudio = null;

  // Swipe state
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let isDragging = false;

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
    audioBtn.classList.remove("playing");
  }

  function playAudio() {
    if (!deck[index]) return;
    stopAudio();
    const a = new Audio(deck[index].audio);
    currentAudio = a;
    audioBtn.classList.add("playing");
    a.play().catch(() => {});
    a.onended = () => {
      audioBtn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function updateCard(animateDirection) {
    const item = deck[index];
    if (!item) return;

    // Reset flip
    flipped = false;
    cardEl.classList.remove("flipped");
    stopAudio();

    // Optional slide animation
    if (animateDirection) {
      cardEl.style.transition = "none";
      cardEl.style.transform = `translateX(${animateDirection === "left" ? "-40px" : "40px"})`;
      cardEl.style.opacity = "0.5";
      requestAnimationFrame(() => {
        cardEl.style.transition = "transform .28s ease, opacity .28s ease";
        cardEl.style.transform = "translateX(0)";
        cardEl.style.opacity = "1";
      });
    }

    cardImage.src = item.image;
    cardImage.alt = item.phrase;
    cardPhrase.textContent = item.phrase;

    currentEl.textContent = index + 1;
    totalEl.textContent = deck.length;
    progressFill.style.width = ((index + 1) / deck.length * 100) + "%";

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === deck.length - 1;
  }

  function flip() {
    flipped = !flipped;
    cardEl.classList.toggle("flipped", flipped);
    if (flipped) {
      // auto-play when revealing
      setTimeout(playAudio, 280);
    } else {
      stopAudio();
    }
  }

  function goNext() {
    if (index < deck.length - 1) {
      index++;
      updateCard("left");
    }
  }

  function goPrev() {
    if (index > 0) {
      index--;
      updateCard("right");
    }
  }

  function start(shuffled) {
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.saveFromAccuracy(GAME_ID, 100); showStarBurst(3); }

    deck = shuffled ? shuffle(CARDS) : [...CARDS];
    index = 0;
    updateCard();
  }

  // Click to flip
  cardEl.addEventListener("click", (e) => {
    // ignore if it was a swipe
    if (Math.abs(deltaX) > 12) return;
    // don't flip when clicking the audio button on the back
    if (e.target.closest(".audio-btn")) return;
    flip();
  });

  audioBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    playAudio();
  });

  flipBtn.addEventListener("click", flip);
  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
  shuffleBtn.addEventListener("click", () => start(true));
  restartBtn.addEventListener("click", () => start(false));

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      goPrev();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flip();
    }
  });

  // Touch / mouse swipe
  function onStart(x, y) {
    startX = x;
    startY = y;
    deltaX = 0;
    isDragging = true;
    cardEl.classList.add("swiping");
  }

  function onMove(x) {
    if (!isDragging) return;
    deltaX = x - startX;
    // slight follow
    const rot = deltaX * 0.08;
    cardEl.querySelector(".card-inner").style.transform =
      `translateX(${deltaX * 0.6}px) rotate(${rot}deg)` + (flipped ? " rotateY(180deg)" : "");
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    cardEl.classList.remove("swiping");

    const inner = cardEl.querySelector(".card-inner");
    inner.style.transform = "";

    if (Math.abs(deltaX) > 70) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
    // reset for click detection
    setTimeout(() => { deltaX = 0; }, 50);
  }

  // Touch events
  cardEl.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });

  cardEl.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    onMove(t.clientX);
  }, { passive: true });

  cardEl.addEventListener("touchend", onEnd);

  // Mouse drag (desktop)
  cardEl.addEventListener("mousedown", (e) => {
    onStart(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) => {
    if (isDragging) onMove(e.clientX);
  });
  window.addEventListener("mouseup", onEnd);

  // Init
  totalEl.textContent = CARDS.length;
  start(false);
})();
