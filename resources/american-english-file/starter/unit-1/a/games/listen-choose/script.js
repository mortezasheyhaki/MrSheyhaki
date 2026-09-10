/* Listen and Choose – Starter Unit 1A · 1.7 */
(function () {
  const GAME_ID = "starter-1a-listen-choose";
  // Correct photo = 2 (two teas + one cappuccino)
  const CORRECT = 2;
  const PHOTOS = [
    { n: 1, file: "photo-1.png", label: "Photo 1" },
    { n: 2, file: "photo-2.png", label: "Photo 2" },
    { n: 3, file: "photo-3.png", label: "Photo 3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let selected = null;
  let locked = false;


  function bindPlayer() {
    const audio = document.getElementById("lc-audio");
    const btn = document.getElementById("lc-play");
    const timeEl = document.getElementById("lc-time");
    const fill = document.getElementById("lc-progress");
    if (!audio || !btn) return;

    function fmt(t) {
      if (!isFinite(t)) return "0:00";
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return m + ":" + String(s).padStart(2, "0");
    }

    function updateTime() {
      timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
      if (audio.duration) {
        fill.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
      }
    }

    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => btn.classList.add("is-playing"));
    audio.addEventListener("pause", () => btn.classList.remove("is-playing"));
    audio.addEventListener("ended", () => {
      btn.classList.remove("is-playing");
      audio.currentTime = 0;
      updateTime();
    });
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
  }

  function showStart() {
    app.innerHTML = `
      <div class="lc-topbar">
        <a class="lc-back-btn" href="../" title="Back" aria-label="Back">←</a>
        <span class="lc-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="lc-start">
        <h1>Listen and choose</h1>
        <p>Listen to the conversation and check (✓) the correct photo.</p>
        <button class="lc-btn" id="lc-start-btn">Start</button>
      </div>
    `;
    document.getElementById("lc-start-btn").addEventListener("click", showPlay);
  }

  function showPlay() {
    selected = null;
    locked = false;

    const photosHtml = PHOTOS.map((p) => `
      <button type="button" class="lc-photo" data-n="${p.n}" aria-label="${p.label}">
        <span class="lc-num">${p.n}</span>
        <span class="lc-img-wrap" id="img-${p.n}">
          <span class="lc-placeholder">📷 ${p.label}<br><small>placeholder</small></span>
          <img alt="${p.label}" src="images/${p.file}" style="display:none"
            onload="this.style.display='block'; this.parentElement.classList.add('has-image'); this.previousElementSibling.style.display='none';"
            onerror="this.style.display='none'">
        </span>
      </button>
    `).join("");

    app.innerHTML = `
      <div class="lc-topbar">
        <a class="lc-back-btn" href="#" id="lc-back" title="Back" aria-label="Back">←</a>
        <span class="lc-topbar-title">Listen and choose · 1.7</span>
      </div>
      <div class="lc-play">
        <aside class="lc-audio-panel">
          <div class="lc-audio-label">Audio</div>
          <h2 class="lc-audio-title">1.7 A cappuccino, please</h2>
          <div class="lc-player">
            <button type="button" class="lc-play-btn" id="lc-play" aria-label="Play audio">
              <span class="lc-ripple"></span>
              <span class="lc-ripple"></span>
              <span class="lc-bars" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
              </span>
              <svg class="lc-icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/>
              </svg>
              <svg class="lc-icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 5h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm7 0h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>
              </svg>
            </button>
            <div class="lc-time" id="lc-time">0:00 / 0:00</div>
            <div class="lc-progress-track" aria-hidden="true">
              <div class="lc-progress-fill" id="lc-progress"></div>
            </div>
            <audio id="lc-audio" preload="auto" src="audio/1.07.mp3"></audio>
          </div>
          <p class="lc-hint">Tap play, then choose the photo that matches what you hear.</p>
        </aside>
        <div>
          <div class="lc-photos" id="lc-photos">
            ${photosHtml}
          </div>
          <div class="lc-check-row">
            <button class="lc-btn" id="lc-check" disabled style="opacity:0.5">Check</button>
            <div class="lc-feedback" id="lc-feedback"></div>
          </div>
        </div>
      </div>
    `;

    bindPlayer();

    document.getElementById("lc-back").addEventListener("click", (e) => {
      e.preventDefault();
      const a = document.getElementById("lc-audio");
      if (a) a.pause();
      showStart();
    });

    const checkBtn = document.getElementById("lc-check");
    app.querySelectorAll(".lc-photo").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (locked) return;
        selected = +btn.dataset.n;
        app.querySelectorAll(".lc-photo").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        checkBtn.disabled = false;
        checkBtn.style.opacity = "1";
      });
    });

    checkBtn.addEventListener("click", () => {
      if (locked || selected == null) return;
      locked = true;
      checkBtn.disabled = true;
      const feedback = document.getElementById("lc-feedback");
      const photos = app.querySelectorAll(".lc-photo");

      photos.forEach((b) => {
        const n = +b.dataset.n;
        if (n === CORRECT) b.classList.add("correct");
        if (n === selected && n !== CORRECT) b.classList.add("wrong");
      });

      if (selected === CORRECT) {
        feedback.className = "lc-feedback ok";
        feedback.textContent = "✓ Correct! Two teas and one cappuccino.";
        setTimeout(showDone, 1200);
      } else {
        feedback.className = "lc-feedback no";
        feedback.textContent = "Not this one — listen again and try once more.";
        setTimeout(() => {
          photos.forEach((b) => b.classList.remove("wrong", "correct", "selected"));
          feedback.textContent = "";
          selected = null;
          locked = false;
          checkBtn.disabled = true;
          checkBtn.style.opacity = "0.5";
        }, 1600);
      }
    });
  }

  function spawnConfetti(container) {
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6"];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("span");
      el.className = "lc-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 0.9) + "s";
      el.style.animationDuration = (2.2 + Math.random() * 1.4) + "s";
      el.style.width = (6 + Math.random() * 8) + "px";
      el.style.height = (8 + Math.random() * 10) + "px";
      container.appendChild(el);
    }
  }

  function showDone() {
    const a = document.getElementById("lc-audio");
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, 3); }
    if (a) a.pause();
    app.innerHTML = `
      <div class="lc-topbar">
        <a class="lc-back-btn" href="../" title="Back" aria-label="Back">←</a>
        <span class="lc-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="lc-done">
        <div class="lc-done-burst" id="lc-burst">
          <div class="lc-ring"></div>
          <div class="lc-ring"></div>
        </div>
        <div class="lc-done-inner">
          <div class="lc-trophy" aria-hidden="true">🏆</div>
          <div class="lc-stars" aria-hidden="true">
            <span class="lc-star">⭐</span>
            <span class="lc-star">⭐</span>
            <span class="lc-star">⭐</span>
          </div>
          <h1>Well done!</h1>
          <p>You chose the correct photo.</p>
          <button class="lc-btn" id="lc-again">Practice again</button>
          <button class="lc-btn secondary" id="lc-home">Back to games</button>
        </div>
      </div>
    `;
    spawnConfetti(document.getElementById("lc-burst"));
    document.getElementById("lc-again").addEventListener("click", showPlay);
    document.getElementById("lc-home").addEventListener("click", () => {
      window.location.href = "../";
    });
  }

  showStart();
})();
