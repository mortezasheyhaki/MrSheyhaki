/* Are you…? – AEF Starter Unit 1A Communicative */
(function () {
  const GAME_ID = "starter-1a-are-you";

  const NAMES = [
    "Katy Perry",
    "Ed Sheeran",
    "Beyoncé",
    "Cameron Diaz",
    "Denzel Washington",
    "Tom Hanks",
    "Shakira",
    "Jennifer Lopez",
    "Selena Gomez",
    "Emilia Clarke",
  ];

  const POSE = {
    waiting: "images/waiting.png",
    thinking: "images/thinking.png",
    asking: "images/asking.png",
    picking: "images/picking.png",
    success: "images/success.png",
  };

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | part1 | part1-win | part2-pick | part2 | part2-win | again
  let secret = "";
  let playerRole = "";
  let usedSecrets = [];
  let guesses = 0;
  let part1Done = false;
  let part2Done = false;
  let aiPool = [];
  let aiAsked = [];
  let waitingForAnswer = false;
  let thinkTimer = null;

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[?.!]+$/g, "");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pickSecret() {
    let pool = NAMES.filter((n) => !usedSecrets.includes(n));
    if (pool.length < 3) {
      usedSecrets = [];
      pool = NAMES.slice();
    }
    secret = pool[Math.floor(Math.random() * pool.length)];
    usedSecrets.push(secret);
    guesses = 0;
  }

  function parseAreYou(input) {
    const n = norm(input);
    // Accept: "are you ed sheeran" / "are you ed sheeran?"
    const m = n.match(/^are you\s+(.+)$/);
    if (!m) return null;
    const namePart = m[1].trim();
    // Find matching celebrity (allow partial last-name only if unique)
    const hit = NAMES.find((name) => norm(name) === namePart);
    if (hit) return hit;
    // fuzzy: last name only
    const byLast = NAMES.filter((name) => {
      const parts = norm(name).split(" ");
      return parts[parts.length - 1] === namePart || norm(name).includes(namePart);
    });
    if (byLast.length === 1) return byLast[0];
    return namePart; // unknown name string
  }

  function isYes(input) {
    const n = norm(input);
    return (
      n === "yes i am" ||
      n === "yes, i am" ||
      n === "yes i'm" ||
      n === "yes i'm" ||
      n === "yes"
    );
  }

  function isNo(input) {
    const n = norm(input);
    return (
      n === "no i'm not" ||
      n === "no i'm not" ||
      n === "no, i'm not" ||
      n === "no, i am not" ||
      n === "no i am not" ||
      n === "no"
    );
  }

  function calcStars() {
    // 3 if both parts done, 2 if one, 1 if started and got at least one right
    if (part1Done && part2Done) return 3;
    if (part1Done || part2Done) return 2;
    return guesses > 0 ? 1 : 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function setPose(src, alt) {
    const img = document.getElementById("ay-char");
    if (img) {
      img.src = src;
      img.alt = alt || "";
    }
  }

  function bubble(text, who) {
    const el = document.getElementById("ay-bubble");
    if (!el) return;
    el.className = "ay-bubble " + (who || "char");
    el.innerHTML = text;
  }

  function chipSuggestions(filterFn) {
    const names = typeof filterFn === "function" ? NAMES.filter(filterFn) : NAMES;
    return names
      .map(
        (n) =>
          `<button type="button" class="ay-chip" data-name="${escapeHtml(n)}">${escapeHtml(n)}</button>`
      )
      .join("");
  }

  /* ---------- SCREENS ---------- */

  function showStart() {
    mode = "start";
    clearTimeout(thinkTimer);
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="../" aria-label="Back">←</a>
        <span class="ay-title">Are you…?</span>
        <span class="ay-badge">1A</span>
      </header>
      <section class="ay-start">
        <div class="ay-hero-char">
          <img src="${POSE.waiting}" alt="Character" class="ay-char-img">
        </div>
        <h1>Are you…?</h1>
        <p class="ay-desc">Practice questions with <strong>Are you…?</strong><br>
          and answers <strong>Yes, I am.</strong> / <strong>No, I'm not.</strong></p>
        <div class="ay-parts">
          <div class="ay-part-card">
            <span class="ay-part-num">1</span>
            <div>
              <strong>Guess who</strong>
              <p>I pick a celebrity. You ask!</p>
            </div>
          </div>
          <div class="ay-part-card">
            <span class="ay-part-num">2</span>
            <div>
              <strong>My turn</strong>
              <p>You pick. I ask questions!</p>
            </div>
          </div>
        </div>
        <button type="button" class="ay-btn" id="ay-go">Start Part 1</button>
      </section>`;
    document.getElementById("ay-go").onclick = startPart1;
  }

  function startPart1() {
    mode = "part1";
    pickSecret();
    waitingForAnswer = false;
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="#" id="ay-back" aria-label="Back">←</a>
        <span class="ay-title">Part 1 · Guess who</span>
        <span class="ay-badge">Ask me</span>
      </header>
      <div class="ay-stage">
        <div class="ay-orbit" id="ay-orbit" aria-label="Celebrity names">
          <div class="ay-char-wrap">
            <img id="ay-char" class="ay-char-img" src="${POSE.waiting}" alt="Waiting">
          </div>
          ${NAMES.map((n, i) => `<span class="ay-name ay-orbit-name" style="--i:${i};--n:${NAMES.length}">${escapeHtml(n)}</span>`).join("")}
        </div>
        <div id="ay-bubble" class="ay-bubble char">Hmm… Who am I?<br>Ask me: <em>Are you …?</em></div>
      </div>
      <form class="ay-form" id="ay-form" autocomplete="off">
        <input type="text" class="ay-input" id="ay-input" placeholder="Are you Ed Sheeran?" maxlength="60" spellcheck="false">
        <button type="submit" class="ay-btn ay-send">Ask</button>
      </form>`;

    document.getElementById("ay-back").onclick = (e) => {
      e.preventDefault();
      showStart();
    };
    document.getElementById("ay-form").onsubmit = (e) => {
      e.preventDefault();
      handlePart1Guess();
    };
    setTimeout(() => document.getElementById("ay-input").focus(), 150);
  }

  function handlePart1Guess() {
    const input = document.getElementById("ay-input");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    const asked = parseAreYou(raw);
    guesses++;

    if (!asked || !raw.toLowerCase().includes("are you")) {
      bubble("Ask like this:<br><strong>Are you Ed Sheeran?</strong>", "char");
      setPose(POSE.waiting, "Waiting");
      input.select();
      return;
    }

    if (norm(asked) === norm(secret) || asked === secret) {
      // Correct!
      part1Done = true;
      setPose(POSE.success, "Yes!");
      bubble(`Yes, I am!<br>I'm <strong>${escapeHtml(secret)}</strong> 🎉`, "char");
      input.value = "";
      input.disabled = true;
      document.querySelector(".ay-send").disabled = true;
      mode = "part1-win";
      setTimeout(showPart1Win, 1200);
      return;
    }

    // Wrong
    setPose(POSE.waiting, "No");
    bubble(`No, I'm not.<br><span class="ay-soft">Try another name!</span>`, "char");
    input.value = "";
    input.focus();
  }

  function showPart1Win() {
    mode = "part1-win";
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="../" aria-label="Back">←</a>
        <span class="ay-title">Part 1 complete</span>
        <span class="ay-badge">✓</span>
      </header>
      <section class="ay-win">
        <img class="ay-char-img ay-char-lg" src="${POSE.success}" alt="Success">
        <h1>You found me!</h1>
        <p>I was <strong>${escapeHtml(secret)}</strong>.</p>
        <p class="ay-soft">You asked ${guesses} time${guesses === 1 ? "" : "s"}.</p>
        <button type="button" class="ay-btn" id="ay-to-2">Play Part 2 →</button>
        <button type="button" class="ay-btn secondary" id="ay-again-1">Again? (new person)</button>
      </section>`;
    document.getElementById("ay-to-2").onclick = startPart2Pick;
    document.getElementById("ay-again-1").onclick = startPart1;
  }

  function startPart2Pick() {
    mode = "part2-pick";
    clearTimeout(thinkTimer);
    playerRole = "";
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="#" id="ay-back" aria-label="Back">←</a>
        <span class="ay-title">Part 2 · You choose</span>
        <span class="ay-badge">Secret</span>
      </header>
      <div class="ay-stage">
        <div class="ay-char-wrap">
          <img id="ay-char" class="ay-char-img" src="${POSE.picking}" alt="Pick a role">
        </div>
        <div id="ay-bubble" class="ay-bubble char">Choose who <strong>you</strong> are.<br>Don't tell me… I'll ask!</div>
      </div>
      <div class="ay-pick-grid" id="ay-pick">
        ${NAMES.map(
          (n) =>
            `<button type="button" class="ay-pick" data-name="${escapeHtml(n)}">${escapeHtml(n)}</button>`
        ).join("")}
      </div>`;

    document.getElementById("ay-back").onclick = (e) => {
      e.preventDefault();
      showStart();
    };
    document.querySelectorAll(".ay-pick").forEach((btn) => {
      btn.onclick = () => {
        playerRole = btn.dataset.name;
        beginPart2Ask();
      };
    });
  }

  function beginPart2Ask() {
    mode = "part2";
    // AI asks names until it hits playerRole — shuffle remaining names
    aiPool = shuffle(NAMES.filter((n) => n !== playerRole).concat([playerRole]));
    // Put correct answer not first
    if (aiPool[0] === playerRole && aiPool.length > 1) {
      const j = 1 + Math.floor(Math.random() * (aiPool.length - 1));
      [aiPool[0], aiPool[j]] = [aiPool[j], aiPool[0]];
    }
    aiAsked = [];
    waitingForAnswer = false;

    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="#" id="ay-back" aria-label="Back">←</a>
        <span class="ay-title">Part 2 · Answer me</span>
        <span class="ay-badge">You: secret</span>
      </header>
      <div class="ay-stage">
        <div class="ay-char-wrap">
          <img id="ay-char" class="ay-char-img" src="${POSE.thinking}" alt="Thinking">
        </div>
        <div id="ay-bubble" class="ay-bubble char">Thinking…</div>
      </div>
      <div class="ay-answer-bank">
        <button type="button" class="ay-chip ay-ans" data-ans="No, I'm not.">No, I'm not.</button>
        <button type="button" class="ay-chip ay-ans" data-ans="Yes, I am.">Yes, I am.</button>
      </div>
      <form class="ay-form" id="ay-form" autocomplete="off">
        <input type="text" class="ay-input" id="ay-input" placeholder="Yes, I am. / No, I'm not." maxlength="40" spellcheck="false" disabled>
        <button type="submit" class="ay-btn ay-send" disabled>Say</button>
      </form>
      <p class="ay-hint">You are <strong>${escapeHtml(playerRole)}</strong> (secret!)</p>`;

    document.getElementById("ay-back").onclick = (e) => {
      e.preventDefault();
      clearTimeout(thinkTimer);
      startPart2Pick();
    };
    document.getElementById("ay-form").onsubmit = (e) => {
      e.preventDefault();
      handlePart2Answer();
    };
    document.querySelectorAll(".ay-ans").forEach((btn) => {
      btn.onclick = () => {
        const input = document.getElementById("ay-input");
        if (!input || input.disabled) return;
        input.value = btn.dataset.ans;
        handlePart2Answer();
      };
    });

    // Think 1s then ask
    scheduleNextQuestion();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function scheduleNextQuestion() {
    waitingForAnswer = false;
    const input = document.getElementById("ay-input");
    const send = document.querySelector(".ay-send");
    if (input) {
      input.value = "";
      input.disabled = true;
    }
    if (send) send.disabled = true;

    setPose(POSE.thinking, "Thinking");
    bubble("Thinking…", "char");

    clearTimeout(thinkTimer);
    thinkTimer = setTimeout(() => {
      const next = aiPool.find((n) => !aiAsked.includes(n));
      if (!next) {
        // fallback
        finishPart2(false);
        return;
      }
      aiAsked.push(next);
      setPose(POSE.asking, "Asking");
      bubble(`Are you <strong>${escapeHtml(next)}</strong>?`, "char");
      waitingForAnswer = true;
      if (input) {
        input.disabled = false;
        input.focus();
      }
      if (send) send.disabled = false;
    }, 1000);
  }

  function handlePart2Answer() {
    if (!waitingForAnswer) return;
    const input = document.getElementById("ay-input");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    const lastAsked = aiAsked[aiAsked.length - 1];
    const shouldBeYes = norm(lastAsked) === norm(playerRole);

    if (shouldBeYes) {
      if (isYes(raw)) {
        waitingForAnswer = false;
        part2Done = true;
        setPose(POSE.success, "Found you!");
        bubble(`Yes! You are <strong>${escapeHtml(playerRole)}</strong>! 🎉`, "char");
        input.disabled = true;
        document.querySelector(".ay-send").disabled = true;
        setTimeout(showPart2Win, 1100);
      } else if (isNo(raw)) {
        bubble("Hmm… Are you sure?<br>Try again: <strong>Yes, I am.</strong>", "char");
        input.value = "";
        input.focus();
      } else {
        bubble('Say <strong>Yes, I am.</strong> or <strong>No, I\'m not.</strong>', "char");
        input.select();
      }
      return;
    }

    // Character asked wrong person
    if (isNo(raw)) {
      waitingForAnswer = false;
      bubble("Okay…", "char");
      input.disabled = true;
      document.querySelector(".ay-send").disabled = true;
      setTimeout(scheduleNextQuestion, 700);
    } else if (isYes(raw)) {
      bubble("Really? I don't think so…<br>Try: <strong>No, I'm not.</strong>", "char");
      input.value = "";
      input.focus();
    } else {
      bubble('Say <strong>Yes, I am.</strong> or <strong>No, I\'m not.</strong>', "char");
      input.select();
    }
  }

  function showPart2Win() {
    mode = "part2-win";
    const stars = saveStars();
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="../" aria-label="Back">←</a>
        <span class="ay-title">Part 2 complete</span>
        <span class="ay-badge">✓</span>
      </header>
      <section class="ay-win">
        <img class="ay-char-img ay-char-lg" src="${POSE.success}" alt="Success">
        <div class="ay-stars" aria-hidden="true">
          <span>${stars >= 1 ? "⭐" : "☆"}</span>
          <span>${stars >= 2 ? "⭐" : "☆"}</span>
          <span>${stars >= 3 ? "⭐" : "☆"}</span>
        </div>
        <h1>I found you!</h1>
        <p>You were <strong>${escapeHtml(playerRole)}</strong>.</p>
        <button type="button" class="ay-btn" id="ay-again">Again?</button>
        <button type="button" class="ay-btn secondary" id="ay-home">Back to games</button>
      </section>`;
    document.getElementById("ay-again").onclick = () => {
      part1Done = false;
      part2Done = false;
      startPart1();
    };
    document.getElementById("ay-home").onclick = () => {
      window.location.href = "../";
    };
  }

  function finishPart2() {
    showPart2Win();
  }

  showStart();
})();
