/* Clothes Sentence Challenge — AEF Starter Unit 9B
 * Part 1: build the target sentence with the clothes word bank.
 * Part 2: type the complete sentence.
 */
(function () {
  "use strict";

  var GAME_ID = "starter-9b-clothes-sentence-challenge";
  var IMAGE_BASE = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "he-cap-shirt-shorts-sneakers",
      image: IMAGE_BASE + "o634851_1_what_is_he_wearing.png",
      question: "What is he wearing?",
      sentence: ["He's", "wearing", "a", "cap", ",", "a", "shirt", ",", "shorts", "and", "sneakers."],
      targets: ["cap", "shirt", "shorts", "sneakers"],
      markerNumbers: [1, 2, 3, 4]
    },
    {
      id: "she-sweater-skirt-shoes",
      image: IMAGE_BASE + "n739549_2_what_is_she_wearing.png",
      question: "What is she wearing?",
      sentence: ["She's", "wearing", "a", "sweater", ",", "a", "skirt", "and", "shoes."],
      targets: ["sweater", "skirt", "shoes"],
      markerNumbers: [5, 6, 7]
    },
    {
      id: "he-jacket-shirt-jeans",
      image: IMAGE_BASE + "c571974_3_What_is_he_wearing.png",
      question: "What is he wearing?",
      sentence: ["He's", "wearing", "a", "jacket", ",", "a", "shirt", "and", "jeans."],
      targets: ["jacket", "shirt", "jeans"],
      markerNumbers: [8, 9, 10]
    },
    {
      id: "she-coat-dress",
      image: IMAGE_BASE + "m411084_4_what_is_she_wearing.png",
      question: "What is she wearing?",
      sentence: ["She's", "wearing", "a", "coat", "and", "a", "dress."],
      targets: ["coat", "dress"],
      markerNumbers: [11, 12]
    },
    {
      id: "they-suit-shoes-pants",
      image: IMAGE_BASE + "o675076_5_What_are_they_wearing.png",
      question: "What are they wearing?",
      sentence: ["He's", "wearing", "a", "suit", "and", "shoes", "and", "she's", "wearing", "pants."],
      targets: ["suit", "shoes", "pants"],
      markerNumbers: [13, 14, 15]
    }
  ];

  var CLOTHES = ["cap", "shirt", "shorts", "sneakers", "sweater", "skirt", "shoes", "jacket", "jeans", "coat", "dress", "suit", "pants"];
  var COLORS = ["red", "blue", "green", "black", "white", "yellow", "brown", "pink", "purple", "orange", "gray"];
  var WORDS = CLOTHES;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var index = 0;
  var part1Correct = 0;
  var part2Correct = 0;
  var currentSlots = [];
  var draggedWord = null;
  var audioCtx = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c];
    });
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.!?]+$/g, "");
  }

  function normalizeSentence(str) {
    return normalize(str)
      .replace(/[^a-z0-9\' ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // In this game the clothing items may be given in a different order.
  // The fixed sentence words (pronoun, wearing, articles, and, etc.) still
  // have to be present; only the clothing words are treated as reorderable.
  function sameWordMultiset(a, b) {
    var aa = normalizeSentence(a).split(" ").filter(Boolean).sort();
    var bb = normalizeSentence(b).split(" ").filter(Boolean).sort();
    if (aa.length !== bb.length) return false;
    for (var i = 0; i < aa.length; i++) {
      if (aa[i] !== bb[i]) return false;
    }
    return true;
  }

  function clothingOrderAccepted(values, targets) {
    if (!values || values.length !== targets.length || values.some(function (v) { return !v || !String(v).trim(); })) return false;
    var clothesOnly = values.map(function (v) {
      return String(v).trim().toLowerCase().split(/\s+/).filter(function (w) { return COLORS.indexOf(w) === -1; }).join(" ");
    });
    return sameWordMultiset(clothesOnly.join(" "), targets.join(" "));
  }

  function typedSentenceAccepted(input, item) {
    var cleaned = normalizeSentence(input);
    var target = normalizeSentence(sentenceText(item));
    var inputWords = cleaned.split(" ").filter(Boolean);
    var targetWords = target.split(" ").filter(Boolean);
    // Allow an optional color adjective immediately before any clothing item.
    var allowed = inputWords.filter(function (w, i) {
      if (COLORS.indexOf(w) === -1) return true;
      var next = inputWords[i + 1] || "";
      return CLOTHES.indexOf(next) !== -1;
    });
    return sameWordMultiset(allowed.join(" "), targetWords.join(" "));
  }
  function sfx(name) {
    try {
      if (window.LASfx) {
        if (name === "good" && LASfx.correct) return LASfx.correct();
        if (name === "bad" && LASfx.wrong) return LASfx.wrong();
        if (name === "click" && LASfx.click) return LASfx.click();
        if (name === "win" && LASfx.win) return LASfx.win();
      }
    } catch (_) {}
    // Small fallback for environments where the shared SFX helper is unavailable.
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var now = audioCtx.currentTime;
      osc.type = "sine";
      osc.frequency.value = name === "good" ? 720 : name === "bad" ? 180 : name === "win" ? 920 : 440;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(name === "bad" ? 0.05 : 0.08, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (name === "win" ? 0.32 : 0.11));
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.35);
    } catch (_) {}
  }

  function currentItem() { return ITEMS[order[index]]; }

  function sentenceText(item) { return item.sentence.join(" ").replace(/\s+([,.!?])/g, "$1"); }

  function renderTopbar(progressText) {
    return '<header class="csc-topbar">' +
      '<a class="csc-back" href="../" aria-label="Back">←</a>' +
      '<div class="csc-heading"><span class="csc-eyebrow">Starter · Unit 9B</span><span class="csc-title">Clothes Sentence Challenge</span></div>' +
      '<div class="csc-progress">' + escapeHtml(progressText || "") + '</div>' +
    '</header>';
  }

  function startGame() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0; part1Correct = 0; part2Correct = 0; currentSlots = [];
    phase = "part1";
    try { if (window.LAFinish) LAFinish.startTimer(); } catch (_) {}
    sfx("click");
    render();
  }

  function makeSentenceHtml(item, filled) {
    var targetIndex = 0;
    var out = [];
    item.sentence.forEach(function (token) {
      var clean = token.replace(/[.,]/g, "");
      var isTarget = item.targets.indexOf(clean) !== -1;
      if (isTarget) {
        var slotIndex = targetIndex++;
        var val = filled && filled[slotIndex] ? filled[slotIndex] : "";
        var label = val ? val : "____";
        out.push('<button type="button" class="csc-blank ' + (val ? "filled" : "empty") + '" data-slot="' + slotIndex + '" aria-label="' + (val ? "Blank " + (item.markerNumbers ? item.markerNumbers[slotIndex] : (slotIndex + 1)) + ": filled with " + escapeHtml(val) : "Blank " + (item.markerNumbers ? item.markerNumbers[slotIndex] : (slotIndex + 1)) + ": empty clothing blank") + '"><span class="csc-blank-number" aria-hidden="true">' + (item.markerNumbers ? item.markerNumbers[slotIndex] : (slotIndex + 1)) + '</span><span class="csc-blank-text">' + escapeHtml(label) + '</span></button>');
      } else {
        out.push('<span class="csc-token">' + escapeHtml(token) + '</span>');
      }
    });
    return out.join(" ");
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "continue") return renderContinue();
    if (phase === "part1") return renderPart1();
    if (phase === "part2") return renderPart2();
    if (phase === "done") return finishGame();
  }

  function renderStart() {
    app.innerHTML = renderTopbar("Start") +
      '<div class="csc-screen"><section class="csc-panel csc-start">' +
        '<div class="csc-icon" aria-hidden="true">👕✨</div>' +
        '<h1>Clothes Sentence Challenge</h1>' +
        '<p class="csc-lead">Look at the picture and build the sentence in Part 1. Then write the whole sentence yourself in Part 2.</p>' +
        '<div class="csc-steps"><span class="csc-step">1 · Build the sentence</span><span class="csc-step">2 · Type the sentence</span><span class="csc-step">⭐ Finish &amp; earn stars</span></div>' +
        '<button type="button" class="csc-btn" id="csc-start">Start game →</button>' +
      '</section></div>';
    document.getElementById("csc-start").onclick = startGame;
  }

  function renderContinue() {
    app.innerHTML = renderTopbar("Part 1 ✓") +
      '<div class="csc-screen"><section class="csc-panel csc-continue csc-encourage">' +
        '<div class="csc-stars-preview" aria-hidden="true"><span class="csc-star">★</span><span class="csc-star">★</span><span class="csc-star">★</span></div>' +
        '<h1>Fantastic work!</h1>' +
        '<p class="csc-lead">You finished Part 1! You are doing great. Now it is time to show what you can do on your own.</p>' +
        '<p class="csc-scoreline">Part 1 complete · ' + part1Correct + ' / ' + ITEMS.length + ' sentences built</p>' +
        '<button type="button" class="csc-btn" id="csc-continue">Continue to Part 2 →</button>' +
      '</section></div>';
    document.getElementById("csc-continue").onclick = function () { sfx("click"); phase = "part2"; index = 0; render(); setTimeout(function(){ var el=document.getElementById("csc-type"); if(el) el.focus(); },80); };
  }

  function renderPart1() {
    var item = currentItem();
    currentSlots = new Array(item.targets.length).fill("");
    var bank = shuffle(WORDS);
    app.innerHTML = renderTopbar("Part 1 · " + (index + 1) + " / " + ITEMS.length) +
      '<div class="csc-screen"><section class="csc-panel csc-play-panel"><div class="csc-play">' +
        '<div class="csc-visual"><div class="csc-image-box"><img class="csc-image" src="' + item.image + '" alt="Clothes picture" draggable="false"></div><p class="csc-question">' + escapeHtml(item.question) + '</p></div>' +
        '<div class="csc-content">' +
          '<span class="csc-part-label">Part 1 · Build it</span>' +
          '<div class="csc-sentence-card"><p class="csc-sentence" id="csc-sentence">' + makeSentenceHtml(item, currentSlots) + '</p></div>' +
          '<p class="csc-bank-title">Tap a word to fill the next blank, or drag it onto a blank. Clothing words can be in any order.</p>' +
          '<div class="csc-bank" id="csc-bank" aria-label="Clothes word bank">' + bank.map(function(w){ return '<button type="button" class="csc-word" draggable="true" data-word="' + escapeHtml(w) + '">' + escapeHtml(w) + '</button>'; }).join('') + '</div>' +
          '<p class="csc-feedback" id="csc-feedback" aria-live="polite"></p>' +
        '</div>' +
      '</div></section></div>';
    bindPart1();
  }

  function bindPart1() {
    var item = currentItem();
    document.querySelectorAll(".csc-word").forEach(function (word) {
      word.addEventListener("click", function () {
        var picked = word.dataset.word;
        var next = currentSlots.findIndex(function (x) {
          if (!x) return true;
          var parts = String(x).split(/\s+/);
          return isClothing(picked) && parts.length === 1 && isColor(parts[0]);
        });
        if (next < 0) return;
        placeWord(next, picked);
      });
      word.addEventListener("dragstart", function (e) {
        draggedWord = word.dataset.word;
        word.classList.add("dragging");
        e.dataTransfer.setData("text/plain", draggedWord);
        e.dataTransfer.effectAllowed = "copy";
      });
      word.addEventListener("dragend", function () { word.classList.remove("dragging"); draggedWord = null; });
      word.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse") return;
        draggedWord = word.dataset.word;
      });
    });
    document.querySelectorAll(".csc-blank").forEach(function (blank) {
      blank.addEventListener("click", function () {
        var slot = Number(blank.dataset.slot);
        if (currentSlots[slot]) {
          currentSlots[slot] = "";
          renderPart1KeepState();
        }
      });
      blank.addEventListener("dragover", function (e) { e.preventDefault(); blank.classList.add("drag-over"); });
      blank.addEventListener("dragleave", function () { blank.classList.remove("drag-over"); });
      blank.addEventListener("drop", function (e) {
        e.preventDefault(); blank.classList.remove("drag-over");
        var word = e.dataTransfer.getData("text/plain") || draggedWord;
        placeWord(Number(blank.dataset.slot), word);
      });
    });
  }

  function isColor(word) { return COLORS.indexOf(String(word).toLowerCase()) !== -1; }
  function isClothing(word) { return CLOTHES.indexOf(String(word).toLowerCase()) !== -1; }

  function placeWord(slot, word) {
    var item = currentItem();
    word = String(word || "").toLowerCase().trim();
    if (!word || slot < 0 || slot >= item.targets.length) return;
    var existing = currentSlots[slot] || "";

    if (isColor(word)) {
      if (!existing) currentSlots[slot] = word;
      else if (isClothing(existing)) currentSlots[slot] = word + " " + existing;
      else if (!existing.split(/\s+/).includes(word)) currentSlots[slot] = word + " " + existing;
    } else if (isClothing(word)) {
      var existingWords = existing.split(/\s+/).filter(Boolean);
      var existingClothing = existingWords.find(function (w) { return isClothing(w); });
      var existingColor = existingWords.find(function (w) { return isColor(w); });
      if (!existing) currentSlots[slot] = word;
      else if (existingColor && !existingClothing) currentSlots[slot] = existingColor + " " + word;
      else currentSlots[slot] = word;
    }

    sfx("click");
    renderPart1KeepState();
    if (currentSlots.every(Boolean) && currentSlots.every(function(v){ return String(v).split(/\s+/).some(isClothing); })) {
      var correctSentence = clothingOrderAccepted(currentSlots, item.targets);
      var feedback = document.getElementById("csc-feedback");
      if (correctSentence) {
        part1Correct++;
        if (feedback) { feedback.textContent = "✓ Excellent! The sentence is correct."; feedback.className = "csc-feedback good"; }
        sfx("good");
        setTimeout(function () {
          if (index < ITEMS.length - 1) { index++; render(); }
          else { phase = "continue"; render(); }
        }, 800);
      } else {
        if (feedback) { feedback.textContent = "Not quite. Tap a filled word to remove it, then try again."; feedback.className = "csc-feedback bad"; }
        sfx("bad");
      }
    }
  }

  function renderPart1KeepState() {
    var item = currentItem();
    var sentence = document.getElementById("csc-sentence");
    if (sentence) sentence.innerHTML = makeSentenceHtml(item, currentSlots);
    document.querySelectorAll(".csc-blank").forEach(function (blank) {
      var slot = Number(blank.dataset.slot);
      blank.classList.toggle("filled", !!currentSlots[slot]);
      blank.classList.toggle("empty", !currentSlots[slot]);
    });
    document.querySelectorAll(".csc-blank").forEach(function (blank) {
      blank.addEventListener("click", function () {
        var slot = Number(blank.dataset.slot);
        if (currentSlots[slot]) { currentSlots[slot] = ""; renderPart1KeepState(); }
      });
      blank.addEventListener("dragover", function (e) { e.preventDefault(); blank.classList.add("drag-over"); });
      blank.addEventListener("dragleave", function () { blank.classList.remove("drag-over"); });
      blank.addEventListener("drop", function (e) { e.preventDefault(); blank.classList.remove("drag-over"); placeWord(Number(blank.dataset.slot), e.dataTransfer.getData("text/plain") || draggedWord); });
    });
  }

  function renderPart2() {
    var item = currentItem();
    app.innerHTML = renderTopbar("Part 2 · " + (index + 1) + " / " + ITEMS.length) +
      '<div class="csc-screen"><section class="csc-panel csc-play-panel"><div class="csc-play">' +
        '<div class="csc-visual"><div class="csc-image-box"><img class="csc-image" src="' + item.image + '" alt="Clothes picture" draggable="false"></div><p class="csc-question">' + escapeHtml(item.question) + '</p></div>' +
        '<div class="csc-content">' +
          '<span class="csc-part-label">Part 2 · Your turn</span>' +
          '<div class="csc-sentence-card"><p class="csc-sentence">Look at the picture and write the whole sentence.</p></div>' +
          '<div class="csc-type-box"><input id="csc-type" class="csc-input" type="text" placeholder="Write the whole sentence…" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Write the whole sentence"><button type="button" class="csc-btn csc-check" id="csc-check">Check</button></div>' +
          '<p class="csc-hint">Include the capital letter and punctuation if you can.</p>' +
          '<p class="csc-feedback" id="csc-feedback" aria-live="polite"></p>' +
        '</div>' +
      '</div></section></div>';
    var input = document.getElementById("csc-type");
    document.getElementById("csc-check").onclick = checkTyped;
    input.addEventListener("keydown", function(e){ if(e.key === "Enter") { e.preventDefault(); checkTyped(); } });
  }

  function checkTyped() {
    var input = document.getElementById("csc-type");
    var feedback = document.getElementById("csc-feedback");
    if (!input || !input.value.trim()) return;
    var ok = typedSentenceAccepted(input.value, currentItem());
    if (ok) {
      part2Correct++;
      sfx("good");
      feedback.textContent = "✓ Perfect sentence!";
      feedback.className = "csc-feedback good";
      document.getElementById("csc-check").disabled = true;
      input.disabled = true;
      setTimeout(function(){
        if (index < ITEMS.length - 1) { index++; render(); setTimeout(function(){ var el=document.getElementById("csc-type"); if(el) el.focus(); },50); }
        else { phase = "done"; render(); }
      }, 850);
    } else {
      sfx("bad");
      feedback.textContent = "Try again. Look carefully at the picture and the question.";
      feedback.className = "csc-feedback bad";
      input.focus();
      input.select();
    }
  }

  function finishGame() {
    sfx("win");
    var total = ITEMS.length * 2;
    var score = part1Correct + part2Correct;
    var accuracy = Math.round((score / total) * 100);
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
    } catch (_) {}

    // Go directly to the shared finish screen after Part 2.
    if (window.LAFinish) {
      var timeMs = 0;
      try { timeMs = LAFinish.stopTimer(); } catch (_) {}
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: total,
        timeMs: timeMs,
        stars: stars,
        onAgain: startGame,
        onModes: function(){ phase = "start"; render(); },
        backHref: "../",
        save: true
      });
    }
  }

  render();
})();
