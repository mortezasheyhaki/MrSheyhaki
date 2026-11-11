/**
 * Resources — sign-in gate for game pages.
 *
 * Put this as a plain (not async/defer) script at the TOP of <head> on every
 * game page:
 *   <script src="/resources/auth-gate.js"></script>
 *
 * What it does
 *  - Hides the page immediately so the game never flashes before the check.
 *  - Loads the Appwrite SDK + the Learning Arcade account script (LAAuth) and
 *    asks the server whether the visitor is really signed in (LAAuth.verify).
 *  - Signed in  -> the page is revealed and plays normally.
 *  - Not signed in -> redirected to the login page, which returns the visitor
 *    to the game after they log in (?next=...). "Continue as Guest" on that
 *    page goes back to the Resources hub (?back=...).
 *  - If sign-in cannot be checked at all (e.g. the Appwrite CDN is blocked),
 *    the game stays hidden and a short message is shown (fails closed).
 *
 * Note: this is a client-side gate. It stops the game from being played in the
 * browser without an account, but the HTML files themselves are still public
 * on the web server.
 */
(function () {
  "use strict";

  var LOGIN_PAGE = "/learningarcade/auth-system/login.html";
  var HUB_PAGE = "/resources/";
  var AUTH_SCRIPT = "/learningarcade/auth-system/auth.js";
  var APPWRITE_SDK = "https://cdn.jsdelivr.net/npm/appwrite@26.2.0";

  var root = document.documentElement;
  root.classList.add("la-gate-pending");

  var style = document.createElement("style");
  style.id = "la-gate-style";
  style.textContent =
    "html.la-gate-pending body{visibility:hidden!important}" +
    "#la-gate-msg{position:fixed;inset:0;z-index:2147483647;visibility:visible;" +
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "gap:12px;padding:24px;text-align:center;background:#f6f5fa;color:#202636;" +
    "font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif}" +
    "#la-gate-msg h1{margin:0;font-size:1.5rem;font-weight:900}" +
    "#la-gate-msg p{margin:0;max-width:360px;font-weight:600;color:#687184}" +
    "#la-gate-msg a{display:inline-block;margin-top:6px;padding:12px 18px;border-radius:14px;" +
    "background:#6937d8;color:#fff;font-weight:800;text-decoration:none;box-shadow:0 4px 0 #5425b8}" +
    "html[data-theme=dark] #la-gate-msg{background:#161926;color:#f0f2f8}" +
    "html[data-theme=dark] #la-gate-msg p{color:#a0a6c0}";
  (document.head || root).appendChild(style);

  function whenBodyReady(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function reveal() {
    root.classList.remove("la-gate-pending");
  }

  function sendToLogin() {
    var here = window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(
      LOGIN_PAGE +
        "?next=" + encodeURIComponent(here) +
        "&back=" + encodeURIComponent(HUB_PAGE)
    );
  }

  function showUnavailable() {
    whenBodyReady(function () {
      var box = document.createElement("div");
      box.id = "la-gate-msg";
      box.innerHTML =
        "<h1>Sign in to play</h1>" +
        "<p>Sign-in is unavailable right now. Please check your connection and try again.</p>" +
        '<a href="' + HUB_PAGE + '">Back to Resources</a>';
      document.body.appendChild(box);
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not load " + src)); };
      (document.head || root).appendChild(s);
    });
  }

  var sdkReady = window.Appwrite
    ? Promise.resolve()
    : loadScript(APPWRITE_SDK);

  sdkReady
    .then(function () {
      if (!window.LAAuth) return loadScript(AUTH_SCRIPT);
    })
    .then(function () {
      if (!window.LAAuth || !window.LAAuth.verify) throw new Error("LAAuth missing");
      return window.LAAuth.verify();
    })
    .then(
      function (player) {
        if (player) reveal();
        else sendToLogin();
      },
      function () {
        showUnavailable();
      }
    );
})();
