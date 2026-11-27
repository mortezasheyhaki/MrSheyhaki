/**
 * Learning Arcade — Assigned Games / Homework Helper
 * Public API: window.LAHomework
 *
 * Supports:
 * - Server-pinned assignments via GET /api/assignments
 * - Shareable URL payload via ?hw=... (base64url JSON or comma-separated game IDs)
 * - Completion calculation merged from LAStars (local) and LAProgress (cloud)
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "laPinnedHomework";
  var loadCatalogPromise = null;
  var fetchServerPromise = null;
  var stylesInjected = false;

  function loadScriptOnce(src) {
    return new Promise(function (resolve) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.dataset.loaded === "1") return resolve(true);
        existing.addEventListener("load", function () { resolve(true); });
        existing.addEventListener("error", function () { resolve(false); });
        setTimeout(function () { resolve(true); }, 600);
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { s.dataset.loaded = "1"; resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
  }

  function ensureCatalog() {
    if (global.LASkillCatalog && global.COURSE_DATA) {
      if (global.LASkillCatalog.rebuild) global.LASkillCatalog.rebuild();
      return Promise.resolve(global.LASkillCatalog);
    }
    if (!loadCatalogPromise) {
      var tasks = [];
      if (typeof global.COURSE_DATA === "undefined") {
        tasks.push(loadScriptOnce("/resources/american-english-file/assets/course-data.js"));
      }
      if (!global.LASkillCatalog) {
        tasks.push(loadScriptOnce("/learningarcade/skill-catalog.js"));
      }
      loadCatalogPromise = Promise.all(tasks).then(function () {
        if (global.LASkillCatalog && global.LASkillCatalog.rebuild) {
          global.LASkillCatalog.rebuild();
        }
        return global.LASkillCatalog || null;
      });
    }
    return loadCatalogPromise;
  }

  function toBase64Url(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function fromBase64Url(b64) {
    var norm = String(b64 || "").replace(/-/g, "+").replace(/_/g, "/");
    while (norm.length % 4) norm += "=";
    var bin = atob(norm);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function encodeShareParam(assignment) {
    if (!assignment || !Array.isArray(assignment.items) || !assignment.items.length) return "";
    var payload = {
      t: String(assignment.title || "This Week's Assigned Games").slice(0, 80),
      n: String(assignment.note || "").slice(0, 180),
      g: assignment.items.map(function (it) { return it.id; }).slice(0, 24),
      u: Number(assignment.updatedAt) || Date.now()
    };
    try {
      return toBase64Url(JSON.stringify(payload));
    } catch (e) {
      return payload.g.join(",");
    }
  }

  function decodeShareParam(raw) {
    var val = String(raw || "").trim();
    if (!val) return null;
    try {
      if (val.indexOf(",") !== -1 && !/^[A-Za-z0-9\-_]{24,}$/.test(val)) {
        var ids = val.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
        if (!ids.length) return null;
        return {
          source: "link",
          title: "This Week's Assigned Games",
          note: "",
          updatedAt: Date.now(),
          items: ids.slice(0, 24).map(function (id) { return { id: id }; })
        };
      }
      var parsed = JSON.parse(fromBase64Url(val));
      if (parsed && Array.isArray(parsed.g) && parsed.g.length) {
        return {
          source: "link",
          title: String(parsed.t || "This Week's Assigned Games").slice(0, 80),
          note: String(parsed.n || "").slice(0, 180),
          updatedAt: Number(parsed.u) || Date.now(),
          items: parsed.g.slice(0, 24).map(function (id) { return { id: String(id) }; })
        };
      }
    } catch (e) {}
    return null;
  }

  function resolveItems(rawItems) {
    var cat = global.LASkillCatalog;
    return (rawItems || []).map(function (it) {
      var id = typeof it === "string" ? it : (it && it.id);
      if (!id) return null;
      var meta = cat && cat.getMeta ? cat.getMeta(id) : null;
      return {
        id: id,
        title: (it && it.title) || (cat ? cat.getTitle(id) : id),
        category: (it && it.category) || (cat ? cat.inferCategory(id) : "General"),
        course: (it && it.course) || (meta && meta.course) || (cat && cat.getCourse ? cat.getCourse(id) : ""),
        url: (it && it.url) || (cat ? cat.getUrl(id) : null) || "/learningarcade/"
      };
    }).filter(Boolean);
  }

  function saveLocalAssignment(hw) {
    try {
      if (!hw || !Array.isArray(hw.items) || !hw.items.length) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(hw));
      }
    } catch (e) {}
  }

  function loadLocalAssignment() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (raw && Array.isArray(raw.items) && raw.items.length) return raw;
    } catch (e) {}
    return null;
  }

  function checkUrlParam() {
    try {
      var params = new URLSearchParams(global.location.search || "");
      var raw = params.get("hw");
      if (!raw) return null;
      var decoded = decodeShareParam(raw);
      if (decoded) {
        saveLocalAssignment(decoded);
        return decoded;
      }
    } catch (e) {}
    return null;
  }

  function fetchServerAssignment() {
    if (fetchServerPromise) return fetchServerPromise;
    fetchServerPromise = fetch("/api/assignments", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return (d && d.ok && d.assignment) ? d.assignment : null; })
      .catch(function () { return null; });
    return fetchServerPromise;
  }

  function loadActive() {
    var fromUrl = checkUrlParam();
    return Promise.all([ensureCatalog(), fetchServerAssignment()]).then(function (res) {
      var serverHw = res[1];
      var chosen = fromUrl || serverHw || loadLocalAssignment();
      if (!chosen || !Array.isArray(chosen.items) || !chosen.items.length) return null;
      if (serverHw && !fromUrl) {
        chosen = Object.assign({ source: "server" }, serverHw);
      }
      return {
        id: chosen.id || "hw",
        source: chosen.source || (fromUrl ? "link" : (serverHw ? "server" : "local")),
        title: chosen.title || "This Week's Assigned Games",
        note: chosen.note || "",
        updatedAt: chosen.updatedAt || 0,
        items: resolveItems(chosen.items)
      };
    });
  }

  function computeProgress(assignment, cloudRowsOrMap) {
    if (!assignment || !Array.isArray(assignment.items) || !assignment.items.length) {
      return { total: 0, done: 0, pct: 0, items: [] };
    }
    var cloudMap = {};
    if (Array.isArray(cloudRowsOrMap)) {
      cloudRowsOrMap.forEach(function (r) {
        var gid = r && (r.gameId || r.game_id);
        if (gid) cloudMap[gid] = r;
      });
    } else if (cloudRowsOrMap && typeof cloudRowsOrMap === "object") {
      cloudMap = cloudRowsOrMap;
    }

    var starsApi = global.LAStars;
    var doneCount = 0;
    var items = assignment.items.map(function (it) {
      var localStars = starsApi ? Number(starsApi.getStars(it.id) || 0) : 0;
      var localPlays = starsApi ? Number(starsApi.getPlays(it.id) || 0) : 0;
      var c = cloudMap[it.id];
      var stars = Math.max(localStars, c ? Number(c.stars || 0) : 0);
      var plays = Math.max(localPlays, c ? Number(c.plays || 0) : 0);
      var done = Boolean(stars > 0 || plays > 0 || (c && c.completed));
      if (done) doneCount += 1;
      return Object.assign({}, it, {
        stars: Math.max(0, Math.min(3, stars)),
        plays: plays,
        done: done
      });
    });

    var total = items.length;
    var pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    return { total: total, done: doneCount, pct: pct, items: items };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureStyles() {
    if (stylesInjected || document.getElementById("la-homework-css")) return;
    stylesInjected = true;
    var style = document.createElement("style");
    style.id = "la-homework-css";
    style.textContent =
      ".la-hw-card{position:relative;margin:16px 0;padding:18px 20px;border-radius:18px;background:var(--hm-surface,var(--pf-surface,var(--site-surface,#fff)));border:1px solid var(--hm-border-strong,var(--pf-border,var(--site-border,#dce3f2)));box-shadow:0 10px 26px rgba(15,23,42,.06);overflow:hidden;font-family:inherit;color:var(--hm-text,var(--pf-text,var(--site-text,#1e2436)))}" +
      ".la-hw-card::before{content:\"\";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#f59e0b,#6937d8,#0d9488)}" +
      "html[data-theme=\"dark\"] .la-hw-card{background:var(--hm-surface,var(--pf-surface,var(--site-surface,#141b2d)));border-color:var(--hm-border,var(--pf-border,rgba(255,255,255,.12)));color:var(--hm-text,var(--pf-text,#f1f5f9))}" +
      ".la-hw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:12px}" +
      ".la-hw-kicker{margin:0 0 2px;font-size:.74rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#d97706}" +
      "html[data-theme=\"dark\"] .la-hw-kicker{color:#fbbf24}" +
      ".la-hw-title{margin:0;font-family:\"Fredoka\",\"Plus Jakarta Sans\",sans-serif;font-size:1.18rem;font-weight:700;line-height:1.2}" +
      ".la-hw-note{margin:4px 0 0;font-size:.86rem;color:var(--hm-muted,var(--pf-muted,var(--site-muted,#64748b)))}" +
      ".la-hw-meter{min-width:170px;text-align:right}" +
      ".la-hw-meter-txt{font-size:.8rem;font-weight:800;font-variant-numeric:tabular-nums;margin-bottom:5px;display:block}" +
      ".la-hw-meter-txt.is-complete{color:#059669}" +
      "html[data-theme=\"dark\"] .la-hw-meter-txt.is-complete{color:#34d399}" +
      ".la-hw-track{height:7px;border-radius:999px;background:rgba(148,163,184,.2);overflow:hidden}" +
      ".la-hw-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#f59e0b,#10b981);transition:width .3s ease}" +
      ".la-hw-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}" +
      ".la-hw-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:12px;background:var(--hm-surface-2,var(--pf-surface-alt,var(--site-surface-alt,#f8fafc)));border:1px solid var(--hm-border,var(--pf-border,var(--site-border,#e2e8f0)));text-decoration:none;color:inherit;transition:transform .14s ease,border-color .14s ease}" +
      ".la-hw-item:hover{transform:translateY(-2px);border-color:#6937d8}" +
      ".la-hw-item.is-done{border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.07)}" +
      "html[data-theme=\"dark\"] .la-hw-item{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1)}" +
      "html[data-theme=\"dark\"] .la-hw-item.is-done{border-color:rgba(52,211,153,.4);background:rgba(16,185,129,.14)}" +
      ".la-hw-item-info{min-width:0;flex:1}" +
      ".la-hw-item-title{display:block;font-size:.88rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".la-hw-item-meta{display:block;font-size:.74rem;color:var(--hm-muted,var(--pf-muted,var(--site-muted,#64748b)));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".la-hw-item-cta{font-size:.76rem;font-weight:800;white-space:nowrap;padding:4px 9px;border-radius:999px;background:rgba(105,55,216,.12);color:#6937d8}" +
      ".la-hw-item.is-done .la-hw-item-cta{background:rgba(16,185,129,.16);color:#059669}" +
      "html[data-theme=\"dark\"] .la-hw-item-cta{background:rgba(167,139,250,.18);color:#c4b5fd}" +
      "html[data-theme=\"dark\"] .la-hw-item.is-done .la-hw-item-cta{background:rgba(52,211,153,.18);color:#34d399}" +
      ".la-hw-clear{border:0;background:transparent;color:var(--hm-muted,#64748b);font:inherit;font-size:.74rem;font-weight:700;cursor:pointer;text-decoration:underline;padding:0;margin-top:8px}" +
      "@media(max-width:600px){.la-hw-meter{width:100%;text-align:left}.la-hw-list{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }

  function renderInto(el, assignment, cloudRowsOrMap) {
    if (!el) return;
    if (!assignment || !assignment.items || !assignment.items.length) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    ensureStyles();
    var prog = computeProgress(assignment, cloudRowsOrMap);
    var allDone = prog.done === prog.total && prog.total > 0;

    var html =
      '<div class="la-hw-card">' +
        '<div class="la-hw-head">' +
          '<div>' +
            '<p class="la-hw-kicker">Assigned Homework</p>' +
            '<h2 class="la-hw-title">' + esc(assignment.title) + '</h2>' +
            (assignment.note ? '<p class="la-hw-note">' + esc(assignment.note) + '</p>' : '') +
          '</div>' +
          '<div class="la-hw-meter">' +
            '<span class="la-hw-meter-txt' + (allDone ? ' is-complete' : '') + '">' +
              (allDone ? ('✓ All ' + prog.total + ' completed!') : (prog.done + ' / ' + prog.total + ' completed')) +
            '</span>' +
            '<div class="la-hw-track" aria-hidden="true"><div class="la-hw-fill" style="width:' + prog.pct + '%"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="la-hw-list">' +
          prog.items.map(function (item) {
            var starsTxt = item.stars > 0 ? (" · " + "★".repeat(item.stars)) : "";
            var sub = [item.category, item.course].filter(Boolean).join(" · ") + starsTxt;
            var cta = item.done ? "✓ Done" : "Play →";
            return (
              '<a class="la-hw-item' + (item.done ? ' is-done' : '') + '" href="' + esc(item.url) + '">' +
                '<div class="la-hw-item-info">' +
                  '<span class="la-hw-item-title">' + esc(item.title) + '</span>' +
                  '<span class="la-hw-item-meta">' + esc(sub) + '</span>' +
                '</div>' +
                '<span class="la-hw-item-cta">' + cta + '</span>' +
              '</a>'
            );
          }).join("") +
        '</div>' +
        (assignment.source === "link" || assignment.source === "local"
          ? '<button type="button" class="la-hw-clear" data-hw-clear>Hide shared link</button>'
          : '') +
      '</div>';

    el.innerHTML = html;
    el.hidden = false;

    var clr = el.querySelector("[data-hw-clear]");
    if (clr) {
      clr.addEventListener("click", function () {
        saveLocalAssignment(null);
        el.hidden = true;
        el.innerHTML = "";
      });
    }
  }

  global.LAHomework = {
    encodeShareParam: encodeShareParam,
    decodeShareParam: decodeShareParam,
    loadActive: loadActive,
    computeProgress: computeProgress,
    renderInto: renderInto,
    ensureCatalog: ensureCatalog
  };
})(typeof window !== "undefined" ? window : this);
