
/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

/* Learning Arcade style: the sound is the prompt; sixteen soft-square photo cards are the choices. */
const prompts = [
  { word: 'big', image: 'https://cdn.imgurl.ir/uploads/g670659_01-big.png', audio: 'https://cdn.imgurl.ir/uploads/s4775_01-big.mp3' },
  { word: 'small', image: 'https://cdn.imgurl.ir/uploads/t1519_02-small.png', audio: 'https://cdn.imgurl.ir/uploads/m45482_02-small.mp3' },
  { word: 'old', image: 'https://cdn.imgurl.ir/uploads/g107492_03-old.png', audio: 'https://cdn.imgurl.ir/uploads/r37117_03-old.mp3' },
  { word: 'new', image: 'https://cdn.imgurl.ir/uploads/a435649_04-new.png', audio: 'https://cdn.imgurl.ir/uploads/v83131_04-new.mp3' },
  { word: 'fast', image: 'https://cdn.imgurl.ir/uploads/c385481_05-fast.png', audio: 'https://cdn.imgurl.ir/uploads/l3102_05-fast.mp3' },
  { word: 'slow', image: 'https://cdn.imgurl.ir/uploads/l571094_06-slow.png', audio: 'https://cdn.imgurl.ir/uploads/m184684_06-slow.mp3' },
  { word: 'beautiful', image: 'https://cdn.imgurl.ir/uploads/z59390_07-beautiful.png', audio: 'https://cdn.imgurl.ir/uploads/c52036_07-beautiful.mp3' },
  { word: 'ugly', image: 'https://cdn.imgurl.ir/uploads/116527_08-ugly.png', audio: 'https://cdn.imgurl.ir/uploads/h06593_08-ugly.mp3' },
  { word: 'cheap', image: 'https://cdn.imgurl.ir/uploads/d311862_09-cheap.png', audio: 'https://cdn.imgurl.ir/uploads/l078276_09-cheap.mp3' },
  { word: 'expensive', image: 'https://cdn.imgurl.ir/uploads/u546865_10-expensive.png', audio: 'https://cdn.imgurl.ir/uploads/o094312_10-expensive.mp3' },
  { word: 'long', image: 'https://cdn.imgurl.ir/uploads/e872442_11-long.png', audio: 'https://cdn.imgurl.ir/uploads/c497284_11-long.mp3' },
  { word: 'short', image: 'https://cdn.imgurl.ir/uploads/p742576_12-short.png', audio: 'https://cdn.imgurl.ir/uploads/y898374_12-short.mp3' },
  { word: 'clean', image: 'https://cdn.imgurl.ir/uploads/p70660_13-clean.png', audio: 'https://cdn.imgurl.ir/uploads/c30302_13-clean.mp3' },
  { word: 'dirty', image: 'https://cdn.imgurl.ir/uploads/g324672_14-dirty.png', audio: 'https://cdn.imgurl.ir/uploads/n496258_14-dirty.mp3' },
  { word: 'easy', image: 'https://cdn.imgurl.ir/uploads/r836255_15-easy.png', audio: 'https://cdn.imgurl.ir/uploads/k669792_15-easy.mp3' },
  { word: 'difficult', image: 'https://cdn.imgurl.ir/uploads/h54048_16-difficult.png', audio: 'https://cdn.imgurl.ir/uploads/b3587_16-difficult.mp3' }
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
  currentAudio = new Audio(prompt.audio);
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
    button.innerHTML = `<img src="${prompt.image}" alt="" draggable="false" />`;
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
    feedback.textContent = 'Not this one. Listen again and try another picture.'; try{sfxWrong();}catch(e){}
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
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: 'starter-4b-sound-match-picture',
          score: score,
          total: prompts.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => goHome(),
          backHref: "../"
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }

  stopCurrentAudio();
  gameScreen.classList.add('hidden');
  finishScreen.classList.remove('hidden');
  document.body.classList.remove('is-playing');
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
      LAStars.recordPlay('starter-4b-sound-match-picture');
      LAStars.saveFromAccuracy('starter-4b-sound-match-picture', acc);
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
    if (window.LAFinish) LAFinish.startTimer();
  stopCurrentAudio();
  promptOrder = shuffle(prompts);
  tileOrder = shuffle(prompts);
  roundIndex = 0;
  score = 0;
  startScreen.classList.add('hidden');
  finishScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  document.body.classList.add('is-playing');
  renderTiles();
  beginRound();
}

function goHome() {
  stopCurrentAudio();
  gameScreen.classList.add('hidden');
  finishScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  document.body.classList.remove('is-playing');
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
