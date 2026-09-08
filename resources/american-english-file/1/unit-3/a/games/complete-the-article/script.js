(function () {
  const GAME_ID = "1-3a-complete-the-article";


  function showStarBurst(n) {
    n = Math.max(0, Math.min(3, Number(n) || 0));
    if (n <= 0) return;
    var existing = document.getElementById("starBurst");
    if (existing) existing.remove();
    var wrap = document.createElement("div");
    wrap.id = "starBurst";
    wrap.className = "star-burst stars celebrate";
    wrap.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= 3; i++) {
      var s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled pop" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = ((i - 1) * 0.18) + "s";
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(function () {
      wrap.classList.add("star-burst-out");
      setTimeout(function () { wrap.remove(); }, 500);
    }, 2200);
  }

  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    if (window.LAStars) {
      LAStars.recordPlay(gameId || GAME_ID);
      LAStars.saveFromAccuracy(gameId || GAME_ID, pct);
    }
    showStarBurst(stars);
    return stars;
  }

  const AUDIO_SRC = "audio/keela.mp3";

  // ---------- shared helpers ----------
  let selectedBlank = null;
  let currentAudio = null;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    $$(".play-btn.playing").forEach(b => b.classList.remove("playing"));
  }

  function playAudio(btn) {
    stopAudio();
    const a = new Audio(AUDIO_SRC);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {});
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      const st = $("#audioStatus");
      if (st) st.textContent = "Finished";
    };
    const st = $("#audioStatus");
    if (st) st.textContent = "Playing…";
  }

  function setStep(n) {
    $$(".step").forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.toggle("active", sn === n);
      s.classList.toggle("done", sn < n);
    });
  }

  function showPart(n) {
    $("#part1").classList.toggle("hidden", n !== 1);
    $("#part2").classList.toggle("hidden", n !== 2);
    $("#part3").classList.toggle("hidden", n !== 3);
    setStep(n);
    if (n === 3) shuffleChips($("#bank3"));
    if (n === 1) shuffleChips($("#bank1"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- blank interaction (click + drag & drop) ----------
  function placeWord(blank, bank, word, chip) {
    if (blank.dataset.value) {
      restoreChip(bank, blank.dataset.value);
    }
    blank.textContent = word;
    blank.dataset.value = word;
    blank.classList.add("filled");
    blank.classList.remove("selected", "correct", "wrong", "drag-over");
    if (chip) chip.classList.add("used");
    else {
      const c = $$(".chip", bank).find(x => x.dataset.word === word && !x.classList.contains("used"));
      if (c) c.classList.add("used");
    }
    selectedBlank = null;
    $$(".blank.selected").forEach(b => b.classList.remove("selected"));
  }

  function initBank(bankId, articleId) {
    const bank = $(bankId);
    const article = $(articleId);

    // click blank to select / clear
    $$(".blank", article).forEach(blank => {
      blank.addEventListener("click", () => {
        if (blank.classList.contains("filled") && blank.dataset.value) {
          restoreChip(bank, blank.dataset.value);
          blank.textContent = "";
          blank.classList.remove("filled", "correct", "wrong");
          delete blank.dataset.value;
        }
        $$(".blank.selected").forEach(b => b.classList.remove("selected"));
        blank.classList.add("selected");
        selectedBlank = blank;
      });

      // drag over blank
      blank.addEventListener("dragover", (e) => {
        e.preventDefault();
        blank.classList.add("drag-over");
      });
      blank.addEventListener("dragleave", () => blank.classList.remove("drag-over"));
      blank.addEventListener("drop", (e) => {
        e.preventDefault();
        blank.classList.remove("drag-over");
        const word = e.dataTransfer.getData("text/word");
        if (!word) return;
        placeWord(blank, bank, word, null);
      });
    });

    // chips: click + drag
    $$(".chip", bank).forEach(chip => {
      chip.setAttribute("draggable", "true");

      chip.addEventListener("dragstart", (e) => {
        if (chip.classList.contains("used")) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/word", chip.dataset.word);
        e.dataTransfer.effectAllowed = "move";
        chip.classList.add("dragging");
      });
      chip.addEventListener("dragend", () => chip.classList.remove("dragging"));

      chip.addEventListener("click", () => {
        if (chip.classList.contains("used")) return;
        if (!selectedBlank) {
          selectedBlank = $$(".blank", article).find(b => !b.classList.contains("filled"));
          if (!selectedBlank) return;
          selectedBlank.classList.add("selected");
        }
        placeWord(selectedBlank, bank, chip.dataset.word, chip);
      });
    });
  }

  function restoreChip(bank, word) {
    // find a used chip with this word and free it
    const chip = $$( ".chip.used", bank).find(c => c.dataset.word === word);
    if (chip) chip.classList.remove("used");
  }

  function shuffleChips(bank) {
    if (!bank) return;
    const arr = $$(".chip", bank);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    arr.forEach(c => bank.appendChild(c));
  }

  function resetPart(bankId, articleId, feedbackId, afterId) {
    const bank = $(bankId);
    const article = $(articleId);
    $$( ".chip", bank).forEach(c => c.classList.remove("used"));
    $$( ".blank", article).forEach(b => {
      b.textContent = "";
      b.classList.remove("filled", "correct", "wrong", "selected");
      delete b.dataset.value;
    });
    if (feedbackId) {
      $(feedbackId).textContent = "";
      $(feedbackId).className = "feedback";
    }
    if (afterId) $(afterId).classList.add("hidden");
    selectedBlank = null;
  }

  function checkBlanks(articleId, feedbackId, afterId) {
    const blanks = $$( ".blank", $(articleId));
    let allFilled = true;
    let allCorrect = true;
    let correctCount = 0;

    blanks.forEach(b => {
      b.classList.remove("correct", "wrong");
      const val = (b.dataset.value || "").trim().toLowerCase();
      const ans = b.dataset.answer.trim().toLowerCase();
      if (!val) {
        allFilled = false;
        allCorrect = false;
        return;
      }
      if (val === ans) {
        b.classList.add("correct");
        correctCount++;
      } else {
        b.classList.add("wrong");
        allCorrect = false;
      }
    });

    const fb = $(feedbackId);
    const after = $(afterId);

    if (!allFilled) {
      fb.className = "feedback info";
      fb.textContent = "Please fill in all the blanks first.";
      after.classList.add("hidden");
      return false;
    }

    if (allCorrect) {
      fb.className = "feedback success";
      fb.textContent = "Perfect! All correct ✓";
      // count filled correct - approximate full score on perfect
      awardStars(GAME_ID, 1, 1);
      after.classList.add("hidden");
      return true;
    } else {
      fb.className = "feedback error";
      fb.textContent = correctCount + " correct · " + (blanks.length - correctCount) + " to fix";
      after.classList.remove("hidden");
      return false;
    }
  }

  // ---------- Part 1 ----------
  initBank("#bank1", "#article1");
  shuffleChips($("#bank1"));

  $("#check1").addEventListener("click", () => {
    const ok = checkBlanks("#article1", "#feedback1", "#afterCheck1");
    if (ok) {
      // short delay then offer to continue
      setTimeout(() => {
        $("#afterCheck1").classList.remove("hidden");
        $("#tryAgain1").classList.add("hidden");
        $("#listen1").textContent = "Listen and continue →";
      }, 400);
    } else {
      $("#tryAgain1").classList.remove("hidden");
      $("#listen1").textContent = "Listen and check";
    }
  });

  $("#tryAgain1").addEventListener("click", () => {
    // only clear wrong ones
    $$( ".blank.wrong", $("#article1")).forEach(b => {
      if (b.dataset.value) restoreChip($("#bank1"), b.dataset.value);
      b.textContent = "";
      b.classList.remove("filled", "wrong");
      delete b.dataset.value;
    });
    $("#feedback1").textContent = "";
    $("#feedback1").className = "feedback";
    $("#afterCheck1").classList.add("hidden");
  });

  $("#listen1").addEventListener("click", () => {
    // reveal answers
    $$( ".blank", $("#article1")).forEach(b => {
      b.textContent = b.dataset.answer;
      b.dataset.value = b.dataset.answer;
      b.classList.add("filled", "correct");
      b.classList.remove("wrong");
    });
    // mark all chips used
    $$( ".chip", $("#bank1")).forEach(c => c.classList.add("used"));
    showPart(2);
    // auto play
    setTimeout(() => playAudio($("#playAudio")), 400);
  });

  // ---------- Part 2 ----------
  $("#playAudio").addEventListener("click", () => playAudio($("#playAudio")));
  $("#toPart3").addEventListener("click", () => {
    stopAudio();
    showPart(3);
  });

  // ---------- Part 3 ----------
  initBank("#bank3", "#article3");
  shuffleChips($("#bank3"));

  $("#check3").addEventListener("click", () => {
    const ok = checkBlanks("#article3", "#feedback3", "#afterCheck3");
    if (ok) {
      $("#finalMsg").classList.remove("hidden");
      $("#afterCheck3").classList.add("hidden");
    } else {
      $("#tryAgain3").classList.remove("hidden");
      $("#listen3").textContent = "Listen and check";
    }
  });

  $("#tryAgain3").addEventListener("click", () => {
    $$( ".blank.wrong", $("#article3")).forEach(b => {
      if (b.dataset.value) restoreChip($("#bank3"), b.dataset.value);
      b.textContent = "";
      b.classList.remove("filled", "wrong");
      delete b.dataset.value;
    });
    $("#feedback3").textContent = "";
    $("#feedback3").className = "feedback";
    $("#afterCheck3").classList.add("hidden");
  });

  $("#listen3").addEventListener("click", () => {
    // reveal all
    $$( ".blank", $("#article3")).forEach(b => {
      b.textContent = b.dataset.answer;
      b.dataset.value = b.dataset.answer;
      b.classList.add("filled", "correct");
      b.classList.remove("wrong");
    });
    $$( ".chip", $("#bank3")).forEach(c => c.classList.add("used"));
    $("#feedback3").className = "feedback success";
    $("#feedback3").textContent = "Here are the correct verbs.";
    $("#afterCheck3").classList.add("hidden");
    $("#finalMsg").classList.remove("hidden");
    playAudio();
  });

  $("#restartAll").addEventListener("click", () => {
    stopAudio();
    resetPart("#bank1", "#article1", "#feedback1", "#afterCheck1");
    resetPart("#bank3", "#article3", "#feedback3", "#afterCheck3");
    $("#finalMsg").classList.add("hidden");
    $("#tryAgain1").classList.remove("hidden");
    showPart(1);
  });

  // start
  showPart(1);
})();
