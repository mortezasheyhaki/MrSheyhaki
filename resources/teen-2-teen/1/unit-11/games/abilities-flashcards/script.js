/* Abilities Flashcards – Teen2Teen 1 Unit 11 */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u11-abilities-flashcards";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var CARDS = [
    { id: "sing", label: "sing", emoji: "🎤", image: CDN + "s959561_1._sing.png", audio: CDN + "m219280_sing.mp3" },
    { id: "dance", label: "dance", emoji: "💃", image: CDN + "n921429_2._dance.png", audio: CDN + "a819457_dance.mp3" },
    { id: "play-guitar", label: "play the guitar", emoji: "🎸", image: CDN + "l759824_3._ay_the_guitar.png", audio: CDN + "o960192_ay_the_guitar_2.mp3" },
    { id: "play-piano", label: "play the piano", emoji: "🎹", image: CDN + "v289933_4_ay_the_piano.png", audio: CDN + "h035164_ay_the_piano.mp3" },
    { id: "play-drums", label: "play the drums", emoji: "🥁", image: CDN + "o494865_5_ay_the_drums.png", audio: CDN + "f2568_ay_the_drums.mp3" },
    { id: "draw", label: "draw", emoji: "🎨", image: CDN + "p8522_6_draw.png", audio: CDN + "d962270_draw.mp3" },
    { id: "swim", label: "swim", emoji: "🏊", image: CDN + "s136203_7_swim.png", audio: CDN + "y834171_swim.mp3" },
    { id: "cook", label: "cook", emoji: "👨‍🍳", image: CDN + "w173769_8_cook.png", audio: CDN + "c62431_cook.mp3" },
    { id: "play-soccer", label: "play soccer", emoji: "⚽", image: CDN + "x99401_9_ay_soccer.png", audio: CDN + "c58387_ay_soccer.mp3" },
    { id: "play-volleyball", label: "play volleyball", emoji: "🏐", image: CDN + "k465640_10_ay_volleybal.png", audio: CDN + "g03206_ay_volleyball.mp3" },
    { id: "ride-bike", label: "ride a bike", emoji: "🚲", image: CDN + "u396407_11_ride_a_bike.png", audio: CDN + "k342951_ride_a_bike.mp3" },
    { id: "ride-horse", label: "ride a horse", emoji: "🐴", image: CDN + "c680984_12_ride_a_horse.png", audio: CDN + "x46930_ride_a_horse.mp3" }
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
        " abilities cards.</p>" +
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
      '<span class="fc-title">Abilities Flashcards</span>' +
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
      ' ability" draggable="false" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
      '<div class="fc-img-fallback"><span>' +
      card.label +
      "</span></div>" +
      '<span class="fc-hint">Tap to flip · Swipe for next</span>' +
      "</div>" +
      '<div class="fc-face fc-back">' +
      '<span class="fc-swatch fc-swatch--icon" aria-hidden="true">' + (card.emoji || "⭐") + '</span>' +
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
