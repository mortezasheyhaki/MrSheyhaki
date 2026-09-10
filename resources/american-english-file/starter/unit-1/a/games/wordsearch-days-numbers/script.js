/* Word Search – numbers 0–10 & days of the week */
(function () {
  const GAME_ID = "starter-1a-wordsearch-days-numbers";
  const GRID = [
    ["T","H","R","E","E","S","Y","T","S","I","X","T"],
    ["R","H","J","L","E","A","U","U","G","F","F","W"],
    ["F","Y","U","E","N","T","Y","E","D","N","R","O"],
    ["O","N","E","R","F","U","H","S","P","N","I","S"],
    ["U","H","T","H","U","R","S","D","A","Y","D","T"],
    ["R","N","V","H","B","D","P","A","T","M","A","E"],
    ["T","E","N","X","T","A","A","Y","C","O","Y","I"],
    ["S","N","I","N","E","Y","E","Y","H","N","U","G"],
    ["W","E","D","N","E","S","D","A","Y","D","F","H"],
    ["B","E","X","Z","E","R","O","V","V","A","I","T"],
    ["T","I","N","A","S","E","V","E","N","Y","V","L"],
    ["S","U","N","D","A","Y","J","S","P","Q","E","F"],
  ];

  const WORDS = {
    numbers: [
      { word: "ZERO", label: "zero" },
      { word: "ONE", label: "one" },
      { word: "TWO", label: "two" },
      { word: "THREE", label: "three" },
      { word: "FOUR", label: "four" },
      { word: "FIVE", label: "five" },
      { word: "SIX", label: "six" },
      { word: "SEVEN", label: "seven" },
      { word: "EIGHT", label: "eight" },
      { word: "NINE", label: "nine" },
      { word: "TEN", label: "ten" },
    ],
    days: [
      { word: "MONDAY", label: "Monday" },
      { word: "TUESDAY", label: "Tuesday" },
      { word: "WEDNESDAY", label: "Wednesday" },
      { word: "THURSDAY", label: "Thursday" },
      { word: "FRIDAY", label: "Friday" },
      { word: "SATURDAY", label: "Saturday" },
      { word: "SUNDAY", label: "Sunday" },
    ],
  };

  const ALL = [...WORDS.numbers, ...WORDS.days];
  const TOTAL = ALL.length;
  const ROWS = GRID.length;
  const COLS = GRID[0].length;
  const DIRS = [
    [0, 1], [1, 0], [1, 1], [1, -1],
    [0, -1], [-1, 0], [-1, 1], [-1, -1],
  ];

  // Precompute locations
  const LOCATIONS = {};
  ALL.forEach(({ word }) => {
    outer: for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        for (const [dr, dc] of DIRS) {
          const cells = [];
          let ok = true;
          for (let i = 0; i < word.length; i++) {
            const rr = r + dr * i;
            const cc = c + dc * i;
            if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || GRID[rr][cc] !== word[i]) {
              ok = false;
              break;
            }
            cells.push(key(rr, cc));
          }
          if (ok) {
            LOCATIONS[word] = cells;
            break outer;
          }
        }
      }
    }
  });

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let found = new Set(); // uppercase words
  let selecting = false;
  let path = []; // array of "r-c"
  let cellEls = {};

  function key(r, c) {
    return r + "-" + c;
  }

  function parseKey(k) {
    const [r, c] = k.split("-").map(Number);
    return { r, c };
  }

  function isAdjacent(a, b) {
    const pa = parseKey(a);
    const pb = parseKey(b);
    const dr = Math.abs(pa.r - pb.r);
    const dc = Math.abs(pa.c - pb.c);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
  }

  function pathWord() {
    return path.map((k) => {
      const { r, c } = parseKey(k);
      return GRID[r][c];
    }).join("");
  }

  function clearSelectionHighlight() {
    Object.values(cellEls).forEach((el) => el.classList.remove("ws-selecting"));
  }

  function highlightPath() {
    clearSelectionHighlight();
    path.forEach((k) => {
      if (cellEls[k]) cellEls[k].classList.add("ws-selecting");
    });
  }

  function markFound(word, animate) {
    const cells = LOCATIONS[word] || [];
    cells.forEach((k) => {
      const el = cellEls[k];
      if (!el) return;
      el.classList.add("ws-found");
      if (animate) {
        el.classList.remove("ws-just-found");
        // force reflow so animation retriggers
        void el.offsetWidth;
        el.classList.add("ws-just-found");
        setTimeout(() => el.classList.remove("ws-just-found"), 600);
      }
    });
  }

  function tryCommit() {
    const w = pathWord();
    const rev = w.split("").reverse().join("");
    let matched = null;
    if (LOCATIONS[w] && !found.has(w)) matched = w;
    else if (LOCATIONS[rev] && !found.has(rev)) matched = rev;

    if (matched) {
      found.add(matched);
      markFound(matched, true);
      updateWordList();
      updateProgress();
      const fb = document.getElementById("ws-fb");
      if (fb) {
        const item = ALL.find((x) => x.word === matched);
        fb.textContent = `Found: ${item ? item.label : matched}`;
        fb.className = "ws-fb good";
      }
      if (found.size >= TOTAL) {
        const main = document.querySelector(".ws-main");
        if (main) main.classList.add("ws-celebrate");
        setTimeout(() => {
          mode = "result";
          render();
        }, 900);
      }
    } else if (path.length >= 2) {
      const fb = document.getElementById("ws-fb");
      if (fb) {
        fb.textContent = "Not in the list — keep looking!";
        fb.className = "ws-fb";
        setTimeout(() => {
          if (fb.textContent.startsWith("Not")) {
            fb.textContent = "";
            fb.className = "ws-fb";
          }
        }, 1200);
      }
    }
    path = [];
    clearSelectionHighlight();
  }

  function cellFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const cell = el.closest(".ws-cell");
    return cell ? cell.dataset.key : null;
  }

  function onPointerDown(e) {
    if (mode !== "play") return;
    e.preventDefault();
    const k = cellFromPoint(e.clientX, e.clientY);
    if (!k) return;
    selecting = true;
    path = [k];
    highlightPath();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  }

  function onPointerMove(e) {
    if (!selecting || mode !== "play") return;
    const k = cellFromPoint(e.clientX, e.clientY);
    if (!k) return;
    if (path[path.length - 1] === k) return;
    // allow backtrack
    if (path.length >= 2 && path[path.length - 2] === k) {
      path.pop();
      highlightPath();
      return;
    }
    if (path.includes(k)) return;
    if (!isAdjacent(path[path.length - 1], k)) return;
    // keep straight line after 2 cells
    if (path.length >= 2) {
      const a = parseKey(path[0]);
      const b = parseKey(path[1]);
      const c = parseKey(k);
      const dr0 = b.r - a.r;
      const dc0 = b.c - a.c;
      const last = parseKey(path[path.length - 1]);
      const dr = c.r - last.r;
      const dc = c.c - last.c;
      if (dr !== dr0 || dc !== dc0) return;
    }
    path.push(k);
    highlightPath();
  }

  function onPointerUp() {
    if (!selecting) return;
    selecting = false;
    tryCommit();
  }

  function updateProgress() {
    const el = document.getElementById("ws-progress");
    if (!el) return;
    el.textContent = `${found.size} / ${TOTAL}`;
    el.classList.remove("ws-pop");
    void el.offsetWidth;
    el.classList.add("ws-pop");
    setTimeout(() => el.classList.remove("ws-pop"), 300);
  }

  function updateWordList() {
    WORDS.numbers.forEach(({ word, label }) => {
      const el = document.getElementById("ws-n-" + word);
      if (el) {
        el.classList.toggle("ws-done", found.has(word));
        if (found.has(word)) el.textContent = label;
      }
    });
    WORDS.days.forEach(({ word, label }) => {
      const el = document.getElementById("ws-d-" + word);
      if (el) {
        el.classList.toggle("ws-done", found.has(word));
        if (found.has(word)) el.textContent = label;
      }
    });
  }

  function startGame() {
    found = new Set();
    path = [];
    selecting = false;
    mode = "play";
    render();
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="ws-topbar">
          <a class="ws-back" href="../" aria-label="Back">←</a>
          <span class="ws-title">Word Search</span>
          <span class="ws-badge">1A</span>
        </header>
        <section class="ws-start">
          <div class="ws-hero">
            <div class="ws-blob" aria-hidden="true"></div>
            <div class="ws-icon-wrap" aria-hidden="true">🔍</div>
          </div>
          <h1>Word Search</h1>
          <p class="ws-desc">Find the numbers <strong>0–10</strong> and<br>the <strong>days of the week</strong>.</p>
          <p class="ws-note">Drag across letters to select a word.</p>
          <button type="button" class="ws-btn" id="ws-start">Start</button>
        </section>`;
      document.getElementById("ws-start").onclick = startGame;
      return;
    }

    if (mode === "result") {
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, 3); }
      app.innerHTML = `
        <header class="ws-topbar">
          <a class="ws-back" href="../" aria-label="Back">←</a>
          <span class="ws-title">Word Search</span>
          <span class="ws-badge">Done</span>
        </header>
        <section class="ws-done">
          <div class="ws-trophy" aria-hidden="true">🏆</div>
          <div class="ws-stars" aria-hidden="true">⭐ ⭐ ⭐</div>
          <h1>Perfect!</h1>
          <p>You found all <strong>${TOTAL}</strong> words.</p>
          <div class="ws-summary">
            <div>
              <h3>Numbers</h3>
              <ul>${WORDS.numbers.map((x) => `<li>${x.label}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>Days</h3>
              <ul>${WORDS.days.map((x) => `<li>${x.label}</li>`).join("")}</ul>
            </div>
          </div>
          <button type="button" class="ws-btn" id="ws-again">Play again</button>
          <a class="ws-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("ws-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    // play
    const gridHtml = GRID.map((row, r) =>
      row
        .map(
          (ch, c) =>
            `<button type="button" class="ws-cell" data-key="${key(r, c)}" data-r="${r}" data-c="${c}">${ch}</button>`
        )
        .join("")
    ).join("");

    const numList = WORDS.numbers
      .map(
        ({ word, label }) =>
          `<li id="ws-n-${word}" class="ws-word">${found.has(word) ? label : "• • •"}</li>`
      )
      .join("");
    const dayList = WORDS.days
      .map(
        ({ word, label }) =>
          `<li id="ws-d-${word}" class="ws-word">${found.has(word) ? label : "• • •"}</li>`
      )
      .join("");

    app.innerHTML = `
      <header class="ws-topbar">
        <a class="ws-back" href="../" aria-label="Back">←</a>
        <span class="ws-title">Word Search</span>
        <span class="ws-badge" id="ws-progress">${found.size} / ${TOTAL}</span>
      </header>

      <p class="ws-instruction">Drag across letters to find a word.</p>

      <div class="ws-main">
        <div class="ws-board" id="ws-board">
          <div class="ws-grid" id="ws-grid">${gridHtml}</div>
        </div>

        <div class="ws-side">
          <div class="ws-lists">
            <div class="ws-list-col">
              <h3>Numbers</h3>
              <ul id="ws-nums">${numList}</ul>
            </div>
            <div class="ws-list-col">
              <h3>Days</h3>
              <ul id="ws-days">${dayList}</ul>
            </div>
          </div>
          <div class="ws-fb" id="ws-fb" aria-live="polite"></div>
        </div>
      </div>
    `;

    cellEls = {};
    document.querySelectorAll(".ws-cell").forEach((el) => {
      cellEls[el.dataset.key] = el;
      if (found.size) {
        // restore found highlights
        for (const w of found) markFound(w);
      }
    });

    const board = document.getElementById("ws-board");
    board.addEventListener("pointerdown", onPointerDown);
    board.addEventListener("pointermove", onPointerMove);
    board.addEventListener("pointerup", onPointerUp);
    board.addEventListener("pointercancel", onPointerUp);
  }

  render();
})();
