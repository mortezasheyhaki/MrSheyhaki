/**
 * Site-wide dark / light theme for Starlight Forest (and parent arcade).
 * Stores preference in localStorage key: mrsheyhaki-theme
 */
(function () {
  var KEY = "mrsheyhaki-theme";

  function getPreferred() {
    try {
      var t = localStorage.getItem(KEY);
      if (t === "dark" || t === "light") return t;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
    // Update any theme FABs on the page
    document.querySelectorAll(".site-theme-fab").forEach(function (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.title = theme === "dark" ? "Light mode" : "Dark mode";
    });
  }

  function toggle() {
    var current = document.documentElement.getAttribute("data-theme") || getPreferred();
    apply(current === "dark" ? "light" : "dark");
  }

  // Early apply (script may load late; head script usually already set attribute)
  var initial = document.documentElement.getAttribute("data-theme") || getPreferred();
  apply(initial);

  function ensureFab() {
    if (document.querySelector(".site-theme-fab")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-theme-fab";
    btn.setAttribute("aria-label", "Toggle dark / light mode");
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    apply(document.documentElement.getAttribute("data-theme") || getPreferred());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureFab);
  } else {
    ensureFab();
  }

  // Delegate clicks on existing FABs
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest(".site-theme-fab")) {
      e.preventDefault();
      toggle();
    }
  });

  // Expose for debugging / other scripts
  window.MrSheyhakiTheme = { apply: apply, toggle: toggle, get: getPreferred };
})();
