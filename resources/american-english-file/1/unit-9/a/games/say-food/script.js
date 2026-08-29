/* =========================================================
   SAY FOOD — voice recognition · 45 food words
   Mr. Sheyhaki | American English File 1 · Unit 9A
   Place at: resources/.../unit-9/a/games/say-food/
   ========================================================= */

(function () {
  "use strict";

  const GAME_ID = "vocab-say-food";

  // Paths relative to learningarcade/vocabulary/food/say-food/
  const BANK = [
    { id: "apples", word: "apples", img: "/learningarcade/vocabulary/food/match-rush/images/apples.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/apples.mp3", accept: ["apples", "apple"] },
    { id: "bananas", word: "bananas", img: "/learningarcade/vocabulary/food/match-rush/images/bananas.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/bananas.mp3", accept: ["bananas", "banana"] },
    { id: "bread", word: "bread", img: "/learningarcade/vocabulary/food/match-rush/images/bread.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/bread.mp3", accept: ["bread"] },
    { id: "butter", word: "butter", img: "/learningarcade/vocabulary/food/match-rush/images/butter.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/butter.mp3", accept: ["butter"] },
    { id: "cake", word: "cake", img: "/learningarcade/vocabulary/food/match-rush/images/cake.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/cake.mp3", accept: ["cake"] },
    { id: "candies", word: "candy", img: "/learningarcade/vocabulary/food/match-rush/images/candies.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/candy.mp3", accept: ["candy", "candies", "sweets"] },
    { id: "carrots", word: "carrots", img: "/learningarcade/vocabulary/food/match-rush/images/carrots.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/carrots.mp3", accept: ["carrots", "carrot"] },
    { id: "cereal", word: "cereal", img: "/learningarcade/vocabulary/food/match-rush/images/cereal.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/cereal.mp3", accept: ["cereal"] },
    { id: "cheese", word: "cheese", img: "/learningarcade/vocabulary/food/match-rush/images/cheese.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/cheese.mp3", accept: ["cheese"] },
    { id: "chicken", word: "chicken", img: "/learningarcade/vocabulary/food/match-rush/images/chicken.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/chicken.mp3", accept: ["chicken"] },
    { id: "chocolate", word: "chocolate", img: "/learningarcade/vocabulary/food/match-rush/images/chocolate.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/chocolate.mp3", accept: ["chocolate"] },
    { id: "coffee", word: "coffee", img: "/learningarcade/vocabulary/food/match-rush/images/coffee.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/coffee.mp3", accept: ["coffee"] },
    { id: "cookies", word: "cookies", img: "/learningarcade/vocabulary/food/match-rush/images/cookies.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/cookies.mp3", accept: ["cookies", "cookie", "biscuits", "biscuit"] },
    { id: "eggs", word: "eggs", img: "/learningarcade/vocabulary/food/match-rush/images/eggs.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/eggs.mp3", accept: ["eggs", "egg"] },
    { id: "fish", word: "fish", img: "/learningarcade/vocabulary/food/match-rush/images/fish.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/fish.mp3", accept: ["fish"] },
    { id: "fries", word: "French fries", img: "/learningarcade/vocabulary/food/match-rush/images/french fries.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/french fries.mp3", accept: ["french fries", "fries", "chips"] },
    { id: "fruit_salad", word: "fruit salad", img: "/learningarcade/vocabulary/food/match-rush/images/fruit salad.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/fruit salad.mp3", accept: ["fruit salad", "fruitsalad"] },
    { id: "herbs", word: "herbs", img: "/learningarcade/vocabulary/food/match-rush/images/herbs.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/herbs.mp3", accept: ["herbs", "herb"] },
    { id: "ice_cream", word: "ice cream", img: "/learningarcade/vocabulary/food/match-rush/images/ice cream.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/Ice cream.mp3", accept: ["ice cream", "icecream"] },
    { id: "jam", word: "jam", img: "/learningarcade/vocabulary/food/match-rush/images/jam.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/jam.mp3", accept: ["jam"] },
    { id: "juice", word: "juice", img: "/learningarcade/vocabulary/food/match-rush/images/juice.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/juice.mp3", accept: ["juice"] },
    { id: "lettuce", word: "lettuce", img: "/learningarcade/vocabulary/food/match-rush/images/lettuce.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/lettuce.mp3", accept: ["lettuce", "a lettuce"] },
    { id: "meat", word: "meat", img: "/learningarcade/vocabulary/food/match-rush/images/meat.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/meat.mp3", accept: ["meat"] },
    { id: "milk", word: "milk", img: "/learningarcade/vocabulary/food/match-rush/images/milk.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/milk.mp3", accept: ["milk"] },
    { id: "mushrooms", word: "mushrooms", img: "/learningarcade/vocabulary/food/match-rush/images/mushrooms.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/mushrooms.mp3", accept: ["mushrooms", "mushroom"] },
    { id: "nuts", word: "nuts", img: "/learningarcade/vocabulary/food/match-rush/images/nuts.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/nuts.mp3", accept: ["nuts", "nut"] },
    { id: "oil", word: "oil", img: "/learningarcade/vocabulary/food/match-rush/images/oil.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/oil.mp3", accept: ["oil", "olive oil"] },
    { id: "onions", word: "onions", img: "/learningarcade/vocabulary/food/match-rush/images/onions.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/onions.mp3", accept: ["onions", "onion"] },
    { id: "oranges", word: "oranges", img: "/learningarcade/vocabulary/food/match-rush/images/oranges.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/oranges.mp3", accept: ["oranges", "orange"] },
    { id: "pasta", word: "pasta", img: "/learningarcade/vocabulary/food/match-rush/images/pasta.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/pasta.mp3", accept: ["pasta"] },
    { id: "peas", word: "peas", img: "/learningarcade/vocabulary/food/match-rush/images/peas.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/peas.mp3", accept: ["peas", "pea"] },
    { id: "peppers", word: "peppers", img: "/learningarcade/vocabulary/food/match-rush/images/peppers.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/peppers.mp3", accept: ["peppers", "pepper"] },
    { id: "pineapple", word: "pineapple", img: "/learningarcade/vocabulary/food/match-rush/images/pineapple.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/a pineapple.mp3", accept: ["pineapple", "a pineapple"] },
    { id: "potato_chips", word: "potato chips", img: "/learningarcade/vocabulary/food/match-rush/images/potato chips.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/potato chips.mp3", accept: ["potato chips", "chips", "crisps"] },
    { id: "potatoes", word: "potatoes", img: "/learningarcade/vocabulary/food/match-rush/images/potatoes.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/potatoes.mp3", accept: ["potatoes", "potato"] },
    { id: "rice", word: "rice", img: "/learningarcade/vocabulary/food/match-rush/images/rice.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/rice.mp3", accept: ["rice"] },
    { id: "salad", word: "salad", img: "/learningarcade/vocabulary/food/match-rush/images/salad.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/salad.mp3", accept: ["salad"] },
    { id: "sandwich", word: "sandwich", img: "/learningarcade/vocabulary/food/match-rush/images/sandwich.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/a sandwich.mp3", accept: ["sandwich", "a sandwich"] },
    { id: "sausages", word: "sausages", img: "/learningarcade/vocabulary/food/match-rush/images/sausages.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/sausages.mp3", accept: ["sausages", "sausage"] },
    { id: "seafood", word: "seafood", img: "/learningarcade/vocabulary/food/match-rush/images/seafood.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/seafood.mp3", accept: ["seafood", "sea food"] },
    { id: "spices", word: "spices", img: "/learningarcade/vocabulary/food/match-rush/images/spices.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/spices.mp3", accept: ["spices", "spice"] },
    { id: "strawberries", word: "strawberries", img: "/learningarcade/vocabulary/food/match-rush/images/strawberries.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/strawberries.mp3", accept: ["strawberries", "strawberry"] },
    { id: "tea", word: "tea", img: "/learningarcade/vocabulary/food/match-rush/images/tea.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/tea.mp3", accept: ["tea"] },
    { id: "toast", word: "toast", img: "/learningarcade/vocabulary/food/match-rush/images/toast.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/toast.mp3", accept: ["toast"] },
    { id: "tomatoes", word: "tomatoes", img: "/learningarcade/vocabulary/food/match-rush/images/tomatoes.png", audio: "/learningarcade/vocabulary/food/match-rush/audio/tomatoes.mp3", accept: ["tomatoes", "tomato"] }
  ];

  // ---------- Speech API ----------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasSpeech = !!SpeechRecognition;

  // ---------- State ----------
  let deck = [];
  let index = 0;
  let score = 0;
  let triesLeft = 3;
  let listening = false;
  let locked = false;
  let recognition = null;
  let currentAudio = null;

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const playScreen = $("playScreen");
  const endScreen = $("endScreen");
  const startBtn = $("startBtn");
  const micNote = $("micNote");
  const micBtn = $("micBtn");
  const micIcon = $("micIcon");
  const micLabel = $("micLabel");
  const hearBtn = $("hearBtn");
  const skipBtn = $("skipBtn");
  const foodCard = $("foodCard");
  const foodImg = $("foodImg");
  const promptText = $("promptText");
  const heardText = $("heardText");
  const feedback = $("feedback");
  const progressText = $("progressText");
  const scoreText = $("scoreText");
  const triesText = $("triesText");
  const progressFill = $("progressFill");
  const againBtn = $("againBtn");

  // ---------- Helpers ----------
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(transcript, item) {
    const t = normalize(transcript);
    if (!t) return false;
    // exact or contains accepted phrase
    return item.accept.some((a) => {
      const n = normalize(a);
      return t === n || t.includes(n) || n.includes(t);
    });
  }

  function showScreen(name) {
    startScreen.hidden = name !== "start";
    playScreen.hidden = name !== "play";
    endScreen.hidden = name !== "end";
  }

  function showFeedback(type, msg) {
    feedback.hidden = false;
    feedback.className = "feedback " + type;
    feedback.textContent = msg;
  }

  function hideFeedback() {
    feedback.hidden = true;
  }

  function playModelAudio() {
    const item = deck[index];
    if (!item) return;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentAudio = new Audio(item.audio);
    currentAudio.play().catch(() => {});
  }

  // ---------- Recognition ----------
  function stopListening() {
    listening = false;
    micBtn.classList.remove("listening");
    micIcon.textContent = "🎤";
    micLabel.textContent = "Tap & speak";
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  function startListening() {
    if (!hasSpeech || locked || listening) return;

    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        stopListening();
        const alts = [];
        for (let i = 0; i < event.results[0].length; i++) {
          alts.push(event.results[0][i].transcript);
        }
        handleResult(alts);
      };

      recognition.onerror = (event) => {
        stopListening();
        if (event.error === "no-speech") {
          showFeedback("info", "No speech detected. Try again.");
        } else if (event.error === "not-allowed") {
          showFeedback("error", "Microphone blocked. Allow mic access.");
        } else {
          showFeedback("info", "Could not hear you. Try again.");
        }
      };

      recognition.onend = () => {
        if (listening) stopListening();
      };
    }

    hideFeedback();
    heardText.hidden = true;
    foodCard.classList.remove("correct", "wrong");
    listening = true;
    micBtn.classList.add("listening");
    micIcon.textContent = "🔴";
    micLabel.textContent = "Listening…";

    try {
      recognition.start();
    } catch (e) {
      stopListening();
      showFeedback("error", "Could not start microphone.");
    }
  }

  function handleResult(alts) {
    const item = deck[index];
    const best = alts[0] || "";
    heardText.hidden = false;
    heardText.innerHTML = `Heard: <strong>${escapeHtml(best)}</strong>`;

    const ok = alts.some((t) => isMatch(t, item));

    if (ok) {
      locked = true;
      foodCard.classList.add("correct");
      score++;
      scoreText.textContent = String(score);
      showFeedback("success", "Correct! ✓  " + item.word);
      playModelAudio();
      setTimeout(() => nextCard(true), 1100);
    } else {
      triesLeft--;
      triesText.textContent = String(triesLeft);
      foodCard.classList.add("wrong");
      setTimeout(() => foodCard.classList.remove("wrong"), 400);

      if (triesLeft <= 0) {
        locked = true;
        showFeedback("error", "Answer: " + item.word);
        playModelAudio();
        setTimeout(() => nextCard(false), 1600);
      } else {
        showFeedback("error", `Not quite. ${triesLeft} tr${triesLeft === 1 ? "y" : "ies"} left.`);
      }
    }
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // ---------- Cards ----------
  function updateProgress() {
    progressText.textContent = (index + 1) + " / " + deck.length;
    progressFill.style.width = Math.round(((index + 1) / deck.length) * 100) + "%";
    triesText.textContent = String(triesLeft);
    scoreText.textContent = String(score);
  }

  function showCard() {
    const item = deck[index];
    locked = false;
    triesLeft = 3;
    hideFeedback();
    heardText.hidden = true;
    foodCard.classList.remove("correct", "wrong");
    foodImg.src = item.img;
    foodImg.alt = "Food item";
    promptText.textContent = "Say the food word";
    updateProgress();
  }

  function nextCard(wasCorrect) {
    index++;
    if (index >= deck.length) {
      finish();
      return;
    }
    showCard();
  }

  function finish() {
    stopListening();
    const acc = deck.length ? Math.round((score / deck.length) * 100) : 0;
    $("finalScore").textContent = score + " / " + deck.length;
    $("finalAcc").textContent = acc + "%";
    $("endTitle").textContent =
      acc === 100 ? "Perfect!" : acc >= 70 ? "Great job!" : "Good practice!";
    $("endSummary").textContent =
      "You said " + score + " of " + deck.length + " words correctly.";

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}

    showScreen("end");
  }

  function startGame() {
    deck = shuffle(BANK);
    index = 0;
    score = 0;
    showScreen("play");
    showCard();
  }

  // ---------- Events ----------
  startBtn.addEventListener("click", () => {
    if (!hasSpeech) {
      showFeedback("error", "Speech recognition not supported in this browser. Use Chrome or Edge.");
      return;
    }
    startGame();
  });

  micBtn.addEventListener("click", () => {
    if (locked) return;
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  });

  hearBtn.addEventListener("click", () => {
    playModelAudio();
  });

  skipBtn.addEventListener("click", () => {
    if (locked) return;
    stopListening();
    locked = true;
    const item = deck[index];
    showFeedback("info", "Skipped · " + item.word);
    playModelAudio();
    setTimeout(() => nextCard(false), 900);
  });

  againBtn.addEventListener("click", startGame);

  // ---------- Init ----------
  if (!hasSpeech) {
    micNote.textContent = "⚠️ Voice recognition needs Chrome, Edge, or Safari.";
    startBtn.disabled = true;
    startBtn.textContent = "Not supported";
  } else {
    micNote.textContent = "Works best in Chrome / Edge. Allow microphone when asked.";
  }
})();
