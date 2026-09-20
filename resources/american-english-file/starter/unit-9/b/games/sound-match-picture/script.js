/* Sound Match Picture – Clothes · AEF Starter Unit 9B
   Layout from unit 4B; audio + images from Write the Clothes 9B */
const prompts = [
  { word: "cap", image: "https://cdn.imgurl.ir/uploads/b4742_cap.png", audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3" },
  { word: "coat", image: "https://cdn.imgurl.ir/uploads/w043594_coat.png", audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3" },
  { word: "dress", image: "https://cdn.imgurl.ir/uploads/d995053_dress.png", audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3" },
  { word: "hat", image: "https://cdn.imgurl.ir/uploads/o3351_hat.png", audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3" },
  { word: "jacket", image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png", audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3" },
  { word: "jeans", image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png", audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3" },
  { word: "pants", image: "https://cdn.imgurl.ir/uploads/i04627_pants.png", audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3" },
  { word: "shirt", image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png", audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3" },
  { word: "shoes", image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png", audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3" },
  { word: "shorts", image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png", audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3" },
  { word: "skirt", image: "https://cdn.imgurl.ir/uploads/a444189_st.png", audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3" },
  { word: "sneakers", image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png", audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3" },
  { word: "socks", image: "https://cdn.imgurl.ir/uploads/k600200_socks.png", audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3" },
  { word: "suit", image: "https://cdn.imgurl.ir/uploads/e98017_suit.png", audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3" },
  { word: "sweater", image: "https://cdn.imgurl.ir/uploads/x441494_swer.png", audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3" },
  { word: "T-shirt", image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png", audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3" },
];

const GAME_ID = "starter-9b-sound-match-picture";

const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const finishScreen = document.querySelector("#finishScreen");
const pictureGrid = document.querySelector("#pictureGrid");
const roundLabel = document.querySelector("#roundLabel");
const progressFill = document.querySelector("#progressFill");
const scoreValue = document.querySelector("#scoreValue");
const finishScore = document.querySelector("#finishScore");
const feedback = document.querySelector("#feedback");
const listenButton = document.querySelector("#listenButton");

let promptOrder = [];
let tileOrder = [];
let roundIndex = 0;
let score = 0;
let acceptingAnswer = false;
let currentAudio = null;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const chosen = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[chosen]] = [copy[chosen], copy[index]];
  }
  return copy;
}

function currentPrompt() {
  return promptOrder[roundIndex];
}

function stopCurrentAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
}

function playCurrentSound() {
  const prompt = currentPrompt();
  if (!prompt) return;
  stopCurrentAudio();
  currentAudio = new Audio(prompt.audio);
  currentAudio.preload = "auto";
  currentAudio.play().catch(() => {
    feedback.textContent = "Tap “Listen again” to play the sound.";
  });
}

function renderTiles() {
  pictureGrid.innerHTML = "";
  tileOrder.forEach((prompt, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "picture-card";
    button.dataset.word = prompt.word;
    button.dataset.choice = String(index + 1);
    button.setAttribute("aria-label", `Picture ${index + 1}`);
    button.innerHTML = `<img src="${prompt.image}" alt="" draggable="false" />`;
    button.addEventListener("click", () => selectPicture(prompt, button));
    pictureGrid.append(button);
  });
}

function updateHud() {
  const complete = score;
  roundLabel.textContent = `Sound ${Math.min(roundIndex + 1, prompts.length)} of ${prompts.length}`;
  scoreValue.textContent = String(score);
  progressFill.style.width = `${(complete / prompts.length) * 100}%`;
}

function beginRound() {
  const prompt = currentPrompt();
  if (!prompt) {
    showFinish();
    return;
  }
  acceptingAnswer = true;
  updateHud();
  feedback.className = "feedback";
  feedback.textContent = "Tap a picture after you listen.";
  window.setTimeout(playCurrentSound, 220);
  exposeState();
}

function selectPicture(selectedPrompt, button) {
  if (!acceptingAnswer || button.disabled) return;

  if (selectedPrompt.word !== currentPrompt().word) {
    button.classList.remove("wrong");
    void button.offsetWidth;
    button.classList.add("wrong");
    feedback.className = "feedback incorrect";
    feedback.textContent = "Not this one. Listen again and try another picture.";
    window.setTimeout(() => button.classList.remove("wrong"), 650);
    return;
  }

  acceptingAnswer = false;
  stopCurrentAudio();
  button.disabled = true;
  button.classList.add("matched");
  score += 1;
  feedback.className = "feedback correct";
  feedback.textContent = `Great! That sound was “${selectedPrompt.word}.”`;
  updateHud();
  exposeState();
  window.setTimeout(() => {
    roundIndex += 1;
    beginRound();
  }, 820);
}

function showFinish() {
  // Always persist stars/plays first (LAFinish may return early)
  const acc = prompts.length ? Math.round((score / prompts.length) * 100) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
  try {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, acc);
    }
  } catch (e) {}

  if (window.LAFinish) {
    try {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: prompts.length,
        stars: stars,
        timeMs: timeMs,
        onAgain: () => startGame(),
        onModes: () => goHome(),
        backHref: "../",
        save: false, // already saved above
      });
      return;
    } catch (e) {
      console.warn("LAFinish", e);
    }
  }

  stopCurrentAudio();
  gameScreen.classList.add("hidden");
  finishScreen.classList.remove("hidden");
  finishScore.textContent = String(score);
  exposeState();
  const starRow = document.querySelector("#finishStars");
  if (starRow) {
    starRow.innerHTML = [1, 2, 3]
      .map(
        (n) =>
          `<span class="star ${n <= stars ? "is-filled" : ""}">${n <= stars ? "★" : "☆"}</span>`
      )
      .join("");
  }
  prepareScoreSubmit();
}

function prepareScoreSubmit() {
  const input = document.querySelector("#playerNameInput");
  const status = document.querySelector("#scoreSubmitStatus");
  const btn = document.querySelector("#submitScoreBtn");
  if (!input || !btn || typeof LAScores === "undefined") return;
  input.value = LAScores.getPlayerName();
  status.textContent = "";
  status.className = "score-submit-status";
  btn.disabled = false;
  btn.textContent = "Save score";
}

function submitScore() {
  const input = document.querySelector("#playerNameInput");
  const status = document.querySelector("#scoreSubmitStatus");
  const btn = document.querySelector("#submitScoreBtn");
  if (!input || !btn || typeof LAScores === "undefined") return;
  const name = input.value.trim();
  if (!name) {
    status.textContent = "Please enter your name.";
    status.className = "score-submit-status is-err";
    return;
  }
  btn.disabled = true;
  btn.textContent = "Saving…";
  status.textContent = "";
  status.className = "score-submit-status";
  LAScores.submit({
    gameId: "sound-match-picture-clothes",
    gameName: "Sound Match Picture – Clothes",
    score: score,
    maxScore: prompts.length,
    name: name,
  }).then((res) => {
    if (res.ok) {
      status.textContent = "Score saved!";
      status.className = "score-submit-status is-ok";
      btn.textContent = "Saved";
    } else {
      status.textContent = res.error || "Could not save. Check Firebase rules.";
      status.className = "score-submit-status is-err";
      btn.disabled = false;
      btn.textContent = "Save score";
    }
  });
}

document.querySelector("#submitScoreBtn")?.addEventListener("click", submitScore);

function startGame() {
  if (window.LAFinish) LAFinish.startTimer();
  stopCurrentAudio();
  promptOrder = shuffle(prompts);
  tileOrder = shuffle(prompts);
  roundIndex = 0;
  score = 0;
  startScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  renderTiles();
  beginRound();
}

function goHome() {
  stopCurrentAudio();
  gameScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  exposeState();
}

function exposeState() {
  window.__soundMatchState = {
    activeWord: currentPrompt()?.word || null,
    roundIndex,
    score,
    promptCount: prompts.length,
    acceptingAnswer,
    matchedCount: document.querySelectorAll(".picture-card.matched").length,
  };
}

document.querySelector("#startButton").addEventListener("click", startGame);
document.querySelector("#restartButton").addEventListener("click", startGame);
document.querySelector("#homeFromGame").addEventListener("click", goHome);
listenButton.addEventListener("click", playCurrentSound);
document.querySelector("#homeButton").addEventListener("click", goHome);
document.querySelector("#replayButton").addEventListener("click", startGame);
exposeState();
