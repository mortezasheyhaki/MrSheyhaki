// Bob's City Directions - Self-drawn map + character (inspired by the photo map & cartoon Bob)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const micBtn = document.getElementById('mic-btn');
const commandInput = document.getElementById('command-input');
const submitBtn = document.getElementById('submit-btn');
const destLabel = document.getElementById('dest-label');
const successOverlay = document.getElementById('success-overlay');
const successText = document.getElementById('success-text');

const CELL = 90;
const COLS = 14;
const ROWS = 10;

// Road cells
const roads = new Set([
  // North Street (row 2)
  '2,2','3,2','4,2','5,2','6,2','7,2','8,2','9,2','10,2','11,2',
  // King Street (row 5)
  '2,5','3,5','4,5','5,5','6,5','7,5','8,5','9,5','10,5','11,5',
  // South Street (row 8)
  '2,8','3,8','4,8','5,8','6,8','7,8','8,8','9,8','10,8','11,8',
  // East Road (col 2)
  '2,1','2,3','2,4','2,6','2,7',
  // Boston Road (col 7)
  '7,1','7,3','7,4','7,6','7,7',
  // School Road (col 11)
  '11,1','11,3','11,4','11,6','11,7',
  // connectors
  '3,1','4,1','5,1','6,1','8,1','9,1','10,1',
  '3,3','4,3','5,3','6,3','8,3','9,3','10,3',
  '3,4','4,4','5,4','6,4','8,4','9,4','10,4',
  '3,6','4,6','5,6','6,6','8,6','9,6','10,6',
  '3,7','4,7','5,7','6,7','8,7','9,7','10,7'
]);

const destinations = {
  hospital:    { col: 2, row: 1, name: 'Hospital', icon: '🏥' },
  train:       { col: 5, row: 1, name: 'Train Station', icon: '🚉' },
  hotel:       { col: 10, row: 1, name: 'Hotel', icon: '🏨' },
  parking:     { col: 2, row: 4, name: 'Parking Lot', icon: '🅿️' },
  bank:        { col: 4, row: 4, name: 'Bank', icon: '🏦' },
  gym:         { col: 7, row: 4, name: 'Gym', icon: '🏋️' },
  school:      { col: 11, row: 3, name: 'School', icon: '🏫' },
  factory:     { col: 2, row: 7, name: 'Factory', icon: '🏭' },
  restaurant:  { col: 4, row: 7, name: 'Italian Restaurant', icon: '🍝' },
  theater:     { col: 6, row: 7, name: 'Movie Theater', icon: '🎬' },
  supermarket: { col: 9, row: 7, name: 'Supermarket', icon: '🛒' },
  bookstore:   { col: 11, row: 7, name: 'Book Store', icon: '📚' }
};

const startCandidates = [
  {col:5,row:5},{col:7,row:5},{col:4,row:5},{col:9,row:5},
  {col:3,row:5},{col:6,row:8},{col:8,row:8},{col:5,row:8},
  {col:10,row:5},{col:7,row:8}
];

const sarcasticLines = [
  "Really? A wall? Bold strategy.",
  "I can't walk through buildings, genius.",
  "Nice try. Still a wall.",
  "Wrong way, captain.",
  "My legs aren't for decoration.",
  "That's not a road. Shocking, I know.",
  "Are we sightseeing the brickwork?",
  "Nope. Still solid.",
  "Try the street next time.",
  "I prefer roads. Crazy, right?",
  "Bricks 1 – Bob 0.",
  "Maybe check the map first?"
];

let player = {
  col: 5, row: 5, dir: 0,
  pixelX: 0, pixelY: 0,
  targetX: 0, targetY: 0,
  moving: false, progress: 0, anim: 0
};

let currentDest = null, gameActive = false, isListening = false, recognition = null;
let particles = [], audioCtx = null, successShown = false;
let bubble = { text: '', timer: 0, alpha: 0 };
let selectedDestKey = null;

// ===== SCREENS =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'game-screen') resize();
}

document.getElementById('btn-to-dest').addEventListener('click', () => {
  buildDestGrid();
  showScreen('dest-screen');
});
document.getElementById('btn-back').addEventListener('click', () => showScreen('start-screen'));
document.getElementById('btn-again').addEventListener('click', () => {
  successOverlay.classList.remove('show');
  buildDestGrid();
  showScreen('dest-screen');
});
document.getElementById('btn-quit').addEventListener('click', () => {
  if (recognition && isListening) recognition.stop();
  gameActive = false;
  successOverlay.classList.remove('show');
  showScreen('start-screen');
});

