/* Sentence Speaking – Clothes · AEF Starter Unit 9B */
const prompts = [
  { sentence: "I'm wearing a shirt and a skirt.", image: "https://cdn.imgurl.ir/uploads/n182445_a_shirt_and_a_st.png" },
  { sentence: "I'm wearing a red sweater.", image: "https://cdn.imgurl.ir/uploads/e340185_a_red_swer.png" },
  { sentence: "I'm wearing a new suit.", image: "https://cdn.imgurl.ir/uploads/j111_a_new_suit.png" },
  { sentence: "I'm wearing an old coat.", image: "https://cdn.imgurl.ir/uploads/r091876_an_old_coat.png" },
  { sentence: "I'm wearing a black jacket.", image: "https://cdn.imgurl.ir/uploads/y75934_a_black_jacket.png" },
  { sentence: "I'm wearing blue shoes.", image: "https://cdn.imgurl.ir/uploads/l4986_blue_shoes.png" },
  { sentence: "I'm wearing green sneakers.", image: "https://cdn.imgurl.ir/uploads/p38982_green_sneakers.png" }
];

const GAME_ID = "starter-9b-sentence-speaking";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const finishScreen = document.querySelector("#finishScreen");
const startButton = document.querySelector("#startButton");
const againButton = document.querySelector("#againButton");
const picture = document.querySelector("#picture");
const sentence = document.querySelector("#sentence");
const progressText = document.querySelector("#progressText");
const heard = document.querySelector("#heard");
const feedback = document.querySelector("#feedback");
const micButton = document.querySelector("#micButton");
const micText = document.querySelector("#micText");
const supportMessage = document.querySelector("#supportMessage");
const finishScore = document.querySelector("#finishScore");

let order = [];
let index = 0;
let score = 0;
let recognition = null;
let listening = false;
let answerLocked = false;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function currentPrompt() { return order[index]; }

function stopRecognition() {
  if (!recognition) return;
  try { recognition.stop(); } catch (_) {}
  listening = false;
  micButton.classList.remove("is-listening");
  micButton.setAttribute("aria-pressed", "false");
  micText.textContent = "Speak";
}

function setFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = "ss-feedback" + (type ? ` ${type}` : "");
}

function renderRound() {
  const prompt = currentPrompt();
  if (!prompt) return finishGame();
  answerLocked = false;
  picture.src = prompt.image;
  picture.alt = "Picture for: " + prompt.sentence;
  sentence.textContent = prompt.sentence;
  progressText.textContent = `${index + 1} / ${order.length}`;
  heard.textContent = "Press the microphone and speak.";
  setFeedback("", "");
  stopRecognition();
  exposeState();
}

function setupRecognition() {
  if (!SpeechRecognition) {
    micButton.disabled = true;
    supportMessage.textContent = "Voice recognition is not supported in this browser. Please use Chrome or Edge.";
    return false;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    micButton.classList.add("is-listening");
    micButton.setAttribute("aria-pressed", "true");
    micText.textContent = "Listening";
    heard.textContent = "Listening… say the sentence now.";
    setFeedback("", "");
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    heard.textContent = `Heard: “${transcript.trim()}”`;

    const finalResult = event.results[event.results.length - 1];
    if (finalResult && finalResult.isFinal) checkAnswer(transcript);
  };

  recognition.onerror = (event) => {
    listening = false;
    micButton.classList.remove("is-listening");
    micButton.setAttribute("aria-pressed", "false");
    micText.textContent = "Speak";
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setFeedback("Microphone access was blocked. Allow microphone access and try again.", "bad");
    } else if (event.error === "no-speech") {
      setFeedback("I didn't hear you. Press the microphone and try again.", "bad");
    } else {
      setFeedback("Voice recognition stopped. Press the microphone and try again.", "bad");
    }
  };

  recognition.onend = () => {
    listening = false;
    micButton.classList.remove("is-listening");
    micButton.setAttribute("aria-pressed", "false");
    micText.textContent = "Speak";
  };
  return true;
}

function startListening() {
  if (answerLocked) return;
  if (!SpeechRecognition) return;
  if (!recognition) setupRecognition();
  if (!recognition) return;
  if (listening) { stopRecognition(); return; }
  heard.textContent = "Listening… say the sentence now.";
  try { recognition.start(); }
  catch (_) { stopRecognition(); }
}

function checkAnswer(transcript) {
  if (answerLocked) return;
  const expected = normalize(currentPrompt().sentence);
  const spoken = normalize(transcript);
  if (spoken === expected) {
    answerLocked = true;
    stopRecognition();
    score += 1;
    setFeedback("✓ Correct!", "good");
    heard.textContent = `Heard: “${transcript.trim()}”`;
    try { if (window.LASfx) LASfx.play("correct"); } catch (_) {}
    window.setTimeout(() => {
      index += 1;
      if (index >= order.length) finishGame();
      else renderRound();
    }, 900);
  } else {
    setFeedback("Not accepted. Say exactly the sentence shown above.", "bad");
  }
}

function startGame() {
  if (window.LAFinish) { try { LAFinish.startTimer(); } catch (_) {} }
  stopRecognition();
  order = shuffle(prompts);
  index = 0;
  score = 0;
  startScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  setupRecognition();
  renderRound();
}

function finishGame() {
  stopRecognition();
  const total = prompts.length;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  try {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, accuracy);
    }
  } catch (_) {}
  finishScore.textContent = `${score} / ${total}`;
  document.querySelector("#finishMessage").textContent = `You completed all ${total} sentences with ${accuracy}% exact matches.`;
  gameScreen.classList.add("hidden");
  finishScreen.classList.remove("hidden");
  try {
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({gameId: GAME_ID,score,total,stars,timeMs,onAgain:startGame,onModes:()=>location.href="../",backHref:"../",save:false});
      return;
    }
  } catch (_) {}
  exposeState();
}

function exposeState() {
  window.__sentenceSpeakingState = { index, score, total: prompts.length, expected: currentPrompt()?.sentence || null, listening };
}

startButton.addEventListener("click", startGame);
againButton.addEventListener("click", startGame);
micButton.addEventListener("click", startListening);
setupRecognition();
exposeState();
