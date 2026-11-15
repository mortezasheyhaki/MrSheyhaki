(function () {
  "use strict";

  var GAME_ID = "starter-7a-free-time-listen-write";

  var ITEMS = [
    { label: "go out", image: "https://cdn.imgurl.ir/uploads/i263475_.png", audio: "https://cdn.imgurl.ir/uploads/s54979_.mp3" },
    { label: "play computer games", image: "https://cdn.imgurl.ir/uploads/c43008_.png", audio: "https://cdn.imgurl.ir/uploads/s325680_.mp3" },
    { label: "exercise", image: "https://cdn.imgurl.ir/uploads/p01944_.png", audio: "https://cdn.imgurl.ir/uploads/o46822_.mp3" },
    { label: "go to the beach", image: "https://cdn.imgurl.ir/uploads/z211217_.png", audio: "https://cdn.imgurl.ir/uploads/y34635_.mp3" },
    { label: "stay at home", image: "https://cdn.imgurl.ir/uploads/m038791_.png", audio: "https://cdn.imgurl.ir/uploads/d291411_.mp3" },
    { label: "play tennis", image: "https://cdn.imgurl.ir/uploads/h309983_.png", audio: "https://cdn.imgurl.ir/uploads/f06733_.mp3" },
    { label: "hike", image: "https://cdn.imgurl.ir/uploads/v021773_.png", audio: "https://cdn.imgurl.ir/uploads/a129784_.mp3" },
    { label: "play the piano", image: "https://cdn.imgurl.ir/uploads/v589989_.png", audio: "https://cdn.imgurl.ir/uploads/v66268_.mp3" },
    { label: "swim", image: "https://cdn.imgurl.ir/uploads/o206840_.png", audio: "https://cdn.imgurl.ir/uploads/l74148_.mp3" },
    { label: "meet friends", image: "https://cdn.imgurl.ir/uploads/r674726_.png", audio: "https://cdn.imgurl.ir/uploads/f0661_.mp3" },
    { label: "relax", image: "https://cdn.imgurl.ir/uploads/p343394_.png", audio: "https://cdn.imgurl.ir/uploads/i212347_.mp3" },
    { label: "travel", image: "https://cdn.imgurl.ir/uploads/o091608_.png", audio: "https://cdn.imgurl.ir/uploads/h07993_.mp3" }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clean(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var deck = shuffle(ITEMS);
  var index = 0;
  var score = 0;
  var audio = null;
  var locked = false;

  var pic = document.getElementById("pic");
  var picFallback = document.getElementById("picFallback");
  var playBtn = document.getElementById("playBtn");
  var playIcon = document.getElementById("playIcon");
  var input = document.getElementById("input");
  var form = document.getElementById("form");
  var feedback = document.getElementById("feedback");
  var prog = document.getElementById("prog");
  var checkBtn = document.getElementById("checkBtn");
  var skipBtn = document.getElementById("skipBtn");
  var hintBtn = document.getElementById("hintBtn");

  function stopAudio() {
    if (audio) {
      try { audio.pause(); } catch (e) {}
      audio = null;
    }
    playBtn.classList.remove("is-playing");
    playIcon.textContent = "▶";
  }

  function playAudio() {
    var item = deck[index];
    if (!item || !item.audio) return;
    stopAudio();
    audio = new Audio(item.audio);
    playBtn.classList.add("is-playing");
    playIcon.textContent = "❚❚";
    audio.play().catch(function () {
      playBtn.classList.remove("is-playing");
      playIcon.textContent = "▶";
    });
    audio.onended = function () {
      playBtn.classList.remove("is-playing");
      playIcon.textContent = "▶";
      audio = null;
    };
  }

  function showItem() {
    locked = false;
    stopAudio();
    var item = deck[index];
    prog.textContent = (index + 1) + "/" + deck.length;
    feedback.textContent = "";
    feedback.className = "feedback";
    input.value = "";
    input.disabled = false;
    checkBtn.disabled = false;
    input.classList.remove("ok", "bad");
    picFallback.hidden = true;
    pic.style.display = "";
    pic.onload = function () { picFallback.hidden = true; };
    pic.onerror = function () {
      pic.style.display = "none";
      picFallback.hidden = false;
      picFallback.textContent = item.label.charAt(0).toUpperCase();
    };
    pic.src = item.image;
    pic.alt = "Free-time activity";
    setTimeout(function () { input.focus(); }, 400);
  }

  function isCorrect(val, answer) {
    var a = clean(answer);
    var v = clean(val);
    if (!v) return false;
    if (v === a) return true;
    // allow minor article differences
    if (v === "a " + a || v === "an " + a || v === "to " + a) return true;
    return false;
  }

  function next() {
    index += 1;
    if (index >= deck.length) {
      finish();
      return;
    }
    showItem();
  }

  function finish() {
    stopAudio();
    var total = deck.length;
    var pct = Math.round((score / total) * 100);
    try {
      if (window.LAFinish) {
        LAFinish.show({
          gameId: GAME_ID,
          gameName: "Free-Time Listen & Write",
          score: score,
          total: total,
          title: "Free-Time Listen & Write",
          backHref: "../",
          onAgain: function () { location.reload(); },
          category: "vocabulary"
        });
      }
    } catch (e) {}
    try {
      if (window.LAStars && LAStars.saveFromAccuracy) LAStars.saveFromAccuracy(GAME_ID, pct);
    } catch (e2) {}
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (locked) return;
    var item = deck[index];
    var ok = isCorrect(input.value, item.label);
    locked = true;
    input.disabled = true;
    checkBtn.disabled = true;
    if (ok) {
      score += 1;
      input.classList.add("ok");
      feedback.textContent = "Correct!";
      feedback.className = "feedback is-ok";
      setTimeout(next, 700);
    } else {
      input.classList.add("bad");
      feedback.textContent = "Answer: " + item.label;
      feedback.className = "feedback is-bad";
      setTimeout(next, 1400);
    }
  });

  playBtn.addEventListener("click", function () {
    if (playBtn.classList.contains("is-playing")) stopAudio();
    else playAudio();
  });

  skipBtn.addEventListener("click", function () {
    if (locked) return;
    locked = true;
    feedback.textContent = "Answer: " + deck[index].label;
    feedback.className = "feedback is-bad";
    input.disabled = true;
    checkBtn.disabled = true;
    setTimeout(next, 1100);
  });

  hintBtn.addEventListener("click", function () {
    var ans = deck[index].label;
    var cur = input.value;
    // reveal next missing character from answer
    var a = ans;
    var built = "";
    for (var i = 0; i < a.length; i++) {
      if (i < cur.length && clean(cur[i]) === clean(a[i])) built += a[i];
      else {
        built += a[i];
        break;
      }
    }
    // simpler: show first letter of each word
    var hint = a.split(" ").map(function (w) { return w.charAt(0) + "_".repeat(Math.max(0, w.length - 1)); }).join(" ");
    feedback.textContent = "Hint: " + hint;
    feedback.className = "feedback";
    input.focus();
  });

  showItem();
})();
