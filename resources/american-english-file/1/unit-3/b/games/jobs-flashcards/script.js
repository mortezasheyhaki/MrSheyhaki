(function () {
  "use strict";

  const JOBS = [
    { id: "accountant", label: "an accountant" },
    { id: "actor", label: "an actor" },
    { id: "administrator", label: "an administrator" },
    { id: "architect", label: "an architect" },
    { id: "chef", label: "a chef" },
    { id: "cleaner", label: "a cleaner" },
    { id: "construction-worker", label: "a construction worker" },
    { id: "dentist", label: "a dentist" },
    { id: "doctor", label: "a doctor" },
    { id: "engineer", label: "an engineer" },
    { id: "factory-worker", label: "a factory worker" },
    { id: "flight-attendant", label: "a flight attendant" },
    { id: "guide", label: "a guide" },
    { id: "hairstylist", label: "a hair stylist" },
    { id: "journalist", label: "a journalist" },
    { id: "lawyer", label: "a lawyer" },
    { id: "manager", label: "a manager" },
    { id: "model", label: "a model" },
    { id: "musician", label: "a musician" },
    { id: "nurse", label: "a nurse" },
    { id: "pilot", label: "a pilot" },
    { id: "police-officer", label: "a police officer" },
    { id: "receptionist", label: "a receptionist" },
    { id: "salesperson", label: "a salesperson" },
    { id: "soccer-player", label: "a soccer player" },
    { id: "soldier", label: "a soldier" },
    { id: "taxi-driver", label: "a taxi driver" },
    { id: "teacher", label: "a teacher" },
    { id: "vet", label: "a vet" },
    { id: "waiter", label: "a waiter / waitress" }
  ];

  const ASSET = "../jobs-match/";
  const SWIPE_THRESHOLD = 70;
  const TAP_MAX_MOVE = 12;

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

  let order = JOBS.slice();
  let idx = 0;
  let audio = null;
  let flipped = false;

  const card = document.getElementById("card");
  const cardImg = document.getElementById("cardImg");
  const cardWord = document.getElementById("cardWord");
  const frontWord = document.getElementById("frontWord");
  const counter = document.getElementById("counter");
  const progressFill = document.getElementById("progressFill");
  const audioBtn = document.getElementById("audioBtn");
  const hintLeft = document.getElementById("hintLeft");
  const hintRight = document.getElementById("hintRight");

  function stopAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    audioBtn.classList.remove("playing");
  }

  function playAudio() {
    stopAudio();
    const j = order[idx];
    audio = new Audio(ASSET + "audio/" + j.id + ".mp3");
    audioBtn.classList.add("playing");
    audio.addEventListener("ended", function () {
      audioBtn.classList.remove("playing");
      audio = null;
    });
    audio.addEventListener("error", function () {
      audioBtn.classList.remove("playing");
      audio = null;
    });
    audio.play().catch(function () {
      audioBtn.classList.remove("playing");
    });
  }

  function show(animateEnter) {
    const j = order[idx];
    cardImg.src = ASSET + "images/" + j.id + ".png";
    cardImg.alt = j.label;
    cardWord.textContent = j.label;
    frontWord.textContent = j.label;
    flipped = false;
    card.classList.remove("flipped", "dragging", "fly-left", "fly-right");
    card.style.transform = "";
    counter.textContent = String(idx + 1);
    progressFill.style.width = ((idx + 1) / order.length) * 100 + "%";
    stopAudio();

    if (animateEnter) {
      card.classList.remove("enter");
      void card.offsetWidth;
      card.classList.add("enter");
    }
  }

  function flip() {
    flipped = !flipped;
    card.classList.toggle("flipped", flipped);
  }

  function goNext() {
    idx = (idx + 1) % order.length;
    show(true);
  }
  function goPrev() {
    idx = (idx - 1 + order.length) % order.length;
    show(true);
  }

  function animateAway(dir, then) {
    card.classList.add(dir === "left" ? "fly-left" : "fly-right");
    setTimeout(function () {
      then();
    }, 260);
  }

  // ——— Pointer / swipe handling ———
  let ptr = null; // { x, y, startX, startY, moved, id }

  function onPointerDown(e) {
    if (e.button === 2) return;
    ptr = {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      id: e.pointerId
    };
    try { card.setPointerCapture(e.pointerId); } catch (err) {}
    card.classList.add("dragging");
  }

  function onPointerMove(e) {
    if (!ptr || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.startX;
    const dy = e.clientY - ptr.startY;
    if (!ptr.moved && Math.hypot(dx, dy) > TAP_MAX_MOVE) {
      ptr.moved = true;
    }
    if (!ptr.moved) return;

    // Only horizontal drag for card move
    const rot = dx * 0.06;
    const base = flipped ? "rotateY(180deg) " : "";
    card.style.transform = base + "translateX(" + dx + "px) rotate(" + rot + "deg)";

    hintLeft.classList.toggle("show", dx < -30);
    hintRight.classList.toggle("show", dx > 30);
  }

  function onPointerUp(e) {
    if (!ptr || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.startX;
    const dy = e.clientY - ptr.startY;
    const wasTap = !ptr.moved;
    ptr = null;
    try { card.releasePointerCapture(e.pointerId); } catch (err) {}
    card.classList.remove("dragging");
    hintLeft.classList.remove("show");
    hintRight.classList.remove("show");

    if (wasTap) {
      card.style.transform = "";
      flip();
      return;
    }

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      const dir = dx < 0 ? "left" : "right";
      animateAway(dir, function () {
        if (dir === "left") goNext();
        else goPrev();
      });
    } else {
      // snap back
      card.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
      card.style.transform = flipped ? "rotateY(180deg)" : "";
      setTimeout(function () {
        card.style.transition = "";
      }, 300);
    }
  }

  card.addEventListener("pointerdown", onPointerDown);
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerUp);

  // Keyboard
  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  });

  audioBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    playAudio();
  });

  document.getElementById("prevBtn").addEventListener("click", goPrev);
  document.getElementById("nextBtn").addEventListener("click", goNext);
  document.getElementById("shuffleBtn").addEventListener("click", function () {
    order = shuffle(JOBS);
    idx = 0;
    show(true);
  });

  show(true);
})();
