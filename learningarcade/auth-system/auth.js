/**
 * Learning Arcade — Simple Auth (Username + Password)
 * Uses Appwrite players table
 * Public API: window.LAAuth
 */
(function (global) {
  "use strict";

  var ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var PROJECT_ID = "6aafc5370019ebd5da7c";
  var DATABASE_ID = "6aafc5ce007461d09d3";
  var PLAYERS_TABLE = "6aafca9b002d3c88262e";

  var SESSION_KEY = "laAuthSession";
  var ready = false;
  var initError = null;
  var tablesDB = null;
  var ID = null;
  var Query = null;

  // ---------- helpers ----------

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (typeof Appwrite === "undefined") {
      initError = "Appwrite SDK not loaded";
      console.warn("[LAAuth]", initError);
      return false;
    }
    try {
      var Client = Appwrite.Client;
      var TablesDBCtor = Appwrite.TablesDB || Appwrite.Databases;
      if (!Client || !TablesDBCtor) {
        initError = "Appwrite TablesDB missing";
        return false;
      }
      ID = Appwrite.ID;
      Query = Appwrite.Query;

      var client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
      tablesDB = new TablesDBCtor(client);

      // Fallbacks for older SDK
      if (typeof tablesDB.createRow !== "function" && typeof tablesDB.createDocument === "function") {
        tablesDB.createRow = function (opts) {
          return tablesDB.createDocument(opts.databaseId, opts.tableId, opts.rowId, opts.data);
        };
      }
      if (typeof tablesDB.listRows !== "function" && typeof tablesDB.listDocuments === "function") {
        tablesDB.listRows = function (opts) {
          return tablesDB.listDocuments(opts.databaseId, opts.tableId, opts.queries || []).then(function (res) {
            res.rows = res.documents || res.rows || [];
            return res;
          });
        };
      }

      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      console.warn("[LAAuth]", initError);
      return false;
    }
  }

  // Simple hash (for school project – not production-grade)
  async function hashPassword(password) {
    var encoder = new TextEncoder();
    var data = encoder.encode(password + "la-arcade-salt-2026");
    var hashBuffer = await crypto.subtle.digest("SHA-256", data);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  function sanitizeUsername(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_\-]/g, "")
      .slice(0, 24);
  }

  function saveSession(player) {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: player.$id || player.id,
          username: player.username,
          displayName: player.displayName || player.username,
          totalStars: player.totalStars || 0,
          gamesPlayed: player.gamesPlayed || 0,
        })
      );
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // ---------- public API ----------

  /**
   * Register a new player
   * @param {string} username
   * @param {string} password
   * @param {string} [displayName]
   */
  async function register(username, password, displayName) {
    if (!init()) return { ok: false, error: initError || "Not ready" };

    var cleanUser = sanitizeUsername(username);
    if (cleanUser.length < 3) {
      return { ok: false, error: "Username must be at least 3 characters" };
    }
    if (!password || password.length < 4) {
      return { ok: false, error: "Password must be at least 4 characters" };
    }

    try {
      // Check if username already exists
      var existing = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: PLAYERS_TABLE,
        queries: [Query.equal("username", cleanUser), Query.limit(1)],
      });

      var rows = existing.rows || existing.documents || [];
      if (rows.length > 0) {
        return { ok: false, error: "Username already taken" };
      }

      var hashed = await hashPassword(password);
      var now = Date.now();

      var result = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: PLAYERS_TABLE,
        rowId: ID.unique(),
        data: {
          username: cleanUser,
          password: hashed,
          displayName: (displayName || cleanUser).trim().slice(0, 32),
          totalStars: 0,
          gamesPlayed: 0,
          createdAt: now,
        },
      });

      var player = result;
      saveSession(player);
      return { ok: true, player: getSession() };
    } catch (e) {
      console.warn("[LAAuth] register error", e);
      var msg = (e && e.message) || String(e);
      if (/unique|duplicate|already/i.test(msg)) {
        return { ok: false, error: "Username already taken" };
      }
      return { ok: false, error: "Could not create account. Try again." };
    }
  }

  /**
   * Login
   * @param {string} username
   * @param {string} password
   */
  async function login(username, password) {
    if (!init()) return { ok: false, error: initError || "Not ready" };

    var cleanUser = sanitizeUsername(username);
    if (!cleanUser || !password) {
      return { ok: false, error: "Please enter username and password" };
    }

    try {
      var res = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: PLAYERS_TABLE,
        queries: [Query.equal("username", cleanUser), Query.limit(1)],
      });

      var rows = res.rows || res.documents || [];
      if (rows.length === 0) {
        return { ok: false, error: "Wrong username or password" };
      }

      var player = rows[0];
      var hashed = await hashPassword(password);

      if (player.password !== hashed) {
        return { ok: false, error: "Wrong username or password" };
      }

      saveSession(player);
      return { ok: true, player: getSession() };
    } catch (e) {
      console.warn("[LAAuth] login error", e);
      return { ok: false, error: "Login failed. Try again." };
    }
  }

  function logout() {
    clearSession();
    return { ok: true };
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function currentUser() {
    return getSession();
  }

  // Expose
  global.LAAuth = {
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    getSession: getSession,
  };
})(window);
