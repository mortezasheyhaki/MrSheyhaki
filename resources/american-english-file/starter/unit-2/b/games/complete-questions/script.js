/* Complete the Questions · 3 parts · Unit 2B */
(function () {
  const GAME_ID = "starter-2b-complete-questions";

  const PART1 = [
    {
      id: "1a",
      after: "'s the concert?",
      answer: "On Tuesday at 7:30.",
      accept: ["when"],
      model: "When",
    },
    {
      id: "1b",
      after: " is it?",
      answer: "Chicago.",
      accept: ["where"],
      model: "Where",
    },
    {
      id: "2",
      after: "'s your name?",
      answer: "Jessica.",
      accept: ["what"],
      model: "What",
    },
    {
      id: "3a",
      after: " is she?",
      answer: "She's my friend, Julia.",
      accept: ["who"],
      model: "Who",
    },
    {
      id: "3b",
      after: "'s she from?",
      answer: "Mexico.",
      accept: ["where"],
      model: "Where",
    },
    {
      id: "4",
      after: "'s your email?",
      answer: "It's jbl098@yoohoo.com.",
      accept: ["what"],
      model: "What",
    },
    {
      id: "5a",
      after: "'s that?",
      answer: "My brother Adrian.",
      accept: ["who"],
      model: "Who",
    },
    {
      id: "5b",
      after: " is he?",
      answer: "He's 25.",
      accept: ["how old", "howold"],
      model: "How old",
    },
  ];

  // Part 2 – unscramble words into a question
  const PART2 = [
    {
      id: "p2-1",
      words: ["she", "who", "is"],
      correct: ["who", "is", "she"],
      model: "Who is she?",
    },
    {
      id: "p2-2",
      words: ["what", "number", "your", "cell", "phone", "is"],
      correct: ["what", "is", "your", "cell", "phone", "number"],
      model: "What is your cell phone number?",
    },
    {
      id: "p2-3",
      words: ["is", "where", "room", "4"],
      correct: ["where", "is", "room", "4"],
      model: "Where is room 4?",
    },
    {
      id: "p2-4",
      words: ["married", "is", "Marta"],
      correct: ["is", "marta", "married"],
      model: "Is Marta married?",
    },
    {
      id: "p2-5",
      words: ["your", "English", "class", "is", "when"],
      correct: ["when", "is", "your", "english", "class"],
      model: "When is your English class?",
    },
    {
      id: "p2-6",
      words: ["your", "number", "is", "phone", "555-0362"],
      correct: ["is", "your", "phone", "number", "555-0362"],
      model: "Is your phone number 555-0362?",
    },
    {
      id: "p2-7",
      words: ["is", "his", "email", "what"],
      correct: ["what", "is", "his", "email"],
      model: "What is his email?",
    },
    {
      id: "p2-8",
      words: ["Pedro", "how", "is", "old"],
      correct: ["how", "old", "is", "pedro"],
      model: "How old is Pedro?",
    },
  ];

  // Part 3 – write full questions from answers
  const PART3 = [
    {
      id: "p3-1",
      example: false,
      after: "?",
      prefix: "",
      answer: "Monterrey.",
      accept: [
        "where are you from",
        "where're you from",
        "where are you from?",
      ],
      model: "Where are you from?",
    },
    {
      id: "p3-2",
      after: " Monterrey?",
      prefix: "",
      answer: "It's in Mexico.",
      accept: [
        "where's monterrey",
        "where is monterrey",
        "where's monterrey?",
        "where is monterrey?",
      ],
      model: "Where's Monterrey?",
    },
    {
      id: "p3-3",
      after: "?",
      prefix: "",
      answer: "pguzman@gmail.com.",
      accept: [
        "what's your email",
        "what is your email",
        "what's your email?",
        "what is your email?",
        "what's your e-mail",
        "what is your e-mail",
      ],
      model: "What's your email?",
    },
    {
      id: "p3-4",
      after: "?",
      prefix: "Thanks. ",
      answer: "81 8150 9304.",
      accept: [
        "what's your phone number",
        "what is your phone number",
        "what's your cell phone number",
        "what is your cell phone number",
        "what's your cellphone number",
        "what is your cellphone number",
        "what's your number",
        "what is your number",
      ],
      model: "What's your phone number?",
    },
    {
      id: "p3-5",
      after: "?",
      prefix: "",
      answer: "I'm 19.",
      accept: [
        "how old are you",
        "how old are you?",
      ],
      model: "How old are you?",
    },
  ];

  const PARTS = [
    {
      id: "1",
      title: "Complete the questions",
      tip: "Write the question word for each gap.",
      mode: "write",
      items: PART1,
    },
    {
      id: "2",
      title: "Order the questions",
      tip: "Drag the words to make a question.",
      mode: "order",
      items: PART2,
    },
    {
      id: "3",
      title: "Write the questions",
      tip: "Write questions to complete the conversation.",
      mode: "fullwrite",
      items: PART3,
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let partIndex = 0;
  let index = 0;
  let totalCorrect = 0;
  let locked = false;

  // Part 2 state
  let pool = []; // remaining word tokens {id, text}
  let slots = []; // ordered placement {id, text} | null
  let dragId = null;
  let selectedId = null;
  let tokenSeq = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function match(val, accept) {
    const n = norm(val);
    if (!n) return false;
    return accept.some((a) => n === norm(a));
  }

  function calcStars(n, total) {
    if (!total) return 0;
    const r = n / total;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }

  function saveStars(n, total) {
    const stars = calcStars(n, total);
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function startPart(pi) {
    if (window.LAFinish) LAFinish.startTimer();
    const part = PARTS[pi];
    if (!part.items || !part.items.length) return;
    partIndex = pi;
    index = 0;
    totalCorrect = 0;
    locked = false;
    phase = "play";
    if (part.mode === "order") initOrderItem();
    render();
  }

  function initOrderItem() {
    const item = PARTS[partIndex].items[index];
    tokenSeq = 0;
    pool = shuffle(
      item.words.map((w) => ({
        id: "t" + tokenSeq++,
        text: w,
      }))
    );
    slots = item.words.map(() => null);
    dragId = null;
    selectedId = null;
  }

  function findToken(id) {
    let t = pool.find((x) => x.id === id);
    if (t) return { token: t, from: "pool" };
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] && slots[i].id === id) return { token: slots[i], from: "slot", slotIndex: i };
    }
    return null;
  }

  function removeToken(id) {
    pool = pool.filter((x) => x.id !== id);
    slots = slots.map((s) => (s && s.id === id ? null : s));
  }

  function placeInSlot(slotIndex, id) {
    if (locked) return;
    const found = findToken(id);
    if (!found) return;
    const token = found.token;
    // if slot occupied, swap back to pool
    const existing = slots[slotIndex];
    removeToken(id);
    if (existing) {
      pool.push(existing);
    }
    slots[slotIndex] = token;
    selectedId = null;
    renderPlayKeep();
  }

  function returnToPool(id) {
    if (locked) return;
    const found = findToken(id);
    if (!found || found.from === "pool") return;
    removeToken(id);
    pool.push(found.token);
    selectedId = null;
    renderPlayKeep();
  }

  function orderComplete() {
    return slots.every((s) => s);
  }

  function orderCorrect() {
    const item = PARTS[partIndex].items[index];
    const built = slots.map((s) => norm(s.text));
    const target = item.correct.map(norm);
    return built.length === target.length && built.every((w, i) => w === target[i]);
  }

  function checkWrite() {
    if (locked) return;
    const part = PARTS[partIndex];
    const item = part.items[index];
    const inp = document.getElementById("cq-input");
    let val = inp ? inp.value : "";
    // strip trailing ?
    val = val.replace(/\?+$/, "").trim();
    const ok = match(val, item.accept.map((a) => a.replace(/\?+$/, "")));
    const wrap = app.querySelector(".cq-gap-wrap");
    const status = document.getElementById("cq-status");
    const tip =
      part.mode === "fullwrite"
        ? "Write the full question"
        : "Write the question word";

    if (ok) {
      locked = true;
      totalCorrect++;
      if (wrap) {
        wrap.classList.remove("is-bad");
        wrap.classList.add("is-ok");
      }
      if (inp) {
        inp.value = item.model.replace(/\?$/, "");
        inp.disabled = true;
      }
      if (status) {
        status.innerHTML = '<span class="cq-tick" aria-label="Correct"><svg class="cq-tick-svg" viewBox="0 0 52 52" width="40" height="40"><circle class="cq-tick-circle" cx="26" cy="26" r="24" fill="none"/><path class="cq-tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg></span>';
        status.classList.add("is-ok", "is-tick");
      }
      const ans = app.querySelector(".cq-answer");
      if (ans) ans.classList.add("is-show");
      setTimeout(advance, 850);
    } else {
      if (wrap) {
        wrap.classList.remove("is-ok");
        wrap.classList.add("is-bad");
      }
      if (status) {
        status.textContent = "Try again";
        status.classList.add("is-bad");
      }
      if (inp) {
        inp.focus();
        inp.select();
      }
      setTimeout(() => {
        if (wrap) wrap.classList.remove("is-bad");
        if (status) {
          status.textContent = tip;
          status.classList.remove("is-bad");
        }
      }, 700);
    }
  }

  function checkOrder() {
    if (locked) return;
    const status = document.getElementById("cq-status");
    if (!orderComplete()) {
      if (status) {
        status.textContent = "Place all the words first";
        status.classList.add("is-bad");
      }
      return;
    }
    const line = app.querySelector(".cq-slot-line");
    if (orderCorrect()) {
      locked = true;
      totalCorrect++;
      if (line) line.classList.add("is-ok");
      if (status) {
        status.innerHTML = '<span class="cq-tick" aria-label="Correct"><svg class="cq-tick-svg" viewBox="0 0 52 52" width="40" height="40"><circle class="cq-tick-circle" cx="26" cy="26" r="24" fill="none"/><path class="cq-tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg></span>';
        status.classList.add("is-ok", "is-tick");
      }
      const model = app.querySelector(".cq-model");
      if (model) model.classList.add("is-show");
      setTimeout(advance, 850);
    } else {
      if (line) {
        line.classList.add("is-bad");
        setTimeout(() => line.classList.remove("is-bad"), 500);
      }
      if (status) {
        status.textContent = "Not quite — try again";
        status.classList.add("is-bad");
      }
      setTimeout(() => {
        if (status) {
          status.textContent = "Drag words into order";
          status.classList.remove("is-bad");
        }
      }, 800);
    }
  }

  function advance() {
    locked = false;
    const part = PARTS[partIndex];
    if (index < part.items.length - 1) {
      index++;
      if (part.mode === "order") initOrderItem();
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  let scrollY = 0;
  function renderPlayKeep() {
    const stage = app.querySelector(".cq-stage");
    scrollY = stage ? stage.scrollTop : 0;
    render();
    const stage2 = app.querySelector(".cq-stage");
    if (stage2) stage2.scrollTop = scrollY;
  }

  function chipHTML(token, place) {
    return (
      '<button type="button" class="cq-chip' +
      (selectedId === token.id ? " is-selected" : "") +
      '" draggable="true" data-id="' +
      token.id +
      '" data-place="' +
      place +
      '">' +
      token.text +
      "</button>"
    );
  }

  function firstEmptySlot() {
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i]) return i;
    }
    return -1;
  }

  function bindOrderDnD() {
    app.querySelectorAll(".cq-chip").forEach((chip) => {
      chip.addEventListener("dragstart", (e) => {
        dragId = chip.dataset.id;
        chip.classList.add("is-dragging");
        e.dataTransfer.setData("text/plain", dragId);
        e.dataTransfer.effectAllowed = "move";
      });
      chip.addEventListener("dragend", () => {
        chip.classList.remove("is-dragging");
        dragId = null;
      });
      chip.addEventListener("click", () => {
        if (locked) return;
        const id = chip.dataset.id;
        const place = chip.dataset.place;
        if (place === "slot") {
          // tap filled chip in slot → return to pool
          returnToPool(id);
        } else {
          // tap pool chip → place in first empty slot
          const empty = firstEmptySlot();
          if (empty >= 0) {
            placeInSlot(empty, id);
          }
        }
      });
    });

    app.querySelectorAll(".cq-slot").forEach((slot) => {
      const i = +slot.dataset.i;
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("is-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("is-over"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("is-over");
        const id = e.dataTransfer.getData("text/plain") || dragId;
        if (id) placeInSlot(i, id);
      });
    });
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="cq-topbar">' +
        '<a class="cq-back" href="../" aria-label="Back">←</a>' +
        '<span class="cq-title">Complete the Questions</span>' +
        '<span class="cq-badge">2B</span>' +
        "</header>" +
        '<section class="cq-start">' +
        '<div class="cq-hero" aria-hidden="true">✏️</div>' +
        "<h1>Complete the Questions</h1>" +
        '<p class="cq-desc">Three parts · question words in conversations</p>' +
        '<div class="cq-mode-list">' +
        PARTS.map((p, i) => {
          const lockedPart = !p.items;
          return (
            '<button type="button" class="cq-mode-card' +
            (lockedPart ? " is-locked" : "") +
            '" data-part="' +
            i +
            '"' +
            (lockedPart ? " disabled" : "") +
            ">" +
            '<span class="cq-mode-num">' +
            (i + 1) +
            "</span>" +
            "<div><strong>" +
            p.title +
            "</strong><p>" +
            p.tip +
            "</p></div>" +
            "</button>"
          );
        }).join("") +
        "</div>" +
        "</section>";
      app.querySelectorAll(".cq-mode-card:not(:disabled)").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    const part = PARTS[partIndex];
    const items = part.items || [];

    if (phase === "done") {
      const stars = saveStars(totalCorrect, items.length);
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: items.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(partIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startPart(partIndex);
      return;
    }

    // PLAY – write (part 1) or fullwrite (part 3)
    if (part.mode === "write" || part.mode === "fullwrite") {
      const item = items[index];
      const isFull = part.mode === "fullwrite";
      const label = isFull
        ? "A · Write the question"
        : "A · Complete the question";
      const statusTip = isFull
        ? "Write the full question"
        : "Write the question word";
      const maxLen = isFull ? 48 : 16;
      const gapClass = isFull ? "cq-gap cq-gap--full" : "cq-gap";
      const prefix = item.prefix || "";
      const after = item.after || "";

      app.innerHTML =
        '<header class="cq-topbar">' +
        '<a class="cq-back" href="../" aria-label="Back">←</a>' +
        '<span class="cq-title">' +
        part.title +
        "</span>" +
        '<span class="cq-progress">' +
        (index + 1) +
        " / " +
        items.length +
        "</span>" +
        "</header>" +
        '<div class="cq-play">' +
        '<div class="cq-stage">' +
        '<div class="cq-card">' +
        '<div class="cq-label">' +
        label +
        "</div>" +
        (isFull
          ? '<p class="cq-example">Example: <em>What\'s your name?</em> → Pedro Guzman.</p>'
          : "") +
        '<p class="cq-question' +
        (isFull ? " cq-question--full" : "") +
        '">' +
        (prefix
          ? '<span class="cq-prefix">' + prefix + "</span>"
          : "") +
        '<span class="cq-gap-wrap' +
        (isFull ? " cq-gap-wrap--full" : "") +
        '">' +
        '<input type="text" id="cq-input" class="' +
        gapClass +
        '" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="…" maxlength="' +
        maxLen +
        '" />' +
        "</span>" +
        (after && after !== "?"
          ? '<span class="cq-rest">' + after + "</span>"
          : after === "?"
            ? '<span class="cq-rest">?</span>'
            : "") +
        "</p>" +
        '<div class="cq-answer' +
        (isFull ? " is-show" : "") +
        '">' +
        '<span class="cq-b">B</span>' +
        '<span class="cq-b-text">' +
        item.answer +
        "</span>" +
        "</div>" +
        "</div>" +
        '<p class="cq-status" id="cq-status">' +
        statusTip +
        "</p>" +
        "</div>" +
        '<div class="cq-actions">' +
        '<button type="button" class="cq-btn" id="cq-check">Check</button>' +
        "</div>" +
        "</div>";

      const inp = document.getElementById("cq-input");
      if (inp) {
        inp.focus();
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            checkWrite();
          }
        });
        inp.addEventListener("input", () => {
          const wrap = app.querySelector(".cq-gap-wrap");
          if (wrap) wrap.classList.remove("is-ok", "is-bad");
          const status = document.getElementById("cq-status");
          if (status) {
            status.textContent = statusTip;
            status.classList.remove("is-ok", "is-bad");
          }
        });
      }
      document.getElementById("cq-check").onclick = checkWrite;
      return;
    }

    // ORDER mode
    const item = items[index];
    const slotCells = slots
      .map((s, i) => {
        if (s) {
          return (
            '<div class="cq-slot is-filled" data-i="' +
            i +
            '">' +
            chipHTML(s, "slot") +
            "</div>"
          );
        }
        return '<div class="cq-slot" data-i="' + i + '"></div>';
      })
      .join("");

    const poolChips = pool.map((t) => chipHTML(t, "pool")).join("");

    app.innerHTML =
      '<header class="cq-topbar">' +
      '<a class="cq-back" href="../" aria-label="Back">←</a>' +
      '<span class="cq-title">' +
      part.title +
      "</span>" +
      '<span class="cq-progress">' +
      (index + 1) +
      " / " +
      items.length +
      "</span>" +
      "</header>" +
      '<div class="cq-play">' +
      '<div class="cq-stage">' +
      '<div class="cq-card cq-card--order">' +
      '<div class="cq-label">Make the question</div>' +
      '<div class="cq-slot-line" id="cq-slots">' +
      slotCells +
      "</div>" +
      '<p class="cq-model">' +
      item.model +
      "</p>" +
      "</div>" +
      '<p class="cq-status" id="cq-status">Tap a word to place it · or drag into a slot</p>' +
      '<div class="cq-pool" aria-label="Word bank">' +
      poolChips +
      "</div>" +
      "</div>" +
      '<div class="cq-actions">' +
      '<button type="button" class="cq-btn" id="cq-check">Check</button>' +
      "</div>" +
      "</div>";

    bindOrderDnD();
    document.getElementById("cq-check").onclick = checkOrder;
    const stage = app.querySelector(".cq-stage");
    if (stage && scrollY) stage.scrollTop = scrollY;
  }

  render();
})();
