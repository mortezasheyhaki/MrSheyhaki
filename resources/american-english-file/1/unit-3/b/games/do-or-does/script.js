(function () {
  "use strict";

  const GAME_ID = "1-3b-do-or-does";

  const ITEMS = [
    { id: 1, after: "you have a dog?", answer: "Do" },
    { id: 2, after: "you speak a foreign language?", answer: "Do" },
    { id: 3, after: "she play the guitar?", answer: "Does" },
    { id: 4, after: "he work or study?", answer: "Does" },
    { id: 5, after: "school children in your country wear uniforms?", answer: "Do" },
    { id: 6, after: "Jamie study Japanese?", answer: "Does" },
    { id: 7, after: "your husband cook?", answer: "Does" },
    { id: 8, after: "it rain a lot in your country?", answer: "Does" },
    { id: 9, after: "the students in this class speak good English?", answer: "Do" },
    { id: 10, after: "Angela like her job?", answer: "Does" }
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;

  const sentenceEl = document.getElementById("sentence");
  const qNumEl = document.getElementById("qNum");
  const questionCard = document.getElementById("questionCard");
  const feedback = document.getElementById("feedback");
  const progressEl = document.getElementById("progress");
  const scoreEl = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");
  const doneBox = document.getElementById("done");
  const playArea = document.getElementById("playArea");
  const btnDo = document.getElementById("btnDo");
  const btnDoes = document.getElementById("btnDoes");

  function renderQuestion(animate) {
    if (index >= order.length) {
      finish();
      return;
    }
    const item = order[index];
    qNumEl.textContent = (index + 1) + " of " + order.length;
    sentenceEl.innerHTML = '<span class="blank">&nbsp;</span> ' + item.after;
    feedback.textContent = "";
    feedback.className = "feedback";
    locked = false;

    [btnDo, btnDoes].forEach(function (b) {
      b.disabled = false;
      b.className = "opt-btn";
    });

    progressEl.textContent = String(index);
    progressFill.style.width = (index / order.length) * 100 + "%";

    if (animate) {
      questionCard.classList.remove("exit", "enter");
      void questionCard.offsetWidth;
      questionCard.classList.add("enter");
    }
  }

  function onChoice(choice) {
    if (locked) return;
    locked = true;
    const item = order[index];
    const correct = choice === item.answer;

    const chosenBtn = choice === "Do" ? btnDo : btnDoes;
    const otherBtn = choice === "Do" ? btnDoes : btnDo;

    btnDo.disabled = true;
    btnDoes.disabled = true;

    if (correct) {
      score++;
      scoreEl.textContent = String(score);
      // Brief score bump animation
      scoreEl.parentElement.style.transform = "scale(1.12)";
      setTimeout(function () {
        scoreEl.parentElement.style.transform = "";
      }, 250);

      chosenBtn.classList.add("correct");
      otherBtn.classList.add("dim");
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓";
      sentenceEl.innerHTML =
        '<span class="blank filled correct-fill">' + item.answer + "</span> " + item.after;
    } else {
      chosenBtn.classList.add("wrong");
      otherBtn.classList.add("correct");
      feedback.className = "feedback error";
      feedback.textContent = "It's \"" + item.answer + "\"";
      sentenceEl.innerHTML =
        '<span class="blank filled wrong-fill">' + item.answer + "</span> " + item.after;
    }

    const delay = correct ? 950 : 1450;
    setTimeout(function () {
      // Exit animation then advance
      questionCard.classList.remove("enter");
      questionCard.classList.add("exit");
      setTimeout(function () {
        index++;
        if (index >= order.length) {
          progressEl.textContent = String(order.length);
          progressFill.style.width = "100%";
          finish();
        } else {
          renderQuestion(true);
        }
      }, 280);
    }, delay);
  }

  function starsFromPct(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function renderStars(n) {
    const el = document.getElementById("stars");
    el.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = (i - 1) * 0.14 + "s";
      el.appendChild(s);
    }
  }

  function finish() {
    playArea.classList.add("hidden");
    doneBox.classList.remove("hidden");
    const pct = Math.round((score / order.length) * 100);
    document.getElementById("finalScore").textContent =
      score + " / " + order.length + " correct (" + pct + "%)";
    renderStars(starsFromPct(pct));
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, pct);
      } catch (e) {}
    }
  }

  function start() {
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    locked = false;
    scoreEl.textContent = "0";
    progressEl.textContent = "0";
    progressFill.style.width = "0%";
    doneBox.classList.add("hidden");
    playArea.classList.remove("hidden");
    questionCard.classList.remove("exit", "enter");
    renderQuestion(true);
  }

  btnDo.addEventListener("click", function () { onChoice("Do"); });
  btnDoes.addEventListener("click", function () { onChoice("Does"); });
  document.getElementById("restartBtn").addEventListener("click", start);

  start();
})();
