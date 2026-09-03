const words = [
  { word:'English class', icon:'🇬🇧', meaning:'You learn and practice English.', example:'I like English class.' },
  { word:'Gym / PE', icon:'🏃', meaning:'You do sports and exercise.', example:'We play sports in PE.' },
  { word:'Math', icon:'➗', meaning:'You work with numbers and calculations.', example:'Math is easy for me.' },
  { word:'Geography', icon:'🌍', meaning:'You learn about places, countries, and maps.', example:'We learn about countries in geography.' },
  { word:'Science', icon:'🔬', meaning:'You learn about the world, nature, and experiments.', example:'I like science experiments.' },
  { word:'Art', icon:'🎨', meaning:'You draw, paint, and make creative things.', example:'Art is my favorite subject.' },
  { word:'Exercise Physiology', icon:'❤️', meaning:'You learn how the body works during exercise.', example:'Exercise physiology is about the body and exercise.' },
  { word:'Drama', icon:'🎭', meaning:'You act, perform, and tell stories.', example:'We act in drama class.' },
  { word:'Publications', icon:'📸', meaning:'You write, take photos, and make school publications.', example:'I write for our school publications.' },
  { word:'Algebra', icon:'🔢', meaning:'You use letters and numbers to solve math problems.', example:'We study algebra in math.' }
];

const useQuestions = [
 { q:'We learn about countries and maps in _____.', a:'Geography', options:['Geography','Art','Drama'] },
 { q:'We draw and paint in _____.', a:'Art', options:['Science','Art','Algebra'] },
 { q:'We do sports and exercise in _____.', a:'Gym / PE', options:['Gym / PE','English class','Publications'] },
 { q:'We do experiments and learn about nature in _____.', a:'Science', options:['Drama','Science','Math'] },
 { q:'We use letters and numbers to solve problems in _____.', a:'Algebra', options:['Algebra','Geography','Art'] },
 { q:'We act and perform stories in _____.', a:'Drama', options:['Drama','Science','Math'] },
 { q:'We learn and practice English in _____.', a:'English class', options:['English class','Gym / PE','Geography'] },
 { q:'We write and take photos for school _____ .', a:'Publications', options:['Publications','Algebra','Science'] }
];

const challengeQuestions = [
 { clue:'You study countries, cities, and maps.', a:'Geography' },
 { clue:'You draw, paint, and make creative things.', a:'Art' },
 { clue:'You do sports and exercise.', a:'Gym / PE' },
 { clue:'You act and perform stories.', a:'Drama' },
 { clue:'You learn about experiments and the natural world.', a:'Science' },
 { clue:'You use letters and numbers to solve math problems.', a:'Algebra' },
 { clue:'You write and take photos for school publications.', a:'Publications' },
 { clue:'You learn and practice English.', a:'English class' }
];

