/* Where is he/she from? – AEF Starter Unit 1B */
(function () {
  const GAME_ID = "starter-1b-is-he-she";

  const CELEBS = [
    { id: 1,  name: "Salma Hayek",      country: "Mexico",            gender: "she", photo: "images/celebs-crop/1.png" },
    { id: 2,  name: "Mark Zuckerberg",  country: "the United States",  gender: "he",  photo: "images/celebs-crop/2.png" },
    { id: 3,  name: "Ken Watanabe",     country: "Japan",             gender: "he",  photo: "images/celebs-crop/3.png" },
    { id: 4,  name: "Eugene Trinh",     country: "Vietnam",           gender: "he",  photo: "images/celebs-crop/4.png" },
    { id: 5,  name: "Isabel Allende",   country: "Chile",             gender: "she", photo: "images/celebs-crop/5.png" },
    { id: 6,  name: "Wang Hao",         country: "China",             gender: "he",  photo: "images/celebs-crop/6.png" },
    { id: 7,  name: "Pedro Almodóvar",  country: "Spain",             gender: "he",  photo: "images/celebs-crop/7.png" },
    { id: 8,  name: "Ryan Reynolds",    country: "Canada",            gender: "he",  photo: "images/celebs-crop/8.png" },
    { id: 9,  name: "Chee-Yun",         country: "South Korea",       gender: "she", photo: "images/celebs-crop/9.png" },
    { id: 10, name: "Emma Watson",      country: "England",           gender: "she", photo: "images/celebs-crop/10.png" },
    { id: 11, name: "Orhan Pamuk",      country: "Turkey",            gender: "he",  photo: "images/celebs-crop/11.png" },
    { id: 12, name: "Gisele Bündchen",  country: "Brazil",            gender: "she", photo: "images/celebs-crop/12.png" },
  ];

  const COUNTRIES = [...new Set(CELEBS.map(c => c.country))];

  const POSE = {
    waiting:  "images/waiting.png",
    thinking: "images/thinking.png",
    asking:   "images/asking.png",
    picking:  "images/picking.png",
    success:  "images/success.png",
  };

  const app = document.getElementById("game-app");
  if (!app) return;

  let secret = null;
  let playerRole = null;
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
      .replace(/[’`']/g, "'")
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
    let pool = CELEBS.filter(c => !usedSecrets.includes(c.name));
    if (pool.length < 3) {
      usedSecrets = [];
      pool = CELEBS.slice();
    }
    secret = pool[Math.floor(Math.random() * pool.length)];
    usedSecrets.push(secret.name);
    guesses = 0;
  }

  function parseIsFrom(input) {
    const n = norm(input);
    let countryPart = n.replace(/^is (he|she) from\s+/, "").trim();
    if (!countryPart) countryPart = n;

    const hit = CELEBS.find(c =>
      norm(c.country) === countryPart ||
      norm(c.country).replace(/^the /, "") === countryPart
    );
    if (hit) return hit;

    const fuzzy = CELEBS.filter(c =>
      norm(c.country).includes(countryPart) ||
      countryPart.includes(norm(c.country).replace(/^the /, ""))
    );
    if (fuzzy.length === 1) return fuzzy[0];
    return null;
  }

  function isYes(input) {
    return /^(yes(,)?\s*(he|she|he\/she)\s+is|yes)$/.test(norm(input));
  }

  function isNo(input) {
    return /^(no(,)?\s*(he|she|he\/she)\s+(isn'?t|is not)|no)$/.test(norm(input));
  }

  function calcStars() {
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

  function setPose(src) {
    const img = document.getElementById("ish-char");
    if (img) img.src = src;
  }

  function setBubble(html) {
    const el = document.getElementById("ish-bubble");
    if (!el) return;
    el.innerHTML = html;
    el.style.display = html ? "block" : "none";
  }

  function cardHTML(celeb, showName) {
    return `
      <div class="ish-card">
        <span class="ish-card-num">${celeb.id}</span>
        <img class="ish-card-photo" src="${celeb.photo}" alt="">
        <div class="ish-card-name">${showName ? escapeHtml(celeb.name) : "???"}</div>
      </div>`;
  }

  function showStart() {
    clearTimeout(thinkTimer);
    app.innerHTML = `
      <header class="ish-topbar">
        <a class="ish-back" href="../" aria-label="Back">←</a>
        <span class="ish-title">Where is he/she from?</span>
        <span class="ish-badge">1B</span>
      </header>
      <section class="ish-start">
        <img src="${POSE.waiting}" alt="" class="ish-char-img" style="width:180px">
        <h1>Where is he/she from?</h1>
        <p class="ish-desc">I pick a celebrity and ask<br><strong>Where is she/he from?</strong><br>
          You ask <strong>Is she/he from …?</strong></p>
        <div class="ish-parts">
          <div class="ish-part-card">
            <span class="ish-part-num">1</span>
            <div><strong>Guess the country</strong><p style="margin:4px 0 0;font-size:0.9rem;color:#64748b">I show a photo and ask. You find the country!</p></div>
          </div>
          <div class="ish-part-card">
            <span class="ish-part-num">2</span>
            <div><strong>My turn</strong><p style="margin:4px 0 0;font-size:0.9rem;color:#64748b">You pick a celebrity. I ask the questions!</p></div>
          </div>
        </div>
        <button type="button" class="ish-btn" id="ish-go">Start Part 1</button>
      </section>`;
    document.getElementById("ish-go").onclick = startPart1;
  }

  function startPart1() {
    pickSecret();
    waitingForAnswer = false;
    const g = secret.gender;

    app.innerHTML = `
      <header class="ish-topbar">
        <a class="ish-back" href="#" id="ish-back" aria-label="Back">←</a>
        <span class="ish-title">Part 1 · Guess the country</span>
        <span class="ish-badge">Ask me</span>
      </header>
      <div class="ish-stage">
        <div class="ish-char-side">
          <div id="ish-bubble" class="ish-bubble">Where is ${g} from?</div>
          <img id="ish-char" class="ish-char-img" src="${POSE.asking}" alt="">
        </div>
        ${cardHTML(secret, false)}
      </div>
      <div class="ish-bottom">
        <div class="ish-chips" id="ish-country-chips">
          ${COUNTRIES.map(c => `
            <button type="button" class="ish-chip" data-country="${escapeHtml(c)}">${escapeHtml(c)}</button>
          `).join("")}
        </div>
        <form class="ish-form" id="ish-form" autocomplete="off">
          <input type="text" class="ish-input" id="ish-input"
                 placeholder="Is ${g} from Mexico?"
                 maxlength="50" spellcheck="false">
          <button type="submit" class="ish-send">Ask</button>
        </form>
        <p class="ish-hint">Ask: <strong>Is ${g} from …?</strong></p>
      </div>`;

    document.getElementById("ish-back").onclick = (e) => { e.preventDefault(); showStart(); };
    document.getElementById("ish-form").onsubmit = (e) => {
      e.preventDefault();
      handlePart1Guess();
    };
    document.querySelectorAll("#ish-country-chips .ish-chip").forEach(btn => {
      btn.onclick = () => {
        const input = document.getElementById("ish-input");
        if (!input || input.disabled) return;
        input.value = `Is ${g} from ${btn.dataset.country}?`;
        input.focus();
      };
    });
    setTimeout(() => document.getElementById("ish-input").focus(), 200);
  }

  function handlePart1Guess() {
    const input = document.getElementById("ish-input");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;
    guesses++;

    const g = secret.gender;
    const asked = parseIsFrom(raw);

    if (!asked) {
      setBubble(`Ask like this:<br><strong>Is ${g} from Mexico?</strong>`);
      setPose(POSE.waiting);
      input.select();
      return;
    }

    if (norm(asked.country) === norm(secret.country)) {
      part1Done = true;
      setPose(POSE.success);
      setBubble(`Yes, ${g} is!`);
      const nameEl = document.querySelector(".ish-card-name");
      if (nameEl) nameEl.textContent = secret.name;
      input.disabled = true;
      document.querySelector(".ish-send").disabled = true;
      document.querySelectorAll("#ish-country-chips .ish-chip").forEach(b => b.disabled = true);
      setTimeout(showPart1Win, 1400);
      return;
    }

    setPose(POSE.waiting);
    setBubble(`No, ${g} isn’t.`);
    input.value = "";
    input.focus();
  }

  function showPart1Win() {
    app.innerHTML = `
      <header class="ish-topbar">
        <a class="ish-back" href="../">←</a>
        <span class="ish-title">Part 1 complete</span>
        <span class="ish-badge">✓</span>
      </header>
      <section class="ish-win">
        <img src="${POSE.success}" class="ish-char-img" style="width:200px" alt="">
        <h1>You found me!</h1>
        <p>I was <strong>${escapeHtml(secret.name)}</strong><br>from <strong>${escapeHtml(secret.country)}</strong>.</p>
        <p class="ish-hint">You asked ${guesses} time${guesses === 1 ? "" : "s"}.</p>
        <button type="button" class="ish-btn" id="ish-to-2">Play Part 2 →</button>
        <button type="button" class="ish-btn secondary" id="ish-again-1">Again?</button>
      </section>`;
    document.getElementById("ish-to-2").onclick = startPart2Pick;
    document.getElementById("ish-again-1").onclick = startPart1;
  }

  /* Part 2 – pick screen: character + bubble on top, clean 4-column grid below */
  function startPart2Pick() {
    clearTimeout(thinkTimer);
    playerRole = null;
    app.innerHTML = `
      <header class="ish-topbar">
        <a class="ish-back" href="#" id="ish-back">←</a>
        <span class="ish-title">Part 2 · You choose</span>
        <span class="ish-badge">Secret</span>
      </header>
      <div class="ish-pick-screen">
        <div class="ish-pick-header">
          <img class="ish-char-img" src="${POSE.picking}" alt="">
          <div class="ish-bubble">Choose who <strong>you</strong> are.<br>Don’t tell me!</div>
        </div>
        <div class="ish-pick-grid">
          ${CELEBS.map(c => `
            <button type="button" class="ish-pick" data-id="${c.id}">
              <div class="ish-pick-photo-wrap">
                <span class="ish-card-num">${c.id}</span>
                <img src="${c.photo}" alt="">
              </div>
              <div class="ish-pick-info">
                <strong>${escapeHtml(c.name)}</strong>
                <span>${escapeHtml(c.country)}</span>
              </div>
            </button>
          `).join("")}
        </div>
      </div>`;

    document.getElementById("ish-back").onclick = (e) => { e.preventDefault(); showStart(); };
    document.querySelectorAll(".ish-pick").forEach(btn => {
      btn.onclick = () => {
        playerRole = CELEBS.find(c => c.id === +btn.dataset.id);
        beginPart2Ask();
      };
    });
  }

  function beginPart2Ask() {
    const other = COUNTRIES.filter(c => c !== playerRole.country);
    aiPool = shuffle(other.concat([playerRole.country]));
    aiAsked = [];
    waitingForAnswer = false;

    app.innerHTML = `
      <header class="ish-topbar">
        <a class="ish-back" href="#" id="ish-back">←</a>
        <span class="ish-title">Part 2 · Answer me</span>
        <span class="ish-badge">You: secret</span>
      </header>
      <div class="ish-stage">
        <div class="ish-char-side">
          <div id="ish-bubble" class="ish-bubble" style="display:none"></div>
          <img id="ish-char" class="ish-char-img" src="${POSE.thinking}" alt="">
        </div>
        ${cardHTML(playerRole, true)}
      </div>
      <div class="ish-bottom">
        <div class="ish-chips">
          ${playerRole.gender === "she"
            ? `<button type="button" class="ish-chip" data-ans="No, she isn’t.">No, she isn’t.</button>
               <button type="button" class="ish-chip" data-ans="Yes, she is.">Yes, she is.</button>`
            : `<button type="button" class="ish-chip" data-ans="No, he isn’t.">No, he isn’t.</button>
               <button type="button" class="ish-chip" data-ans="Yes, he is.">Yes, he is.</button>`}
        </div>
        <form class="ish-form" id="ish-form" autocomplete="off">
          <input type="text" class="ish-input" id="ish-input"
                 placeholder="${playerRole.gender === 'she' ? 'No, she isn’t. / Yes, she is.' : 'No, he isn’t. / Yes, he is.'}"
                 maxlength="40" spellcheck="false" disabled>
          <button type="submit" class="ish-send" disabled>Say</button>
        </form>
        <p class="ish-hint">Secret: <strong>${escapeHtml(playerRole.name)}</strong> · ${escapeHtml(playerRole.country)}</p>
      </div>`;

    document.getElementById("ish-back").onclick = (e) => {
      e.preventDefault();
      clearTimeout(thinkTimer);
      startPart2Pick();
    };
    document.getElementById("ish-form").onsubmit = (e) => {
      e.preventDefault();
      handlePart2Answer();
    };
    document.querySelectorAll(".ish-chip").forEach(btn => {
      btn.onclick = () => {
        const input = document.getElementById("ish-input");
        if (!input || input.disabled) return;
        input.value = btn.dataset.ans;
        handlePart2Answer();
      };
    });

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
    const input = document.getElementById("ish-input");
    const send = document.querySelector(".ish-send");
    if (input) { input.value = ""; input.disabled = true; }
    if (send) send.disabled = true;

    setPose(POSE.thinking);
    setBubble("…");

    clearTimeout(thinkTimer);
    thinkTimer = setTimeout(() => {
      const nextCountry = aiPool.find(c => !aiAsked.includes(c));
      if (!nextCountry) {
        showPart2Win();
        return;
      }
      aiAsked.push(nextCountry);

      const g = playerRole.gender;
      setPose(POSE.asking);
      setBubble(`Is ${g} from<br><strong>${escapeHtml(nextCountry)}</strong>?`);

      waitingForAnswer = true;
      if (input) { input.disabled = false; input.focus(); }
      if (send) send.disabled = false;
    }, 1000);
  }

  function handlePart2Answer() {
    if (!waitingForAnswer) return;
    const input = document.getElementById("ish-input");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    const lastCountry = aiAsked[aiAsked.length - 1];
    const shouldBeYes = norm(lastCountry) === norm(playerRole.country);
    const g = playerRole.gender;

    if (shouldBeYes) {
      if (isYes(raw)) {
        waitingForAnswer = false;
        part2Done = true;
        setPose(POSE.success);
        setBubble(`Yes, ${g} is!`);
        input.disabled = true;
        document.querySelector(".ish-send").disabled = true;
        setTimeout(showPart2Win, 1200);
      } else if (isNo(raw)) {
        setBubble(`Hmm… Try:<br><strong>Yes, ${g} is.</strong>`);
        input.value = "";
        input.focus();
      } else {
        setBubble(`Say <strong>Yes, ${g} is.</strong><br>or <strong>No, ${g} isn’t.</strong>`);
        input.select();
      }
      return;
    }

    if (isNo(raw)) {
      waitingForAnswer = false;
      setBubble("Okay…");
      input.disabled = true;
      document.querySelector(".ish-send").disabled = true;
      setTimeout(scheduleNextQuestion, 600);
    } else if (isYes(raw)) {
      setBubble(`Really? Try:<br><strong>No, ${g} isn’t.</strong>`);
      input.value = "";
      input.focus();
    } else {
      setBubble(`Say <strong>Yes, ${g} is.</strong><br>or <strong>No, ${g} isn’t.</strong>`);
      input.select();
    }
  }

  function showPart2Win() {
    const stars = saveStars();
    app.innerHTML = `
      <header class="ish-topbar">
        <a class="ish-back" href="../">←</a>
        <span class="ish-title">Part 2 complete</span>
        <span class="ish-badge">✓</span>
      </header>
      <section class="ish-win">
        <img src="${POSE.success}" class="ish-char-img" style="width:200px" alt="">
        <div class="ish-stars">
          <span>${stars >= 1 ? "⭐" : "☆"}</span>
          <span>${stars >= 2 ? "⭐" : "☆"}</span>
          <span>${stars >= 3 ? "⭐" : "☆"}</span>
        </div>
        <h1>I got it!</h1>
        <p>You chose <strong>${escapeHtml(playerRole.name)}</strong><br>from <strong>${escapeHtml(playerRole.country)}</strong>.</p>
        <button type="button" class="ish-btn" id="ish-again">Again?</button>
        <button type="button" class="ish-btn secondary" id="ish-home">Back to games</button>
      </section>`;
    document.getElementById("ish-again").onclick = () => {
      part1Done = false;
      part2Done = false;
      startPart1();
    };
    document.getElementById("ish-home").onclick = () => { window.location.href = "../"; };
  }

  showStart();
})();
