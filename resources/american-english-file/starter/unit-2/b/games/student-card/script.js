/* Student Card – listen & complete · AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-student-card";
  const AUDIO_SRC = "audio/conversation.mp3";

  const DIALOGUE = [
    { speaker: "Pia", text: "Who's he?" },
    { speaker: "Lin", text: "He's Alex. He's in my class." },
    { speaker: "Pia", text: "Where's he from?" },
    { speaker: "Lin", text: "He's from Mexico." },
    { speaker: "Pia", text: "How old is he?" },
    { speaker: "Lin", text: "He's 22, I think." },
    { speaker: "Pia", text: "He's very good-looking!" },
  ];

  const FIELDS = [
    {
      id: "name",
      label: "Name",
      accept: ["alex martinez", "alex martínez", "alex"],
      model: "Alex Martínez",
      // surname shown on card as Martínez — first name is Alex
    },
    {
      id: "nationality",
      label: "Nationality",
      accept: ["mexican", "mexico"],
      model: "Mexican",
    },
    {
      id: "age",
      label: "Age",
      accept: ["22", "twenty-two", "twenty two"],
      model: "22",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let currentAudio = null;
  let checked = false;
  let fieldOk = [false, false, false];

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchField(val, accept) {
    const n = norm(val);
    if (!n) return false;
    for (let i = 0; i < accept.length; i++) {
      if (n === norm(accept[i])) return true;
    }
    // allow "Alex Martinez" when accept has alex
    if (accept.some((a) => norm(a) === "alex") && n.indexOf("alex") === 0) {
      if (n === "alex" || n.indexOf("martinez") >= 0) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".sc-audio-btn.playing").forEach((b) =>
      b.classList.remove("playing")
    );
  }

  function playAudio() {
    const btn = app.querySelector(".sc-audio-btn");
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

  function calcStars(n) {
    if (n >= 3) return 3;
    if (n >= 2) return 2;
    if (n >= 1) return 1;
    return 0;
  }

  function saveStars(n) {
    const stars = calcStars(n);
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function dialogueHTML() {
    return DIALOGUE.map(
      (line) =>
        '<div class="sc-line"><span class="sc-speaker">' +
        line.speaker +
        '</span><span class="sc-speech">' +
        line.text +
        "</span></div>"
    ).join("");
  }

  function check() {
    const results = FIELDS.map((f, i) => {
      const inp = document.getElementById("sc-" + f.id);
      return matchField(inp ? inp.value : "", f.accept);
    });
    fieldOk = results;

    let all = true;
    results.forEach((ok, i) => {
      const wrap = document.querySelector(
        '.sc-field[data-id="' + FIELDS[i].id + '"]'
      );
      const inp = document.getElementById("sc-" + FIELDS[i].id);
      if (!wrap || !inp) return;
      wrap.classList.remove("is-ok", "is-bad");
      wrap.classList.add(ok ? "is-ok" : "is-bad");
      // clear old models
      const old = wrap.querySelector(".sc-model");
      if (old) old.remove();
      if (!ok) {
        all = false;
        const m = document.createElement("span");
        m.className = "sc-model";
        m.textContent = FIELDS[i].model;
        wrap.appendChild(m);
      }
    });

    const hint = document.getElementById("sc-hint");
    if (all) {
      checked = true;
      FIELDS.forEach((f) => {
        const inp = document.getElementById("sc-" + f.id);
        if (inp) inp.disabled = true;
      });
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("sc-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Perfect!";
      }
      setTimeout(() => {
        phase = "done";
        render();
      }, 800);
    } else {
      if (hint) {
        hint.textContent = "Not quite — try again!";
        hint.classList.add("is-visible");
      }
      // focus first wrong
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) {
          const inp = document.getElementById("sc-" + FIELDS[i].id);
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
    fieldOk = [false, false, false];
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();;
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="sc-topbar">' +
        '<a class="sc-back" href="../" aria-label="Back">←</a>' +
        '<span class="sc-title">Student Card</span>' +
        '<span class="sc-badge">2B</span>' +
        "</header>" +
        '<section class="sc-start">' +
        '<div class="sc-hero" aria-hidden="true">🪪</div>' +
        "<h1>Student Identity Card</h1>" +
        '<p class="sc-desc">Listen to the conversation.<br>Complete the information on the card.</p>' +
        '<button type="button" class="sc-btn" id="sc-start">Start →</button>' +
        "</section>";
      document.getElementById("sc-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const stars = saveStars(3);
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: fieldOk.filter(Boolean).length,
          total: fieldOk.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    // play
    app.innerHTML =
      '<header class="sc-topbar">' +
      '<a class="sc-back" href="../" aria-label="Back">←</a>' +
      '<span class="sc-title">Student Card</span>' +
      '<span class="sc-badge">2.13</span>' +
      "</header>" +
      '<div class="sc-play">' +
      '<div class="sc-conv">' +
      '<div class="sc-conv-head">' +
      '<button type="button" class="sc-audio-btn" id="sc-audio" aria-label="Play conversation">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      "<h2>Conversation</h2>" +
      "</div>" +
      '<div class="sc-conv-body">' +
      dialogueHTML() +
      "</div>" +
      "</div>" +
      '<div class="sc-card" aria-label="INTERNATIONAL STUDENT IDENTITY CARD">' +
      '<div class="sc-card-banner">INTERNATIONAL STUDENT IDENTITY CARD</div>' +
      '<div class="sc-card-body">' +
      '<div class="sc-photo" aria-label="Student photo">' +
      '<img src="images/alex.png" alt="Alex Martínez" class="sc-photo-img" draggable="false" />' +
      "</div>" +
      '<div class="sc-fields">' +
      FIELDS.map(
        (f) =>
          '<div class="sc-field" data-id="' +
          f.id +
          '">' +
          '<label for="sc-' +
          f.id +
          '">' +
          f.label +
          "</label>" +
          '<input type="text" id="sc-' +
          f.id +
          '" class="sc-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…" />' +
          "</div>"
      ).join("") +
      "</div>" +
      "</div>" +
      "</div>" +
      '<p class="sc-hint" id="sc-hint" aria-live="polite"></p>' +
      '<div class="sc-actions"><button type="button" class="sc-btn" id="sc-check">Check</button></div>' +
      "</div>";

    document.getElementById("sc-audio").onclick = playAudio;
    document.getElementById("sc-check").onclick = check;

    app.querySelectorAll(".sc-input").forEach((inp, i, list) => {
      inp.addEventListener("input", () => {
        const field = inp.closest(".sc-field");
        if (field) {
          field.classList.remove("is-ok", "is-bad");
          const m = field.querySelector(".sc-model");
          if (m) m.remove();
        }
        const hint = document.getElementById("sc-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (i < list.length - 1) list[i + 1].focus();
          else document.getElementById("sc-check")?.click();
        }
      });
    });
    document.getElementById("sc-name")?.focus();
  }

  render();
})();
