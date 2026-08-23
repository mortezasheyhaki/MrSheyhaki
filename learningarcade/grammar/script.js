document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* =========================================
     GAME CARD STARS
     Reads localStorage key "laGameStars"
     (object: { "be-verbs": 2, "simple-present": 3, ... })
     and fills ☆ → ★ on each .game-stars[data-game]
  ========================================= */

  function loadGameStars() {
    let data = {};
    try {
      const raw = localStorage.getItem("laGameStars");
      if (raw) data = JSON.parse(raw) || {};
    } catch (e) {
      data = {};
    }
    return data;
  }

  function applyStars() {
    const data = loadGameStars();
    document.querySelectorAll(".game-stars[data-game]").forEach((el) => {
      const id = el.getAttribute("data-game");
      const n = Math.max(0, Math.min(3, Number(data[id] || 0)));
      el.querySelectorAll(".star").forEach((star) => {
        const need = Number(star.getAttribute("data-n") || 0);
        if (need <= n) {
          star.classList.add("is-filled");
          star.textContent = "★";
        } else {
          star.classList.remove("is-filled");
          star.textContent = "☆";
        }
      });
      el.setAttribute("aria-label", n + " of 3 stars");
    });
  }

  applyStars();

  // Re-apply when returning via bfcache
  window.addEventListener("pageshow", applyStars);
});
