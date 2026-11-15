/**
 * Amelia's Days · listening game
 * Listen to the audio and pick Friday, Saturday or Sunday for each sentence.
 * Unit 7A | American English File Starter | Mr. Sheyhaki
 */
(function () {
  "use strict";

  var GAME_ID = "starter-7a-amelias-days";
  var AUDIO_URL = "https://cdn.imgurl.ir/uploads/x520471_.mp3";
  var DAYS = ["Friday", "Saturday", "Sunday"];

  var ITEMS = [
    { text: "She does housework.", answer: "Sunday" },
    { text: "She gets up at 5:00 a.m.", answer: "Saturday" },
    { text: "She gets up at about 9:00 a.m.", answer: "Sunday" },
    { text: "She goes to a restaurant with her husband.", answer: "Friday" },
    { text: "She goes to the supermarket.", answer: "Saturday" },
    { text: "She has lunch with her sister.", answer: "Sunday" },
    { text: "She meets friends.", answer: "Friday" },
    { text: "She watches TV.", answer: "Saturday" },
    { text: "She works until 6:00 p.m.", answer: "Saturday" }
  ];

  var TOTAL_ITEMS = ITEMS.length;
  var SCORED = ITEMS.filter(function (it) { return it.answer; }).length;
  var selections = new Array(TOTAL_ITEMS).fill(null);
  var checked = false;

  var $ = function (id) { return document.getElementById(id); };
  var list = $("sentenceList");
  var playBtn = $("playBtn");
  var playIcon = $("playIcon");
  var replayBtn = $("replayBtn");
  var seekBar = $("seekBar");
  var currentTimeEl = $("currentTime");
  var durationEl = $("duration");
  var progressText = $("progressText");
  var feedback = $("feedback");
  var checkBtn = $("checkBtn");
  var resetBtn = $("resetBtn");

  var audio = new Audio();
  audio.preload = "auto";
  audio.src = AUDIO_URL;

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function setPlayIcon(playing) {
    playIcon.textContent = playing ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    playBtn.classList.toggle("is-playing", playing);
  }
  playBtn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().catch(function () {
        feedback.textContent = "The audio could not be played. Check your connection and try again.";
        feedback.className = "feedback is-wrong";
      });
    } else {
      audio.pause();
    }
  });
  replayBtn.addEventListener("click", function () {
    audio.currentTime = 0;
    audio.play().catch(function () {});
  });
  audio.addEventListener("play", function () { setPlayIcon(true); });
  audio.addEventListener("pause", function () { setPlayIcon(false); });
  audio.addEventListener("ended", function () { setPlayIcon(false); });
  audio.addEventListener("loadedmetadata", function () {
    durationEl.textContent = fmt(audio.duration);
  });
  function paintSeek(pct) {
    seekBar.value = String(pct);
    seekBar.style.background =
      "linear-gradient(90deg, #a78bfa 0%, #7c3aed " + pct + "%, #e8e4f5 " + pct + "%, #e5e7eb 100%)";
  }
  audio.addEventListener("timeupdate", function () {
    currentTimeEl.textContent = fmt(audio.currentTime);
    if (audio.duration && isFinite(audio.duration)) {
      paintSeek((audio.currentTime / audio.duration) * 100);
    }
  });
  seekBar.addEventListener("input", function () {
    var pct = Number(seekBar.value);
    paintSeek(pct);
    if (audio.duration && isFinite(audio.duration)) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
  });
  paintSeek(0);

  function buildList() {
    list.innerHTML = "";
    ITEMS.forEach(function (item, i) {
      var li = document.createElement("li");
      li.className = "sentence";
      li.dataset.index = String(i);
      var text = document.createElement("p");
      text.className = "sentence-text";
      text.textContent = (i + 1) + ". " + item.text;
      var row = document.createElement("div");
      row.className = "day-row";
      row.setAttribute("role", "radiogroup");
      row.setAttribute("aria-label", "Day for sentence " + (i + 1));
      DAYS.forEach(function (day) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "day-btn";
        b.dataset.day = day;
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", "false");
        b.textContent = day;
        b.addEventListener("click", function () {
          if (checked) return;
          selections[i] = day;
          paint(i);
          updateProgress();
        });
        row.appendChild(b);
      });
      li.appendChild(text);
      li.appendChild(row);
      list.appendChild(li);
    });
  }

  function rowEl(i) {
    return list.querySelector('.sentence[data-index="' + i + '"]');
  }

  function paint(i) {
    var li = rowEl(i);
    if (!li) return;
    li.querySelectorAll(".day-btn").forEach(function (b) {
      var on = selections[i] === b.dataset.day;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function answeredCount() {
    return selections.filter(function (s) { return s; }).length;
  }

  function updateProgress() {
    var n = answeredCount();
    progressText.textContent = n + "/" + TOTAL_ITEMS;
    checkBtn.disabled = checked || n < TOTAL_ITEMS;
    if (!checked) {
      feedback.textContent = n < TOTAL_ITEMS
        ? "Pick a day for every sentence (" + (TOTAL_ITEMS - n) + " left)."
        : "All answered. Press Check.";
      feedback.className = "feedback";
    }
  }

  checkBtn.addEventListener("click", function () {
    if (checked || answeredCount() < TOTAL_ITEMS) return;
    checked = true;
    var correct = 0;
    ITEMS.forEach(function (item, i) {
      var li = rowEl(i);
      li.classList.remove("is-right", "is-wrong", "is-nokey");
      li.querySelectorAll(".day-btn").forEach(function (b) { b.disabled = true; });
      if (!item.answer) {
        li.classList.add("is-nokey");
        return;
      }
      var ok = selections[i] === item.answer;
      if (ok) correct++;
      li.classList.add(ok ? "is-right" : "is-wrong");
      if (!ok) {
        li.querySelectorAll(".day-btn").forEach(function (b) {
          if (b.dataset.day === item.answer) b.classList.add("is-answer");
        });
      }
    });
    checkBtn.disabled = true;
    resetBtn.textContent = "TRY AGAIN";
    feedback.textContent = "You got " + correct + " of " + SCORED + " right." +
      (SCORED < TOTAL_ITEMS ? " Grey rows have no answer key yet." : "");
    feedback.className = "feedback " + (correct === SCORED ? "is-right" : "is-partial");

    if (window.LAFinish && SCORED > 0) {
      setTimeout(function () {
        LAFinish.show({
          gameId: GAME_ID,
          score: correct,
          total: SCORED,
          onAgain: resetAll,
          backHref: "../"
        });
      }, correct === SCORED ? 500 : 900);
    }
  });

  function resetAll() {
    checked = false;
    for (var i = 0; i < TOTAL_ITEMS; i++) selections[i] = null;
    buildList();
    resetBtn.textContent = "RESET";
    updateProgress();
  }
  resetBtn.addEventListener("click", resetAll);

  buildList();
  updateProgress();
})();
