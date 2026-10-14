/* Sentence Games · shared behaviour · AEF Starter Unit 3B
 * Adds, without changing any game rules:
 *   - a soft tap sound on every pick
 *   - 💡 Hint: pulses the next correct chip (never places it)
 *   - 🔊 Listen: speaks the finished sentence (auto after a correct answer)
 *   - drag a chip into the answer area (mouse / desktop only; tap still works)
 * Games expose window.__sgWords (array) and window.__sgSentence (string).
 */
(function () {
  "use strict";
  if (window.__sgShared) return;
  window.__sgShared = true;

  var PICKABLE = ".su-tile, .word-chip, .built-chip, .blank, .mc-mode-card";
  var BANK = ".su-bank .su-tile, #wordBank .word-chip";
  var ANSWER_ZONE = ".su-slots, #answerLine";
  var justDragged = false;

  function tap() {
    try {
      if (typeof window.sfxTap === "function") window.sfxTap();
      else if (window.LASfx && typeof window.LASfx.click === "function") window.LASfx.click();
    } catch (e) {}
  }

  function isFree(el) {
    return el && !el.disabled && !el.classList.contains("used");
  }

  function placedTexts() {
    var mc = [].slice.call(document.querySelectorAll(".su-slots .su-tile.in-slot"));
    if (mc.length || document.querySelector(".su-slots")) return mc.map(function (c) { return c.textContent.trim(); });
    return [].slice.call(document.querySelectorAll("#answerLine .built-chip")).map(function (c) { return c.textContent.trim(); });
  }

  function bankChips() {
    return [].slice.call(document.querySelectorAll(BANK)).filter(isFree);
  }

  /* ---------- tap sound + stop clicks that were really drags ---------- */
  document.addEventListener("click", function (e) {
    if (justDragged) { e.stopPropagation(); e.preventDefault(); return; }
    var t = e.target && e.target.closest ? e.target.closest(PICKABLE) : null;
    if (!t || t.disabled || t.classList.contains("used")) return;
    tap();
  }, true);

  /* ---------- speech ---------- */
  function cleanSentence(s) {
    return String(s || "").replace(/\s+/g, " ").replace(/\s+([?.!,])/g, "$1").trim();
  }
  function speak(text) {
    try {
      if (!window.speechSynthesis || !text || typeof SpeechSynthesisUtterance === "undefined") return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(cleanSentence(text));
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function isCorrectNow() {
    return !!(document.querySelector(".su-tile.correct") || document.querySelector("#feedback.ok"));
  }

  /* ---------- hint ---------- */
  function hint() {
    var words = window.__sgWords;
    if (!words || !words.length) return;
    var placed = placedTexts();
    var prefixOk = placed.every(function (w, i) { return w === words[i]; });
    if (!prefixOk || placed.length >= words.length) return;
    var target = words[placed.length];
    var chip = bankChips().filter(function (c) { return c.textContent.trim() === target; })[0];
    if (!chip) return;
    chip.classList.add("sg-hint-chip");
    setTimeout(function () { chip.classList.remove("sg-hint-chip"); }, 2400);
  }

  /* ---------- tools (hint + listen) injected next to Check ---------- */
  function makeBtn(cls, icon, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sg-tool " + cls;
    b.setAttribute("aria-label", label);
    b.title = label;
    b.textContent = icon;
    return b;
  }
  function ensureTools() {
    var host = document.querySelector(".su-actions");
    var before = null;
    if (host) {
      before = host.firstChild;
    } else {
      var row = document.querySelector("#gameScreen .actions-row");
      if (!row) return;
      host = row.parentNode;
      before = row;
    }
    if (!host || host.querySelector(".sg-tools")) return;
    var wrap = document.createElement("div");
    wrap.className = "sg-tools";
    var hintBtn = makeBtn("sg-hint-btn", "💡", "Hint");
    var listenBtn = makeBtn("sg-listen-btn", "🔊", "Listen to the sentence");
    hintBtn.onclick = hint;
    listenBtn.onclick = function () { speak(window.__sgSentence); };
    wrap.appendChild(hintBtn);
    wrap.appendChild(listenBtn);
    if (before) host.insertBefore(wrap, before); else host.appendChild(wrap);
  }
  function syncTools() {
    var listen = document.querySelector(".sg-listen-btn");
    if (listen) listen.disabled = !isCorrectNow();
    var hintBtn = document.querySelector(".sg-hint-btn");
    if (hintBtn) {
      hintBtn.disabled = !(window.__sgWords && bankChips().length && !isCorrectNow());
    }
  }

  /* ---------- auto speak once per correct answer ---------- */
  var spokenFor = false;
  function autoSpeak() {
    var ok = isCorrectNow();
    if (ok && !spokenFor) { spokenFor = true; speak(window.__sgSentence); }
    if (!ok) spokenFor = false;
  }

  /* ---------- drag a chip into the answer (mouse / pen only) ---------- */
  var drag = null;
  function fineMouse() {
    try { return window.matchMedia ? window.matchMedia("(pointer: fine)").matches : true; }
    catch (e) { return true; }
  }
  document.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (!fineMouse()) return;
    var chip = e.target && e.target.closest ? e.target.closest(BANK) : null;
    if (!chip || !isFree(chip)) return;
    drag = { chip: chip, x: e.clientX, y: e.clientY, started: false, ghost: null, offX: 0, offY: 0 };
  }, true);

  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    if (!drag.started) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
      var r = drag.chip.getBoundingClientRect();
      var g = drag.chip.cloneNode(true);
      g.removeAttribute("id");
      g.disabled = false;
      g.classList.add("sg-ghost");
      g.style.width = r.width + "px";
      g.style.height = r.height + "px";
      document.body.appendChild(g);
      drag.offX = drag.x - r.left;
      drag.offY = drag.y - r.top;
      drag.ghost = g;
      drag.started = true;
      drag.chip.classList.add("sg-dragging");
    }
    drag.ghost.style.left = (e.clientX - drag.offX) + "px";
    drag.ghost.style.top = (e.clientY - drag.offY) + "px";
  }, true);

  document.addEventListener("pointerup", function (e) {
    if (!drag) return;
    var d = drag;
    drag = null;
    if (!d.started) return;
    d.ghost.remove();
    d.chip.classList.remove("sg-dragging");
    var target = document.elementFromPoint ? document.elementFromPoint(e.clientX, e.clientY) : null;
    var zone = target && target.closest ? target.closest(ANSWER_ZONE) : null;
    justDragged = true;
    // the click that follows the release is swallowed above; then place the chip via its own click
    setTimeout(function () {
      justDragged = false;
      if (zone && isFree(d.chip)) d.chip.click();
    }, 0);
  }, true);

  /* ---------- keep tools in sync with the game's rendering ---------- */
  var scheduled = false;
  function refresh() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      ensureTools();
      syncTools();
      autoSpeak();
    }, 0);
  }
  function start() {
    refresh();
    try {
      new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
