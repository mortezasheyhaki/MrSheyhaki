/* Kayla's Family · write sentences with 's · AEF Starter Unit 4A */
(function () {
  const GAME_ID = "starter-4a-kaylas-family";
  const TREE_IMG = "https://cdn.imgurl.ir/uploads/d76067_ChatGPT_Image_Sep_17_2026_02_21_53_AM.png";

  // pair shown as "A / B" → expected sentence
  const ITEMS = [
    {
      pair: "Kayla / Sam",
      answer: "Kayla is Sam's sister.",
      accepted: ["kayla is sam's sister", "kayla is sams sister"],
    },
    {
      pair: "Peter / Kayla",
      answer: "Peter is Kayla's father.",
      accepted: ["peter is kayla's father", "peter is kaylas father"],
    },
    {
      pair: "Diana / Sam",
      answer: "Diana is Sam's mother.",
      accepted: ["diana is sam's mother", "diana is sams mother"],
    },
    {
      pair: "Kayla / Peter",
      answer: "Kayla is Peter's daughter.",
      accepted: ["kayla is peter's daughter", "kayla is peters daughter"],
    },
    {
      pair: "Peter / Diana",
      answer: "Peter is Diana's husband.",
      accepted: ["peter is diana's husband", "peter is dianas husband"],
    },
    {
      pair: "Sam / Peter",
      answer: "Sam is Peter's son.",
      accepted: ["sam is peter's son", "sam is peters son"],
    },
    {
      pair: "Diana / Peter",
      answer: "Diana is Peter's wife.",
      accepted: ["diana is peter's wife", "diana is peters wife"],
    },
    {
      pair: "Sam / Kayla",
      answer: "Sam is Kayla's brother.",
      accepted: ["sam is kayla's brother", "sam is kaylas brother"],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let correct = 0;
  let checked = false;

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\.+$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(user, item) {
    const n = normalize(user);
    if (n === normalize(item.answer)) return true;
    return item.accepted.some((a) => n === a);
  }

  function start() {
    phase = "play";
    correct = 0;
    checked = false;
    render();
  }

  function checkAll() {
    if (checked) return;
    checked = true;
    correct = 0;

    ITEMS.forEach((item, i) => {
      const input = document.getElementById("ps-input-" + i);
      if (!input) return;
      const ok = isCorrect(input.value, item);
      if (ok) correct += 1;

      input.disabled = true;
      input.classList.remove("is-correct", "is-wrong");
      input.classList.add(ok ? "is-correct" : "is-wrong");

      const fb = document.getElementById("ps-fb-" + i);
      if (fb) {
        fb.textContent = ok ? "✓" : item.answer;
        fb.className = "ps-line-fb " + (ok ? "ok" : "bad");
      }
    });

    const checkBtn = document.getElementById("ps-check");
    if (checkBtn) checkBtn.style.display = "none";

    const result = document.getElementById("ps-result");
    if (result) {
      result.textContent = "You got " + correct + " of " + ITEMS.length + " correct.";
      result.className = "ps-result " + (correct === ITEMS.length ? "ok" : "bad");
    }

    // auto advance to done after short delay if all correct, else show continue
    setTimeout(() => {
      const cont = document.getElementById("ps-continue");
      if (cont) cont.style.display = "block";
    }, 400);
  }

  function finish() {
    phase = "done";
    render();
  }

  function calcStars() {
    const total = ITEMS.length;
    if (correct >= total) return 3;
    if (correct >= Math.ceil(total * 0.7)) return 2;
    if (correct >= Math.ceil(total * 0.4)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Kayla\'s Family</span>' +
        '<span class="ps-badge">4A</span></header>' +
        '<section class="ps-start">' +
        '<div class="ps-hero" aria-hidden="true">👨‍👩‍👧</div>' +
        "<h1>Kayla's Family</h1>" +
        '<p class="ps-desc">Look at the family tree. Write sentences using the names and \'s.</p>' +
        '<button type="button" class="ps-btn" id="ps-start">Start</button>' +
        "</section>";
      document.getElementById("ps-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Kayla\'s Family</span>' +
        '<span class="ps-badge">Done</span></header>' +
        '<section class="ps-done">' +
        '<div class="ps-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) + "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="ps-desc">You got ' + correct + " of " + ITEMS.length + " correct.</p>" +
        '<button type="button" class="ps-btn" id="ps-again">Play again</button>' +
        '<button type="button" class="ps-btn secondary" id="ps-menu">Back to start</button></section>';
      document.getElementById("ps-again").onclick = start;
      document.getElementById("ps-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    // Play: write mode
    const lines = ITEMS.map(function (item, i) {
      return (
        '<div class="ps-write-line" data-i="' + i + '">' +
        '<span class="ps-pair-label">' + (i + 1) + ". " + item.pair + "</span>" +
        '<div class="ps-input-wrap">' +
        '<input type="text" class="ps-input" id="ps-input-' + i + '" placeholder="Write the sentence..." autocomplete="off" spellcheck="false" />' +
        '<span class="ps-line-fb" id="ps-fb-' + i + '"></span>' +
        "</div></div>"
      );
    }).join("");

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Kayla\'s Family</span>' +
      '<span class="ps-progress">Write</span></header>' +
      '<div class="ps-play ps-play-write">' +
      '<div class="ps-pic-wrap ps-pic-tree"><img class="ps-pic" src="' + TREE_IMG + '" alt="Kayla\'s family tree" draggable="false" /></div>' +
      '<p class="ps-hint">Look at the picture. Write sentences about the family. Use the names and \'s.</p>' +
      '<div class="ps-write-list">' + lines + "</div>" +
      '<p class="ps-result" id="ps-result"></p>' +
      '<div class="ps-write-actions">' +
      '<button type="button" class="ps-btn" id="ps-check">Check answers</button>' +
      '<button type="button" class="ps-btn secondary" id="ps-continue" style="display:none">Continue</button>' +
      "</div></div>";

    document.getElementById("ps-check").onclick = checkAll;
    document.getElementById("ps-continue").onclick = finish;

    // Keep focused input visible when keyboard opens
    const list = app.querySelector(".ps-write-list");
    app.querySelectorAll(".ps-input").forEach(function (input) {
      input.addEventListener("focus", function () {
        setTimeout(function () {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      });
    });

    // Allow Enter on last input to check
    const lastInput = document.getElementById("ps-input-" + (ITEMS.length - 1));
    if (lastInput) {
      lastInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") checkAll();
      });
    }
  }

  render();
})();
