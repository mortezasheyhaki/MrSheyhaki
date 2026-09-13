/* Nationalities + be · Part A Q&A · Part B Make questions · Unit 2A */
(function () {
  const GAME_ID = "starter-2a-nationality-be";

  // Part A: complete the question (Is/Are) + write the answer
  const PART_A = [
    {
      img: "images/sushi.png",
      tip: "Negative · it",
      tipType: "neg",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "sushi Chinese?" },
      ],
      hint: "Japanese",
      answerAccept: [
        "no it isn't",
        "no it is not",
        "no it isn't it's japanese",
        "no it is not it's japanese",
        "no it's japanese",
        "no it isn't it is japanese",
      ],
      answerModel: "No, it isn't. It's Japanese.",
    },
    {
      img: "images/rolling-stones.png",
      tip: "Negative · they",
      tipType: "neg",
      qParts: [
        { blank: ["are"], model: "Are" },
        { t: "the Rolling Stones American?" },
      ],
      hint: "British",
      answerAccept: [
        "no they aren't",
        "no they are not",
        "no they aren't they're british",
        "no they are not they are british",
        "no they're british",
        "no they aren't they are british",
      ],
      answerModel: "No, they aren't. They're British.",
    },
    {
      img: "images/mount-fuji.png",
      tip: "Positive · it",
      tipType: "pos",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "Mount Fuji Japanese?" },
      ],
      hint: "Yes",
      answerAccept: [
        "yes",
        "yes it is",
        "yes it is it's japanese",
        "yes it's japanese",
        "yes it is it is japanese",
      ],
      answerModel: "Yes, it is.",
    },
    {
      img: "images/victoria-beckham.png",
      tip: "Negative · she",
      tipType: "neg",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "Victoria Beckham Canadian?" },
      ],
      hint: "British",
      answerAccept: [
        "no she isn't",
        "no she is not",
        "no she isn't she's british",
        "no she is not she is british",
        "no she's british",
        "no she isn't she is british",
      ],
      answerModel: "No, she isn't. She's British.",
    },
    {
      img: "images/machu-picchu.png",
      tip: "Positive · it",
      tipType: "pos",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "Machu Picchu Peruvian?" },
      ],
      hint: "Yes",
      answerAccept: [
        "yes",
        "yes it is",
        "yes it is it's peruvian",
        "yes it's peruvian",
      ],
      answerModel: "Yes, it is.",
    },
  ];

  // Part B: statement shown → make a question
  // Also accept Where ... from? forms
  const PART_B = [
    {
      img: "images/gisele.png",
      name: "Gisele Bündchen",
      statement: "Gisele Bündchen is Brazilian.",
      accept: [
        "is she brazilian",
        "is gisele brazilian",
        "is gisele bundchen brazilian",
        "is gisele bündchen brazilian",
        "where is she from",
        "where is gisele from",
        "where is gisele bundchen from",
        "where's she from",
        "where's gisele from",
      ],
      model: "Is she Brazilian?",
    },
    {
      img: "images/hyundai.png",
      name: "Hyundai",
      statement: "Hyundai cars are Korean.",
      accept: [
        "are they korean",
        "are hyundai cars korean",
        "are hyundais korean",
        "where are they from",
        "where are hyundai cars from",
        "where are hyundais from",
      ],
      model: "Are they Korean?",
    },
    {
      img: "images/tacos.png",
      name: "Tacos",
      statement: "Tacos are Mexican.",
      accept: [
        "are they mexican",
        "are tacos mexican",
        "where are they from",
        "where are tacos from",
      ],
      model: "Are they Mexican?",
    },
    {
      img: "images/antonio-banderas.png",
      name: "Antonio Banderas",
      statement: "Antonio Banderas is Spanish.",
      accept: [
        "is he spanish",
        "is antonio spanish",
        "is antonio banderas spanish",
        "where is he from",
        "where is antonio from",
        "where is antonio banderas from",
        "where's he from",
        "where's antonio from",
      ],
      model: "Is he Spanish?",
    },
    {
      img: "images/coke-pepsi.png",
      name: "Coke and Pepsi",
      statement: "Coke and Pepsi are American.",
      accept: [
        "are they american",
        "are coke and pepsi american",
        "are pepsi and coke american",
        "where are they from",
        "where are coke and pepsi from",
      ],
      model: "Are they American?",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let part = "a";
  let index = 0;
  let totalCorrect = 0;
  let totalPossible = 0;

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/bundchen|bündchen/g, "bundchen");
  }

  function matchAny(val, list) {
    const n = norm(val);
    if (!n) return false;
    let fixed = n
      .replace(/\bis not\b/g, "isn't")
      .replace(/\bare not\b/g, "aren't")
      .replace(/\bisnt\b/g, "isn't")
      .replace(/\barent\b/g, "aren't")
      .replace(/\btheyre\b/g, "they're")
      .replace(/\bshes\b/g, "she's")
      .replace(/\bits\b/g, "it's")
      .replace(/\bwheres\b/g, "where's");
    for (let i = 0; i < list.length; i++) {
      if (fixed === norm(list[i])) return true;
    }
    return false;
  }

  function calcStars() {
    if (!totalPossible) return 0;
    const r = totalCorrect / totalPossible;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
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

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function startPart(p) {
    part = p;
    index = 0;
    totalCorrect = 0;
    // Part A: each item = 2 points (question blank + answer)
    totalPossible = p === "a" ? PART_A.length * 2 : PART_B.length;
    phase = p === "a" ? "play-a" : "play-b";
    render();
  }

  function advanceOrDone(len) {
    setTimeout(() => {
      if (index < len - 1) {
        index++;
        phase = part === "a" ? "play-a" : "play-b";
        render();
      } else {
        phase = "done";
        render();
      }
    }, 750);
  }

  function setOk(el) {
    if (!el) return;
    el.classList.remove("is-bad");
    el.classList.add("is-ok");
  }
  function setBad(el) {
    if (!el) return;
    el.classList.remove("is-ok");
    el.classList.add("is-bad");
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  }

  function checkPartA() {
    const item = PART_A[index];
    const qInp = app.querySelector(".nb-q-blank");
    const aInp = app.querySelector(".nb-a-blank");
    const qOk = matchAny(qInp.value, item.qParts.find((p) => p.blank).blank);
    const aOk = matchAny(aInp.value, item.answerAccept);

    const qWrap = qInp.closest(".nb-blank-wrap");
    const aWrap = aInp.closest(".nb-blank-wrap");
    const qBubble = app.querySelector(".nb-q-row");
    const aBubble = app.querySelector(".nb-a-row");

    if (qOk) setOk(qWrap);
    else setBad(qWrap);
    if (aOk) setOk(aWrap);
    else setBad(aWrap);

    if (qBubble) qBubble.classList.toggle("is-error", !qOk);
    if (aBubble) aBubble.classList.toggle("is-error", !aOk);

    const hint = document.getElementById("nb-hint");
    if (qOk && aOk) {
      totalCorrect += 2;
      qInp.disabled = true;
      aInp.disabled = true;
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("nb-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = index < PART_A.length - 1 ? "Great!" : "Done!";
      }
      advanceOrDone(PART_A.length);
    } else {
      if (hint) {
        hint.textContent = "Not quite — try again!";
        hint.classList.add("is-visible");
      }
      if (!qOk) {
        qInp.focus();
        qInp.select();
      } else {
        aInp.focus();
        aInp.select();
      }
    }
  }

  function checkPartB() {
    const item = PART_B[index];
    const inp = app.querySelector(".nb-q-make");
    const wrap = inp.closest(".nb-blank-wrap");
    const ok = matchAny(inp.value, item.accept);

    if (ok) {
      setOk(wrap);
      totalCorrect += 1;
      inp.disabled = true;
      const hint = document.getElementById("nb-hint");
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("nb-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = index < PART_B.length - 1 ? "Great!" : "Done!";
      }
      advanceOrDone(PART_B.length);
    } else {
      setBad(wrap);
      const hint = document.getElementById("nb-hint");
      if (hint) {
        hint.textContent = "Not quite — try again!";
        hint.classList.add("is-visible");
      }
      inp.focus();
      inp.select();
    }
  }

  function bindInputs(checkFn) {
    app.querySelectorAll("input").forEach((inp, i, list) => {
      inp.addEventListener("input", () => {
        const wrap = inp.closest(".nb-blank-wrap");
        if (wrap) wrap.classList.remove("is-ok", "is-bad");
        const row = inp.closest(".nb-q-row, .nb-a-row");
        if (row) row.classList.remove("is-error");
        const hint = document.getElementById("nb-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (i < list.length - 1) list[i + 1].focus();
          else document.getElementById("nb-check")?.click();
        }
      });
    });
    document.getElementById("nb-check").onclick = checkFn;
    const first = app.querySelector("input");
    if (first) first.focus();
  }

  function renderQParts(parts) {
    return parts
      .map((p) => {
        if (p.blank) {
          return (
            '<span class="nb-blank-wrap">' +
            '<input type="text" class="nb-q-blank" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…" maxlength="8" />' +
            "</span>"
          );
        }
        return '<span class="nb-words">' + p.t + "</span>";
      })
      .join(" ");
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="nb-topbar">' +
        '<a class="nb-back" href="../" aria-label="Back">←</a>' +
        '<span class="nb-title">Nationalities · be</span>' +
        '<span class="nb-badge">2A</span>' +
        "</header>" +
        '<section class="nb-start">' +
        '<div class="nb-hero" aria-hidden="true">🌍</div>' +
        "<h1>Nationalities &amp; <em>be</em></h1>" +
        '<p class="nb-desc">Practice questions and answers about countries and nationalities.</p>' +
        '<div class="nb-part-list">' +
        '<button type="button" class="nb-part-card" id="nb-part-a">' +
        '<span class="nb-part-num">A</span>' +
        "<div><strong>Complete &amp; answer</strong><p>Fill in <em>Is / Are</em> and write the answer</p></div>" +
        "</button>" +
        '<button type="button" class="nb-part-card" id="nb-part-b">' +
        '<span class="nb-part-num">B</span>' +
        "<div><strong>Make the questions</strong><p>Use the statement · try <em>Where … from?</em> too</p></div>" +
        "</button>" +
        "</div>" +
        "</section>";
      document.getElementById("nb-part-a").onclick = () => startPart("a");
      document.getElementById("nb-part-b").onclick = () => startPart("b");
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const label = part === "a" ? "Part A" : "Part B";
      app.innerHTML =
        '<header class="nb-topbar">' +
        '<a class="nb-back" href="../" aria-label="Back">←</a>' +
        '<span class="nb-title">Nationalities · be</span>' +
        '<span class="nb-badge">Done</span>' +
        "</header>" +
        '<section class="nb-done">' +
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
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") +
        "</h1>" +
        "<p>" +
        label +
        ": <strong>" +
        totalCorrect +
        " / " +
        totalPossible +
        "</strong></p>" +
        '<button type="button" class="nb-btn" id="nb-again">Play again</button>' +
        '<button type="button" class="nb-btn secondary" id="nb-menu">All parts</button>' +
        "</section>";
      document.getElementById("nb-again").onclick = () => startPart(part);
      document.getElementById("nb-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    if (phase === "play-a") {
      const item = PART_A[index];
      app.innerHTML =
        '<header class="nb-topbar">' +
        '<a class="nb-back" href="../" aria-label="Back">←</a>' +
        '<span class="nb-title">Part A · Complete &amp; answer</span>' +
        '<span class="nb-progress">' +
        (index + 1) +
        " / " +
        PART_A.length +
        "</span>" +
        "</header>" +
        '<div class="nb-play">' +
        '<div class="nb-pic-wrap"><img class="nb-pic" src="' +
        item.img +
        '" alt="" draggable="false" /></div>' +
        '<div class="nb-tip nb-tip--' +
        item.tipType +
        '">' +
        item.tip +
        "</div>" +
        '<div class="nb-q-row">' +
        '<div class="nb-bubble-text">' +
        renderQParts(item.qParts) +
        "</div>" +
        (item.hint
          ? '<span class="nb-side-hint">' + item.hint + "</span>"
          : "") +
        "</div>" +
        '<div class="nb-a-row">' +
        '<label class="nb-label">Your answer</label>' +
        '<span class="nb-blank-wrap nb-blank-wrap--wide">' +
        '<input type="text" class="nb-a-blank" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. No, it isn\'t. It\'s Japanese." maxlength="60" />' +
        "</span>" +
        "</div>" +
        '<p class="nb-hint" id="nb-hint" aria-live="polite"></p>' +
        '<div class="nb-actions"><button type="button" class="nb-btn" id="nb-check">Check</button></div>' +
        "</div>";
      bindInputs(checkPartA);
      return;
    }

    // play-b
    const item = PART_B[index];
    app.innerHTML =
      '<header class="nb-topbar">' +
      '<a class="nb-back" href="../" aria-label="Back">←</a>' +
      '<span class="nb-title">Part B · Make the question</span>' +
      '<span class="nb-progress">' +
      (index + 1) +
      " / " +
      PART_B.length +
      "</span>" +
      "</header>" +
      '<div class="nb-play">' +
      '<div class="nb-pic-wrap"><img class="nb-pic" src="' +
      item.img +
      '" alt="' +
      escapeAttr(item.name) +
      '" draggable="false" /></div>' +
      '<div class="nb-a-row">' +
      '<label class="nb-label">Write a question</label>' +
      '<span class="nb-blank-wrap nb-blank-wrap--wide">' +
      '<input type="text" class="nb-q-make" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Is he / she…? Are they…? Where … from?" maxlength="60" />' +
      "</span>" +
      "</div>" +
      '<div class="nb-statement">' +
      '<span class="nb-statement-label">Answer</span>' +
      "<p>" +
      item.statement +
      "</p>" +
      "</div>" +
      '<p class="nb-hint" id="nb-hint" aria-live="polite"></p>' +
      '<div class="nb-actions"><button type="button" class="nb-btn" id="nb-check">Check</button></div>' +
      "</div>";
    bindInputs(checkPartB);
  }

  render();
})();
