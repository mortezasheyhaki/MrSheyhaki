/* Personal Info – listen & write – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-personal-info";

  const ITEMS = [
    {
      id: 1,
      title: "1 · Phone number",
      hint: "Write the cell phone number.",
      audio: "audio/01.mp3",
      answers: ["3035550415", "30355504152"],
      display: "303-555-0415",
      render: "phone"
    },
    {
      id: 2,
      title: "2 · Address",
      hint: "Write the house number for Oak Street.",
      audio: "audio/02.mp3",
      answers: ["57"],
      display: "57 Oak Street",
      render: "address"
    },
    {
      id: 3,
      title: "3 · Age",
      hint: "How old is he?",
      audio: "audio/03.mp3",
      answers: ["39"],
      display: "39",
      render: "age"
    },
    {
      id: 4,
      title: "4 · Email",
      hint: "Write the numbers in the email address.",
      audio: "audio/04.mp3",
      answers: ["85"],
      display: "james85@gmail.com",
      render: "email"
    }
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let index = 0;
  let score = 0;
  let currentAudio = null;
  let audioCache = {};

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function stopClip() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
    }
    const btn = app.querySelector(".pi-play.playing");
    if (btn) btn.classList.remove("playing");
  }

  function playClip() {
    const item = ITEMS[index];
    if (!item) return;
    stopClip();
    let a = audioCache[item.audio];
    if (!a) {
      a = new Audio(item.audio);
      a.preload = "auto";
      audioCache[item.audio] = a;
    }
    currentAudio = a;
    const btn = app.querySelector(".pi-play");
    const run = function () {
      try { a.currentTime = 0; } catch (_) {}
      const p = a.play();
      if (btn) btn.classList.add("playing");
      if (p && p.catch) p.catch(function () {
        if (btn) btn.classList.remove("playing");
      });
      a.onended = function () {
        if (btn) btn.classList.remove("playing");
      };
    };
    if (a.readyState >= 2) run();
    else {
      a.addEventListener("canplay", function once() {
        a.removeEventListener("canplay", once);
        run();
      });
      try { a.load(); } catch (_) {}
    }
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
      '<button type="button" class="pi-play" aria-label="Play">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>"
    );
  }

  function formHtml(item) {
    if (item.render === "phone") {
      return (
        '<div class="pi-form-line">' +
        '<span class="pi-icon">📞</span>' +
        '<input type="text" class="pi-input wide" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="e.g. 303-555-…" />' +
        "</div>"
      );
    }
    if (item.render === "address") {
      return (
        '<div class="pi-form-line">' +
        '<input type="text" class="pi-input" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="??" style="width:90px" />' +
        '<span class="pi-fixed">Oak Street</span>' +
        "</div>"
      );
    }
    if (item.render === "age") {
      return (
        '<div class="pi-form-line">' +
        '<span class="pi-fixed">Age:</span>' +
        '<input type="text" class="pi-input" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="??" style="width:90px" />' +
        "</div>"
      );
    }
    if (item.render === "email") {
      return (
        '<div class="pi-form-line">' +
        '<span class="pi-fixed">james</span>' +
        '<input type="text" class="pi-input" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="??" style="width:80px" />' +
        '<span class="pi-fixed">@gmail.com</span>' +
        "</div>"
      );
    }
    return "";
  }

  function check() {
    const item = ITEMS[index];
    const inp = document.getElementById("pi-answer");
    if (!inp) return;
    const val = digitsOnly(inp.value);
    const feedback = document.getElementById("pi-feedback");
    if (!val) {
      feedback.textContent = "Write the number.";
      feedback.className = "pi-feedback is-bad";
      return;
    }
    const ok = item.answers.indexOf(val) !== -1;
    if (ok) {
      score += 1;
      inp.classList.remove("is-bad");
      inp.classList.add("is-ok");
      inp.disabled = true;
      feedback.textContent = "Correct! " + item.display;
      feedback.className = "pi-feedback is-ok";
      setTimeout(function () {
        index += 1;
        if (index >= ITEMS.length) {
          phase = "done";
        }
        render();
        if (phase === "play") setTimeout(playClip, 200);
      }, 900);
    } else {
      inp.classList.remove("is-ok");
      inp.classList.add("is-bad");
      feedback.textContent = "Not quite — listen again.";
      feedback.className = "pi-feedback is-bad";
      playClip();
    }
  }

  function render() {
    stopClip();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="pi-topbar">' +
        '<a class="pi-back" href="../" aria-label="Back">←</a>' +
        '<span class="pi-title">Personal Info</span>' +
        '<span class="pi-badge">2B</span>' +
        "</header>" +
        '<section class="pi-menu">' +
        "<h1>Personal information</h1>" +
        '<p class="pi-lead">Listen and write the phone number, address, age, and email.</p>' +
        '<div class="pi-start-card">' +
        "<p>4 questions · listen &amp; write</p>" +
        '<button type="button" class="pi-btn" id="pi-start">Start</button>' +
        "</div>" +
        "</section>";
      document.getElementById("pi-start").onclick = function () {
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
          total: QUESTIONS.length,
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
      '<header class="pi-topbar">' +
      '<a class="pi-back" href="../" aria-label="Back">←</a>' +
      '<span class="pi-title">Personal Info</span>' +
      '<span class="pi-badge">2B</span>' +
      "</header>" +
      '<div class="pi-hud">' +
      '<span class="pi-pill">' + (index + 1) + " / " + ITEMS.length + "</span>" +
      '<span class="pi-pill">' + score + " correct</span>" +
      "</div>" +
      '<div class="pi-progress"><span style="width:' + pct + '%"></span></div>' +
      '<div class="pi-stage">' +
      '<p class="pi-qnum">' + item.title + "</p>" +
      playBtnHtml() +
      '<p class="pi-hint">' + item.hint + "</p>" +
      formHtml(item) +
      '<p class="pi-feedback" id="pi-feedback"></p>' +
      '<div class="pi-actions">' +
      '<button type="button" class="pi-btn secondary" id="pi-replay">Play again</button>' +
      '<button type="button" class="pi-btn" id="pi-check">Check</button>' +
      "</div>" +
      "</div>";

    app.querySelector(".pi-play").onclick = playClip;
    document.getElementById("pi-replay").onclick = playClip;
    document.getElementById("pi-check").onclick = check;

    const inp = document.getElementById("pi-answer");
    if (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") check();
      });
      setTimeout(function () { inp.focus(); }, 100);
    }
  }

  render();
})();
