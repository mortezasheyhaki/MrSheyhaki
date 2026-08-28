(function () {
  "use strict";
  const ITEMS = [
    { id: "black", answers: ["black"], img: "../images/black.png", audio: "../audio/black.mp3" },
    { id: "blue", answers: ["blue"], img: "../images/blue.png", audio: "../audio/blue.mp3" },
    { id: "brown", answers: ["brown"], img: "../images/brown.png", audio: "../audio/brown.mp3" },
    { id: "green", answers: ["green"], img: "../images/green.png", audio: "../audio/green.mp3" },
    { id: "grey", answers: ["grey", "gray"], img: "../images/grey.png", audio: "../audio/grey.mp3" },
    { id: "orange", answers: ["orange"], img: "../images/orange.png", audio: "../audio/orange.mp3" },
    { id: "pink", answers: ["pink"], img: "../images/pink.png", audio: "../audio/pink.mp3" },
    { id: "red", answers: ["red"], img: "../images/red.png", audio: "../audio/red.mp3" },
    { id: "white", answers: ["white"], img: "../images/white.png", audio: "../audio/white.mp3" },
    { id: "yellow", answers: ["yellow"], img: "../images/yellow.png", audio: "../audio/yellow.mp3" },
  ];
  const GAME_ID = "vocab-colors-dictation";
  const $ = (id) => document.getElementById(id);

  let order = [];
  let idx = 0;
  let score = 0;
  let correct = 0;
  let attempts = 0;
  let locked = false;
  let currentAudio = null;

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function show(s) {
    const start = $("startScreen");
    const game = $("gameScreen");
    const end = $("endScreen");
    if (start) start.hidden = s !== "start";
    if (game) game.hidden = s !== "game";
    if (end) end.hidden = s !== "end";
    if (s === "end" && end) {
      end.removeAttribute("hidden");
      end.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setFb(msg, type) {
    const fb = $("feedback");
    if (!fb) return;
    fb.textContent = msg || "";
    fb.className = "feedback" + (type ? " " + type : "");
  }

  function playSrc(src) {
    const btn = $("playAudioBtn");
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (e) {}
      currentAudio = null;
    }
    if (btn) btn.classList.remove("is-playing");
    const a = new Audio(src);
    currentAudio = a;
    if (btn) btn.classList.add("is-playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("is-playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function render() {
    locked = false;
    const item = ITEMS[order[idx]];
    if ($("sceneImg")) {
      $("sceneImg").src = item.img;
      $("sceneImg").decoding = "async";
      $("sceneImg").alt = item.id;
    }
    if ($("typeInput")) {
      $("typeInput").value = "";
      $("typeInput").classList.remove("wrong", "correct");
    }
    if ($("checkBtn")) $("checkBtn").disabled = true;
    setFb("", "");
    if ($("itemText")) $("itemText").textContent = idx + 1 + " / " + order.length;
    if ($("scoreText")) $("scoreText").textContent = String(score);
    if ($("correctText")) $("correctText").textContent = String(correct);
    setTimeout(() => {
      if ($("typeInput")) $("typeInput").focus();
    }, 50);
  }

  function check() {
    if (locked) return;
    const item = ITEMS[order[idx]];
    const user = norm($("typeInput") ? $("typeInput").value : "");
    if (!user) return;
    locked = true;
    attempts++;
    if ($("checkBtn")) $("checkBtn").disabled = true;
    const ok = item.answers.some((a) => norm(a) === user);
    if (ok) {
      correct++;
      score += 100;
      setFb("Correct!", "ok");
      if ($("typeInput")) $("typeInput").classList.add("correct");
      if ($("scoreText")) $("scoreText").textContent = String(score);
      if ($("correctText")) $("correctText").textContent = String(correct);
      // Play the color audio when the answer is correct
      playSrc(item.audio);
      setTimeout(() => {
        idx++;
        if (idx >= order.length) finish();
        else render();
      }, 1100);
    } else {
      setFb("Try again — or tap 🔊", "bad");
      if ($("typeInput")) $("typeInput").classList.add("wrong");
      setTimeout(() => {
        locked = false;
        if ($("typeInput")) {
          $("typeInput").classList.remove("wrong");
          $("typeInput").select();
        }
        if ($("checkBtn")) $("checkBtn").disabled = !($("typeInput") && $("typeInput").value.trim());
        setFb("", "");
      }, 700);
    }
  }

  function finish() {
    const acc = attempts ? Math.round((correct / attempts) * 100) : 0;
    if ($("finalScore")) $("finalScore").textContent = String(score);
    if ($("finalAccuracy")) $("finalAccuracy").textContent = acc + "%";
    if ($("finalWords")) $("finalWords").textContent = String(order.length);
    if ($("endTitle")) $("endTitle").textContent = acc === 100 ? "Perfect!" : acc >= 70 ? "Great job!" : "Good practice!";
    if ($("endSummary")) $("endSummary").textContent = correct + " of " + order.length + " colors correct.";
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
        LAStars.apply($("endScreen"));
      }
    } catch (e) {}
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    const endEl = $("endScreen");
    if (endEl) {
      endEl.querySelectorAll(".star").forEach((el) => {
        const n = Number(el.getAttribute("data-n") || 0);
        el.classList.toggle("is-filled", n <= stars);
        el.textContent = n <= stars ? "★" : "☆";
      });
    }
    show("end");
  }

  function start() {
    order = shuffle(ITEMS.map((_, i) => i));
    idx = 0;
    score = 0;
    correct = 0;
    attempts = 0;
    show("game");
    render();
  }

  const startBtn = $("startBtn");
  const playAgainBtn = $("playAgainBtn");
  const checkBtn = $("checkBtn");
  const playAudioBtn = $("playAudioBtn");
  const typeInput = $("typeInput");

  if (startBtn) startBtn.addEventListener("click", start);
  if (playAgainBtn) playAgainBtn.addEventListener("click", start);
  if (checkBtn) checkBtn.addEventListener("click", check);
  if (playAudioBtn) {
    playAudioBtn.addEventListener("click", () => {
      if (order.length && order[idx] != null) playSrc(ITEMS[order[idx]].audio);
    });
  }
  if (typeInput) {
    typeInput.addEventListener("input", () => {
      if (!locked && checkBtn) checkBtn.disabled = !typeInput.value.trim();
    });
    typeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && checkBtn && !checkBtn.disabled && !locked) {
        e.preventDefault();
        check();
      }
    });
    typeInput.addEventListener("focus", () => document.body.classList.add("keyboard-open"));
    typeInput.addEventListener("blur", () => {
      setTimeout(() => document.body.classList.remove("keyboard-open"), 100);
    });
  }

  try {
    ITEMS.forEach((it) => {
      const a = new Audio();
      a.preload = "auto";
      a.src = it.audio;
    });
  } catch (e) {}
})();
