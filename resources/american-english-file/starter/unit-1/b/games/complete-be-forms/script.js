/* Complete with be – Parts a, b, c – type the answers */
(function () {
  const GAME_ID = "starter-1b-complete-be-forms";

  function saveProgress(stars) {
    function doSave() {
      if (!window.LAStars) return false;
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
        return true;
      } catch (e) {
        return false;
      }
    }
    if (doSave()) return;
    var existing = document.querySelector("script[data-la-stars], script[src*='la-stars']");
    if (!existing) {
      var s = document.createElement("script");
      s.src = "/learningarcade/la-stars.js";
      s.setAttribute("data-la-stars", "");
      s.onload = function () { doSave(); };
      document.head.appendChild(s);
    } else {
      setTimeout(doSave, 300);
      setTimeout(doSave, 1000);
    }
  }
  const PARTS = [
    {
      id: "a",
      letter: "a",
      title: "He's / She's / It's",
      tip: "Complete with He's, She's, or It's.",
      placeholder: "He's / She's / It's",
      items: [
        {
          lines: [
            { sp: "A", text: "Where's Lisa from?" },
            { sp: "B", text: "{{0}} from Canada." },
          ],
          answers: ["She's", "She's", "shes"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Ankara?" },
            { sp: "B", text: "{{0}} in Turkey." },
          ],
          answers: ["It's", "It's", "its"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Mario from?" },
            { sp: "B", text: "{{0}} from Brazil." },
          ],
          answers: ["He's", "He's", "hes"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Beijing?" },
            { sp: "B", text: "{{0}} in China." },
          ],
          answers: ["It's", "It's", "its"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Charles from?" },
            { sp: "B", text: "{{0}} from England." },
          ],
          answers: ["He's", "He's", "hes"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Maria from?" },
            { sp: "B", text: "{{0}} from Peru." },
          ],
          answers: ["She's", "She's", "shes"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Toronto?" },
            { sp: "B", text: "{{0}} in Canada." },
          ],
          answers: ["It's", "It's", "its"],
        },
        {
          lines: [
            { sp: "A", text: "Where's Carlos from?" },
            { sp: "B", text: "{{0}} from Mexico." },
          ],
          answers: ["He's", "He's", "hes"],
        },
      ],
    },
    {
      id: "b",
      letter: "b",
      title: "is / 's / isn't",
      tip: "Complete with is, 's, or isn't.",
      placeholder: "is / 's / isn't",
      items: [
        {
          lines: [
            { sp: "A", text: "Where {{0}} Osaka? {{1}} it in Japan?" },
            { sp: "B", text: "Yes, it {{2}}." },
          ],
          // each blank: list of accepted spellings
          answers: [
            ["is"],
            ["Is", "is"],
            ["is"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "{{0}} Mark from the US?" },
            { sp: "B", text: "No, he {{1}}. He {{2}} from Canada." },
          ],
          answers: [
            ["Is", "is"],
            ["isn't", "isnt", "is not"],
            ["'s", "s", "is"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "Where {{0}} she from?" },
            { sp: "B", text: "She {{1}} from Rio." },
          ],
          answers: [
            ["is"],
            ["'s", "s", "is"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "{{0}} Robert from Canada?" },
            { sp: "B", text: "No, he {{1}}. He {{2}} from England." },
          ],
          answers: [
            ["Is", "is"],
            ["isn't", "isnt", "is not"],
            ["'s", "s", "is"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "{{0}} Lima in Mexico?" },
            { sp: "B", text: "No, it {{1}}. It {{2}} in Peru." },
          ],
          answers: [
            ["Is", "is"],
            ["isn't", "isnt", "is not"],
            ["'s", "s", "is"],
          ],
        },
      ],
    },
    {
      id: "c",
      letter: "c",
      title: "Form of be",
      tip: "Complete with the correct form of be. Use contractions where possible.",
      placeholder: "is, 's, are, 'm …",
      items: [
        {
          lines: [
            { sp: "A", text: "Where {{0}} Manchester? {{1}} it in the UK?" },
            { sp: "B", text: "Yes, it {{2}}." },
          ],
          answers: [
            ["is"],
            ["Is", "is"],
            ["is"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "Where {{0}} Alex from? {{1}} he from Mexico?" },
            { sp: "B", text: "No, he {{2}}. He {{3}} from the US." },
          ],
          answers: [
            ["is"],
            ["Is", "is"],
            ["isn't", "isnt", "is not"],
            ["'s", "s", "is"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "Where {{0}} you from?" },
            { sp: "B", text: "I {{1}} from Toronto." },
          ],
          answers: [
            ["are"],
            ["'m", "m", "am"],
          ],
        },
        {
          lines: [
            { sp: "A", text: "What {{0}} your name?" },
            { sp: "B", text: "My name {{1}} Ana. I {{2}} from Chicago." },
            { sp: "A", text: "You {{3}} from Chicago! I {{4}} from Chicago, too! It {{5}} a great city." },
          ],
          answers: [
            ["is"],
            ["'s", "s", "is"],
            ["'m", "m", "am"],
            ["'re", "re", "are"],
            ["'m", "m", "am"],
            ["'s", "s", "is"],
          ],
        },
      ],
    },
  ];

  // Normalize part a answers to array form
  PARTS[0].items.forEach((it) => {
    if (typeof it.answers[0] === "string") {
      it.answers = it.answers.map((a) => {
        // build accepted list from primary + variants
        const primary = a;
        const variants = [primary, primary.toLowerCase(), primary.replace("'", ""), primary.replace("'", "").toLowerCase()];
        return Array.from(new Set(variants));
      });
      // fix: answers was ["She's","She's","shes"] meaning alternatives — redo cleanly
    }
  });
  // Fix part a properly
  PARTS[0].items = [
    { lines: [{ sp: "A", text: "Where's Lisa from?" }, { sp: "B", text: "{{0}} from Canada." }], answers: [["She's", "she's", "Shes", "shes"]] },
    { lines: [{ sp: "A", text: "Where's Ankara?" }, { sp: "B", text: "{{0}} in Turkey." }], answers: [["It's", "it's", "Its", "its"]] },
    { lines: [{ sp: "A", text: "Where's Mario from?" }, { sp: "B", text: "{{0}} from Brazil." }], answers: [["He's", "he's", "Hes", "hes"]] },
    { lines: [{ sp: "A", text: "Where's Beijing?" }, { sp: "B", text: "{{0}} in China." }], answers: [["It's", "it's", "Its", "its"]] },
    { lines: [{ sp: "A", text: "Where's Charles from?" }, { sp: "B", text: "{{0}} from England." }], answers: [["He's", "he's", "Hes", "hes"]] },
    { lines: [{ sp: "A", text: "Where's Maria from?" }, { sp: "B", text: "{{0}} from Peru." }], answers: [["She's", "she's", "Shes", "shes"]] },
    { lines: [{ sp: "A", text: "Where's Toronto?" }, { sp: "B", text: "{{0}} in Canada." }], answers: [["It's", "it's", "Its", "its"]] },
    { lines: [{ sp: "A", text: "Where's Carlos from?" }, { sp: "B", text: "{{0}} from Mexico." }], answers: [["He's", "he's", "Hes", "hes"]] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let partIndex = 0;
  let itemIndex = 0;
  let blankIndex = 0;
  let filled = [];
  let correctCount = 0;
  let totalBlanks = 0;
  let locked = false;

  function countBlanks(part) {
    return part.items.reduce((n, it) => n + it.answers.length, 0);
  }

  function startPart(pi) {
    partIndex = pi;
    itemIndex = 0;
    blankIndex = 0;
    filled = [];
    correctCount = 0;
    totalBlanks = countBlanks(PARTS[pi]);
    locked = false;
    phase = "play";
    render();
  }

  function currentItem() {
    return PARTS[partIndex].items[itemIndex];
  }

  function normalize(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[’‘]/g, "'");
  }

  function isMatch(input, accepted) {
    const n = normalize(input).toLowerCase();
    return accepted.some((a) => normalize(a).toLowerCase() === n);
  }

  function displayAnswer(accepted) {
    // prefer the first (canonical) form
    return accepted[0];
  }

  function renderLines(item) {
    return item.lines
      .map((line) => {
        let html = line.text;
        html = html.replace(/\{\{(\d+)\}\}/g, (_, n) => {
          const i = +n;
          if (i < filled.length) {
            return `<span class="cb-blank filled">${filled[i]}</span>`;
          }
          if (i === blankIndex) {
            return `<span class="cb-blank active">&nbsp;&nbsp;&nbsp;</span>`;
          }
          return `<span class="cb-blank">&nbsp;&nbsp;&nbsp;</span>`;
        });
        return `<div class="cb-line"><span class="speaker">${line.sp}</span> ${html}</div>`;
      })
      .join("");
  }

  function submitAnswer() {
    if (locked || phase !== "play") return;
    const input = document.getElementById("cb-input");
    if (!input) return;
    const value = input.value;
    if (!normalize(value)) {
      input.classList.add("cb-input-empty");
      setTimeout(() => input.classList.remove("cb-input-empty"), 400);
      return;
    }

    const item = currentItem();
    const accepted = item.answers[blankIndex];
    const ok = isMatch(value, accepted);
    locked = true;

    const feedback = document.getElementById("cb-feedback");
    if (ok) {
      correctCount += 1;
      filled.push(displayAnswer(accepted));
      if (feedback) {
        feedback.textContent = "✓ Correct!";
        feedback.className = "cb-feedback ok";
      }
      input.classList.add("cb-input-ok");
    } else {
      if (feedback) {
        feedback.textContent = "Try again";
        feedback.className = "cb-feedback bad";
      }
      input.classList.add("cb-input-bad");
    }

    setTimeout(() => {
      if (ok) {
        if (blankIndex < item.answers.length - 1) {
          blankIndex += 1;
          locked = false;
          render();
        } else if (itemIndex < PARTS[partIndex].items.length - 1) {
          itemIndex += 1;
          blankIndex = 0;
          filled = [];
          locked = false;
          render();
        } else {
          phase = "done";
          render();
        }
      } else {
        locked = false;
        input.classList.remove("cb-input-bad");
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "cb-feedback";
        }
        input.select();
        input.focus();
      }
    }, ok ? 550 : 700);
  }

  function calcStars() {
    if (correctCount >= totalBlanks) return 3;
    if (correctCount >= Math.ceil(totalBlanks * 0.7)) return 2;
    if (correctCount >= Math.ceil(totalBlanks * 0.4)) return 1;
    return 0;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="cb-topbar">
          <a class="cb-back" href="../" aria-label="Back">←</a>
          <span class="cb-title">Complete with be</span>
          <span class="cb-badge">1B</span>
        </header>
        <section class="cb-start">
          <div class="cb-hero" aria-hidden="true">✏️</div>
          <h1>Complete the conversations</h1>
          <p class="cb-desc">Type the correct form of <strong>be</strong>.</p>
          <div class="cb-mode-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="cb-mode-card" data-part="${i}">
                <span class="cb-mode-letter">${p.letter}</span>
                <div>
                  <strong>${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".cb-mode-card").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    if (phase === "done") {
      const stars = calcStars();
      saveProgress(stars);
      const part = PARTS[partIndex];
      app.innerHTML = `
        <header class="cb-topbar">
          <a class="cb-back" href="../" aria-label="Back">←</a>
          <span class="cb-title">Complete with be</span>
          <span class="cb-badge">Done</span>
        </header>
        <section class="cb-done">
          <div class="cb-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="cb-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>Part ${part.letter}</strong> · ${part.title}<br>
          You got <strong>${correctCount} / ${totalBlanks}</strong> correct.</p>
          <button type="button" class="cb-btn" id="cb-again">Play again</button>
          <button type="button" class="cb-btn secondary" id="cb-menu">All parts</button>
        </section>`;
      document.getElementById("cb-again").onclick = () => startPart(partIndex);
      document.getElementById("cb-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const part = PARTS[partIndex];
    const item = currentItem();
    const progress = `${itemIndex + 1} / ${part.items.length}`;

    app.innerHTML = `
      <header class="cb-topbar">
        <button type="button" class="cb-back" id="cb-back" aria-label="Back">←</button>
        <span class="cb-title">Part ${part.letter} · ${part.title}</span>
        <span class="cb-progress">${progress}</span>
      </header>
      <section class="cb-prompt">
        <p class="cb-label">${part.tip}</p>
        <div class="cb-lines">${renderLines(item)}</div>
        ${item.answers.length > 1 ? `<p class="cb-hint">Blank ${blankIndex + 1} of ${item.answers.length}</p>` : ""}
      </section>
      <div class="cb-type-area">
        <input type="text" id="cb-input" class="cb-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${part.placeholder}" />
        <button type="button" class="cb-btn cb-check" id="cb-check">Check</button>
        <p class="cb-feedback" id="cb-feedback"></p>
      </div>`;

    document.getElementById("cb-back").onclick = () => {
      phase = "menu";
      render();
    };
    const input = document.getElementById("cb-input");
    const check = document.getElementById("cb-check");
    check.onclick = submitAnswer;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  render();
})();
