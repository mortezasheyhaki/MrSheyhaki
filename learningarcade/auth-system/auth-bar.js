/**
 * Learning Arcade — Auth Status Bar
 * Shows "Logged in as ..." or "Login / Register" button
 * Requires: auth.js (LAAuth)
 */
(function () {
  "use strict";

  function createBar() {
    // Avoid duplicate
    if (document.getElementById("la-auth-bar")) return;

    var bar = document.createElement("div");
    bar.id = "la-auth-bar";
    bar.className = "la-auth-bar";

    var user = window.LAAuth && LAAuth.currentUser ? LAAuth.currentUser() : null;

    if (user) {
      bar.innerHTML =
        '<div class="la-auth-bar-inner">' +
        '<div class="la-auth-bar-left">' +
        '<span class="la-auth-bar-avatar">' + (user.displayName || user.username).charAt(0).toUpperCase() + "</span>" +
        '<div class="la-auth-bar-info">' +
        '<span class="la-auth-bar-label">Logged in as</span>' +
        '<strong class="la-auth-bar-name">' + escapeHtml(user.displayName || user.username) + "</strong>" +
        "</div></div>" +
        '<div class="la-auth-bar-right">' +
        '<a href="auth-system/login.html" class="la-auth-bar-link">Account</a>' +
        '<button type="button" class="la-auth-bar-btn" id="la-auth-logout">Logout</button>' +
        "</div></div>";
    } else {
      bar.innerHTML =
        '<div class="la-auth-bar-inner">' +
        '<div class="la-auth-bar-left">' +
        '<span class="la-auth-bar-guest">👤</span>' +
        '<span class="la-auth-bar-text">Playing as Guest</span>' +
        "</div>" +
        '<div class="la-auth-bar-right">' +
        '<a href="auth-system/login.html" class="la-auth-bar-btn primary">Login / Register</a>' +
        "</div></div>";
    }

    // Insert at top of body
    document.body.insertBefore(bar, document.body.firstChild);

    // Logout handler
    var logoutBtn = document.getElementById("la-auth-logout");
    if (logoutBtn) {
      logoutBtn.onclick = function () {
        if (window.LAAuth) LAAuth.logout();
        window.location.reload();
      };
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Inject styles
  function injectStyles() {
    if (document.getElementById("la-auth-bar-styles")) return;
    var style = document.createElement("style");
    style.id = "la-auth-bar-styles";
    style.textContent = [
      ".la-auth-bar{position:sticky;top:0;z-index:9000;background:linear-gradient(180deg,#f8f5ff,#f3edff);border-bottom:1.5px solid #e4d9ff;box-shadow:0 4px 12px rgba(84,37,184,.08)}",
      "html[data-theme=dark] .la-auth-bar{background:linear-gradient(180deg,#1a1d2b,#161926);border-bottom-color:#2e3348}",
      ".la-auth-bar-inner{max-width:960px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}",
      ".la-auth-bar-left{display:flex;align-items:center;gap:10px;min-width:0}",
      ".la-auth-bar-avatar{width:36px;height:36px;border-radius:12px;background:#6937d8;color:#fff;font-weight:900;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}",
      ".la-auth-bar-guest{font-size:1.3rem}",
      ".la-auth-bar-info{display:flex;flex-direction:column;min-width:0}",
      ".la-auth-bar-label{font-size:.65rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8b86b0}",
      "html[data-theme=dark] .la-auth-bar-label{color:#8b90a8}",
      ".la-auth-bar-name{font-size:.95rem;font-weight:800;color:#202636;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "html[data-theme=dark] .la-auth-bar-name{color:#f0f2f8}",
      ".la-auth-bar-text{font-weight:700;color:#5b527a;font-size:.9rem}",
      "html[data-theme=dark] .la-auth-bar-text{color:#a0a6c0}",
      ".la-auth-bar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}",
      ".la-auth-bar-link{font-weight:800;font-size:.82rem;color:#6937d8;text-decoration:none}",
      "html[data-theme=dark] .la-auth-bar-link{color:#a78bfa}",
      ".la-auth-bar-btn{border:2px solid #e8e0ff;background:#fff;color:#2c2450;font:inherit;font-weight:800;font-size:.82rem;padding:7px 12px;border-radius:12px;cursor:pointer;text-decoration:none;display:inline-block}",
      ".la-auth-bar-btn.primary{background:#6937d8;border-color:#6937d8;color:#fff;box-shadow:0 2px 0 #5425b8}",
      "html[data-theme=dark] .la-auth-bar-btn{background:#2a2e42;border-color:#3a3f55;color:#d0d4e4}",
      "html[data-theme=dark] .la-auth-bar-btn.primary{background:#7c4dff;border-color:#7c4dff;color:#fff}",
    ].join("");
    document.head.appendChild(style);
  }

  function boot() {
    injectStyles();
    createBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
