const GAME_ID = 'starter-pe1-word-wheel-match';
const ITEMS=[
["a bag","https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3","https://cdn.imgurl.ir/uploads/q131373_a-bag.png"],
["a pen","https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3","https://cdn.imgurl.ir/uploads/t81465_a-pen.png"],
["a piece of paper","https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3","https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png"],
["a dictionary","https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3","https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png"],
["a laptop","https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3","https://cdn.imgurl.ir/uploads/w410273_a-laptop.png"],
["a table","https://cdn.imgurl.ir/uploads/d742794_a-table.mp3","https://cdn.imgurl.ir/uploads/a696837_a-table.png"],
["a chair","https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3","https://cdn.imgurl.ir/uploads/t901556_a-chair.png"],
["a window","https://cdn.imgurl.ir/uploads/l543208_a-window.mp3","https://cdn.imgurl.ir/uploads/c480039_a-window.png"],
["the door","https://cdn.imgurl.ir/uploads/g92275_the-door.mp3","https://cdn.imgurl.ir/uploads/o763819_the-door.png"],
["the board","https://cdn.imgurl.ir/uploads/i034259_the-board.mp3","https://cdn.imgurl.ir/uploads/v58413_the-board.png"]
];
const ROUNDS=8, OPTIONS=5;

const $=id=>document.getElementById(id);
const stage=$('stage'), target=$('target'), emo=$('emoji'), fb=$('fb'), tip=$('tip');
let chainEls=[],deck=[],round=0,correct=0,wrong=0,chips=[],cur=null,spin=0,drag=null,busy=false,muted=false,lastT=performance.now(),wrongThisRound=false;

/* ---------- Sound (synthesized, no files needed) ---------- */
let actx=null;
function ac(){
  if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  if(actx&&actx.state==='suspended')actx.resume();
  return actx;
}
function tone(f,d=.15,type='sine',v=.15,when=0,f2){
  if(muted)return;
  const c=ac(); if(!c)return;
  const t=c.currentTime+when, o=c.createOscillator(), g=c.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(v,t+.01);
  g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t+d+.02);
}
const SFX={
  tick(){tone(900,.05,'triangle',.08)},
  ok(){[523,659,784,1046].forEach((f,i)=>tone(f,.25,'triangle',.18,i*.09))},
  bad(){tone(220,.28,'sawtooth',.12,0,120)},
  win(){[523,659,784,659,784,1046].forEach((f,i)=>tone(f,.22,'triangle',.2,i*.1))}
};
function playAudio(u){try{if(muted)return;const a=new Audio(u);a.play().catch(()=>{})}catch(e){}}
function speak(w){
  try{
    if(muted||!('speechSynthesis' in window))return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(w); u.lang='en-US'; u.rate=.85;
    speechSynthesis.speak(u);
  }catch(e){}
}

/* ---------- Factory machine sounds and music ---------- */
let nb=null,mTimer=null,nextT=0,mStep=0,hum=null;
function noiseBuf(){
  if(!nb){const c=ac();nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  return nb;
}
function noise(d,f,type,v,when=0,f2){
  if(muted)return;const c=ac();if(!c)return;
  const t=c.currentTime+when,src=c.createBufferSource(),flt=c.createBiquadFilter(),g=c.createGain();
  src.buffer=noiseBuf();
  flt.type=type;flt.frequency.setValueAtTime(f,t);
  if(f2)flt.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(flt).connect(g).connect(c.destination);
  src.start(t,Math.random()*1.5);src.stop(t+d+.05);
}
function startMachine(){
  if(muted)return;
  noise(1.6,200,'lowpass',.35,0,1400);
  tone(40,1.6,'sawtooth',.06,0,95);
  for(let i=0;i<4;i++)noise(.06,2200,'bandpass',.3,1+i*.15);
}
function scheduleMusic(){
  const c=ac();if(!c||!hum)return;
  if(nextT<c.currentTime)nextT=c.currentTime+.05;
  const bass=[55,55,73,55,65,55,82,55];
  while(nextT<c.currentTime+.15){
    const w=nextT-c.currentTime,s=mStep%8;
    noise(.03,6000,'highpass',.05,w);
    if(s===0||s===4)noise(.12,1500,'bandpass',.18,w);
    tone(bass[s],.25,'triangle',.1,w);
    nextT+=.3;mStep++;
  }
}
function startMusic(){
  const c=ac();if(!c||muted)return;
  stopMusic(false);
  const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
  o.type='sawtooth';o.frequency.value=50;
  f.type='lowpass';f.frequency.value=180;
  g.gain.value=.025;
  o.connect(f).connect(g).connect(c.destination);o.start();
  hum={o,g};
  nextT=c.currentTime+.1;mStep=0;
  mTimer=setInterval(scheduleMusic,50);
}
function stopMusic(fade){
  clearInterval(mTimer);mTimer=null;
  if(!hum)return;
  const h=hum;hum=null;const c=ac();
  if(fade&&c){
    h.g.gain.cancelScheduledValues(c.currentTime);
    h.g.gain.setValueAtTime(Math.max(h.g.gain.value,.0002),c.currentTime);
    h.g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+1.8);
    h.o.stop(c.currentTime+1.9);
  }else{try{h.o.stop()}catch(e){}}
}
function shutdown(){
  stopMusic(true);
  if(muted)return;
  noise(1.8,6000,'highpass',.22,0,800);   // air releasing
  noise(.6,400,'lowpass',.3,.1);          // heavy thump
  tone(180,1.4,'sawtooth',.06,0,35);      // motor spinning down
  for(let i=0;i<3;i++)noise(.05,1800,'bandpass',.25,1.2+i*.2);
  tone(90,.25,'triangle',.08,1.6,40);
}

