/* =========================================================
   MR. SHEYHAKI — GLOBAL THEME TOGGLE (JS)
   Persists light/dark across every page.
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

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var iconOnly =
        btn.classList.contains("icon-btn") ||
        btn.classList.contains("theme-icon-only") ||
        btn.getAttribute("data-icon-only") === "true";

      if (theme === "dark") {
        btn.innerHTML = iconOnly ? "☀️" : '☀️<span>Light Mode</span>';
        btn.setAttribute("aria-label", "Switch to light mode");
      } else {
        btn.innerHTML = iconOnly ? "🌙" : '🌙<span>Dark Mode</span>';
        btn.setAttribute("aria-label", "Switch to dark mode");
      }
    });
  }

  applyTheme(getPreferred());

  function ensureThemeFab() {
    if (document.querySelector(".site-theme-fab, [data-theme-toggle]")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-theme-fab theme-icon-only";
    btn.setAttribute("data-theme-toggle", "true");
    btn.setAttribute("data-icon-only", "true");
    btn.setAttribute("aria-label", "Toggle color theme");
    document.body.appendChild(btn);

    // Refresh icon for current theme
    applyTheme(root.getAttribute("data-theme") || getPreferred());
  }

  function bindToggles() {
    ensureThemeFab();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      if (btn.dataset.themeBound === "1") return;
      btn.dataset.themeBound = "1";
      btn.addEventListener("click", function () {
        var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggles);
  } else {
    bindToggles();
  }

  /* data-back-one links use their href (one logical parent page).
     Handled by normal navigation + page transitions. */
})();

/* =========================================================
   SMOOTH PAGE TRANSITIONS (global)
========================================================= */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var DURATION = 280;

  function boot() {
    document.documentElement.classList.add("pt-ready");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add("pt-enter");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function sameOrigin(href) {
    try {
      return new URL(href, location.href).origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function shouldSkip(a) {
    if (!a || !a.getAttribute("href")) return true;
    var href = a.getAttribute("href");
    if (a.target === "_blank" || a.hasAttribute("download")) return true;
    if (href === "#" || href.charAt(0) === "#") return true;
    if (a.hasAttribute("data-no-transition")) return true;
    if (!sameOrigin(a.href)) return true;
    try {
      var u = new URL(a.href, location.href);
      if (u.pathname === location.pathname && u.search === location.search) return true;
    } catch (e) {}
    return false;
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || shouldSkip(a)) return;
      e.preventDefault();
      document.documentElement.classList.remove("pt-enter");
      document.documentElement.classList.add("pt-exit");
      var href = a.href;
      setTimeout(function () {
        location.href = href;
      }, DURATION);
    },
    true
  );
})();

/* Floating nav shrink on scroll */
(function () {
  var nav = null;
  function onScroll() {
    if (!nav) nav = document.querySelector(".arcade-nav");
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("nav-scrolled");
    else nav.classList.remove("nav-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onScroll);
  } else {
    onScroll();
  }
})();

/* Fill © year on every page */
(function () {
  function setYear() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll("#year, [data-year], .js-year").forEach(function (el) {
      el.textContent = y;
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setYear);
  } else {
    setYear();
  }
})();
