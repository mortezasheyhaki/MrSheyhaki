/* Clothes Flashcards – Teen2Teen 1 Unit 10 */
(function () {
  "use strict";

    var GAME_ID = "t2t1-u10-clothes-flashcards";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var CARDS = [
    { id: "sweater", label: "a sweater", image: CDN + "q049292_swer.png", audio: CDN + "d159367_a_swer.mp3" },
    { id: "skirt", label: "a skirt", image: CDN + "a444189_st.png", audio: CDN + "b668114_st.mp3" },
    { id: "shorts", label: "shorts", image: CDN + "p155179_shorts.png", audio: CDN + "b61351_shorts_2.mp3" },
    { id: "shoes", label: "shoes", image: CDN + "i80933_shoes.png", audio: CDN + "y529847_shoes_3.mp3" },
    { id: "shirt", label: "a shirt", image: CDN + "y409033_shirt.png", audio: CDN + "f1066_a_shirt.mp3" },
    { id: "pants", label: "pants", image: CDN + "b63746_pants.png", audio: CDN + "e126543_pants_2.mp3" },
    { id: "jeans", label: "jeans", image: CDN + "s86734_jeans.png", audio: CDN + "p371082_jeans_3.mp3" },
    { id: "jacket", label: "a jacket", image: CDN + "n731967_jacket.png", audio: CDN + "c58647_a_jacket.mp3" },
    { id: "dress", label: "a dress", image: CDN + "e35407_dress.png", audio: CDN + "m241908_a_dress.mp3" },
    { id: "blouse", label: "a blouse", image: CDN + "d598847_blouse.png", audio: CDN + "m041818_a_blouse.mp3" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var deck = CARDS.slice();
  var index = 0;
  var flipped = false;
  var currentAudio = null;
  var phase = "play";
  var playAfterNav = false;

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
    if (next < 0 || next >= deck.length) return;
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

  function restart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    deck = CARDS.slice();
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
        if (index < deck.length - 1) go(1, true);
        else finish();
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
        "<h1>Done!</h1>" +
        "<p>You reviewed all " +
        CARDS.length +
        " cards.</p>" +
        '<button type="button" class="fc-btn" id="fc-again">Again</button>' +
        "</section>";
      document.getElementById("fc-again").onclick = restart;
      return;
    }

    var card = deck[index];
    var isFirst = index === 0;
    var isLast = index === deck.length - 1;
    var pct = ((index + 1) / deck.length) * 100;

    app.innerHTML =
      '<header class="fc-topbar">' +
      '<a class="fc-back" href="../" aria-label="Back">←</a>' +
      '<span class="fc-title">Clothes Flashcards</span>' +
      '<span class="fc-badge">' +
      (index + 1) +
      " / " +
      deck.length +
      "</span></header>" +
      '<div class="fc-progress"><div class="fc-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="fc-stage">' +
      '<div class="fc-card' +
      (flipped ? " is-flipped" : "") +
      '" id="fc-card" tabindex="0" role="button" aria-label="Flashcard — tap to flip">' +
      '<div class="fc-card-inner">' +
      '<div class="fc-face fc-front">' +
      '<img class="fc-img" src="' +
      card.image +
      '" alt="" draggable="false" />' +
      '<span class="fc-hint">Tap to flip · Swipe for next</span>' +
      "</div>" +
      '<div class="fc-face fc-back">' +
      '<p class="fc-word">' +
      card.label +
      "</p>" +
      "</div></div></div></div>" +
      '<div class="fc-controls">' +
      '<button type="button" class="fc-nav" id="fc-prev" aria-label="Previous"' +
      (isFirst ? " disabled" : "") +
      ">‹</button>" +
      '<button type="button" class="fc-audio-btn" id="fc-audio" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<button type="button" class="fc-nav' +
      (isLast ? " fc-nav-end" : "") +
      '" id="fc-next" aria-label="' +
      (isLast ? "End" : "Next") +
      '">' +
      (isLast ? "End" : "›") +
      "</button>" +
      "</div>";

    var cardEl = document.getElementById("fc-card");
    if (cardEl) {
      cardEl.addEventListener("click", function (e) {
        if (cardEl.classList.contains("dragging")) return;
        flip();
      });
      bindSwipe(cardEl);
    }

    document.getElementById("fc-prev").onclick = function () {
      go(-1, true);
    };
    document.getElementById("fc-next").onclick = function () {
      if (isLast) finish();
      else go(1, true);
    };
    document.getElementById("fc-audio").onclick = function (e) {
      e.stopPropagation();
      playCurrent();
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

  if (window.LAFinish) LAFinish.startTimer();
  render();
})();
