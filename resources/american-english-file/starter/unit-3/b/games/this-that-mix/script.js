/* This / That Mix · Write the question OR the answer · AEF Starter Unit 3B */
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


  const GAME_ID = "starter-3b-this-that-mix";

  const ITEMS = [
    // Singular – this
    { id: "umbrella",  answer: "an umbrella",  question: "What is this?",  sentence: "This is an umbrella.",  image: "images/this-is-an-umbrella.png" },
    { id: "laptop",    answer: "a laptop",     question: "What is this?",  sentence: "This is a laptop.",     image: "images/this-is-a-laptop.png" },
    { id: "charger",   answer: "a charger",    question: "What is this?",  sentence: "This is a charger.",    image: "images/this-is-a-charger.png" },
    { id: "book",      answer: "a book",       question: "What is this?",  sentence: "This is a book.",       image: "images/this-is-a-book.png" },
    { id: "key",       answer: "a key",        question: "What is this?",  sentence: "This is a key.",        image: "images/this-is-a-key.png" },
    // Singular – that
    { id: "id-card",   answer: "an ID card",   question: "What is that?",  sentence: "That is an ID card.",   image: "images/that-is-an-id-card.png" },
    { id: "photo",     answer: "a photo",      question: "What is that?",  sentence: "That is a photo.",      image: "images/that-is-a-photo.png" },
    { id: "passport",  answer: "a passport",   question: "What is that?",  sentence: "That is a passport.",   image: "images/that-is-a-passport.png" },
    { id: "tv",        answer: "a TV",         question: "What is that?",  sentence: "That is a TV.",         image: "images/that-is-a-tv.png" },
    { id: "notebook",  answer: "a notebook",   question: "What is that?",  sentence: "That is a notebook.",   image: "images/that-is-a-notebook.png" },
    // Plural – those
    { id: "phones",    answer: "phones",       question: "What are those?", sentence: "Those are phones.",    image: "images/those-are-phones.png" },
    { id: "windows",   answer: "windows",      question: "What are those?", sentence: "Those are windows.",   image: "images/those-are-windows.png" },
    { id: "coats",     answer: "coats",        question: "What are those?", sentence: "Those are coats.",     image: "images/those-are-coats.png" },
    { id: "keys",      answer: "keys",         question: "What are those?", sentence: "Those are keys.",      image: "images/those-are-keys.png" },
    { id: "keychains", answer: "keychains",    question: "What are those?", sentence: "Those are keychains.", image: "images/those-are-keychains.png" },
    // Plural – these
    { id: "watches",   answer: "watches",      question: "What are these?", sentence: "These are watches.",   image: "images/these-are-watches.png" },
    { id: "tshirts",   answer: "T-shirts",     question: "What are these?", sentence: "These are T-shirts.",  image: "images/these-are-tshirts.png" },
    { id: "chairs",    answer: "chairs",       question: "What are these?", sentence: "These are chairs.",    image: "images/these-are-chairs.png" },
    { id: "mugs",      answer: "mugs",         question: "What are these?", sentence: "These are mugs.",      image: "images/these-are-mugs.png" },
    { id: "glasses",   answer: "glasses",      question: "What are these?", sentence: "These are glasses.",   image: "images/these-are-glasses.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let current = 0;
  let correctCount = 0;
  let locked = false;
  let playRecorded = false;
  let currentType = "q";

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[?.!,]/g, "")
      .replace(/\s+/g, " ");
  }

  function updateStars() {
    if (!window.LAStars) return;
    const total = order.length;
    const stars = correctCount >= total ? 3 : correctCount >= Math.ceil(total * 0.6) ? 2 : correctCount >= 1 ? 1 : 0;
    if (stars > 0) {
      if (!playRecorded) {
        LAStars.recordPlay(GAME_ID);
        playRecorded = true;
      }
      LAStars.save(GAME_ID, stars);
    }
  }

  function start() {
    if (window.LAFinish) LAFinish.startTimer();
    const indices = shuffle(ITEMS.map((_, i) => i)).slice(0, 10);
    order = indices.map((idx) => ({
      itemIndex: idx,
      type: Math.random() < 0.5 ? "q" : "a",
    }));
    current = 0;
    correctCount = 0;
    locked = false;
    playRecorded = false;
    currentType = order[0].type;
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (locked) return;
    const input = document.getElementById("su-input");
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;

    locked = true;
    const entry = order[current];
    const item = ITEMS[entry.itemIndex];
    const target = currentType === "q" ? item.question : item.sentence;

    // Accept with or without final ? or .
    const correct = normalize(val) === normalize(target);

    input.classList.add(correct ? "is-correct" : "is-wrong");
    input.disabled = true;

    const feedback = document.getElementById("su-feedback");
    if (feedback) {
      if (correct) {
        feedback.textContent = "Correct!"; try{sfxCorrect();}catch(e){}
        feedback.className = "su-feedback ok";
      } else {
        feedback.textContent = "Answer: " + target;
        feedback.className = "su-feedback err";
      }
    }

    if (correct) {
      correctCount++;
      updateStars();
    }

    setTimeout(() => {
      current++;
      if (current >= order.length) {
        phase = "done";
        render();
      } else {
        currentType = order[current].type;
        locked = false;
        render();
      }
    }, correct ? 900 : 1600);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">This / That Mix</span>
          <span class="mc-progress">3B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">✍️</div>
          <h1>This / That Mix</h1>
          <p class="mc-desc">Sometimes write the question · sometimes write the answer</p>
          <button type="button" class="mc-btn" id="start-btn">Start</button>
        </section>`;
      document.getElementById("start-btn").onclick = start;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: order.length,
          timeMs: timeMs,
          onAgain: () => start(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const total = order.length;
      const stars = correctCount >= total ? 3 : correctCount >= Math.ceil(total * 0.6) ? 2 : correctCount >= 1 ? 1 : 0;
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">This / That Mix</span>
          <span class="mc-progress">3B</span>
        </header>
        <section class="mc-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div>
            </div>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / ${total}</strong> correct.</p>
          <button type="button" class="mc-btn" id="again">Play again</button>
          <button type="button" class="mc-btn secondary" id="menu">Menu</button>
        </section>`;
      document.getElementById("again").onclick = start;
      document.getElementById("menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // Play – writing
    const entry = order[current];
    const item = ITEMS[entry.itemIndex];
    const progress = (current + 1) + " / " + order.length;
    const isQuestion = currentType === "q";
    const prompt = isQuestion ? item.answer : item.question;
    const taskLabel = isQuestion ? "Write the question" : "Write the answer";
    const placeholder = isQuestion ? "What is / are … ?" : "This / That / These / Those …";

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${taskLabel}</span>
        <span class="mc-progress">${progress}</span>
      </header>

      <div class="su-pic">
        <img src="${item.image}" alt="" draggable="false" />
      </div>
      <p class="su-answer">${prompt}</p>

      <div class="su-write">
        <input type="text" class="su-input" id="su-input"
          placeholder="${placeholder}"
          autocomplete="off" autocorrect="off" spellcheck="false"
          ${locked ? "disabled" : ""} />
        <button type="button" class="mc-btn" id="su-check" ${locked ? "disabled" : ""}>Check</button>
      </div>
      <p class="su-feedback" id="su-feedback"></p>
    `;

    const input = document.getElementById("su-input");
    const checkBtn = document.getElementById("su-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    if (input) {
      input.focus();
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkAnswer();
        }
      });
    }
  }

  render();
})();
