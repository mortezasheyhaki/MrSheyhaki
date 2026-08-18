/* =========================================
   MR. SHEYHAKI — MAIN WEBSITE
   Homepage JavaScript (Optimized)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     CURRENT YEAR
  ====================================== */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* =====================================
     MOBILE MENU TOGGLE
  ====================================== */
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {

    const closeMenu = () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }


  /* =====================================
     HEADER SCROLL EFFECT
  ====================================== */
  const header = document.querySelector(".site-header");

  const handleScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();


  /* =====================================
     HERO CARD HOVER
  ====================================== */
  document.querySelectorAll(".hero-card").forEach((card) => {
    card.addEventListener("mouseenter", () => card.classList.add("hovered"));
    card.addEventListener("mouseleave", () => card.classList.remove("hovered"));
  });


  /* =====================================
     QUICK CARD KEYBOARD SUPPORT
  ====================================== */
  document.querySelectorAll(".quick-card").forEach((card) => {
    // Defensive: ensure focusability if ever changed from <a> to <div>
    if (card.tagName !== "A" && !card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }

    card.addEventListener("focus", () => card.classList.add("keyboard-focus"));
    card.addEventListener("blur", () => card.classList.remove("keyboard-focus"));
  });


  /* =====================================
     SMOOTH INTERNAL LINKS
  ====================================== */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });


  /* =====================================
     REDUCE ANIMATION FOR USERS WHO
     PREFER REDUCED MOTION
  ====================================== */
  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }

});
