/* 1.9 Listen and write the numbers – AEF Starter Unit 1A */
(function () {
  const GAME_ID = "starter-1a-listen-write-numbers";
  // Book answer key for 1.9 (10 boxes; example 7 is first)
  const ANSWERS = [7, 3, 0, 8, 9, 1, 4, 5, 6, 2];
  const AUDIO_SRC = "audio/1.9.mp3";

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let audio = null;
  let playing = false;

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_SRC);
      audio.preload = "auto";
      audio.addEventListener("ended", () => {
        playing = false;
        playing = false;
        const btn = document.getElementById("ln-play");
        const player = document.getElementById("ln-player");
        if (btn) {
          btn.classList.remove("is-playing");
          if (player) player.classList.remove("is-playing");
          btn.innerHTML = '<span class="ln-play-ico" aria-hidden="true">▶</span><span class="ln-play-label">Play again</span>';
          btn.setAttribute("aria-label", "Play again");
        }
      });
      audio.addEventListener("error", () => {
        playing = false;
        const fb = document.getElementById("ln-audio-fb");
        if (fb) {
          fb.textContent = "Audio could not load. Check the file path.";
          fb.className = "ln-feedback bad";
        }
      });
    }
    return audio;
  }

  function showStart() {
    mode = "start";
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      playing = false;
    }
    app.innerHTML = `
      <div class="ln-topbar">
        <a class="ln-back" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="ln-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="ln-start">
        <div class="ln-hero">
          <div class="ln-blob" aria-hidden="true"></div>
          <div class="ln-icon-wrap" aria-hidden="true">
            <span class="ln-icon">🎧</span>
          </div>
          <p class="ln-track">1.9</p>
          <h1>Listen and write<br>the numbers</h1>
          <p class="ln-sub">Numbers <strong>0–10</strong>. Listen carefully<br>and fill in each box.</p>
        </div>
        <button class="ln-btn" id="ln-go">Start</button>
        <p class="ln-hint">10 numbers · example starts with <strong>7</strong></p>
      </div>
    `;
    document.getElementById("ln-go").addEventListener("click", showPlay);
  }

  function showPlay() {
    mode = "play";
    playing = false;

    const boxes = ANSWERS.map((n, i) => {
      // First box pre-filled as example (like the book)
      if (i === 0) {
        return `<div class="ln-box ln-box-example" data-i="${i}">
          <span class="ln-box-num">${n}</span>
          <span class="ln-box-tag">example</span>
        </div>`;
      }
      return `<div class="ln-box" data-i="${i}">
        <input class="ln-input" type="text" inputmode="numeric" maxlength="2"
               autocomplete="off" aria-label="Number ${i + 1}" data-i="${i}">
      </div>`;
    }).join("");

    app.innerHTML = `
      <div class="ln-topbar">
        <a class="ln-back" href="#" id="ln-back-start" title="Back" aria-label="Back">←</a>
        <span class="ln-topbar-title">1.9 · Listen & write</span>
        <span class="ln-progress">0–10</span>
      </div>

      <div class="ln-player" id="ln-player">
        <button type="button" class="ln-play-btn" id="ln-play" aria-label="Play audio">
          <span class="ln-play-ico" aria-hidden="true">▶</span>
          <span class="ln-play-label">Play audio</span>
        </button>
        <div class="ln-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <p class="ln-instruction">Listen and write the numbers in the boxes.</p>

      <div class="ln-boxes" id="ln-boxes">
        ${boxes}
      </div>

      <div class="ln-feedback" id="ln-audio-fb"></div>
      <div class="ln-actions">
        <button type="button" class="ln-btn secondary" id="ln-clear">Clear</button>
        <button type="button" class="ln-btn" id="ln-check">Check answers</button>
      </div>
    `;

    document.getElementById("ln-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    document.getElementById("ln-play").addEventListener("click", togglePlay);
    document.getElementById("ln-check").addEventListener("click", checkAnswers);
    document.getElementById("ln-clear").addEventListener("click", clearInputs);

    // Focus first empty input
    const first = app.querySelector(".ln-input");
    if (first) setTimeout(() => first.focus(), 200);

    // Enter key moves to next / checks on last
    app.querySelectorAll(".ln-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/[^0-9]/g, "");
        inp.classList.remove("ok", "bad");
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const inputs = [...app.querySelectorAll(".ln-input")];
          const idx = inputs.indexOf(inp);
          if (idx < inputs.length - 1) inputs[idx + 1].focus();
          else checkAnswers();
        }
      });
    });
  }

  function setPlayUI(isOn) {
    const btn = document.getElementById("ln-play");
    const player = document.getElementById("ln-player");
    if (!btn) return;
    if (isOn) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML = '<span class="ln-play-ico" aria-hidden="true">⏸</span><span class="ln-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause audio");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML = '<span class="ln-play-ico" aria-hidden="true">▶</span><span class="ln-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
    }
  }

  function togglePlay() {
    const a = ensureAudio();
    const btn = document.getElementById("ln-play");
    if (!btn) return;

    if (playing) {
      a.pause();
      playing = false;
      setPlayUI(false);
      return;
    }

    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        playing = true;
        setPlayUI(true);
      }).catch(() => {
        const fb = document.getElementById("ln-audio-fb");
        if (fb) {
          fb.textContent = "Tap Play again (browser may block autoplay).";
          fb.className = "ln-feedback bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function clearInputs() {
    app.querySelectorAll(".ln-input").forEach((inp) => {
      inp.value = "";
      inp.classList.remove("ok", "bad");
    });
    const fb = document.getElementById("ln-audio-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "ln-feedback";
    }
    const first = app.querySelector(".ln-input");
    if (first) first.focus();
  }

  function checkAnswers() {
    const inputs = [...app.querySelectorAll(".ln-input")];
    let correct = 0;
    let total = inputs.length; // 9 (example is fixed)

    inputs.forEach((inp) => {
      const i = Number(inp.dataset.i);
      const val = inp.value.trim() === "" ? null : Number(inp.value.trim());
      const expected = ANSWERS[i];
      inp.classList.remove("ok", "bad");
      if (val === expected) {
        inp.classList.add("ok");
        correct++;
      } else {
        inp.classList.add("bad");
      }
    });

    // Include the example as already correct for score display
    const scoreCorrect = correct + 1;
    const scoreTotal = ANSWERS.length;

    if (correct === total) {
      showResult(scoreCorrect, scoreTotal, true);
    } else {
      const fb = document.getElementById("ln-audio-fb");
      if (fb) {
        fb.className = "ln-feedback bad";
        fb.textContent = `${correct} / ${total} correct — listen again and try the red boxes.`;
      }
    }
  }

  function showResult(correct, total, perfect) {
    mode = "result";
    if (audio) {
      audio.pause();
      playing = false;
    }

    const stars = perfect
      ? 3
      : correct >= total - 1 || correct / total >= 0.8
        ? 2
        : correct >= Math.ceil(total / 2)
          ? 1
          : 0;
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }

    const answerRow = ANSWERS.map(
      (n) => `<span class="ln-ans-chip">${n}</span>`
    ).join("");

    app.innerHTML = `
      <div class="ln-topbar">
        <a class="ln-back" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="ln-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="ln-done">
        <div class="ln-done-burst" id="ln-burst">
          <div class="ln-ring"></div>
          <div class="ln-ring"></div>
        </div>
        <div class="ln-done-inner">
          <div class="ln-trophy" aria-hidden="true">${perfect ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="ln-stars" aria-hidden="true">
            <span class="ln-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="ln-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="ln-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${perfect ? "Perfect!" : stars >= 1 ? "Nice try!" : "Keep practicing!"}</h1>
          <p>You wrote <strong>${correct} / ${total}</strong> numbers correctly.</p>
          <div class="ln-answer-key">
            <span class="ln-answer-label">Answer key</span>
            <div class="ln-answer-row">${answerRow}</div>
          </div>
          <button class="ln-btn" id="ln-again">Practice again</button>
          <button class="ln-btn secondary" id="ln-home">Back to games</button>
        </div>
      </div>
    `;

    if (stars >= 2) spawnConfetti(document.getElementById("ln-burst"));
    document.getElementById("ln-again").addEventListener("click", showPlay);
    document.getElementById("ln-home").addEventListener("click", () => {
      window.location.href = "../";
    });
  }

  function spawnConfetti(container) {
    if (!container) return;
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6"];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("span");
      el.className = "ln-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = Math.random() * 0.8 + "s";
      el.style.animationDuration = 2 + Math.random() * 1.2 + "s";
      el.style.width = 5 + Math.random() * 7 + "px";
      el.style.height = 7 + Math.random() * 9 + "px";
      container.appendChild(el);
    }
  }

  showStart();
})();