function buildDestGrid() {
  const grid = document.getElementById('dest-grid');
  grid.innerHTML = '';
  selectedDestKey = null;
  document.getElementById('btn-start-mission').disabled = true;
  Object.entries(destinations).forEach(([key, d]) => {
    const card = document.createElement('button');
    card.className = 'dest-card';
    card.innerHTML = `<span>${d.icon}</span>${d.name}`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.dest-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedDestKey = key;
      document.getElementById('btn-start-mission').disabled = false;
    });
    grid.appendChild(card);
  });
}

document.getElementById('btn-start-mission').addEventListener('click', startMission);

function startMission() {
  if (!selectedDestKey) return;
  initAudio();
  sfxStart();
  currentDest = selectedDestKey;
  successShown = false;
  gameActive = true;
  bubble.timer = 0;
  successOverlay.classList.remove('show');

  const dest = destinations[currentDest];
  let start;
  do {
    start = startCandidates[Math.floor(Math.random() * startCandidates.length)];
  } while (start.col === dest.col && start.row === dest.row);

  player.col = start.col;
  player.row = start.row;
  player.dir = Math.floor(Math.random() * 4);
  player.moving = false;
  player.pixelX = player.col * CELL + CELL / 2;
  player.pixelY = player.row * CELL + CELL / 2;
  player.targetX = player.pixelX;
  player.targetY = player.pixelY;

  destLabel.textContent = `🎯 Destination: ${dest.name}`;
  setStatus(`Bob is ready! Guide him to the ${dest.name}. Facing ${dirName(player.dir)}.`, 'info');
  showBubble("Let's go. Try not to get me lost.");
  showScreen('game-screen');
}

// ===== AUDIO =====
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playTone(freq, dur, type = 'square', vol = 0.13) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
function sfxMove() { playTone(440, 0.07); setTimeout(() => playTone(560, 0.05), 60); }
function sfxTurn() { playTone(320, 0.1, 'triangle', 0.14); }
function sfxError() { playTone(160, 0.22, 'sawtooth', 0.11); }
function sfxSuccess() {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.15 + i * 0.03, 'square', 0.14), i * 110));
}
function sfxStart() { playTone(392, 0.1); setTimeout(() => playTone(523, 0.15), 100); }

function spawnParticles(x, y, color, n = 22) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 - 2,
      life: 1, color, size: 3 + Math.random() * 4
    });
  }
}
function showBubble(text) { bubble.text = text; bubble.timer = 3.4; bubble.alpha = 1; }

function normalize(t) {
  return t.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function parseCommand(raw) {
  const t = normalize(raw);
  if (!t) return null;
  if (t.includes('straight') || t === 'go ahead' || t === 'ahead' || t === 'forward' || t === 'go forward' || t === 'go on') return 'straight';
  if (t.includes('left') || t === 'l') return 'left';
  if (t.includes('right') || t === 'r') return 'right';
  return null;
}
function dirName(d) { return ['NORTH', 'EAST', 'SOUTH', 'WEST'][d]; }
function isRoad(c, r) { return roads.has(c + ',' + r); }
function getNext(col, row, dir) {
  const d = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  return { col: col + d[dir][0], row: row + d[dir][1] };
}

function executeCommand(cmd) {
  if (!gameActive || player.moving || successShown) return;
  initAudio();
  if (cmd === 'left') {
    player.dir = (player.dir + 3) % 4;
    sfxTurn();
    setStatus(`Turned LEFT → facing ${dirName(player.dir)}`, '');
    return;
  }
  if (cmd === 'right') {
    player.dir = (player.dir + 1) % 4;
    sfxTurn();
    setStatus(`Turned RIGHT → facing ${dirName(player.dir)}`, '');
    return;
  }
  if (cmd === 'straight') {
    const next = getNext(player.col, player.row, player.dir);
    if (!isRoad(next.col, next.row)) {
      sfxError();
      showBubble(sarcasticLines[Math.floor(Math.random() * sarcasticLines.length)]);
      setStatus("Can't go that way — no road!", 'error');
      return;
    }
    player.moving = true;
    player.progress = 0;
    player.targetX = next.col * CELL + CELL / 2;
    player.targetY = next.row * CELL + CELL / 2;
    player._pc = next.col;
    player._pr = next.row;
    sfxMove();
    setStatus('Going straight…', '');
  }
}

function checkArrival() {
  if (!currentDest) return;
  const d = destinations[currentDest];
  if (player.col === d.col && player.row === d.row) {
    successShown = true;
    sfxSuccess();
    spawnParticles(player.pixelX, player.pixelY, '#ffcc00', 28);
    spawnParticles(player.pixelX, player.pixelY, '#00ff88', 16);
    showBubble('Finally! Made it.');
    setStatus(`🎉 You found the ${d.name}!`, 'success');
    successText.textContent = `Bob found the ${d.name}`;
    successOverlay.classList.add('show');
    if (recognition && isListening) recognition.stop();
  }
}

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = type || '';
  if (isListening) statusEl.classList.add('listening');
}

function setupSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    micBtn.disabled = true;
    micBtn.textContent = 'Voice not supported';
    return;
  }
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.onstart = () => {
    isListening = true;
    micBtn.textContent = '🛑 Stop Voice';
    micBtn.classList.add('listening');
    setStatus('Listening… say a command!', 'listening');
  };
  recognition.onend = () => {
    isListening = false;
    micBtn.textContent = '🎤 Start Voice';
    micBtn.classList.remove('listening');
  };
  recognition.onerror = (e) => {
    if (e.error === 'not-allowed') setStatus('Mic blocked — please type commands.', 'error');
    isListening = false;
    micBtn.textContent = '🎤 Start Voice';
    micBtn.classList.remove('listening');
  };
  recognition.onresult = (ev) => {
    const last = ev.results[ev.results.length - 1];
    if (!last.isFinal) return;
    const transcript = last[0].transcript;
    const cmd = parseCommand(transcript);
    if (cmd) {
      setStatus(`Heard: "${transcript}" → ${cmd.toUpperCase()}`, '');
      executeCommand(cmd);
    } else {
      setStatus(`Heard: "${transcript}" (not recognized)`, 'error');
    }
  };
}
micBtn.addEventListener('click', () => {
  initAudio();
  if (!recognition) setupSpeech();
  if (!recognition) return;
  if (isListening) recognition.stop();
  else try { recognition.start(); } catch (e) {}
});

function submitText() {
  if (!gameActive || successShown) return;
  const raw = commandInput.value;
  commandInput.value = '';
  const cmd = parseCommand(raw);
  if (cmd) {
    setStatus(`Typed: "${raw}" → ${cmd.toUpperCase()}`, '');
    executeCommand(cmd);
  } else {
    setStatus(`Unknown command. Try "go straight on", "turn left" or "turn right".`, 'error');
    sfxError();
    showBubble('Speak English, will ya?');
  }
}
submitBtn.addEventListener('click', submitText);
commandInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitText(); });

// ===== DRAWING =====
function resize() {
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground() {
  // grass
  ctx.fillStyle = '#6bbf4e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, '#87b8d8');
  g.addColorStop(1, '#a8c8a0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, 150);
}

function drawRoads() {
  ctx.fillStyle = '#555';
  for (const key of roads) {
    const [c, r] = key.split(',').map(Number);
    roundRect(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6, 8);
    ctx.fill();
  }
  // yellow dashes
  ctx.strokeStyle = '#f0c040';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  for (let r of [2, 5, 8]) {
    for (let c = 0; c < COLS; c++) {
      if (isRoad(c, r) && isRoad(c + 1, r)) {
        ctx.moveTo(c * CELL + CELL / 2, r * CELL + CELL / 2);
        ctx.lineTo((c + 1) * CELL + CELL / 2, r * CELL + CELL / 2);
      }
    }
  }
  for (let c of [2, 7, 11]) {
    for (let r = 0; r < ROWS; r++) {
      if (isRoad(c, r) && isRoad(c, r + 1)) {
        ctx.moveTo(c * CELL + CELL / 2, r * CELL + CELL / 2);
        ctx.lineTo(c * CELL + CELL / 2, (r + 1) * CELL + CELL / 2);
      }
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBuilding(x, y, w, h, body, roof, label, style = 'flat') {
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  roundRect(x + 4, y + 6, w, h, 4);
  ctx.fill();
  roundRect(x, y, w, h, 5);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  if (style === 'gable') {
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + w / 2, y - 16);
    ctx.lineTo(x + w + 4, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = roof;
    ctx.fillRect(x - 2, y - 6, w + 4, 8);
    ctx.strokeRect(x - 2, y - 6, w + 4, 8);
  }
  // windows
  ctx.fillStyle = 'rgba(90,140,180,0.65)';
  const cols = Math.max(1, Math.floor(w / 24));
  const rows = Math.max(1, Math.floor(h / 22));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(x + 8 + c * 22, y + 10 + r * 20, 13, 12);
    }
  }
  // door
  const dw = Math.min(16, w * 0.2), dh = Math.min(20, h * 0.28);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x + w / 2 - dw / 2, y + h - dh - 1, dw, dh);
  if (label) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h + 14);
  }
}

