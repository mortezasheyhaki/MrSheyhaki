/* Unit 1A Games — Shared Typography, Keyboard Shortcuts & Image Safety */
(function () {
  "use strict";

  function ensurePlusJakarta800() {
    if (document.querySelector('link[href*="Plus+Jakarta+Sans"][href*="800"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap";
    document.head.appendChild(link);
  }

  function attachImageFallbacks() {
    var app = document.getElementById("game-app");
    if (!app) return;
    app.querySelectorAll("img").forEach(function (img) {
      if (img.dataset.u1aErrBound === "1") return;
      img.dataset.u1aErrBound = "1";
      img.addEventListener("error", function () {
        if (img.dataset.u1aFallbackDone === "1") return;
        img.dataset.u1aFallbackDone = "1";
        var parent = img.parentElement;
        if (!parent) return;
        if (parent.id === "cc-photo-card") return; // complete-conversations removes card intentionally
        img.style.display = "none";
        if (!parent.querySelector(".u1a-img-fallback")) {
          var box = document.createElement("div");
          box.className = "u1a-img-fallback";
          box.setAttribute("aria-hidden", "true");
          box.innerHTML =
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>';
          parent.appendChild(box);
        }
      });
    });
  }

  function injectChoiceKeyboardHint() {
    var app = document.getElementById("game-app");
    if (!app) return;
    var chips = app.querySelector(".amor-chips");
    if (chips && chips.querySelectorAll("button.amor-chip").length >= 2 && !app.querySelector(".u1a-kbd-hint")) {
      var hint = document.createElement("p");
      hint.className = "u1a-kbd-hint";
      hint.textContent = "Tip: Press 1 or 2 on your keyboard";
      chips.insertAdjacentElement("afterend", hint);
    }
  }

  function enhance() {
    attachImageFallbacks();
    injectChoiceKeyboardHint();
  }

  function bindKeyboardShortcuts() {
    if (window.__u1aKbdBound) return;
    window.__u1aKbdBound = true;

    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var finishOverlay = document.getElementById("la-finish-overlay");
      if (finishOverlay && !finishOverlay.hidden) return;

      var tag = document.activeElement ? document.activeElement.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      var app = document.getElementById("game-app");
      if (!app) return;

      if (/^[1-7]$/.test(e.key)) {
        var idx = Number(e.key) - 1;
        var choiceTargets = app.querySelectorAll(".amor-chip, .be-option, .ld-day:not(.disabled)");
        if (choiceTargets.length && choiceTargets[idx] && !choiceTargets[idx].disabled) {
          e.preventDefault();
          choiceTargets[idx].click();
          return;
        }
      }

      if (e.key === "p" || e.key === "P") {
        var playBtn = app.querySelector("#lr-play, #ld-play, #ln-play, #lw-play");
        if (playBtn && !playBtn.disabled) {
          e.preventDefault();
          playBtn.click();
        }
      }
    });
  }

  function init() {
    ensurePlusJakarta800();
    enhance();
    bindKeyboardShortcuts();

    var app = document.getElementById("game-app");
    if (app && typeof MutationObserver === "function") {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          enhance();
        });
      }).observe(app, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
