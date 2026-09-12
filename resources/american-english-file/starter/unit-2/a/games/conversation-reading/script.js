/* Conversation Reading – Are you on vacation? · AEF Starter Unit 2A */
(function () {
  const GAME_ID = "starter-2a-conversation-reading";

  const DIALOGUE = [
    { who: "Jessica", text: "Where in the US are you from?" },
    { who: "Max", text: "We're from here, from Chicago." },
    { who: "Jim", text: "Chicago's a beautiful city!" },
    { who: "Rachel", text: "Yes, it is. Are you on vacation?" },
    { who: "Jim", text: "No, we aren't. We're here on business. But today's a free day." },
    { who: "Jessica", text: "Yes, we're tourists today! Ooh. What's that?" },
    { who: "Jim", text: "Oh… Are they your dogs?" },
    { who: "Max", text: "Yes, they are. Sit. Sit!" },
    { who: "Jessica", text: "They're very nice. But I'm not very good with dogs." },
    { who: "Jim", text: "Look – a free table. Over there." },
    { who: "Jessica", text: "Nice to meet you. Have a nice day." },
    { who: "Max", text: "Thanks. Nice to meet you, too." },
    { who: "Rachel", text: "Bye. Good dogs, good dogs." },
  ];

  // Flexible accepted answers (normalized). First item is the model answer shown on wrong.
  const QUESTIONS = [
    {
      q: "Are Rachel and Max from Canada?",
      prompt: "No,",
      model: "they're from Chicago. / they aren't.",
      accept: [
        // full / natural answers
        "they're from chicago",
        "they are from chicago",
        "they're from here from chicago",
        "they are from here from chicago",
        "they're from here",
        "they are from here",
        "from chicago",
        "chicago",
        // short negatives (correct meaning)
        "they aren't",
        "they are not",
        "they're not",
        "no they aren't",
        "no they are not",
        "no they're not",
        "no",
        "no they aren't from canada",
        "no they're not from canada",
        "no they are not from canada",
        "no they're from chicago",
        "no they are from chicago",
        "no from chicago",
        "no chicago",
      ],
    },
    {
      q: "Are Jessica and Jim on business?",
      prompt: "",
      model: "Yes, they are.",
      accept: [
        "yes",
        "yes they are",
        "yes they're on business",
        "yes they are on business",
        "yes they are here on business",
        "yes they're here on business",
        "they are",
        "they're on business",
        "they are on business",
        "on business",
        "yes on business",
      ],
    },
    {
      q: "Is today a free day for Jessica and Jim?",
      prompt: "",
      model: "Yes, it is.",
      accept: [
        "yes",
        "yes it is",
        "yes it is a free day",
        "yes today's a free day",
        "yes today is a free day",
        "yes they have a free day",
        "it is",
        "it's a free day",
        "it is a free day",
        "today's a free day",
        "today is a free day",
        "a free day",
        "free day",
      ],
    },
    {
      q: "Is Jessica good with dogs?",
      prompt: "",
      model: "No, she isn't.",
      accept: [
        "no",
        "no she isn't",
        "no she is not",
        "no she's not",
        "she isn't",
        "she is not",
        "she's not",
        "no she isn't good with dogs",
        "no she's not good with dogs",
        "no she is not good with dogs",
        "no she's not very good with dogs",
        "no she is not very good with dogs",
        "no she's not very good",
        "not very good with dogs",
        "not very good",
        "she's not very good with dogs",
        "she is not very good with dogs",
        "she isn't very good with dogs",
      ],
    },
  ];

  let phase = "menu"; // menu | play | done
  let answers = ["", "", "", ""];
  let results = [null, null, null, null]; // null | true | false
  let checked = false;
  let readingOpen = true;
  let correctCount = 0;
  let currentAudio = null;
  const AUDIO_SRC = "audio/conversation.mp3";

  const app = document.getElementById("game-app");

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    app.querySelectorAll(".cr-audio-btn.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playConversation() {
    const btn = app.querySelector(".cr-audio-btn");
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

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(i, raw) {
    let n = norm(raw);
    if (!n) return false;

    // Fix common typos: "aren.t" / "isn.t" / "theyre" / "shes"
    n = n
      .replace(/\baren\.t\b/g, "aren't")
      .replace(/\bisn\.t\b/g, "isn't")
      .replace(/\bdon\.t\b/g, "don't")
      .replace(/\bwont\b/g, "won't")
      .replace(/\btheyre\b/g, "they're")
      .replace(/\bshes\b/g, "she's")
      .replace(/\bits\b/g, "it's")
      .replace(/\bcant\b/g, "can't");

    // Re-normalize after typo fixes (apostrophes already handled in norm)
    n = norm(n);

    const variants = QUESTIONS[i].accept;
    for (let j = 0; j < variants.length; j++) {
      const v = norm(variants[j]);
      if (n === v) return true;
      // allow leading "no," / "no " already in some variants
      if (n === norm("no " + variants[j])) return true;
      if (n === norm("no, " + variants[j])) return true;
      if (n === norm("yes " + variants[j])) return true;
      if (n === norm("yes, " + variants[j])) return true;
    }

    // Semantic fallbacks by question
    if (i === 0) {
      // from Chicago OR negative about Canada
      if (n.includes("chicago")) return true;
      if (
        (n.includes("aren't") || n.includes("are not") || n.includes("not")) &&
        (n.includes("canada") || n.length < 25)
      ) {
        // "they aren't", "no they aren't", "aren't from canada"
        if (!n.includes("yes")) return true;
      }
    }
    if (i === 1) {
      if (n === "yes" || n.startsWith("yes ")) return true;
      if (n.includes("business") && !n.includes("no") && !n.includes("aren't") && !n.includes("not")) return true;
    }
    if (i === 2) {
      if (n === "yes" || n.startsWith("yes ")) return true;
      if ((n.includes("free") || n.includes("it is") || n === "it is") && !n.includes("no")) return true;
    }
    if (i === 3) {
      if (n === "no" || n.startsWith("no ")) return true;
      if (
        (n.includes("isn't") || n.includes("is not") || n.includes("not")) &&
        !n.includes("yes")
      ) {
        return true;
      }
    }
    return false;
  }

  function calcStars() {
    if (correctCount >= 4) return 3;
    if (correctCount >= 3) return 2;
    if (correctCount >= 2) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function dialogueHTML() {
    return DIALOGUE.map(
      (line) =>
        `<div class="line"><span class="speaker">${line.who}</span><span class="speech">${line.text}</span></div>`
    ).join("");
  }

  function questionsHTML() {
    return QUESTIONS.map((item, i) => {
      const state = results[i];
      const cardClass =
        state === true ? " correct" : state === false ? " wrong" : "";
      const fb =
        state === true
          ? `<div class="q-feedback ok">✓ Correct</div>`
          : state === false
          ? `<div class="q-feedback bad">✗ ${item.prompt ? item.prompt + " " : ""}${item.model}</div>`
          : `<div class="q-feedback"></div>`;
      const prefix = item.prompt
        ? `<span style="font-weight:600;margin-right:6px;color:#64748b">${item.prompt}</span>`
        : "";
      return `
        <div class="q-card${cardClass}" data-q="${i}">
          <div class="q-num">Question ${i + 1}</div>
          <p class="q-text">${item.q}</p>
          <div style="display:flex;align-items:center;gap:4px">
            ${prefix}
            <input class="q-input" id="q-${i}" type="text" autocomplete="off"
              placeholder="Write your answer…"
              value="${answers[i].replace(/"/g, "&quot;")}"
              ${checked ? "disabled" : ""} />
          </div>
          ${fb}
        </div>`;
    }).join("");
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Are you on vacation?</span>
          <span class="lw-badge">2A</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">📖</div>
          <h1>Conversation Reading</h1>
          <p class="lw-desc">Listen to and read the conversation.<br>Then write short answers to the questions.<br>The text stays open so you can check anytime.</p>
          <button type="button" class="lw-btn" id="lw-start">Start →</button>
        </section>`;
      document.getElementById("lw-start").onclick = () => {
        stopAudio();
        phase = "play";
        answers = ["", "", "", ""];
        results = [null, null, null, null];
        checked = false;
        correctCount = 0;
        readingOpen = true;
        render();
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Are you on vacation?</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div>
            </div>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / 4</strong> correct.</p>
          <button type="button" class="lw-btn" id="lw-again">Play again</button>
          <button type="button" class="lw-btn secondary" id="lw-menu">Home</button>
        </section>`;
      document.getElementById("lw-again").onclick = () => {
        stopAudio();
        phase = "menu";
        render();
        setTimeout(() => document.getElementById("lw-start")?.click(), 0);
      };
      document.getElementById("lw-menu").onclick = () => {
        stopAudio();
        phase = "menu";
        render();
      };
      return;
    }

    // play — left: conversation, right: questions (no page scroll)
    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">Are you on vacation?</span>
        <span class="lw-badge">Reading</span>
      </header>
      <div class="lw-play">
        <div class="reading-panel">
          <div class="reading-header">
            <div class="reading-header-left">
              <button type="button" class="cr-audio-btn" id="cr-audio" aria-label="Play conversation">
                <span class="wave"></span><span class="wave"></span><span class="wave"></span>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                <div class="eq"><span></span><span></span><span></span><span></span></div>
              </button>
              <h2>Conversation</h2>
            </div>
            <button type="button" class="reading-toggle" id="toggle-reading">
              ${readingOpen ? "Hide" : "Show"}
            </button>
          </div>
          <div class="reading-body${readingOpen ? "" : " collapsed"}" id="reading-body">
            ${dialogueHTML()}
          </div>
        </div>
        <div class="right-col">
          <div class="questions-panel">
            ${questionsHTML()}
          </div>
          <div class="actions">
            ${
              checked
                ? `<button type="button" class="lw-btn" id="lw-finish">See results →</button>`
                : `<button type="button" class="lw-btn" id="lw-check">Check answers</button>`
            }
          </div>
        </div>
      </div>`;

    document.getElementById("toggle-reading").onclick = () => {
      // save current inputs
      for (let i = 0; i < 4; i++) {
        const el = document.getElementById("q-" + i);
        if (el) answers[i] = el.value;
      }
      const wasPlaying = !!(currentAudio && !currentAudio.paused);
      readingOpen = !readingOpen;
      render();
      if (wasPlaying) playConversation();
    };

    document.getElementById("cr-audio").onclick = playConversation;

    if (!checked) {
      for (let i = 0; i < 4; i++) {
        const el = document.getElementById("q-" + i);
        if (el) {
          el.addEventListener("input", () => {
            answers[i] = el.value;
          });
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") document.getElementById("lw-check")?.click();
          });
        }
      }
      document.getElementById("lw-check").onclick = () => {
        for (let i = 0; i < 4; i++) {
          const el = document.getElementById("q-" + i);
          if (el) answers[i] = el.value;
        }
        correctCount = 0;
        for (let i = 0; i < 4; i++) {
          const ok = isCorrect(i, answers[i]);
          results[i] = ok;
          if (ok) correctCount++;
        }
        checked = true;
        render();
      };
    } else {
      document.getElementById("lw-finish").onclick = () => {
        stopAudio();
        phase = "done";
        render();
      };
    }
  }

  render();
})();
