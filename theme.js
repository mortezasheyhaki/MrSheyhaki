/* =========================================================
   MR. SHEYHAKI — GLOBAL THEME TOGGLE
   One fixed moon/sun button on every page (including games).
========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "mrsheyhaki-theme";
  var root = document.documentElement;

  function getPreferred() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function ensureFab() {
    var fab = document.getElementById("siteThemeFab");
    if (fab) return fab;

    fab = document.createElement("button");
    fab.id = "siteThemeFab";
    fab.type = "button";
    fab.className = "site-theme-fab";
    fab.setAttribute("data-theme-toggle", "true");
    fab.setAttribute("aria-label", "Toggle website theme");
    fab.title = "Toggle theme";
    document.body.appendChild(fab);
    return fab;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    // Keep body class for older game CSS that uses .light-mode
    document.body.classList.toggle("light-mode", theme === "light");
    document.body.classList.toggle("dark-mode", theme === "dark");

    var fab = document.getElementById("siteThemeFab");
    if (fab) {
      // Show the mode you can switch TO
      if (theme === "dark") {
        fab.textContent = "☀️";
        fab.setAttribute("aria-label", "Switch to light mode");
        fab.title = "Light mode";
      } else {
        fab.textContent = "🌙";
        fab.setAttribute("aria-label", "Switch to dark mode");
        fab.title = "Dark mode";
      }
    }

    // Notify games/pages that listen
    try {
      window.dispatchEvent(new CustomEvent("site-theme-change", { detail: { theme: theme } }));
    } catch (e) {}
  }

  function toggleTheme() {
    var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function init() {
    // Remove legacy toggles from headers / games
    document.querySelectorAll(
      ".arcade-nav [data-theme-toggle], " +
      ".arcade-nav .theme-toggle, " +
      "#darkModeBtn, " +
      "header .theme-toggle, " +
      ".header-controls [data-theme-toggle]"
    ).forEach(function (el) {
      if (el.id === "siteThemeFab") return;
      el.remove();
    });

    var fab = ensureFab();
    if (fab.dataset.themeBound !== "1") {
      fab.dataset.themeBound = "1";
      fab.addEventListener("click", toggleTheme);
    }

    applyTheme(getPreferred());
  }

  // Apply ASAP to reduce flash
  try {
    root.setAttribute("data-theme", getPreferred());
  } catch (e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