/* ---------- Gear shape generator ---------- */
function gearURI(){
  const n=12,pts=[];
  for(let i=0;i<n*4;i++){
    const a=i/(n*4)*Math.PI*2,k=i%4,R=(k===1||k===2)?48:38;
    pts.push((50+R*Math.cos(a)).toFixed(2)+','+(50+R*Math.sin(a)).toFixed(2));
  }
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f9ff"/><stop offset=".55" stop-color="#b8c0da"/><stop offset="1" stop-color="#7b86a8"/></linearGradient></defs><polygon points="'+pts.join(' ')+'" fill="url(#g)" stroke="#3b4266" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="50" r="30" fill="none" stroke="#3b4266" stroke-width="1.5" opacity=".45"/></svg>';
  return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
document.documentElement.style.setProperty('--gear',gearURI());

/* ---------- Helpers ---------- */
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}

function start(){
  if(window.LAFinish&&LAFinish.startTimer)LAFinish.startTimer();
  ac();startMachine();setTimeout(startMusic,1500);
  $('start').classList.remove('on');
  $('end').classList.remove('on');
  document.querySelectorAll('.confetti').forEach(e=>e.remove());
  deck=shuffle(ITEMS).slice(0,ROUNDS);
  round=0;correct=0;wrong=0;
  newRound();
}

function newRound(){
  cur=deck[round];
  emo.style.display='';$('lbl').style.display='none';$('lbl').textContent=cur[0];emo.src=cur[2];emo.alt=cur[0];
  target.className='center';
  fb.textContent='';fb.classList.remove('show');
  wrongThisRound=false;busy=false;
  chips.forEach(c=>c.el.remove());
  const others=shuffle(ITEMS.filter(x=>x!==cur)).slice(0,OPTIONS-1);
  const words=shuffle([cur,...others]);
  const off=-Math.PI/2;
  chips=words.map((it,i)=>{
    const el=document.createElement('div');
    el.className='chip'+(i%2?' alt':'');el.textContent=it[0];
    stage.appendChild(el);
    const c={el,it,base:off+i*2*Math.PI/OPTIONS,done:false};
    bind(c);
    return c;
  });
  $('round').textContent=`Round ${round+1}/${ROUNDS}`;
  $('score').textContent=`✅ ${correct}`;
  $('prog').style.width=(round/ROUNDS*100)+'%';
  tip.textContent='Drag the matching word onto the picture';tip.style.visibility='';
}

/* ---------- Drag and drop (mouse, touch and pen) ---------- */
function bind(c){
  c.el.addEventListener('pointerdown',e=>{
    if(busy||c.done||drag)return;
    e.preventDefault();
    c.el.setPointerCapture(e.pointerId);
    drag={c,id:e.pointerId};
    c.el.classList.add('drag');
    ac();SFX.tick();
    place(e);
  });
  c.el.addEventListener('pointermove',e=>{
    if(drag&&drag.c===c&&e.pointerId===drag.id)place(e);
  });
  const up=e=>{if(drag&&drag.c===c&&e.pointerId===drag.id)release(e)};
  c.el.addEventListener('pointerup',up);
  c.el.addEventListener('pointercancel',up);
}

function inTarget(x,y){
  const t=target.getBoundingClientRect(),m=24;
  return x>t.left-m&&x<t.right+m&&y>t.top-m&&y<t.bottom+m;
}

function place(e){
  const r=stage.getBoundingClientRect();
  drag.c.el.style.left=(e.clientX-r.left)+'px';
  drag.c.el.style.top=(e.clientY-r.top)+'px';
  target.classList.toggle('hot',inTarget(e.clientX,e.clientY));
}

function release(e){
  const c=drag.c;
  drag=null;
  c.el.classList.remove('drag');
  target.classList.remove('hot');
  if(inTarget(e.clientX,e.clientY))judge(c);
}

