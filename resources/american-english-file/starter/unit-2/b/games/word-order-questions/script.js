/* Word Order Questions – 3 dialogues + drag & drop – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-word-order-questions";

  const PARTS = [
    {
      title: "1 · Meeting with the baby",
      image: "images/1.png",
      lines: [
        { speaker: "Gill", text: "Hi Anna!" },
        { speaker: "Anna", text: "Hello Gill.", blank: 0 },
        { speaker: "Gill", text: "I'm fine, thanks.", blank: 1 },
        { speaker: "Anna", text: "He's Sammy, my little boy." },
        { speaker: "Gill", text: "", blank: 2 },
        { speaker: "Anna", text: "He's one." },
        { speaker: "Gill", text: "He's very nice." },
      ],
      questions: [
        { words: ["you", "How", "are"], answer: "How are you?", example: true },
        { words: ["he", "Who", "is"], answer: "Who is he?" },
        { words: ["old", "is", "How", "he"], answer: "How old is he?" },
      ],
    },
    {
      title: "2 · At reception",
      image: "images/2.png",
      lines: [
        { speaker: "Woman", text: "", blank: 0 },
        { speaker: "Boy", text: "Henry." },
        { speaker: "Woman", text: "OK.", blank: 1 },
        { speaker: "Boy", text: "Schultz." },
        { speaker: "Woman", text: "", blank: 2 },
        { speaker: "Boy", text: "S-C-H-U-L-T-Z." },
        { speaker: "Woman", text: "Oh, yes.", blank: 3 },
        { speaker: "Boy", text: "I'm 18." },
        { speaker: "Woman", text: "OK. That's fine." },
      ],
      questions: [
        { words: ["your", "first", "What's", "name"], answer: "What's your first name?" },
        { words: ["What's", "last name", "your"], answer: "What's your last name?" },
        { words: ["spell", "do", "How", "it", "you"], answer: "How do you spell it?" },
        { words: ["you", "old", "are", "How"], answer: "How old are you?" },
      ],
    },
    {
      title: "3 · On the phone",
      image: "images/3.png",
      lines: [
        { speaker: "Woman 1", text: "", blank: 0 },
        { speaker: "Woman 2", text: "It's 72 Maple Street, Boston." },
        { speaker: "Woman 1", text: "", blank: 1 },
        { speaker: "Woman 2", text: "It's 02354." },
        { speaker: "Woman 1", text: "Thank you.", blank: 2 },
        { speaker: "Woman 2", text: "It's 617-555-7028." },
        { speaker: "Woman 1", text: "OK.", blank: 3 },
        { speaker: "Woman 2", text: "It's 781-555-3019." },
      ],
      questions: [
        { words: ["your", "address", "What's"], answer: "What's your address?" },
        { words: ["zip code", "What's", "your"], answer: "What's your zip code?" },
        { words: ["home", "What's", "phone", "your", "number"], answer: "What's your home phone number?" },
        { words: ["cell", "your", "number", "What's"], answer: "What's your cell number?" },
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let partIndex = 0;
  let qIndex = 0;
  let built = [];
  let pool = [];
  let correctTotal = 0;
  let filled = {};

  // Drag state
  let drag = null; // { from: 'pool'|'built', index, wordIndex, ghost }

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function currentPart() { return PARTS[partIndex]; }
  function currentQ() { return currentPart().questions[qIndex]; }

  function startPart(i) {
    if (window.LAFinish) LAFinish.startTimer();
    partIndex = i;
    qIndex = 0;
    filled = {};
    if (currentPart().questions[0] && currentPart().questions[0].example) {
      filled[0] = currentPart().questions[0].answer;
      qIndex = 1;
    }
    resetBuild();
    phase = "play";
    render();
  }

  function resetBuild() {
    built = [];
    const q = currentQ();
    if (!q) return;
    pool = shuffle(q.words.map(function (_, i) { return i; }));
  }

  function pickWord(poolIdx) {
    const wi = pool[poolIdx];
    if (wi === undefined) return;
    built.push(wi);
    pool.splice(poolIdx, 1);
    renderPlay(false);
  }

  function removeBuilt(bi) {
    if (bi < 0 || bi >= built.length) return;
    const wi = built.splice(bi, 1)[0];
    pool.push(wi);
    renderPlay(false);
  }

  function undoWord() {
    if (!built.length) return;
    removeBuilt(built.length - 1);
  }

  function check() {
    const q = currentQ();
    if (!q) return;
    const words = built.map(function (i) { return q.words[i]; });
    const attempt = words.join(" ");
    const normalized = attempt.charAt(0).toUpperCase() + attempt.slice(1);
    const ok =
      normalized === q.answer ||
      attempt.toLowerCase() === q.answer.toLowerCase().replace(/\?$/, "") ||
      normalized + "?" === q.answer;

    const feedback = document.getElementById("wo-feedback");
    if (ok) {
      correctTotal += 1;
      filled[qIndex] = q.answer;
      if (feedback) {
        feedback.textContent = "Correct! " + q.answer;
        feedback.className = "wo-feedback is-ok";
      }
      setTimeout(function () {
        qIndex += 1;
        if (qIndex >= currentPart().questions.length) {
          if (partIndex + 1 < PARTS.length) {
            startPart(partIndex + 1);
          } else {
            phase = "done";
            render();
          }
        } else {
          resetBuild();
          render();
        }
      }, 900);
    } else {
      if (feedback) {
        feedback.textContent = "Try again.";
        feedback.className = "wo-feedback is-bad";
      }
      const slot = document.getElementById("wo-slot");
      if (slot) {
        slot.classList.add("is-shake");
        setTimeout(function () { slot.classList.remove("is-shake"); }, 400);
      }
    }
  }

  function calcStars() {
    let total = 0;
    PARTS.forEach(function (p) {
      p.questions.forEach(function (q) { if (!q.example) total += 1; });
    });
    const r = correctTotal / total;
    if (r >= 1) return 3;
    if (r >= 0.75) return 2;
    if (r >= 0.5) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function dialogueHtml(part) {
    return part.lines.map(function (line) {
      let body = "";
      if (line.blank !== undefined) {
        if (filled[line.blank]) {
          body = '<span class="wo-filled">' + filled[line.blank] + "</span>";
        } else if (line.blank === qIndex) {
          body = '<span class="wo-blank is-active">________</span>';
        } else {
          body = '<span class="wo-blank">________</span>';
        }
        if (line.text) body = line.text + " " + body;
      } else {
        body = line.text;
      }
      return (
        '<div class="wo-line">' +
        '<span class="wo-speaker">' + line.speaker + "</span>" +
        '<span class="wo-text">' + body + "</span>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- Drag & drop (pointer events) ---------- */
  function clearDrag() {
    if (drag && drag.ghost && drag.ghost.parentNode) {
      drag.ghost.parentNode.removeChild(drag.ghost);
    }
    app.querySelectorAll(".wo-chip.is-ghost, .wo-chip.is-dragging").forEach(function (el) {
      el.classList.remove("is-ghost", "is-dragging");
    });
    const slot = document.getElementById("wo-slot");
    if (slot) slot.classList.remove("is-drag-over");
    drag = null;
  }

  function onPointerDown(e, from, index) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const chip = e.currentTarget;
    const wordIndex = from === "pool" ? pool[index] : built[index];
    const q = currentQ();
    if (wordIndex === undefined || !q) return;

    const rect = chip.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.className = "wo-drag-ghost";
    ghost.textContent = q.words[wordIndex];
    ghost.style.width = rect.width + "px";
    ghost.style.transform = "translate3d(" + rect.left + "px," + rect.top + "px,0) scale(1.06)";
    document.body.appendChild(ghost);

    chip.classList.add("is-ghost");
    drag = {
      from: from,
      index: index,
      wordIndex: wordIndex,
      ghost: ghost,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };

    chip.setPointerCapture && chip.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag) return;
    e.preventDefault();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.moved = true;
      drag.ghost.classList.add("is-dragging");
    }
    drag.ghost.style.transform = "translate3d(" + (e.clientX - drag.offsetX) + "px," + (e.clientY - drag.offsetY) + "px,0) scale(1.06)";

    const slot = document.getElementById("wo-slot");
    if (slot) {
      const r = slot.getBoundingClientRect();
      const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      slot.classList.toggle("is-drag-over", over && drag.from === "pool");
    }
  }

  function onPointerUp(e) {
    if (!drag) return;
    e.preventDefault();
    const slot = document.getElementById("wo-slot");
    const poolEl = app.querySelector(".wo-pool");

    if (!drag.moved) {
      // Tap
      if (drag.from === "pool") pickWord(drag.index);
      else removeBuilt(drag.index);
      clearDrag();
      return;
    }

    // Drop
    if (drag.from === "pool" && slot) {
      const r = slot.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        pickWord(drag.index);
        clearDrag();
        return;
      }
    }
    if (drag.from === "built" && poolEl) {
      const r = poolEl.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        removeBuilt(drag.index);
        clearDrag();
        return;
      }
    }
    clearDrag();
  }

  function bindDrag() {
    app.querySelectorAll(".wo-chip[data-pool]").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (e) {
        onPointerDown(e, "pool", +btn.dataset.pool);
      });
    });
    app.querySelectorAll(".wo-chip[data-built]").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (e) {
        onPointerDown(e, "built", +btn.dataset.built);
      });
    });
  }

  // Global move/up
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp, { passive: false });
  window.addEventListener("pointercancel", function () { clearDrag(); });

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="wo-topbar">' +
        '<a class="wo-back" href="../" aria-label="Back">←</a>' +
        '<span class="wo-title">Word Order</span>' +
        '<span class="wo-badge">2B</span>' +
        "</header>" +
        '<section class="wo-menu">' +
        "<h1>Put the words in order</h1>" +
        '<p class="wo-lead">Make questions · 3 conversations<br/><small style="opacity:.8">Tap or drag words</small></p>' +
        '<button type="button" class="wo-btn" id="wo-start">Start</button>' +
        "</section>";
      document.getElementById("wo-start").onclick = function () {
        correctTotal = 0;
        startPart(0);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctTotal,
          total: Math.max(correctTotal, 1),
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(0),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startPart(0);
      return;
    }

    renderPlay(true);
  }

  function renderPlay(full) {
    const part = currentPart();
    const q = currentQ();
    if (!q) return;

    const enter = full ? " wo-enter" : "";
    const slotWords = built.map(function (wi, bi) {
      return '<button type="button" class="wo-chip is-built' + enter + '" data-built="' + bi + '">' + q.words[wi] + "</button>";
    }).join("");

    const poolWords = pool.map(function (wi, pi) {
      return '<button type="button" class="wo-chip' + enter + '" data-pool="' + pi + '">' + q.words[wi] + "</button>";
    }).join("");

    const pct = Math.round(((partIndex + qIndex / part.questions.length) / PARTS.length) * 100);

    if (full) {
      app.innerHTML =
        '<header class="wo-topbar">' +
        '<a class="wo-back" href="../" aria-label="Back">←</a>' +
        '<span class="wo-title">' + part.title + "</span>" +
        '<span class="wo-badge">' + (partIndex + 1) + "/3</span>" +
        "</header>" +
        '<div class="wo-progress"><span style="width:' + pct + '%"></span></div>' +
        '<div class="wo-scene">' +
        '<div class="wo-dialogue wo-animate-in">' + dialogueHtml(part) + "</div>" +
        '<div class="wo-photo"><img src="' + part.image + '" alt="" /></div>' +
        "</div>" +
        '<div class="wo-builder">' +
        '<p class="wo-hint">Tap or drag the words in the correct order.</p>' +
        '<div class="wo-slot" id="wo-slot">' + (slotWords || '<span class="wo-slot-ph">Build the question here</span>') + "</div>" +
        '<div class="wo-pool">' + poolWords + "</div>" +
        '<p class="wo-feedback" id="wo-feedback"></p>' +
        '<div class="wo-actions">' +
        '<button type="button" class="wo-btn secondary" id="wo-undo">Undo</button>' +
        '<button type="button" class="wo-btn secondary" id="wo-clear">Clear</button>' +
        '<button type="button" class="wo-btn" id="wo-check">Check</button>' +
        "</div>" +
        "</div>";
    } else {
      const builder = app.querySelector(".wo-builder");
      const dialogue = app.querySelector(".wo-dialogue");
      if (builder) {
        builder.innerHTML =
          '<p class="wo-hint">Tap or drag the words in the correct order.</p>' +
          '<div class="wo-slot" id="wo-slot">' + (slotWords || '<span class="wo-slot-ph">Build the question here</span>') + "</div>" +
          '<div class="wo-pool">' + poolWords + "</div>" +
          '<p class="wo-feedback" id="wo-feedback"></p>' +
          '<div class="wo-actions">' +
          '<button type="button" class="wo-btn secondary" id="wo-undo">Undo</button>' +
          '<button type="button" class="wo-btn secondary" id="wo-clear">Clear</button>' +
          '<button type="button" class="wo-btn" id="wo-check">Check</button>' +
          "</div>";
      }
      // dialogue unchanged while building words — skip re-render to avoid flicker
    }

    bindDrag();
    const undo = document.getElementById("wo-undo");
    const clear = document.getElementById("wo-clear");
    const checkBtn = document.getElementById("wo-check");
    if (undo) undo.onclick = undoWord;
    if (clear) clear.onclick = function () { resetBuild(); renderPlay(false); };
    if (checkBtn) checkBtn.onclick = check;
  }

  render();
})();
