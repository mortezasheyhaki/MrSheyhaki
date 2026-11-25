/* =========================================================
   Mr. Sheyhaki — Resources Audio & Page Helpers
   ========================================================= */
(function () {
  "use strict";

  var activeAudio = null;
  var activeButton = null;

  function resetButton(btn) {
    if (!btn) return;
    btn.textContent = "▶ Play";
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-pressed", "false");
  }

  window.toggleAudio = function (audioId, playBtn) {
    var audio = document.getElementById(audioId);
    if (!audio) return;

    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
      resetButton(activeButton);
    }

    if (audio.paused) {
      activeAudio = audio;
      activeButton = playBtn;
      if (playBtn) {
        playBtn.textContent = "⏸ Pause";
        playBtn.classList.add("is-playing");
        playBtn.setAttribute("aria-pressed", "true");
      }

      if (!audio.dataset.boundEvents) {
        audio.dataset.boundEvents = "1";
        audio.addEventListener("ended", function () {
          resetButton(playBtn);
          if (activeAudio === audio) {
            activeAudio = null;
            activeButton = null;
          }
        });
        audio.addEventListener("error", function () {
          if (playBtn) {
            playBtn.textContent = "Unavailable";
            playBtn.classList.remove("is-playing");
            setTimeout(function () { resetButton(playBtn); }, 2000);
          }
        });
      }

      var p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {
          resetButton(playBtn);
        });
      }
    } else {
      audio.pause();
      resetButton(playBtn);
      if (activeAudio === audio) {
        activeAudio = null;
        activeButton = null;
      }
    }
  };
})();