function shatter(c){
  const W=c.el.offsetWidth,x=parseFloat(c.el.style.left)||0,y=parseFloat(c.el.style.top)||0;
  const N=8,base=Math.random()*Math.PI*2;
  const P=t=>(50+50*Math.cos(t)).toFixed(1)+'% '+(50+50*Math.sin(t)).toFixed(1)+'%';
  c.el.style.visibility='hidden';
  for(let i=0;i<N;i++){
    const a0=base+i/N*Math.PI*2,a1=base+(i+1)/N*Math.PI*2,am=(a0+a1)/2;
    const sh=document.createElement('div');
    sh.className='shard';
    sh.style.cssText='width:'+W+'px;height:'+W+'px;left:'+x+'px;top:'+y+'px;clip-path:polygon(50% 50%,'+P(a0)+','+P(a1)+')';
    stage.appendChild(sh);
    const dist=60+Math.random()*50,rot=(Math.random()-.5)*160;
    sh.animate([
      {transform:'translate(-50%,-50%) rotate(0deg)',opacity:1},
      {transform:'translate(calc(-50% + '+(Math.cos(am)*dist)+'px),calc(-50% + '+(Math.sin(am)*dist+30)+'px)) rotate('+rot+'deg)',opacity:0}
    ],{duration:750,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
    setTimeout(()=>sh.remove(),800);
  }
  setTimeout(()=>{c.el.style.visibility='';},900);
}

function judge(c){
  busy=true;
  if(c.it===cur){
    correct++;
    c.done=true;
    c.el.classList.add('gone');
    target.className='center ok';
    SFX.ok();playAudio(cur[1]);
    fb.textContent='🎉 '+cur[0]+'!';fb.classList.add('show');
    tip.style.visibility='hidden';
    setTimeout(()=>{
      round++;
      if(round>=ROUNDS)finish();else newRound();
    },1400);
  }else{
    wrong++;wrongThisRound=true;
    SFX.bad();
    target.className='center bad';
    shatter(c);
    fb.textContent='Not quite, try again';fb.classList.add('show');
    setTimeout(()=>{
      target.className='center';
      fb.classList.remove('show');
      busy=false;
    },900);
  }
}

/* ---------- Finish ---------- */
function finish(){
  const attempts=correct+wrong;
  const pct=attempts?Math.round(correct/attempts*100):100;
  const stars=pct>=90?3:pct>=70?2:pct>=50?1:0;
  $('prog').style.width='100%';
  $('score').textContent=`✅ ${correct}`;
  SFX.win();confetti();setTimeout(shutdown,1600);

  if(window.LAFinish){
    const timeMs=LAFinish.stopTimer?LAFinish.stopTimer():0;
    LAFinish.show({
      gameId:GAME_ID,
      gameName:"Word Wheel Match",
      category:"american-english-file",
      unit:"starter-pe1",
      score:correct,
      total:ROUNDS,
      stars:stars,
      accuracy:pct,
      timeMs:timeMs,
      save:true,
      onAgain:function(){ start(); },
      onModes:function(){ $('end').classList.remove('on'); $('start').classList.add('on'); },
      backHref:"../"
    });
    return;
  }
  // fallback
  $('end').innerHTML='<h2>Well done!</h2><p>You matched '+ROUNDS+' pictures. Accuracy '+pct+'%.</p><button class="btn" id="again">Play again</button>';
  $('end').classList.add('on');
  $('end').style.display='flex';
  document.getElementById('again').onclick=start;
}

function confetti(){
  const cols=['#ffd23f','#ff5a6e','#3ddc84','#5ab0ff','#ff9f1c'];
  for(let i=0;i<70;i++){
    const p=document.createElement('i');
    p.className='confetti';
    p.style.left=Math.random()*100+'vw';
    p.style.background=cols[i%cols.length];
    p.style.animationDuration=(2+Math.random()*2)+'s';
    p.style.animationDelay=Math.random()*.6+'s';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),4500);
  }
}

/* ---------- Chains linking the words ---------- */
function drawChains(){
  const svg=$('chains'),n=chips.length;
  if(!chainEls.length){
    const mk=(cls)=>{const e=document.createElementNS('http://www.w3.org/2000/svg','path');e.setAttribute('class',cls);return e;};
    for(let i=0;i<n;i++){const a=mk('lk'),b=mk('lk2');svg.append(a,b);chainEls.push([a,b]);}
  }
  for(let i=0;i<n;i++){
    const a=chips[i],b=chips[(i+1)%n],p=chainEls[i];
    const d=(!a.done&&!b.done)?`M${a.x} ${a.y}L${b.x} ${b.y}`:'';
    p[0].setAttribute('d',d);p[1].setAttribute('d',d);
  }
}

/* ---------- Wheel animation ---------- */
function frame(t){
  const dt=Math.min(.05,(t-lastT)/1000);
  lastT=t;
  
  spin+=dt*.35;
  const W=stage.clientWidth,cx=W/2,d=chips.length?chips[0].el.offsetWidth:100,r=W/2-d/2-4;
  for(const c of chips){
    if(!((drag&&drag.c===c)||c.done)){
      const a=c.base+spin;
      c.el.style.left=(cx+r*Math.cos(a))+'px';
      c.el.style.top=(cx+r*Math.sin(a))+'px';
    }
    c.x=parseFloat(c.el.style.left)||cx;
    c.y=parseFloat(c.el.style.top)||cx;
  }
  drawChains();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Controls ---------- */
$('go').onclick=start;
$('again').onclick=start;
$('mute').onclick=()=>{muted=!muted;$('mute').textContent=muted?'🔇':'🔊';if(hum)hum.g.gain.value=muted?0:.025;};