/* Jobs Flashcards – AEF Starter Unit 6A */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-jobs-flashcards";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var CARDS = [
    { id: "teacher", label: "a teacher", emoji: "👩‍🏫",
      image: CDN + "y431285_1_teacher.png", audio: CDN + "e500251_1_a_teacher.mp3" },
    { id: "doctor", label: "a doctor", emoji: "👨‍⚕️",
      image: CDN + "u765683_2_a_doctor.png", audio: CDN + "y03769_2_a_doctor.mp3" },
    { id: "nurse", label: "a nurse", emoji: "👩‍⚕️",
      image: CDN + "o88045_3_a_nurse.png", audio: CDN + "h90124_3_a_nurse.mp3" },
    { id: "journalist", label: "a journalist", emoji: "📰",
      image: CDN + "y033377_4_a_nurse.png", audio: CDN + "y108055_4_a_journalist.mp3" },
    { id: "waiter", label: "a waiter", emoji: "🍽️",
      image: CDN + "j13538_5_a_waiter.png", audio: CDN + "i300299_5_a_waiter.mp3" },
    { id: "waitress", label: "a waitress", emoji: "🛎️",
      image: CDN + "s032802_6_a_waitress.png", audio: CDN + "q243679_6_a_waitress.mp3" },
    { id: "salesperson", label: "a salesperson", emoji: "🛍️",
      image: CDN + "p208694_7_a_salesperson.png", audio: CDN + "c70645_7_a_salesperson.mp3" },
    { id: "receptionist", label: "a receptionist", emoji: "💼",
      image: CDN + "z996638_8_a_receptionist.png", audio: CDN + "c29486_8_a_recptionist.mp3" },
    { id: "policeman", label: "a policeman", emoji: "👮‍♂️",
      image: CDN + "d755786_9_a_policeman.png", audio: CDN + "k557960_9_a_policeman.mp3" },
    { id: "policewoman", label: "a policewoman", emoji: "👮‍♀️",
      image: CDN + "s982850_10_a_policeman.png", audio: CDN + "l328420_10_a_policeowman.mp3" },
    { id: "factory-worker", label: "a factory worker", emoji: "🏭",
      image: CDN + "k96301_11_a_factory_worker.png", audio: CDN + "s79925_11_a_factory_worker.mp3" },
    { id: "taxi-driver", label: "a taxi driver", emoji: "🚕",
      image: CDN + "q003095_12_a_taxi_driver.png", audio: CDN + "c56441_12_a_taxi_driver.mp3" }
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
        " jobs cards.</p>" +
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
      '<span class="fc-title">Jobs Flashcards</span>' +
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
      ' jobs item" draggable="false" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
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
