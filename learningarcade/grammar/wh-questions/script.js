document.addEventListener('DOMContentLoaded', () => {

  const rounds = [
    {
      cue: 'at school',
      words: ['Where', 'is', 'David', '?'],
      answers: ['he is at school', 'david is at school']
    },
    {
      cue: '25 years old',
      words: ['How', 'old', 'is', 'Ali', '?'],
      answers: ['he is 25 years old', 'ali is 25 years old', 'he is 25', 'ali is 25']
    },
    {
      cue: 'on Monday',
      words: ['When', 'is', 'the', 'class', '?'],
      answers: ['it is on monday', 'the class is on monday', 'it is monday', 'the class is monday']
    },
    {
      cue: 'with her brother',
      words: ['Who', 'is', 'with', 'Emma', '?'],
      answers: ['her brother is with emma', 'emma is with her brother', 'she is with her brother']
    },
    {
      cue: 'at home',
      words: ['Where', 'are', 'they', '?'],
      answers: ['they are at home']
    },
    {
      cue: 'happy',
      words: ['How', 'is', 'Tom', '?'],
      answers: ['he is happy', 'tom is happy']
    },
    {
      cue: 'a teacher',
      words: ['What', 'is', 'Mr. Lee', '?'],
      answers: ['he is a teacher', 'mr lee is a teacher']
    },
    {
      cue: 'in London',
      words: ['Where', 'are', 'they', '?'],
      answers: ['they are in london']
    },
    {
      cue: "at 8 o'clock",
      words: ['When', 'is', 'the', 'lesson', '?'],
      answers: ["it is at 8 o'clock", "the lesson is at 8 o'clock", 'it is at 8', 'the lesson is at 8']
    },
    {
      cue: '30 years old',
      words: ['How', 'old', 'is', 'Anna', '?'],
      answers: ['she is 30 years old', 'anna is 30 years old', 'she is 30', 'anna is 30']
    },
    {
      cue: 'friends',
      words: ['Who', 'are', 'they', '?'],
      answers: ['they are friends']
    },
    {
      cue: 'at home',
      words: ['Where', 'are', 'they', '?'],
      answers: ['they are at home']
    }
  ];

  const startScreen = document.getElementById('startScreen');
  const gameScreen = document.getElementById('gameScreen');
  const endScreen = document.getElementById('endScreen');

  const startBtn = document.getElementById('startBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const wordBank = document.getElementById('wordBank');
  const answerLine = document.getElementById('answerLine');

  const checkQuestionBtn = document.getElementById('checkQuestionBtn');
  const questionFeedback = document.getElementById('questionFeedback');

  const cueText = document.getElementById('cueText');
  const answerInput = document.getElementById('answerInput');
  const answerForm = document.getElementById('answerForm');
  const submitAnswerBtn = document.getElementById('submitAnswerBtn');
  const answerFeedback = document.getElementById('answerFeedback');

  const roundText = document.getElementById('roundText');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const finalScore = document.getElementById('finalScore');
  const finalStreak = document.getElementById('finalStreak');

  let index = 0;
  let score = 0;
  let streak = 0;
  let selected = [];

  const normalize = text =>
    String(text)
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/'s\b/g, ' is')
      .replace(/'re\b/g, ' are')
      .replace(/[.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const shuffle = array => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const setFeedback = (element, message = '', type = '') => {
    element.textContent = message;
    element.className = `feedback ${type}`;
  };

  function renderSelected() {
    answerLine.innerHTML = '';
    if (!selected.length) {
      answerLine.innerHTML = '<span class="empty-message">Click the words below to build your sentence.</span>';
      return;
    }

    selected.forEach((item, position) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile selected-tile';
      button.textContent = item.word;

      button.addEventListener('click', () => {
        const removed = selected.splice(position, 1)[0];
        const bankButton = wordBank.querySelector(`[data-id="${removed.id}"]`);
        if (bankButton) {
          bankButton.disabled = false;
          bankButton.classList.remove('used');
        }
        renderSelected();
      });

      answerLine.appendChild(button);
    });
  }

  function selectWord(button, word, id) {
    if (button.disabled || checkQuestionBtn.disabled) return;
    selected.push({ word, id });
    button.disabled = true;
    button.classList.add('used');
    renderSelected();
  }

  function loadRound() {
    const round = rounds[index];
    selected = [];

    roundText.textContent = `${index + 1} / ${rounds.length}`;
    scoreEl.textContent = score;
    streakEl.textContent = streak;

    renderSelected();
    wordBank.innerHTML = '';

    shuffle(round.words.map((word, id) => ({ word, id }))).forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile';
      button.textContent = item.word;
      button.dataset.id = item.id;
      button.addEventListener('click', () => selectWord(button, item.word, item.id));
      wordBank.appendChild(button);
    });

    setFeedback(questionFeedback);
    setFeedback(answerFeedback);

    cueText.textContent = 'Solve Step 1 First';
    answerInput.disabled = true;
    submitAnswerBtn.disabled = true;
    answerInput.value = '';
    checkQuestionBtn.disabled = false;
  }

  function handleCheckQuestion() {
    if (checkQuestionBtn.disabled) return;
    const round = rounds[index];

    if (!selected.length) {
      setFeedback(questionFeedback, 'Choose the words first.', 'bad');
      answerLine.classList.add('shake');
      setTimeout(() => answerLine.classList.remove('shake'), 400);
      return;
    }

    const built = selected.map(item => item.word).join(' ');
    if (normalize(built) === normalize(round.words.join(' '))) {
      setFeedback(questionFeedback, '✓ Correct question! Now type your full sentence below.', 'good');

      cueText.textContent = `"${round.cue}"`;
      answerInput.disabled = false;
      submitAnswerBtn.disabled = false;
      checkQuestionBtn.disabled = true;

      setTimeout(() => answerInput.focus(), 50);
    } else {
      setFeedback(questionFeedback, '✗ Not quite. Check the word order.', 'bad');
      answerLine.classList.add('shake');
      setTimeout(() => answerLine.classList.remove('shake'), 400);
    }
  }

  checkQuestionBtn.addEventListener('click', handleCheckQuestion);

  answerForm.addEventListener('submit', event => {
    event.preventDefault();
    if (answerInput.disabled) return;

    const value = normalize(answerInput.value);
    if (!value) {
      setFeedback(answerFeedback, 'Please type a full answer.', 'bad');
      answerInput.focus();
      return;
    }

    const round = rounds[index];
    if (round.answers.some(answer => normalize(answer) === value)) {
      score += 100;
      streak += 1;
      scoreEl.textContent = score;
      streakEl.textContent = streak;

      setFeedback(answerFeedback, '✓ Correct answer!', 'good');
      answerInput.disabled = true;
      submitAnswerBtn.disabled = true;

      setTimeout(() => {
        index += 1;
        if (index >= rounds.length) {
          finishGame();
        } else {
          loadRound();
        }
      }, 800);
    } else {
      streak = 0;
      streakEl.textContent = streak;
      setFeedback(answerFeedback, '✗ Try again. Write a full sentence using the target cue.', 'bad');
      answerInput.focus();
      answerInput.select();
    }
  });

  function startGame() {
    index = 0;
    score = 0;
    streak = 0;

    startScreen.hidden = true;
    endScreen.hidden = true;
    gameScreen.hidden = false;

    loadRound();
  }

  function finishGame() {
    gameScreen.hidden = true;
    endScreen.hidden = false;
    finalScore.textContent = score;
    finalStreak.textContent = streak;

    // Stars for Be Verbs hub (0–3)
    (function saveGameStars() {
      var stars = score >= 1000 ? 3 : score >= 600 ? 2 : score >= 200 ? 1 : 0;
      var data = {};
      try { data = JSON.parse(localStorage.getItem("laGameStars") || "{}") || {}; } catch (e) { data = {}; }
      var prev = Number(data["be-verbs"] || 0);
      if (stars > prev) {
        data["be-verbs"] = stars;
        try { localStorage.setItem("laGameStars", JSON.stringify(data)); } catch (e) {}
      }
    })();
  
  try { if(window.LAStars){LAStars.recordPlay("wh-questions");LAStars.save("wh-questions", typeof correct!=="undefined"&&typeof total!=="undefined"? (correct/Math.max(1,total)>=0.9?3:correct/Math.max(1,total)>=0.7?2:1):2);} } catch (e) {}
}

  startBtn.addEventListener('click', startGame);
  playAgainBtn.addEventListener('click', startGame);

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !gameScreen.hidden && !checkQuestionBtn.disabled) {
      event.preventDefault();
      handleCheckQuestion();
    }
  });
});