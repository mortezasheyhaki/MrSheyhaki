/* Places Memory · AEF 1 Unit 10A
   Classic memory: match pairs of place pictures.
   Each game: 8 random pairs (16 cards) from the 25 places.
*/
(function () {
  "use strict";

  var GAME_ID = "1-10a-places-memory";
  var CDN = "https://cdn.imgurl.ir/uploads/";
  var PAIRS_PER_GAME = 8;

  var ALL = [
    { id: "bridge", word: "a bridge", image: CDN + "h18216_a_bridge.png", audio: CDN + "d503350_a_bridge.mp3" },
    { id: "bus-station", word: "a bus station", image: CDN + "p36317_a_bus_station.png", audio: CDN + "n21592_a_bus_station.mp3" },
    { id: "castle", word: "a castle", image: CDN + "r395416_a_castle.png", audio: CDN + "f541850_a_castle.mp3" },
    { id: "church", word: "a church", image: CDN + "w103625_a_church.png", audio: CDN + "z95099_a_church.mp3" },
    { id: "department-store", word: "a department store", image: CDN + "v83970_a_department_store.png", audio: CDN + "a002092_a_department_store.mp3" },
    { id: "hospital", word: "a hospital", image: CDN + "f294937_a_hospital.png", audio: CDN + "a919004_a_hospital.mp3" },
    { id: "hotel", word: "a hotel", image: CDN + "k52351_a_hotel.png", audio: "" },
    { id: "market", word: "a market", image: CDN + "w132251_a_market.png", audio: CDN + "s812708_a_market.mp3" },
    { id: "museum", word: "a museum", image: CDN + "z93575_a_museum.png", audio: CDN + "k084715_a_museum.mp3" },
    { id: "park", word: "a park", image: CDN + "i966284_a_park.png", audio: CDN + "c58663_a_park.mp3" },
    { id: "parking-lot", word: "a parking lot", image: CDN + "j382816_a_parking_lot.png", audio: CDN + "w042351_a_parking_lot_2.mp3" },
    { id: "pharmacy", word: "a pharmacy", image: CDN + "n44231_a_pharmacy.png", audio: CDN + "t918024_a_pharmacy.mp3" },
    { id: "police-station", word: "a police station", image: CDN + "d996395_a_police_station.png", audio: CDN + "v586632_a_police_station.mp3" },
    { id: "post-office", word: "a post office", image: CDN + "i45672_a_post_office.png", audio: CDN + "o718529_a_post_office.mp3" },
    { id: "river", word: "a river", image: CDN + "q794912_a_river.png", audio: CDN + "w59975_a_river.mp3" },
    { id: "road", word: "a road", image: CDN + "l34840_a_road.png", audio: CDN + "e692892_a_road.mp3" },
    { id: "shopping-mall", word: "a shopping mall", image: CDN + "k10295_a_shopping_mall.png", audio: CDN + "s33410_a_shopping_mall.mp3" },
    { id: "square", word: "a square", image: CDN + "q450339_a_square.png", audio: CDN + "c067424_a_square.mp3" },
    { id: "street", word: "a street", image: CDN + "i942216_a_street.png", audio: CDN + "90876_a_street.mp3" },
    { id: "supermarket", word: "a supermarket", image: CDN + "k75207_a_supermarket.png", audio: CDN + "x131344_a_supermarket.mp3" },
    { id: "theater", word: "a theater", image: CDN + "r05545_a_ther.png", audio: CDN + "h926231_a_ther.mp3" },
    { id: "town-hall", word: "a town hall", image: CDN + "x4057_a_town_hall.png", audio: CDN + "u194392_a_town_hall.mp3" },
    { id: "train-station", word: "a train station", image: CDN + "j204995_a_train_station.png", audio: CDN + "w332684_a_train_sation.mp3" },
    { id: "zoo", word: "a zoo", image: CDN + "e384525_a_zoo.png", audio: CDN + "s762603_a_zoo.mp3" },
    { id: "art-gallery", word: "an art gallery", image: CDN + "l009706_an_art_gallery.png", audio: CDN + "t474039_an_art_gallery.mp3" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var deck = [];
  var openUids = []; // currently face-up (max 2)
  var matchedIds = {}; // pairId → true
  var lockBoard = false;
  var moves = 0;
  var pairsFound = 0;
  var pairsTotal = PAIRS_PER_GAME;
  var currentAudio = null;

  (function () {
    if (window.__laUiSfx) return;
    var ctx = null;
    function getCtx() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume().catch(function () {});
      return ctx;
    }
    function tone(freq, dur, type, vol, when) {
      var c = getCtx();
      if (!c) return;
      var t0 = (when || 0) + c.currentTime;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    window.__laUiSfx = {
      tap: function () { tone(520, 0.05, "triangle", 0.07); },
      correct: function () {
        tone(523, 0.1, "sine", 0.12, 0);
        tone(659, 0.12, "sine", 0.12, 0.08);
        tone(784, 0.18, "sine", 0.1, 0.16);
      },
      wrong: function () {
        tone(220, 0.12, "sawtooth", 0.06, 0);
        tone(180, 0.14, "sawtooth", 0.05, 0.08);
      },
      celebrate: function () {
        [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
      }
    };
  })();

  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    var a = new Audio(url);
    currentAudio = a;
    a.play().catch(function () {});
    a.onended = function () { if (currentAudio === a) currentAudio = null; };
  }

  function buildDeck() {
    var pool = shuffle(ALL).slice(0, PAIRS_PER_GAME);
    pairsTotal = pool.length;
    var cards = [];
    pool.forEach(function (item) {
      cards.push({ uid: item.id + "-a", pairId: item.id, word: item.word, image: item.image, audio: item.audio });
      cards.push({ uid: item.id + "-b", pairId: item.id, word: item.word, image: item.image, audio: item.audio });
    });
    return shuffle(cards);
  }

  function cardByUid(uid) {
    for (var i = 0; i < deck.length; i++) {
      if (deck[i].uid === uid) return deck[i];
    }
    return null;
  }

  function isOpen(uid) {
    return openUids.indexOf(uid) !== -1;
  }

  function isMatchedCard(card) {
    return !!(card && matchedIds[card.pairId]);
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    deck = buildDeck();
    openUids = [];
    matchedIds = {};
    lockBoard = false;
    moves = 0;
    pairsFound = 0;
    phase = "play";
    render();
  }

  function paintBoard() {
    deck.forEach(function (card) {
      var btn = document.querySelector('.mm-card[data-uid="' + card.uid + '"]');
      if (!btn) return;
      var matched = isMatchedCard(card);
      var open = isOpen(card.uid);
      var faceUp = matched || open;

      btn.classList.remove("is-open", "is-matched", "is-mismatch");
      if (matched) btn.classList.add("is-matched");
      else if (open) btn.classList.add("is-open");

      btn.setAttribute("aria-pressed", faceUp ? "true" : "false");
      btn.disabled = matched;
    });

    var badge = document.getElementById("mm-badge");
    var stat = document.getElementById("mm-stat");
    var fill = document.getElementById("mm-progress-fill");
    if (badge) badge.textContent = pairsFound + "/" + pairsTotal;
    if (stat) stat.textContent = "MOVES " + moves;
    if (fill) fill.style.width = (pairsTotal ? (pairsFound / pairsTotal) * 100 : 0) + "%";
  }

  function flipCard(uid) {
    if (lockBoard) return;
    var card = cardByUid(uid);
    if (!card || isMatchedCard(card)) return;
    if (isOpen(uid)) return;
    if (openUids.length >= 2) return;

    sfxTap();
    openUids.push(uid);
    paintBoard();

    if (openUids.length < 2) return;

    moves += 1;
    paintBoard();

    var a = cardByUid(openUids[0]);
    var b = cardByUid(openUids[1]);
    if (!a || !b) return;

    if (a.pairId === b.pairId) {
      matchedIds[a.pairId] = true;
      pairsFound += 1;
      sfxOk();
      playAudio(a.audio);
      openUids = [];
      paintBoard();
      var fb = document.getElementById("mm-fb");
      if (fb) {
        fb.textContent = "✓ " + a.word;
        fb.className = "mm-fb is-ok";
      }
      if (pairsFound >= pairsTotal) {
        setTimeout(endGame, 650);
      }
    } else {
      sfxBad();
      lockBoard = true;
      var elA = document.querySelector('.mm-card[data-uid="' + a.uid + '"]');
      var elB = document.querySelector('.mm-card[data-uid="' + b.uid + '"]');
      if (elA) elA.classList.add("is-mismatch");
      if (elB) elB.classList.add("is-mismatch");
      var fb2 = document.getElementById("mm-fb");
      if (fb2) {
        fb2.textContent = "Not a match";
        fb2.className = "mm-fb";
      }
      setTimeout(function () {
        openUids = [];
        lockBoard = false;
        paintBoard();
        if (fb2) {
          fb2.textContent = "Find two matching places";
          fb2.className = "mm-fb";
        }
      }, 800);
    }
  }

  function endGame() {
    stopAudio();
    phase = "results";
    render();
  }

  function starsFromGame() {
    var perfect = pairsTotal;
    if (moves <= perfect + 4) return 3;
    if (moves <= perfect + 10) return 2;
    if (moves <= perfect + 20) return 1;
    return 0;
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="mm-topbar">' +
      '<a class="mm-back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="mm-title">Places Memory</span>' +
      '<span class="mm-badge">Unit 10A</span></header>' +
      '<section class="mm-start">' +
      '<div class="mm-hero" aria-hidden="true">🃏</div>' +
      '<h1>Places Memory</h1>' +
      '<p class="mm-sub">Flip the cards and match the place pictures.</p>' +
      '<ul class="mm-tips">' +
      '<li>' + PAIRS_PER_GAME + ' pairs each game</li>' +
      '<li>New places every time</li>' +
      '<li>Hear the word when you match</li>' +
      '</ul>' +
      '<button type="button" class="mm-btn" id="mm-start">START</button>' +
      '</section>';
    document.getElementById("mm-start").onclick = startGame;
  }

  function renderPlay() {
    app.innerHTML =
      '<header class="mm-topbar">' +
      '<a class="mm-back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="mm-title">Places Memory</span>' +
      '<span class="mm-badge" id="mm-badge">0/' + pairsTotal + "</span>" +
      '<span class="mm-stat" id="mm-stat">MOVES 0</span>' +
      "</header>" +
      '<div class="mm-progress"><div class="mm-progress-fill" id="mm-progress-fill" style="width:0%"></div></div>' +
      '<div class="mm-board" id="mm-board">' +
      deck.map(function (card) {
        return (
          '<button type="button" class="mm-card" data-uid="' + card.uid + '" aria-label="Hidden card" aria-pressed="false">' +
          '<span class="mm-face mm-card-back" aria-hidden="true"><span class="mm-q">?</span></span>' +
          '<span class="mm-face mm-front" aria-hidden="true">' +
          '<img src="' + card.image + '" alt="' + escapeHtml(card.word) + '" draggable="false">' +
          "</span></button>"
        );
      }).join("") +
      "</div>" +
      '<p class="mm-fb" id="mm-fb" aria-live="polite">Find two matching places</p>';

    app.querySelectorAll(".mm-card").forEach(function (btn) {
      btn.addEventListener("click", function () {
        flipCard(btn.getAttribute("data-uid"));
      });
    });
    paintBoard();
  }

  function renderResults() {
    var stars = starsFromGame();
    var msg =
      stars >= 3
        ? "Amazing memory!"
        : stars >= 2
        ? "Great matching!"
        : stars >= 1
        ? "Nice work — try for fewer moves!"
        : "Keep practising!";

    app.innerHTML =
      '<header class="mm-topbar">' +
      '<a class="mm-back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="mm-title">Places Memory</span>' +
      '<span class="mm-badge">Done</span></header>' +
      '<section class="mm-start">' +
      '<div class="mm-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="mm-sub">You found <strong>' + pairsFound + "</strong> pairs in <strong>" + moves + "</strong> moves.</p>" +
      '<p class="mm-sub">' + msg + "</p>" +
      '<button type="button" class="mm-btn" id="mm-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: pairsFound,
          total: pairsTotal,
          stars: stars,
          timeMs: timeMs,
          save: true,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    } else if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (e) {}
    }

    document.getElementById("mm-again").onclick = startGame;
  }

  shuffle(ALL).slice(0, 12).forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
