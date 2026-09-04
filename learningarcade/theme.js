/* =========================================================
   MR. SHEYHAKI — GLOBAL THEME TOGGLE (JS)
   Persists light/dark across every page.
========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "mrsheyhaki-theme";

  /** Build a working href into the Learning Arcade folder (works on local servers too). */
  function resolveArcadeHref(subPath) {
    subPath = (subPath || "").replace(/^\/+/, "");
    var path = location.pathname || "";
    var lower = path.toLowerCase();
    var marker = "/learningarcade/";
    var idx = lower.lastIndexOf(marker);
    if (idx !== -1) {
      return path.slice(0, idx + marker.length) + subPath;
    }
    idx = lower.lastIndexOf("/learningarcade");
    if (idx !== -1) {
      return path.slice(0, idx) + "/learningarcade/" + subPath;
    }
    // Relative fallbacks by depth under arcade
    if (/\/profile\/?$/i.test(lower) || lower.indexOf("/profile/") !== -1) return "../" + subPath;
    if (lower.indexOf("/grammar/") !== -1) {
      // grammar/index or grammar/simple-present/ etc.
      var after = lower.split("/grammar/")[1] || "";
      var depth = after.split("/").filter(Boolean).length;
      // grammar/ -> ../profile ; grammar/x/ -> ../../profile ; grammar/x/y/ -> ../../../profile
      var prefix = depth <= 1 ? "../" : depth === 2 ? "../../" : "../../../";
      // If path ends with .html, depth counts the file as a segment
      if (/\.html?$/i.test(lower)) {
        prefix = depth <= 1 ? "../" : depth === 2 ? "../../" : "../../../";
      }
      return prefix + subPath;
    }
    if (lower.indexOf("/vocabulary/") !== -1 || lower.indexOf("/writing/") !== -1 || lower.indexOf("/speaking/") !== -1) {
      return "../" + subPath;
    }
    return subPath;
  }

  
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
    var nav = document.querySelector(".arcade-nav");

    // Fixed top-right theme toggle (always site-theme-fab — never inside nav)
    var existing = document.querySelector("[data-theme-toggle]");
    if (existing) {
      if (existing.closest(".arcade-nav") || existing.closest("header")) {
        document.body.appendChild(existing);
      }
      existing.className = "site-theme-fab theme-icon-only";
      existing.setAttribute("data-icon-only", "true");
      existing.setAttribute("data-theme-toggle", "true");
      if (existing.tagName === "BUTTON") existing.type = "button";
    } else {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "site-theme-fab theme-icon-only";
      btn.setAttribute("data-theme-toggle", "true");
      btn.setAttribute("data-icon-only", "true");
      btn.setAttribute("aria-label", "Toggle color theme");
      document.body.appendChild(btn);
    }

    // Profile icon — only inside arcade-nav (never floating on kids/world pages)
    var path = (location.pathname || "").toLowerCase();
    var isKidsWorld = path.indexOf("/kids/") !== -1 || path.indexOf("select-teacher") !== -1 || path.indexOf("starlight") !== -1;

    if (!isKidsWorld && !document.querySelector(".arcade-nav .nav-profile, a.nav-profile")) {
      var profile = document.createElement("a");
      profile.href = resolveArcadeHref("profile/");
      profile.className = "nav-link nav-profile";
      profile.setAttribute("aria-label", "My Profile");
      profile.title = "My Profile";
      profile.innerHTML = '<span class="nav-ico" aria-hidden="true">👤</span><span class="nav-text">Profile</span>';
      if (nav) nav.appendChild(profile);
      // Do NOT append a floating profile FAB when there is no nav
    } else if (nav && !isKidsWorld) {
      var existingProf = nav.querySelector(".nav-profile");
      if (existingProf) {
        // Fix broken absolute profile links
        try {
          var href = existingProf.getAttribute("href") || "";
          if (href.indexOf("/learningarcade/profile") === 0 || href === "/profile/" || href === "profile") {
            existingProf.setAttribute("href", resolveArcadeHref("profile/"));
          }
        } catch (e) {}
        nav.appendChild(existingProf);
      }
    }

    // Fix any existing profile links on the page (absolute → relative)
    document.querySelectorAll("a.nav-profile, a.profile-fab").forEach(function (el) {
      if (isKidsWorld) return;
      var href = el.getAttribute("href") || "";
      if (
        href === "/learningarcade/profile/" ||
        href === "/learningarcade/profile" ||
        href.indexOf("/learningarcade/profile/") === 0
      ) {
        el.setAttribute("href", resolveArcadeHref("profile/"));
      }
      // Ensure clickable
      el.style.pointerEvents = "auto";
      el.style.cursor = "pointer";
      el.removeAttribute("hidden");
      if (el.classList.contains("nav-profile") && el.closest(".arcade-nav")) {
        el.style.display = "";
      }
    });

    // Profile FABs: keep one usable control on arcade pages
    document.querySelectorAll("a.profile-fab, .profile-fab").forEach(function (el) {
      if (isKidsWorld) {
        el.style.display = "none";
        el.setAttribute("hidden", "true");
        return;
      }
      // Prefer nav profile; hide floating fab when nav already has profile
      if (nav && nav.querySelector(".nav-profile")) {
        el.style.display = "none";
        el.setAttribute("hidden", "true");
        return;
      }
      // No nav profile → show fab with correct href
      el.setAttribute("href", resolveArcadeHref("profile/"));
      el.style.display = "";
      el.style.pointerEvents = "auto";
      el.style.cursor = "pointer";
      el.removeAttribute("hidden");
    });

    // If still no profile control anywhere, inject a fixed one (game pages without arcade-nav)
    // Skip when page opts out: body.no-profile-fab / body.no-profile
    var noProfile = document.body.classList.contains("no-profile-fab") || document.body.classList.contains("no-profile");
    if (!isKidsWorld && !noProfile && !document.querySelector("a.nav-profile, a.profile-fab:not([hidden])")) {
      var fab = document.createElement("a");
      fab.href = resolveArcadeHref("profile/");
      fab.className = "profile-fab profile-fab--header";
      fab.setAttribute("aria-label", "My Profile");
      fab.title = "My Profile";
      fab.textContent = "👤";
      fab.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:10060;width:44px;height:44px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:rgba(30,41,59,0.9);color:#fff;text-decoration:none;font-size:1.2rem;box-shadow:0 4px 14px rgba(0,0,0,0.25);";
      document.body.appendChild(fab);
    }

    if (isKidsWorld || document.body.classList.contains("no-profile-fab") || document.body.classList.contains("no-profile")) {
      document.querySelectorAll("a.nav-profile, .nav-profile, a.profile-fab, .profile-fab").forEach(function (el) {
        el.style.display = "none";
        el.setAttribute("hidden", "true");
      });
    }

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
