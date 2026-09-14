/* Phone Number – listen & complete · AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-phone-number";
  const AUDIO_SRC = "phone-number.mp3";

  // Target: 212-555-0375
  // Template from book-style: 2 □ 2 - □ □ 5 - 0 □ □ □
  // Pre-filled: pos 0:2, 2:2, 5:5, 6:0
  // Blanks (user fills): 1, 3, 4, 7, 8, 9  → values 1,5,5,3,7,5
  const DIGITS = [
    { val: "2", locked: true },
    { val: "1", locked: false },
    { val: "2", locked: true },
    { val: "-", locked: true, sep: true },
    { val: "5", locked: false },
    { val: "5", locked: false },
    { val: "5", locked: true },
    { val: "-", locked: true, sep: true },
    { val: "0", locked: true },
    { val: "3", locked: false },
    { val: "7", locked: false },
    { val: "5", locked: false },
  ];

  const BLANK_INDEXES = DIGITS.map((d, i) => (!d.locked && !d.sep ? i : -1)).filter((i) => i >= 0);

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let currentAudio = null;
  let checked = false;

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".pn-audio-btn.playing").forEach((b) =>
      b.classList.remove("playing")
    );
  }

  function playAudio() {
    const btn = app.querySelector(".pn-audio-btn");
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(AUDIO_SRC);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function calcStars(correctCount, total) {
    if (correctCount >= total) return 3;
    if (correctCount >= Math.ceil(total * 0.66)) return 2;
    if (correctCount >= 1) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function getUserDigits() {
    return BLANK_INDEXES.map((idx) => {
      const inp = document.getElementById("pn-d" + idx);
      return inp ? String(inp.value || "").trim() : "";
    });
  }

  function check() {
    const expected = BLANK_INDEXES.map((idx) => DIGITS[idx].val);
    const user = getUserDigits();
    let allOk = true;
    let correctCount = 0;

    BLANK_INDEXES.forEach((idx, i) => {
      const wrap = document.querySelector('.pn-digit[data-idx="' + idx + '"]');
      const inp = document.getElementById("pn-d" + idx);
      if (!wrap || !inp) return;
      const ok = user[i] === expected[i];
      wrap.classList.remove("is-ok", "is-bad");
      wrap.classList.add(ok ? "is-ok" : "is-bad");
      if (ok) {
        correctCount++;
        inp.disabled = true;
      } else {
        allOk = false;
      }
    });

    const hint = document.getElementById("pn-hint");
    if (allOk) {
      checked = true;
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("pn-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Perfect!";
      }
      setTimeout(() => {
        phase = "done";
        render(correctCount);
      }, 700);
    } else {
      if (hint) {
        hint.textContent = "Not quite — listen again and try!";
        hint.classList.add("is-visible");
      }
      // focus first wrong
      for (let i = 0; i < user.length; i++) {
        if (user[i] !== expected[i]) {
          const inp = document.getElementById("pn-d" + BLANK_INDEXES[i]);
          if (inp) {
            inp.focus();
            inp.select();
          }
          break;
        }
      }
    }
  }

  function start() {
    stopAudio();
    checked = false;
    phase = "play";
    render();
  }

  function render(correctCount) {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="pn-topbar">' +
        '<a class="pn-back" href="../" aria-label="Back">←</a>' +
        '<span class="pn-title">Phone Number</span>' +
        '<span class="pn-badge">2B</span>' +
        "</header>" +
        '<section class="pn-start">' +
        '<div class="pn-hero" aria-hidden="true">📱</div>' +
        "<h1>Listen &amp; Complete</h1>" +
        '<p class="pn-desc">Listen to the phone number.<br>Fill in the missing digits.</p>' +
        '<button type="button" class="pn-btn" id="pn-start">Start →</button>' +
        "</section>";
      document.getElementById("pn-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const total = BLANK_INDEXES.length;
      const stars = saveStars(calcStars(correctCount || total, total));
      app.innerHTML =
        '<header class="pn-topbar">' +
        '<a class="pn-back" href="../" aria-label="Back">←</a>' +
        '<span class="pn-title">Phone Number</span>' +
        '<span class="pn-badge">Done</span>' +
        "</header>" +
        '<section class="pn-done">' +
        '<div class="trophy-scene' +
        (stars === 3 ? " perfect" : "") +
        '" aria-hidden="true"><div class="orbit-system">' +
        '<div class="trophy-float">🏆</div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 1 ? " filled" : "") +
        '">★</span></div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 2 ? " filled" : "") +
        '">★</span></div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 3 ? " filled" : "") +
        '">★</span></div>' +
        "</div></div>" +
        "<h1>Number complete!</h1>" +
        '<p class="pn-answer">212-555-0375</p>' +
        '<button type="button" class="pn-btn" id="pn-again">Play again</button>' +
        '<button type="button" class="pn-btn secondary" id="pn-menu">Home</button>' +
        "</section>";
      document.getElementById("pn-again").onclick = start;
      document.getElementById("pn-menu").onclick = () => {
        stopAudio();
        phase = "menu";
        render();
      };
      return;
    }

    // play phase
    const digitsHTML = DIGITS.map((d, i) => {
      if (d.sep) {
        return '<span class="pn-sep">–</span>';
      }
      if (d.locked) {
        return (
          '<div class="pn-digit locked" data-idx="' +
          i +
          '"><span class="pn-fixed">' +
          d.val +
          "</span></div>"
        );
      }
      return (
        '<div class="pn-digit" data-idx="' +
        i +
        '">' +
        '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="pn-d' +
        i +
        '" class="pn-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Digit" />' +
        "</div>"
      );
    }).join("");

    app.innerHTML =
      '<header class="pn-topbar">' +
      '<a class="pn-back" href="../" aria-label="Back">←</a>' +
      '<span class="pn-title">Phone Number</span>' +
      '<span class="pn-badge">2.19</span>' +
      "</header>" +
      '<div class="pn-play">' +
      '<div class="pn-audio-wrap">' +
      '<button type="button" class="pn-audio-btn" id="pn-audio" aria-label="Play the phone number">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<p class="pn-listen-label">Tap to listen</p>' +
      "</div>" +
      '<p class="pn-instruction">Listen and complete the phone number.</p>' +
      '<div class="pn-number" role="group" aria-label="Phone number">' +
      digitsHTML +
      "</div>" +
      '<p class="pn-hint" id="pn-hint" aria-live="polite"></p>' +
      '<div class="pn-actions"><button type="button" class="pn-btn" id="pn-check">Check</button></div>' +
      "</div>";

    document.getElementById("pn-audio").onclick = playAudio;
    document.getElementById("pn-check").onclick = check;

    // Auto-advance focus on digit entry
    const inputs = BLANK_INDEXES.map((idx) => document.getElementById("pn-d" + idx)).filter(Boolean);
    inputs.forEach((inp, i) => {
      inp.addEventListener("input", (e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 1);
        e.target.value = v;
        const wrap = e.target.closest(".pn-digit");
        if (wrap) {
          wrap.classList.remove("is-ok", "is-bad");
        }
        const hint = document.getElementById("pn-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
        if (v && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value && i > 0) {
          inputs[i - 1].focus();
        }
        if (e.key === "Enter") {
          e.preventDefault();
          document.getElementById("pn-check")?.click();
        }
      });
      // Allow paste of full number
      inp.addEventListener("paste", (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        if (!paste) return;
        let j = i;
        for (let k = 0; k < paste.length && j < inputs.length; k++, j++) {
          inputs[j].value = paste[k];
        }
        if (j < inputs.length) inputs[j].focus();
        else inputs[inputs.length - 1].focus();
      });
    });

    if (inputs[0]) inputs[0].focus();
  }

  render();
})();
