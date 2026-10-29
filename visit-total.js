/* Shows the total number of visits on the page with id="visit-total".
 * Calls the Appwrite Function "visit-total"; the visits table stays private.
 */
(function () {
  "use strict";
  var ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var PROJECT_ID = "6aafc5370019ebd5da7c";
  var FUNCTION_ID = "6ae329620012092ee097";
  var SDK = "https://cdn.jsdelivr.net/npm/appwrite@26.2.0";

  function loadSdk() {
    if (window.Appwrite) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SDK; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function show(text) {
    var el = document.getElementById("visit-total");
    if (el) el.textContent = text;
  }

  loadSdk().then(function () {
    var client = new Appwrite.Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    var functions = new Appwrite.Functions(client);
    return functions.createExecution({ functionId: FUNCTION_ID, async: false });
  }).then(function (exec) {
    var data = JSON.parse(exec.responseBody || "{}");
    if (typeof data.total === "number") {
      show(data.total.toLocaleString());
    } else {
      console.error("[visit-total] unexpected reply:", exec.responseBody);
      show("unavailable");
    }
  }).catch(function (err) {
    console.error("[visit-total] could not load the count:", err);
    show("unavailable");
  });
})();
