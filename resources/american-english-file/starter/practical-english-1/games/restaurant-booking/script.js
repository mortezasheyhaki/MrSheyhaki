/* Restaurant Booking – Locanda Verde · Starter PE1 */
(function () {

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-pe1-restaurant-booking";
  const AUDIO_SRC = "audio/booking.mp3";

  // Acceptable answers (normalized lowercase)
  const FIELDS = [
    {
      key: "day",
      label: "Day",
      answers: ["tuesday"],
      placeholder: "………",
    },
    {
      key: "people",
      label: "Table for",
      suffix: "people",
      answers: ["3", "three"],
      placeholder: "………",
    },
    {
      key: "time",
      label: "Time",
      suffix: "(o'clock)",
      answers: ["7", "seven"],
      placeholder: "………",
    },
    {
      key: "name",
      label: "Name",
      prefix: "Jenny Ziel",
      answers: ["inski", "zielinski"],
      placeholder: "………",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

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
    const btn = document.getElementById("rb-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    stopAudio();
    audio = new Audio(AUDIO_SRC);
    const btn = document.getElementById("rb-play");
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

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[.,]/g, "")
      .replace(/\s+/g, " ");
  }

  function showStart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    locked = false;
    app.innerHTML = `
      <header class="rb-topbar">
        <a class="rb-back" href="../" aria-label="Back">←</a>
        <span class="rb-title">Restaurant Booking</span>
        <span class="rb-badge">PE1</span>
      </header>
      <section class="rb-start">
        <div class="rb-hero rb-enter" style="--i:0">
          <div class="rb-icon">🍽️</div>
          <h1>Locanda Verde</h1>
          <p>Listen to the phone call.<br>
          Complete the booking form.</p>
        </div>
        <ul class="rb-preview">
          <li class="rb-enter" style="--i:1">Day</li>
          <li class="rb-enter" style="--i:2">Table for ___ people</li>
          <li class="rb-enter" style="--i:3">Time (o'clock)</li>
          <li class="rb-enter" style="--i:4">Name</li>
        </ul>
        <button type="button" class="rb-btn primary rb-enter" style="--i:5" id="rb-go">Start</button>
      </section>`;
    document.getElementById("rb-go").onclick = renderForm;
  }

  function renderForm() {
    stopAudio();
    locked = false;

    const rows = FIELDS.map((f) => {
      if (f.key === "name") {
        return `
          <div class="rb-row" data-key="${f.key}">
            <label class="rb-label" for="rb-${f.key}">${f.label}</label>
            <div class="rb-name-wrap">
              <span class="rb-prefix">${f.prefix}</span>
              <input type="text" class="rb-input rb-input-name" id="rb-${f.key}"
                autocomplete="off" autocorrect="off" spellcheck="false"
                placeholder="${f.placeholder}" maxlength="12">
            </div>
          </div>`;
      }
      return `
        <div class="rb-row" data-key="${f.key}">
          <label class="rb-label" for="rb-${f.key}">${f.label}</label>
          <div class="rb-field-wrap">
            <input type="text" class="rb-input" id="rb-${f.key}"
              autocomplete="off" autocorrect="off" spellcheck="false"
              placeholder="${f.placeholder}" maxlength="16">
            ${f.suffix ? `<span class="rb-suffix">${f.suffix}</span>` : ""}
          </div>
        </div>`;
    }).join("");

    app.innerHTML = `
      <header class="rb-topbar">
        <a class="rb-back" href="#" id="rb-back" aria-label="Back">←</a>
        <span class="rb-title">Complete the form</span>
        <span class="rb-badge">Listen</span>
      </header>
      <div class="rb-stage">
        <div class="rb-speaker-wrap rb-enter" style="--i:0">
          <button type="button" class="rb-play" id="rb-play" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <div class="rb-listen-hint">Tap to listen</div>
        </div>
        <div class="rb-card rb-enter" style="--i:1">
          <div class="rb-card-header">LOCANDA VERDE</div>
          <div class="rb-card-body">
            <h2 class="rb-card-title">Bookings</h2>
            ${rows}
          </div>
        </div>
        <div class="rb-feedback" id="rb-fb" hidden></div>
      </div>
      <div class="rb-controls rb-enter" style="--i:2">
        <button type="button" class="rb-btn primary" id="rb-check">Check</button>
      </div>`;

    document.getElementById("rb-back").onclick = (e) => {
      e.preventDefault();
      if (locked) return;
      showStart();
    };
    document.getElementById("rb-play").onclick = playAudio;
    document.getElementById("rb-check").onclick = onCheck;

    // Enter key submits
    app.querySelectorAll(".rb-input").forEach((inp) => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCheck();
        }
      });
    });

    setTimeout(playAudio, 400);
  }

  function onCheck() {
    if (locked) return;
    locked = true;
    stopAudio();

    let score = 0;
    const results = [];

    FIELDS.forEach((f) => {
      const input = document.getElementById("rb-" + f.key);
      const raw = input ? input.value : "";
      const val = normalize(raw);
      const ok = f.answers.some((a) => val === a || val.endsWith(a));
      if (ok) score++;
      results.push({ key: f.key, ok, correct: f.answers[0] });

      if (input) {
        input.disabled = true;
        input.classList.remove("ok", "bad");
        input.classList.add(ok ? "ok" : "bad");
      }
      const row = app.querySelector(`.rb-row[data-key="${f.key}"]`);
      if (row) {
        row.classList.remove("ok", "bad");
        row.classList.add(ok ? "ok" : "bad");
      }
    });

    const total = FIELDS.length;
    const fb = document.getElementById("rb-fb");
    if (fb) {
      fb.hidden = false;
      if (score === total) {
        fb.className = "rb-feedback ok rb-fb-in";
        fb.textContent = "Perfect! Form complete.";
      } else {
        fb.className = "rb-feedback warn rb-fb-in";
        fb.textContent = `You got ${score} / ${total} correct.`;
        // show correct answers for wrong ones
        const hints = results
          .filter((r) => !r.ok)
          .map((r) => {
            const f = FIELDS.find((x) => x.key === r.key);
            if (r.key === "name") return "Name: Jenny Zielinski";
            if (r.key === "day") return "Day: Tuesday";
            if (r.key === "people") return "Table for: 3";
            if (r.key === "time") return "Time: 7";
            return "";
          })
          .filter(Boolean);
        if (hints.length) {
          fb.innerHTML =
            `You got <strong>${score} / ${total}</strong> correct.<br>` +
            `<span class="rb-hints">${hints.join(" · ")}</span>`;
        }
      }
    }

    const checkBtn = document.getElementById("rb-check");
    if (checkBtn) {
      checkBtn.textContent = score === total ? "Continue" : "Try again";
      checkBtn.onclick = () => {
        if (score === total) showDone(score);
        else renderForm();
      };
    }

    if (score === total) {
      setTimeout(() => showDone(score), 1400);
    }
  }

  function showDone(score) {
    const stars = score === 4 ? 3 : score === 3 ? 2 : score >= 1 ? 1 : 0;
    saveStars(stars);
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: 4,
        stars: stars,
        timeMs: timeMs,
        onAgain: showStart,
        onModes: () => showStart(),
        backHref: "../",
        save: false,
      });
      return;
    }
    app.innerHTML = `<p>Done</p><button type="button" id="pe-again">Again</button>`;
    document.getElementById("pe-again").onclick = showStart;
  }

  showStart();
})();
