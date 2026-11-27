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
  var LOCAL_SUPABASE_SDK = "/learningarcade/vendor/supabase.min.js";
  var CDN_SUPABASE_SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  var root = document.documentElement;
  try {
    var curTheme = root.getAttribute("data-theme");
    if (curTheme !== "dark" && curTheme !== "light") {
      var saved = localStorage.getItem("mrsheyhaki-theme");
      if (saved === "dark" || saved === "light") {
        curTheme = saved;
      } else {
        curTheme =
          window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      }
      root.setAttribute("data-theme", curTheme);
    }
  } catch (e) {}

  root.classList.add("la-gate-pending");

  var style = document.createElement("style");
  style.id = "la-gate-style";
  style.textContent =
    "html.la-gate-pending body > :not(#la-gate-loading):not(#la-gate-msg){visibility:hidden!important}" +
    "#la-gate-loading,#la-gate-msg{position:fixed;inset:0;z-index:2147483647;visibility:visible;" +
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "gap:12px;padding:24px;text-align:center;background:#f8fafc;color:#0f172a;" +
    "font-family:\"Plus Jakarta Sans\",Inter,system-ui,-apple-system,'Segoe UI',sans-serif}" +
    ".la-gate-card{width:min(360px,100%);padding:26px 22px;border-radius:20px;background:#ffffff;" +
    "border:1px solid rgba(15,23,42,.1);box-shadow:0 18px 42px rgba(15,23,42,.08);display:flex;flex-direction:column;align-items:center;gap:10px}" +
    ".la-gate-spinner{width:34px;height:34px;border-radius:50%;border:3px solid rgba(109,40,217,.16);border-top-color:#6d28d9;animation:laGateSpin .75s linear infinite}" +
    "@keyframes laGateSpin{to{transform:rotate(360deg)}}" +
    ".la-gate-title{margin:0;font-size:1.25rem;font-weight:800;letter-spacing:-0.01em}" +
    ".la-gate-sub{margin:0;max-width:320px;font-size:.9rem;font-weight:600;line-height:1.45;color:#475569}" +
    ".la-gate-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:6px}" +
    ".la-gate-btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:10px 18px;border-radius:12px;" +
    "background:#6d28d9;color:#ffffff;font:inherit;font-size:.9rem;font-weight:700;text-decoration:none;border:none;cursor:pointer;" +
    "box-shadow:0 6px 16px rgba(109,40,217,.26)}" +
    ".la-gate-btn:hover{background:#5b21b6}" +
    ".la-gate-btn--ghost{background:#f1f5f9;color:#0f172a;box-shadow:none;border:1px solid rgba(15,23,42,.12)}" +
    ".la-gate-btn--ghost:hover{background:#e2e8f0}" +
    "html[data-theme=dark] #la-gate-loading,html[data-theme=dark] #la-gate-msg{background:#0b1020;color:#f1f5f9}" +
    "html[data-theme=dark] .la-gate-card{background:#131b2e;border-color:rgba(241,245,249,.12);box-shadow:0 18px 42px rgba(0,0,0,.42)}" +
    "html[data-theme=dark] .la-gate-spinner{border-color:rgba(167,139,250,.22);border-top-color:#a78bfa}" +
    "html[data-theme=dark] .la-gate-sub{color:#94a3b8}" +
    "html[data-theme=dark] .la-gate-btn{background:#7c3aed}" +
    "html[data-theme=dark] .la-gate-btn--ghost{background:#1c2640;color:#f1f5f9;border-color:rgba(241,245,249,.14)}" +
    "@media (prefers-reduced-motion:reduce){.la-gate-spinner{animation:none}}";
  (document.head || root).appendChild(style);

  // Show a lightweight branded loader right away so students never stare at a blank flash
  var loaderEl = document.createElement("div");
  loaderEl.id = "la-gate-loading";
  loaderEl.setAttribute("role", "status");
  loaderEl.setAttribute("aria-live", "polite");
  loaderEl.innerHTML =
    '<div class="la-gate-card">' +
    '<div class="la-gate-spinner" aria-hidden="true"></div>' +
    '<p class="la-gate-title">Opening activity…</p>' +
    '<p class="la-gate-sub">Checking your student session</p>' +
    "</div>";
  root.appendChild(loaderEl);

  function removeLoader() {
    if (loaderEl && loaderEl.parentNode) {
      loaderEl.parentNode.removeChild(loaderEl);
    }
    var leftover = document.getElementById("la-gate-loading");
    if (leftover && leftover.parentNode) leftover.parentNode.removeChild(leftover);
  }

  function whenBodyReady(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function reveal() {
    removeLoader();
    root.classList.remove("la-gate-pending");
  }

  function resolveBackUrl(here) {
    var back = HUB_PAGE;
    if (here.indexOf("/american-english-file/") !== -1) {
      back = "/resources/american-english-file/";
    } else if (here.indexOf("/teen-2-teen/") !== -1) {
      back = "/resources/teen-2-teen/";
    } else if (here.indexOf("/tactics-for-listening/") !== -1) {
      back = "/resources/tactics-for-listening/";
    } else if (here.indexOf("/pre-starter/") !== -1) {
      back = "/resources/pre-starter/";
    }
    return back;
  }

  function sendToLogin() {
    var here = window.location.pathname + window.location.search + window.location.hash;
    var back = resolveBackUrl(here);
    window.location.replace(
      LOGIN_PAGE +
        "?next=" + encodeURIComponent(here) +
        "&back=" + encodeURIComponent(back)
    );
  }

  function showUnavailable() {
    removeLoader();
    var here = window.location.pathname + window.location.search + window.location.hash;
    var back = resolveBackUrl(here);
    whenBodyReady(function () {
      if (document.getElementById("la-gate-msg")) return;
      var box = document.createElement("div");
      box.id = "la-gate-msg";
      box.innerHTML =
        '<div class="la-gate-card">' +
        '<h1 class="la-gate-title">Sign in to play</h1>' +
        '<p class="la-gate-sub">We could not verify your session right now. Check your connection and try again.</p>' +
        '<div class="la-gate-actions">' +
        '<button type="button" class="la-gate-btn" id="laGateRetry">Try again</button>' +
        '<a class="la-gate-btn la-gate-btn--ghost" href="' + back + '">Back to Resources</a>' +
        "</div></div>";
      document.body.appendChild(box);
      var retryBtn = document.getElementById("laGateRetry");
      if (retryBtn) {
        retryBtn.addEventListener("click", function () {
          window.location.reload();
        });
      }
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

  function ensureSupabaseSdk() {
    if (window.supabase && window.supabase.createClient) {
      return Promise.resolve();
    }
    return loadScript(LOCAL_SUPABASE_SDK)
      .then(function () {
        if (window.supabase && window.supabase.createClient) return;
        throw new Error("Local Supabase missing client");
      })
      .catch(function () {
        return loadScript(CDN_SUPABASE_SDK);
      });
  }

  ensureSupabaseSdk()
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
        } else {
          sendToLogin();
        }
      },
      function () {
        showUnavailable();
      }
    );
})();
