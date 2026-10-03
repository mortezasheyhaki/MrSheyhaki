/* Places of Work Flashcards – AEF Starter Unit 6A */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-places-flashcards";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var CARDS = [
    { id: "hospital", label: "in a hospital", emoji: "🏥",
      image: CDN + "y27398_in_a_hospital.png", audio: CDN + "s450814_In_a_hospital.mp3" },
    { id: "store", label: "in a store", emoji: "🛒",
      image: CDN + "o525418_in_a_store.png", audio: CDN + "n397193_In_a_store.mp3" },
    { id: "restaurant", label: "in a restaurant", emoji: "🍽️",
      image: CDN + "i783234_in_a_restaurant.png", audio: CDN + "r664774_in_a_restaurant.mp3" },
    { id: "office", label: "in an office", emoji: "🏢",
      image: CDN + "s52087_in_an_office.png", audio: CDN + "q945570_in_an_office.mp3" },
    { id: "school", label: "in a school", emoji: "🏫",
      image: CDN + "e82996_in_a_school.png", audio: CDN + "j90582_in_a_school.mp3" },
    { id: "factory", label: "in a factory", emoji: "🏭",
      image: CDN + "x484704_in_a_factory.png", audio: CDN + "q025441_in_a_factory.mp3" },
    { id: "home", label: "at home", emoji: "🏠",
      image: CDN + "r362867_at_home.png", audio: CDN + "s337199_at_home.mp3" },
    { id: "street", label: "on the street", emoji: "🛣️",
      image: CDN + "d39472_on_the_street.png", audio: CDN + "p013018_on_the_street.mp3" }
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
  var finishShown = false;

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
    finishShown = false;
    render();
  }

  function finish() {
    stopAudio();
    phase = "done";
    finishShown = false;

    // Save stars once here (3/3 for completing the deck)
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, 3);
      }
    } catch (e) {}

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
      if (window.LAFinish && !finishShown) {
        finishShown = true;
        try {
          var timeMs = LAFinish.stopTimer();
          // save:false — already saved in finish(); avoid double play-count
          LAFinish.show({
            gameId: GAME_ID,
            score: CARDS.length,
            total: CARDS.length,
            accuracy: 100,
            stars: 3,
            timeMs: timeMs,
            save: false,
            onAgain: restart,
            onModes: restart,
            backHref: "../"
          });
          return;
        } catch (e) {
          console.warn(e);
        }
      }
      // Fallback UI if LAFinish is unavailable
      app.innerHTML =
        '<section class="fc-done">' +
        '<div class="fc-trophy" aria-hidden="true">⭐</div>' +
        "<h1>Done!</h1>" +
        '<p class="fc-stars" aria-label="3 stars">★★★</p>' +
        "<p>You reviewed all " +
        CARDS.length +
        " places of work cards.</p>" +
        '<div class="fc-actions">' +
        '<button type="button" class="fc-btn" id="fc-again">Play again</button>' +
        '<a class="fc-btn secondary" href="../">Back to games</a>' +
        "</div></section>";
      var again = document.getElementById("fc-again");
      if (again) again.onclick = restart;
      return;
    }

    var card = deck[index];
    var isFirst = index === 0;
    var isLast = index === deck.length - 1;
    var pct = ((index + 1) / deck.length) * 100;
    app.innerHTML =
      '<header class="fc-topbar">' +
      '<a class="fc-back" href="../" aria-label="Back to games">←</a>' +
      '<span class="fc-title">Places of Work</span>' +
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
      ' place of work" draggable="false" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
      '<div class="fc-img-fallback"><span>' +
      card.label +
      "</span></div>" +
      '<span class="fc-hint">Tap to flip · Swipe for next</span>' +
      "</div>" +
      '<div class="fc-face fc-back">' +
      '<span class="fc-swatch fc-swatch--icon" aria-hidden="true">' + (card.emoji || "💼") + '</span>' +
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
