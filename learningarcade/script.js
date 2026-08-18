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