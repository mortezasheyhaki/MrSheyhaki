/**
 * Cursor-following eyes for .eye-buddy mascot(s)
 */
(function () {
  "use strict";

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function bindBuddy(root) {
    var pupils = root.querySelectorAll(".eye-buddy__pupil");
    if (!pupils.length) return;

    var maxMove = Number(root.getAttribute("data-eye-range") || 5);

    function onMove(clientX, clientY) {
      pupils.forEach(function (pupil) {
        var eye = pupil.parentElement;
        if (!eye) return;
        var rect = eye.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = clientX - cx;
        var dy = clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var limit = maxMove;
        var nx = (dx / dist) * Math.min(limit, dist * 0.08);
        var ny = (dy / dist) * Math.min(limit, dist * 0.08);
        pupil.style.transform =
          "translate(calc(-50% + " + nx.toFixed(2) + "px), calc(-50% + " + ny.toFixed(2) + "px))";
      });
    }

    function onPointer(e) {
      onMove(e.clientX, e.clientY);
    }

    function onTouch(e) {
      if (!e.touches || !e.touches[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    window.addEventListener("mousemove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
  }

  function init() {
    document.querySelectorAll(".eye-buddy").forEach(bindBuddy);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
