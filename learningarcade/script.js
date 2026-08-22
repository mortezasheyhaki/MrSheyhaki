document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     CURRENT YEAR
  ========================================== */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================================
     MOBILE MENU TOGGLE
  ========================================== */

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
     CHARACTER IMAGE FALLBACK
     
     If an image is missing, hide it instead
     of showing a broken-image icon.
  ========================================== */

  const characterImages =
    document.querySelectorAll(".character-space img");

  characterImages.forEach((image) => {
    image.addEventListener("error", () => {
      image.style.display = "none";
    });
  });


  /* =========================================
     SKILL CARD INTERACTION
  ========================================== */

  const skillCards =
    document.querySelectorAll(".skill-card");

  skillCards.forEach((card) => {

    const button =
      card.querySelector(".skill-button");


    /* -------------------------------
       Mouse interaction
    -------------------------------- */

    card.addEventListener("mouseenter", () => {
      card.classList.add("is-hovered");
    });


    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-hovered");
    });


    /* -------------------------------
       Keyboard interaction
       
       If a card itself receives focus,
       pressing Enter activates its
       button.
    -------------------------------- */

    card.addEventListener("keydown", (event) => {

      if (
        event.key === "Enter" &&
        document.activeElement === card &&
        button
      ) {
        button.click();
      }

    });

  });


  /* =========================================
     REDUCED MOTION
     
     Respect users who have requested
     reduced animation.
  ========================================== */

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  if (prefersReducedMotion.matches) {

    document.documentElement.style.scrollBehavior =
      "auto";

  }


  /* =========================================
     DEBUG MESSAGE
     
     Useful while testing the site.
  ========================================== */

  console.log(
    "Learning Arcade loaded successfully."
  );

});

/* =========================================
   SMOOTH PAGE TRANSITIONS
========================================= */

(function initPageTransitions() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const DURATION = 280; // ms

  // Enter animation on load
  document.documentElement.classList.add("pt-ready");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add("pt-enter");
    });
  });

  function sameOrigin(href) {
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function shouldSkip(a) {
    if (!a || !a.href) return true;
    if (a.target === "_blank") return true;
    if (a.hasAttribute("download")) return true;
    if (a.getAttribute("href") === "#" || a.getAttribute("href") === "") return true;
    if (a.getAttribute("href").charAt(0) === "#") return true;
    if (a.hasAttribute("data-no-transition")) return true;
    if (!sameOrigin(a.href)) return true;
    // same page hash-only already handled
    const url = new URL(a.href, window.location.href);
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return true; // same page
    }
    return false;
  }

  function navigateWithTransition(href) {
    document.documentElement.classList.remove("pt-enter");
    document.documentElement.classList.add("pt-exit");

    // View Transitions API when available
    if (document.startViewTransition) {
      document.startViewTransition(function () {
        window.location.href = href;
      });
      // Fallback timeout in case navigation is slow
      setTimeout(function () {
        window.location.href = href;
      }, DURATION + 80);
      return;
    }

    setTimeout(function () {
      window.location.href = href;
    }, DURATION);
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || shouldSkip(a)) return;

      e.preventDefault();
      navigateWithTransition(a.href);
    },
    true
  );
})();
