(function () {
  "use strict";

  const ASSET = "../jobs-match/";

  // Validated interlocking crossword — picture clues from our job images
  const WORDS = [
    { num: 1, dir: "down", answer: "ACTOR", id: "actor", r: 0, c: 2 },
    { num: 2, dir: "across", answer: "VET", id: "vet", r: 2, c: 0 },
    { num: 3, dir: "across", answer: "NURSE", id: "nurse", r: 4, c: 0 },
    { num: 4, dir: "down", answer: "SOLDIER", id: "soldier", r: 4, c: 3 },
    { num: 5, dir: "down", answer: "MODEL", id: "model", r: 1, c: 4 },
    { num: 6, dir: "across", answer: "PILOT", id: "pilot", r: 6, c: 1 },
    { num: 7, dir: "across", answer: "WAITER", id: "waiter", r: 8, c: 1 },
    { num: 8, dir: "across", answer: "CHEF", id: "chef", r: 9, c: 1 }
  ];

  const cellMap = {};
  WORDS.forEach(function (w) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "across" ? w.r : w.r + i;
      const c = w.dir === "across" ? w.c + i : w.c;
      const key = r + "," + c;
      const letter = w.answer[i];
      if (cellMap[key] && cellMap[key].letter !== letter) {
        console.error("Conflict", key, cellMap[key].letter, letter, w);
      }
      if (!cellMap[key]) cellMap[key] = { letter: letter, nums: [] };
      if (i === 0) cellMap[key].nums.push(w.num);
    }
  });

  let maxR = 0, maxC = 0;
  Object.keys(cellMap).forEach(function (k) {
    const p = k.split(",").map(Number);
    if (p[0] > maxR) maxR = p[0];
    if (p[1] > maxC) maxC = p[1];
  });
  const ROWS = maxR + 1;
  const COLS = maxC + 1;

  const gridEl = document.getElementById("grid");
  const acrossClues = document.getElementById("acrossClues");
  const downClues = document.getElementById("downClues");
  const feedback = document.getElementById("feedback");
  const inputs = {};

  function renderGrid() {
    gridEl.style.gridTemplateColumns = "repeat(" + COLS + ", var(--cell))";
    gridEl.style.gridTemplateRows = "repeat(" + ROWS + ", var(--cell))";
    gridEl.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = r + "," + c;
        const cell = document.createElement("div");
        if (!cellMap[key]) {
          cell.className = "cell empty";
        } else {
          cell.className = "cell";
          if (cellMap[key].nums.length) {
            const num = document.createElement("span");
            num.className = "cell-num";
            num.textContent = String(cellMap[key].nums[0]);
            cell.appendChild(num);
          }
          const inp = document.createElement("input");
          inp.type = "text";
          inp.maxLength = 1;
          inp.className = "cell-input";
          inp.dataset.key = key;
          inp.autocomplete = "off";
          inp.autocapitalize = "characters";
          inp.spellcheck = false;
          inp.addEventListener("input", function () {
            inp.value = inp.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
            inp.classList.remove("correct", "wrong");
            if (inp.value) focusNext(r, c);
          });
          inp.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" && !inp.value) {
              e.preventDefault();
              focusPrev(r, c);
            }
            if (e.key === "ArrowRight") { e.preventDefault(); focusAt(r, c + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); focusAt(r, c - 1); }
            if (e.key === "ArrowDown") { e.preventDefault(); focusAt(r + 1, c); }
            if (e.key === "ArrowUp") { e.preventDefault(); focusAt(r - 1, c); }
          });
          cell.appendChild(inp);
          inputs[key] = inp;
        }
        gridEl.appendChild(cell);
      }
    }
  }

  function focusAt(r, c) {
    const el = inputs[r + "," + c];
    if (el) el.focus();
  }
  function focusNext(r, c) {
    if (inputs[r + "," + (c + 1)]) return focusAt(r, c + 1);
    if (inputs[(r + 1) + "," + c]) return focusAt(r + 1, c);
  }
  function focusPrev(r, c) {
    if (inputs[r + "," + (c - 1)]) {
      focusAt(r, c - 1);
      const el = inputs[r + "," + (c - 1)];
      if (el) { el.value = ""; el.classList.remove("correct", "wrong"); }
      return;
    }
    if (inputs[(r - 1) + "," + c]) {
      focusAt(r - 1, c);
      const el = inputs[(r - 1) + "," + c];
      if (el) { el.value = ""; el.classList.remove("correct", "wrong"); }
    }
  }

  function renderClues() {
    acrossClues.innerHTML = "";
    downClues.innerHTML = "";
    WORDS.slice()
      .sort(function (a, b) { return a.num - b.num; })
      .forEach(function (w) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "clue-item";
        item.innerHTML =
          '<span class="clue-num">' + w.num + "</span>" +
          '<img src="' + ASSET + "images/" + w.id + '.png" alt="" loading="lazy">' +
          '<span class="clue-len">' + w.answer.length + " letters</span>";
        item.addEventListener("click", function () {
          focusAt(w.r, w.c);
          document.querySelectorAll(".clue-item").forEach(function (el) {
            el.classList.remove("active");
          });
          item.classList.add("active");
        });
        (w.dir === "across" ? acrossClues : downClues).appendChild(item);
      });
  }

  function check() {
    let allOk = true;
    let filled = 0;
    let total = 0;
    Object.keys(cellMap).forEach(function (key) {
      total++;
      const inp = inputs[key];
      const want = cellMap[key].letter;
      if (!inp.value) {
        allOk = false;
        inp.classList.remove("correct", "wrong");
        return;
      }
      filled++;
      if (inp.value.toUpperCase() === want) {
        inp.classList.add("correct");
        inp.classList.remove("wrong");
      } else {
        inp.classList.add("wrong");
        inp.classList.remove("correct");
        allOk = false;
      }
    });
    if (allOk && filled === total) {
      feedback.className = "feedback success";
      feedback.textContent = "Perfect! Crossword complete ✓";
    } else if (filled === 0) {
      feedback.className = "feedback";
      feedback.textContent = "Fill in the letters, then tap Check.";
    } else {
      feedback.className = "feedback error";
      feedback.textContent = "Some letters are wrong — keep trying!";
    }
  }

  document.getElementById("checkBtn").addEventListener("click", check);
  renderGrid();
  renderClues();
})();