const speakPrompts = [
 ['📚','What is your favorite subject?','My favorite subject is ____.'],
 ['❤️','Do you like science? Why?','Yes, I do, because ____. / No, I don’t.'],
 ['🎨','Do you like art? Why or why not?','I like / don’t like art because ____.'],
 ['🌍','What do you learn in geography?','We learn about ____.'],
 ['🏃','What do you do in PE?','We ____.'],
 ['🎭','Would you like to study drama? Why?','Yes, because ____. / No, because ____.'],
 ['➗','Is math easy or difficult for you?','Math is ____.'],
 ['🔬','What do you like about science?','I like ____.']
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let matchState = { selected:null, matched:0, used:new Set() };
let useIndex = 0, challengeIndex = 0, speakIndex = 0;

function renderLearn(){
  $('#wordGrid').innerHTML = words.map((w,i)=>`<button class="word-card" data-index="${i}"><span class="word-icon">${w.icon}</span><strong>${w.word}</strong><span class="word-detail">Click to see meaning</span></button>`).join('');
  $$('.word-card').forEach(btn=>btn.addEventListener('click',()=>{
    const w=words[+btn.dataset.index];
    btn.classList.toggle('revealed');
    btn.querySelector('.word-detail').textContent=btn.classList.contains('revealed')?`${w.meaning} ${w.example}`:'Click to see meaning';
  }));
}

function renderMatch(){
  const pool=[...words].sort(()=>Math.random()-.5).slice(0,5);
  matchState={selected:null,matched:0,used:new Set()};
  const cards=[];
  pool.forEach((w,i)=>{
    cards.push(`<button class="match-card word-choice" data-key="${i}" data-type="word">${w.icon} <b>${w.word}</b></button>`);
    cards.push(`<button class="match-card meaning-choice" data-key="${i}" data-type="meaning">${w.meaning}</button>`);
  });
  $('#matchGrid').innerHTML=cards.sort(()=>Math.random()-.5).join('');
  $('#matchProgress').textContent='0 / 5';
  $('#matchFeedback').textContent='';
  $$('.match-card').forEach(btn=>btn.addEventListener('click',()=>matchClick(btn,pool)));
}
function matchClick(btn,pool){
  if(btn.classList.contains('matched')) return;
  if(!matchState.selected){ matchState.selected=btn; btn.classList.add('selected'); return; }
  const first=matchState.selected;
  if(first===btn) return;
  if(first.dataset.key===btn.dataset.key && first.dataset.type!==btn.dataset.type){
    first.classList.remove('selected'); first.classList.add('matched'); btn.classList.add('matched');
    matchState.matched++; matchState.selected=null;
    $('#matchProgress').textContent=`${matchState.matched} / 5`;
    $('#matchFeedback').textContent=matchState.matched===5?'🎉 Great job! You matched all five!':'Nice match!';
  } else {
    first.classList.add('wrong'); btn.classList.add('wrong');
    setTimeout(()=>{first.classList.remove('selected','wrong');btn.classList.remove('wrong');},450);
    matchState.selected=null;
  }
}

function renderUse(){
  const q=useQuestions[useIndex%useQuestions.length];
  $('#useQuestion').innerHTML=`<div class="question-number">Question ${(useIndex%useQuestions.length)+1}</div><div class="question-text">${q.q}</div><div class="option-grid">${q.options.sort(()=>Math.random()-.5).map(o=>`<button class="option-btn" data-answer="${o}">${o}</button>`).join('')}</div><div class="feedback" id="useFeedback"></div>`;
  $$('.option-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const good=btn.dataset.answer===q.a;
    $$('.option-btn').forEach(b=>b.disabled=true);
    btn.classList.add(good?'correct':'incorrect');
    if(!good) $$('.option-btn').find(b=>b.dataset.answer===q.a)?.classList.add('correct');
    $('#useFeedback').innerHTML=good?`✅ Correct! <button class="inline-next" id="nextUse">Next →</button>`:`Not quite. The answer is <b>${q.a}</b>. <button class="inline-next" id="nextUse">Next →</button>`;
    $('#nextUse').addEventListener('click',()=>{useIndex++;renderUse();});
  }));
}

function renderChallenge(){
  const q=challengeQuestions[challengeIndex%challengeQuestions.length];
  $('#challengeCount').textContent=`Challenge ${(challengeIndex%challengeQuestions.length)+1} / ${challengeQuestions.length}`;
  $('#challengeClue').textContent=q.clue;
  const opts=[q.a,...words.filter(w=>w.word!==q.a).sort(()=>Math.random()-.5).slice(0,2).map(w=>w.word)].sort(()=>Math.random()-.5);
  $('#challengeAnswers').innerHTML=opts.map(o=>`<button class="option-btn" data-answer="${o}">${o}</button>`).join('');
  $('#challengeFeedback').textContent='';
  $$('#challengeAnswers .option-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const good=btn.dataset.answer===q.a;
    $$('#challengeAnswers .option-btn').forEach(b=>b.disabled=true);
    btn.classList.add(good?'correct':'incorrect');
    if(!good) $$('#challengeAnswers .option-btn').find(b=>b.dataset.answer===q.a)?.classList.add('correct');
    $('#challengeFeedback').textContent=good?'✅ Yes!':'The answer is '+q.a+'.';
    setTimeout(()=>{challengeIndex++;renderChallenge();},900);
  }));
}

function renderSpeak(){
  const p=speakPrompts[speakIndex%speakPrompts.length];
  $('#speakIcon').textContent=p[0]; $('#speakPrompt').textContent=p[1]; $('#speakHint').textContent=p[2];
}

function showStage(name){
  $$('.stage-btn').forEach(b=>b.classList.toggle('active',b.dataset.stage===name));
  $$('.stage').forEach(s=>s.classList.toggle('active',s.id===`stage-${name}`));
  if(name==='match') renderMatch();
  if(name==='use') renderUse();
  if(name==='challenge') renderChallenge();
  if(name==='speak') renderSpeak();
}

$$('.stage-btn').forEach(btn=>btn.addEventListener('click',()=>showStage(btn.dataset.stage)));
$('#resetMatch').addEventListener('click',renderMatch);
$('#nextSpeak').addEventListener('click',()=>{speakIndex++;renderSpeak();});
$('#year').textContent=new Date().getFullYear();
renderLearn();

try { if (window.LAStars) { LAStars.recordPlay("vocab-school-subjects"); LAStars.save("vocab-school-subjects", 1); } } catch(e) {}
