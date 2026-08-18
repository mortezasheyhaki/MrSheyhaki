document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("mobileMenuButton");
  const nav = document.getElementById("mainNav");

  if (button && nav) {
    button.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", event => {
      if (!nav.contains(event.target) && !button.contains(event.target)) {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();
});
