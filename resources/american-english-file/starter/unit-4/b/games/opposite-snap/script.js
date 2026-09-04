/* Opposite Snap — adjective opposites practice for MrSheyhaki.ir */
(() => {
  'use strict';
  const ROUNDS = [
    { word: 'big', opposite: 'small', photo: '01-big.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'old', opposite: 'new', photo: '03-old.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'fast', opposite: 'slow', photo: '05-fast.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'beautiful', opposite: 'ugly', photo: '07-beautiful.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'cheap', opposite: 'expensive', photo: '09-cheap.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'long', opposite: 'short', photo: '11-long.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'clean', opposite: 'dirty', photo: '13-clean.jpg', clue: 'Look at the photo. Tap the opposite adjective.' },
    { word: 'easy', opposite: 'difficult', photo: '15-easy.jpg', clue: 'Look at the photo. Tap the opposite adjective.' }
  ];
  const DISTRACTORS = ['beautiful', 'cheap', 'clean', 'difficult', 'easy', 'expensive', 'fast', 'slow', 'long', 'short', 'new', 'old', 'small', 'ugly'];
  const state = { order: [], index: 0, score: 0, streak: 0, locked: false };
  const $ = (id) => document.getElementById(id);
  const shuffled = (items) => {
    const output = [...items];
    for (let i = output.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [output[i], output[j]] = [output[j], output[i]];
    }
    return output;
  };
  function current() { return state.order[state.index]; }
  function options(round) {
    const fillers = shuffled(DISTRACTORS.filter((word) => word !== round.word && word !== round.opposite)).slice(0, 3);
    return shuffled([round.opposite, ...fillers]);
  }
  function renderRound() {
    const round = current();
    state.locked = false;
    $('roundLabel').textContent = `Round ${state.index + 1} of ${ROUNDS.length}`;
    $('score').textContent = state.score;
    $('streak').textContent = state.streak;
    $('progressFill').style.width = `${(state.index / ROUNDS.length) * 100}%`;
    $('targetWord').textContent = round.word;
    $('clueText').textContent = round.clue;
    const scene = $('visualScene');
    scene.className = 'visual-scene';
    scene.innerHTML = `<img src="images/${round.photo}" alt="Photo showing ${round.word}" />`;
    const choices = $('choices');
    choices.textContent = '';
    options(round).forEach((word) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.textContent = word;
      button.addEventListener('click', () => choose(word, button));
      choices.appendChild(button);
    });
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';
  }
  function choose(word, button) {
    if (state.locked) return;
    state.locked = true;
    const round = current();
    const buttons = [...document.querySelectorAll('.choice')];
    buttons.forEach((item) => {
      item.disabled = true;
      if (item.textContent === round.opposite) item.classList.add('is-correct');
    });
    const correct = word === round.opposite;
    if (correct) {
      state.score += 10 + state.streak * 2;
      state.streak += 1;
      $('feedback').textContent = `Snap! ${round.word} ↔ ${round.opposite}.`;
      $('feedback').className = 'feedback good';
    } else {
      state.streak = 0;
      button.classList.add('is-wrong');
      $('feedback').textContent = `Not quite. The opposite of ${round.word} is ${round.opposite}.`;
      $('feedback').className = 'feedback warn';
    }
    // Do NOT show the opposite (answer) photo — keep only the target image
    window.setTimeout(() => {
      state.index += 1;
      if (state.index < state.order.length) renderRound();
      else finish();
    }, 700);
  }
  function start() {
    state.order = shuffled(ROUNDS);
    state.index = 0;
    state.score = 0;
    state.streak = 0;
    $('startScreen').classList.add('is-hidden');
    $('finishScreen').classList.add('is-hidden');
    $('gameScreen').classList.remove('is-hidden');
    renderRound();
  }
  function finish() {
    $('gameScreen').classList.add('is-hidden');
    $('finishScreen').classList.remove('is-hidden');
    $('finishScore').textContent = `Final score: ${state.score} · You practiced all 8 opposite pairs.`;
    $('progressFill').style.width = '100%';
    const recap = $('pairRecap');
    recap.textContent = '';
    ROUNDS.forEach((round) => {
      const pair = document.createElement('span');
      pair.textContent = `${round.word} ↔ ${round.opposite}`;
      recap.appendChild(pair);
    });
    // Stars: streak-aware score thresholds (max ~ roughly 120+)
    const stars = state.score >= 120 ? 3 : state.score >= 80 ? 2 : state.score >= 40 ? 1 : 1;
    const starRow = $('finishStars');
    if (starRow) {
      starRow.innerHTML = [1, 2, 3].map((n) =>
        `<span class="star ${n <= stars ? 'is-filled' : ''}" data-n="${n}">${n <= stars ? '★' : '☆'}</span>`
      ).join('');
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay('starter-4b-opposite-snap');
        LAStars.save('starter-4b-opposite-snap', stars);
      }
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
    prepareScoreSubmit();
  }

  function prepareScoreSubmit() {
    const input = $('playerNameInput');
    const status = $('scoreSubmitStatus');
    const btn = $('submitScoreBtn');
    if (!input || !btn || typeof LAScores === 'undefined') return;
    input.value = LAScores.getPlayerName();
    status.textContent = '';
    status.className = 'score-submit-status';
    btn.disabled = false;
    btn.textContent = 'Save score';
  }

  function submitScore() {
    const input = $('playerNameInput');
    const status = $('scoreSubmitStatus');
    const btn = $('submitScoreBtn');
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
      gameId: 'opposite-snap',
      gameName: 'Opposite Snap',
      score: state.score,
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

  if ($('submitScoreBtn')) {
    $('submitScoreBtn').addEventListener('click', submitScore);
  }

  $('startButton').addEventListener('click', start);
  $('againButton').addEventListener('click', start);
  $('homeButton').addEventListener('click', () => {
    $('finishScreen').classList.add('is-hidden');
    $('startScreen').classList.remove('is-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
