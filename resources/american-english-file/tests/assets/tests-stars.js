/* Tests & Exams – one star per finished test (not score-based, stored on this device) */
(function () {
  "use strict";
  var KEY = "aef-starter-test-stars";
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  var API = {
    has: function (id) { return !!read()[id]; },
    /* returns true the first time a star is earned for this test */
    award: function (id) {
      var d = read(), isNew = !d[id];
      d[id] = 1;
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      return isNew;
    },
    paint: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll("[data-star], [data-star-all]"), function (el) {
        var all = el.getAttribute("data-star-all");
        var on = all ? all.split(",").every(function (id) { return API.has(id.trim()); }) : API.has(el.getAttribute("data-star"));
        el.classList.toggle("on", on);
        el.textContent = on ? "★" : "☆";
        el.setAttribute("aria-label", on ? "1 star earned" : "Star not earned yet");
        el.title = on ? (all ? "All tests finished" : "1 star earned") : (all ? "Finish all tests in this unit" : "Finish this test to earn a star");
      });
    }
  };
  window.TestStars = API;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { API.paint(); });
  else API.paint();
})();