function drawBuildings() {
  // Hospital
  drawBuilding(1.1 * CELL, 0.3 * CELL, 2.0 * CELL, 1.4 * CELL, '#c5dceb', '#5a8aa8', 'HOSPITAL');
  // Train Station
  drawBuilding(4.0 * CELL, 0.35 * CELL, 2.4 * CELL, 1.35 * CELL, '#c45c4a', '#6b2e26', 'TRAIN STATION');
  // Hotel
  drawBuilding(9.2 * CELL, 0.3 * CELL, 2.3 * CELL, 1.4 * CELL, '#e8d5b0', '#9a7a38', 'HOTEL');
  // Parking
  drawBuilding(1.1 * CELL, 3.2 * CELL, 1.8 * CELL, 1.5 * CELL, '#8a8a8a', '#555', 'PARKING LOT');
  // Bank
  drawBuilding(3.3 * CELL, 3.35 * CELL, 1.6 * CELL, 1.3 * CELL, '#d8c8a8', '#6b4e2e', 'BANK', 'gable');
  // Gym
  drawBuilding(6.3 * CELL, 3.35 * CELL, 1.5 * CELL, 1.3 * CELL, '#eef0f2', '#666', 'GYM');
  // School park
  ctx.fillStyle = '#5a9c4a';
  roundRect(10.2 * CELL, 2.4 * CELL, 2.5 * CELL, 2.0 * CELL, 8);
  ctx.fill();
  // School
  drawBuilding(10.5 * CELL, 2.7 * CELL, 1.8 * CELL, 1.4 * CELL, '#e8a868', '#8b4513', 'SCHOOL', 'gable');
  // Factory
  drawBuilding(1.1 * CELL, 6.3 * CELL, 1.9 * CELL, 1.5 * CELL, '#4a4a4a', '#2a2a2a', 'FACTORY');
  // Italian
  drawBuilding(3.3 * CELL, 6.45 * CELL, 1.5 * CELL, 1.25 * CELL, '#f0d0b0', '#8b5a2b', 'ITALIAN REST.', 'gable');
  // Theater
  drawBuilding(5.3 * CELL, 6.4 * CELL, 1.8 * CELL, 1.3 * CELL, '#f5f0e0', '#555', 'MOVIE THEATER');
  // Supermarket
  drawBuilding(8.2 * CELL, 6.35 * CELL, 1.9 * CELL, 1.4 * CELL, '#d8ecd8', '#2e6b2e', 'SUPERMARKET');
  // Book Store
  drawBuilding(10.4 * CELL, 6.4 * CELL, 1.7 * CELL, 1.3 * CELL, '#d0e0f0', '#2a4a6a', 'BOOK STORE', 'gable');

  // Street labels
  ctx.fillStyle = 'rgba(20,20,20,0.5)';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NORTH STREET', 6.5 * CELL, 2 * CELL - 8);
  ctx.fillText('KING STREET', 6.5 * CELL, 5 * CELL - 8);
  ctx.fillText('SOUTH STREET', 6.5 * CELL, 8 * CELL - 8);
}

