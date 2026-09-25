/* Complete with be – Part A gaps + Part B Yes/No · AEF Starter Unit 2A */
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


  const GAME_ID = "starter-2a-complete-be";

  const PART_A = [
    {
      img: "images/pic1.png",
      lines: [
        {
          parts: [
            { t: "We" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "in Rio de Janeiro." },
          ],
        },
      ],
    },
    {
      img: "images/pic2.png",
      lines: [
        {
          parts: [
            { blank: ["are"], model: "Are" },
            { t: "they Argentinian?" },
          ],
        },
        {
          parts: [
            { t: "No, they" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "Spanish." },
          ],
        },
      ],
    },
    {
      img: "images/pic3.png",
      lines: [
        { parts: [{ t: "Are you Korean?" }] },
        {
          parts: [
            { t: "No, we" },
            { blank: ["aren't", "are not", "arent"], model: "aren't" },
            { t: ". We" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "American." },
          ],
        },
      ],
    },
    {
      img: "images/pic4.png",
      lines: [
        {
          parts: [
            { blank: ["are"], model: "Are" },
            { t: "they on vacation?" },
          ],
        },
        {
          parts: [
            { t: "No, they" },
            { blank: ["aren't", "are not", "arent"], model: "aren't" },
            { t: ". They" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "on business." },
          ],
        },
      ],
    },
    {
      img: "images/pic5.png",
      lines: [
        {
          parts: [
            { blank: ["are"], model: "Are" },
            { t: "they Turkish?" },
          ],
        },
        {
          parts: [
            { t: "No, they" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "Saudi." },
          ],
        },
      ],
    },
    {
      img: "images/pic6.png",
      lines: [
        {
          parts: [
            { blank: ["are"], model: "Are" },
            { t: "we in room 10?" },
          ],
        },
        {
          parts: [
            { t: "No, you" },
            { blank: ["aren't", "are not", "arent"], model: "aren't" },
            { t: "in room 10. You" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "in room 9." },
          ],
        },
      ],
    },
    {
      img: "images/pic7.png",
      lines: [
        {
          parts: [
            { t: "Sorry," },
            { blank: ["are"], model: "are" },
            { t: "we late?" },
          ],
        },
        {
          parts: [
            { t: "No, you" },
            { blank: ["aren't", "are not", "arent"], model: "aren't" },
            { t: ". You're early." },
          ],
        },
      ],
    },
    {
      img: "images/pic8.png",
      lines: [
        {
          parts: [
            { blank: ["are"], model: "Are" },
            { t: "they English?" },
          ],
        },
        {
          parts: [
            { t: "No, they" },
            { blank: ["aren't", "are not", "arent"], model: "aren't" },
            { t: ". They" },
            { blank: ["'re", "are", "re"], model: "'re" },
            { t: "Japanese." },
          ],
        },
      ],
    },
  ];

  // Part B: look at the picture → answer Yes / No (with short forms accepted)
  const PART_B = [
    {
      img: "images/picc1.png",
      q: "Are they in Mexico?",
      clue: "Look at the mountain and the city — where are they?",
      accept: ["no", "no they aren't", "no they are not", "no they aren't in mexico", "they aren't", "they're not"],
      model: "No, they aren't.",
    },
    {
      img: "images/picc2.png",
      q: "Are the cars Spanish?",
      clue: "Look at the cars on the lot — where are they from?",
      accept: ["yes", "yes they are", "yes they are spanish", "they are", "they're spanish"],
      model: "Yes, they are.",
    },
    {
      img: "images/picc3.png",
      q: "Are the women Korean?",
      clue: "Listen to what they say about their nationality.",
      accept: ["no", "no they aren't", "no they are not", "they aren't", "they're not", "no they're american"],
      model: "No, they aren't.",
    },
    {
      img: "images/picc4.png",
      q: "Are they on business?",
      clue: "Look at the meeting — vacation or work?",
      accept: ["yes", "yes they are", "yes they are on business", "they are", "they're on business"],
      model: "Yes, they are.",
    },
    {
      img: "images/picc5.png",
      q: "Are they from Turkey?",
      clue: "Look at the jewelry seller — where is he from?",
      accept: ["no", "no they aren't", "no he isn't", "no they are not", "they aren't", "they're saudi", "no they're saudi"],
      model: "No, they aren't.",
    },
    {
      img: "images/picc6.png",
      q: "Are they in room 9?",
      clue: "Look at the hotel reception — which room?",
      accept: ["yes", "yes they are", "yes they are in room 9", "they are"],
      model: "Yes, they are.",
    },
    {
      img: "images/picc7.png",
      q: "Are they late?",
      clue: "Look at the cinema — early or late?",
      accept: ["no", "no they aren't", "no they are not", "they aren't", "they're early", "no they're early"],
      model: "No, they aren't.",
    },
    {
      img: "images/picc8.png",
      q: "Are they from Japan?",
      clue: "Look at the flags — which country?",
      accept: ["yes", "yes they are", "yes they are from japan", "yes they're japanese", "they are"],
      model: "Yes, they are.",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play-a | play-b | done
  let part = "a";
  let index = 0;
  let checked = false;
  let blankResults = [];
  let lastAnswers = [];
  let totalCorrect = 0;
  let totalPossible = 0;

  function countBlanks(item) {
    let n = 0;
    item.lines.forEach((line) => {
      line.parts.forEach((p) => {
        if (p.blank) n++;
      });
    });
    return n;
  }

  function partATotal() {
    let n = 0;
    PART_A.forEach((it) => {
      n += countBlanks(it);
    });
    return n;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchBlank(val, accept) {
    let n = norm(val);
    if (!n) return false;
    n = n.replace(/\bare not\b/g, "aren't").replace(/\barent\b/g, "aren't");
    if (n === "re") n = "'re";
    for (let i = 0; i < accept.length; i++) {
      if (n === norm(accept[i])) return true;
    }
    return false;
  }

  function matchYesNo(val, accept) {
    let n = norm(val);
    if (!n) return false;
    n = n.replace(/\bare not\b/g, "aren't").replace(/\barent\b/g, "aren't");
    for (let i = 0; i < accept.length; i++) {
      if (n === norm(accept[i])) return true;
    }
    // loose: starts with yes/no matching first accept polarity
    const wantYes = accept.some((a) => norm(a).startsWith("yes"));
    if (wantYes && (n === "yes" || n.startsWith("yes "))) return true;
    if (!wantYes && (n === "no" || n.startsWith("no "))) return true;
    return false;
  }

  function calcStars() {
    if (totalPossible === 0) return 0;
    const ratio = totalCorrect / totalPossible;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.7) return 2;
    if (ratio >= 0.4) return 1;
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

  function collectInputs() {
    const vals = [];
    app.querySelectorAll(".cb-blank").forEach((inp) => vals.push(inp.value));
    return vals;
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function startPart(p) {
    if (window.LAFinish) LAFinish.startTimer();
    part = p;
    index = 0;
    checked = false;
    blankResults = [];
    lastAnswers = [];
    totalCorrect = 0;
    totalPossible = p === "a" ? partATotal() : PART_B.length;
    phase = p === "a" ? "play-a" : "play-b";
    render();
  }

  function allOk(results) {
    return results.length > 0 && results.every(Boolean);
  }

  function advanceOrDone() {
    const len = part === "a" ? PART_A.length : PART_B.length;
    setTimeout(() => {
      if (index < len - 1) {
        index++;
        checked = false;
        blankResults = [];
        lastAnswers = [];
        phase = part === "a" ? "play-a" : "play-b";
        render();
      } else {
        phase = "done";
        render();
      }
    }, 700);
  }

  function checkPartA() {
    const item = PART_A[index];
    const vals = collectInputs();
    lastAnswers = vals.slice();
    let vi = 0;
    const results = [];
    item.lines.forEach((line) => {
      line.parts.forEach((p) => {
        if (p.blank) {
          results.push(matchBlank(vals[vi], p.blank));
          vi++;
        }
      });
    });
    blankResults = results;

    const inputs = app.querySelectorAll(".cb-blank");
    inputs.forEach((inp, i) => {
      const wrap = inp.closest(".cb-blank-wrap");
      if (!wrap) return;
      wrap.classList.remove("is-ok", "is-bad");
      wrap.classList.add(results[i] ? "is-ok" : "is-bad");
    });
    app.querySelectorAll(".cb-model").forEach((m) => m.remove());

    if (allOk(results)) {
      totalCorrect += results.length;
      checked = true;
      inputs.forEach((inp) => (inp.disabled = true));
      const hint = document.getElementById("cb-hint");
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      app.querySelectorAll(".cb-bubble").forEach((b) => b.classList.remove("is-error"));
      const btn = document.getElementById("cb-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = index < PART_A.length - 1 ? "Great!" : "Done!";
      }
      advanceOrDone();
    } else {
      showErrors(results, inputs);
    }
  }

  function checkPartB() {
    const item = PART_B[index];
    const inp = app.querySelector(".cb-blank");
    const val = inp ? inp.value : "";
    lastAnswers = [val];
    const ok = matchYesNo(val, item.accept);
    blankResults = [ok];
    const wrap = inp && inp.closest(".cb-blank-wrap");
    if (wrap) {
      wrap.classList.remove("is-ok", "is-bad");
      wrap.classList.add(ok ? "is-ok" : "is-bad");
    }
    const bubble = app.querySelector(".cb-bubble");
    if (bubble) bubble.classList.toggle("is-error", !ok);

    if (ok) { try{sfxCorrect();}catch(e){}
      totalCorrect += 1;
      checked = true;
      if (inp) inp.disabled = true;
      const hint = document.getElementById("cb-hint");
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("cb-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = index < PART_B.length - 1 ? "Great!" : "Done!";
      }
      advanceOrDone();
    } else {
      showErrors([false], inp ? [inp] : []);
    }
  }

  function showErrors(results, inputs) {
    checked = false;
    app.querySelectorAll(".cb-bubble").forEach((b) => {
      b.classList.remove("is-error");
      if (b.querySelector(".cb-blank-wrap.is-bad")) b.classList.add("is-error");
    });
    const hint = document.getElementById("cb-hint");
    if (hint) {
      hint.textContent = "Not quite — try again!";
      hint.classList.add("is-visible");
    }
    app.querySelectorAll(".cb-blank-wrap.is-bad .cb-blank").forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
    for (let i = 0; i < inputs.length; i++) {
      if (!results[i]) {
        inputs[i].focus();
        inputs[i].select();
        break;
      }
    }
  }

  function buildLinesHTML(item) {
    let blankIdx = 0;
    return item.lines
      .map((line) => {
        const inner = line.parts
          .map((p) => {
            if (p.blank) {
              const bi = blankIdx++;
              const shown = lastAnswers[bi] || "";
              return (
                '<span class="cb-blank-wrap"><input type="text" class="cb-blank" data-bi="' +
                bi +
                '" value="' +
                escapeAttr(shown) +
                '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…" maxlength="12" /></span>'
              );
            }
            return '<span class="cb-words">' + p.t + "</span>";
          })
          .join(" ");
        return (
          '<div class="cb-bubble"><div class="cb-bubble-text">' +
          inner +
          "</div></div>"
        );
      })
      .join("");
  }

  function bindBlanks(checkFn) {
    const inputs = app.querySelectorAll(".cb-blank");
    if (inputs[0]) inputs[0].focus();
    inputs.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        const wrap = inp.closest(".cb-blank-wrap");
        if (wrap) wrap.classList.remove("is-ok", "is-bad");
        const bubble = inp.closest(".cb-bubble");
        if (bubble && !bubble.querySelector(".cb-blank-wrap.is-bad")) {
          bubble.classList.remove("is-error");
        }
        const hint = document.getElementById("cb-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (i < inputs.length - 1) inputs[i + 1].focus();
          else document.getElementById("cb-check")?.click();
        }
      });
    });
    document.getElementById("cb-check").onclick = checkFn;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="cb-topbar">' +
        '<a class="cb-back" href="../" aria-label="Back">←</a>' +
        '<span class="cb-title">Complete with be</span>' +
        '<span class="cb-badge">2A</span>' +
        "</header>" +
        '<section class="cb-start">' +
        '<div class="cb-hero" aria-hidden="true">✏️</div>' +
        "<h1>Complete with <em>be</em></h1>" +
        '<p class="cb-desc">Choose a part to practice.</p>' +
        '<div class="cb-part-list">' +
        '<button type="button" class="cb-part-card" id="cb-part-a">' +
        '<span class="cb-part-num">A</span>' +
        "<div><strong>Complete the sentences</strong><p>Write the correct form of <em>be</em></p></div>" +
        "</button>" +
        '<button type="button" class="cb-part-card" id="cb-part-b">' +
        '<span class="cb-part-num">B</span>' +
        "<div><strong>Answer the questions</strong><p>Look at the pictures · Yes / No</p></div>" +
        "</button>" +
        "</div>" +
        "</section>";
      document.getElementById("cb-part-a").onclick = () => startPart("a");
      document.getElementById("cb-part-b").onclick = () => startPart("b");
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: totalPossible,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(part),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = () => startPart(part);
      return;
    }

    if (phase === "play-a") {
      const item = PART_A[index];
      app.innerHTML =
        '<header class="cb-topbar">' +
        '<a class="cb-back" href="../" aria-label="Back">←</a>' +
        '<span class="cb-title">Part A · Complete with be</span>' +
        '<span class="cb-progress">' +
        (index + 1) +
        " / " +
        PART_A.length +
        "</span>" +
        "</header>" +
        '<div class="cb-play">' +
        '<div class="cb-pic-wrap"><img class="cb-pic" src="' +
        item.img +
        '" alt="Picture ' +
        (index + 1) +
        '" draggable="false" /></div>' +
        '<div class="cb-answers">' +
        buildLinesHTML(item) +
        "</div>" +
        '<p class="cb-hint" id="cb-hint" aria-live="polite"></p>' +
        '<div class="cb-actions"><button type="button" class="cb-btn" id="cb-check">Check</button></div>' +
        "</div>";
      bindBlanks(checkPartA);
      return;
    }

    // play-b
    const item = PART_B[index];
    app.innerHTML =
      '<header class="cb-topbar">' +
      '<a class="cb-back" href="../" aria-label="Back">←</a>' +
      '<span class="cb-title">Part B · Answer the questions</span>' +
      '<span class="cb-progress">' +
      (index + 1) +
      " / " +
      PART_B.length +
      "</span>" +
      "</header>" +
      '<div class="cb-play">' +
      '<div class="cb-pic-wrap"><img class="cb-pic" src="' +
      item.img +
      '" alt="Picture ' +
      (index + 1) +
      '" draggable="false" /></div>' +
      '<div class="cb-answers">' +
      '<div class="cb-q-card">' +
      '<p class="cb-q-text">' +
      item.q +
      "</p>" +
      '<p class="cb-clue">💡 ' +
      item.clue +
      "</p>" +
      "</div>" +
      '<div class="cb-bubble"><div class="cb-bubble-text">' +
      '<span class="cb-blank-wrap"><input type="text" class="cb-blank cb-blank-wide" value="' +
      escapeAttr(lastAnswers[0] || "") +
      '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Yes, they are. / No, they aren\'t." maxlength="40" /></span>' +
      "</div></div>" +
      "</div>" +
      '<p class="cb-hint" id="cb-hint" aria-live="polite"></p>' +
      '<div class="cb-actions"><button type="button" class="cb-btn" id="cb-check">Check</button></div>' +
      "</div>";
    bindBlanks(checkPartB);
  }

  render();
})();
