(function () {
  "use strict";
  // Pictures from the textbook: color + object
  // plural → They're …   singular → It's a / It's an …
  const ITEMS = [
    {
      id: "black",
      img: "images/black.png",
      prompt: "What is it?",
      answers: [
        "it's a black bag",
        "it is a black bag",
        "a black bag",
        "it's one black bag",
        "it is one black bag",
        "it's 1 black bag",
        "it is 1 black bag",
        "one black bag",
        "1 black bag",
      ],
    },
    {
      id: "blue",
      img: "images/blue.png",
      prompt: "What are they?",
      answers: [
        "they're blue keys",
        "they are blue keys",
        "blue keys",
        "they're three blue keys",
        "they are three blue keys",
        "they're 3 blue keys",
        "they are 3 blue keys",
        "three blue keys",
        "3 blue keys",
      ],
    },
    {
      id: "brown",
      img: "images/brown.png",
      prompt: "What are they?",
      answers: [
        "they're brown eggs",
        "they are brown eggs",
        "brown eggs",
        "they're four brown eggs",
        "they are four brown eggs",
        "they're 4 brown eggs",
        "they are 4 brown eggs",
        "four brown eggs",
        "4 brown eggs",
      ],
    },
    {
      id: "green",
      img: "images/green.png",
      prompt: "What are they?",
      answers: [
        "they're green pencils",
        "they are green pencils",
        "green pencils",
        "they're six green pencils",
        "they are six green pencils",
        "they're 6 green pencils",
        "they are 6 green pencils",
        "six green pencils",
        "6 green pencils",
      ],
    },
    {
      id: "grey",
      img: "images/grey.png",
      prompt: "What is it?",
      answers: [
        "it's a grey chair",
        "it is a grey chair",
        "it's a gray chair",
        "it is a gray chair",
        "a grey chair",
        "a gray chair",
        "it's one grey chair",
        "it is one grey chair",
        "it's 1 grey chair",
        "it is 1 grey chair",
        "it's one gray chair",
        "it is one gray chair",
        "it's 1 gray chair",
        "it is 1 gray chair",
        "one grey chair",
        "1 grey chair",
        "one gray chair",
        "1 gray chair",
      ],
    },
    {
      id: "orange",
      img: "images/orange.png",
      prompt: "What is it?",
      answers: [
        "it's an orange watch",
        "it is an orange watch",
        "an orange watch",
        "it's a orange watch",
        "it is a orange watch",
        "it's one orange watch",
        "it is one orange watch",
        "it's 1 orange watch",
        "it is 1 orange watch",
        "one orange watch",
        "1 orange watch",
      ],
    },
    {
      id: "pink",
      img: "images/pink.png",
      prompt: "What is it?",
      answers: [
        "it's a pink phone",
        "it is a pink phone",
        "a pink phone",
        "it's one pink phone",
        "it is one pink phone",
        "it's 1 pink phone",
        "it is 1 pink phone",
        "one pink phone",
        "1 pink phone",
      ],
    },
    {
      id: "red",
      img: "images/red.png",
      prompt: "What is it?",
      answers: [
        "it's a red car",
        "it is a red car",
        "a red car",
        "it's one red car",
        "it is one red car",
        "it's 1 red car",
        "it is 1 red car",
        "one red car",
        "1 red car",
      ],
    },
    {
      id: "white",
      img: "images/white.png",
      prompt: "What is it?",
      answers: [
        "it's a white bicycle",
        "it is a white bicycle",
        "it's a white bike",
        "it is a white bike",
        "a white bicycle",
        "a white bike",
        "it's one white bicycle",
        "it is one white bicycle",
        "it's 1 white bicycle",
        "it is 1 white bicycle",
        "it's one white bike",
        "it is one white bike",
        "it's 1 white bike",
        "it is 1 white bike",
        "one white bicycle",
        "1 white bicycle",
        "one white bike",
        "1 white bike",
      ],
    },
    {
      id: "yellow",
      img: "images/yellow.png",
      prompt: "What are they?",
      answers: [
        "They are yellow umbrellas",
        "They're yellow umbrellas",
        "two yellow umbrellas",
        "They are two yellow umbrellas",
        "They're two yellow umbrellas",
        "They are 2 yellow umbrellas",
        "They're 2 yellow umbrellas",
        "2 yellow umbrellas",
      ],
    },
  ];
  const GAME_ID = "vocab-colors-what-is-it";
  const $ = (id) => document.getElementById(id);

  let order = [];
  let idx = 0;
  let score = 0;
  let correct = 0;
  let attempts = 0;
  let locked = false;

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
      .replace(/[.,!?]+$/g, "")
      .replace(/[^a-z0-9\s'-]/g, "")
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

  function render() {
    locked = false;
    const item = ITEMS[order[idx]];
    if ($("sceneImg")) {
      $("sceneImg").src = item.img;
      $("sceneImg").decoding = "async";
      $("sceneImg").alt = item.id;
    }
    if ($("promptText")) $("promptText").textContent = item.prompt;
    if ($("typeInput")) {
      $("typeInput").value = "";
      $("typeInput").classList.remove("wrong", "correct");
      $("typeInput").placeholder =
        item.prompt === "What are they?" ? "They're …" : "It's a …";
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
      setTimeout(() => {
        idx++;
        if (idx >= order.length) finish();
        else render();
      }, 900);
    } else {
      // Show a gentle hint with the model answer (first full sentence)
      const model = item.answers[0]
        .replace(/^it is /, "It's ")
        .replace(/^they are /, "They're ")
        .replace(/^it's /, "It's ")
        .replace(/^they're /, "They're ");
      // Capitalize first letter for display
      const hint =
        model.charAt(0).toUpperCase() + model.slice(1) + ".";
      setFb("Try again. Example: " + hint, "bad");
      if ($("typeInput")) $("typeInput").classList.add("wrong");
      setTimeout(() => {
        locked = false;
        if ($("typeInput")) {
          $("typeInput").classList.remove("wrong");
          $("typeInput").select();
        }
        if ($("checkBtn"))
          $("checkBtn").disabled = !(
            $("typeInput") && $("typeInput").value.trim()
          );
        setFb("", "");
      }, 1600);
    }
  }

  function finish() {
    const acc = attempts ? Math.round((correct / attempts) * 100) : 0;
    if ($("finalScore")) $("finalScore").textContent = String(score);
    if ($("finalAccuracy")) $("finalAccuracy").textContent = acc + "%";
    if ($("finalWords")) $("finalWords").textContent = String(order.length);
    if ($("endTitle"))
      $("endTitle").textContent =
        acc === 100 ? "Perfect!" : acc >= 70 ? "Great job!" : "Good practice!";
    if ($("endSummary"))
      $("endSummary").textContent =
        correct + " of " + order.length + " sentences correct.";
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
  const typeInput = $("typeInput");

  if (startBtn) startBtn.addEventListener("click", start);
  if (playAgainBtn) playAgainBtn.addEventListener("click", start);
  if (checkBtn) checkBtn.addEventListener("click", check);
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
    typeInput.addEventListener("focus", () =>
      document.body.classList.add("keyboard-open")
    );
    typeInput.addEventListener("blur", () => {
      setTimeout(() => document.body.classList.remove("keyboard-open"), 100);
    });
  }
})();
