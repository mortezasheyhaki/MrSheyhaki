/* Visit counter: one row per page view in the Appwrite "visits" table.
 * Load on every page with: <script src="/visit-counter.js" defer></script>
 * Silent on errors so it never affects the page.
 */
(function () {
  "use strict";
  var ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var PROJECT_ID = "6aafc5370019ebd5da7c";
  var DATABASE_ID = "6aafc5ce0007461d09d3";
  var TABLE_ID = "visits";
  var SDK = "https://cdn.jsdelivr.net/npm/appwrite@26.2.0";

  function loadSdk() {
    if (window.Appwrite) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SDK;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function isPhone() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "") ? "phone" : "desktop";
  }

  loadSdk().then(function () {
    var client = new Appwrite.Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    var TablesDB = Appwrite.TablesDB || Appwrite.Databases;
    var db = new TablesDB(client);
    return db.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: Appwrite.ID.unique(),
      data: {
        page: String(location.pathname || "/").slice(0, 250),
        referrer: String(document.referrer || "").slice(0, 250),
        device: isPhone(),
        visitedAt: new Date().toISOString()
      }
    });
  }).catch(function () { /* ignore: counting must never break a page */ });
})();
