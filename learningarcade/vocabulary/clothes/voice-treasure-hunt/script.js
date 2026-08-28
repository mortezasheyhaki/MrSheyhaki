(function () {
  const ITEMS = [
    { id: 'sweater', word: 'sweater', aliases: ['sweater'], image: '../images/sweater.png' },
    { id: 't-shirt', word: 'T-shirt', aliases: ['t shirt', 'tshirt', 'tee shirt', 't-shirt'], image: '../images/t-shirt.png' },
    { id: 'shirt', word: 'shirt', aliases: ['shirt'], image: '../images/shirt.png' },
    { id: 'pants', word: 'pants', aliases: ['pants', 'trousers'], image: '../images/pants.png' },
    { id: 'jeans', word: 'jeans', aliases: ['jeans'], image: '../images/jeans.png' },
    { id: 'shorts', word: 'shorts', aliases: ['shorts'], image: '../images/shorts.png' },
    { id: 'suit', word: 'suit', aliases: ['suit'], image: '../images/suit.png' },
    { id: 'dress', word: 'dress', aliases: ['dress'], image: '../images/dress.png' },
    { id: 'skirt', word: 'skirt', aliases: ['skirt'], image: '../images/skirt.png' },
    { id: 'coat', word: 'coat', aliases: ['coat'], image: '../images/coat.png' },
    { id: 'socks', word: 'socks', aliases: ['socks', 'sock'], image: '../images/socks.png' },
    { id: 'sneakers', word: 'sneakers', aliases: ['sneakers', 'trainers'], image: '../images/sneakers.png' },
    { id: 'shoes', word: 'shoes', aliases: ['shoes', 'shoe'], image: '../images/shoes.png' },
    { id: 'hat', word: 'hat', aliases: ['hat'], image: '../images/hat.png' },
    { id: 'cap', word: 'cap', aliases: ['cap'], image: '../images/cap.png' }
  ];

  const $ = (id) => document.getElementById(id);
  const speechSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  let order = [];
  let roundIndex = 0;
  let foundIds = new Set();
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let voiceCorrect = 0;
  let locked = false;
  let recognition = null;
  let isListening = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalise(value) {
    return String(value)
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function spokenMatches(transcript, item) {
    const answer = ` ${normalise(transcript)} `;
    return item.aliases.some((alias) => answer.includes(` ${normalise(alias)} `));
  }

  function sayWord(word) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.82;
    window.speechSynthesis.speak(u);
  }

  function setFeedback(text, tone, heard) {
    const box = $('transcript');
    box.dataset.tone = tone || 'neutral';
    $('tLabel').textContent =
      tone === 'listening' ? 'Listening' :
      tone === 'correct' ? 'Found' :
      tone === 'wrong' ? 'Try again' : 'Guide';
    $('feedback').textContent = text;
    const h = $('heardText');
    if (heard) {
      h.textContent = `I heard: “${heard}”`;
      h.classList.remove('is-hidden');
    } else {
      h.classList.add('is-hidden');
    }
  }

  function renderMap() {
    const map = $('clothesMap');
    map.innerHTML = '';
    const visual = [...ITEMS].sort((a, b) => a.id.localeCompare(b.id));
    visual.forEach((item) => {
      const found = foundIds.has(item.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'garment' + (found ? ' is-found' : '');
      btn.disabled = found;
      btn.setAttribute('aria-label', found ? item.word + ', found' : 'Choose this clothing item');
      btn.innerHTML = `<img src="${item.image}" alt="" draggable="false" /><span>${found ? item.word : '?'}</span>`;
      btn.addEventListener('click', () => chooseItem(item, btn));
      map.appendChild(btn);
    });
    $('foundCount').textContent = String(foundIds.size);
  }

  function updateHud() {
    $('roundLabel').textContent = `${Math.min(roundIndex + 1, order.length)}/${order.length}`;
    $('scoreLabel').textContent = String(score);
    $('streakLabel').textContent = String(streak);
  }

  function startGame() {
    if (recognition) try { recognition.abort(); } catch (e) {}
    order = shuffle(ITEMS);
    roundIndex = 0;
    foundIds = new Set();
    score = 0;
    streak = 0;
    bestStreak = 0;
    voiceCorrect = 0;
    locked = false;
    isListening = false;
    $('introScreen').classList.add('is-hidden');
    $('completeScreen').classList.add('is-hidden');
    $('playScreen').classList.remove('is-hidden');
    updateHud();
    renderMap();
    setFeedback('A word is coming up. Listen, locate its picture, then say it.', 'neutral');
    window.setTimeout(() => sayWord(order[0].word), 200);
  }

  function advance(method) {
    const current = order[roundIndex];
    if (!current || locked) return;
    locked = true;
    const nextStreak = streak + 1;
    score += method === 'voice' ? 10 + Math.max(0, nextStreak - 1) * 2 : 5;
    streak = nextStreak;
    bestStreak = Math.max(bestStreak, nextStreak);
    if (method === 'voice') voiceCorrect += 1;
    foundIds.add(current.id);
    updateHud();
    renderMap();
    setFeedback(
      method === 'voice'
        ? `I heard “${current.word}”. Correct — added to your collection.`
        : `Correct — ${current.word}. Try saying it next time.`,
      'correct',
      method === 'voice' ? current.word : null
    );
    window.setTimeout(() => {
      if (roundIndex + 1 >= order.length) {
        showComplete();
        return;
      }
      roundIndex += 1;
      locked = false;
      updateHud();
      setFeedback('A new clue is ready. Press Hear word, then speak your answer.', 'neutral');
      window.setTimeout(() => sayWord(order[roundIndex].word), 250);
    }, 850);
  }

  function markWrong(item, transcript, btn) {
    if (locked) return;
    streak = 0;
    updateHud();
    if (btn) {
      btn.classList.add('is-missed');
      window.setTimeout(() => btn.classList.remove('is-missed'), 500);
    }
    setFeedback(
      transcript
        ? `I heard “${transcript}”. Listen once more and try the clothes word.`
        : `That is ${item.word}. Listen again and look for the target.`,
      'wrong',
      transcript || null
    );
  }

  function chooseItem(item, btn) {
    const current = order[roundIndex];
    if (!current || foundIds.has(item.id)) return;
    if (item.id === current.id) advance('tap');
    else markWrong(item, null, btn);
  }

  function processTranscript(transcript) {
    const current = order[roundIndex];
    if (!current || locked) return;
    const cleaned = normalise(transcript);
    if (!cleaned) return;
    if (spokenMatches(cleaned, current)) advance('voice');
    else markWrong(current, cleaned);
  }

  function beginListening() {
    if (!speechSupported) {
      setFeedback('Voice recognition is not available here. Tap the correct picture instead.', 'wrong');
      return;
    }
    if (!recognition) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.onstart = () => {
        isListening = true;
        $('speakBtn').classList.add('is-listening');
        $('speakBtn').disabled = true;
        $('speakBtn').setAttribute('aria-label', 'Listening…');
        $('speakBtn').title = 'Listening…';
        setFeedback('Listening now — say the clothes word clearly.', 'listening');
      };
      recognition.onresult = (event) => {
        let transcript = '';
        let finalResult = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          finalResult = finalResult || event.results[i].isFinal;
        }
        if (transcript) {
          const h = $('heardText');
          h.textContent = `I heard: “${normalise(transcript)}”`;
          h.classList.remove('is-hidden');
        }
        if (finalResult) processTranscript(transcript);
      };
      recognition.onerror = (event) => {
        const map = {
          'not-allowed': 'Microphone access was blocked. Allow it, or tap the picture.',
          'service-not-allowed': 'Speech recognition unavailable. Tap the correct picture.',
          'audio-capture': 'No microphone found. Tap the correct picture.',
          'no-speech': 'I did not hear anything. Press Speak answer and try again.'
        };
        setFeedback(map[event.error] || 'Voice recognition had a problem. Try again or tap the picture.', 'wrong');
      };
      recognition.onend = () => {
        isListening = false;
        $('speakBtn').classList.remove('is-listening');
        $('speakBtn').disabled = false;
        $('speakBtn').setAttribute('aria-label', 'Speak answer');
        $('speakBtn').title = 'Speak answer';
      };
    }
    try {
      recognition.start();
    } catch (e) {
      setFeedback('Voice recognition is starting. Give it a moment.', 'wrong');
    }
  }

  function showComplete() {
    $('playScreen').classList.add('is-hidden');
    $('completeScreen').classList.remove('is-hidden');
    const accuracy = order.length ? Math.round((voiceCorrect / order.length) * 100) : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
    $('starRow').innerHTML = [1, 2, 3].map((s) => `<span class="${s <= stars ? 'on' : ''}">★</span>`).join('');
    $('finalScore').textContent = String(score);
    $('voiceCorrect').textContent = `${voiceCorrect} / ${order.length}`;
    $('bestStreak').textContent = String(bestStreak);
    $('accuracyNote').textContent = `Voice accuracy: ${accuracy}%`;
    try {
      if (window.LAStars) {
        LAStars.recordPlay('vocab-clothes-voice-hunt');
        LAStars.saveFromAccuracy('vocab-clothes-voice-hunt', accuracy);
      }
    } catch (e) {}
  }

  $('startBtn').addEventListener('click', startGame);
  $('againBtn').addEventListener('click', startGame);
  $('hearBtn').addEventListener('click', () => {
    const current = order[roundIndex];
    if (current) sayWord(current.word);
  });
  $('speakBtn').addEventListener('click', beginListening);
})();
