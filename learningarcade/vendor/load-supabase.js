/**
 * Load Supabase UMD with local file first, then CDN fallbacks.
 * Dispatches "supabase-ready" when done (success or failure).
 */
(function () {
  if (window.supabase && window.supabase.createClient) {
    document.dispatchEvent(new Event("supabase-ready"));
    return;
  }
  var urls = [
    "/learningarcade/vendor/supabase.min.js",
    "../vendor/supabase.min.js",
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js",
    "https://unpkg.com/@supabase/supabase-js@2.49.1/dist/umd/supabase.js",
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
  ];
  function done() {
    document.dispatchEvent(new Event("supabase-ready"));
  }
  function next(i) {
    if (i >= urls.length) {
      window.__supabaseLoadError = "Supabase SDK failed to load from all sources.";
      console.error(window.__supabaseLoadError);
      done();
      return;
    }
    var s = document.createElement("script");
    s.src = urls[i];
    s.onload = function () {
      if (window.supabase && window.supabase.createClient) done();
      else next(i + 1);
    };
    s.onerror = function () { next(i + 1); };
    document.head.appendChild(s);
  }
  next(0);
})();
