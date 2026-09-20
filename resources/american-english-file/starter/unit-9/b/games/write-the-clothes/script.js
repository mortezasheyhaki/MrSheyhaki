/* Write the Clothes – Unit 9B · AEF Starter */
(function () {
  "use strict";

  const GAME_ID = "starter-9b-write-the-clothes";

  const ITEMS = [
    { id: "cap", label: "cap", audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3", image: "https://cdn.imgurl.ir/uploads/b4742_cap.png", answers: ["cap"] },
    { id: "coat", label: "coat", audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3", image: "https://cdn.imgurl.ir/uploads/w043594_coat.png", answers: ["coat"] },
    { id: "dress", label: "dress", audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3", image: "https://cdn.imgurl.ir/uploads/d995053_dress.png", answers: ["dress"] },
    { id: "hat", label: "hat", audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3", image: "https://cdn.imgurl.ir/uploads/o3351_hat.png", answers: ["hat"] },
    { id: "jacket", label: "jacket", audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3", image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png", answers: ["jacket"] },
    { id: "jeans", label: "jeans", audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3", image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png", answers: ["jeans"] },
    { id: "pants", label: "pants", audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3", image: "https://cdn.imgurl.ir/uploads/i04627_pants.png", answers: ["pants", "trousers"] },
    { id: "shirt", label: "shirt", audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3", image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png", answers: ["shirt"] },
    { id: "shoes", label: "shoes", audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3", image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png", answers: ["shoes"] },
    { id: "shorts", label: "shorts", audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3", image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png", answers: ["shorts"] },
    { id: "skirt", label: "skirt", audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3", image: "https://cdn.imgurl.ir/uploads/a444189_st.png", answers: ["skirt"] },
    { id: "sneakers", label: "sneakers", audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3", image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png", answers: ["sneakers", "trainers"] },
    { id: "socks", label: "socks", audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3", image: "https://cdn.imgurl.ir/uploads/k600200_socks.png", answers: ["socks"] },
    { id: "suit", label: "suit", audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3", image: "https://cdn.imgurl.ir/uploads/e98017_suit.png", answers: ["suit"] },
    { id: "sweater", label: "sweater", audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3", image: "https://cdn.imgurl.ir/uploads/x441494_swer.png", answers: ["sweater", "jumper", "pullover"] },
    { id: "t-shirt", label: "T-shirt", audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3", image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png", answers: ["t-shirt", "tshirt", "t shirt", "tee", "tee-shirt"] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastUserInput = "";
  let advanceTimer = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function normalizeLoose(str) {
    return normalize(str).replace(/[\s\-]+/g, "");
  }

  function isCorrect(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    const nl = normalizeLoose(userInput);
    return item.answers.some(function (a) {
      return normalize(a) === n || normalizeLoose(a) === nl;
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio() {
    const item = ITEMS[order[index]];
    if (!item || !item.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      const btn = app.querySelector(".lw-play");
      if (btn) btn.classList.add("playing");
      currentAudio.play().catch(function () {});
      currentAudio.onended = function () {
        if (btn) btn.classList.remove("playing");
      };
    } catch (e) {}
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function startGame() {
    clearTimer();
    stopAudio();
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    correctCount = 0;
    answered = false;
    phase = "play";
    render();
    setTimeout(playAudio, 300);
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = input ? input.value : "";
    if (!normalize(val)) return;
    answered = true;
    lastUserInput = val.trim();
    const item = ITEMS[order[index]];
    lastCorrect = isCorrect(val, item);
    if (lastCorrect) correctCount += 1;
    if (window.LASfx) {
      if (lastCorrect) LASfx.correct();
      else LASfx.wrong();
    }
    phase = "feedback";
    render();
    advanceTimer = setTimeout(nextItem, lastCorrect ? 900 : 1600);
  }

  function nextItem() {
    clearTimer();
    stopAudio();
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastCorrect = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playAudio, 250);
    } else {
      phase = "done";
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Write the Clothes</span>' +
        '<span class="lw-badge">9B</span>' +
        "</header>" +
        '<section class="lw-start">' +
        '<div class="lw-hero" aria-hidden="true">👕</div>' +
        "<h1>Write the Clothes</h1>" +
        '<p class="lw-desc">Look at the picture (or listen) and type the word.<br>16 clothes items</p>' +
        '<button type="button" class="lw-btn" id="lw-start">Start →</button>' +
        "</section>";
      document.getElementById("lw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LASfx) LASfx.win();
      var total = order.length;
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: Math.max(total, 1),
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            phase = "menu";
            render();
          },
          backHref: "../",
          save: true,
        });
        return;
      }
      if (window.LAStars) {
        try {
          var acc = Math.round((correctCount / total) * 100);
          LAStars.recordPlay(GAME_ID);
          LAStars.saveFromAccuracy(GAME_ID, acc);
        } catch (e) {}
      }
      app.innerHTML =
        '<header class="lw-topbar"><a class="lw-back" href="../">←</a><span class="lw-title">Write the Clothes</span><span class="lw-badge">Done</span></header>' +
        '<section class="lw-done"><h1>Well done!</h1><p>You got <strong>' +
        correctCount +
        " / " +
        total +
        '</strong></p><button type="button" class="lw-btn" id="fb-again">Play again</button></section>';
      document.getElementById("fb-again").onclick = startGame;
      return;
    }

    var item = ITEMS[order[index]];
    var progress = index + 1 + " / " + order.length;

    if (phase === "play") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<span class="lw-title">Write the Clothes</span>' +
        '<span class="lw-progress">' +
        progress +
        "</span>" +
        "</header>" +
        '<section class="lw-play-area">' +
        '<p class="lw-instruction">Type the name of the item</p>' +
        '<div class="lw-pic-wrap"><img class="lw-pic" src="' +
        item.image +
        '" alt="" draggable="false"></div>' +
        '<button type="button" class="lw-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        "</button>" +
        '<div class="lw-input-wrap">' +
        '<input type="text" id="lw-input" class="lw-input" placeholder="Type the word…" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">' +
        "</div>" +
        '<div class="lw-actions">' +
        '<button type="button" class="lw-btn" id="lw-check" disabled>Check</button>' +
        "</div>" +
        "</section>";

      var input = document.getElementById("lw-input");
      var checkBtn = document.getElementById("lw-check");
      document.querySelector(".lw-play").onclick = playAudio;
      input.addEventListener("input", function () {
        checkBtn.disabled = !input.value.trim();
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && input.value.trim()) {
          e.preventDefault();
          checkAnswer();
        }
      });
      checkBtn.onclick = checkAnswer;
      setTimeout(function () {
        try {
          input.focus();
        } catch (e) {}
      }, 80);
      return;
    }

    // feedback
    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<span class="lw-title">Write the Clothes</span>' +
      '<span class="lw-progress">' +
      progress +
      "</span>" +
      "</header>" +
      '<section class="lw-play-area">' +
      '<div class="lw-pic-wrap"><img class="lw-pic" src="' +
      item.image +
      '" alt="" draggable="false"></div>' +
      '<p class="lw-feedback ' +
      (lastCorrect ? "ok" : "bad") +
      '">' +
      (lastCorrect
        ? "Correct!"
        : 'Answer: <strong class="lw-answer-word">' + escapeHtml(item.label) + "</strong>") +
      "</p>" +
      (lastCorrect
        ? ""
        : '<p class="lw-your-answer">You wrote: <em>' + escapeHtml(lastUserInput) + "</em></p>") +
      "</section>";
  }

  render();
})();
