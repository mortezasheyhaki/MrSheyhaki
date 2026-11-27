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

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return getPreferred();
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      if (
        !btn.classList.contains("wall-switch") &&
        !btn.querySelector(".switch-handle") &&
        (btn.classList.contains("theme-toggle") ||
          btn.classList.contains("nav-theme-toggle") ||
          btn.getAttribute("data-icon-only") === "true" ||
          btn.classList.contains("icon-btn") ||
          btn.classList.contains("theme-icon-only"))
      ) {
        btn.textContent = theme === "dark" ? "☀️" : "🌙";
      }
    });
  }

  applyTheme(getPreferred());

  function buildNavThemeToggle() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle nav-theme-toggle";
    btn.setAttribute("data-theme-toggle", "true");
    btn.setAttribute("data-icon-only", "true");
    btn.setAttribute("aria-label", "Toggle color theme");
    btn.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
    btn.textContent = currentTheme() === "dark" ? "☀️" : "🌙";
    return btn;
  }

  function findHeaderNav() {
    return (
      document.querySelector(".arcade-nav") ||
      document.querySelector(".arcade-header-bar nav") ||
      document.querySelector("header.arcade-header-bar nav") ||
      document.querySelector("header nav.arcade-nav") ||
      document.querySelector("header .main-nav") ||
      document.querySelector("nav.arcade-nav")
    );
  }

  function ensureTopbarAssets() {
    if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Fredoka"]')) {
      var fl = document.createElement("link");
      fl.rel = "stylesheet";
      fl.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap";
      document.head.appendChild(fl);
    }
    var hasRootStyle = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(function (l) {
      try {
        return new URL(l.getAttribute("href") || "", location.href).pathname === "/style.css";
      } catch (e) {
        return false;
      }
    });
    if (!hasRootStyle && document.head) {
      var sl = document.createElement("link");
      sl.rel = "stylesheet";
      sl.href = "/style.css";
      document.head.appendChild(sl);
    }
  }

  function buildSharedTopbar() {
    var path = (window.location.pathname || "/").toLowerCase();
    var active = "arcade";
    if (path.indexOf("/multiplayer") !== -1) active = "multiplayer";
    else if (path.indexOf("/resources") !== -1) active = "resources";
    else if (path.indexOf("/about") !== -1 || path.indexOf("/contact") !== -1) active = "about";

    var links = [
      { key: "home", href: "/", label: "Home" },
      { key: "arcade", href: "/learningarcade/", label: "Arcade" },
      { key: "multiplayer", href: "/multiplayer/", label: "Multiplayer" },
      { key: "resources", href: "/resources/", label: "Resources" },
      { key: "about", href: "/about/", label: "About" },
    ];

    var navHtml = links
      .map(function (it) {
        var cur = it.key === active;
        return '<a href="' + it.href + '" class="topbar-link' + (cur ? " active" : "") + '"' + (cur ? ' aria-current="page"' : "") + ">" + it.label + "</a>";
      })
      .join("");

    var drawerHtml = links
      .map(function (it) {
        var cur = it.key === active;
        return '<a href="' + it.href + '" class="' + (cur ? "active" : "") + '"' + (cur ? ' aria-current="page"' : "") + ">" + it.label + "</a>";
      })
      .join("");

    var header = document.createElement("header");
    header.className = "site-topbar";
    header.innerHTML =
      '<div class="topbar-inner">' +
        '<a href="/" class="brand-mark">Mr. Sheyhaki</a>' +
        '<nav class="topbar-nav" aria-label="Main navigation">' + navHtml + "</nav>" +
        '<div class="topbar-actions">' +
          '<button type="button" class="mobile-nav-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNavDrawer">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
          "</button>" +
          '<a href="/learningarcade/profile/" class="topbar-cta" id="headerAccountCta">My Profile</a>' +
        "</div>" +
      "</div>" +
      '<nav class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile navigation">' + drawerHtml + "</nav>";
    return header;
  }

  function wireTopbarInteractions() {
    var btn = document.getElementById("mobileMenuBtn");
    var drawer = document.getElementById("mobileNavDrawer");
    if (btn && drawer && btn.dataset.menuBound !== "1") {
      btn.dataset.menuBound = "1";
      btn.addEventListener("click", function () {
        var open = drawer.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", function (ev) {
        if (!drawer.classList.contains("is-open")) return;
        if (btn.contains(ev.target) || drawer.contains(ev.target)) return;
        drawer.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      });
    }

    var cta = document.getElementById("headerAccountCta");
    if (cta) {
      try {
        var sess = null;
        if (window.LAAuth && typeof window.LAAuth.getSession === "function") {
          sess = window.LAAuth.getSession();
        } else {
          var raw = localStorage.getItem("laAuthSession");
          sess = raw ? JSON.parse(raw) : null;
        }
        if (sess && (sess.displayName || sess.username)) {
          cta.textContent = sess.displayName || sess.username;
          cta.href = "/learningarcade/profile/";
        } else {
          cta.textContent = "Sign in";
          cta.href = "/learningarcade/auth-system/login.html?next=" + encodeURIComponent((location.pathname || "/") + (location.search || ""));
        }
      } catch (e) {}
    }
  }

  function ensureFooterThemeControl() {
    var footer = document.querySelector("footer.site-footer");
    if (!footer) return;
    if (footer.querySelector("#themeToggle, [data-theme-toggle]")) return;
    var inner = footer.querySelector(".footer-inner");
    if (!inner) {
      var p = footer.querySelector("p");
      var copy = p ? p.innerHTML : '© <span id="year"></span> Mr. Sheyhaki · Learning Arcade';
      footer.innerHTML =
        '<div class="footer-inner">' +
          '<p class="footer-copy">' + copy + "</p>" +
          '<div class="footer-links">' +
            '<a class="footer-link" href="/contact/">Contact</a>' +
            '<a class="footer-link" href="https://www.instagram.com/mrsheyhaki.ir/" target="_blank" rel="noopener noreferrer">Instagram</a>' +
            '<button type="button" class="theme-switch-btn" id="themeToggle">Switch theme</button>' +
          "</div>" +
        "</div>";
    }
  }

  function ensureThemeFab() {
    document.querySelectorAll(".site-theme-fab, [data-theme-toggle].wall-switch, button.wall-switch").forEach(function (el) {
      el.remove();
    });

    ensureTopbarAssets();

    var legacyBar = document.querySelector("header.arcade-header-bar");
    var isProfileApp = document.body && document.body.classList.contains("profile-app");
    if (legacyBar && !isProfileApp && !document.querySelector("header.site-topbar")) {
      legacyBar.replaceWith(buildSharedTopbar());
    }

    if (document.querySelector("header.site-topbar")) {
      document.body.classList.add("has-site-topbar");
      document.querySelectorAll("a.profile-fab, .profile-fab").forEach(function (el) {
        el.remove();
      });
      wireTopbarInteractions();
      ensureFooterThemeControl();
      applyTheme(currentTheme());
      return;
    }

    var nav = findHeaderNav();
    if (!nav) {
      applyTheme(currentTheme());
      return;
    }

    var existing = nav.querySelector("[data-theme-toggle], .theme-toggle, .nav-theme-toggle");
    if (!existing) {
      var btn = buildNavThemeToggle();
      var profile = nav.querySelector(".nav-profile");
      if (profile) nav.insertBefore(btn, profile);
      else nav.appendChild(btn);
    }

    document.querySelectorAll("a.profile-fab, .profile-fab").forEach(function (el) {
      el.remove();
    });

    applyTheme(currentTheme());
  }

  function bindToggles() {
    ensureThemeFab();

    document.querySelectorAll("[data-theme-toggle], #themeToggle").forEach(function (btn) {
      if (btn.dataset.themeBound === "1") return;
      btn.dataset.themeBound = "1";
      btn.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        if (btn.id === "themeToggle" || btn.classList.contains("theme-switch-btn")) {
          btn.textContent = next === "dark" ? "Light mode" : "Dark mode";
        }
      });
      if (btn.id === "themeToggle" || btn.classList.contains("theme-switch-btn")) {
        btn.textContent = currentTheme() === "dark" ? "Light mode" : "Dark mode";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggles);
  } else {
    bindToggles();
  }

  document.addEventListener("supabase-ready", function () {
    if (window.LAAuth && typeof window.LAAuth.verify === "function") {
      window.LAAuth.verify().then(wireTopbarInteractions).catch(function () {});
    } else {
      wireTopbarInteractions();
    }
  });

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


