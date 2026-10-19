(function () {
  "use strict";
  const GAME_ID = "starter-4a-possessives-chart";
  // Practice chart — record 1 star on first interaction
  let recorded = false;
  function recordOnce() {
    if (recorded || !window.LAStars) return;
    recorded = true;
    try {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, 1);
    } catch (e) {}
  }

  const ROWS = [
    { subj: "I", poss: "my", ex: "This is my book." },
    { subj: "you", poss: "your", ex: "Is this your bag?" },
    { subj: "he", poss: "his", ex: "That's his car." },
    { subj: "she", poss: "her", ex: "This is her phone." },
    { subj: "it", poss: "its", ex: "The dog and its ball." },
    { subj: "we", poss: "our", ex: "This is our house." },
    { subj: "they", poss: "their", ex: "Those are their keys." }
  ];
  const grid = document.getElementById("chartGrid");
  const panel = document.getElementById("detailPanel");
  const detailSubj = document.getElementById("detailSubj");
  const detailPoss = document.getElementById("detailPoss");
  const detailEx = document.getElementById("detailEx");
  const closeBtn = document.getElementById("closeDetail");
  ROWS.forEach(function (row) {
    // will record on first open
    const card = document.createElement("button");
    card.type = "button";
    card.className = "chart-card";
    card.innerHTML = '<span class="subj">' + row.subj + '</span><span class="poss">' + row.poss + '</span><span class="label">possessive</span>';
    card.addEventListener("click", function () {
      recordOnce();
      detailSubj.textContent = row.subj;
      detailPoss.textContent = row.poss;
      detailEx.textContent = row.ex;
      panel.hidden = false;
    });
    grid.appendChild(card);
  });
  closeBtn.addEventListener("click", function () { panel.hidden = true; });
  panel.addEventListener("click", function (e) { if (e.target === panel) panel.hidden = true; });
})();
