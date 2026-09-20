/**
 * Learning Arcade — Add Login button to main page / arcade pages
 * - Shows "Login" button when guest
 * - Shows username + Logout when logged in
 * - Works from both root (www.mrsheyhaki.ir) and learningarcade/
 *
 * Load AFTER auth.js
 */
(function () {
  "use strict";

  // Detect base path so links work from root or from /learningarcade/
  function getAuthBase() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    // If we are already inside learningarcade, use relative auth-system/
    if (/\/learningarcade(\/|$)/i.test(path)) {
      // If deeper than learningarcade root, still point to auth-system
      if (/\/learningarcade\/auth-system/i.test(path)) return "./";
      if (/\/learningarcade\/[^/]+/i.test(path) && !/\/learningarcade\/?$/i.test(path)) {
        return "../auth-system/";
      }
      return "auth-system/";
    }
    // From site root
    return "learningarcade/auth-system/";
  }

  function getProfileHref() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    if (/\/learningarcade(\/|$)/i.test(path)) {
      if (/\/learningarcade\/?$/i.test(path)) return "profile/";
      return "../profile/";
    }
    return "learningarcade/profile/";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyles() {
    if (document.getElementById("la-login-btn-styles")) return;
    var style = document.createElement("style");
    style.id = "la-login-btn-styles";
    style.textContent = [
      /* Floating login button (top-right) — matches arcade style */
      ".la-login-fab{",
      "  position:fixed;",
      "  top:max(14px, env(safe-area-inset-top, 0px));",
      "  right:max(12px, env(safe-area-inset-right, 0px));",
      "  z-index:10000;",
      "  display:flex;",
      "  align-items:center;",
      "  gap:8px;",
      "  pointer-events:auto;",
      "}",
      ".la-login-fab .la-login-btn{",
      "  border:1px solid rgba(255,255,255,0.18);",
      "  background:linear-gradient(180deg,#8b5cf6,#6937d8);",
      "  color:#fff;",
      "  font:inherit;font-weight:800;font-size:.88rem;",
      "  padding:10px 16px;border-radius:14px;",
      "  cursor:pointer;text-decoration:none;",
      "  box-shadow:0 8px 24px rgba(105,55,216,.35), 0 0 0 1px rgba(255,255,255,.04);",
      "  display:inline-flex;align-items:center;gap:6px;",
      "  transition:transform .2s ease, box-shadow .2s ease, background .2s ease;",
      "  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
      "}",
      ".la-login-fab .la-login-btn:hover{",
      "  transform:scale(1.05);",
      "  box-shadow:0 10px 28px rgba(105,55,216,.45);",
      "}",
      ".la-login-fab .la-login-btn:active{transform:scale(0.96)}",
      ".la-login-fab .la-user-chip{",
      "  background:rgba(8,10,20,.85);",
      "  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
      "  border:1px solid rgba(255,255,255,.18);",
      "  color:#f4f6fb;font-weight:800;font-size:.85rem;",
      "  padding:8px 12px;border-radius:14px;",
      "  display:inline-flex;align-items:center;gap:8px;max-width:180px;",
      "  box-shadow:0 8px 24px rgba(0,0,0,.28);",
      "  text-decoration:none;",
      "}",
      "html[data-theme=light] .la-login-fab .la-user-chip{",
      "  background:rgba(255,255,255,.92);",
      "  border-color:rgba(15,23,42,.1);",
      "  color:#1e1b4b;",
      "  box-shadow:0 8px 24px rgba(15,23,42,.12);",
      "}",
      ".la-login-fab .la-user-avatar{",
      "  width:26px;height:26px;border-radius:50%;background:#6937d8;color:#fff;",
      "  font-weight:900;font-size:.8rem;",
      "  display:flex;align-items:center;justify-content:center;flex-shrink:0;",
      "}",
      ".la-login-fab .la-user-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".la-login-fab .la-logout-btn{",
      "  border:1px solid rgba(255,255,255,.25);",
      "  background:rgba(8,10,20,.85);",
      "  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
      "  color:#e2e8f0;",
      "  font:inherit;font-weight:800;font-size:.78rem;",
      "  padding:8px 12px;border-radius:14px;cursor:pointer;",
      "  box-shadow:0 8px 24px rgba(0,0,0,.28);",
      "  transition:background .2s ease, transform .2s ease;",
      "}",
      ".la-login-fab .la-logout-btn:hover{background:rgba(105,55,216,.9);color:#fff}",
      "html[data-theme=light] .la-login-fab .la-logout-btn{",
      "  border-color:rgba(15,23,42,.12);",
      "  background:rgba(255,255,255,.92);",
      "  color:#334155;",
      "}",
      "html[data-theme=light] .la-login-fab .la-logout-btn:hover{",
      "  background:#6937d8;color:#fff;",
      "}",
      /* Hide old profile fab when auth UI is active (login button takes its place) */
      "body.la-has-auth a.profile-fab{display:none!important}",
      /* Mobile polish */
      "@media (max-width:700px){",
      "  .la-login-fab{top:max(10px, env(safe-area-inset-top, 0px));right:max(10px, env(safe-area-inset-right, 0px));}",
      "  .la-login-fab .la-login-btn{padding:9px 13px;font-size:.82rem;}",
      "  .la-login-fab .la-user-chip{max-width:130px;padding:7px 10px;}",
      "}",
    ].join("");
    document.head.appendChild(style);
  }

  function render() {
    injectStyles();
    document.body.classList.add("la-has-auth");

    // Remove old instance
    var old = document.getElementById("la-login-fab");
    if (old) old.remove();

    var authBase = getAuthBase();
    var loginHref = authBase + "login.html";
    var profileHref = getProfileHref();

    var user = window.LAAuth && LAAuth.currentUser ? LAAuth.currentUser() : null;
    var fab = document.createElement("div");
    fab.id = "la-login-fab";
    fab.className = "la-login-fab";

    if (user) {
      var name = user.displayName || user.username || "Player";
      var initial = name.charAt(0).toUpperCase();
      fab.innerHTML =
        '<a class="la-user-chip" href="' + profileHref + '" title="My Profile">' +
        '<span class="la-user-avatar">' + initial + "</span>" +
        '<span class="la-user-name">' + escapeHtml(name) + "</span>" +
        "</a>" +
        '<button type="button" class="la-logout-btn" id="la-logout-btn">Logout</button>';
    } else {
      fab.innerHTML =
        '<a class="la-login-btn" href="' + loginHref + '" title="Login or create account">' +
        "🔐 Login" +
        "</a>";
    }

    document.body.appendChild(fab);

    var logoutBtn = document.getElementById("la-logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = function () {
        if (window.LAAuth) LAAuth.logout();
        window.location.reload();
      };
    }

    // Update any existing Profile links
    var profileLinks = document.querySelectorAll('a.nav-profile, a.profile-fab, a[href*="profile"]');
    profileLinks.forEach(function (link) {
      if (user) {
        link.setAttribute("href", profileHref);
        link.setAttribute("title", "My Profile (" + (user.displayName || user.username) + ")");
      } else {
        // Guests go to login
        if (link.classList.contains("nav-profile") || link.classList.contains("profile-fab")) {
          link.setAttribute("href", loginHref);
          link.setAttribute("title", "Login / Register");
        }
      }
    });
  }

  function boot() {
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
