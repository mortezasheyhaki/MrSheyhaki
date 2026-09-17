/* Where is he / she from? – AEF Starter Unit 1B */
(function () {
  const GAME_ID = "starter-1b-where-is-he-she-from";

  const PEOPLE = [
    {
      id: "jackie-chan",
      name: "Jackie Chan",
      gender: "he",
      country: "China",
      flag: "🇨🇳",
      image: "https://cdn.imgurl.ir/uploads/r7420_Jackie_Chan_China.png",
      answers: ["china"],
    },
    {
      id: "neymar",
      name: "Neymar",
      gender: "he",
      country: "Brazil",
      flag: "🇧🇷",
      image: "https://cdn.imgurl.ir/uploads/l2611_Neymar_Brazil.png",
      answers: ["brazil"],
    },
    {
      id: "brad-pitt",
      name: "Brad Pitt",
      gender: "he",
      country: "the United States",
      flag: "🇺🇸",
      image: "https://cdn.imgurl.ir/uploads/f21596_Brad_Pitt_the_US.png",
      answers: ["the united states", "united states", "usa", "us", "america", "the us", "the usa"],
    },
    {
      id: "michael-fassbender",
      name: "Michael Fassbender",
      gender: "he",
      country: "Germany",
      flag: "🇩🇪",
      image: "https://cdn.imgurl.ir/uploads/g147327_Michael_Fbender_Germany.png",
      answers: ["germany"],
    },
    {
      id: "penelope-cruz",
      name: "Penélope Cruz",
      gender: "she",
      country: "Spain",
      flag: "🇪🇸",
      image: "https://cdn.imgurl.ir/uploads/t976899_Penelope_Cruiz_Spain.png",
      answers: ["spain"],
    },
    {
      id: "mbs",
      name: "Mohammad Bin Salman",
      gender: "he",
      country: "Saudi Arabia",
      flag: "🇸🇦",
      image: "https://cdn.imgurl.ir/uploads/i054768_Mohammad_Bin_Salman_Saudi_Arabia.png",
      answers: ["saudi arabia", "saudi"],
    },
    {
      id: "irina-shayk",
      name: "Irina Shayk",
      gender: "she",
      country: "Russia",
      flag: "🇷🇺",
      image: "https://cdn.imgurl.ir/uploads/x39895_Irina_Shayk_Russia.png",
      answers: ["russia"],
    },
    {
      id: "lee-jung-jae",
      name: "Lee Jung-jae",
      gender: "he",
      country: "Korea",
      flag: "🇰🇷",
      image: "https://cdn.imgurl.ir/uploads/j54344_Lee_Jung-jae_Korea.png",
      answers: ["korea", "south korea"],
    },
    {
      id: "keanu-reeves",
      name: "Keanu Reeves",
      gender: "he",
      country: "Canada",
      flag: "🇨🇦",
      image: "https://cdn.imgurl.ir/uploads/m933293_Keanu_Reeves_Canada.png",
      answers: ["canada"],
    },
    {
      id: "hande-ercel",
      name: "Hande Erçel",
      gender: "she",
      country: "Turkey",
      flag: "🇹🇷",
      image: "https://cdn.imgurl.ir/uploads/e936257_Hande_Ercel_Turkey.png",
      answers: ["turkey"],
    },
    {
      id: "chopsticks",
      name: "Chopsticks",
      gender: "it",
      country: "Japan",
      flag: "🇯🇵",
      image: "https://cdn.imgurl.ir/uploads/b05882_Chopsticks_Japan_1.png",
      answers: ["japan"],
    },
    {
      id: "persian-carpet",
      name: "Persian Carpet",
      gender: "it",
      country: "Iran",
      flag: "🇮🇷",
      image: "https://cdn.imgurl.ir/uploads/d663978_Persian_Carpet_Iran_1.png",
      answers: ["iran"],
    },
    {
      id: "bowler-hat",
      name: "Bowler Hat",
      gender: "it",
      country: "England",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      image: "https://cdn.imgurl.ir/uploads/k597295_Bowlet_hat_England_1.png",
      answers: ["england"],
    },
    {
      id: "woven-bag",
      name: "Woven Bag",
      gender: "it",
      country: "Peru",
      flag: "🇵🇪",
      image: "https://cdn.imgurl.ir/uploads/a18425_Woven_Bag_Peru_1.png",
      answers: ["peru"],
    },
    {
      id: "tango-shoes",
      name: "Tango Shoes",
      gender: "it",
      country: "Argentina",
      flag: "🇦🇷",
      image: "https://cdn.imgurl.ir/uploads/m790225_Tango_Shoes_Argentina_1.png",
      answers: ["argentina"],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "start"; // start | play | feedback | done
  let order = [];
  let index = 0;
  let correctCount = 0;
  let userInput = "";
  let lastCorrect = false;
  let lastSkipped = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return PEOPLE[order[index]];
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function countryMatched(input, person) {
    // Country name must appear with correct capitalization (first letter capital).
    const original = String(input || "")
      .replace(/[.,!?]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const n = normalize(input);

    const PROPER = {
      china: ["China"],
      brazil: ["Brazil"],
      canada: ["Canada"],
      chile: ["Chile"],
      england: ["England"],
      japan: ["Japan"],
      korea: ["Korea", "South Korea"],
      "south korea": ["Korea", "South Korea"],
      mexico: ["Mexico"],
      peru: ["Peru"],
      spain: ["Spain"],
      turkey: ["Turkey"],
      argentina: ["Argentina"],
      germany: ["Germany"],
      russia: ["Russia"],
      iran: ["Iran"],
      "saudi arabia": ["Saudi Arabia"],
      saudi: ["Saudi Arabia", "Saudi"],
      "the united states": ["the United States", "The United States", "United States", "USA", "US", "America", "the USA", "the US", "The USA", "The US"],
      "united states": ["the United States", "The United States", "United States", "USA", "US", "America", "the USA", "the US", "The USA", "The US"],
      usa: ["USA", "US", "the USA", "the US", "The USA", "The US", "United States", "the United States", "The United States", "America"],
      us: ["USA", "US", "the USA", "the US", "The USA", "The US", "United States", "the United States", "The United States", "America"],
      america: ["America", "USA", "US", "United States", "the United States", "The United States"],
      "the us": ["the US", "The US", "the USA", "The USA", "USA", "US", "United States", "the United States"],
      "the usa": ["the USA", "The USA", "the US", "The US", "USA", "US", "United States", "the United States"],
    };

    return person.answers.some((a) => {
      const na = normalize(a);
      const forms = PROPER[na] || [
        na.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      ];
      const padded = " " + original + " ";
      return forms.some((form) => padded.includes(" " + form + " "));
    });
  }

  function isCorrect(input, person) {
    const n = normalize(input);
    if (!n) return false;
    const pron = person.gender; // he | she
    // Require a full sentence with he/she + from + country
    // Accept: He is from China / He's from China / She is from Spain / She's from Spain
    // Also: He is from the United States, etc.
    const hasPronoun = new RegExp("(^|\\s)" + pron + "(\\s|'s|\\s+is\\s)", "i").test(n) ||
      n.startsWith(pron + " ") ||
      n.startsWith(pron + "'s") ||
      n.startsWith(pron + " is");
    const hasFrom = /\bfrom\b/.test(n);
    const hasBe = /\b(is|'s)\b/.test(n) || n.includes(pron + "'s");
    if (!hasPronoun || !hasFrom || !hasBe) return false;
    return countryMatched(n, person);
  }

  function questionFor(person) {
    if (person.gender === "she") return "Where is she from?";
    if (person.gender === "it") return "Where is it from?";
    return "Where is he from?";
  }

  function exampleAnswer(person) {
    if (person.gender === "she") return "She's from " + person.country + ".";
    if (person.gender === "it") return "It's from " + person.country + ".";
    return "He's from " + person.country + ".";
  }

  function startGame() {
    order = shuffle(PEOPLE.map((_, i) => i));
    index = 0;
    correctCount = 0;
    userInput = "";
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (phase !== "play") return;
    const person = current();
    const val = (document.getElementById("wf-input") || {}).value || userInput;
    userInput = val;
    if (!String(val).trim()) {
      const fb = document.getElementById("wf-fb");
      if (fb) {
        fb.textContent = "Write a full sentence, e.g. He's from China.";
        fb.className = "wf-fb bad";
      }
      return;
    }
    lastCorrect = isCorrect(val, person);
    lastSkipped = false;
    if (lastCorrect) correctCount++;
    phase = "feedback";
    render();
  }

  function skipRound() {
    if (phase !== "play") return;
    lastCorrect = false;
    lastSkipped = true;
    userInput = "";
    phase = "feedback";
    render();
  }

  function nextRound() {
    if (index < order.length - 1) {
      index++;
      userInput = "";
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    if (phase === "start") {
      app.innerHTML = `
        <header class="wf-topbar">
          <a class="wf-back" href="../" aria-label="Back">←</a>
          <div class="wf-topbar-center">
            <span class="wf-kicker">STARTER · UNIT 1B</span>
            <span class="wf-title">Where is he / she from?</span>
          </div>
          <span class="wf-badge">${PEOPLE.length}</span>
        </header>
        <section class="wf-start">
          <div class="wf-hero">🌍</div>
          <h1>Where is he / she / it from?</h1>
          <p class="wf-desc">Look at the picture and the flag. Answer with a full sentence (He/She/It's from…).</p>
          <button type="button" class="wf-btn" id="wf-start">Start</button>
        </section>`;
      document.getElementById("wf-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const total = PEOPLE.length;
      const stars =
        correctCount === total ? 3 : correctCount >= total - 2 ? 2 : correctCount >= Math.ceil(total / 2) ? 1 : 0;
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
      app.innerHTML = `
        <header class="wf-topbar">
          <a class="wf-back" href="../" aria-label="Back">←</a>
          <div class="wf-topbar-center">
            <span class="wf-kicker">STARTER · UNIT 1B</span>
            <span class="wf-title">Results</span>
          </div>
          <span class="wf-badge">${correctCount}/${total}</span>
        </header>
        <section class="wf-done">
          <div class="wf-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="wf-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount}</strong> of <strong>${total}</strong> correct.</p>
          <button type="button" class="wf-btn" id="wf-again">Play again</button>
        </section>`;
      document.getElementById("wf-again").onclick = startGame;
      return;
    }

    const person = current();
    const progress = `${index + 1}/${order.length}`;
    const q = questionFor(person);

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="wf-topbar">
          <a class="wf-back" href="../" aria-label="Back">←</a>
          <div class="wf-topbar-center">
            <span class="wf-kicker">STARTER · UNIT 1B</span>
            <span class="wf-title">Where is he / she from?</span>
          </div>
          <span class="wf-badge">${progress}</span>
        </header>
        <div class="wf-scroll">
          <div class="wf-card wf-card-photo">
            <span class="wf-flag-badge">${person.flag}</span>
            <img class="wf-photo" src="${person.image}" alt="${escapeHtml(person.name)}" />
          </div>
          <div class="wf-card wf-card-answer">
            <p class="wf-feedback ${lastCorrect ? "ok" : "bad"}">
              ${lastCorrect ? "✓ Correct!" : lastSkipped ? "Answer" : "✗ Not quite"}
            </p>
            <p class="wf-person-name">${escapeHtml(person.name)}</p>
            <p class="wf-reveal">${person.flag} <strong>${escapeHtml(exampleAnswer(person))}</strong></p>
            <button type="button" class="wf-btn wf-btn-full" id="wf-next">
              ${index < order.length - 1 ? "Next →" : "See results"}
            </button>
          </div>
        </div>`;
      document.getElementById("wf-next").onclick = nextRound;
      return;
    }

    // play
    app.innerHTML = `
      <header class="wf-topbar">
        <a class="wf-back" href="../" aria-label="Back">←</a>
        <div class="wf-topbar-center">
          <span class="wf-kicker">STARTER · UNIT 1B</span>
          <span class="wf-title">Where is he / she from?</span>
        </div>
        <span class="wf-badge">${progress}</span>
      </header>

      <div class="wf-scroll">
        <div class="wf-card wf-card-photo">
          <span class="wf-flag-badge">${person.flag}</span>
          <img class="wf-photo" src="${person.image}" alt="${escapeHtml(person.name)}" />
        </div>

        <div class="wf-card wf-card-q">
          <p class="wf-person-label">${escapeHtml(person.name)}</p>
          <h2 class="wf-question">${q}</h2>
          <label class="wf-label" for="wf-input">Write a full sentence</label>
          <input type="text" id="wf-input" class="wf-input" autocomplete="off" spellcheck="false"
                 placeholder="e.g. He's from China" value="${escapeHtml(userInput)}" />
          <div class="wf-fb" id="wf-fb" aria-live="polite"></div>
          <button type="button" class="wf-btn wf-btn-full" id="wf-check">Check</button>
          <button type="button" class="wf-skip" id="wf-skip">Skip</button>
        </div>
      </div>`;

    const input = document.getElementById("wf-input");
    input.focus();
    input.addEventListener("input", () => {
      userInput = input.value;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    document.getElementById("wf-check").onclick = checkAnswer;
    document.getElementById("wf-skip").onclick = skipRound;
  }

  render();
})();
