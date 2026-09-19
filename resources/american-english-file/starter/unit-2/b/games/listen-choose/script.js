/* Listen & Choose – Teens or Tens – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-listen-choose";

  const ITEMS = [
    { q: 1, a: 13, b: 30, answer: 13, audio: "audio/01.mp3" },
    { q: 2, a: 14, b: 40, answer: 40, audio: "audio/02.mp3" },
    { q: 3, a: 15, b: 50, answer: 50, audio: "audio/03.mp3" },
    { q: 4, a: 16, b: 60, answer: 16, audio: "audio/04.mp3" },
    { q: 5, a: 17, b: 70, answer: 70, audio: "audio/05.mp3" },
    { q: 6, a: 18, b: 80, answer: 18, audio: "audio/06.mp3" },
    { q: 7, a: 19, b: 90, answer: 19, audio: "audio/07.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let index = 0;
  let score = 0;
  let locked = false;
  let currentAudio = null;

  function stopClip() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".lc-play.playing");
    if (btn) btn.classList.remove("playing");
  }

  function playClip() {
    const item = ITEMS[index];
    if (!item) return;
    stopClip();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function calcStars() {
    const r = score / ITEMS.length;
    if (r >= 1) return 3;
    if (r >= 0.75) return 2;
    if (r >= 0.5) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function playBtnHtml() {
    return (
      '<button type="button" class="lc-play" aria-label="Play">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>"
    );
  }

  function render() {
    stopClip();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="lc-topbar">' +
        '<a class="lc-back" href="../" aria-label="Back">←</a>' +
        '<span class="lc-title">Listen &amp; Choose</span>' +
        '<span class="lc-badge">2B</span>' +
        "</header>" +
        '<section class="lc-menu">' +
        "<h1>Teens or tens?</h1>" +
        '<p class="lc-lead">Listen and choose the number you hear — <strong>13 or 30</strong>, <strong>14 or 40</strong>, and so on.</p>' +
        '<div class="lc-start-card">' +
        "<p>7 questions · two choices each time</p>" +
        '<button type="button" class="lc-btn" id="lc-start">Start</button>' +
        "</div>" +
        "</section>";
      document.getElementById("lc-start").onclick = function () {
        index = 0;
        score = 0;
        phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
        render();
        setTimeout(playClip, 250);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    // play
    const item = ITEMS[index];
    const pct = Math.round((index / ITEMS.length) * 100);

    app.innerHTML =
      '<header class="lc-topbar">' +
      '<a class="lc-back" href="../" aria-label="Back">←</a>' +
      '<span class="lc-title">Listen &amp; Choose</span>' +
      '<span class="lc-badge">2B</span>' +
      "</header>" +
      '<div class="lc-hud">' +
      '<span class="lc-pill">' + (index + 1) + " / " + ITEMS.length + "</span>" +
      '<span class="lc-pill">' + score + " correct</span>" +
      "</div>" +
      '<div class="lc-progress"><span style="width:' + pct + '%"></span></div>' +
      '<div class="lc-stage">' +
      '<p class="lc-qnum">Question ' + item.q + "</p>" +
      playBtnHtml() +
      '<p class="lc-hint">Tap the number you hear.</p>' +
      '<div class="lc-choices">' +
      '<button type="button" class="lc-choice" id="lc-a" data-side="a"><span>' + item.a + "</span></button>" +
      '<button type="button" class="lc-choice" id="lc-b" data-side="b"><span>' + item.b + "</span></button>" +
      "</div>" +
      '<p class="lc-feedback" id="lc-feedback"></p>' +
      "</div>";

    app.querySelector(".lc-play").onclick = playClip;

    function pick(side) {
      if (locked) return;
      locked = true;
      const chosen = side === "a" ? item.a : item.b;
      const btn = side === "a" ? document.getElementById("lc-a") : document.getElementById("lc-b");
      const other = side === "a" ? document.getElementById("lc-b") : document.getElementById("lc-a");
      document.getElementById("lc-a").disabled = true;
      document.getElementById("lc-b").disabled = true;

      const feedback = document.getElementById("lc-feedback");
      if (chosen === item.answer) {
        score += 1;
        btn.classList.add("is-ok");
        feedback.textContent = "Correct! " + item.answer;
        feedback.className = "lc-feedback is-ok";
      } else {
        btn.classList.add("is-bad");
        other.classList.add("is-ok");
        feedback.textContent = "It was " + item.answer;
        feedback.className = "lc-feedback is-bad";
      }

      setTimeout(function () {
        locked = false;
        index += 1;
        if (index >= ITEMS.length) {
          phase = "done";
        }
        render();
        if (phase === "play") setTimeout(playClip, 250);
      }, 950);
    }

    document.getElementById("lc-a").onclick = function () { pick("a"); };
    document.getElementById("lc-b").onclick = function () { pick("b"); };
  }

  render();
})();
