
(function(){
"use strict";
const GAME_ID="1-3b-jobs-listen-write";
const ASSET="../jobs-match/";
const JOBS=[
{id:"accountant",answers:["accountant","an accountant"]},
{id:"actor",answers:["actor","an actor"]},
{id:"administrator",answers:["administrator","an administrator"]},
{id:"architect",answers:["architect","an architect"]},
{id:"chef",answers:["chef","a chef","cook","a cook"]},
{id:"cleaner",answers:["cleaner","a cleaner"]},
{id:"construction-worker",answers:["construction worker","a construction worker","constructionworker"]},
{id:"dentist",answers:["dentist","a dentist"]},
{id:"doctor",answers:["doctor","a doctor"]},
{id:"engineer",answers:["engineer","an engineer"]},
{id:"factory-worker",answers:["factory worker","a factory worker","factoryworker"]},
{id:"flight-attendant",answers:["flight attendant","a flight attendant","flightattendant"]},
{id:"guide",answers:["guide","a guide"]},
{id:"hairstylist",answers:["hair stylist","a hair stylist","hairstylist","a hairstylist"]},
{id:"journalist",answers:["journalist","a journalist"]},
{id:"lawyer",answers:["lawyer","a lawyer"]},
{id:"manager",answers:["manager","a manager","bank manager","a bank manager"]},
{id:"model",answers:["model","a model"]},
{id:"musician",answers:["musician","a musician"]},
{id:"nurse",answers:["nurse","a nurse"]},
{id:"pilot",answers:["pilot","a pilot"]},
{id:"police-officer",answers:["police officer","a police officer","policeman","a policeman","policewoman","a policewoman","policeofficer"]},
{id:"receptionist",answers:["receptionist","a receptionist"]},
{id:"salesperson",answers:["salesperson","a salesperson","sales person","a sales person"]},
{id:"soccer-player",answers:["soccer player","a soccer player","footballer","a footballer","soccerplayer"]},
{id:"soldier",answers:["soldier","a soldier"]},
{id:"taxi-driver",answers:["taxi driver","a taxi driver","taxidriver"]},
{id:"teacher",answers:["teacher","a teacher"]},
{id:"vet",answers:["vet","a vet","veterinarian","a veterinarian"]},
{id:"waiter",answers:["waiter","a waiter","waitress","a waitress","waiter / waitress","a waiter / a waitress"]}
];
function shuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function norm(s){return s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();}
function ok(user,answers){const u=norm(user);return answers.some(a=>norm(a)===u);}
let order=[],idx=0,score=0,locked=false,audio=null;
const input=document.getElementById("input"),feedback=document.getElementById("feedback");
const progress=document.getElementById("progress"),scoreEl=document.getElementById("score");
const progressFill=document.getElementById("progressFill"),qNum=document.getElementById("qNum");
const checkBtn=document.getElementById("checkBtn"),audioBtn=document.getElementById("audioBtn");
const play=document.getElementById("play"),done=document.getElementById("done");

function stopA(){if(audio){audio.pause();audio=null;}audioBtn.classList.remove("playing");}
function playA(){stopA();const j=order[idx];audio=new Audio(ASSET+"audio/"+j.id+".mp3");audioBtn.classList.add("playing");audio.addEventListener("ended",()=>audioBtn.classList.remove("playing"));audio.play().catch(()=>audioBtn.classList.remove("playing"));}
function show(){
  if(idx>=order.length){finish();return;}
  locked=false;checkBtn.disabled=false;input.disabled=false;input.value="";input.className="answer-input";
  feedback.textContent="";feedback.className="feedback";
  qNum.textContent=(idx+1)+" of "+order.length;progress.textContent=String(idx);
  progressFill.style.width=(idx/order.length)*100+"%";
  playA();setTimeout(()=>input.focus(),200);
}
function check(){
  if(locked)return;const j=order[idx];const user=input.value;if(!user.trim()){input.focus();return;}
  locked=true;checkBtn.disabled=true;input.disabled=true;
  if(ok(user,j.answers)){score++;scoreEl.textContent=String(score);input.classList.add("correct");feedback.className="feedback success";feedback.textContent="Correct! ✓";
    setTimeout(()=>{idx++;show();},850);
  }else{input.classList.add("wrong");feedback.className="feedback error";feedback.textContent="It's \""+j.answers[0]+"\"";
    setTimeout(()=>{idx++;show();},1600);}
}
function stars(p){return p>=90?3:p>=70?2:p>=40?1:0;}
function finish(){
  play.classList.add("hidden");done.classList.remove("hidden");
  const pct=Math.round((score/order.length)*100);
  document.getElementById("finalScore").textContent=score+" / "+order.length+" correct ("+pct+"%)";
  const el=document.getElementById("stars");el.innerHTML="";
  const n=stars(pct);for(let i=1;i<=3;i++){const s=document.createElement("span");s.className="star"+(i<=n?" filled":"");s.textContent=i<=n?"★":"☆";s.style.animationDelay=(i-1)*.12+"s";el.appendChild(s);}
  if(window.LAStars){try{LAStars.recordPlay(GAME_ID);LAStars.saveFromAccuracy(GAME_ID,pct);}catch(e){}}
}
function start(){order=shuffle(JOBS);idx=0;score=0;scoreEl.textContent="0";done.classList.add("hidden");play.classList.remove("hidden");show();}
audioBtn.addEventListener("click",playA);checkBtn.addEventListener("click",check);
input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();check();}});
document.getElementById("restartBtn").addEventListener("click",start);start();
})();
