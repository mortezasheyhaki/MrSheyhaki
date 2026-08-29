/* =========================================================
   FRIDGE CHECK — Unit 9A
   One question at a time · no scrolling
   ========================================================= */

(function () {
  "use strict";

  const GAME_ID = "1-9a-fridge-grammar";

  const PART1 = [
    {
      n: 1, prompt: "sushi?",
      acceptQ: ["is there any sushi"],
      aKey: "yes-is",
      model: "Is there any sushi? → Yes, there is."
    },
    {
      n: 2, prompt: "butter?",
      acceptQ: ["is there any butter"],
      aKey: "no-isnt",
      model: "Is there any butter? → No, there isn't."
    },
    {
      n: 3, prompt: "carrots?",
      acceptQ: ["are there any carrots"],
      aKey: "no-arent",
      model: "Are there any carrots? → No, there aren't."
    },
    {
      n: 4, prompt: "cheese?",
      acceptQ: ["is there any cheese"],
      aKey: "yes-is",
      model: "Is there any cheese? → Yes, there is."
    },
    {
      n: 5, prompt: "fish?",
      acceptQ: ["is there any fish"],
      aKey: "no-isnt",
      model: "Is there any fish? → No, there isn't."
    },
    {
      n: 6, prompt: "chicken?",
      acceptQ: ["is there any chicken", "is there a chicken"],
      aKey: "yes-is",
      model: "Is there any chicken? / Is there a chicken? → Yes, there is."
    },
    {
      n: 7, prompt: "eggs?",
      acceptQ: ["are there any eggs"],
      aKey: "yes-are",
      model: "Are there any eggs? → Yes, there are."
    },
    {
      n: 8, prompt: "orange juice?",
      acceptQ: ["is there any orange juice"],
      aKey: "no-isnt",
      model: "Is there any orange juice? → No, there isn't."
    }
  ];

  const PART2 = [
    {
      n: 1, prompt: "onions", sign: "−",
      accept: ["there aren't any onions", "there are not any onions", "there are no onions"],
      model: "There aren't any onions."
    },
    {
      n: 2, prompt: "tomato juice", sign: "+",
      accept: ["there's some tomato juice", "there is some tomato juice"],
      model: "There's some tomato juice."
    },
    {
      n: 3, prompt: "pineapple", sign: "+",
      accept: ["there's a pineapple", "there is a pineapple"],
      model: "There's a pineapple."
    },
    {
      n: 4, prompt: "strawberries", sign: "−",
      accept: ["there aren't any strawberries", "there are not any strawberries", "there are no strawberries"],
      model: "There aren't any strawberries."
    },
    {
      n: 5, prompt: "peppers", sign: "−",
      accept: ["there aren't any peppers", "there are not any peppers", "there are no peppers"],
      model: "There aren't any peppers."
    },
    {
      n: 6, prompt: "milk", sign: "+",
      accept: ["there's some milk", "there is some milk"],
      model: "There's some milk."
    },
    {
      n: 7, prompt: "mushrooms", sign: "+",
      accept: ["there are some mushrooms", "there's some mushrooms"],
      model: "There are some mushrooms."
    },
    {
      n: 8, prompt: "ice cream", sign: "−",
      accept: ["there isn't any ice cream", "there is not any ice cream", "there's no ice cream", "there is no ice cream"],
      model: "There isn't any ice cream."
    }
  ];

  const PILLS = [
    { key: "yes-is", label: "Yes, there is." },
    { key: "yes-are", label: "Yes, there are." },
    { key: "no-isnt", label: "No, there isn't." },
    { key: "no-arent", label: "No, there aren't." }
  ];

  // State
  let part = 1;          // 1 or 2
  let index = 0;         // current item index in part
  let score = 0;
  let locked = false;    // after check, waiting for continue
  let selectedPill = null;

  const $ = (id) => document.getElementById(id);
  const qStage = $("qStage");
  const checkBtn = $("checkBtn");
  const continueBtn = $("continueBtn");
  const feedback = $("feedback");
  const instruction = $("instruction");
  const partNum = $("partNum");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const tab1 = $("tab1");
  const tab2 = $("tab2");
  const zoomBtn = $("zoomBtn");
  const zoomOverlay = $("zoomOverlay");
  const zoomClose = $("zoomClose");
  const successOverlay = $("successOverlay");
  const againBtn = $("againBtn");
  const backBtn = $("backBtn");

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[?.!]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchesAny(text, list) {
    const n = normalize(text);
    return list.some((a) => normalize(a) === n);
  }

  function currentList() {
    return part === 1 ? PART1 : PART2;
  }

  function showFeedback(type, msg) {
    feedback.hidden = false;
    feedback.className = "feedback " + type;
    feedback.textContent = msg;
  }

  function hideFeedback() {
    feedback.hidden = true;
  }

  function updateHeader() {
    const list = currentList();
    partNum.textContent = String(part);
    qProgress.textContent = (index + 1) + "/" + list.length;
    scoreText.textContent = String(score);
  }

  function renderQuestion() {
    locked = false;
    selectedPill = null;
    hideFeedback();
    checkBtn.hidden = false;
    checkBtn.disabled = true;
    checkBtn.textContent = "Check";
    continueBtn.hidden = true;

    const list = currentList();
    const item = list[index];
    updateHeader();

    if (part === 1) {
      instruction.innerHTML =
        "Look in the fridge. Write a question with <strong>Is there / Are there</strong> + <strong>a / an / any</strong>, then choose the short answer.";
      const pillsHtml = PILLS.map(
        (p) =>
          `<button type="button" class="pill" data-key="${p.key}">${p.label}</button>`
      ).join("");
      qStage.innerHTML = `
        <div class="q-card" id="qCard">
          <div class="q-prompt">${item.n}. <span>${item.prompt}</span></div>
          <input class="q-input" id="qInput" type="text" placeholder="Is there / Are there …?" autocomplete="off" spellcheck="false">
          <div class="answer-pills">${pillsHtml}</div>
          <div class="hint" id="hint" hidden></div>
        </div>
      `;
      const inp = $("qInput");
      inp.addEventListener("input", updateCheckEnabled);
      qStage.querySelectorAll(".pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (locked) return;
          qStage.querySelectorAll(".pill").forEach((p) => p.classList.remove("selected"));
          btn.classList.add("selected");
          selectedPill = btn.dataset.key;
          updateCheckEnabled();
        });
      });
      setTimeout(() => inp.focus(), 50);
    } else {
      const isPos = item.sign === "+";
      instruction.innerHTML = isPos
        ? "Look in the fridge. Write a <strong>positive (+)</strong> sentence with <strong>a / an / some</strong>."
        : "Look in the fridge. Write a <strong>negative (−)</strong> sentence with <strong>any</strong>.";
      qStage.innerHTML = `
        <div class="q-card" id="qCard">
          <div class="sign-label">${isPos ? "Positive sentence (+)" : "Negative sentence (−)"}</div>
          <div class="q-prompt-row">
            <span class="sign-badge ${isPos ? "pos" : "neg"}">${item.sign}</span>
            <div class="q-prompt">${item.n}. <span>${item.prompt}</span></div>
          </div>
          <input class="q-input" id="qInput" type="text"
            placeholder="${isPos ? "There's a / some …" : "There isn't / aren't any …"}"
            autocomplete="off" spellcheck="false">
          <div class="hint" id="hint" hidden></div>
        </div>
      `;
      const inp = $("qInput");
      inp.addEventListener("input", updateCheckEnabled);
      setTimeout(() => inp.focus(), 50);
    }
  }

  function updateCheckEnabled() {
    if (locked) return;
    const inp = $("qInput");
    const hasText = inp && normalize(inp.value);
    if (part === 1) {
      checkBtn.disabled = !(hasText && selectedPill);
    } else {
      checkBtn.disabled = !hasText;
    }
  }

  function checkCurrent() {
    if (locked) return;
    const list = currentList();
    const item = list[index];
    const inp = $("qInput");
    const card = $("qCard");
    const hint = $("hint");
    const text = inp ? inp.value : "";

    let ok = false;
    if (part === 1) {
      ok = matchesAny(text, item.acceptQ) && selectedPill === item.aKey;
    } else {
      ok = matchesAny(text, item.accept);
    }

    locked = true;
    inp.classList.add("locked");
    qStage.querySelectorAll(".pill").forEach((p) => {
      p.disabled = true;
      if (p.dataset.key === item.aKey) p.classList.add("correct-pill");
      else if (p.dataset.key === selectedPill && !ok) p.classList.add("wrong-pill");
    });
    checkBtn.hidden = true;

    card.classList.remove("correct", "wrong");
    // force reflow for animation restart
    void card.offsetWidth;
    card.classList.add(ok ? "correct" : "wrong");

    if (ok) {
      score++;
      scoreText.textContent = String(score);
      showFeedback("success", "Correct! ✓");
      hint.hidden = true;
    } else {
      showFeedback("error", "Not quite.");
      hint.hidden = false;
      hint.textContent = "✓ " + item.model;
    }

    const isLast = index >= list.length - 1;
    const isLastPart = part === 2 && isLast;

    continueBtn.hidden = false;
    if (isLastPart) {
      continueBtn.textContent = "See results →";
    } else if (isLast && part === 1) {
      continueBtn.textContent = "Continue to Part 2 →";
    } else {
      continueBtn.textContent = "Continue →";
    }
  }

  function onContinue() {
    const list = currentList();
    const isLast = index >= list.length - 1;

    if (part === 1 && isLast) {
      // move to part 2
      part = 2;
      index = 0;
      tab1.classList.remove("active");
      tab1.classList.add("done");
      tab2.disabled = false;
      tab2.classList.add("active");
      renderQuestion();
      return;
    }

    if (part === 2 && isLast) {
      finish();
      return;
    }

    index++;
    renderQuestion();
  }

  function finish() {
    const total = PART1.length + PART2.length;
    const acc = Math.round((score / total) * 100);
    $("endTitle").textContent =
      acc === 100 ? "Perfect!" : acc >= 70 ? "Well done!" : "Good practice!";
    $("endMsg").textContent = `Score: ${score} / ${total} (${acc}%)`;
    const emojiEl = $("endEmoji");
    if (emojiEl) {
      emojiEl.textContent = acc === 100 ? "🏆" : acc >= 70 ? "🎉" : "💪";
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}
    tab2.classList.add("done");
    successOverlay.hidden = false;
  }

  function resetGame() {
    part = 1;
    index = 0;
    score = 0;
    locked = false;
    selectedPill = null;
    successOverlay.hidden = true;
    tab1.classList.add("active");
    tab1.classList.remove("done");
    tab2.classList.remove("active", "done");
    tab2.disabled = true;
    renderQuestion();
  }

  checkBtn.addEventListener("click", checkCurrent);
  continueBtn.addEventListener("click", onContinue);
  againBtn.addEventListener("click", resetGame);

  zoomBtn.addEventListener("click", () => { zoomOverlay.hidden = false; });
  zoomClose.addEventListener("click", () => { zoomOverlay.hidden = true; });
  zoomOverlay.addEventListener("click", (e) => {
    if (e.target === zoomOverlay) zoomOverlay.hidden = true;
  });

  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }


  // Enter = Check (or Continue when locked)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    // ignore if overlay open
    if (successOverlay && !successOverlay.hidden) return;
    if (zoomOverlay && !zoomOverlay.hidden) return;
    e.preventDefault();
    if (locked) {
      if (continueBtn && !continueBtn.hidden) onContinue();
    } else if (checkBtn && !checkBtn.hidden && !checkBtn.disabled) {
      checkCurrent();
    }
  });

  renderQuestion();
})();
