/* Number Flashcards – 11–20 + tens to 100 – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-number-flashcards";

  const CARDS = [
    { num: "11", word: "eleven", audio: "audio/11.mp3" },
    { num: "12", word: "twelve", audio: "audio/12.mp3" },
    { num: "13", word: "thirteen", audio: "audio/13.mp3" },
    { num: "14", word: "fourteen", audio: "audio/14.mp3" },
    { num: "15", word: "fifteen", audio: "audio/15.mp3" },
    { num: "16", word: "sixteen", audio: "audio/16.mp3" },
    { num: "17", word: "seventeen", audio: "audio/17.mp3" },
    { num: "18", word: "eighteen", audio: "audio/18.mp3" },
    { num: "19", word: "nineteen", audio: "audio/19.mp3" },
    { num: "20", word: "twenty", audio: "audio/20.mp3" },
    { num: "30", word: "thirty", audio: "audio/30.mp3" },
    { num: "40", word: "forty", audio: "audio/40.mp3" },
    { num: "50", word: "fifty", audio: "audio/50.mp3" },
    { num: "60", word: "sixty", audio: "audio/60.mp3" },
    { num: "70", word: "seventy", audio: "audio/70.mp3" },
    { num: "80", word: "eighty", audio: "audio/80.mp3" },
    { num: "90", word: "ninety", audio: "audio/90.mp3" },
    { num: "100", word: "a hundred", audio: "audio/100.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let index = 0;
  let flipped = false;
  let busy = false;
  let currentAudio = null;
  let seen = {};
  let dragStartX = null;
  let dragDelta = 0;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".fc-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    const card = CARDS[index];
    if (!card || !card.audio) return;
    stopAudio();
    const a = new Audio(card.audio);
    currentAudio = a;
    const btn = app.querySelector(".fc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function goTo(next, dir) {
    if (busy) return;
    if (next < 0 || next >= CARDS.length || next === index) return;
    busy = true;
    stopAudio();
    flipped = false;

    const wrap = app.querySelector(".fc-card-wrap");
    if (wrap) {
      wrap.classList.add(dir === "left" ? "is-exit-left" : "is-exit-right");
    }

    setTimeout(function () {
      index = next;
      seen[index] = true;
      render(dir === "left" ? "right" : "left");
      busy = false;
      // Auto-play audio for the new card
      setTimeout(playAudio, 80);
    }, 260);
  }

  function next() { goTo(index + 1, "left"); }
  function prev() { goTo(index - 1, "right"); }

  function flip() {
    if (busy) return;
    flipped = !flipped;
    const card = app.querySelector(".fc-card");
    if (card) card.classList.toggle("is-flipped", flipped);
    const hint = app.querySelector(".fc-hint");
    if (hint) hint.textContent = flipped ? "Tap to see the number" : "Tap to see the word";
  }

  function bindSwipe(wrap) {
    function onStart(x) {
      if (busy) return;
      dragStartX = x;
      dragDelta = 0;
      wrap.classList.add("is-dragging");
    }
    function onMove(x) {
      if (dragStartX === null) return;
      dragDelta = x - dragStartX;
      wrap.style.transform = "translateX(" + dragDelta + "px) rotate(" + dragDelta * 0.04 + "deg)";
      wrap.style.opacity = String(Math.max(0.4, 1 - Math.abs(dragDelta) / 280));
    }
    function onEnd() {
      if (dragStartX === null) return;
      wrap.classList.remove("is-dragging");
      const dx = dragDelta;
      dragStartX = null;
      dragDelta = 0;
      wrap.style.transform = "";
      wrap.style.opacity = "";
      if (dx < -60) next();
      else if (dx > 60) prev();
    }

    wrap.addEventListener("touchstart", function (e) {
      onStart(e.changedTouches[0].clientX);
    }, { passive: true });
    wrap.addEventListener("touchmove", function (e) {
      onMove(e.changedTouches[0].clientX);
    }, { passive: true });
    wrap.addEventListener("touchend", onEnd);

    wrap.addEventListener("mousedown", function (e) {
      onStart(e.clientX);
      function mm(ev) { onMove(ev.clientX); }
      function mu() {
        window.removeEventListener("mousemove", mm);
        window.removeEventListener("mouseup", mu);
        onEnd();
      }
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", mu);
    });
  }

  function render(enterDir) {
    const card = CARDS[index];
    seen[index] = true;
    const pct = ((index + 1) / CARDS.length) * 100;

    const dots = CARDS.map(function (_, i) {
      var cls = "fc-dot";
      if (i === index) cls += " is-active";
      else if (seen[i]) cls += " is-seen";
      return '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="Card ' + (i + 1) + '"></button>';
    }).join("");

    app.innerHTML =
      '<header class="fc-topbar">' +
      '<a class="fc-back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="fc-title">Number Flashcards</span>' +
      '<span class="fc-badge">' + (index + 1) + " / " + CARDS.length + "</span>" +
      "</header>" +
      '<div class="fc-progress-track"><div class="fc-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="fc-stage">' +
      '<div class="fc-card-wrap' + (enterDir ? " is-enter-" + enterDir : "") + '">' +
      '<div class="fc-card' + (flipped ? " is-flipped" : "") + '" id="fc-card">' +
      '<div class="fc-face fc-front">' +
      '<span class="fc-label">Number</span>' +
      '<span class="fc-num">' + card.num + "</span>" +
      "</div>" +
      '<div class="fc-face fc-back">' +
      '<span class="fc-label">Word</span>' +
      '<span class="fc-word">' + card.word + "</span>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<p class="fc-hint">' + (flipped ? "Tap to see the number" : "Tap to see the word") + "</p>" +
      "</div>" +
      '<div class="fc-controls">' +
      '<button type="button" class="fc-nav" id="fc-prev" aria-label="Previous"' +
      (index === 0 ? " disabled" : "") +
      '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<button type="button" class="fc-play" id="fc-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<button type="button" class="fc-nav" id="fc-next" aria-label="Next"' +
      (index === CARDS.length - 1 ? " disabled" : "") +
      '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      "</div>" +
      '<div class="fc-dots">' + dots + "</div>";

    const wrap = app.querySelector(".fc-card-wrap");
    const cardEl = document.getElementById("fc-card");
    cardEl.addEventListener("click", function (e) {
      // ignore if finishing a drag
      if (Math.abs(dragDelta) > 8) return;
      flip();
    });
    document.getElementById("fc-prev").onclick = prev;
    document.getElementById("fc-next").onclick = next;
    document.getElementById("fc-play").onclick = function (e) {
      e.stopPropagation();
      playAudio();
    };
    app.querySelectorAll(".fc-dot").forEach(function (d) {
      d.onclick = function () {
        var i = +d.dataset.i;
        if (i === index) return;
        goTo(i, i > index ? "left" : "right");
      };
    });
    bindSwipe(wrap);

    // keyboard
    // (bound once below)

    if (enterDir) {
      setTimeout(function () {
        wrap.classList.remove("is-enter-left", "is-enter-right");
      }, 350);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " ") {
      if (e.key === " ") { e.preventDefault(); flip(); }
      else next();
    } else if (e.key === "ArrowLeft") {
      prev();
    } else if (e.key === "ArrowUp" || e.key === "p" || e.key === "P") {
      playAudio();
    }
  });

  render();
})();