/* =========================================================
   Profile shortcut on every page
   Uses a root-absolute URL so depth (games/resources/arcade)
   never breaks the link.
========================================================= */
(function () {
  var PROFILE_HREF = "/learningarcade/profile/";

  function ensureProfileLink() {
    try {
      // Topbar already owns the account/profile CTA
      if (document.querySelector("header.site-topbar")) {
        document.querySelectorAll("a.profile-fab-global, a.profile-fab").forEach(function (el) {
          el.remove();
        });
        return;
      }

      // Already has a working profile control in the main nav
      if (document.querySelector(".arcade-nav .nav-profile, a.profile-fab, a[href*='learningarcade/profile']")) {
        // Fix any relative profile links that point to the wrong folder
        document.querySelectorAll("a[href*='profile']").forEach(function (a) {
          var h = a.getAttribute("href") || "";
          if (/profile\/?$/i.test(h) || /\/profile\//i.test(h) || h.indexOf("profile") !== -1) {
            // Only rewrite if it looks like an internal profile nav link
            if (a.classList.contains("profile-fab") || a.classList.contains("nav-profile") ||
                (a.getAttribute("aria-label") || "").toLowerCase().indexOf("profile") !== -1) {
              a.setAttribute("href", PROFILE_HREF);
            }
          }
        });
        return;
      }

      // Inject floating profile button
      if (document.querySelector("a.profile-fab-global")) return;
      var a = document.createElement("a");
      a.href = PROFILE_HREF;
      a.className = "profile-fab profile-fab-global";
      a.setAttribute("aria-label", "My Profile");
      a.title = "My Profile";
      a.textContent = "👤";
      a.style.cssText = [
        "position:fixed",
        "top:max(12px, env(safe-area-inset-top))",
        "right:max(12px, env(safe-area-inset-right))",
        "z-index:9998",
        "width:44px",
        "height:44px",
        "border-radius:50%",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "font-size:1.25rem",
        "text-decoration:none",
        "background:rgba(105,55,216,.92)",
        "color:#fff",
        "box-shadow:0 4px 14px rgba(84,37,184,.35)",
        "backdrop-filter:blur(6px)"
      ].join(";");
      document.body.appendChild(a);
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureProfileLink);
  } else {
    ensureProfileLink();
  }
  window.addEventListener("load", ensureProfileLink);
})();
