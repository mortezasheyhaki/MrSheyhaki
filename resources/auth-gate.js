/**
 * Learning Arcade — login gate for resources games & tests
 * Include as the FIRST script in <head>:
 *   <script src="/resources/auth-gate.js"></script>
 */
(function () {
  "use strict";

  var LOGIN_PAGE = "/learningarcade/auth-system/login.html";
  var HUB_PAGE = "/resources/";
  var AUTH_SCRIPT = "/learningarcade/auth-system/auth.js";
  var SUPABASE_SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

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
    var back = HUB_PAGE;
    if (here.indexOf("/tests/") !== -1) {
      back = "/resources/american-english-file/tests/";
    }
    window.location.replace(
      LOGIN_PAGE +
        "?next=" + encodeURIComponent(here) +
        "&back=" + encodeURIComponent(back)
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

  var sdkReady = (window.supabase && window.supabase.createClient)
    ? Promise.resolve()
    : loadScript(SUPABASE_SDK);

  sdkReady
    .then(function () {
      if (!window.LAAuth) return loadScript(AUTH_SCRIPT);
    })
    .then(function () {
      if (!window.LAAuth || typeof window.LAAuth.verify !== "function") {
        throw new Error("LAAuth missing");
      }
      return window.LAAuth.verify();
    })
    .then(
      function (player) {
        if (player) {
          // Preload cloud progress so AEF / T2T games can save without racing
          loadScript("/learningarcade/progress.js").catch(function () {});
          reveal();
        } else sendToLogin();
      },
      function () {
        showUnavailable();
      }
    );
})();
