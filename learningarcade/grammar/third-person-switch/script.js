const ITEMS=[
{subject:"She",base:"play",third:"plays",sentence:"tennis on Sundays."},
{subject:"He",base:"go",third:"goes",sentence:"to school by bus."},
{subject:"It",base:"work",third:"works",sentence:"well on my computer."},
{subject:"They",base:"watch",third:"watches",sentence:"movies on Friday."},
{subject:"She",base:"study",third:"studies",sentence:"English every day."},
{subject:"I",base:"like",third:"likes",sentence:"pizza and pasta."},
{subject:"He",base:"teach",third:"teaches",sentence:"math at our school."},
{subject:"We",base:"live",third:"lives",sentence:"near the park."},
{subject:"She",base:"wash",third:"washes",sentence:"the dishes after dinner."},
{subject:"The cat",base:"sleep",third:"sleeps",sentence:"on the sofa."},
{subject:"You",base:"need",third:"needs",sentence:"a pencil for the test."},
{subject:"My brother",base:"fly",third:"flies",sentence:"to London every year."}
];
const needsS=s=>{const x=s.toLowerCase();return !["i","you","we","they"].includes(x)};
let order=[],index=0,score=0;
const $=id=>document.getElementById(id);
const show=id=>["startPanel","gamePanel","endPanel"].forEach(p=>$(p).classList.toggle("tps-hidden",p!==id));
function startGame(){order=[...ITEMS.keys()].sort(()=>Math.random()-.5);index=0;score=0;show("gamePanel");renderRound()}
function renderRound(){
 if(index>=order.length)return endGame();
 const item=ITEMS[order[index]];
 const correct=needsS(item.subject)?item.third:item.base;
 const wrong=correct===item.third?item.base:item.third;
 const opts=[correct,wrong,item.base+"ing"].sort(()=>Math.random()-.5);
 $("roundLabel").textContent=`Round ${index+1} / ${order.length}`;
 $("scoreLabel").textContent=`Score ${score}`;
 $("prompt").innerHTML=`<b>${item.subject}</b> _____ ${item.sentence}`;
 $("feedback").textContent="";
 $("options").innerHTML=opts.map(o=>`<button class="tps-opt" data-v="${o}">${item.subject} <b>${o}</b> ${item.sentence}</button>`).join("");
 [...$("options").querySelectorAll(".tps-opt")].forEach(btn=>{
  btn.onclick=()=>{
   const ok=btn.dataset.v===correct;
   [...$("options").querySelectorAll(".tps-opt")].forEach(b=>{b.disabled=true;if(b.dataset.v===correct)b.classList.add("correct")});
   if(ok){score++;btn.classList.add("correct");$("feedback").textContent="✅ Correct!"}
   else{btn.classList.add("wrong");$("feedback").textContent=`Correct: ${item.subject} ${correct}`}
   $("scoreLabel").textContent=`Score ${score}`;
   setTimeout(()=>{index++;renderRound()},900);
  };
 });
}
function endGame(){
 show("endPanel");
 const pct=score/order.length;
 $("endStars").textContent=pct>=.9?"★★★":pct>=.7?"★★☆":"★☆☆";
 $("endText").textContent=`You got ${score} out of ${order.length} correct.`;
}
$("startBtn").onclick=startGame;$("replayBtn").onclick=startGame;
