/**
 * Learning Arcade — Quick Search & Skill Filter Widget
 * Public API: window.LADiscovery
 *
 * Mounts an instant search box + skill & status filter chips onto Arcade and
 * Resources hubs without disrupting the existing hub layout when idle.
 */
(function (global) {
  "use strict";

  var SKILLS = ["All", "Grammar", "Vocabulary", "Listening", "Pronunciation", "Reading", "Writing", "Speaking"];
  var STATUS_FILTERS = [
    { key: "all", label: "All games" },
    { key: "unplayed", label: "Unplayed" },
    { key: "needs3", label: "Needs 3★" }
  ];

  var CSS_ID = "la-discovery-css";
  var loadPromise = null;

  function loadScriptOnce(src) {
    return new Promise(function (resolve) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        setTimeout(function () { resolve(true); }, 50);
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
  }

  function ensureDeps() {
    if (!loadPromise) {
      var tasks = [];
      if (typeof global.COURSE_DATA === "undefined") {
        tasks.push(loadScriptOnce("/resources/american-english-file/assets/course-data.js"));
      }
      if (!global.LASkillCatalog) {
        tasks.push(loadScriptOnce("/learningarcade/skill-catalog.js"));
      }
      if (!global.LAStars) {
        tasks.push(loadScriptOnce("/learningarcade/la-stars.js"));
      }
      loadPromise = Promise.all(tasks).then(function () {
        if (global.LASkillCatalog && global.LASkillCatalog.rebuild) {
          global.LASkillCatalog.rebuild();
        }
        return true;
      });
    }
    return loadPromise;
  }

  function ensureStyles() {
    if (document.getElementById(CSS_ID)) return;
    var style = document.createElement("style");
    style.id = CSS_ID;
    style.textContent =
      ".la-disc{width:min(1180px,calc(100% - 32px));margin:0 auto 22px;font-family:\"Plus Jakarta Sans\",system-ui,-apple-system,sans-serif}" +
      ".la-disc-box{background:var(--site-surface,rgba(255,255,255,.92));border:1px solid var(--site-border,#dce3f2);border-radius:18px;padding:16px 18px;box-shadow:0 8px 24px rgba(15,23,42,.06);backdrop-filter:blur(12px)}" +
      "html[data-theme=\"dark\"] .la-disc-box,.la-disc--dark .la-disc-box{background:var(--site-surface,rgba(15,23,42,.85));border-color:var(--site-border,rgba(148,163,184,.22));color:#f1f5f9}" +
      ".la-disc-search-row{display:flex;align-items:center;gap:10px;position:relative}" +
      ".la-disc-input{width:100%;min-height:44px;padding:10px 38px 10px 38px;border-radius:12px;border:1px solid var(--site-border,#cbd5e1);background:var(--site-surface-alt,#f8fafc);color:var(--site-text,#0f172a);font:inherit;font-size:.94rem;font-weight:600;outline:none;transition:border-color .15s ease}" +
      ".la-disc-input:focus{border-color:#6937d8}" +
      "html[data-theme=\"dark\"] .la-disc-input,.la-disc--dark .la-disc-input{background:rgba(15,23,42,.92);border-color:rgba(148,163,184,.28);color:#f8fafc}" +
      ".la-disc-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:.65;font-size:.95rem}" +
      ".la-disc-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);border:0;background:rgba(148,163,184,.2);color:inherit;width:24px;height:24px;border-radius:999px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.82rem}" +
      ".la-disc-clear[hidden]{display:none}" +
      ".la-disc-filters{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:11px}" +
      ".la-disc-sep{width:1px;height:18px;background:var(--site-border,#cbd5e1);margin:0 2px}" +
      "html[data-theme=\"dark\"] .la-disc-sep,.la-disc--dark .la-disc-sep{background:rgba(148,163,184,.25)}" +
      ".la-disc-chip{border:1px solid var(--site-border,#cbd5e1);background:var(--site-surface-alt,#f1f5f9);color:var(--site-text,#334155);border-radius:999px;padding:6px 12px;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .14s ease;white-space:nowrap}" +
      ".la-disc-chip:hover{border-color:#6937d8;color:#6937d8}" +
      ".la-disc-chip.is-on{background:#6937d8;border-color:#6937d8;color:#fff}" +
      ".la-disc-chip--status.is-on{background:#0d9488;border-color:#0d9488;color:#fff}" +
      "html[data-theme=\"dark\"] .la-disc-chip,.la-disc--dark .la-disc-chip{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.15);color:#cbd5e1}" +
      "html[data-theme=\"dark\"] .la-disc-chip.is-on,.la-disc--dark .la-disc-chip.is-on{background:#7c5cff;border-color:#7c5cff;color:#fff}" +
      "html[data-theme=\"dark\"] .la-disc-chip--status.is-on,.la-disc--dark .la-disc-chip--status.is-on{background:#14b8a6;border-color:#14b8a6;color:#042f2e}" +
      ".la-disc-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;font-size:.78rem;font-weight:600;color:var(--site-muted,#64748b)}" +
      "html[data-theme=\"dark\"] .la-disc-meta,.la-disc--dark .la-disc-meta{color:#94a3b8}" +
      ".la-disc-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin-top:12px}" +
      ".la-disc-results[hidden]{display:none}" +
      ".la-disc-card{display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:12px 14px;border-radius:14px;background:var(--site-surface-alt,#f8fafc);border:1px solid var(--site-border,#e2e8f0);text-decoration:none;color:var(--site-text,#0f172a);transition:transform .14s ease,border-color .14s ease}" +
      ".la-disc-card:hover{transform:translateY(-2px);border-color:#6937d8}" +
      "html[data-theme=\"dark\"] .la-disc-card,.la-disc--dark .la-disc-card{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#f8fafc}" +
      ".la-disc-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
      ".la-disc-badge{display:inline-block;padding:3px 8px;border-radius:999px;font-size:.7rem;font-weight:800;letter-spacing:.02em;background:rgba(105,55,216,.12);color:#6937d8}" +
      "html[data-theme=\"dark\"] .la-disc-badge,.la-disc--dark .la-disc-badge{background:rgba(167,139,250,.18);color:#c4b5fd}" +
      ".la-disc-stars{font-size:.82rem;color:#f59e0b;letter-spacing:1px}" +
      ".la-disc-stars .off{opacity:.28;color:currentColor}" +
      ".la-disc-card-title{margin:0;font-size:.94rem;font-weight:800;line-height:1.25}" +
      ".la-disc-card-sub{font-size:.75rem;color:var(--site-muted,#64748b);font-weight:600}" +
      "html[data-theme=\"dark\"] .la-disc-card-sub,.la-disc--dark .la-disc-card-sub{color:#94a3b8}" +
      ".la-disc-card-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;font-size:.75rem;font-weight:700}" +
      ".la-disc-play{color:#6937d8;font-weight:800}" +
      "html[data-theme=\"dark\"] .la-disc-play,.la-disc--dark .la-disc-play{color:#a78bfa}" +
      ".la-disc-more{margin-top:12px;width:100%;padding:10px;border-radius:12px;border:1px dashed var(--site-border,#cbd5e1);background:transparent;color:inherit;font:inherit;font-size:.84rem;font-weight:700;cursor:pointer}" +
      ".la-disc-empty{grid-column:1/-1;text-align:center;padding:22px 12px;color:var(--site-muted,#64748b);font-size:.88rem;font-weight:600}" +
      "@media(max-width:640px){.la-disc{width:calc(100% - 20px)}.la-disc-box{padding:12px}.la-disc-results{grid-template-columns:1fr}.la-disc-sep{display:none}}";
    document.head.appendChild(style);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function starsHtml(n) {
    n = Math.max(0, Math.min(3, Number(n) || 0));
    var out = '<span class="la-disc-stars" aria-label="' + n + ' of 3 stars">';
    for (var i = 1; i <= 3; i++) {
      out += i <= n ? "★" : '<span class="off">☆</span>';
    }
    return out + "</span>";
  }

  function mount(targetEl, options) {
    if (!targetEl) return;
    ensureStyles();
    var opts = options || {};
    var state = {
      query: "",
      skill: "All",
      status: "all",
      limit: 24,
      games: [],
      cloudMap: {}
    };

    var darkClass = opts.forceDark ? " la-disc--dark" : "";
    targetEl.innerHTML =
      '<div class="la-disc' + darkClass + '">' +
        '<div class="la-disc-box">' +
          '<div class="la-disc-search-row">' +
            '<span class="la-disc-icon" aria-hidden="true">🔍</span>' +
            '<input type="search" class="la-disc-input" placeholder="Quick search games (e.g. simple past, clothes, unit 4, dictation)…" aria-label="Search games" />' +
            '<button type="button" class="la-disc-clear" aria-label="Clear search" hidden>×</button>' +
          '</div>' +
          '<div class="la-disc-filters" role="group" aria-label="Filter games">' +
            STATUS_FILTERS.map(function (st) {
              return '<button type="button" class="la-disc-chip la-disc-chip--status' + (st.key === "all" ? " is-on" : "") + '" data-status="' + st.key + '">' + esc(st.label) + '</button>';
            }).join("") +
            '<span class="la-disc-sep" aria-hidden="true"></span>' +
            SKILLS.map(function (sk) {
              return '<button type="button" class="la-disc-chip' + (sk === "All" ? " is-on" : "") + '" data-skill="' + esc(sk) + '">' + esc(sk) + '</button>';
            }).join("") +
          '</div>' +
          '<div class="la-disc-meta"><span data-disc-count>Loading game catalog…</span><span data-disc-hint>Type or tap a filter to browse</span></div>' +
          '<div class="la-disc-results" hidden></div>' +
          '<button type="button" class="la-disc-more" hidden>Show more games</button>' +
        '</div>' +
      '</div>';

    var input = targetEl.querySelector(".la-disc-input");
    var clearBtn = targetEl.querySelector(".la-disc-clear");
    var countEl = targetEl.querySelector("[data-disc-count]");
    var hintEl = targetEl.querySelector("[data-disc-hint]");
    var resultsEl = targetEl.querySelector(".la-disc-results");
    var moreBtn = targetEl.querySelector(".la-disc-more");

    function enrich(g) {
      var localStars = global.LAStars ? Number(global.LAStars.getStars(g.id) || 0) : 0;
      var localPlays = global.LAStars ? Number(global.LAStars.getPlays(g.id) || 0) : 0;
      var cloud = state.cloudMap[g.id];
      var stars = Math.max(localStars, cloud ? Number(cloud.stars || 0) : 0);
      var plays = Math.max(localPlays, cloud ? Number(cloud.plays || 0) : 0);
      return {
        id: g.id,
        title: g.title,
        label: g.label || "General",
        course: g.course || "",
        url: g.url,
        stars: Math.max(0, Math.min(3, stars)),
        plays: plays
      };
    }

    function render() {
      var q = state.query.trim().toLowerCase();
      var active = Boolean(q || state.skill !== "All" || state.status !== "all");
      clearBtn.hidden = !state.query;

      if (!state.games.length) {
        countEl.textContent = "Loading game catalog…";
        return;
      }

      if (!active) {
        resultsEl.hidden = true;
        moreBtn.hidden = true;
        countEl.textContent = state.games.length + " games indexed across Arcade & Coursebooks";
        hintEl.textContent = "Type or pick a filter to jump straight to any game";
        return;
      }

      var filtered = [];
      for (var i = 0; i < state.games.length; i++) {
        var g = enrich(state.games[i]);
        if (state.skill !== "All" && g.label !== state.skill) continue;
        if (state.status === "unplayed" && (g.plays > 0 || g.stars > 0)) continue;
        if (state.status === "needs3" && g.stars >= 3) continue;
        if (q) {
          var hay = (g.title + " " + g.label + " " + g.course + " " + g.id).toLowerCase();
          if (hay.indexOf(q) === -1) continue;
        }
        filtered.push(g);
      }

      countEl.textContent = filtered.length + " matching game" + (filtered.length === 1 ? "" : "s");
      hintEl.textContent = "Click any card to play";
      resultsEl.hidden = false;

      if (!filtered.length) {
        moreBtn.hidden = true;
        resultsEl.innerHTML = '<div class="la-disc-empty">No games match your search or filters. Try another keyword or clear a filter.</div>';
        return;
      }

      var slice = filtered.slice(0, state.limit);
      resultsEl.innerHTML = slice.map(function (g) {
        var playsTxt = g.plays > 0 ? (g.plays + " play" + (g.plays === 1 ? "" : "s")) : "Not played yet";
        return (
          '<a class="la-disc-card" href="' + esc(g.url) + '">' +
            '<div>' +
              '<div class="la-disc-card-top">' +
                '<span class="la-disc-badge">' + esc(g.label) + '</span>' +
                starsHtml(g.stars) +
              '</div>' +
              '<h3 class="la-disc-card-title" style="margin-top:8px;">' + esc(g.title) + '</h3>' +
              '<div class="la-disc-card-sub">' + esc(g.course) + '</div>' +
            '</div>' +
            '<div class="la-disc-card-foot">' +
              '<span class="la-disc-card-sub">' + esc(playsTxt) + '</span>' +
              '<span class="la-disc-play">Play →</span>' +
            '</div>' +
          '</a>'
        );
      }).join("");

      if (filtered.length > state.limit) {
        moreBtn.hidden = false;
        moreBtn.textContent = "Show more (" + (filtered.length - state.limit) + " remaining)";
      } else {
        moreBtn.hidden = true;
      }
    }

    input.addEventListener("input", function () {
      state.query = input.value || "";
      state.limit = 24;
      render();
    });

    clearBtn.addEventListener("click", function () {
      input.value = "";
      state.query = "";
      state.limit = 24;
      render();
      input.focus();
    });

    targetEl.querySelectorAll("[data-status]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.status = btn.getAttribute("data-status") || "all";
        state.limit = 24;
        targetEl.querySelectorAll("[data-status]").forEach(function (b) {
          b.classList.toggle("is-on", b === btn);
        });
        render();
      });
    });

    targetEl.querySelectorAll("[data-skill]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.skill = btn.getAttribute("data-skill") || "All";
        state.limit = 24;
        targetEl.querySelectorAll("[data-skill]").forEach(function (b) {
          b.classList.toggle("is-on", b === btn);
        });
        render();
      });
    });

    moreBtn.addEventListener("click", function () {
      state.limit += 24;
      render();
    });

    ensureDeps().then(function () {
      if (global.LASkillCatalog && global.LASkillCatalog.getAll) {
        state.games = global.LASkillCatalog.getAll().sort(function (a, b) {
          return a.title.localeCompare(b.title);
        });
      }
      render();

      if (global.LAAuth && global.LAAuth.verify) {
        global.LAAuth.verify().then(function (user) {
          if (!user) return;
          loadScriptOnce("/learningarcade/progress.js").then(function () {
            if (global.LAProgress && global.LAProgress.getMine) {
              global.LAProgress.getMine().then(function (rows) {
                (rows || []).forEach(function (r) {
                  if (r && r.game_id) state.cloudMap[r.game_id] = r;
                });
                render();
              }).catch(function () {});
            }
          });
        }).catch(function () {});
      }
    });
  }

  global.LADiscovery = { mount: mount };
})(typeof window !== "undefined" ? window : this);
