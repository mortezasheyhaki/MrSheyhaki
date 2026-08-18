document.addEventListener("DOMContentLoaded", () => {

  /* This page IS the game, so start it immediately instead of
     waiting for a reveal click (match-rush.js just defines the
     hook — it never auto-runs itself). */
  if (window.MatchRushEmbed) {
    window.MatchRushEmbed.init();
  }

  /* Arcade-y shortcut: Esc returns to the Vocabulary page. */
  const backBtn = document.querySelector(".arcade-back-btn");
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && backBtn) {
      window.location.href = backBtn.getAttribute("href");
    }
  });

});
