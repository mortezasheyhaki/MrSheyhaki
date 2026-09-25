(function(){

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
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID='starter-10a-hotel-flashcards';
  const PARTS={
    room:{title:'In a hotel room',cards:[
      ['a bed','https://cdn.imgurl.ir/uploads/w156592_a_bed.png','https://cdn.imgurl.ir/uploads/k079888_a_bed.mp3'],
      ['a pillow','https://cdn.imgurl.ir/uploads/p010495_a_pillow.png','https://cdn.imgurl.ir/uploads/k982929_a_pillow.mp3'],
      ['a lamp','https://cdn.imgurl.ir/uploads/v696561_a_lamp.png','https://cdn.imgurl.ir/uploads/e308997_a_lamp.mp3'],
      ['a light','https://cdn.imgurl.ir/uploads/j614692_a_light.png','https://cdn.imgurl.ir/uploads/c0025_a_light.mp3'],
      ['a remote control','https://cdn.imgurl.ir/uploads/e652023_a_remove_control.png','https://cdn.imgurl.ir/uploads/l2390_a_remote_control.mp3'],
      ['the floor','https://cdn.imgurl.ir/uploads/o904724_the_floor.png','https://cdn.imgurl.ir/uploads/m188759_the_floor.mp3'],
      ['the bathroom','https://cdn.imgurl.ir/uploads/n04774_the_bathroom.png','https://cdn.imgurl.ir/uploads/b0956_the_bathroom.mp3'],
      ['a bathtub','https://cdn.imgurl.ir/uploads/t193497_a_bathtub.png','https://cdn.imgurl.ir/uploads/w654862_a_bathtub.mp3'],
      ['a shower','https://cdn.imgurl.ir/uploads/o196841_a_shower.png','https://cdn.imgurl.ir/uploads/k048616_a_shower.mp3'],
      ['a towel','https://cdn.imgurl.ir/uploads/m945704_a_towel.png','https://cdn.imgurl.ir/uploads/b252792_a_towel.mp3'],
      ['a toilet','https://cdn.imgurl.ir/uploads/v467822_a_toilet.png','https://cdn.imgurl.ir/uploads/f60235_a_toilet.mp3'],
      ['a closet','https://cdn.imgurl.ir/uploads/n887137_a_closet.png','https://cdn.imgurl.ir/uploads/t492243_a_closet.mp3']
    ]},
    hotel:{title:'In a hotel',cards:[
      ['a swimming pool','https://cdn.imgurl.ir/uploads/x1462_a_swimming_pool.png','https://cdn.imgurl.ir/uploads/d337216_a_swimming_pool.mp3'],
      ['a spa','https://cdn.imgurl.ir/uploads/j85267_a_spa.png','https://cdn.imgurl.ir/uploads/n980047_a_spa.mp3'],
      ['restrooms','https://cdn.imgurl.ir/uploads/u43155_restrooms.png','https://cdn.imgurl.ir/uploads/c574354_restrooms.mp3'],
      ['a restaurant','https://cdn.imgurl.ir/uploads/k21894_a_restaurant.png','https://cdn.imgurl.ir/uploads/n69415_a_restaurant.mp3'],
      ['a kitchen','https://cdn.imgurl.ir/uploads/4410_a_kitchen.png','https://cdn.imgurl.ir/uploads/e68954_a_kitchen.mp3'],
      ['a gym','https://cdn.imgurl.ir/uploads/o238_a_gym.png','https://cdn.imgurl.ir/uploads/r336398_a_gym.mp3'],
      ['an elevator','https://cdn.imgurl.ir/uploads/z20608_an_elevator.png','https://cdn.imgurl.ir/uploads/c3178_an_elevator.mp3'],
      ['a gift shop','https://cdn.imgurl.ir/uploads/d102908_a_giftshop.png','https://cdn.imgurl.ir/uploads/n476020_a_gift_shop.mp3'],
      ['a reception','https://cdn.imgurl.ir/uploads/r999252_a_reception.png','https://cdn.imgurl.ir/uploads/c6929_reception.mp3'],
      ['a yard','https://cdn.imgurl.ir/uploads/l072363_a_yard.png','https://cdn.imgurl.ir/uploads/k105407_a_yard.mp3'],
      ['a parking lot','https://cdn.imgurl.ir/uploads/127321_a_parking_lot.png','https://cdn.imgurl.ir/uploads/q43318_a_parking_lot.mp3']
    ]}
  };
  const app=document.getElementById('game-app'); if(!app)return;
  let part='room', index=0, flipped=false, audio=null, ctx=null;
  const data=()=>PARTS[part].cards;
  function effect(kind){
    try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)(); if(ctx.state==='suspended')ctx.resume(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); const now=ctx.currentTime; o.frequency.value=kind==='flip'?520:kind==='next'?700:kind==='back'?440:820; o.type='sine';g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.055,now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+.12);o.start(now);o.stop(now+.13)}catch(e){}
  }
  function stop(){if(audio){try{audio.pause()}catch(e){} audio=null}const b=app.querySelector('.fc-audio-btn');if(b)b.classList.remove('playing')}
  function play(){const c=data()[index];if(!c)return;stop();const a=new Audio(c[2]);audio=a;const b=app.querySelector('.fc-audio-btn');if(b)b.classList.add('playing');a.play().catch(()=>{if(b)b.classList.remove('playing')});a.onended=()=>{if(b)b.classList.remove('playing');if(audio===a)audio=null}}
  function flip(){flipped=!flipped;const el=app.querySelector('.fc-card');if(el)el.classList.toggle('is-flipped',flipped);effect('flip');if(flipped)setTimeout(play,220);else stop()}
  function go(d,source){const n=index+d;if(n<0||n>=data().length)return;stop();index=n;flipped=false;effect(d>0?'next':'back');render();requestAnimationFrame(()=>{const c=app.querySelector('.fc-card');if(c)c.classList.add(d>0?'slide-next':'slide-prev')});setTimeout(play,170)}
  function choose(p){if(p===part)return;stop();part=p;index=0;flipped=false;effect('next');render();setTimeout(play,170)}
  function finish(){stop();if(window.LAStars){LAStars.recordPlay(GAME_ID);LAStars.save(GAME_ID,3)} if(window.LAFinish){const t=LAFinish.stopTimer();LAFinish.show({gameId:GAME_ID,score:PARTS.room.cards.length+PARTS.hotel.cards.length,total:PARTS.room.cards.length+PARTS.hotel.cards.length,stars:3,timeMs:t,onAgain:restart,onModes:restart,backHref:'../',save:false});return}}
  function restart(){if(window.LAFinish)LAFinish.startTimer();part='room';index=0;flipped=false;render()}
  function bindSwipe(el){let sx=0,sy=0,dx=0,drag=false;el._didSwipe=false;el.addEventListener('pointerdown',e=>{if(e.target.closest('.fc-audio-btn'))return;sx=e.clientX;sy=e.clientY;dx=0;el._didSwipe=false;drag=true;el.setPointerCapture?.(e.pointerId);el.classList.add('swiping')});el.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;const dy=e.clientY-sy;if(Math.abs(dy)>Math.abs(dx)+10){drag=false;el.classList.remove('swiping');return}if(Math.abs(dx)>4)el.style.transform=`translateX(${dx*.35}px) rotate(${dx*.025}deg)`});el.addEventListener('pointerup',()=>{if(!drag)return;drag=false;el.classList.remove('swiping');const th=Math.min(90,el.offsetWidth*.23);el.style.transform='';if(dx<-th){el._didSwipe=true;if(index<data().length-1)go(1,'swipe');else if(part==='room')choose('hotel');else finish()}else if(dx>th){el._didSwipe=true;go(-1,'swipe')}dx=0});el.addEventListener('pointercancel',()=>{drag=false;el.classList.remove('swiping');el.style.transform='';dx=0})}
  function render(){const c=data()[index],last=index===data().length-1;app.innerHTML=`<header class="fc-topbar"><a class="fc-back" href="../" aria-label="Back">←</a><span class="fc-title">Hotel Flashcards</span><span class="fc-badge">${index+1} / ${data().length}</span></header><div class="fc-parts"><button class="fc-part ${part==='room'?'active':''}" data-part="room">Part 1 · In a hotel room</button><button class="fc-part ${part==='hotel'?'active':''}" data-part="hotel">Part 2 · In a hotel</button></div><div class="fc-progress"><div class="fc-progress-fill" style="width:${((index+1)/data().length)*100}%"></div></div><div class="fc-stage"><div class="fc-card${flipped?' is-flipped':''}" id="fc-card" tabindex="0" role="button" aria-label="Flashcard — click to turn"><div class="fc-card-inner"><div class="fc-face fc-front"><img class="fc-img" src="${c[1]}" alt="${c[0]}" draggable="false"><span class="fc-hint">Click to turn · Swipe for next</span></div><div class="fc-face fc-back"><p class="fc-word">${c[0]}</p></div></div></div></div><div class="fc-controls"><button class="fc-nav" id="prev" ${index===0?'disabled':''} aria-label="Previous">←</button><button class="fc-audio-btn" id="audio" aria-label="Play audio"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg><span class="eq"><span></span><span></span><span></span><span></span></span></button><button class="fc-nav" id="next" aria-label="Next">${last?(part==='room'?'→':'✓'):'→'}</button></div><div class="fc-footer"><span class="fc-note">${PARTS[part].title} · ${last?(part==='room'?'Swipe or press → for Part 2':'You’re done'):'Swipe or use the arrows'}</span></div>`;
    app.querySelectorAll('.fc-part').forEach(b=>b.onclick=()=>choose(b.dataset.part));
    const card=app.querySelector('#fc-card');card.onclick=e=>{if(e.target.closest('.fc-audio-btn')||card._didSwipe){card._didSwipe=false;return;}flip()};
    app.querySelector('#audio').onclick=e=>{e.stopPropagation();play()};app.querySelector('#prev').onclick=()=>go(-1,'button');app.querySelector('#next').onclick=()=>{if(last){if(part==='room')choose('hotel');else finish()}else go(1,'button')};bindSwipe(card);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}else if(e.key==='ArrowRight'){e.preventDefault();if(last){if(part==='room')choose('hotel');else finish()}else go(1,'key')}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1,'key')}};
  }
  if(window.LAFinish)LAFinish.startTimer();render();
})();
