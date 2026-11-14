/* AEF listening tests · phone fit
 * On phone-width screens, keeps every question and answer on one screen with
 * no scrolling: if the questions are taller than the space left between the
 * top bar and the footer, the question and answer text is stepped down a
 * little at a time (never below a readable minimum). Desktop is untouched.
 * Runs after each screen change (start, play, check, results).
 */
(function () {
  "use strict";
  var PHONE = window.matchMedia("(max-width: 600px)");
  var MAX_TEXT = 14, MAX_OPT = 13, MIN_TEXT = 10, MIN_OPT = 9.5;
  var root = document.documentElement;
  var pending = false;

  function setSizes(text, opt) {
    root.style.setProperty("--fit-text", text + "px");
    root.style.setProperty("--fit-opt", opt + "px");
  }

  function overflows() {
    var list = document.querySelector(".ul-list");
    if (list && list.scrollHeight > list.clientHeight + 1) return true;
    var rows = document.querySelectorAll(".ul-row");
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].scrollHeight > rows[i].clientHeight + 1) return true;
    }
    var app = document.querySelector(".lc-app");
    if (app && app.scrollHeight > app.clientHeight + 1) return true;
    return false;
  }

  function fit() {
    pending = false;
    if (!PHONE.matches || !document.querySelector(".ul-list")) {
      root.style.removeProperty("--fit-text");
      root.style.removeProperty("--fit-opt");
      return;
    }
    var text = MAX_TEXT, opt = MAX_OPT;
    setSizes(text, opt);
    var guard = 0;
    while (overflows() && guard++ < 40) {
      if (text <= MIN_TEXT && opt <= MIN_OPT) break;
      text = Math.max(MIN_TEXT, text - 0.5);
      opt = Math.max(MIN_OPT, opt - 0.5);
      setSizes(text, opt);
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(fit);
  }

  function start() {
    var app = document.getElementById("game-app");
    if (app && "MutationObserver" in window) {
      new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
    }
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", schedule);
    schedule();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
