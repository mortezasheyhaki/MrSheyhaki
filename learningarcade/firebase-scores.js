/**
 * Learning Arcade — Appwrite scoreboard helper
 * Uses Appwrite TablesDB (Frankfurt). Public API: global.LAScores
 *
 * Load BEFORE this file:
 *   <script src="https://cdn.jsdelivr.net/npm/appwrite@26.2.0"></script>
 */
(function (global) {
  'use strict';

  var ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
  var PROJECT_ID = '6a95e7a70024d9b0d634';
  var DATABASE_ID = '6a95eae8000d3381dfb9';
  var TABLE_ID = 'scores';

  var NAME_KEY = 'laPlayerName';
  var ready = false;
  var initError = null;
  var tablesDB = null;
  var ID = null;
  var Query = null;

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (typeof Appwrite === 'undefined') {
      initError = 'Appwrite SDK not loaded — use appwrite@26.2.0 CDN';
      console.warn('[LAScores]', initError);
      return false;
    }
    try {
      var Client = Appwrite.Client;
      var TablesDBCtor = Appwrite.TablesDB || Appwrite.Databases;
      if (!Client || !TablesDBCtor) {
        initError = 'Appwrite.TablesDB missing. Keys: ' + Object.keys(Appwrite).join(', ');
        console.warn('[LAScores]', initError);
        return false;
      }
      ID = Appwrite.ID;
      Query = Appwrite.Query;

      var client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID);

      tablesDB = new TablesDBCtor(client);

      // Fallback if old Databases API only
      if (typeof tablesDB.createRow !== 'function' && typeof tablesDB.createDocument === 'function') {
        tablesDB.createRow = function (opts) {
          return tablesDB.createDocument(
            opts.databaseId,
            opts.tableId,
            opts.rowId,
            opts.data
          );
        };
      }
      if (typeof tablesDB.listRows !== 'function' && typeof tablesDB.listDocuments === 'function') {
        tablesDB.listRows = function (opts) {
          return tablesDB
            .listDocuments(opts.databaseId, opts.tableId, opts.queries || [])
            .then(function (res) {
              res.rows = res.documents || res.rows || [];
              return res;
            });
        };
      }

      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      console.warn('[LAScores]', initError);
      return false;
    }
  }

  function ensureAuth() {
    if (!init()) {
      return Promise.reject(new Error(initError || 'Appwrite not ready'));
    }
    return Promise.resolve({ uid: null });
  }

  function getPlayerName() {
    try {
      return (localStorage.getItem(NAME_KEY) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setPlayerName(name) {
    var clean = String(name || '').trim().slice(0, 32);
    try {
      if (clean) localStorage.setItem(NAME_KEY, clean);
    } catch (e) {}
    return clean;
  }

  function sanitizeGameId(id) {
    return String(id || 'game').replace(/[.#$\[\]]/g, '_').slice(0, 64);
  }

  function submit(opts) {
    opts = opts || {};
    if (!init()) {
      return Promise.resolve({ ok: false, error: initError || 'Appwrite not ready' });
    }

    var name = (opts.name != null ? String(opts.name) : getPlayerName()).trim().slice(0, 32);
    if (!name) {
      return Promise.resolve({ ok: false, error: 'Please enter a name' });
    }
    setPlayerName(name);

    var gameId = sanitizeGameId(opts.gameId);
    var score = Number(opts.score);
    if (!isFinite(score)) score = 0;
    score = Math.max(0, Math.round(score));

    var data = {
      name: name,
      score: score,
      gameId: gameId,
      gameName: opts.gameName ? String(opts.gameName).slice(0, 128) : gameId,
      at: Date.now()
    };
    if (opts.maxScore != null && isFinite(Number(opts.maxScore))) {
      data.maxScore = Number(opts.maxScore);
    }

    return tablesDB
      .createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: data
      })
      .then(function (row) {
        return {
          ok: true,
          key: row.$id,
          data: {
            name: data.name,
            score: data.score,
            maxScore: data.maxScore != null ? data.maxScore : null,
            gameName: data.gameName,
            uid: null,
            at: data.at,
            iso: new Date(data.at).toISOString()
          }
        };
      })
      .catch(function (err) {
        console.warn('[LAScores] submit failed', err);
        var msg = err && err.message ? err.message : String(err);
        if (/permission|not authorized|401|403/i.test(msg)) {
          msg = 'Permission denied. Set table Create+Read for role Any in Appwrite.';
        }
        return { ok: false, error: msg };
      });
  }

  function top(gameId, limit) {
    if (!init()) return Promise.resolve([]);
    limit = limit || 20;
    var id = sanitizeGameId(gameId);

    return tablesDB
      .listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [
          Query.equal('gameId', id),
          Query.orderDesc('score'),
          Query.limit(limit)
        ]
      })
      .then(function (res) {
        var rows = (res.rows || res.documents || []).map(function (r) {
          return {
            key: r.$id,
            name: r.name || 'Player',
            score: Number(r.score) || 0,
            maxScore: r.maxScore,
            gameName: r.gameName,
            uid: null,
            at: r.at || 0,
            iso: r.$createdAt || ''
          };
        });
        rows.sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          return (b.at || 0) - (a.at || 0);
        });
        return rows;
      })
      .catch(function (err) {
        console.warn('[LAScores] top failed', err);
        return [];
      });
  }

  function listGames() {
    if (!init()) return Promise.resolve([]);
    return tablesDB
      .listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [Query.limit(100)]
      })
      .then(function (res) {
        var seen = {};
        var ids = [];
        (res.rows || res.documents || []).forEach(function (r) {
          var gid = r.gameId;
          if (gid && !seen[gid]) {
            seen[gid] = true;
            ids.push(gid);
          }
        });
        return ids;
      })
      .catch(function () {
        return [];
      });
  }

  function myScores() {
    if (!init()) return Promise.resolve([]);
    var name = getPlayerName().toLowerCase();
    if (!name) return Promise.resolve([]);

    return tablesDB
      .listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [Query.limit(100)]
      })
      .then(function (res) {
        var rows = [];
        (res.rows || res.documents || []).forEach(function (r) {
          if (String(r.name || '').toLowerCase() === name) {
            rows.push({
              key: r.$id,
              gameId: r.gameId,
              name: r.name || 'Player',
              score: Number(r.score) || 0,
              maxScore: r.maxScore,
              gameName: r.gameName || r.gameId,
              uid: null,
              at: r.at || 0,
              iso: r.$createdAt || ''
            });
          }
        });
        rows.sort(function (a, b) {
          return (b.at || 0) - (a.at || 0);
        });
        return rows;
      })
      .catch(function (err) {
        console.warn('[LAScores] myScores failed', err);
        return [];
      });
  }

  global.LAScores = {
    init: init,
    ensureAuth: ensureAuth,
    getPlayerName: getPlayerName,
    setPlayerName: setPlayerName,
    submit: submit,
    top: top,
    myScores: myScores,
    listGames: listGames,
    GAMES: {
      'opposite-snap': { title: 'Opposite Snap', maxScore: null },
      'sound-match-picture': { title: 'Sound Match Picture', maxScore: 16 }
    }
  };
})(typeof window !== 'undefined' ? window : this);
