// Shared renderer for Unit Practice Hub pages (/tests/unit-1/ and /tests/starter/unit-N/)
(function (global) {
  "use strict";

  var SKILL_CLASS = {
    grammar: "k-grammar",
    vocabulary: "k-vocab",
    vocab: "k-vocab",
    sounds: "k-sounds",
    pronunciation: "k-sounds",
    reading: "k-reading",
    writing: "k-writing",
    listening: "k-listening",
    speaking: "k-speaking",
    dialogue: "k-speaking",
    dialogues: "k-speaking",
    "practical english": "k-speaking",
    "practical-english": "k-speaking"
  };

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function skillClass(skillKey) {
    var k = String(skillKey || "grammar").toLowerCase();
    return SKILL_CLASS[k] || "k-grammar";
  }

  function renderUnitHub(config) {
    if (!config || !Array.isArray(config.activities)) return;

    var grid = document.getElementById("activitiesGrid");
    var tabsWrap = document.getElementById("skillTabs");
    var countEl = document.getElementById("visibleActivitiesCount");
    var playedEl = document.getElementById("unitPlayedCount");
    var avgEl = document.getElementById("unitAvgScore");
    var ptsEl = document.getElementById("unitPointsSummary");
    var heroFill = document.getElementById("unitHeroFill");
    var heroPct = document.getElementById("unitHeroPct");
    var yearEl = document.getElementById("year");

    if (yearEl) yearEl.textContent = new Date().getFullYear();
    if (!grid) return;

    var activities = config.activities;
    var allIds = activities.map(function (a) { return a.id; });
    var currentFilter = "all";

    // Build skill tabs dynamically from activities
    if (tabsWrap) {
      var counts = {};
      var labels = {};
      var order = [];
      activities.forEach(function (a) {
        var key = String(a.filterKey || a.skill || "other").toLowerCase();
        if (!counts[key]) {
          counts[key] = 0;
          labels[key] = a.filterLabel || a.skill || "Practice";
          order.push(key);
        }
        counts[key]++;
      });

      var tabsHtml =
        '<button type="button" class="tests-filter-tab is-active" data-filter="all" role="tab" aria-selected="true">All (' +
        activities.length +
        ")</button>";

      if (order.length > 1) {
        order.forEach(function (key) {
          tabsHtml +=
            '<button type="button" class="tests-filter-tab" data-filter="' +
            esc(key) +
            '" role="tab" aria-selected="false">' +
            esc(labels[key]) +
            " (" +
            counts[key] +
            ")</button>";
        });
      }
      tabsWrap.innerHTML = tabsHtml;

      tabsWrap.querySelectorAll(".tests-filter-tab").forEach(function (btn) {
        btn.addEventListener("click", function () {
          currentFilter = btn.getAttribute("data-filter") || "all";
          tabsWrap.querySelectorAll(".tests-filter-tab").forEach(function (b) {
            var active = b === btn;
            b.classList.toggle("is-active", active);
            b.setAttribute("aria-selected", active ? "true" : "false");
          });
          paintGrid();
        });
      });
    }

    function updateSummary() {
      if (!global.TestScores) return;
      var sum = global.TestScores.getSummary(allIds);

      if (playedEl) {
        playedEl.textContent = sum.played + " / " + sum.total;
      }
      if (avgEl) {
        avgEl.textContent = sum.avgPct != null ? sum.avgPct + "%" : "—";
      }
      if (ptsEl) {
        ptsEl.textContent = sum.maxPts > 0 ? sum.earnedPts + " / " + sum.maxPts + " pts" : "0 pts";
      }
      if (heroFill) {
        heroFill.style.width = sum.unitPct + "%";
      }
      if (heroPct) {
        heroPct.textContent = sum.unitPct + "% mastery";
      }
    }

    function paintGrid() {
      var list = activities.filter(function (item) {
        if (currentFilter === "all") return true;
        return String(item.filterKey || item.skill || "").toLowerCase() === currentFilter;
      });

      grid.innerHTML = list
        .map(function (item) {
          var num = String(item.index || 1).padStart(2, "0");
          var rec = global.TestScores ? global.TestScores.get(item.id) : null;
          var cta = rec ? "Play again →" : "Start →";
          var metaText = Array.isArray(item.meta) ? item.meta.join(" · ") : (item.meta || "");

          return (
            '<a class="act-card ' +
            skillClass(item.skillKey || item.skill) +
            '" href="' +
            esc(item.href) +
            '">' +
              '<div class="act-head">' +
                '<div class="act-id">' +
                  '<span class="act-num">' + esc(num) + "</span>" +
                  '<span class="act-skill">' + esc(item.skill) + "</span>" +
                "</div>" +
                '<span class="act-score" data-score="' + esc(item.id) + '">Not played</span>' +
              "</div>" +
              '<div class="act-body">' +
                "<h3>" + esc(item.title) + "</h3>" +
                "<p>" + esc(item.desc) + "</p>" +
                (metaText ? '<div class="act-meta">' + esc(metaText) + "</div>" : "") +
              "</div>" +
              '<div class="act-bottom">' +
                '<div class="act-meter" aria-hidden="true">' +
                  '<span class="act-meter-fill" data-score-bar="' + esc(item.id) + '"></span>' +
                "</div>" +
                '<div class="act-foot">' +
                  '<span class="act-status" data-score-meta="' + esc(item.id) + '">Ready to start</span>' +
                  '<span class="act-cta">' + cta + "</span>" +
                "</div>" +
              "</div>" +
            "</a>"
          );
        })
        .join("");

      if (countEl) {
        countEl.textContent = list.length + (list.length === 1 ? " activity" : " activities");
      }

      if (global.TestScores) {
        global.TestScores.paint(grid);
      }
      updateSummary();
    }

    function refreshAll() {
      paintGrid();
    }

    refreshAll();
    global.addEventListener("pageshow", refreshAll);
    global.addEventListener("focus", refreshAll);
    global.addEventListener("storage", function (e) {
      if (!e.key || e.key === "aef-test-scores" || e.key === "aef-starter-test-stars") {
        refreshAll();
      }
    });
  }

  global.TestsUnitHub = {
    render: renderUnitHub
  };
})(window);
