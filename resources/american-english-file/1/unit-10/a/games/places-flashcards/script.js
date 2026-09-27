/* Places Flashcards – AEF 1 Unit 10A */
(function () {
  "use strict";

  var GAME_ID = "1-10a-places-flashcards";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var CARDS = [
    { id: "bridge", label: "a bridge", image: CDN + "h18216_a_bridge.png", audio: CDN + "d503350_a_bridge.mp3" },
    { id: "bus-station", label: "a bus station", image: CDN + "p36317_a_bus_station.png", audio: CDN + "n21592_a_bus_station.mp3" },
    { id: "castle", label: "a castle", image: CDN + "r395416_a_castle.png", audio: CDN + "f541850_a_castle.mp3" },
    { id: "church", label: "a church", image: CDN + "w103625_a_church.png", audio: CDN + "z95099_a_church.mp3" },
    { id: "department-store", label: "a department store", image: CDN + "v83970_a_department_store.png", audio: CDN + "a002092_a_department_store.mp3" },
    { id: "hospital", label: "a hospital", image: CDN + "f294937_a_hospital.png", audio: CDN + "a919004_a_hospital.mp3" },
    { id: "hotel", label: "a hotel", image: CDN + "k52351_a_hotel.png", audio: "" },
    { id: "market", label: "a market", image: CDN + "w132251_a_market.png", audio: CDN + "s812708_a_market.mp3" },
    { id: "museum", label: "a museum", image: CDN + "z93575_a_museum.png", audio: CDN + "k084715_a_museum.mp3" },
    { id: "park", label: "a park", image: CDN + "i966284_a_park.png", audio: CDN + "c58663_a_park.mp3" },
    { id: "parking-lot", label: "a parking lot", image: CDN + "j382816_a_parking_lot.png", audio: CDN + "w042351_a_parking_lot_2.mp3" },
    { id: "pharmacy", label: "a pharmacy", image: CDN + "n44231_a_pharmacy.png", audio: CDN + "t918024_a_pharmacy.mp3" },
    { id: "police-station", label: "a police station", image: CDN + "d996395_a_police_station.png", audio: CDN + "v586632_a_police_station.mp3" },
    { id: "post-office", label: "a post office", image: CDN + "i45672_a_post_office.png", audio: CDN + "o718529_a_post_office.mp3" },
    { id: "river", label: "a river", image: CDN + "q794912_a_river.png", audio: CDN + "w59975_a_river.mp3" },
    { id: "road", label: "a road", image: CDN + "l34840_a_road.png", audio: CDN + "e692892_a_road.mp3" },
    { id: "shopping-mall", label: "a shopping mall", image: CDN + "k10295_a_shopping_mall.png", audio: CDN + "s33410_a_shopping_mall.mp3" },
    { id: "square", label: "a square", image: CDN + "q450339_a_square.png", audio: CDN + "c067424_a_square.mp3" },
    { id: "street", label: "a street", image: CDN + "i942216_a_street.png", audio: CDN + "90876_a_street.mp3" },
    { id: "supermarket", label: "a supermarket", image: CDN + "k75207_a_supermarket.png", audio: CDN + "x131344_a_supermarket.mp3" },
    { id: "theater", label: "a theater", image: CDN + "r05545_a_ther.png", audio: CDN + "h926231_a_ther.mp3" },
    { id: "town-hall", label: "a town hall", image: CDN + "x4057_a_town_hall.png", audio: CDN + "u194392_a_town_hall.mp3" },
    { id: "train-station", label: "a train station", image: CDN + "j204995_a_train_station.png", audio: CDN + "w332684_a_train_sation.mp3" },
    { id: "zoo", label: "a zoo", image: CDN + "e384525_a_zoo.png", audio: CDN + "s762603_a_zoo.mp3" },
    { id: "art-gallery", label: "an art gallery", image: CDN + "l009706_an_art_gallery.png", audio: CDN + "t474039_an_art_gallery.mp3" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var deck = CARDS.slice();
  var index = 0;
  var flipped = false;
  var currentAudio = null;
  var phase = "play";
  var playAfterNav = false;
  var shuffled = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".fc-audio-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playCurrent() {
    var card = deck[index];
    if (!card || !card.audio) return;
    stopAudio();
    var a = new Audio(card.audio);
    currentAudio = a;
    var btn = app.querySelector(".fc-audio-btn");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function go(delta, fromSwipe) {
    var next = index + delta;
    if (next < 0) return;
    if (next >= deck.length) {
      finish();
      return;
    }
    stopAudio();
    flipped = false;
    index = next;
    playAfterNav = !!fromSwipe;
    render();
  }

  function flip() {
    flipped = !flipped;
    var card = app.querySelector(".fc-card");
    if (card) card.classList.toggle("is-flipped", flipped);
  }

  function toggleShuffle() {
    shuffled = !shuffled;
    stopAudio();
    deck = shuffled ? shuffle(CARDS) : CARDS.slice();
    index = 0;
    flipped = false;
    render();
  }

  function restart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    deck = shuffled ? shuffle(CARDS) : CARDS.slice();
    index = 0;
    flipped = false;
    phase = "play";
    playAfterNav = false;
    render();
  }

  function finish() {
    stopAudio();
    phase = "done";
    render();
  }

  function bindSwipe(el) {
    if (!el) return;
    var startX = 0;
    var startY = 0;
    var dx = 0;
    var dragging = false;

    function onStart(x, y) {
      startX = x;
      startY = y;
      dx = 0;
      dragging = true;
      el.classList.add("dragging");
    }
    function onMove(x, y) {
      if (!dragging) return;
      dx = x - startX;
      var dy = y - startY;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 14) {
        dragging = false;
        el.classList.remove("dragging");
        el.style.transform = "";
        return;
      }
      el.style.transform = "translateX(" + dx * 0.45 + "px) rotate(" + dx * 0.04 + "deg)";
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      var threshold = Math.min(80, el.offsetWidth * 0.25);
      if (dx < -threshold) {
        el.style.transform = "";
        go(1, true);
      } else if (dx > threshold) {
        el.style.transform = "";
        go(-1, true);
      } else {
        el.style.transition = "transform 0.22s ease";
        el.style.transform = "";
        setTimeout(function () {
          el.style.transition = "";
        }, 240);
      }
      dx = 0;
    }

    el.addEventListener(
      "touchstart",
      function (e) {
        var t = e.changedTouches[0];
        onStart(t.clientX, t.clientY);
      },
      { passive: true }
    );
    el.addEventListener(
      "touchmove",
      function (e) {
        var t = e.changedTouches[0];
        onMove(t.clientX, t.clientY);
      },
      { passive: true }
    );
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    el.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      function move(ev) {
        onMove(ev.clientX, ev.clientY);
      }
      function up() {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        onEnd();
      }
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    });

    el.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
    });
  }

  function render() {
    if (phase === "done") {
      // LAFinish.show already calls LAStars.recordPlay + save (default save: true)
      if (window.LAFinish) {
        try {
          var timeMs = LAFinish.stopTimer();
          LAFinish.show({
            gameId: GAME_ID,
            score: CARDS.length,
            total: CARDS.length,
            stars: 3,
            timeMs: timeMs,
            onAgain: restart,
            onModes: restart,
            backHref: "../"
          });
          return;
        } catch (e) {
          console.warn(e);
        }
      }
      app.innerHTML =
        '<section class="fc-done">' +
        '<div class="fc-trophy" aria-hidden="true">🏆</div>' +
        "<h1>Done!</h1>" +
        "<p>You reviewed all " +
        CARDS.length +
        " place cards.</p>" +
        '<div class="fc-actions">' +
        '<button type="button" class="fc-btn" id="fc-again">Play again</button>' +
        '<a class="fc-btn secondary" href="../">Back to games</a>' +
        "</div></section>";
      document.getElementById("fc-again").onclick = restart;
      return;
    }

    var card = deck[index];
    var isFirst = index === 0;
    var isLast = index === deck.length - 1;
    var pct = ((index + 1) / deck.length) * 100;
    app.innerHTML =
      '<header class="fc-topbar">' +
      '<a class="fc-back" href="../" aria-label="Back to games">←</a>' +
      '<span class="fc-title">Places Flashcards</span>' +
      '<button type="button" class="fc-shuffle' +
      (shuffled ? " is-on" : "") +
      '" id="fc-shuffle" aria-pressed="' +
      shuffled +
      '" aria-label="' +
      (shuffled ? "Shuffle on" : "Shuffle off") +
      '" title="Shuffle cards">🔀</button>' +
      '<span class="fc-badge" aria-live="polite">' +
      (index + 1) +
      " / " +
      deck.length +
      "</span></header>" +
      '<div class="fc-progress"><div class="fc-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="fc-stage">' +
      '<div class="fc-card fc-pop' +
      (flipped ? " is-flipped" : "") +
      '" id="fc-card" tabindex="0" role="button" aria-pressed="' +
      flipped +
      '" aria-label="Flashcard, ' +
      card.label +
      ". Press space or enter to flip." +
      '" style="--card-color:#6d28d9; --card-text:#ffffff">' +
      '<div class="fc-card-inner">' +
      '<div class="fc-face fc-front">' +
      '<img class="fc-img" src="' +
      card.image +
      '" alt="' +
      card.label +
      ' place" draggable="false" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
      '<div class="fc-img-fallback"><span>' +
      card.label +
      "</span></div>" +
      '<span class="fc-hint">Tap to flip · Swipe for next</span>' +
      "</div>" +
      '<div class="fc-face fc-back">' +
      '<span class="fc-swatch fc-swatch--icon" aria-hidden="true">🏙️</span>' +
      '<p class="fc-word">' +
      card.label +
      "</p>" +
      "</div></div></div></div>" +
      '<div class="fc-controls">' +
      '<button type="button" class="fc-nav" id="fc-prev" aria-label="Previous card"' +
      (isFirst ? " disabled" : "") +
      ">‹</button>" +
      '<button type="button" class="fc-audio-btn" id="fc-audio" aria-label="Play the word aloud">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<button type="button" class="fc-nav' +
      (isLast ? " fc-nav-end" : "") +
      '" id="fc-next" aria-label="' +
      (isLast ? "Finish" : "Next card") +
      '">' +
      (isLast ? "End" : "›") +
      "</button>" +
      "</div>";

    var cardEl = document.getElementById("fc-card");
    if (cardEl) {
      cardEl.addEventListener("click", function () {
        if (cardEl.classList.contains("dragging")) return;
        flip();
      });
      bindSwipe(cardEl);
    }

    document.getElementById("fc-prev").onclick = function () {
      go(-1, true);
    };
    document.getElementById("fc-next").onclick = function () {
      go(1, true);
    };
    document.getElementById("fc-audio").onclick = function (e) {
      e.stopPropagation();
      playCurrent();
    };
    document.getElementById("fc-shuffle").onclick = function (e) {
      e.stopPropagation();
      toggleShuffle();
    };

    // Play audio after swipe / arrow navigation
    if (playAfterNav) {
      playAfterNav = false;
      setTimeout(playCurrent, 180);
    }

    // Preload neighbors
    [index - 1, index + 1].forEach(function (i) {
      if (i >= 0 && i < deck.length) {
        var img = new Image();
        img.src = deck[i].image;
      }
    });
  }

  // Preload first few images
  CARDS.slice(0, 6).forEach(function (c) {
    var img = new Image();
    img.src = c.image;
  });

  // Keyboard navigation (arrow keys always move; space/enter-to-flip is
  // bound on the card itself so buttons keep their native behavior).
  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1, true);
    }
  });

  if (window.LAFinish) LAFinish.startTimer();
  render();
})();
