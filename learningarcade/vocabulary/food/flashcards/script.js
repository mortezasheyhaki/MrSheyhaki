(function () {
  "use strict";

  var BANK = [
    { id: "apples", word: "apples", img: "../match-rush/images/apples.png", audio: "../match-rush/audio/apples.mp3" },
    { id: "bananas", word: "bananas", img: "../match-rush/images/bananas.png", audio: "../match-rush/audio/bananas.mp3" },
    { id: "bread", word: "bread", img: "../match-rush/images/bread.png", audio: "../match-rush/audio/bread.mp3" },
    { id: "butter", word: "butter", img: "../match-rush/images/butter.png", audio: "../match-rush/audio/butter.mp3" },
    { id: "cake", word: "cake", img: "../match-rush/images/cake.png", audio: "../match-rush/audio/cake.mp3" },
    { id: "candies", word: "candy", img: "../match-rush/images/candies.png", audio: "../match-rush/audio/candy.mp3" },
    { id: "carrots", word: "carrots", img: "../match-rush/images/carrots.png", audio: "../match-rush/audio/carrots.mp3" },
    { id: "cereal", word: "cereal", img: "../match-rush/images/cereal.png", audio: "../match-rush/audio/cereal.mp3" },
    { id: "cheese", word: "cheese", img: "../match-rush/images/cheese.png", audio: "../match-rush/audio/cheese.mp3" },
    { id: "chicken", word: "chicken", img: "../match-rush/images/chicken.png", audio: "../match-rush/audio/chicken.mp3" },
    { id: "chocolate", word: "chocolate", img: "../match-rush/images/chocolate.png", audio: "../match-rush/audio/chocolate.mp3" },
    { id: "coffee", word: "coffee", img: "../match-rush/images/coffee.png", audio: "../match-rush/audio/coffee.mp3" },
    { id: "cookies", word: "cookies", img: "../match-rush/images/cookies.png", audio: "../match-rush/audio/cookies.mp3" },
    { id: "eggs", word: "eggs", img: "../match-rush/images/eggs.png", audio: "../match-rush/audio/eggs.mp3" },
    { id: "fish", word: "fish", img: "../match-rush/images/fish.png", audio: "../match-rush/audio/fish.mp3" },
    { id: "fries", word: "French fries", img: "../match-rush/images/french fries.png", audio: "../match-rush/audio/french fries.mp3" },
    { id: "fruit_salad", word: "fruit salad", img: "../match-rush/images/fruit salad.png", audio: "../match-rush/audio/fruit salad.mp3" },
    { id: "herbs", word: "herbs", img: "../match-rush/images/herbs.png", audio: "../match-rush/audio/herbs.mp3" },
    { id: "ice_cream", word: "ice cream", img: "../match-rush/images/ice cream.png", audio: "../match-rush/audio/Ice cream.mp3" },
    { id: "jam", word: "jam", img: "../match-rush/images/jam.png", audio: "../match-rush/audio/jam.mp3" },
    { id: "juice", word: "juice", img: "../match-rush/images/juice.png", audio: "../match-rush/audio/juice.mp3" },
    { id: "lettuce", word: "lettuce", img: "../match-rush/images/lettuce.png", audio: "../match-rush/audio/lettuce.mp3" },
    { id: "meat", word: "meat", img: "../match-rush/images/meat.png", audio: "../match-rush/audio/meat.mp3" },
    { id: "milk", word: "milk", img: "../match-rush/images/milk.png", audio: "../match-rush/audio/milk.mp3" },
    { id: "mushrooms", word: "mushrooms", img: "../match-rush/images/mushrooms.png", audio: "../match-rush/audio/mushrooms.mp3" },
    { id: "nuts", word: "nuts", img: "../match-rush/images/nuts.png", audio: "../match-rush/audio/nuts.mp3" },
    { id: "oil", word: "oil", img: "../match-rush/images/oil.png", audio: "../match-rush/audio/oil.mp3" },
    { id: "onions", word: "onions", img: "../match-rush/images/onions.png", audio: "../match-rush/audio/onions.mp3" },
    { id: "oranges", word: "oranges", img: "../match-rush/images/oranges.png", audio: "../match-rush/audio/oranges.mp3" },
    { id: "pasta", word: "pasta", img: "../match-rush/images/pasta.png", audio: "../match-rush/audio/pasta.mp3" },
    { id: "peas", word: "peas", img: "../match-rush/images/peas.png", audio: "../match-rush/audio/peas.mp3" },
    { id: "peppers", word: "peppers", img: "../match-rush/images/peppers.png", audio: "../match-rush/audio/peppers.mp3" },
    { id: "pineapple", word: "pineapple", img: "../match-rush/images/pineapple.png", audio: "../match-rush/audio/a pineapple.mp3" },
    { id: "potato_chips", word: "potato chips", img: "../match-rush/images/potato chips.png", audio: "../match-rush/audio/potato chips.mp3" },
    { id: "potatoes", word: "potatoes", img: "../match-rush/images/potatoes.png", audio: "../match-rush/audio/potatoes.mp3" },
    { id: "rice", word: "rice", img: "../match-rush/images/rice.png", audio: "../match-rush/audio/rice.mp3" },
    { id: "salad", word: "salad", img: "../match-rush/images/salad.png", audio: "../match-rush/audio/salad.mp3" },
    { id: "sandwich", word: "sandwich", img: "../match-rush/images/sandwich.png", audio: "../match-rush/audio/a sandwich.mp3" },
    { id: "sausages", word: "sausages", img: "../match-rush/images/sausages.png", audio: "../match-rush/audio/sausages.mp3" },
    { id: "seafood", word: "seafood", img: "../match-rush/images/seafood.png", audio: "../match-rush/audio/seafood.mp3" },
    { id: "spices", word: "spices", img: "../match-rush/images/spices.png", audio: "../match-rush/audio/spices.mp3" },
    { id: "strawberries", word: "strawberries", img: "../match-rush/images/strawberries.png", audio: "../match-rush/audio/strawberries.mp3" },
    { id: "tea", word: "tea", img: "../match-rush/images/tea.png", audio: "../match-rush/audio/tea.mp3" },
    { id: "toast", word: "toast", img: "../match-rush/images/toast.png", audio: "../match-rush/audio/toast.mp3" },
    { id: "tomatoes", word: "tomatoes", img: "../match-rush/images/tomatoes.png", audio: "../match-rush/audio/tomatoes.mp3" }
  ];

  var STORAGE_KEY = "la-food-flash-known";
  var $ = function (id) { return document.getElementById(id); };

  var mode = "pic-first"; // pic-first | word-first
  var deck = [];
  var index = 0;
  var flipped = false;
  var known = loadKnown();
  var currentAudio = null;

  function loadKnown() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      var set = {};
      (arr || []).forEach(function (id) { set[id] = true; });
      return set;
    } catch (e) {
      return {};
    }
  }

  function saveKnown() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.keys(known)));
    } catch (e) {}
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function show(screen) {
    function setHidden(el, isHidden) {
      if (!el) return;
      el.hidden = isHidden;
      if (isHidden) el.setAttribute("hidden", "");
      else el.removeAttribute("hidden");
    }
    setHidden($("startScreen"), screen !== "start");
    setHidden($("studyScreen"), screen !== "study");
  }

  function knownCount() {
    var n = 0;
    deck.forEach(function (c) { if (known[c.id]) n++; });
    return n;
  }

  function updateMeta() {
    if ($("counterText")) $("counterText").textContent = (index + 1) + " / " + deck.length;
    if ($("knownText")) $("knownText").textContent = knownCount() + " known";
    if ($("progressFill")) {
      $("progressFill").style.width = deck.length ? Math.round(((index + 1) / deck.length) * 100) + "%" : "0%";
    }
    var card = deck[index];
    var isKnown = card && known[card.id];
    if ($("knowBtn")) {
      $("knowBtn").setAttribute("aria-pressed", isKnown ? "true" : "false");
    }
    if ($("flashCard")) {
      $("flashCard").classList.toggle("is-known", !!isKnown);
    }
  }

  function renderCard() {
    var card = deck[index];
    if (!card) return;
    flipped = false;
    if ($("flashCard")) $("flashCard").classList.remove("is-flipped");

    var frontImg = $("frontImg");
    var frontWord = $("frontWord");
    var backWord = $("backWord");
    var backImg = $("backImg");

    if (mode === "pic-first") {
      if (frontImg) {
        frontImg.hidden = false;
        frontImg.src = card.img;
        frontImg.alt = card.word;
      }
      if (frontWord) frontWord.hidden = true;
      if (backWord) {
        backWord.hidden = false;
        backWord.textContent = card.word;
      }
      if (backImg) backImg.hidden = true;
    } else {
      if (frontImg) frontImg.hidden = true;
      if (frontWord) {
        frontWord.hidden = false;
        frontWord.textContent = card.word;
      }
      if (backWord) backWord.hidden = true;
      if (backImg) {
        backImg.hidden = false;
        backImg.src = card.img;
        backImg.alt = card.word;
      }
    }
    updateMeta();
  }

  function flip() {
    flipped = !flipped;
    if ($("flashCard")) $("flashCard").classList.toggle("is-flipped", flipped);
    // Auto-play audio when revealing the word side
    var revealingWord =
      (mode === "pic-first" && flipped) ||
      (mode === "word-first" && !flipped);
    if (revealingWord || flipped) {
      // play on flip to word side primarily
      if (mode === "pic-first" && flipped) playAudio();
      if (mode === "word-first" && !flipped) playAudio();
    }
  }

  function playAudio() {
    var card = deck[index];
    if (!card || !card.audio) return;
    try {
      if (currentAudio) { try { currentAudio.pause(); } catch (e) {} }
      var a = new Audio(card.audio);
      currentAudio = a;
      a.volume = 0.9;
      if ($("audioBtn")) $("audioBtn").classList.add("is-playing");
      a.play().catch(function () {});
      a.onended = function () {
        if ($("audioBtn")) $("audioBtn").classList.remove("is-playing");
      };
    } catch (e) {}
  }

  function go(delta) {
    if (!deck.length) return;
    index = (index + delta + deck.length) % deck.length;
    renderCard();
  }

  function toggleKnown() {
    var card = deck[index];
    if (!card) return;
    if (known[card.id]) delete known[card.id];
    else known[card.id] = true;
    saveKnown();
    updateMeta();
  }

  function start() {
    deck = shuffle(BANK.slice());
    index = 0;
    show("study");
    renderCard();
  }

  function selectMode(next) {
    mode = next === "word-first" ? "word-first" : "pic-first";
    document.querySelectorAll(".mode-tab").forEach(function (tab) {
      var on = tab.getAttribute("data-mode") === mode;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  if ($("startBtn")) $("startBtn").addEventListener("click", start);
  if ($("backToStart")) $("backToStart").addEventListener("click", function () { show("start"); });
  if ($("flashCard")) $("flashCard").addEventListener("click", flip);
  if ($("prevBtn")) $("prevBtn").addEventListener("click", function () { go(-1); });
  if ($("nextBtn")) $("nextBtn").addEventListener("click", function () { go(1); });
  if ($("audioBtn")) $("audioBtn").addEventListener("click", playAudio);
  if ($("knowBtn")) $("knowBtn").addEventListener("click", toggleKnown);
  if ($("shuffleBtn")) {
    $("shuffleBtn").addEventListener("click", function () {
      var currentId = deck[index] && deck[index].id;
      deck = shuffle(deck);
      index = 0;
      if (currentId) {
        for (var i = 0; i < deck.length; i++) {
          if (deck[i].id === currentId) { index = i; break; }
        }
      }
      renderCard();
    });
  }
  if ($("modeTabs")) {
    $("modeTabs").addEventListener("click", function (e) {
      var tab = e.target.closest(".mode-tab");
      if (!tab) return;
      selectMode(tab.getAttribute("data-mode"));
    });
  }

  // Keyboard
  document.addEventListener("keydown", function (e) {
    if ($("studyScreen") && $("studyScreen").hidden) return;
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); if (e.key === " ") flip(); else go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowUp" || e.key === "Enter") { e.preventDefault(); flip(); }
    if (e.key === "m" || e.key === "M") playAudio();
    if (e.key === "k" || e.key === "K") toggleKnown();
  });
})();
