/* Conversation Match · Tactics For Listening Basic Unit 1
 * Match questions ↔ answers. Soft UI, LAStars + LAFinish + LASfx.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-conversation-match";
  const TOTAL = 8;

  const PAIRS = [
    { q: "What's your name?", a: "It's Kyle Jones.", letter: "c" },
    { q: "How are you?", a: "I'm fine, thanks.", letter: "e" },
    { q: "What's your e-mail address?", a: "It's kylejones@tmail.com.", letter: "a" },
    { q: "Hello, Kyle.", a: "Hi, Sara.", letter: "f" },
    { q: "Nice to meet you.", a: "Nice to meet you, too.", letter: "h" },
    { q: "How do you spell your name?", a: "K-Y-L-E.", letter: "g" },
    { q: "What's your phone number?", a: "It's 555-2398.", letter: "d" },
    { q: "Good morning, Kate.", a: "Good morning.", letter: "b" },
  ];

  const app = document.getElementById("game-app");
  let phase = "start"; // start | play | done
  let selectedQ = null;
  let matched = {}; // qIndex -> aIndex
  let usedAnswers = new Set();
  let correctCount = 0;
  let attempts = 0;
  let playRecorded = false;
  let qOrder = [];
  let aOrder = [];
  let feedback = null; // { type, msg } temporary

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function calcStars() {
    const acc = attempts ? (correctCount / attempts) * 100 : 0;
    if (correctCount >= TOTAL && acc >= 90) return 3;
    if (correctCount >= TOTAL && acc >= 70) return 2;
    if (correctCount >= Math.ceil(TOTAL * 0.5)) return 1;
    return 0;
  }

  function saveProgress() {
    if (!window.LAStars) return calcStars();
    const stars = calcStars();
    if (!playRecorded) {
      LAStars.recordPlay(GAME_ID);
      playRecorded = true;
    }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: "Conversation Match",
          category: "tactics-for-listening",
          unit: "basic-1",
          score: correctCount,
          maxScore: TOTAL,
          accuracy: attempts ? Math.round((correctCount / attempts) * 100) : 0,
          completed: correctCount >= TOTAL,
          stars: stars,
        });
      }
    } catch (e) {}
    return stars;
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    qOrder = shuffle(PAIRS.map((_, i) => i));
    aOrder = shuffle(PAIRS.map((_, i) => i));
    selectedQ = null;
    matched = {};
    usedAnswers = new Set();
    correctCount = 0;
    attempts = 0;
    playRecorded = false;
    feedback = null;
    phase = "play";
    render();
  }

  function selectQuestion(qi) {
    if (matched[qi] != null) return;
    sfx("click");
    selectedQ = selectedQ === qi ? null : qi;
    feedback = null;
    render();
  }

  function selectAnswer(ai) {
    if (usedAnswers.has(ai) || selectedQ == null) {
      if (selectedQ == null) {
        feedback = { type: "hint", msg: "Tap a question first" };
        render();
        setTimeout(() => { feedback = null; render(); }, 1200);
      }
      return;
    }
    attempts++;
    const qIdx = selectedQ;
    const isCorrect = qIdx === ai;

    if (isCorrect) {
      sfx("correct");
      matched[qIdx] = ai;
      usedAnswers.add(ai);
      correctCount++;
      selectedQ = null;
      feedback = { type: "ok", msg: "Nice!" };
      render();
      setTimeout(() => {
        feedback = null;
        if (correctCount >= TOTAL) {
          finish();
        } else {
          render();
        }
      }, 550);
    } else {
      sfx("wrong");
      feedback = { type: "bad", msg: "Try again" };
      selectedQ = null;
      render();
      setTimeout(() => { feedback = null; render(); }, 700);
    }
  }

  function finish() {
    const stars = saveProgress();
    phase = "done";
    sfx("win");

    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 100;
      LAFinish.show({
        gameId: GAME_ID,
        score: correctCount,
        total: TOTAL,
        stars: stars,
        accuracy: accuracy,
        timeMs: timeMs,
        onAgain: () => startGame(),
        onModes: () => { phase = "start"; render(); },
        backHref: "../../",
        save: false,
      });
      return;
    }
    render();
  }

  function renderStart() {
    app.innerHTML = `
      <header class="cm-top">
        <a class="cm-back" href="../../" aria-label="Back to Unit 1">←</a>
        <div class="cm-top-center">
          <span class="cm-eyebrow">Unit 1 · Basic</span>
          <strong>Conversation Match</strong>
        </div>
        <span class="cm-top-spacer" aria-hidden="true"></span>
      </header>
      <section class="cm-hero">
        <div class="cm-hero-icon-wrap" aria-hidden="true">💬</div>
        <h1>Conversation Match</h1>
        <p>Match each question to the best reply. Eight everyday greetings and introductions.</p>
        <ul class="cm-tips">
          <li><span class="tip-num">1</span><span>Tap a <strong>question</strong>, then tap its <strong>answer</strong></span></li>
          <li><span class="tip-num">2</span><span>Match all <strong>8 pairs</strong> to finish</span></li>
        </ul>
        <button type="button" class="cm-btn primary" id="cm-start">Start matching</button>
      </section>`;
    document.getElementById("cm-start").onclick = startGame;
  }

  function renderPlay() {
    const progress = correctCount + " / " + TOTAL;
    const qHtml = qOrder
      .map((qi) => {
        const done = matched[qi] != null;
        const sel = selectedQ === qi;
        let cls = "cm-card q";
        if (done) cls += " is-done";
        if (sel) cls += " is-selected";
        return `<button type="button" class="${cls}" data-q="${qi}" ${done ? "disabled" : ""}>
          <span class="cm-num">${qi + 1}</span>
          <span class="cm-text">${PAIRS[qi].q}</span>
          ${done ? '<span class="cm-check" aria-hidden="true">✓</span>' : ""}
        </button>`;
      })
      .join("");

    const aHtml = aOrder
      .map((ai) => {
        const used = usedAnswers.has(ai);
        let cls = "cm-card a";
        if (used) cls += " is-done";
        return `<button type="button" class="${cls}" data-a="${ai}" ${used ? "disabled" : ""}>
          <span class="cm-letter">${PAIRS[ai].letter}</span>
          <span class="cm-text">${PAIRS[ai].a}</span>
          ${used ? '<span class="cm-check" aria-hidden="true">✓</span>' : ""}
        </button>`;
      })
      .join("");

    const fb =
      feedback
        ? `<div class="cm-feedback ${feedback.type}" role="status">${feedback.msg}</div>`
        : selectedQ != null
        ? `<div class="cm-feedback hint" role="status">Now choose the matching answer</div>`
        : `<div class="cm-feedback idle" role="status">Choose a question</div>`;

    app.innerHTML = `
      <header class="cm-top">
        <a class="cm-back" href="../../" aria-label="Back to Unit 1">←</a>
        <div class="cm-top-center">
          <span class="cm-eyebrow">Conversation Match</span>
          <strong>${progress} matched</strong>
        </div>
        <span class="cm-top-spacer" aria-hidden="true"></span>
      </header>
      <div class="cm-progress-bar" aria-hidden="true">
        <div class="cm-progress-fill" style="width:${(correctCount / TOTAL) * 100}%"></div>
      </div>
      ${fb}
      <div class="cm-board">
        <div class="cm-col">
          <h2 class="cm-col-title">Questions</h2>
          <div class="cm-list">${qHtml}</div>
        </div>
        <div class="cm-col">
          <h2 class="cm-col-title">Answers</h2>
          <div class="cm-list">${aHtml}</div>
        </div>
      </div>`;

    app.querySelectorAll("[data-q]").forEach((btn) => {
      btn.onclick = () => selectQuestion(+btn.dataset.q);
    });
    app.querySelectorAll("[data-a]").forEach((btn) => {
      btn.onclick = () => selectAnswer(+btn.dataset.a);
    });
  }

  function renderDone() {
    const stars = calcStars();
    const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 100;
    app.innerHTML = `
      <header class="cm-top">
        <a class="cm-back" href="../../" aria-label="Back to Unit 1">←</a>
        <div class="cm-top-center">
          <span class="cm-eyebrow">Unit 1 · Basic</span>
          <strong>Done!</strong>
        </div>
        <span></span>
      </header>
      <section class="cm-done">
        <div class="cm-trophy ${stars === 3 ? "perfect" : ""}" aria-hidden="true">
          <div class="cm-trophy-emoji">🏆</div>
          <div class="cm-star-row">
            <span class="star ${stars >= 1 ? "filled" : ""}">★</span>
            <span class="star ${stars >= 2 ? "filled" : ""}">★</span>
            <span class="star ${stars >= 3 ? "filled" : ""}">★</span>
          </div>
        </div>
        <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!"}</h1>
        <p>You matched <strong>${correctCount} / ${TOTAL}</strong> · ${accuracy}% accuracy</p>
        <div class="cm-done-actions">
          <button type="button" class="cm-btn primary" id="cm-again">Play again</button>
          <a class="cm-btn secondary" href="../../">Back to Unit 1</a>
        </div>
      </section>`;
    document.getElementById("cm-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
