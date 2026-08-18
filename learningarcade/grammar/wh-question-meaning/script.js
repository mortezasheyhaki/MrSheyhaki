document.addEventListener("DOMContentLoaded", () => {
  const rounds = [
    { clues: ["at school", "in a classroom", "at home", "in London"], answer: "Where" },
    { clues: ["Monday", "Tuesday", "at 8 o'clock", "in the morning"], answer: "When" },
    { clues: ["a chair", "a book", "a board", "a car"], answer: "What" },
    { clues: ["a man", "a woman", "my brother", "two friends"], answer: "Who" },
    { clues: ["happy", "sad", "fine", "good"], answer: "How" },
    { clues: ["25 years old", "30 years old", "18 years old", "40 years old"], answer: "How old" },
    { clues: ["in a restaurant", "at the airport", "at work", "in a park"], answer: "Where" },
    { clues: ["Saturday", "Sunday", "at 9:00", "tomorrow"], answer: "When" },
    { clues: ["a phone", "a computer", "a table", "an English book"], answer: "What" },
    { clues: ["your mother", "your friend", "Mr. Lee", "Anna"], answer: "Who" },
    { clues: ["good", "bad", "happy", "great"], answer: "How" },
    { clues: ["20 years old", "25 years old", "35 years old", "60 years old"], answer: "How old" }
  ];

  const $ = id => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const clueCloud = $("clueCloud");
  const feedback = $("feedback");
  const choices = [...document.querySelectorAll(".choice")];

  let current = 0;
  let score = 0;
  let streak = 0;
  let locked = false;

  $("year").textContent = new Date().getFullYear();

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function loadRound() {
    const round = rounds[current];
    locked = false;

    $("roundNumber").textContent = `${current + 1} / ${rounds.length}`;
    $("score").textContent = score;
    $("streak").textContent = streak;
    $("progressBar").style.width = `${(current / rounds.length) * 100}%`;

    feedback.textContent = "";
    feedback.className = "feedback";

    choices.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("correct", "wrong");
    });

    clueCloud.innerHTML = "";

    shuffle(round.clues).forEach(text => {
      const chip = document.createElement("div");
      chip.className = "clue";
      chip.textContent = text;
      clueCloud.appendChild(chip);
    });
  }

  function startGame() {
    current = 0;
    score = 0;
    streak = 0;

    startScreen.hidden = true;
    endScreen.hidden = true;
    gameScreen.hidden = false;

    loadRound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finishGame() {
    $("progressBar").style.width = "100%";
    $("finalScore").textContent = score;
    $("finalStreak").textContent = streak;

    gameScreen.hidden = true;
    endScreen.hidden = false;
  }

  function choose(button) {
    if (locked) return;

    const correct = button.dataset.answer === rounds[current].answer;

    if (correct) {
      locked = true;
      score += 100;
      streak += 1;

      button.classList.add("correct");
      choices.forEach(btn => btn.disabled = true);

      $("score").textContent = score;
      $("streak").textContent = streak;

      feedback.textContent = "✓ Correct!";
      feedback.className = "feedback good";

      setTimeout(() => {
        current++;
        if (current >= rounds.length) finishGame();
        else loadRound();
      }, 700);

    } else {
      streak = 0;
      $("streak").textContent = streak;

      button.classList.add("wrong");
      button.disabled = true;

      feedback.textContent = "✗ Try again.";
      feedback.className = "feedback bad";

      clueCloud.classList.remove("shake");
      void clueCloud.offsetWidth;
      clueCloud.classList.add("shake");

      setTimeout(() => {
        button.classList.remove("wrong");
        button.disabled = false;
      }, 500);
    }
  }

  choices.forEach(button => button.addEventListener("click", () => choose(button)));
  $("startButton").addEventListener("click", startGame);
  $("playAgain").addEventListener("click", startGame);

  const menuToggle = $("menuToggle");
  const mainNav = $("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", event => {
      if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
});
