/* =========================================================
   Mobile swipe navigation (phone only)
   Order: Home → Learning Arcade → Resources → About
========================================================= */
(function () {
  "use strict";

  var MOBILE_MAX = 700;
  var MIN_DX = 70;      // min horizontal distance
  var MAX_DY = 60;      // reject if too vertical
  var MIN_RATIO = 1.4;  // |dx| must be > |dy| * ratio

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: " + MOBILE_MAX + "px)").matches;
  }

  function detectPage() {
    var path = (window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    // Normalize trailing slash
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    // Match deepest segments first
    if (/\/about$/.test(path) || path.endsWith("/about/index.html")) return "about";
    if (/\/resources$/.test(path) || path.endsWith("/resources/index.html")) return "resources";
    // learning arcade hub only (not nested skill pages)
    if (
      /\/learningarcade$/.test(path) ||
      path.endsWith("/learningarcade/index.html")
    ) {
      return "arcade";
    }
    // home: root index
    if (
      path === "" ||
      path === "/" ||
      /\/index\.html$/.test(path) && !/\/(learningarcade|resources|about|contact|worksheets)\//.test(path)
    ) {
      // avoid matching nested index as home when path contains those folders
      if (!/\/(learningarcade|resources|about|contact|worksheets)(\/|$)/.test(path)) {
        return "home";
      }
    }
    // fallback: check if we're at site root folder page
    var parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return "home";
    if (parts.length === 1 && (parts[0] === "index.html" || parts[0].indexOf(".") === -1)) {
      // single segment could be repo name on github pages
      return "home";
    }
    return null; // not a hub page — no swipe
  }

  function urlsFor(page) {
    // Relative URLs from each page location
    var map = {
      home: {
        self: "./",
        next: "learningarcade/",
        prev: "about/",
        base: ""
      },
      arcade: {
        self: "./",
        next: "../resources/",
        prev: "../",
        base: "learningarcade"
      },
      resources: {
        self: "./",
        next: "../about/",
        prev: "../learningarcade/",
        base: "resources"
      },
      about: {
        self: "./",
        next: "../",
        prev: "../resources/",
        base: "about"
      }
    };
    return map[page] || null;
  }

  var page = detectPage();
  if (!page) return;
  var links = urlsFor(page);
  if (!links) return;

  var startX = 0;
  var startY = 0;
  var tracking = false;
  var locked = false;

  function onStart(e) {
    if (!isMobile() || locked) return;
    if (e.touches && e.touches.length !== 1) return;
    var t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    tracking = true;
  }

  function onEnd(e) {
    if (!tracking || !isMobile() || locked) {
      tracking = false;
      return;
    }
    tracking = false;
    var t = (e.changedTouches && e.changedTouches[0]) || null;
    if (!t) return;

    var dx = t.clientX - startX;
    var dy = t.clientY - startY;
    var adx = Math.abs(dx);
    var ady = Math.abs(dy);

    if (adx < MIN_DX) return;
    if (ady > MAX_DY) return;
    if (adx < ady * MIN_RATIO) return;

    // Swipe left (finger moves left) → next page
    // Swipe right → previous page
    var target = dx < 0 ? links.next : links.prev;
    if (!target) return;

    locked = true;
    // Brief edge flash feedback
    try {
      document.documentElement.classList.add(dx < 0 ? "swipe-next" : "swipe-prev");
    } catch (err) {}
    window.setTimeout(function () {
      window.location.href = target;
    }, 120);
  }

  document.addEventListener("touchstart", onStart, { passive: true });
  document.addEventListener("touchend", onEnd, { passive: true });
})();
