/* Sara's Daily Routine — three-stage, photo-led simple-present writing game. */
(() => {
  'use strict';
  const STAGES = [
    { key: 'morning', title: 'Morning routine', phrase: 'In the morning', actions: [
      ['Get up at 7', 'gets up at 7', '01-get-up.jpg'], ['Have breakfast', 'has breakfast', '02-have-breakfast.jpg'], ['Take a shower', 'takes a shower', '03-take-a-shower.jpg'], ['Go to work', 'goes to work', '04-go-to-work.jpg'], ['Have a coffee', 'has a coffee', '05-have-a-coffee.jpg']
    ]},
    { key: 'afternoon', title: 'Afternoon routine', phrase: 'In the afternoon', actions: [
      ['Have lunch at 1', 'has lunch at 1', '06-have-lunch.jpg'], ['Finish work at 6', 'finishes work at 6', '07-finish-work.jpg'], ['Go home', 'goes home', '08-go-home.jpg'], ['Go shopping', 'goes shopping', '09-go-shopping.jpg'], ['Go to the gym', 'goes to the gym', '10-go-to-the-gym.jpg']
    ]},
    { key: 'evening', title: 'Evening routine', phrase: 'In the evening', actions: [
      ['Make dinner', 'makes dinner', '11-make-dinner.jpg'], ['Have dinner at 8:30', 'has dinner at 8:30', '12-have-dinner.jpg'], ['Do housework', 'does housework', '13-do-housework.jpg'], ['Watch TV', 'watches tv', '14-watch-tv.jpg'], ['Go to bed at 11:30', 'goes to bed at 11:30', '15-go-to-bed.jpg']
    ]}
  ];
  const state = { stage: 0, entries: {} };
  const $ = (id) => document.getElementById(id);
  const normalise = (text) => String(text || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9:\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const stageData = () => STAGES[state.stage];

  function renderTabs() {
    const tabs = $('stageTabs'); tabs.textContent = '';
    STAGES.forEach((stage, index) => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = `stage-tab ${index === state.stage ? 'is-current' : ''} ${state.entries[stage.key] ? 'is-complete' : ''}`;
      button.disabled = index > state.stage; button.innerHTML = `<span class="stage-index">Stage ${index + 1}</span>${stage.key}`;
      tabs.appendChild(button);
    });
  }
  function renderPhotos() {
    const grid = $('photosGrid'); grid.textContent = '';
    stageData().actions.forEach(([base, , photo], index) => {
      const card = document.createElement('article'); card.className = 'photo-card';
      card.innerHTML = `<span class="photo-number" aria-hidden="true">${index + 1}</span><img src="images/${photo}" alt="Sara: ${base}" /><strong class="verb-label">${base}</strong>`;
      grid.appendChild(card);
    });
  }
  function renderStage() {
    const current = stageData(); renderTabs(); renderPhotos();
    $('stageCounter').textContent = `Stage ${state.stage + 1} of 3`;
    $('stageEyebrow').textContent = current.phrase;
    $('stageTitle').textContent = current.title;
    $('answerStem').textContent = `${current.phrase}, Sara...`;
    $('stageAnswer').value = state.entries[current.key] || '';
    $('submitButton').innerHTML = state.stage === STAGES.length - 1 ? 'Finish game <span aria-hidden="true">→</span>' : `Submit ${current.key} <span aria-hidden="true">→</span>`;
    $('feedback').textContent = ''; $('feedback').className = 'feedback'; updateWordCount();
  }
  function updateWordCount() {
    const words = $('stageAnswer').value.trim().split(/\s+/).filter(Boolean).length;
    $('wordCount').textContent = `${words} word${words === 1 ? '' : 's'}`;
  }
  function setFeedback(text, tone) { const item = $('feedback'); item.textContent = text; item.className = `feedback ${tone}`; }
  function validateParagraph() {
    const raw = $('stageAnswer').value.trim(); const value = normalise(raw); const current = stageData();
    if (!raw) return 'Write Sara’s routine before submitting this stage.';
    if (!/\b(sara|she)\b/.test(value)) return 'Use “Sara” or “She” in your paragraph.';
    const missing = current.actions.filter(([, form]) => !value.includes(normalise(form))).map(([base]) => base);
    if (missing.length) return `Use every picture action. Still missing: ${missing.join(', ')}.`;
    if (!/[.!?]$/.test(raw)) return 'Finish your paragraph with a full stop, question mark, or exclamation mark.';
    return '';
  }
  function submitStage() {
    const error = validateParagraph(); if (error) return setFeedback(error, 'warn');
    const current = stageData(); state.entries[current.key] = $('stageAnswer').value.trim();
    if (state.stage < STAGES.length - 1) { state.stage += 1; renderStage(); window.scrollTo({ top: 0, behavior: 'smooth' }); setFeedback(`Great work. Now write Sara’s ${stageData().key} routine.`, 'good'); }
    else renderFinish();
  }
  function renderFinish() {
    $('gameScreen').classList.add('is-hidden'); $('finishScreen').classList.remove('is-hidden');
    const starRow = $('finishStars');
    if (starRow) {
      starRow.innerHTML = [1,2,3].map(n => `<span class="star is-filled">★</span>`).join('');
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay('writing-sara-daily');
        LAStars.save('writing-sara-daily', 3);
      }
    } catch (e) {}
    const summary = $('storySummary'); summary.textContent = '';
    STAGES.forEach((stage) => { const entry = document.createElement('article'); entry.className = 'story-entry'; entry.innerHTML = `<h3>${stage.phrase}</h3><p></p>`; entry.querySelector('p').textContent = state.entries[stage.key]; summary.appendChild(entry); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function startGame() { $('startScreen').classList.add('is-hidden'); $('finishScreen').classList.add('is-hidden'); $('gameScreen').classList.remove('is-hidden'); renderStage(); }
  function resetGame() { state.stage = 0; state.entries = {}; startGame(); }
  $('startButton').addEventListener('click', startGame); $('submitButton').addEventListener('click', submitStage); $('stageAnswer').addEventListener('input', updateWordCount);
  $('hintButton').addEventListener('click', () => { const current = stageData(); const start = `${current.phrase}, Sara ${current.actions[0][1]}.`; if (!$('stageAnswer').value.trim()) $('stageAnswer').value = `${start} `; $('stageAnswer').focus(); updateWordCount(); setFeedback('Use the base-form cards to continue this paragraph.', 'good'); });
  $('againButton').addEventListener('click', resetGame); $('backButton').addEventListener('click', () => { $('finishScreen').classList.add('is-hidden'); $('startScreen').classList.remove('is-hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
