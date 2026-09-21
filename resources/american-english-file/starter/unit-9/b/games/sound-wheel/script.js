/* Sound Wheel — AEF Starter Unit 9B
 * Clothes vocabulary grouped by the five vowel sounds shown in the Student's Book.
 */
(function () {
  "use strict";

  var GAME_ID = "starter-9b-sound-wheel";

  var SOUNDS = [
    { id: "e", ipa: "e", example: "egg", hint: "as in egg" },
    { id: "u", ipa: "u", example: "boot", hint: "as in boot" },
    { id: "ae", ipa: "æ", example: "cat", hint: "as in cat" },
    { id: "ou", ipa: "oʊ", example: "phone", hint: "as in phone" },
    { id: "i", ipa: "i", example: "tree", hint: "as in tree" },
  ];

  var WORDS = [
    { id: "cap", word: "cap", sound: "ae" },
    { id: "coat", word: "coat", sound: "ou" },
    { id: "dress", word: "dress", sound: "e" },
    { id: "hat", word: "hat", sound: "ae" },
    { id: "jacket", word: "jacket", sound: "ae" },
    { id: "jeans", word: "jeans", sound: "i" },
    { id: "shoes", word: "shoes", sound: "u" },
    { id: "sneakers", word: "sneakers", sound: "i" },
    { id: "suit", word: "suit", sound: "u" },
    { id: "sweater", word: "sweater", sound: "e" },
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var solved = {};
  var correct = 0;
  var selectedSound = null;
  var draggedId = null;
  var pointerGhost = null;
  var pointerId = null;
  var startPoint = null;
  var moved = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }

  function sfx(name) {
    try {
      if (!window.LASfx) return;
      if (name === "good" && LASfx.correct) LASfx.correct();
      else if (name === "bad" && LASfx.wrong) LASfx.wrong();
      else if (name === "click" && LASfx.click) LASfx.click();
      else if (name === "win" && LASfx.win) LASfx.win();
    } catch (_) {}
  }

  function startGame() {
    phase = "play";
    order = shuffle(WORDS.map(function (_, i) { return i; }));
    solved = {};
    correct = 0;
    selectedSound = null;
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function wordById(id) {
    return WORDS.find(function (w) { return w.id === id; });
  }

  function soundById(id) {
    return SOUNDS.find(function (s) { return s.id === id; });
  }

  function setFeedback(text, type) {
    var el = document.getElementById("feedback");
    if (!el) return;
    el.textContent = text || "";
    el.className = "sw-feedback" + (type ? " " + type : "");
  }

  function chooseSound(id) {
    selectedSound = id;
    sfx("click");
    document.querySelectorAll(".sw-tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.sound === id);
    });
    setFeedback("Drag a word to " + soundById(id).ipa + " — " + soundById(id).example + ".", "");
  }

  function checkWord(wordId, targetSound, sourceEl) {
    if (!wordId || solved[wordId]) return;
    var word = wordById(wordId);
    if (!word) return;

    if (word.sound === targetSound) {
      solved[wordId] = true;
      correct++;
      sourceEl.classList.remove("dragging", "wrong");
      sourceEl.classList.add("correct");
      sourceEl.setAttribute("aria-disabled", "true");
      sourceEl.draggable = false;
      var tab = document.querySelector('.sw-tab[data-sound="' + targetSound + '"]');
      if (tab) {
        tab.classList.add("active");
        setTimeout(function () { tab.classList.remove("active"); }, 450);
      }
      sfx("good");
      setFeedback("✓ " + word.word + " goes with /" + soundById(targetSound).ipa + "/.", "good");
      if (correct === WORDS.length) {
        setTimeout(finishGame, 650);
      }
    } else {
      sourceEl.classList.remove("dragging");
      sourceEl.classList.add("wrong");
      sfx("bad");
      setFeedback("Try again — listen to the sound in the middle of the word.", "bad");
      setTimeout(function () { sourceEl.classList.remove("wrong"); }, 400);
    }
  }

  function finishGame() {
    if (phase === "done") return;
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: correct,
        total: WORDS.length,
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: "../",
        save: true,
      });
      return;
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, Math.round(correct / WORDS.length * 100));
      }
    } catch (_) {}
    render();
  }

  function renderStart() {
    app.innerHTML = '' +
      '<section class="sw-start">' +
        '<div class="sw-hero" aria-hidden="true">🎡🔤</div>' +
        '<h1>Sound Wheel</h1>' +
        '<p class="sw-lead">Drag each clothes word into the correct sound tab.<br>Use the examples around the wheel to help you.</p>' +
        '<div class="sw-demo">' +
          SOUNDS.map(function (s) { return '<span class="sw-chip">/' + escapeHtml(s.ipa) + '/ ' + escapeHtml(s.example) + '</span>'; }).join('') +
        '</div>' +
        '<button type="button" class="sw-btn" id="startBtn">Start</button>' +
      '</section>';
    document.getElementById("startBtn").onclick = function () { sfx("click"); startGame(); };
  }

  function renderPlay() {
    var words = order.map(function (i) { return WORDS[i]; }).filter(function (w) { return !solved[w.id]; });

    app.innerHTML = '' +
      '<header class="sw-topbar">' +
        '<a class="sw-back" href="../" aria-label="Back">←</a>' +
        '<div class="sw-heading"><span class="sw-eyebrow">Starter · Unit 9B</span><span class="sw-title">Sound Wheel</span></div>' +
        '<div class="sw-score" id="score">' + correct + ' / ' + WORDS.length + '</div>' +
      '</header>' +
      '<p class="sw-instruction">Drag the words from the center to the correct sound. Click a tab to highlight it.</p>' +
      '<section class="sw-stage" aria-label="Sound selection wheel">' +
        '<div class="sw-wheel" id="wheel">' +
          SOUNDS.map(function (s, i) {
            return '<button type="button" class="sw-tab t' + i + '" data-sound="' + s.id + '" aria-label="Sound /' + escapeHtml(s.ipa) + '/ as in ' + escapeHtml(s.example) + '">' +
              '<span class="ipa">/' + escapeHtml(s.ipa) + '/</span>' +
              '<span class="example">' + escapeHtml(s.example) + '</span>' +
              '<span class="mini">' + escapeHtml(s.hint) + '</span>' +
            '</button>';
          }).join('') +
          '<div class="sw-center" id="center" aria-label="Words to sort">' +
            '<span class="sw-center-label">Drag words</span>' +
            words.map(function (w) {
              return '<div class="sw-word" draggable="true" tabindex="0" data-word="' + escapeHtml(w.id) + '" role="button" aria-label="Drag ' + escapeHtml(w.word) + '">' + escapeHtml(w.word) + '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +
      '<div class="sw-help">Sounds: /e/ egg · /u/ boot · /æ/ cat · /oʊ/ phone · /i/ tree</div>' +
      '<p class="sw-feedback" id="feedback" aria-live="polite"></p>';

    document.querySelectorAll(".sw-tab").forEach(function (tab) {
      tab.addEventListener("click", function () { chooseSound(tab.dataset.sound); });
      tab.addEventListener("dragover", function (e) {
        e.preventDefault();
        tab.classList.add("drag-over");
      });
      tab.addEventListener("dragleave", function () { tab.classList.remove("drag-over"); });
      tab.addEventListener("drop", function (e) {
        e.preventDefault();
        tab.classList.remove("drag-over");
        var id = e.dataTransfer.getData("text/plain");
        var el = document.querySelector('.sw-word[data-word="' + id + '"]');
        checkWord(id, tab.dataset.sound, el);
      });
    });

    document.querySelectorAll(".sw-word").forEach(function (wordEl) {
      wordEl.addEventListener("dragstart", function (e) {
        draggedId = wordEl.dataset.word;
        wordEl.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", draggedId);
      });
      wordEl.addEventListener("dragend", function () { wordEl.classList.remove("dragging"); draggedId = null; });
      wordEl.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && selectedSound) {
          e.preventDefault();
          checkWord(wordEl.dataset.word, selectedSound, wordEl);
        }
      });
      bindPointerDrag(wordEl);
    });
  }

  /* Pointer-based drag fallback makes the same game usable on touchscreens where
   * native HTML drag-and-drop is inconsistent. The native drag API remains active
   * for desktop browsers. */
  function bindPointerDrag(el) {
    el.addEventListener("pointerdown", function (e) {
      // Let the browser's native drag-and-drop handle mouse users; this fallback
      // is primarily for touch/pen devices where native HTML DnD is inconsistent.
      if (e.pointerType === "mouse") return;
      if (solved[el.dataset.word]) return;
      pointerId = e.pointerId;
      startPoint = { x: e.clientX, y: e.clientY };
      moved = false;
      try { el.setPointerCapture(pointerId); } catch (_) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (pointerId !== e.pointerId || !startPoint || solved[el.dataset.word]) return;
      var dx = e.clientX - startPoint.x;
      var dy = e.clientY - startPoint.y;
      if (!moved && Math.hypot(dx, dy) < 8) return;
      moved = true;
      if (!pointerGhost) {
        pointerGhost = el.cloneNode(true);
        pointerGhost.className = "sw-word dragging";
        pointerGhost.style.position = "fixed";
        pointerGhost.style.zIndex = "99999";
        pointerGhost.style.pointerEvents = "none";
        pointerGhost.style.margin = "0";
        document.body.appendChild(pointerGhost);
      }
      pointerGhost.style.left = (e.clientX - pointerGhost.offsetWidth / 2) + "px";
      pointerGhost.style.top = (e.clientY - pointerGhost.offsetHeight / 2) + "px";
      el.classList.add("dragging");
      highlightTabAt(e.clientX, e.clientY);
    });
    el.addEventListener("pointerup", function (e) {
      if (pointerId !== e.pointerId) return;
      if (moved) {
        var tab = tabAt(e.clientX, e.clientY);
        if (tab) checkWord(el.dataset.word, tab.dataset.sound, el);
        clearTabHighlights();
      } else if (selectedSound) {
        checkWord(el.dataset.word, selectedSound, el);
      }
      cleanupPointerDrag(el);
    });
    el.addEventListener("pointercancel", function () { cleanupPointerDrag(el); });
  }

  function tabAt(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest(".sw-tab") : null;
  }
  function highlightTabAt(x, y) {
    var tab = tabAt(x, y);
    clearTabHighlights();
    if (tab) tab.classList.add("drag-over");
  }
  function clearTabHighlights() {
    document.querySelectorAll(".sw-tab.drag-over").forEach(function (x) { x.classList.remove("drag-over"); });
  }
  function cleanupPointerDrag(el) {
    el.classList.remove("dragging");
    if (pointerGhost && pointerGhost.parentNode) pointerGhost.parentNode.removeChild(pointerGhost);
    pointerGhost = null;
    pointerId = null;
    startPoint = null;
    moved = false;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderPlay();
  }

  render();
})();
