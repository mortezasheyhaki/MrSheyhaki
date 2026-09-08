/* =========================================================
   MR. SHEYHAKI — GLOBAL THEME TOGGLE (JS)
   Wall light-switch UI + LED edges. Persists light/dark
   across every page and game (localStorage: mrsheyhaki-theme).
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

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme !== "dark" && theme !== "light") theme = "light";
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    // Sync wall-switch handle + ARIA
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      // Legacy emoji FABs (if any remain)
      var iconOnly =
        btn.classList.contains("icon-btn") ||
        btn.classList.contains("theme-icon-only") ||
        btn.getAttribute("data-icon-only") === "true";
      if (!btn.classList.contains("wall-switch") && iconOnly && !btn.querySelector(".switch-handle")) {
        btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
      }
    });

    // Ensure LED strips exist and reflect theme
    ensureLedStrips();
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }

  function ensureLedStrips() {
    if (!document.body) return;
    document.body.classList.add("site-led-ambient");
    if (!document.getElementById("site-led-left")) {
      var left = document.createElement("div");
      left.id = "site-led-left";
      left.className = "site-led-strip left";
      left.setAttribute("aria-hidden", "true");
      document.body.appendChild(left);
    }
    if (!document.getElementById("site-led-right")) {
      var right = document.createElement("div");
      right.id = "site-led-right";
      right.className = "site-led-strip right";
      right.setAttribute("aria-hidden", "true");
      document.body.appendChild(right);
    }
  }

  function buildWallSwitch() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-theme-fab wall-switch";
    btn.setAttribute("data-theme-toggle", "true");
    btn.setAttribute("aria-label", "Toggle color theme");
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML =
      '<span class="switch-plate" aria-hidden="true">' +
        '<span class="screw top"></span>' +
        '<span class="switch-track">' +
          '<span class="switch-handle"></span>' +
        '</span>' +
        '<span class="screw bottom"></span>' +
      '</span>';
    return btn;
  }

  function ensureThemeFab() {
    var nav = document.querySelector(".arcade-nav");

    var existing = document.querySelector("[data-theme-toggle]");
    if (existing) {
      if (existing.closest(".arcade-nav") || existing.closest("header")) {
        document.body.appendChild(existing);
      }
      // Upgrade plain FAB into wall switch if needed
      if (!existing.classList.contains("wall-switch") || !existing.querySelector(".switch-handle")) {
        var neu = buildWallSwitch();
        existing.parentNode.replaceChild(neu, existing);
        existing = neu;
      } else {
        existing.className = "site-theme-fab wall-switch";
        existing.setAttribute("data-theme-toggle", "true");
        if (existing.tagName === "BUTTON") existing.type = "button";
      }
    } else {
      document.body.appendChild(buildWallSwitch());
    }

    ensureLedStrips();

    // Profile icon — always last item in the header
    if (!document.querySelector(".arcade-nav .nav-profile, a.nav-profile")) {
      var profile = document.createElement("a");
      profile.href = "learningarcade/profile/";
      profile.className = "nav-link nav-profile";
      profile.setAttribute("aria-label", "My Profile");
      profile.title = "My Profile";
      profile.innerHTML =
        '<span class="nav-ico" aria-hidden="true">👤</span><span class="nav-text">Profile</span>';
      if (nav) nav.appendChild(profile);
      else {
        profile.className = "profile-fab profile-fab--header";
        profile.textContent = "👤";
        document.body.appendChild(profile);
      }
    } else if (nav) {
      var existingProfile = nav.querySelector(".nav-profile");
      if (existingProfile) nav.appendChild(existingProfile);
    }

    document.querySelectorAll("a.profile-fab").forEach(function (el) {
      if (!el.classList.contains("profile-fab--header")) el.style.display = "none";
    });

    applyTheme(root.getAttribute("data-theme") || getPreferred());
  }

  function bindToggles() {
    ensureThemeFab();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      if (btn.dataset.themeBound === "1") return;
      btn.dataset.themeBound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });
  }

  // Apply preferred theme ASAP (before paint if script is early)
  applyTheme(getPreferred());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggles);
  } else {
    bindToggles();
  }

  // Expose for debugging / other scripts
  window.MrSheyhakiTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    current: currentTheme,
  };
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

/* Re-parent floating nav to <body> so position:fixed is not broken by
   ancestor transform/filter. Layout (top/bottom) is pure CSS in style.css. */
(function () {
  function pinNavToBody() {
    var nav = document.querySelector(".arcade-nav");
    if (!nav) return;
    if (nav.parentElement !== document.body) {
      document.body.appendChild(nav);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pinNavToBody);
  } else {
    pinNavToBody();
  }
  window.addEventListener("load", pinNavToBody);
})();

