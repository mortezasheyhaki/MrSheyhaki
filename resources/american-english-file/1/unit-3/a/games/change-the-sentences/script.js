(function () {
  const GAME_ID = "aef1-u3a-change-the-sentences";

  function awardStars(correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, pct);
    }
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function renderStars(el, n) {
    if (!el) return;
    el.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled pop" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = (i * 0.12) + "s";
      el.appendChild(s);
    }
  }

  // Part A — one sentence at a time
  // student types everything after the new subject (shown fixed)
  const PART_A = [
    {
      original: "I go to the movies.",
      subject: "She",
      accept: ["goes to the movies", "goes to the movies."],
      reveal: "She goes to the movies."
    },
    {
      original: "We live in a house.",
      subject: "He",
      accept: ["lives in a house", "lives in a house."],
      reveal: "He lives in a house."
    },
    {
      original: "She has two children.",
      subject: "They",
      accept: ["have two children", "have two children."],
      reveal: "They have two children."
    },
    {
      original: "My dad doesn't like cold weather.",
      subject: "I",
      accept: ["don't like cold weather", "don't like cold weather.", "do not like cold weather", "do not like cold weather."],
      reveal: "I don't like cold weather."
    },
    {
      original: "The stores close at 9:00.",
      subject: "The supermarket",
      accept: ["closes at 9:00", "closes at 9:00.", "closes at 9.00", "closes at 9.00."],
      reveal: "The supermarket closes at 9:00."
    },
    {
      original: "We don't study French.",
      subject: "My sister",
      accept: ["doesn't study French", "doesn't study French.", "does not study French", "does not study French."],
      reveal: "My sister doesn't study French."
    },
    {
      original: "My husband does housework.",
      subject: "I",
      accept: ["do housework", "do housework."],
      reveal: "I do housework."
    },
    {
      original: "I want a guitar.",
      subject: "My son",
      accept: ["wants a guitar", "wants a guitar."],
      reveal: "My son wants a guitar."
    },
    {
      original: "I don't work on Saturdays.",
      subject: "My friend",
      accept: ["doesn't work on Saturdays", "doesn't work on Saturdays.", "does not work on Saturdays", "does not work on Saturdays."],
      reveal: "My friend doesn't work on Saturdays."
    },
    {
      original: "The show finishes at 5:00.",
      subject: "Our classes",
      accept: ["finish at 5:00", "finish at 5:00.", "finish at 5.00", "finish at 5.00."],
      reveal: "Our classes finish at 5:00."
    },
  ];

  // Part B
  const PART_B = [
    { sign: "−", before: "Pedro", after: "in an office.", accept: ["doesn't work", "does not work"], reveal: "doesn't work" },
    { sign: "+", before: "Eva", after: "books in English.", accept: ["reads"], reveal: "reads" },
    { sign: "+", before: "You", after: "Arabic very well.", accept: ["speak"], reveal: "speak" },
    { sign: "−", before: "I", after: "games on my phone.", accept: ["don't play", "do not play"], reveal: "don't play" },
    { sign: "+", before: "Paolo", after: "glasses.", accept: ["wears"], reveal: "wears" },
    { sign: "+", before: "We", after: "to music in the car.", accept: ["listen"], reveal: "listen" },
    { sign: "−", before: "They", after: "fast food.", accept: ["don't eat", "do not eat"], reveal: "don't eat" },
    { sign: "+", before: "Julia", after: "three children.", accept: ["has"], reveal: "has" },
  ];

  // DOM
  const partA = document.getElementById("partA");
  const partB = document.getElementById("partB");
  const tabs = document.querySelectorAll(".tab");

  const aPrompt = document.getElementById("aPrompt");
  const aSubject = document.getElementById("aSubject");
  const aInput = document.getElementById("aInput");
  const aCheck = document.getElementById("aCheck");
  const aSkip = document.getElementById("aSkip");
  const aFeedback = document.getElementById("aFeedback");
  const aCounter = document.getElementById("aCounter");
  const aBar = document.getElementById("aBar");
  const aScoreEl = document.getElementById("aScore");
  const aPrev = document.getElementById("aPrev");
  const aNext = document.getElementById("aNext");
  const aDone = document.getElementById("aDone");
  const aFinalScore = document.getElementById("aFinalScore");
  const aRestart = document.getElementById("aRestart");
  const goToB = document.getElementById("goToB");

  const bList = document.getElementById("bList");
  const bCheck = document.getElementById("bCheck");
  const bReset = document.getElementById("bReset");
  const bFeedback = document.getElementById("bFeedback");

  let aIndex = 0;
  let aScore = 0;
  let aAnswered = new Array(PART_A.length).fill(null); // true/false/null
  let aLocked = false;

  function normalize(s) {
    return s.toLowerCase().trim().replace(/[?.!]+$/g, "").replace(/\s+/g, " ");
  }

  // ----- Tabs -----
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const which = tab.dataset.tab;
      partA.classList.toggle("hidden", which !== "a");
      partB.classList.toggle("hidden", which !== "b");
    });
  });

  // ----- Part A -----
  function loadA() {
    const item = PART_A[aIndex];
    aPrompt.textContent = item.original;
    aSubject.textContent = item.subject;
    aInput.value = "";
    aInput.classList.remove("correct", "wrong");
    aInput.disabled = false;
    // Placeholder: "goes to the movies..." only on first question as a gentle hint
    aInput.placeholder = aIndex === 0 ? "goes to the movies..." : "";
    aFeedback.textContent = "";
    aFeedback.className = "feedback";
    aLocked = false;
    aCheck.disabled = false;
    aSkip.disabled = false;

    aCounter.textContent = (aIndex + 1) + " / " + PART_A.length;
    aBar.style.width = ((aIndex + 1) / PART_A.length * 100) + "%";
    aScoreEl.textContent = aScore + " correct";

    aPrev.disabled = aIndex === 0;
    aNext.disabled = aIndex === PART_A.length - 1 && aAnswered[aIndex] === null;

    // if already answered, show result (rest of sentence only)
    if (aAnswered[aIndex] !== null) {
      const rest = item.reveal.slice(item.subject.length).trim();
      aInput.value = rest;
      aInput.placeholder = "";
      aInput.classList.add(aAnswered[aIndex] ? "correct" : "wrong");
      aInput.disabled = true;
      aLocked = true;
      aCheck.disabled = true;
      if (aAnswered[aIndex]) {
        aFeedback.className = "feedback success";
        aFeedback.textContent = "Correct ✓";
      } else {
        aFeedback.className = "feedback error";
        aFeedback.innerHTML = 'Answer: <span class="correct-reveal">' + item.reveal + "</span>";
      }
    }

    aInput.focus();
  }

  function checkA() {
    if (aLocked) return;
    const item = PART_A[aIndex];
    const user = normalize(aInput.value);
    if (!user) {
      aFeedback.className = "feedback info";
      aFeedback.textContent = "Type your answer first";
      return;
    }

    const ok = item.accept.some(a => normalize(a) === user);
    aLocked = true;
    aCheck.disabled = true;
    aInput.disabled = true;

    if (ok) {
      aInput.classList.add("correct");
      aFeedback.className = "feedback success";
      aFeedback.textContent = "Correct ✓";
      if (aAnswered[aIndex] === null) {
        aScore++;
        aScoreEl.textContent = aScore + " correct";
      }
      aAnswered[aIndex] = true;
    } else {
      aInput.classList.add("wrong");
      aFeedback.className = "feedback error";
      aFeedback.innerHTML = 'Not quite.<span class="correct-reveal">Answer: ' + item.reveal + "</span>";
      aAnswered[aIndex] = false;
    }

    // enable next
    aNext.disabled = false;

    // all done?
    if (aAnswered.every(x => x !== null)) {
      setTimeout(() => {
        aDone.classList.remove("hidden");
        aFinalScore.textContent = aScore + " / " + PART_A.length + " correct";
        const stars = awardStars(aScore, PART_A.length);
        renderStars(document.getElementById("aStars"), stars);
      }, 600);
      return;
    }

    // Auto-advance to the next question after a short pause
    setTimeout(() => {
      if (aIndex < PART_A.length - 1) {
        aIndex++;
        loadA();
      }
    }, 900);
  }

  function skipA() {
    if (aLocked) {
      // already checked — go next
      if (aIndex < PART_A.length - 1) {
        aIndex++;
        loadA();
      }
      return;
    }
    const item = PART_A[aIndex];
    aLocked = true;
    aInput.disabled = true;
    aCheck.disabled = true;
    aAnswered[aIndex] = false;
    aFeedback.className = "feedback info";
    aFeedback.innerHTML = 'Skipped.<span class="correct-reveal">Answer: ' + item.reveal + "</span>";
    aNext.disabled = false;

    if (aAnswered.every(x => x !== null)) {
      aDone.classList.remove("hidden");
      aFinalScore.textContent = aScore + " / " + PART_A.length + " correct";
      renderStars(document.getElementById("aStars"), awardStars(aScore, PART_A.length));
    }
  }

  aCheck.addEventListener("click", checkA);
  aSkip.addEventListener("click", skipA);
  aInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkA();
    }
  });

  aPrev.addEventListener("click", () => {
    if (aIndex > 0) {
      aIndex--;
      loadA();
    }
  });
  aNext.addEventListener("click", () => {
    if (aIndex < PART_A.length - 1) {
      aIndex++;
      loadA();
    }
  });

  aRestart.addEventListener("click", () => {
    aIndex = 0;
    aScore = 0;
    aAnswered = new Array(PART_A.length).fill(null);
    aDone.classList.add("hidden");
    loadA();
  });

  goToB.addEventListener("click", () => {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === "b"));
    partA.classList.add("hidden");
    partB.classList.remove("hidden");
  });

  // ----- Part B -----
  let bIndex = 0;
  let bScore = 0;
  let bAnswered = new Array(PART_B.length).fill(null); // true / false / null
  let bLocked = false;

  function isMobileB() {
    return window.matchMedia("(max-width: 520px)").matches;
  }

  function buildB() {
    bList.innerHTML = "";
    PART_B.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "b-item" + (i === 0 ? " b-active" : "");
      div.dataset.index = i;
      div.innerHTML = `
        <span class="b-sign ${item.sign === "+" ? "plus" : "minus"}">${item.sign}</span>
        <span style="font-weight:700;color:var(--muted);font-size:.8rem">Sentence ${i + 1}</span>
        <div class="b-sentence">
          <span>${item.before}</span>
          <input type="text" data-index="${i}" placeholder="verb…" autocomplete="off" spellcheck="false" autocapitalize="off">
          <span>${item.after}</span>
        </div>
      `;
      bList.appendChild(div);
    });
    updateBMobileUI();
  }

  function updateBMobileUI() {
    if (!isMobileB()) return;
    const items = bList.querySelectorAll(".b-item");
    items.forEach((el, i) => {
      el.classList.toggle("b-active", i === bIndex);
    });
    const counter = document.getElementById("bCounter");
    const bar = document.getElementById("bBar");
    const scoreEl = document.getElementById("bScoreEl");
    if (counter) counter.textContent = (bIndex + 1) + " / " + PART_B.length;
    if (bar) bar.style.width = ((bIndex + 1) / PART_B.length * 100) + "%";
    if (scoreEl) scoreEl.textContent = bScore + " correct";
    const prev = document.getElementById("bPrev");
    const next = document.getElementById("bNext");
    if (prev) prev.disabled = bIndex === 0;
    if (next) next.disabled = bIndex >= PART_B.length - 1;
    bLocked = bAnswered[bIndex] !== null;
  }

  function checkB() {
    // Desktop: check all
    const inputs = bList.querySelectorAll("input");
    let correct = 0;
    let filled = 0;

    inputs.forEach((inp, i) => {
      const val = normalize(inp.value);
      inp.classList.remove("correct", "wrong");
      if (!val) return;
      filled++;
      const ok = PART_B[i].accept.some(a => normalize(a) === val);
      if (ok) {
        inp.classList.add("correct");
        correct++;
      } else {
        inp.classList.add("wrong");
      }
    });

    if (filled < PART_B.length) {
      bFeedback.className = "feedback info";
      bFeedback.textContent = "Fill in all the blanks first.";
      return;
    }

    if (correct === PART_B.length) {
      bFeedback.className = "feedback success";
      bFeedback.textContent = "Perfect! All 8 correct ✓";
      const stars = awardStars(correct, PART_B.length);
      const bDone = document.getElementById("bDone");
      const bFinal = document.getElementById("bFinalScore");
      if (bDone) {
        bDone.classList.remove("hidden");
        if (bFinal) bFinal.textContent = correct + " / " + PART_B.length + " correct";
        renderStars(document.getElementById("bStars"), stars);
      }
    } else {
      bFeedback.className = "feedback error";
      bFeedback.textContent = correct + " / 8 correct — try fixing the red ones";
      awardStars(correct, PART_B.length);
    }
  }

  function checkBOne() {
    if (bLocked) return;
    const inp = bList.querySelector('.b-item.b-active input');
    if (!inp) return;
    const val = normalize(inp.value);
    inp.classList.remove("correct", "wrong");
    if (!val) {
      bFeedback.className = "feedback info";
      bFeedback.textContent = "Type a verb first.";
      return;
    }
    const ok = PART_B[bIndex].accept.some(a => normalize(a) === val);
    if (ok) {
      inp.classList.add("correct");
      bFeedback.className = "feedback success";
      bFeedback.textContent = "Correct! ✓";
      if (bAnswered[bIndex] !== true) {
        bScore++;
        bAnswered[bIndex] = true;
      }
    } else {
      inp.classList.add("wrong");
      bFeedback.className = "feedback error";
      bFeedback.textContent = "Try again — " + PART_B[bIndex].reveal;
      bAnswered[bIndex] = false;
    }
    bLocked = true;
    updateBMobileUI();
    // Auto-advance after short delay if correct
    if (ok && bIndex < PART_B.length - 1) {
      setTimeout(() => {
        bIndex++;
        bLocked = bAnswered[bIndex] !== null;
        updateBMobileUI();
        bFeedback.textContent = "";
        bFeedback.className = "feedback";
        const nextInp = bList.querySelector('.b-item.b-active input');
        if (nextInp) nextInp.focus();
      }, 700);
    } else if (ok && bIndex === PART_B.length - 1) {
      finishBMobile();
    }
  }

  function skipBOne() {
    bAnswered[bIndex] = false;
    bLocked = true;
    if (bIndex < PART_B.length - 1) {
      bIndex++;
      bLocked = bAnswered[bIndex] !== null;
      updateBMobileUI();
      bFeedback.textContent = "";
      bFeedback.className = "feedback";
    } else {
      finishBMobile();
    }
  }

  function finishBMobile() {
    const correct = bAnswered.filter(v => v === true).length;
    bFeedback.className = "feedback success";
    bFeedback.textContent = correct + " / " + PART_B.length + " correct";
    const stars = awardStars(correct, PART_B.length);
    const bDone = document.getElementById("bDone");
    const bFinal = document.getElementById("bFinalScore");
    if (bDone) {
      bDone.classList.remove("hidden");
      if (bFinal) bFinal.textContent = correct + " / " + PART_B.length + " correct";
      renderStars(document.getElementById("bStars"), stars);
    }
  }

  function resetB() {
    bList.querySelectorAll("input").forEach(inp => {
      inp.value = "";
      inp.classList.remove("correct", "wrong");
    });
    bFeedback.textContent = "";
    bFeedback.className = "feedback";
    bIndex = 0;
    bScore = 0;
    bAnswered = new Array(PART_B.length).fill(null);
    bLocked = false;
    updateBMobileUI();
    const bDone = document.getElementById("bDone");
    if (bDone) bDone.classList.add("hidden");
  }

  bCheck.addEventListener("click", checkB);
  bReset.addEventListener("click", resetB);

  const bCheckOne = document.getElementById("bCheckOne");
  const bSkipOne = document.getElementById("bSkipOne");
  const bPrev = document.getElementById("bPrev");
  const bNext = document.getElementById("bNext");
  if (bCheckOne) bCheckOne.addEventListener("click", checkBOne);
  if (bSkipOne) bSkipOne.addEventListener("click", skipBOne);
  if (bPrev) bPrev.addEventListener("click", () => {
    if (bIndex > 0) {
      bIndex--;
      bLocked = bAnswered[bIndex] !== null;
      updateBMobileUI();
      bFeedback.textContent = "";
    }
  });
  if (bNext) bNext.addEventListener("click", () => {
    if (bIndex < PART_B.length - 1) {
      bIndex++;
      bLocked = bAnswered[bIndex] !== null;
      updateBMobileUI();
      bFeedback.textContent = "";
    }
  });

  const bRestartBtn = document.getElementById("bRestart");
  if (bRestartBtn) {
    bRestartBtn.addEventListener("click", () => {
      resetB();
    });
  }

  window.addEventListener("resize", updateBMobileUI);

  // init
  loadA();
  buildB();
})();
