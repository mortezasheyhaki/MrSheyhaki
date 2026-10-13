/* Tests & Exams – shared sound effects, gentle progress, calm feedback */
(function () {
  "use strict";
  var KEY = "tests-sound", on = true, ctx = null, lastKey = 0;
  try { on = localStorage.getItem(KEY) !== "off"; } catch (e) {}
  function ac() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, d, type, v, when) {
    if (!on) return; var c = ac(); if (!c) return;
    try {
      var t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.07, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  var S = {
    tap: function () { tone(740, 0.06, "sine", 0.05); tone(1110, 0.05, "sine", 0.025, 0.02); },
    pick: function () { tone(520, 0.07, "triangle", 0.06); tone(780, 0.09, "triangle", 0.05, 0.05); },
    key: function () { var n = Date.now(); if (n - lastKey < 70) return; lastKey = n; tone(1500 + Math.random() * 200, 0.018, "sine", 0.012); },
    good: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.18, "triangle", 0.07, i * 0.07); }); },
    soft: function () { tone(440, 0.16, "sine", 0.06); tone(392, 0.22, "sine", 0.05, 0.12); },
    done: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.07, i * 0.09); }); tone(392, 0.7, "sine", 0.04, 0.1); },
    nudge: function () { tone(660, 0.1, "sine", 0.05); tone(880, 0.12, "sine", 0.05, 0.08); }
  };
  window.TestsSound = S;

  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(function () {
    /* sound toggle */
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "tui-sound";
    function paint() { btn.textContent = on ? "🔊" : "🔇"; btn.setAttribute("aria-label", on ? "Sound on" : "Sound off"); btn.title = on ? "Sound on" : "Sound off"; }
    paint();
    btn.addEventListener("click", function (e) {
      e.stopPropagation(); on = !on; try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (x) {} paint(); if (on) S.nudge();
    });
    var header = document.querySelector(".header");
    if (header) header.appendChild(btn); else { btn.classList.add("is-floating"); document.body.appendChild(btn); }

    /* click sounds */
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("button, a.game-card, a.unit-card, a.back-btn, a.back, .btn") : null;
      if (!t || t === btn || t.disabled) return;
      if (t.closest(".opts")) S.pick(); else S.tap();
    }, true);
    document.addEventListener("input", function (e) { if (e.target && e.target.tagName === "INPUT") S.key(); });

    /* correct / wrong → one gentle sound per check */
    var main = document.querySelector("main") || document.body, mark = 0, tm = 0, resultTm = 0;
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        var el = m.target, cls = el.classList; if (!cls) return;
        if (cls.contains("correct")) mark |= 1;
        if (cls.contains("wrong")) mark |= 2;
        if (cls.contains("result") && cls.contains("show")) {
          clearTimeout(resultTm);
          resultTm = setTimeout(function () { (cls.contains("perfect") ? S.done : S.soft)(); }, 420);
        }
      });
      if (mark) { clearTimeout(tm); tm = setTimeout(function () { var g = mark; mark = 0; if (g & 2) S.soft(); else S.good(); }, 90); }
    }).observe(main, { attributes: true, attributeFilter: ["class"], subtree: true });

    /* gentle "answered" progress – never a score */
    var inputs = [].slice.call(main.querySelectorAll("input[type=text],input:not([type])"));
    var groups = [].slice.call(main.querySelectorAll(".opts"));
    var total = inputs.length || groups.length;
    var card = main.querySelector(".card, .email-card");
    if (total && card) {
      var bar = document.createElement("div"); bar.className = "tui-progress"; bar.innerHTML = "<i></i>";
      var lab = document.createElement("div"); lab.className = "tui-progress-label";
      card.parentNode.insertBefore(bar, card); card.parentNode.insertBefore(lab, card);
      var fill = bar.firstChild;
      var update = function () {
        var n = inputs.length ? inputs.filter(function (i) { return i.value.trim() !== ""; }).length : groups.filter(function (g) { return g.querySelector(".selected"); }).length;
        fill.style.width = Math.round(n / total * 100) + "%";
        lab.textContent = n === 0 ? "Take your time — " + total + " to complete" : n + " of " + total + " answered";
      };
      main.addEventListener("input", update); main.addEventListener("click", function () { setTimeout(update, 0); });
      update();
    }
  });
})();