function drawBob() {
  const x = player.pixelX, y = player.pixelY;
  const bobY = player.moving ? Math.sin(player.anim * 0.4) * 2.5 : 0;
  const swing = player.moving ? Math.sin(player.anim * 0.35) * 6 : 0;

  ctx.save();
  ctx.translate(x, y + bobY);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs (jeans)
  ctx.strokeStyle = '#2a5a9a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.lineTo(-6 + swing, 20);
  ctx.moveTo(6, 8);
  ctx.lineTo(6 - swing, 20);
  ctx.stroke();

  // boots
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-10, 18, 9, 6);
  ctx.fillRect(1, 18, 9, 6);

  // body (leather jacket)
  ctx.fillStyle = '#1a1a1a';
  roundRect(-12, -8, 24, 18, 4);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // white turtleneck
  ctx.fillStyle = '#f0f0f0';
  roundRect(-7, -6, 14, 10, 3);
  ctx.fill();

  // head
  ctx.fillStyle = '#f5d0a9';
  ctx.beginPath();
  ctx.arc(0, -16, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // hair
  ctx.fillStyle = '#2a1a0a';
  ctx.beginPath();
  ctx.arc(0, -20, 10, Math.PI, 0);
  ctx.fill();
  // side hair
  ctx.beginPath();
  ctx.ellipse(-8, -16, 4, 7, -0.3, 0, Math.PI * 2);
  ctx.ellipse(8, -16, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // eyes
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-4, -17, 2, 0, Math.PI * 2);
  ctx.arc(4, -17, 2, 0, Math.PI * 2);
  ctx.fill();

  // smile
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -14, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // beard hint
  ctx.fillStyle = 'rgba(40,25,15,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, -11, 7, 4, 0, 0, Math.PI);
  ctx.fill();

  // direction arrow
  ctx.rotate(player.dir * Math.PI / 2);
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(-8, -22);
  ctx.lineTo(8, -22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawBubble() {
  if (bubble.timer <= 0 || !bubble.text) return;
  const x = player.pixelX, y = player.pixelY - 48;
  ctx.save();
  ctx.globalAlpha = bubble.alpha;
  ctx.font = 'bold 13px sans-serif';
  const tw = ctx.measureText(bubble.text).width;
  const bw = Math.min(240, tw + 24), bh = 34;
  const bx = x - bw / 2, by = y - bh;
  ctx.fillStyle = '#fffef5';
  roundRect(bx, by, bw, bh, 10);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6, by + bh);
  ctx.lineTo(x, by + bh + 10);
  ctx.lineTo(x + 6, by + bh);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bubble.text, x, by + bh / 2);
  ctx.restore();
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.13; p.life -= 0.018;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawCompass() {
  const cx = canvas.width - 50, cy = 50;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(cx - 36, cy - 36, 72, 72, 10);
  ctx.fill();
  ctx.strokeStyle = '#e8a838';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - 24);
  ctx.fillText('E', cx + 26, cy + 4);
  ctx.fillText('S', cx, cy + 30);
  ctx.fillText('W', cx - 26, cy + 4);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(player.dir * Math.PI / 2);
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(-7, 8);
  ctx.lineTo(7, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHighlight() {
  if (!currentDest || successShown) return;
  const d = destinations[currentDest];
  const x = d.col * CELL + CELL / 2, y = d.row * CELL + CELL / 2;
  ctx.strokeStyle = 'rgba(255,200,40,0.85)';
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.arc(x, y, 26 + Math.sin(performance.now() / 220) * 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function update(dt) {
  if (bubble.timer > 0) {
    bubble.timer -= dt;
    bubble.alpha = Math.min(1, bubble.timer * 2);
    if (bubble.timer <= 0) bubble.text = '';
  }
  if (player.moving) {
    player.progress += dt * 2.4;
    player.anim += dt * 60;
    if (player.progress >= 1) {
      player.progress = 1;
      player.moving = false;
      player.col = player._pc;
      player.row = player._pr;
      player.pixelX = player.targetX;
      player.pixelY = player.targetY;
      checkArrival();
      if (!successShown) setStatus(`Moved. Facing ${dirName(player.dir)}.`, '');
    } else {
      const sx = player.col * CELL + CELL / 2;
      const sy = player.row * CELL + CELL / 2;
      const t = ease(player.progress);
      player.pixelX = sx + (player.targetX - sx) * t;
      player.pixelY = sy + (player.targetY - sy) * t;
    }
  } else {
    player.pixelX = player.col * CELL + CELL / 2;
    player.pixelY = player.row * CELL + CELL / 2;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawRoads();
  drawBuildings();
  drawHighlight();
  drawBob();
  drawBubble();
  drawParticles();
  drawCompass();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

resize();
setupSpeech();
requestAnimationFrame(loop);
