/* =========================================================
   Mr. Sheyhaki — Shared Site Script
   ========================================================= */
(function () {
  "use strict";

  function init() {
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    document.querySelectorAll("img").forEach(function (img) {
      if (img.dataset.errBound === "1") return;
      img.dataset.errBound = "1";
      if (!img.getAttribute("referrerpolicy")) {
        img.setAttribute("referrerpolicy", "no-referrer");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
