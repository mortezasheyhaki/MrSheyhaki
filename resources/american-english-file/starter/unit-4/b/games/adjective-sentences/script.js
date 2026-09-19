/* Adjective Sentences — AEF Starter Unit 4B
   Modes: Picture → Sentence | Word order
*/
(function () {
  "use strict";

  const GAME_ID = "starter-4b-adjective-sentences";

  const WRITE_ITEMS = [
    {
      adj: "old",
      img: "images/01.png",
      model: "It's an old car.",
      answers: ["it's an old car", "it is an old car"],
      audio: "audio/01-old-car.mp3",
    },
    {
      adj: "black",
      img: "images/02.png",
      model: "They're black coats.",
      answers: [
        "they're black coats", "they are black coats",
        "they're black jackets", "they are black jackets",
        "they're black blazers", "they are black blazers",
      ],
      audio: "audio/02-black-coats.mp3",
    },
    {
      adj: "new",
      img: "images/03.png",
      model: "It's a new phone.",
      answers: [
        "it's a new phone", "it is a new phone",
        "it's a new mobile", "it is a new mobile",
      ],
      audio: "audio/03-new-phone.mp3",
    },
    {
      adj: "big",
      img: "images/04.png",
      model: "They're big houses.",
      answers: [
        "they're big houses", "they are big houses",
        "they're big homes", "they are big homes",
      ],
      audio: "audio/04-big-houses.mp3",
    },
    {
      adj: "expensive",
      img: "images/05.png",
      model: "They're expensive sunglasses.",
      answers: [
        "they're expensive sunglasses", "they are expensive sunglasses",
        "they're expensive glasses", "they are expensive glasses",
      ],
      audio: "audio/05-expensive-sunglasses.mp3",
    },
    {
      adj: "good",
      img: "images/06.png",
      model: "It's a good book.",
      answers: ["it's a good book", "it is a good book"],
      audio: "audio/06-good-book.mp3",
    },
    {
      adj: "great",
      img: "images/07-great.png",
      model: "It's a great restaurant.",
      answers: [
        "it's a great restaurant", "it is a great restaurant",
      ],
      audio: "audio/07-great-restaurant.mp3",
    },
  ];

  // AEF Starter 4B — order the words (12 sentences) + audio after check
  const ORDER_ITEMS = [
    {
      words: ["It's", "a", "beautiful", "day"],
      answer: "It's a beautiful day.",
      audio: "https://cdn.imgurl.ir/uploads/y679307_1_It39s_a_beautiful_day.mp3",
    },
    {
      words: ["Amy's", "husband", "is", "very", "nice"],
      answer: "Amy's husband is very nice.",
      audio: "https://cdn.imgurl.ir/uploads/a72343_2_Amys_husb.mp3",
    },
    {
      words: ["They're", "very", "difficult", "questions"],
      answer: "They're very difficult questions.",
      audio: "https://cdn.imgurl.ir/uploads/l704536_3_Theyre_ve.mp3",
    },
    {
      words: ["This", "is", "a", "cheap", "phone"],
      answer: "This is a cheap phone.",
      audio: "https://cdn.imgurl.ir/uploads/c79783_4_This_is_a_cheap_phone..mp3",
    },
    {
      words: ["It's", "a", "terrible", "photo"],
      answer: "It's a terrible photo.",
      audio: "https://cdn.imgurl.ir/uploads/g68354_5_Its_a_ter.mp3",
    },
    {
      words: ["Natsuko", "is", "a", "fantastic", "teacher"],
      answer: "Natsuko is a fantastic teacher.",
      audio: "https://cdn.imgurl.ir/uploads/g02459_6_Natsuko_is.mp3",
    },
    {
      words: ["Our", "cat", "is", "very", "old"],
      answer: "Our cat is very old.",
      audio: "https://cdn.imgurl.ir/uploads/201526_7_Our_cat_is_very_old..mp3",
    },
    {
      words: ["This", "restaurant", "isn't", "very", "good"],
      answer: "This restaurant isn't very good.",
      audio: "https://cdn.imgurl.ir/uploads/h664798_8_This_restaurant_isnt_very_good..mp3",
    },
    {
      words: ["It's", "a", "very", "long", "exercise"],
      answer: "It's a very long exercise.",
      audio: "https://cdn.imgurl.ir/uploads/o6823_9_Its_a_ver.mp3",
    },
    {
      words: ["Their", "dog", "is", "very", "ugly"],
      answer: "Their dog is very ugly.",
      audio: "https://cdn.imgurl.ir/uploads/219109_10_Their_dog.mp3",
    },
    {
      words: ["Japanese", "movie", "tickets", "are", "very", "expensive"],
      answer: "Japanese movie tickets are very expensive.",
      audio: "https://cdn.imgurl.ir/uploads/t0319_11_Japanese_m.mp3",
    },
    {
      words: ["This", "is", "a", "very", "small", "room"],
      answer: "This is a very small room.",
      audio: "https://cdn.imgurl.ir/uploads/j281887_12_This_is_a-2.mp3",
    },
  ];

  let mode = "write";
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let placed = [];
  let currentSentenceAudio = null;

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const modeLabel = $("modeLabel");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const sceneImg = $("sceneImg");
  const adjBadge = $("adjBadge");
  const adjPill = $("adjPill");
  const adjBar = $("adjBar");
  const writePanel = $("writePanel");
  const orderPanel = $("orderPanel");
  const answerInput = $("answerInput");
  const feedback = $("feedback");
  const checkBtn = $("checkBtn");
  const actionRow = $("actionRow");
  const answerSlots = $("answerSlots");
  const chipBank = $("chipBank");
  const orderFeedback = $("orderFeedback");
  const clearChipsBtn = $("clearChipsBtn");
  const checkOrderBtn = $("checkOrderBtn");
  const orderActions = $("orderActions");
  const endOverlay = $("endOverlay");
  const endEmoji = $("endEmoji");
  const endTitle = $("endTitle");
  const endMsg = $("endMsg");
  const picWrap = document.querySelector(".pic-wrap");

  // SFX
  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function playTone(freq, duration, type, volume) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume || 0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }
  function playSuccess() {
    playTone(523.25, 0.12, "sine", 0.16);
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.16), 90);
    setTimeout(() => playTone(783.99, 0.22, "sine", 0.18), 180);
  }
  function playError() {
    playTone(180, 0.18, "triangle", 0.12);
    setTimeout(() => playTone(140, 0.22, "triangle", 0.1), 120);
  }
  function playClick() { playTone(660, 0.05, "sine", 0.08); }
  function playVictory() {
    const notes = [
      [523.25, 0], [659.25, 120], [783.99, 240], [1046.5, 360],
      [783.99, 520], [1046.5, 640], [1318.51, 800],
    ];
    notes.forEach(([f, d]) => setTimeout(() => playTone(f, 0.28, "sine", 0.17), d));
    setTimeout(() => {
      playTone(523.25, 0.5, "sine", 0.1);
      playTone(659.25, 0.5, "sine", 0.1);
      playTone(783.99, 0.5, "sine", 0.12);
    }, 980);
  }

  function spawnParticles(el) {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#a855f7"];
    const rect = el.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "particles";
    document.body.appendChild(layer);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 70;
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.width = 5 + Math.random() * 6 + "px";
      p.style.height = p.style.width;
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 900);
  }

  function spawnConfetti() {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#eab308", "#f43f5e"];
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.width = 6 + Math.random() * 6 + "px";
      p.style.height = 8 + Math.random() * 8 + "px";
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      p.style.animationDelay = Math.random() * 0.4 + "s";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 3200);
  }

  function shakeScreen() {
    const el = $("app");
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() { return order[index]; }

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function showStart() {
    startScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    endOverlay.hidden = true;
  }

  function startMode(m) {
    if (window.LAFinish) LAFinish.startTimer();
    mode = m;
    order = shuffle(m === "write" ? WRITE_ITEMS : ORDER_ITEMS);
    index = 0;
    score = 0;
    locked = false;
    placed = [];

    modeLabel.textContent = m === "write" ? "1 · Picture → Sentence" : "2 · Word order";
    writePanel.classList.toggle("hidden", m !== "write");
    orderPanel.classList.toggle("hidden", m !== "order");
    if (picWrap) picWrap.style.display = m === "write" ? "" : "none";
    if (adjBar) adjBar.classList.toggle("hidden", m !== "write");

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    endOverlay.hidden = true;
    renderRound();
  }

  function renderRound() {
    locked = false;
    placed = [];
    const item = current();
    if (!item) {
      showEnd();
      return;
    }

    qProgress.textContent = index + 1 + "/" + order.length;
    scoreText.textContent = score;

    if (mode === "write") {
      sceneImg.src = item.img;
      sceneImg.alt = item.adj;
      adjBadge.textContent = item.adj;
      if (adjPill) adjPill.textContent = item.adj;
      answerInput.value = "";
      answerInput.disabled = false;
      answerInput.classList.remove("correct", "wrong");
      feedback.hidden = true;
      actionRow.hidden = false;
      checkBtn.disabled = true;
      setTimeout(() => answerInput.focus(), 200);
    } else {
      answerSlots.innerHTML = "";
      answerSlots.classList.remove("correct", "wrong");
      orderFeedback.hidden = true;
      orderActions.hidden = false;
      checkOrderBtn.disabled = true;
      chipBank.innerHTML = "";
      shuffle(item.words.map((w, i) => ({ w, i }))).forEach((entry, bankIdx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.textContent = entry.w;
        btn.dataset.word = entry.w;
        btn.dataset.bankIdx = String(bankIdx);
        btn.addEventListener("click", () => pickChip(btn));
        chipBank.appendChild(btn);
      });
    }
  }

  function checkWrite() {
    if (locked || mode !== "write") return;
    locked = true;
    const item = current();
    const ok = item.answers.some((a) => normalize(answerInput.value) === normalize(a));

    answerInput.disabled = true;
    actionRow.hidden = true;

    if (ok) {
      score++;
      scoreText.textContent = score;
      answerInput.classList.add("correct");
      feedback.hidden = false;
      feedback.className = "feedback ok";
      feedback.textContent = "✓ " + item.model;
      playSuccess();
      spawnParticles(answerInput);
    } else {
      answerInput.classList.add("wrong");
      feedback.hidden = false;
      feedback.className = "feedback bad";
      feedback.textContent = "✗ " + item.model;
      playError();
      shakeScreen();
    }
    playSentenceAudio(item);
    setTimeout(advance, 2200);
  }

  function pickChip(btn) {
    if (locked || btn.classList.contains("used")) return;
    const item = current();
    if (placed.length >= item.words.length) return;
    playClick();
    const word = btn.dataset.word;
    const bankIdx = parseInt(btn.dataset.bankIdx, 10);
    placed.push({ word, bankIdx });
    btn.classList.add("used");
    const chip = document.createElement("div");
    chip.className = "slot-chip";
    chip.textContent = word;
    chip.dataset.bankIdx = String(bankIdx);
    chip.addEventListener("click", () => removeChip(chip));
    answerSlots.appendChild(chip);
    checkOrderBtn.disabled = placed.length !== item.words.length;
  }

  function removeChip(chipEl) {
    if (locked) return;
    const bankIdx = chipEl.dataset.bankIdx;
    chipEl.remove();
    const bankBtn = chipBank.querySelector(`.chip[data-bank-idx="${bankIdx}"]`);
    if (bankBtn) bankBtn.classList.remove("used");
    placed = Array.from(answerSlots.querySelectorAll(".slot-chip")).map((c) => ({
      word: c.textContent,
      bankIdx: parseInt(c.dataset.bankIdx, 10),
    }));
    const item = current();
    checkOrderBtn.disabled = !item || placed.length !== item.words.length;
  }

  function clearChips() {
    if (locked) return;
    placed = [];
    answerSlots.innerHTML = "";
    answerSlots.classList.remove("correct", "wrong");
    chipBank.querySelectorAll(".chip").forEach((b) => b.classList.remove("used"));
    orderFeedback.hidden = true;
    checkOrderBtn.disabled = true;
  }


  function stopSentenceAudio() {
    if (currentSentenceAudio) {
      try {
        currentSentenceAudio.pause();
        currentSentenceAudio.currentTime = 0;
      } catch (e) {}
      currentSentenceAudio = null;
    }
  }

  function playSentenceAudio(item) {
    stopSentenceAudio();
    if (!item || !item.audio) return;
    try {
      currentSentenceAudio = new Audio(item.audio);
      currentSentenceAudio.play().catch(function () {});
    } catch (e) {}
  }

  function checkOrder() {
    if (locked || mode !== "order") return;
    locked = true;
    const item = current();
    const user = placed.map((p) => p.word);
    const ok = user.length === item.words.length && user.every((w, i) => w === item.words[i]);

    chipBank.querySelectorAll(".chip").forEach((b) => b.classList.add("locked"));
    answerSlots.querySelectorAll(".slot-chip").forEach((c) => c.classList.add("locked"));
    orderActions.hidden = true;

    if (ok) {
      score++;
      scoreText.textContent = score;
      answerSlots.classList.add("correct");
      orderFeedback.hidden = false;
      orderFeedback.className = "feedback ok";
      orderFeedback.textContent = "✓ " + item.answer;
      playSuccess();
      spawnParticles(answerSlots);
    } else {
      answerSlots.classList.add("wrong");
      orderFeedback.hidden = false;
      orderFeedback.className = "feedback bad";
      orderFeedback.textContent = "✗ " + item.answer;
      playError();
      shakeScreen();
    }
    // Play the model sentence after feedback
    playSentenceAudio(item);
    // Longer delay so audio can play before next item
    setTimeout(advance, 2200);
  }

  function advance() {
    index++;
    if (index >= order.length) showEnd();
    else renderRound();
  }

  function showEnd() {
    // LAStars + LAFinish
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID + '-' + mode);
        LAStars.saveFromAccuracy(GAME_ID + '-' + mode, order.length ? (score / order.length) * 100 : 0);
      }
    } catch (e) {}
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID + '-' + mode,
          score: score,
          total: order.length,
          timeMs: timeMs,
          onAgain: () => startMode(mode),
          onModes: () => showStart(),
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }

    playVictory();
    spawnConfetti();
    const total = order.length;
    if (typeof window.laStars === "function") {
      try { window.laStars(GAME_ID + "-" + mode, score, total); } catch (e) {}
    }
    if (score === total) {
      endEmoji.textContent = "🎉";
      endTitle.textContent = "Perfect!";
      endMsg.textContent = "You got all " + total + " right!";
    } else if (score >= total * 0.7) {
      endEmoji.textContent = "👍";
      endTitle.textContent = "Great job!";
      endMsg.textContent = "You got " + score + " out of " + total + ".";
    } else {
      endEmoji.textContent = "💪";
      endTitle.textContent = "Keep practicing!";
      endMsg.textContent = "You got " + score + " out of " + total + ". Try again!";
    }
    endOverlay.hidden = false;
  }

  $("modeWrite").addEventListener("click", () => startMode("write"));
  $("modeOrder").addEventListener("click", () => startMode("order"));
  $("backHome").addEventListener("click", showStart);
  $("againBtn").addEventListener("click", () => startMode(mode));
  $("homeModesBtn").addEventListener("click", showStart);

  answerInput.addEventListener("input", () => {
    if (locked) return;
    checkBtn.disabled = answerInput.value.trim().length === 0;
  });
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !checkBtn.disabled && !locked) {
      e.preventDefault();
      checkWrite();
    }
  });
  checkBtn.addEventListener("click", checkWrite);
  clearChipsBtn.addEventListener("click", clearChips);
  checkOrderBtn.addEventListener("click", checkOrder);
})();
