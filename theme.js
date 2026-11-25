/* =========================================================
   Mr. Sheyhaki — Shared Theme, Topbar Upgrade & Session CTA
   Works across /, /learningarcade/**, /multiplayer/**,
   /resources/**, /about/, and /contact/
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "mrsheyhaki-theme";
  var SESSION_KEY = "laAuthSession";
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

  function syncThemeControls(theme) {
    document.querySelectorAll("#themeToggle, [data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      if (btn.classList.contains("theme-switch-btn")) {
        btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      } else if (
        btn.classList.contains("theme-toggle") ||
        btn.classList.contains("nav-theme-toggle") ||
        btn.getAttribute("data-icon-only") === "true"
      ) {
        btn.textContent = theme === "dark" ? "☀️" : "🌙";
      } else if (btn.id === "themeToggle") {
        btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      }
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (document.body && document.body.classList.contains("quiz-page")) {
      document.body.classList.toggle("light-mode", theme === "light");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    syncThemeControls(theme);
  }

  applyTheme(getPreferred());

  function ensureSharedAssets() {
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

  function activeSectionForPath() {
    var p = (window.location.pathname || "/").toLowerCase();
    if (p.indexOf("/multiplayer") !== -1) return "multiplayer";
    if (p.indexOf("/learningarcade") !== -1) return "arcade";
    if (p.indexOf("/resources") !== -1) return "resources";
    if (p.indexOf("/about") !== -1 || p.indexOf("/contact") !== -1) return "about";
    return "home";
  }

  function readSession() {
    try {
      if (window.LAAuth && typeof window.LAAuth.getSession === "function") {
        return window.LAAuth.getSession();
      }
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function buildTopbarElement() {
    var active = activeSectionForPath();
    var header = document.createElement("header");
    header.className = "site-topbar";

    var navLinks = [
      { key: "home", href: "/", label: "Home" },
      { key: "arcade", href: "/learningarcade/", label: "Arcade" },
      { key: "multiplayer", href: "/multiplayer/", label: "Multiplayer" },
      { key: "resources", href: "/resources/", label: "Resources" },
      { key: "about", href: "/about/", label: "About" },
    ];

    var navHtml = navLinks
      .map(function (item) {
        var isCurrent = item.key === active;
        return (
          '<a href="' +
          item.href +
          '" class="topbar-link' +
          (isCurrent ? " active" : "") +
          '"' +
          (isCurrent ? ' aria-current="page"' : "") +
          ">" +
          item.label +
          "</a>"
        );
      })
      .join("");

    var drawerHtml = navLinks
      .map(function (item) {
        var isCurrent = item.key === active;
        return (
          '<a href="' +
          item.href +
          '" class="' +
          (isCurrent ? "active" : "") +
          '"' +
          (isCurrent ? ' aria-current="page"' : "") +
          ">" +
          item.label +
          "</a>"
        );
      })
      .join("");

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

  function upgradeLegacyHeader() {
    var legacy = document.querySelector("header.arcade-header-bar");
    var existingTopbar = document.querySelector("header.site-topbar");

    if (legacy && !existingTopbar) {
      var topbar = buildTopbarElement();
      legacy.replaceWith(topbar);
      existingTopbar = topbar;
    }

    if (existingTopbar) {
      document.body.classList.add("has-site-topbar");
    }

    document.querySelectorAll(".site-theme-fab, a.profile-fab, .profile-fab").forEach(function (el) {
      el.remove();
    });
  }

  function wireMobileMenu() {
    var btn = document.getElementById("mobileMenuBtn");
    var drawer = document.getElementById("mobileNavDrawer");
    if (!btn || !drawer || btn.dataset.menuBound === "1") return;
    btn.dataset.menuBound = "1";

    btn.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (ev) {
      if (!drawer.classList.contains("is-open")) return;
      if (btn.contains(ev.target) || drawer.contains(ev.target)) return;
      drawer.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function syncAccountCta() {
    var cta = document.getElementById("headerAccountCta");
    if (!cta) return;
    var user = readSession();
    if (user && (user.displayName || user.username)) {
      cta.textContent = user.displayName || user.username;
      cta.href = "/learningarcade/profile/";
    } else {
      cta.textContent = "Sign in";
      var cur = (window.location.pathname || "/") + (window.location.search || "");
      cta.href = "/learningarcade/auth-system/login.html?redirect=" + encodeURIComponent(cur);
    }
  }

  function ensureFooterThemeButton() {
    var footer = document.querySelector("footer.site-footer");
    if (!footer) return;
    if (footer.querySelector("#themeToggle, [data-theme-toggle]")) return;

    var inner = footer.querySelector(".footer-inner");
    if (!inner) {
      var existingP = footer.querySelector("p");
      var copyText = existingP ? existingP.innerHTML : '© <span id="year"></span> Mr. Sheyhaki · English Teacher';
      footer.innerHTML =
        '<div class="footer-inner">' +
          '<p class="footer-copy">' + copyText + "</p>" +
          '<div class="footer-links">' +
            '<a class="footer-link" href="/contact/">Contact</a>' +
            '<a class="footer-link" href="https://www.instagram.com/mrsheyhaki.ir/" target="_blank" rel="noopener noreferrer">Instagram</a>' +
            '<button type="button" class="theme-switch-btn" id="themeToggle">Switch theme</button>' +
          "</div>" +
        "</div>";
      return;
    }

    var linksWrap = inner.querySelector(".footer-links");
    if (!linksWrap) {
      linksWrap = document.createElement("div");
      linksWrap.className = "footer-links";
      inner.appendChild(linksWrap);
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-switch-btn";
    btn.id = "themeToggle";
    linksWrap.appendChild(btn);
  }

  function bindThemeButtons() {
    document.querySelectorAll("#themeToggle, [data-theme-toggle]").forEach(function (btn) {
      if (btn.dataset.themeBound === "1") return;
      btn.dataset.themeBound = "1";
      btn.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
      });
    });
    syncThemeControls(currentTheme());
  }

  function boot() {
    ensureSharedAssets();
    upgradeLegacyHeader();
    wireMobileMenu();
    ensureFooterThemeButton();
    bindThemeButtons();
    syncAccountCta();

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("supabase-ready", function () {
    if (window.LAAuth && typeof window.LAAuth.verify === "function") {
      window.LAAuth.verify().then(syncAccountCta).catch(function () {});
    } else {
      syncAccountCta();
    }
  });
})();
