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

  var PAIRS_PER_ROUND = 15;
  var TOTAL_ROUNDS = 3;
  var GAME_ID = "vocab-food-memory";
  var PHONE_MQ = "(max-width: 700px)";
  var $ = function (id) { return document.getElementById(id); };

  var queue = [];
  var cards = [];
  var flipped = [];
  var matchedInRound = 0;
  var pairsThisRound = 0;
  var totalMatched = 0;
  var totalPairs = 0;
  var roundNum = 0;
  var moves = 0;
  var locked = false;
  var startedAt = 0;
  var timerId = null;
  var currentAudio = null;

  function isPhone() {
    return window.matchMedia && window.matchMedia(PHONE_MQ).matches;
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
    setHidden($("gameScreen"), screen !== "game");
    setHidden($("endScreen"), screen !== "end");
  }

  function setFb(msg, type) {
    var fb = $("feedback");
    if (!fb) return;
    fb.textContent = msg || "";
    fb.className = "feedback" + (type ? " " + type : "");
  }

  function formatTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function updateHud() {
    if ($("movesText")) $("movesText").textContent = String(moves);
    if ($("matchedText")) $("matchedText").textContent = totalMatched + " / " + totalPairs;
    if ($("roundText")) $("roundText").textContent = roundNum + " / " + TOTAL_ROUNDS;
    if ($("timeText") && startedAt) $("timeText").textContent = formatTime(Date.now() - startedAt);
  }

  function playAudio(src) {
    if (!src) return;
    try {
      if (currentAudio) { try { currentAudio.pause(); } catch (e) {} }
      var a = new Audio(src);
      currentAudio = a;
      a.volume = 0.85;
      a.play().catch(function () {});
    } catch (e) {}
  }

  function makeCard(c) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mem-card";
    btn.dataset.key = c.key;
    btn.setAttribute("aria-label", "Hidden card");

    var inner = document.createElement("div");
    inner.className = "mem-inner";

    var back = document.createElement("div");
    back.className = "mem-face mem-back";
    back.textContent = "?";

    var front = document.createElement("div");
    front.className = "mem-face mem-front";
    if (c.type === "pic") {
      var img = document.createElement("img");
      img.src = c.img;
      img.alt = c.word;
      img.draggable = false;
      front.appendChild(img);
    } else {
      var w = document.createElement("span");
      w.className = "word";
      w.textContent = c.word;
      front.appendChild(w);
    }

    inner.appendChild(back);
    inner.appendChild(front);
    btn.appendChild(inner);
    btn.addEventListener("click", function () { onFlip(c, btn); });
    c.el = btn;
    return btn;
  }

  function renderRound() {
    var board = $("board");
    var wordsCol = $("wordsCol");
    var picsCol = $("picsCol");
    var labels = document.querySelector(".split-labels");
    var phone = isPhone();

    if (board) {
      board.classList.toggle("is-mixed", phone);
      board.classList.toggle("is-split", !phone);
    }
    if (labels) labels.hidden = phone;

    if (phone) {
      // Mixed single grid
      if (wordsCol) wordsCol.innerHTML = "";
      if (picsCol) picsCol.innerHTML = "";
      // Use wordsCol as the mixed grid container; hide picsCol
      if (wordsCol) {
        wordsCol.className = "col col-mixed";
        wordsCol.setAttribute("aria-label", "Memory cards");
        cards.forEach(function (c) { wordsCol.appendChild(makeCard(c)); });
      }
      if (picsCol) {
        picsCol.innerHTML = "";
        picsCol.hidden = true;
      }
    } else {
      if (picsCol) picsCol.hidden = false;
      if (wordsCol) {
        wordsCol.className = "col col-words";
        wordsCol.setAttribute("aria-label", "Word cards");
        wordsCol.innerHTML = "";
      }
      if (picsCol) {
        picsCol.className = "col col-pics";
        picsCol.innerHTML = "";
      }
      var words = cards.filter(function (c) { return c.type === "word"; });
      var pics = cards.filter(function (c) { return c.type === "pic"; });
      // reshuffle each side for desktop split
      words = shuffle(words);
      pics = shuffle(pics);
      words.forEach(function (c) { wordsCol.appendChild(makeCard(c)); });
      pics.forEach(function (c) { picsCol.appendChild(makeCard(c)); });
    }

    if ($("promptText")) {
      $("promptText").textContent =
        "Round " + roundNum + " of " + TOTAL_ROUNDS +
        (phone ? " · Find each match" : " · Flip a word, then its picture");
    }
    setFb(phone ? "Flip two cards to match" : "Flip a word, then its picture", "");
    updateHud();
  }

  function nextRound() {
    if (queue.length === 0 || roundNum >= TOTAL_ROUNDS) {
      finish();
      return;
    }
    roundNum++;
    var batch = queue.splice(0, Math.min(PAIRS_PER_ROUND, queue.length));
    pairsThisRound = batch.length;
    matchedInRound = 0;
    flipped = [];

    var list = [];
    batch.forEach(function (item) {
      list.push({
        pairId: item.id,
        type: "word",
        word: item.word,
        img: item.img,
        audio: item.audio,
        key: item.id + "-word-r" + roundNum,
        matched: false
      });
      list.push({
        pairId: item.id,
        type: "pic",
        word: item.word,
        img: item.img,
        audio: item.audio,
        key: item.id + "-pic-r" + roundNum,
        matched: false
      });
    });
    cards = shuffle(list);
    renderRound();
  }

  function onFlip(card, el) {
    if (locked) return;
    if (card.matched) return;
    if (el.classList.contains("is-flipped")) return;
    if (flipped.length === 1 && flipped[0].card.key === card.key) return;

    // On desktop split: same-side retarget; on phone mixed: also retarget same type is ok to replace
    if (flipped.length === 1 && flipped[0].card.type === card.type) {
      flipped[0].el.classList.remove("is-flipped");
      flipped = [];
    }

    el.classList.add("is-flipped");
    flipped.push({ card: card, el: el });

    if (flipped.length < 2) {
      setFb("", "");
      return;
    }

    moves++;
    updateHud();
    locked = true;

    var a = flipped[0];
    var b = flipped[1];

    if (a.card.pairId === b.card.pairId && a.card.type !== b.card.type) {
      a.card.matched = true;
      b.card.matched = true;
      matchedInRound++;
      totalMatched++;
      a.el.classList.add("is-matched");
      b.el.classList.add("is-matched");
      a.el.disabled = true;
      b.el.disabled = true;
      setFb("Match!", "ok");
      playAudio(a.card.audio || b.card.audio);
      updateHud();
      flipped = [];
      locked = false;
      setTimeout(function () {
        a.el.classList.add("gone");
        b.el.classList.add("gone");
      }, 280);

      if (matchedInRound >= pairsThisRound) {
        setFb(roundNum < TOTAL_ROUNDS ? "Round clear! Next…" : "All done!", "ok");
        setTimeout(function () {
          if (roundNum >= TOTAL_ROUNDS || queue.length === 0) finish();
          else nextRound();
        }, 700);
      } else {
        setTimeout(function () {
          setFb(isPhone() ? "Flip two cards to match" : "Flip a word, then its picture", "");
        }, 450);
      }
    } else {
      a.el.classList.add("is-wrong");
      b.el.classList.add("is-wrong");
      setFb("Try again", "bad");
      setTimeout(function () {
        a.el.classList.remove("is-flipped", "is-wrong");
        b.el.classList.remove("is-flipped", "is-wrong");
        flipped = [];
        locked = false;
        setFb(isPhone() ? "Flip two cards to match" : "Flip a word, then its picture", "");
      }, 700);
    }
  }

  function finish() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    var elapsed = Date.now() - startedAt;
    if ($("finalMoves")) $("finalMoves").textContent = String(moves);
    if ($("finalTime")) $("finalTime").textContent = formatTime(elapsed);
    if ($("finalPairs")) $("finalPairs").textContent = String(totalMatched);

    var ideal = Math.max(totalMatched, 1);
    var ratio = ideal / Math.max(moves, 1);
    var stars = ratio >= 0.7 ? 3 : ratio >= 0.45 ? 2 : ratio >= 0.25 ? 1 : 0;
    if (totalMatched > 0 && stars < 1) stars = 1;

    if ($("endTitle")) {
      $("endTitle").textContent = stars === 3 ? "Amazing memory!" : stars === 2 ? "Great job!" : "Nice practice!";
    }
    if ($("endSummary")) {
      $("endSummary").textContent =
        TOTAL_ROUNDS + " rounds · " + totalMatched + " pairs · " + moves + " moves · " + formatTime(elapsed);
    }

    var acc = Math.min(100, Math.round(ratio * 100));
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
        LAStars.apply($("endScreen"));
      }
    } catch (e) {}

    var endEl = $("endScreen");
    if (endEl) {
      endEl.querySelectorAll(".star").forEach(function (el) {
        var n = Number(el.getAttribute("data-n") || 0);
        el.classList.toggle("is-filled", n <= stars);
        el.textContent = n <= stars ? "★" : "☆";
      });
    }
    show("end");
  }

  function start() {
    queue = shuffle(BANK.slice());
    totalPairs = Math.min(BANK.length, PAIRS_PER_ROUND * TOTAL_ROUNDS);
    queue = queue.slice(0, totalPairs);
    totalMatched = 0;
    matchedInRound = 0;
    roundNum = 0;
    moves = 0;
    flipped = [];
    locked = false;
    startedAt = Date.now();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateHud, 500);
    show("game");
    nextRound();
  }

  if ($("startBtn")) $("startBtn").addEventListener("click", start);
  if ($("playAgainBtn")) $("playAgainBtn").addEventListener("click", function () { show("start"); });
})();
