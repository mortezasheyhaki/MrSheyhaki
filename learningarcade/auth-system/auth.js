/**
 * Learning Arcade — Auth (username + password) on real Appwrite Auth
 * Public API: window.LAAuth  (same sync API as before + a few async helpers)
 *
 * How it works
 *  - A student's username is mapped to a private login email:
 *      ali_7a  ->  ali_7a@players.mrsheyhaki.ir   (no real mailbox, no emails sent)
 *  - Real Appwrite account + real Appwrite session. Passwords are hashed
 *    server-side by Appwrite (the old browser-side SHA-256 table is NOT used
 *    for new accounts any more).
 *  - currentUser()/isLoggedIn() stay SYNCHRONOUS (read a small localStorage
 *    cache) so existing pages keep working. The cache is re-checked against
 *    the server in the background (LAAuth.verify) and cleared if the session
 *    is no longer valid. Anything security-relevant (saving progress) asks
 *    Appwrite for the real account, never this cache.
 *  - Old accounts (legacy "players" table) are migrated automatically the
 *    first time the student logs in with their existing password.
 *
 * Load AFTER: https://cdn.jsdelivr.net/npm/appwrite@26.2.0
 */
(function (global) {
  "use strict";

  var ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var PROJECT_ID = "6aafc5370019ebd5da7c";
  var DATABASE_ID = "6aafc5ce007461d09d3";
  var LEGACY_PLAYERS_TABLE = "6aafca9b002d3c88262e"; // old table, only read for one-time migration
  var EMAIL_DOMAIN = "players.mrsheyhaki.ir";
  var MIN_PASSWORD = 8; // Appwrite Auth minimum

  var SESSION_KEY = "laAuthSession";
  var ready = false;
  var initError = null;
  var account = null;
  var tablesDB = null;
  var ID = null;
  var Query = null;

  // ---------- init ----------

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (typeof Appwrite === "undefined") {
      initError = "Appwrite SDK not loaded";
      console.warn("[LAAuth]", initError);
      return false;
    }
    try {
      var client = new Appwrite.Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
      account = new Appwrite.Account(client);
      var TablesDBCtor = Appwrite.TablesDB || Appwrite.Databases;
      tablesDB = TablesDBCtor ? new TablesDBCtor(client) : null;
      ID = Appwrite.ID;
      Query = Appwrite.Query;
      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      console.warn("[LAAuth]", initError);
      return false;
    }
  }

  // ---------- helpers ----------

  function sanitizeUsername(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_\-]/g, "")
      .slice(0, 24);
  }

  function emailFor(username) {
    return username + "@" + EMAIL_DOMAIN;
  }

  function usernameFromEmail(email) {
    return String(email || "").split("@")[0];
  }

  function errCode(e) {
    return e && typeof e.code === "number" ? e.code : 0;
  }

  // Old browser-side hash — ONLY used to verify legacy accounts once, for migration.
  async function legacyHash(password) {
    var data = new TextEncoder().encode(password + "la-arcade-salt-2026");
    var buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  function notifyAccountChanged() {
    try { if (global.LAProgress && global.LAProgress.reset) global.LAProgress.reset(); } catch (e) {}
  }

  function saveSession(acc) {
    notifyAccountChanged();
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: acc.$id,
          username: usernameFromEmail(acc.email),
          displayName: acc.name || usernameFromEmail(acc.email),
          totalStars: 0,
          gamesPlayed: 0,
        })
      );
    } catch (e) {}
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Remove any previous Appwrite session so a new login never fails with "session is active".
  async function dropExistingSession() {
    try { await account.deleteSession({ sessionId: "current" }); } catch (e) {}
  }

  async function startSession(username, password) {
    await dropExistingSession();
    await account.createEmailPasswordSession({ email: emailFor(username), password: password });
    var acc = await account.get();
    saveSession(acc);
    return getSession();
  }

  async function createAccount(username, password, displayName) {
    await account.create({
      userId: ID.unique(),
      email: emailFor(username),
      password: password,
      name: (displayName || username).trim().slice(0, 32),
    });
    return startSession(username, password);
  }

  async function findLegacyPlayer(username, password) {
    if (!tablesDB || !tablesDB.listRows) return null;
    try {
      var res = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: LEGACY_PLAYERS_TABLE,
        queries: [Query.equal("username", username), Query.limit(1)],
      });
      var rows = res.rows || res.documents || [];
      if (!rows.length) return null;
      var hashed = await legacyHash(password);
      return rows[0].password === hashed ? rows[0] : null;
    } catch (e) {
      return null; // legacy table already removed/locked → nothing to migrate
    }
  }

  // ---------- public API ----------

  async function register(username, password, displayName) {
    if (!init()) return { ok: false, error: initError || "Not ready" };
    var clean = sanitizeUsername(username);
    if (clean.length < 3) return { ok: false, error: "Username must be at least 3 characters" };
    if (!password || password.length < MIN_PASSWORD) {
      return { ok: false, error: "Password must be at least " + MIN_PASSWORD + " characters" };
    }
    try {
      var player = await createAccount(clean, password, displayName);
      return { ok: true, player: player };
    } catch (e) {
      console.warn("[LAAuth] register error", e);
      if (errCode(e) === 409) return { ok: false, error: "Username already taken" };
      if (errCode(e) === 429) return { ok: false, error: "Too many tries. Wait a minute and try again." };
      return { ok: false, error: "Could not create account. Try again." };
    }
  }

  async function login(username, password) {
    if (!init()) return { ok: false, error: initError || "Not ready" };
    var clean = sanitizeUsername(username);
    if (!clean || !password) return { ok: false, error: "Please enter username and password" };

    try {
      return { ok: true, player: await startSession(clean, password) };
    } catch (e) {
      var code = errCode(e);
      if (code === 429) return { ok: false, error: "Too many tries. Wait a minute and try again." };
      if (code !== 401 && code !== 400 && code !== 404) {
        console.warn("[LAAuth] login error", e);
        return { ok: false, error: "Login failed. Try again." };
      }
    }

    // Not an Appwrite account (yet) → maybe an old account that needs migrating.
    var legacy = await findLegacyPlayer(clean, password);
    if (!legacy) return { ok: false, error: "Wrong username or password" };

    if (password.length < MIN_PASSWORD) {
      return {
        ok: false,
        needsPasswordUpgrade: true,
        error: "Your account needs a new, longer password (" + MIN_PASSWORD + "+ characters).",
      };
    }
    try {
      return { ok: true, player: await createAccount(clean, password, legacy.displayName), migrated: true };
    } catch (e2) {
      console.warn("[LAAuth] migration error", e2);
      return { ok: false, error: "Could not upgrade your account. Try again." };
    }
  }

  /** Old account whose password is too short: verify the old password, then set a new one. */
  async function upgradeLegacy(username, oldPassword, newPassword) {
    if (!init()) return { ok: false, error: initError || "Not ready" };
    var clean = sanitizeUsername(username);
    if (!newPassword || newPassword.length < MIN_PASSWORD) {
      return { ok: false, error: "New password must be at least " + MIN_PASSWORD + " characters" };
    }
    var legacy = await findLegacyPlayer(clean, oldPassword);
    if (!legacy) return { ok: false, error: "Wrong username or password" };
    try {
      return { ok: true, player: await createAccount(clean, newPassword, legacy.displayName), migrated: true };
    } catch (e) {
      console.warn("[LAAuth] upgrade error", e);
      if (errCode(e) === 409) return { ok: false, error: "This account was already upgraded. Log in with your new password." };
      return { ok: false, error: "Could not upgrade your account. Try again." };
    }
  }

  /**
   * Logs out. Synchronous for old callers (clears local state immediately);
   * returns { ok, done } where `done` resolves when the server session is deleted.
   */
  function logout() {
    var done = Promise.resolve();
    if (init()) {
      done = account.deleteSession({ sessionId: "current" }).catch(function () {});
    }
    clearSession();
    try { localStorage.removeItem("cookieFallback"); } catch (e) {} // SDK's stored session
    notifyAccountChanged();
    return { ok: true, done: done };
  }

  function isLoggedIn() { return !!getSession(); }
  function currentUser() { return getSession(); }

  /** Ask the server whether the session is real. Resolves to the player or null. Fixes stale caches. */
  async function verify() {
    if (!init()) return getSession();
    try {
      var acc = await account.get();
      saveSession(acc);
      return getSession();
    } catch (e) {
      if (errCode(e) === 401) clearSession(); // not signed in (or session expired)
      return errCode(e) === 401 ? null : getSession(); // network error → keep cache
    }
  }

  global.LAAuth = {
    register: register,
    login: login,
    upgradeLegacy: upgradeLegacy,
    logout: logout,
    verify: verify,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    getSession: getSession,
    MIN_PASSWORD: MIN_PASSWORD,
  };

  // Background re-check so a stale/forged cache can't make a page look logged in forever.
  if (getSession()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { verify(); });
    else verify();
  }
})(window);
