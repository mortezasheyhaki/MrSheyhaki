(function () {
  "use strict";

  /**
   * Food Match Rush — 3 modes
   *  word-pic   : left words  · right pictures
   *  audio-word : left audio  · right words
   *  audio-pic  : left audio  · right pictures
   * 5 pairs per round. Audio plays on every correct match.
   */

  var BANK = [
    { id: "apples", word: "apples", img: "images/apples.png", audio: "audio/apples.mp3" },
    { id: "bananas", word: "bananas", img: "images/bananas.png", audio: "audio/bananas.mp3" },
    { id: "bread", word: "bread", img: "images/bread.png", audio: "audio/bread.mp3" },
    { id: "butter", word: "butter", img: "images/butter.png", audio: "audio/butter.mp3" },
    { id: "cake", word: "cake", img: "images/cake.png", audio: "audio/cake.mp3" },
    { id: "candies", word: "candy", img: "images/candies.png", audio: "audio/candy.mp3" },
    { id: "carrots", word: "carrots", img: "images/carrots.png", audio: "audio/carrots.mp3" },
    { id: "cereal", word: "cereal", img: "images/cereal.png", audio: "audio/cereal.mp3" },
    { id: "cheese", word: "cheese", img: "images/cheese.png", audio: "audio/cheese.mp3" },
    { id: "chicken", word: "chicken", img: "images/chicken.png", audio: "audio/chicken.mp3" },
    { id: "chocolate", word: "chocolate", img: "images/chocolate.png", audio: "audio/chocolate.mp3" },
    { id: "coffee", word: "coffee", img: "images/coffee.png", audio: "audio/coffee.mp3" },
    { id: "cookies", word: "cookies", img: "images/cookies.png", audio: "audio/cookies.mp3" },
    { id: "eggs", word: "eggs", img: "images/eggs.png", audio: "audio/eggs.mp3" },
    { id: "fish", word: "fish", img: "images/fish.png", audio: "audio/fish.mp3" },
    { id: "fries", word: "French fries", img: "images/french fries.png", audio: "audio/french fries.mp3" },
    { id: "fruit_salad", word: "fruit salad", img: "images/fruit salad.png", audio: "audio/fruit salad.mp3" },
    { id: "herbs", word: "herbs", img: "images/herbs.png", audio: "audio/herbs.mp3" },
    { id: "ice_cream", word: "ice cream", img: "images/ice cream.png", audio: "audio/Ice cream.mp3" },
    { id: "jam", word: "jam", img: "images/jam.png", audio: "audio/jam.mp3" },
    { id: "juice", word: "juice", img: "images/juice.png", audio: "audio/juice.mp3" },
    { id: "lettuce", word: "lettuce", img: "images/lettuce.png", audio: "audio/lettuce.mp3" },
    { id: "meat", word: "meat", img: "images/meat.png", audio: "audio/meat.mp3" },
    { id: "milk", word: "milk", img: "images/milk.png", audio: "audio/milk.mp3" },
    { id: "mushrooms", word: "mushrooms", img: "images/mushrooms.png", audio: "audio/mushrooms.mp3" },
    { id: "nuts", word: "nuts", img: "images/nuts.png", audio: "audio/nuts.mp3" },
    { id: "oil", word: "oil", img: "images/oil.png", audio: "audio/oil.mp3" },
    { id: "onions", word: "onions", img: "images/onions.png", audio: "audio/onions.mp3" },
    { id: "oranges", word: "oranges", img: "images/oranges.png", audio: "audio/oranges.mp3" },
    { id: "pasta", word: "pasta", img: "images/pasta.png", audio: "audio/pasta.mp3" },
    { id: "peas", word: "peas", img: "images/peas.png", audio: "audio/peas.mp3" },
    { id: "peppers", word: "peppers", img: "images/peppers.png", audio: "audio/peppers.mp3" },
    { id: "pineapple", word: "pineapple", img: "images/pineapple.png", audio: "audio/a pineapple.mp3" },
    { id: "potato_chips", word: "potato chips", img: "images/potato chips.png", audio: "audio/potato chips.mp3" },
    { id: "potatoes", word: "potatoes", img: "images/potatoes.png", audio: "audio/potatoes.mp3" },
    { id: "rice", word: "rice", img: "images/rice.png", audio: "audio/rice.mp3" },
    { id: "salad", word: "salad", img: "images/salad.png", audio: "audio/salad.mp3" },
    { id: "salmon", word: "salmon", img: "images/salmon.png", audio: "audio/salmon.mp3" },
    { id: "sandwich", word: "sandwich", img: "images/sandwich.png", audio: "audio/a sandwich.mp3" },
    { id: "sausages", word: "sausages", img: "images/sausages.png", audio: "audio/sausages.mp3" },
    { id: "seafood", word: "seafood", img: "images/seafood.png", audio: "audio/seafood.mp3" },
    { id: "spices", word: "spices", img: "images/spices.png", audio: "audio/spices.mp3" },
    { id: "steak", word: "steak", img: "images/steak.png", audio: "audio/steak.mp3" },
    { id: "strawberries", word: "strawberries", img: "images/strawberries.png", audio: "audio/strawberries.mp3" },
    { id: "tea", word: "tea", img: "images/tea.png", audio: "audio/tea.mp3" },
    { id: "toast", word: "toast", img: "images/toast.png", audio: "audio/toast.mp3" },
    { id: "tomatoes", word: "tomatoes", img: "images/tomatoes.png", audio: "audio/tomatoes.mp3" },
    { id: "tuna", word: "tuna", img: "images/tuna.png", audio: "audio/tuna.mp3" }
  ];

  var MODES = {
    "word-pic": {
      label: "Word · Pic",
      prompt: "Match the word with its picture",
      hint: "Tap a word, then a picture",
      left: "word",
      right: "pic"
    },
    "audio-word": {
      label: "Audio · Word",
      prompt: "Listen, then tap the word",
      hint: "Tap the speaker, then the word",
      left: "audio",
      right: "word"
    },
    "audio-pic": {
      label: "Audio · Pic",
      prompt: "Listen, then tap the picture",
      hint: "Tap the speaker, then the picture",
      left: "audio",
      right: "pic"
    }
  };

  var PER_ROUND = 5;
  var GAME_ID = "vocab-food-match-rush";
  var $ = function (id) { return document.getElementById(id); };

  var mode = "word-pic";
  var queue = [];
  var roundItems = [];
  var selected = null;
  var matchedInRound = 0;
  var totalMatched = 0;
  var totalPairs = 0;
  var roundNum = 0;
  var totalRounds = 0;
  var xp = 0;
  var combo = 0;
  var bestCombo = 0;
  var attempts = 0;
  var correctMatches = 0;
  var locked = false;
  var startedAt = 0;
  var timerId = null;
  var currentAudio = null;
  var leftEls = {};
  var rightEls = {};

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
    if ($("xpText")) $("xpText").textContent = String(xp);
    if ($("comboText")) $("comboText").textContent = String(combo);
    if ($("matchedText")) $("matchedText").textContent = totalMatched + " / " + totalPairs;
    if ($("roundText")) $("roundText").textContent = roundNum + " / " + totalRounds;
  }

  function floatXp(amount, el) {
    var layer = $("fxLayer");
    if (!layer || !el) return;
    var rect = el.getBoundingClientRect();
    var node = document.createElement("div");
    node.className = "fx-xp";
    node.textContent = "+" + amount;
    node.style.left = rect.left + rect.width / 2 - 12 + "px";
    node.style.top = rect.top + "px";
    layer.appendChild(node);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 950);
  }

  function playAudio(src, btn) {
    if (!src) return;
    try {
      if (currentAudio) {
        try { currentAudio.pause(); } catch (e) {}
        currentAudio = null;
      }
      document.querySelectorAll(".card.audio-card.is-playing").forEach(function (el) {
        el.classList.remove("is-playing");
      });
      var a = new Audio(src);
      currentAudio = a;
      a.volume = 0.9;
      if (btn) btn.classList.add("is-playing");
      a.play().catch(function () {
        if (btn) btn.classList.remove("is-playing");
      });
      a.onended = function () {
        if (btn) btn.classList.remove("is-playing");
        if (currentAudio === a) currentAudio = null;
      };
    } catch (e) {}
  }

  function clearSelection() {
    selected = null;
    Object.keys(leftEls).forEach(function (id) {
      if (leftEls[id]) leftEls[id].classList.remove("selected", "wrong");
    });
    Object.keys(rightEls).forEach(function (id) {
      if (rightEls[id]) rightEls[id].classList.remove("selected", "wrong");
    });
  }

  function makeWordCard(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card word-card";
    btn.dataset.id = item.id;
    btn.setAttribute("aria-label", item.word);
    var span = document.createElement("span");
    span.className = "word";
    span.textContent = item.word;
    btn.appendChild(span);
    return btn;
  }

  function makePicCard(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card pic";
    btn.dataset.id = item.id;
    btn.setAttribute("aria-label", "Picture of " + item.word);
    var img = document.createElement("img");
    img.src = item.img;
    img.alt = item.word;
    img.decoding = "async";
    img.draggable = false;
    btn.appendChild(img);
    return btn;
  }

  function makeAudioCard(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card audio-card";
    btn.dataset.id = item.id;
    btn.setAttribute("aria-label", "Play audio");
    btn.innerHTML =
      '<span class="audio-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
      '</span><span class="audio-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    return btn;
  }

  function renderRound() {
    var leftCol = $("leftCol");
    var rightCol = $("rightCol");
    if (!leftCol || !rightCol) return;
    leftCol.innerHTML = "";
    rightCol.innerHTML = "";
    leftEls = {};
    rightEls = {};
    selected = null;
    matchedInRound = 0;

    var cfg = MODES[mode];
    var leftOrder = shuffle(roundItems);
    var rightOrder = shuffle(roundItems);

    leftOrder.forEach(function (item) {
      var btn;
      if (cfg.left === "word") btn = makeWordCard(item);
      else if (cfg.left === "pic") btn = makePicCard(item);
      else btn = makeAudioCard(item);

      btn.addEventListener("click", function () {
        if (cfg.left === "audio") {
          playAudio(item.audio, btn);
        }
        onTap("left", item, btn);
      });
      leftCol.appendChild(btn);
      leftEls[item.id] = btn;
    });

    rightOrder.forEach(function (item) {
      var btn;
      if (cfg.right === "word") btn = makeWordCard(item);
      else if (cfg.right === "pic") btn = makePicCard(item);
      else btn = makeAudioCard(item);

      btn.addEventListener("click", function () {
        if (cfg.right === "audio") {
          playAudio(item.audio, btn);
        }
        onTap("right", item, btn);
      });
      rightCol.appendChild(btn);
      rightEls[item.id] = btn;
    });

    if ($("promptText")) $("promptText").textContent = cfg.prompt;
    setFb(cfg.hint, "");
    updateHud();
  }

  function nextRound() {
    if (queue.length === 0) {
      finish();
      return;
    }
    roundNum++;
    roundItems = queue.splice(0, Math.min(PER_ROUND, queue.length));
    renderRound();
  }

  function onTap(side, item, el) {
    if (locked) return;
    if (el.classList.contains("matched") || el.classList.contains("gone")) return;

    if (!selected) {
      clearSelection();
      selected = { side: side, item: item, el: el };
      el.classList.add("selected");
      setFb("", "");
      return;
    }

    if (selected.side === side) {
      clearSelection();
      selected = { side: side, item: item, el: el };
      el.classList.add("selected");
      return;
    }

    attempts++;
    var a = selected;
    var b = { side: side, item: item, el: el };
    el.classList.add("selected");

    if (a.item.id === b.item.id) {
      locked = true;
      correctMatches++;
      matchedInRound++;
      totalMatched++;
      combo++;
      if (combo > bestCombo) bestCombo = combo;

      var gain = 100;
      if (combo >= 2) gain += 50;
      if (combo >= 3) gain += 25;
      if (combo === 5) setFb("5 COMBO!", "combo");
      else if (combo >= 3) setFb("Combo x" + combo + "!", "combo");
      else setFb("Correct!", "ok");

      xp += gain;
      a.el.classList.remove("selected");
      b.el.classList.remove("selected");
      a.el.classList.add("matched");
      b.el.classList.add("matched");
      floatXp(gain, b.el);
      // Always play the word audio on a correct match
      playAudio(a.item.audio || b.item.audio, null);
      updateHud();

      setTimeout(function () {
        a.el.classList.add("gone");
        b.el.classList.add("gone");
        selected = null;
        locked = false;
        if (matchedInRound >= roundItems.length) {
          setTimeout(nextRound, 350);
        } else {
          setFb(combo >= 3 ? "Keep going!" : MODES[mode].hint, combo >= 3 ? "combo" : "");
        }
      }, 380);
    } else {
      locked = true;
      combo = 0;
      xp = Math.max(0, xp - 10);
      a.el.classList.add("wrong");
      b.el.classList.add("wrong");
      setFb("Try again", "bad");
      updateHud();
      setTimeout(function () {
        a.el.classList.remove("selected", "wrong");
        b.el.classList.remove("selected", "wrong");
        selected = null;
        locked = false;
        setFb(MODES[mode].hint, "");
      }, 280);
    }
  }

  function finish() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    var acc = attempts ? Math.round((correctMatches / attempts) * 100) : 0;
    if ($("finalXp")) $("finalXp").textContent = String(xp);
    if ($("finalAccuracy")) $("finalAccuracy").textContent = acc + "%";
    if ($("finalCombo")) $("finalCombo").textContent = String(bestCombo);
    if ($("endTitle")) {
      $("endTitle").textContent = acc === 100 && bestCombo >= 3 ? "Perfect rush!" : acc >= 70 ? "Great job!" : "Nice practice!";
    }
    if ($("endSummary")) {
      $("endSummary").textContent =
        MODES[mode].label + " · " + totalMatched + " matches · " + totalRounds + " rounds";
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
        LAStars.apply($("endScreen"));
      }
    } catch (e) {}
    var stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    var endEl = $("endScreen");
    if (endEl) {
      endEl.querySelectorAll(".star").forEach(function (el) {
        var n = Number(el.getAttribute("data-n") || 0);
        el.classList.toggle("is-filled", n <= stars);
        el.textContent = n <= stars ? "\u2605" : "\u2606";
      });
    }
    show("end");
  }

  function start() {
    queue = shuffle(BANK.slice());
    totalPairs = queue.length;
    totalRounds = Math.ceil(totalPairs / PER_ROUND);
    roundNum = 0;
    totalMatched = 0;
    matchedInRound = 0;
    xp = 0;
    combo = 0;
    bestCombo = 0;
    attempts = 0;
    correctMatches = 0;
    selected = null;
    locked = false;
    startedAt = Date.now();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateHud, 500);
    show("game");
    nextRound();
  }

  function selectMode(next) {
    if (!MODES[next]) return;
    mode = next;
    document.querySelectorAll(".mode-tab").forEach(function (tab) {
      var on = tab.getAttribute("data-mode") === mode;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  if ($("startBtn")) $("startBtn").addEventListener("click", start);
  if ($("playAgainBtn")) $("playAgainBtn").addEventListener("click", function () { show("start"); });
  if ($("backToModes")) $("backToModes").addEventListener("click", function () {
    if (timerId) { clearInterval(timerId); timerId = null; }
    show("start");
  });
  if ($("modeTabs")) {
    $("modeTabs").addEventListener("click", function (e) {
      var tab = e.target.closest(".mode-tab");
      if (!tab) return;
      selectMode(tab.getAttribute("data-mode"));
    });
  }
})();
