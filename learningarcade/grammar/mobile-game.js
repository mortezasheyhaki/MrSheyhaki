/* Restore pages cleanly after mobile back/forward cache navigation. */
(function () {
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });
})();
