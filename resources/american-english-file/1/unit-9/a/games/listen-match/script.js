/* =========================================================
   LISTEN & MATCH — Unit 9A (two parts)
   American English File 1 · #mydinnerlastnight · 9.04
   Mr. Sheyhaki
   ========================================================= */

(function () {
  "use strict";

  const AUDIO_URL = "audio/9.04.mp3";
  const GAME_ID = "1-9a-listen-match";

  // ---------- PART 1 data ----------
  // Picture letter → description number
  const PART1_CORRECT = { A: 4, B: 1, C: 2, D: 3 };

  const PICTURES = [
    { id: "A", label: "A", hint: "Big roast turkey dinner with many side dishes" },
    { id: "B", label: "B", hint: "Lettuce, onions and mushrooms in a large pan" },
    { id: "C", label: "C", hint: "Chicken salad in a take-out container" },
    { id: "D", label: "D", hint: "Eggs in tomato sauce (shakshuka)" }
  ];

  const DESCRIPTIONS = [
    { id: 1, text: "something that the person cooked" },
    { id: 2, text: "take-out food that the person ordered" },
    { id: 3, text: "something that the person ate in a restaurant" },
    { id: 4, text: "something that the person’s mother cooked" }
  ];

  // ---------- PART 2 data ----------
  // Topic key → speaker number
  const PART2_CORRECT = {
    prepare: 1,
    restaurant: 2,
    dish: 3,
    special: 4
  };

  const SPEAKERS = [
    { id: 1, label: "1" },
    { id: 2, label: "2" },
    { id: 3, label: "3" },
    { id: 4, label: "4" }
  ];

  const TOPICS = [
    { id: "prepare", text: "ways of preparing something" },
    { id: "restaurant", text: "a good restaurant near their house" },
    { id: "dish", text: "a dish with two main ingredients" },
    { id: "special", text: "a meal for a special occasion" }
  ];

  // ---------- STATE ----------
  let part = 1;
  let selectedLeft = null;   // picture id or speaker id
  let matched1 = {};         // { A: 4, ... }
  let matched2 = {};         // { prepare: 1, ... }
  let isPlaying = false;

  // Shuffled display order (randomized once per game)
  let picsOrder = [];
  let descsOrder = [];
  let speakersOrder = [];
  let topicsOrder = [];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ---------- DOM ----------
  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const visualizer = document.getElementById("visualizer");
  const audioHint = document.getElementById("audioHint");
  const partNumEl = document.getElementById("partNum");
  const matchedCountEl = document.getElementById("matchedCount");
  const instruction = document.getElementById("instruction");
  const feedbackEl = document.getElementById("feedback");
  const nextPartBtn = document.getElementById("nextPartBtn");
  const successOverlay = document.getElementById("successOverlay");
  const successContinue = document.getElementById("successContinue");
  const tab1 = document.getElementById("tab1");
  const tab2 = document.getElementById("tab2");
  const part1El = document.getElementById("part1");
  const part2El = document.getElementById("part2");
  const picsGrid = document.getElementById("picsGrid");
  const descsGrid = document.getElementById("descsGrid");
  const speakersGrid = document.getElementById("speakersGrid");
  const topicsGrid = document.getElementById("topicsGrid");
  const dots1 = document.getElementById("dots1");
  const dots2 = document.getElementById("dots2");

  const audio = new Audio(AUDIO_URL);
  audio.preload = "auto";

  // ---------- HELPERS ----------
  function showFeedback(type, msg) {
    feedbackEl.hidden = false;
    feedbackEl.className = "feedback " + type;
    feedbackEl.textContent = msg;
  }
  function hideFeedback() {
    feedbackEl.hidden = true;
  }

  function updateStats() {
    partNumEl.textContent = String(part);
    if (part === 1) {
      matchedCountEl.textContent = Object.keys(matched1).length + "/4";
    } else {
      matchedCountEl.textContent = Object.keys(matched2).length + "/4";
    }
  }

  function updateDots(container, matchedCount) {
    const spans = container.querySelectorAll("span");
    spans.forEach((s, i) => {
      s.className = "";
      if (i < matchedCount) s.classList.add("done");
      else if (i === matchedCount) s.classList.add("current");
    });
  }

  // ---------- RENDER PART 1 ----------
  function renderPart1() {
    picsGrid.innerHTML = "";
    descsGrid.innerHTML = "";

    picsOrder.forEach(p => {
      const card = document.createElement("div");
      card.className = "pic-card";
      card.dataset.id = p.id;
      if (matched1[p.id]) card.classList.add("matched");
      if (selectedLeft === p.id) card.classList.add("selected");
      card.innerHTML = `
        <img src="images/${p.id}.png" alt="Photo ${p.label}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <div class="pic-desc" style="display:none;padding:12px;color:#64748b;font-size:0.85rem">${p.hint}</div>
        <div class="pic-meta">
          <span class="pic-letter">${p.label}</span>
          <strong>Photo ${p.label}</strong>
        </div>
      `;
      if (!matched1[p.id]) {
        card.addEventListener("click", () => selectLeft(p.id));
      }
      picsGrid.appendChild(card);
    });

    descsOrder.forEach(d => {
      const used = Object.values(matched1).includes(d.id);
      const card = document.createElement("div");
      card.className = "desc-card";
      card.dataset.id = d.id;
      if (used) card.classList.add("matched");
      card.innerHTML = `<span class="desc-num">${d.id}</span>${d.text}`;
      if (!used) {
        card.addEventListener("click", () => selectRightDesc(d.id));
      }
      descsGrid.appendChild(card);
    });

    updateDots(dots1, Object.keys(matched1).length);
    updateStats();
  }

  // ---------- RENDER PART 2 ----------
  function renderPart2() {
    speakersGrid.innerHTML = "";
    topicsGrid.innerHTML = "";

    speakersOrder.forEach(s => {
      const used = Object.values(matched2).includes(s.id);
      const card = document.createElement("div");
      card.className = "who-card";
      card.dataset.id = s.id;
      if (used) card.classList.add("matched");
      if (selectedLeft === s.id) card.classList.add("selected");
      card.innerHTML = `<span class="who-speaker">${s.label}</span><strong>Speaker ${s.label}</strong>`;
      if (!used) {
        card.addEventListener("click", () => selectLeft(s.id));
      }
      speakersGrid.appendChild(card);
    });

    topicsOrder.forEach(t => {
      const used = matched2[t.id] != null;
      const card = document.createElement("div");
      card.className = "desc-card";
      card.dataset.id = t.id;
      if (used) card.classList.add("matched");
      card.innerHTML = t.text;
      if (!used) {
        card.addEventListener("click", () => selectRightTopic(t.id));
      }
      topicsGrid.appendChild(card);
    });

    updateDots(dots2, Object.keys(matched2).length);
    updateStats();
  }

  // ---------- SELECTION LOGIC ----------
  function selectLeft(id) {
    selectedLeft = id;
    hideFeedback();
    if (part === 1) renderPart1();
    else renderPart2();
  }

  function selectRightDesc(descId) {
    if (selectedLeft == null) {
      showFeedback("info", "First tap a photo (A–D).");
      return;
    }
    const pic = selectedLeft;
    const correct = PART1_CORRECT[pic] === descId;

    if (correct) {
      matched1[pic] = descId;
      selectedLeft = null;
      hideFeedback();
      renderPart1();

      if (Object.keys(matched1).length === 4) {
        showFeedback("success", "Perfect! All pictures matched.");
        nextPartBtn.hidden = false;
        tab1.classList.add("done");
        tab2.disabled = false;
      }
    } else {
      // flash wrong
      const picEl = picsGrid.querySelector(`[data-id="${pic}"]`);
      const descEl = descsGrid.querySelector(`[data-id="${descId}"]`);
      if (picEl) picEl.classList.add("wrong");
      if (descEl) descEl.classList.add("wrong");
      showFeedback("error", "Not quite. Try again!");
      setTimeout(() => {
        if (picEl) picEl.classList.remove("wrong");
        if (descEl) descEl.classList.remove("wrong");
      }, 400);
      selectedLeft = null;
      renderPart1();
    }
  }

  function selectRightTopic(topicId) {
    if (selectedLeft == null) {
      showFeedback("info", "First tap a speaker (1–4).");
      return;
    }
    const speaker = selectedLeft;
    const correct = PART2_CORRECT[topicId] === speaker;

    if (correct) {
      matched2[topicId] = speaker;
      selectedLeft = null;
      hideFeedback();
      renderPart2();

      if (Object.keys(matched2).length === 4) {
        try {
          if (window.LAStars) {
            LAStars.recordPlay(GAME_ID);
            LAStars.saveFromAccuracy(GAME_ID, 100);
          }
        } catch (e) {}
        setTimeout(() => {
          successOverlay.classList.add("is-visible");
        }, 300);
      }
    } else {
      const spEl = speakersGrid.querySelector(`[data-id="${speaker}"]`);
      const topEl = topicsGrid.querySelector(`[data-id="${topicId}"]`);
      if (spEl) spEl.classList.add("wrong");
      if (topEl) topEl.classList.add("wrong");
      showFeedback("error", "Not quite. Try again!");
      setTimeout(() => {
        if (spEl) spEl.classList.remove("wrong");
        if (topEl) topEl.classList.remove("wrong");
      }, 400);
      selectedLeft = null;
      renderPart2();
    }
  }

  // ---------- NAV ----------
  function goToPart2() {
    part = 2;
    selectedLeft = null;
    hideFeedback();
    nextPartBtn.hidden = true;
    part1El.hidden = true;
    part2El.hidden = false;
    tab1.classList.remove("active");
    tab2.classList.add("active");
    tab2.disabled = false;
    instruction.textContent =
      "Listen again. Match each speaker (1–4) to the topic they talk about.";
    renderPart2();
    updateStats();
  }

  nextPartBtn.addEventListener("click", goToPart2);
  tab2.addEventListener("click", () => {
    if (Object.keys(matched1).length === 4) goToPart2();
  });

  successContinue.addEventListener("click", () => {
    if (history.length > 1) history.back(); else window.location.href = "../../";
  });

  // ---------- AUDIO ----------
  function setPlayingUI(playing) {
    isPlaying = playing;
    if (playing) {
      playIcon.hidden = true;
      visualizer.hidden = false;
      playBtn.classList.add("playing");
    } else {
      playIcon.hidden = false;
      visualizer.hidden = true;
      playBtn.classList.remove("playing");
    }
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingUI(false);
      return;
    }
    setPlayingUI(true);
    audio.currentTime = 0;
    audio.play().catch(() => {
      setPlayingUI(false);
      showFeedback("error", "Could not play audio.");
    });
  });

  audio.addEventListener("ended", () => setPlayingUI(false));
  audio.addEventListener("error", () => {
    setPlayingUI(false);
    showFeedback("error", "Audio failed to load.");
  });

  // ---------- INIT ----------
  picsOrder = shuffle(PICTURES);
  descsOrder = shuffle(DESCRIPTIONS);
  speakersOrder = shuffle(SPEAKERS);
  topicsOrder = shuffle(TOPICS);

  renderPart1();
  updateStats();
})();
