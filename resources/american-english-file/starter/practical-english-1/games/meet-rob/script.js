/* Meet Rob – Listen & Choose · Starter PE1 (all questions on one page) */
(function () {
  const GAME_ID = "starter-pe1-meet-rob";
  const AUDIO_SRC = "audio/rob.mp3";

  const QUESTIONS = [
    {
      q: "Rob is from ______.",
      options: [
        { id: "a", text: "the UK" },
        { id: "b", text: "the US" },
      ],
      correct: "a",
    },
    {
      q: "He's ______.",
      options: [
        { id: "a", text: "an artist" },
        { id: "b", text: "a journalist" },
      ],
      correct: "b",
    },
    {
      q: "He's in Poland ______.",
      options: [
        { id: "a", text: "on vacation" },
        { id: "b", text: "for work" },
      ],
      correct: "b",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let answers = {}; // qIndex -> option id
  let locked = false;
  let audio = null;

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
      audio = null;
    }
    const btn = document.getElementById("mr-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    stopAudio();
    audio = new Audio(AUDIO_SRC);
    const btn = document.getElementById("mr-play");
    if (btn) btn.classList.add("playing");
    audio.play().catch(() => {});
    audio.onended = () => {
      if (btn) btn.classList.remove("playing");
      audio = null;
    };
    audio.onerror = () => {
      if (btn) btn.classList.remove("playing");
      audio = null;
    };
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showStart() {
    stopAudio();
    answers = {};
    locked = false;
    app.innerHTML = `
      <header class="mr-topbar">
        <a class="mr-back" href="../" aria-label="Back">←</a>
        <span class="mr-title">Meet Rob</span>
        <span class="mr-badge">PE1</span>
      </header>
      <section class="mr-start">
        <div class="mr-hero mr-enter" style="--i:0">
          <div class="mr-icon">🎧</div>
          <h1>Meet Rob</h1>
          <p>Listen to Rob introduce himself.<br>
          Then choose the correct answer for each question.</p>
        </div>
        <ul class="mr-preview">
          <li class="mr-enter" style="--i:1">Where is he from?</li>
          <li class="mr-enter" style="--i:2">What does he do?</li>
          <li class="mr-enter" style="--i:3">Why is he in Poland?</li>
        </ul>
        <button type="button" class="mr-btn primary mr-enter" style="--i:4" id="mr-go">Start</button>
      </section>`;
    document.getElementById("mr-go").onclick = () => {
      answers = {};
      renderQuiz();
    };
  }

  function renderQuiz() {
    stopAudio();
    locked = false;

    const questionsHtml = QUESTIONS.map((item, qi) => {
      const choices = item.options
        .map(
          (o) => `
          <button type="button" class="mr-choice" data-q="${qi}" data-id="${o.id}">
            <span class="mr-choice-letter">${o.id}</span>
            <span class="mr-choice-text">${escapeHtml(o.text)}</span>
          </button>`
        )
        .join("");
      return `
        <div class="mr-qblock mr-enter" data-q="${qi}" style="--i:${qi}">
          <p class="mr-q"><span class="mr-qnum">${qi + 1}</span> ${escapeHtml(item.q)}</p>
          <div class="mr-choices">${choices}</div>
        </div>`;
    }).join("");

    app.innerHTML = `
      <header class="mr-topbar">
        <a class="mr-back" href="#" id="mr-back" aria-label="Back">←</a>
        <span class="mr-title">Listen & Choose</span>
        <span class="mr-badge">3 Qs</span>
      </header>
      <div class="mr-stage">
        <div class="mr-speaker-wrap mr-enter" style="--i:0">
          <button type="button" class="mr-play" id="mr-play" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <div class="mr-listen-hint">Tap to listen</div>
        </div>
        <div class="mr-quiz" id="mr-quiz">
          ${questionsHtml}
        </div>
        <div class="mr-feedback" id="mr-fb" hidden></div>
      </div>
      <div class="mr-controls mr-enter" style="--i:4">
        <button type="button" class="mr-btn primary" id="mr-check">Check answers</button>
      </div>`;

    document.getElementById("mr-back").onclick = (e) => {
      e.preventDefault();
      if (locked) return;
      showStart();
    };
    document.getElementById("mr-play").onclick = playAudio;
    document.getElementById("mr-check").onclick = onCheck;

    document.querySelectorAll(".mr-choice").forEach((btn) => {
      btn.onclick = () => {
        if (locked) return;
        const qi = btn.dataset.q;
        const id = btn.dataset.id;
        answers[qi] = id;
        // highlight selection within this question only
        document.querySelectorAll(`.mr-choice[data-q="${qi}"]`).forEach((b) => {
          b.classList.toggle("selected", b === btn);
        });
        updateCheckState();
      };
    });

    updateCheckState();
    setTimeout(playAudio, 400);
  }

  function updateCheckState() {
    const btn = document.getElementById("mr-check");
    if (!btn) return;
    const allAnswered = QUESTIONS.every((_, i) => answers[i] != null);
    btn.disabled = !allAnswered;
  }

  function onCheck() {
    if (locked) return;
    const allAnswered = QUESTIONS.every((_, i) => answers[i] != null);
    if (!allAnswered) {
      const fb = document.getElementById("mr-fb");
      if (fb) {
        fb.hidden = false;
        fb.className = "mr-feedback warn";
        fb.textContent = "Please answer all three questions.";
      }
      return;
    }

    locked = true;
    let score = 0;

    QUESTIONS.forEach((item, qi) => {
      const chosen = answers[qi];
      const ok = chosen === item.correct;
      if (ok) score++;

      document.querySelectorAll(`.mr-choice[data-q="${qi}"]`).forEach((b) => {
        b.disabled = true;
        b.classList.remove("selected");
        if (b.dataset.id === item.correct) {
          b.classList.add("correct", "mr-pop");
        } else if (b.dataset.id === chosen && !ok) {
          b.classList.add("wrong", "mr-shake");
        }
      });
    });

    const fb = document.getElementById("mr-fb");
    if (fb) {
      fb.hidden = false;
      fb.className = "mr-feedback mr-fb-in " + (score === 3 ? "ok" : score >= 1 ? "warn" : "bad");
      fb.textContent =
        score === 3
          ? "Perfect! All correct."
          : `You got ${score} / 3 correct.`;
    }

    const checkBtn = document.getElementById("mr-check");
    if (checkBtn) {
      checkBtn.textContent = "See results";
      checkBtn.disabled = false;
      checkBtn.onclick = () => showDone(score);
    }

    // auto-advance after a short moment
    setTimeout(() => showDone(score), 1800);
  }

  function showDone(score) {
    stopAudio();
    locked = false;
    const stars = score === 3 ? 3 : score === 2 ? 2 : score === 1 ? 1 : 0;
    saveStars(stars);
    app.innerHTML = `
      <header class="mr-topbar">
        <a class="mr-back" href="../" aria-label="Back">←</a>
        <span class="mr-title">Complete</span>
        <span class="mr-badge">✓</span>
      </header>
      <section class="mr-done">
        <div class="mr-stars">${stars > 0 ? "⭐ ".repeat(stars).trim() : "—"}</div>
        <h1>${score === 3 ? "Perfect!" : score >= 2 ? "Well done!" : "Good try!"}</h1>
        <p>You got <strong>${score} / ${QUESTIONS.length}</strong> correct.</p>
        <button type="button" class="mr-btn primary" id="mr-again">Play again</button>
        <button type="button" class="mr-btn secondary" id="mr-home">Back to games</button>
      </section>`;
    document.getElementById("mr-again").onclick = () => {
      answers = {};
      renderQuiz();
    };
    document.getElementById("mr-home").onclick = () => {
      window.location.href = "../";
    };
  }

  showStart();
})();
