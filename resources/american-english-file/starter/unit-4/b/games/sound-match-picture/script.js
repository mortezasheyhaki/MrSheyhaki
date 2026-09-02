/* Learning Arcade style: the sound is the prompt; sixteen soft-square photo cards are the choices. */
const prompts = [
  { word: 'big', image: '01-big.jpg', audio: '01-big.mp3' },
  { word: 'small', image: '02-small.jpg', audio: '02-small.mp3' },
  { word: 'old', image: '03-old.jpg', audio: '03-old.mp3' },
  { word: 'new', image: '04-new.jpg', audio: '04-new.mp3' },
  { word: 'fast', image: '05-fast.jpg', audio: '05-fast.mp3' },
  { word: 'slow', image: '06-slow.jpg', audio: '06-slow.mp3' },
  { word: 'beautiful', image: '07-beautiful.jpg', audio: '07-beautiful.mp3' },
  { word: 'ugly', image: '08-ugly.jpg', audio: '08-ugly.mp3' },
  { word: 'cheap', image: '09-cheap.jpg', audio: '09-cheap.mp3' },
  { word: 'expensive', image: '10-expensive.jpg', audio: '10-expensive.mp3' },
  { word: 'long', image: '11-long.jpg', audio: '11-long.mp3' },
  { word: 'short', image: '12-short.jpg', audio: '12-short.mp3' },
  { word: 'clean', image: '13-clean.jpg', audio: '13-clean.mp3' },
  { word: 'dirty', image: '14-dirty.jpg', audio: '14-dirty.mp3' },
  { word: 'easy', image: '15-easy.jpg', audio: '15-easy.mp3' },
  { word: 'difficult', image: '16-difficult.jpg', audio: '16-difficult.mp3' }
];

const startScreen = document.querySelector('#startScreen');
const gameScreen = document.querySelector('#gameScreen');
const finishScreen = document.querySelector('#finishScreen');
const pictureGrid = document.querySelector('#pictureGrid');
const roundLabel = document.querySelector('#roundLabel');
const progressFill = document.querySelector('#progressFill');
const scoreValue = document.querySelector('#scoreValue');
const finishScore = document.querySelector('#finishScore');
const feedback = document.querySelector('#feedback');
const listenButton = document.querySelector('#listenButton');

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
  currentAudio = new Audio(`audio/clips/${prompt.audio}`);
  currentAudio.preload = 'auto';
  currentAudio.play().catch(() => {
    feedback.textContent = 'Tap “Listen again” to play the sound.';
  });
}

function renderTiles() {
  pictureGrid.innerHTML = '';
  tileOrder.forEach((prompt, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picture-card';
    button.dataset.word = prompt.word;
    button.dataset.choice = String(index + 1);
    button.setAttribute('aria-label', `Picture ${index + 1}`);
    button.innerHTML = `<img src="images/${prompt.image}" alt="" draggable="false" />`;
    button.addEventListener('click', () => selectPicture(prompt, button));
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
  feedback.className = 'feedback';
  feedback.textContent = 'Tap a picture after you listen.';
  window.setTimeout(playCurrentSound, 220);
  exposeState();
}

function selectPicture(selectedPrompt, button) {
  if (!acceptingAnswer || button.disabled) return;

  if (selectedPrompt.word !== currentPrompt().word) {
    button.classList.remove('wrong');
    void button.offsetWidth;
    button.classList.add('wrong');
    feedback.className = 'feedback incorrect';
    feedback.textContent = 'Not this one. Listen again and try another picture.';
    window.setTimeout(() => button.classList.remove('wrong'), 650);
    return;
  }

  acceptingAnswer = false;
  stopCurrentAudio();
  button.disabled = true;
  button.classList.add('matched');
  score += 1;
  feedback.className = 'feedback correct';
  feedback.textContent = `Great! That sound was “${selectedPrompt.word}.”`;
  updateHud();
  exposeState();
  window.setTimeout(() => {
    roundIndex += 1;
    beginRound();
  }, 820);
}

function showFinish() {
  stopCurrentAudio();
  gameScreen.classList.add('hidden');
  finishScreen.classList.remove('hidden');
  finishScore.textContent = String(score);
  exposeState();
  const acc = prompts.length ? Math.round((score / prompts.length) * 100) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 1;
  const starRow = document.querySelector('#finishStars');
  if (starRow) {
    starRow.innerHTML = [1, 2, 3].map((n) =>
      `<span class="star ${n <= stars ? 'is-filled' : ''}">${n <= stars ? '★' : '☆'}</span>`
    ).join('');
  }
  try {
    if (window.LAStars) {
      LAStars.recordPlay('sound-match-picture');
      LAStars.saveFromAccuracy('sound-match-picture', acc);
    }
  } catch (e) {}
  prepareScoreSubmit();
}

function prepareScoreSubmit() {
  const input = document.querySelector('#playerNameInput');
  const status = document.querySelector('#scoreSubmitStatus');
  const btn = document.querySelector('#submitScoreBtn');
  if (!input || !btn || typeof LAScores === 'undefined') return;
  input.value = LAScores.getPlayerName();
  status.textContent = '';
  status.className = 'score-submit-status';
  btn.disabled = false;
  btn.textContent = 'Save score';
}

function submitScore() {
  const input = document.querySelector('#playerNameInput');
  const status = document.querySelector('#scoreSubmitStatus');
  const btn = document.querySelector('#submitScoreBtn');
  if (!input || !btn || typeof LAScores === 'undefined') return;
  const name = input.value.trim();
  if (!name) {
    status.textContent = 'Please enter your name.';
    status.className = 'score-submit-status is-err';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Saving…';
  status.textContent = '';
  status.className = 'score-submit-status';
  LAScores.submit({
    gameId: 'sound-match-picture',
    gameName: 'Sound Match Picture',
    score: score,
    maxScore: prompts.length,
    name: name
  }).then((res) => {
    if (res.ok) {
      status.textContent = 'Score saved!';
      status.className = 'score-submit-status is-ok';
      btn.textContent = 'Saved';
    } else {
      status.textContent = res.error || 'Could not save. Check Firebase rules.';
      status.className = 'score-submit-status is-err';
      btn.disabled = false;
      btn.textContent = 'Save score';
    }
  });
}

document.querySelector('#submitScoreBtn')?.addEventListener('click', submitScore);


function startGame() {
  stopCurrentAudio();
  promptOrder = shuffle(prompts);
  tileOrder = shuffle(prompts);
  roundIndex = 0;
  score = 0;
  startScreen.classList.add('hidden');
  finishScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  renderTiles();
  beginRound();
}

function goHome() {
  stopCurrentAudio();
  gameScreen.classList.add('hidden');
  finishScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  exposeState();
}

function exposeState() {
  window.__soundMatchState = {
    activeWord: currentPrompt()?.word || null,
    roundIndex,
    score,
    promptCount: prompts.length,
    acceptingAnswer,
    matchedCount: document.querySelectorAll('.picture-card.matched').length
  };
}

document.querySelector('#startButton').addEventListener('click', startGame);
document.querySelector('#restartButton').addEventListener('click', startGame);
document.querySelector('#homeFromGame').addEventListener('click', goHome);
listenButton.addEventListener('click', playCurrentSound);
document.querySelector('#homeButton').addEventListener('click', goHome);
document.querySelector('#replayButton').addEventListener('click', startGame);
exposeState();
