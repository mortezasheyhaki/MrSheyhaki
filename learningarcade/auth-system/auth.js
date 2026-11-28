/**
 * Learning Arcade — Auth (username + password) on Supabase Auth
 * Public API: window.LAAuth
 *
 * Username is mapped to a private login email:
 *   ali_7a  ->  ali_7a@players.mrsheyhaki.ir
 *
 * Load AFTER the Supabase JS SDK:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="auth.js"></script>
 *
 * CONFIG — replace with your project values from Supabase → Settings → API
 */
(function (global) {
  "use strict";

  // ========== CONFIG (required) ==========
  var SUPABASE_URL = "https://ezlcrygimvceusmnojgk.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bGNyeWdpbXZjZXVzbW5vamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNjU4NjQsImV4cCI6MjEwOTk0MTg2NH0.R3a0dMRDCHaAbDKRGhLssvYfg8HzcEb5ODF5xfUt_Ys";
  // =======================================

  var EMAIL_DOMAIN = "players.mrsheyhaki.ir";
  var MIN_PASSWORD = 8;
  var SESSION_KEY = "laAuthSession";
  var EXT_CACHE_PREFIX = "laProfileExt:";

  var ROLES = [
    { id: "student", label: "Student", desc: "Learning English in class or school" },
    { id: "teacher", label: "Teacher", desc: "Teaching classes & tracking students" },
    { id: "parent", label: "Parent / Guardian", desc: "Helping a learner practice at home" },
    { id: "self-learner", label: "Self-Learner", desc: "Practicing English independently" }
  ];

  var BOOKS = [
    { id: "american-english-file", label: "American English File", desc: "Starter, Levels 1–4 & Tests", url: "/resources/american-english-file/" },
    { id: "teen-2-teen", label: "Teen2Teen", desc: "Teen English coursebook & practice", url: "/resources/teen-2-teen/" },
    { id: "pre-starter", label: "Pre-starter", desc: "Early beginner alphabet & phonics", url: "/resources/pre-starter/" },
    { id: "tactics-for-listening", label: "Tactics for Listening", desc: "Focused listening comprehension", url: "/resources/tactics-for-listening/" },
    { id: "not-a-student", label: "Not a student / No book", desc: "General arcade practice without a textbook", url: "/learningarcade/" }
  ];

  var ready = false;
  var initError = null;
  var sb = null;

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR_PROJECT") !== -1) {
      initError = "Supabase URL not configured — edit auth.js";
      console.warn("[LAAuth]", initError);
      return false;
    }
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.indexOf("YOUR_ANON") !== -1) {
      initError = "Supabase anon key not configured — edit auth.js";
      console.warn("[LAAuth]", initError);
      return false;
    }
    if (typeof supabase === "undefined" || typeof supabase.createClient !== "function") {
      // Do NOT set initError permanently — SDK may still be loading from CDN fallbacks
      console.warn("[LAAuth] Supabase SDK not loaded yet");
      return false;
    }
    try {
      sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      console.warn("[LAAuth]", initError);
      return false;
    }
  }

  function sanitizeUsername(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 32);
  }

  function validateBirthdate(raw) {
    var s = String(raw || "").trim();
    if (!s) return { ok: false, error: "Please enter your birthdate." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return { ok: false, error: "Please enter a valid birthdate (YYYY-MM-DD)." };
    }
    var parts = s.split("-");
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    var dt = new Date(y, m - 1, d);
    if (
      !dt ||
      dt.getFullYear() !== y ||
      dt.getMonth() !== m - 1 ||
      dt.getDate() !== d
    ) {
      return { ok: false, error: "That calendar date does not exist." };
    }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (y < 1920 || dt > today) {
      return { ok: false, error: "Birthdate must be between 1920 and today." };
    }
    return { ok: true, value: s };
  }

  function normalizeRole(raw) {
    var v = String(raw || "").trim().toLowerCase();
    for (var i = 0; i < ROLES.length; i++) {
      if (ROLES[i].id === v) return v;
    }
    return "";
  }

  function normalizeBook(raw) {
    var v = String(raw || "").trim().toLowerCase();
    for (var i = 0; i < BOOKS.length; i++) {
      if (BOOKS[i].id === v) return v;
    }
    return "";
  }

  function getRoleInfo(id) {
    var norm = normalizeRole(id);
    for (var i = 0; i < ROLES.length; i++) {
      if (ROLES[i].id === norm) return ROLES[i];
    }
    return null;
  }

  function getBookInfo(id) {
    var norm = normalizeBook(id);
    for (var i = 0; i < BOOKS.length; i++) {
      if (BOOKS[i].id === norm) return BOOKS[i];
    }
    return null;
  }

  function readExtCache(userId) {
    if (!userId) return {};
    try {
      var raw = localStorage.getItem(EXT_CACHE_PREFIX + userId);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) {
      return {};
    }
  }

  function writeExtCache(userId, ext) {
    if (!userId) return;
    try {
      var prev = readExtCache(userId);
      var merged = {
        birthdate: ext.birthdate !== undefined ? ext.birthdate : (prev.birthdate || ""),
        role: ext.role !== undefined ? ext.role : (prev.role || ""),
        studyingBook: ext.studyingBook !== undefined ? ext.studyingBook : (prev.studyingBook || ""),
        activeTitle: ext.activeTitle !== undefined ? ext.activeTitle : (prev.activeTitle || "")
      };
      localStorage.setItem(EXT_CACHE_PREFIX + userId, JSON.stringify(merged));
    } catch (e) {}
  }

  function emailFor(username) {
    return sanitizeUsername(username) + "@" + EMAIL_DOMAIN;
  }

  function usernameFromEmail(email) {
    return String(email || "").split("@")[0];
  }

  function notifyAccountChanged() {
    try {
      if (global.LAProgress && global.LAProgress.reset) global.LAProgress.reset();
    } catch (e) {}
  }

  function extractExt(user) {
    var meta = (user && user.user_metadata) || {};
    var cache = readExtCache(user && user.id);
    var bdayRaw = meta.birthdate || cache.birthdate || "";
    var bdayCheck = bdayRaw ? validateBirthdate(bdayRaw) : { ok: false };
    var role = normalizeRole(meta.role || cache.role || "");
    var book = normalizeBook(meta.studying_book || meta.studyingBook || cache.studyingBook || "");
    var title = String(meta.active_title || meta.activeTitle || cache.activeTitle || "").trim().slice(0, 48);
    return {
      birthdate: bdayCheck.ok ? bdayCheck.value : "",
      role: role,
      studyingBook: book,
      activeTitle: title
    };
  }

  function saveSessionFromUser(user) {
    notifyAccountChanged();
    if (!user) return;
    var meta = user.user_metadata || {};
    var username =
      meta.username || usernameFromEmail(user.email) || "";
    var displayName =
      meta.display_name || meta.displayName || (user.email && usernameFromEmail(user.email)) || username;
    var ext = extractExt(user);
    writeExtCache(user.id, ext);
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: user.id,
          username: username,
          displayName: displayName,
          birthdate: ext.birthdate,
          role: ext.role,
          studyingBook: ext.studyingBook,
          activeTitle: ext.activeTitle,
          totalStars: 0,
          gamesPlayed: 0,
        })
      );
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    // Also clear Supabase persisted auth tokens so verify() cannot restore the session
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf("sb-") === 0 || k.indexOf("supabase") !== -1)) keys.push(k);
      }
      keys.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e2) {}
      });
    } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function hasCompletedOnboarding(player) {
    var p = player || getSession();
    if (!p) return false;
    return Boolean(p.birthdate && p.role && p.studyingBook);
  }

  function mapAuthError(err) {
    var msg = (err && (err.message || err.error_description || err.msg)) || "";
    var status = err && (err.status || err.statusCode);
    var low = String(msg).toLowerCase();
    if (status === 429 || low.indexOf("rate") !== -1) {
      return "Too many tries. Wait a minute and try again.";
    }
    if (
      low.indexOf("already registered") !== -1 ||
      low.indexOf("already been registered") !== -1 ||
      low.indexOf("user already") !== -1
    ) {
      return "Username already taken";
    }
    if (low.indexOf("invalid login") !== -1 || low.indexOf("invalid credentials") !== -1) {
      return "Wrong username or password";
    }
    if (low.indexOf("password") !== -1 && low.indexOf("least") !== -1) {
      return "Password must be at least " + MIN_PASSWORD + " characters";
    }
    if (low.indexOf("email") !== -1 && low.indexOf("confirm") !== -1) {
      return "Email confirmation is still enabled in Supabase. Turn it OFF in Auth → Providers → Email.";
    }
    return msg || "Something went wrong. Try again.";
  }

  async function syncProfileTable(userId, basePayload, extraPayload) {
    if (!userId || !sb) return;
    var full = Object.assign({}, basePayload);
    if (extraPayload) {
      if (extraPayload.birthdate) full.birthdate = extraPayload.birthdate;
      if (extraPayload.role) full.role = extraPayload.role;
      if (extraPayload.studying_book) full.studying_book = extraPayload.studying_book;
      if (extraPayload.active_title !== undefined) full.active_title = extraPayload.active_title || null;
    }
    try {
      var res = await sb.from("profiles").upsert(full, { onConflict: "id" });
      if (res && res.error) {
        var msg = String(res.error.message || "").toLowerCase();
        // If remote profiles table hasn't run the ALTER TABLE migration yet, retry with base columns only
        if (msg.indexOf("column") !== -1 || msg.indexOf("schema cache") !== -1 || res.error.code === "PGRST204" || res.error.code === "42703") {
          await sb.from("profiles").upsert(basePayload, { onConflict: "id" });
        } else {
          console.warn("[LAAuth] profile sync:", res.error.message);
        }
      }
    } catch (e) {
      console.warn("[LAAuth] profile upsert failed", e);
    }
  }

  async function ensureProfile(user, username, displayName, extra) {
    if (!user || !user.id || !sb) return;
    var meta = user.user_metadata || {};
    var un = username || meta.username || usernameFromEmail(user.email);
    var dn = displayName || meta.display_name || un;
    var ext = extra || extractExt(user);
    await syncProfileTable(
      user.id,
      { id: user.id, username: un, display_name: dn },
      {
        birthdate: ext.birthdate || null,
        role: ext.role || null,
        studying_book: ext.studyingBook || null,
        active_title: ext.activeTitle || null
      }
    );
  }

  async function register(username, password, optsOrDisplayName) {
    if (!init()) return { ok: false, error: initError || "Supabase is still loading — wait a second and try again" };
    var clean = sanitizeUsername(username);
    if (clean.length < 3) return { ok: false, error: "Username must be at least 3 characters" };
    if (!password || password.length < MIN_PASSWORD) {
      return { ok: false, error: "Password must be at least " + MIN_PASSWORD + " characters" };
    }

    var opts = (optsOrDisplayName && typeof optsOrDisplayName === "object")
      ? optsOrDisplayName
      : { displayName: optsOrDisplayName };

    var name = String(opts.displayName || clean).trim().slice(0, 32) || clean;
    var metaData = {
      username: clean,
      display_name: name,
    };

    var ext = { birthdate: "", role: "", studyingBook: "", activeTitle: "" };
    if (opts.birthdate) {
      var bv = validateBirthdate(opts.birthdate);
      if (!bv.ok) return { ok: false, error: bv.error };
      metaData.birthdate = bv.value;
      ext.birthdate = bv.value;
    }
    if (opts.role) {
      var nr = normalizeRole(opts.role);
      if (!nr) return { ok: false, error: "Please select a valid role." };
      metaData.role = nr;
      ext.role = nr;
    }
    if (opts.studyingBook) {
      var nb = normalizeBook(opts.studyingBook);
      if (!nb) return { ok: false, error: "Please select a studying book option." };
      metaData.studying_book = nb;
      ext.studyingBook = nb;
    }

    try {
      var res = await sb.auth.signUp({
        email: emailFor(clean),
        password: password,
        options: {
          data: metaData,
        },
      });
      if (res.error) return { ok: false, error: mapAuthError(res.error) };
      var user = res.data && res.data.user;
      // If email confirm is still ON, session may be null
      if (res.data && res.data.session && user) {
        saveSessionFromUser(user);
        await ensureProfile(user, clean, name, ext);
        return { ok: true, player: getSession() };
      }
      if (user && !res.data.session) {
        // Try immediate sign-in (works when confirm email is off)
        var loginRes = await sb.auth.signInWithPassword({
          email: emailFor(clean),
          password: password,
        });
        if (loginRes.error) {
          return {
            ok: false,
            error:
              "Account created, but login needs email confirmation. " +
              "In Supabase: Auth → Providers → Email → disable Confirm email.",
          };
        }
        saveSessionFromUser(loginRes.data.user);
        await ensureProfile(loginRes.data.user, clean, name, ext);
        return { ok: true, player: getSession() };
      }
      return { ok: false, error: "Could not create account. Try again." };
    } catch (e) {
      console.warn("[LAAuth] register error", e);
      return { ok: false, error: mapAuthError(e) };
    }
  }

  async function login(username, password) {
    if (!init()) return { ok: false, error: initError || "Supabase is still loading — wait a second and try again" };
    var clean = sanitizeUsername(username);
    if (!clean || !password) return { ok: false, error: "Please enter username and password" };
    try {
      var res = await sb.auth.signInWithPassword({
        email: emailFor(clean),
        password: password,
      });
      if (res.error) return { ok: false, error: mapAuthError(res.error) };
      saveSessionFromUser(res.data.user);
      await ensureProfile(res.data.user, clean, null);
      return { ok: true, player: getSession() };
    } catch (e) {
      console.warn("[LAAuth] login error", e);
      return { ok: false, error: mapAuthError(e) };
    }
  }

  /** Kept for login.html compatibility. */
  async function upgradeLegacy(username, oldPassword, newPassword) {
    if (!newPassword || newPassword.length < MIN_PASSWORD) {
      return { ok: false, error: "New password must be at least " + MIN_PASSWORD + " characters" };
    }
    // Try login with old password then update — only works if account already exists on Supabase
    var logged = await login(username, oldPassword);
    if (!logged.ok) {
      return {
        ok: false,
        error: "Account not found. Please Register a new account.",
      };
    }
    try {
      var res = await sb.auth.updateUser({ password: newPassword });
      if (res.error) return { ok: false, error: mapAuthError(res.error) };
      return { ok: true, player: getSession(), migrated: true };
    } catch (e) {
      return { ok: false, error: mapAuthError(e) };
    }
  }

  function logout() {
    var done = Promise.resolve();
    if (init() && sb) {
      done = sb.auth.signOut({ scope: "local" }).catch(function () {
        return sb.auth.signOut().catch(function () {});
      });
    }
    clearSession();
    notifyAccountChanged();
    return { ok: true, done: done };
  }

  /** Promise-based logout for UI buttons — always clears local state */
  async function logoutAsync() {
    try {
      if (init() && sb) {
        try {
          await sb.auth.signOut({ scope: "local" });
        } catch (e1) {
          try { await sb.auth.signOut(); } catch (e2) {}
        }
      }
    } catch (e) {}
    clearSession();
    notifyAccountChanged();
    return { ok: true };
  }

  function isLoggedIn() {
    return !!getSession();
  }
  function currentUser() {
    return getSession();
  }

  async function verify() {
    if (!init()) return getSession();
    try {
      var res = await sb.auth.getUser();
      if (res.error || !res.data || !res.data.user) {
        clearSession();
        return null;
      }
      saveSessionFromUser(res.data.user);
      return getSession();
    } catch (e) {
      return getSession();
    }
  }

  /** Optional helper for scores — current Supabase access token user id */
  async function getUserId() {
    if (!init()) return null;
    try {
      var res = await sb.auth.getUser();
      return res.data && res.data.user ? res.data.user.id : null;
    } catch (e) {
      return null;
    }
  }

  function getClient() {
    init();
    return sb;
  }

  async function updateProfile(fields) {
    if (!init()) {
      return { ok: false, error: initError || "Supabase is still loading — wait a second and try again" };
    }
    var opts = fields || {};
    try {
      var prev = getSession();
      var userRes = await sb.auth.getUser();
      var user = userRes && userRes.data && userRes.data.user;
      if (!user) {
        clearSession();
        return { ok: false, error: "Your session expired. Please sign in again." };
      }

      var meta = Object.assign({}, user.user_metadata || {});
      var username = meta.username || usernameFromEmail(user.email) || (prev && prev.username) || "";
      meta.username = username;

      if (opts.displayName !== undefined) {
        var cleanDn = String(opts.displayName || "").trim().slice(0, 32);
        if (cleanDn.length < 2) {
          return { ok: false, error: "Showing name must be at least 2 characters" };
        }
        meta.display_name = cleanDn;
      }
      if (opts.birthdate !== undefined) {
        var bv = validateBirthdate(opts.birthdate);
        if (!bv.ok) return { ok: false, error: bv.error };
        meta.birthdate = bv.value;
      }
      if (opts.role !== undefined) {
        var nr = normalizeRole(opts.role);
        if (!nr) return { ok: false, error: "Please select a valid role." };
        meta.role = nr;
      }
      if (opts.studyingBook !== undefined) {
        var nb = normalizeBook(opts.studyingBook);
        if (!nb) return { ok: false, error: "Please select a studying book option." };
        meta.studying_book = nb;
      }
      if (opts.activeTitle !== undefined) {
        meta.active_title = String(opts.activeTitle || "").trim().slice(0, 48);
      }

      var upd = await sb.auth.updateUser({ data: meta });
      if (upd.error) return { ok: false, error: mapAuthError(upd.error) };

      var updatedUser = (upd.data && upd.data.user) || user;
      if (!updatedUser.user_metadata) updatedUser.user_metadata = meta;
      writeExtCache(user.id, {
        birthdate: meta.birthdate || "",
        role: meta.role || "",
        studyingBook: meta.studying_book || "",
        activeTitle: meta.active_title || ""
      });
      saveSessionFromUser(updatedUser);

      var finalDn = meta.display_name || username;
      await syncProfileTable(
        user.id,
        { id: user.id, username: username, display_name: finalDn },
        {
          birthdate: meta.birthdate || null,
          role: meta.role || null,
          studying_book: meta.studying_book || null,
          active_title: meta.active_title || null
        }
      );

      // Keep scoreboard player name in sync if it was unset or matched previous name
      if (opts.displayName !== undefined) {
        try {
          var curPlayer = (localStorage.getItem("laPlayerName") || "").trim();
          var prevName = prev ? (prev.displayName || prev.username || "").trim() : "";
          if (!curPlayer || curPlayer === prevName || curPlayer === username) {
            localStorage.setItem("laPlayerName", finalDn);
          }
        } catch (eLs) {}
      }

      return { ok: true, player: getSession() };
    } catch (e) {
      return { ok: false, error: mapAuthError(e) };
    }
  }

  async function updateDisplayName(newDisplayName) {
    return updateProfile({ displayName: newDisplayName });
  }

  async function changePassword(currentPassword, newPassword) {
    if (!init()) {
      return { ok: false, error: initError || "Supabase is still loading — wait a second and try again" };
    }
    var cur = String(currentPassword || "");
    var next = String(newPassword || "");
    if (!cur) return { ok: false, error: "Please enter your current password" };
    if (next.length < MIN_PASSWORD) {
      return { ok: false, error: "New password must be at least " + MIN_PASSWORD + " characters" };
    }
    if (cur === next) {
      return { ok: false, error: "New password must be different from your current password" };
    }
    try {
      var userRes = await sb.auth.getUser();
      var user = userRes && userRes.data && userRes.data.user;
      if (!user) {
        clearSession();
        return { ok: false, error: "Your session expired. Please sign in again." };
      }

      var meta = user.user_metadata || {};
      var username = meta.username || usernameFromEmail(user.email) || "";
      var loginEmail = user.email || emailFor(username);

      var checkRes = await sb.auth.signInWithPassword({
        email: loginEmail,
        password: cur,
      });
      if (checkRes.error) {
        return { ok: false, error: "Current password is incorrect" };
      }

      var upd = await sb.auth.updateUser({ password: next });
      if (upd.error) return { ok: false, error: mapAuthError(upd.error) };

      if (upd.data && upd.data.user) {
        saveSessionFromUser(upd.data.user);
      }
      return { ok: true, player: getSession() };
    } catch (e) {
      return { ok: false, error: mapAuthError(e) };
    }
  }

  async function getAccountDetails() {
    if (!init()) return getSession();
    try {
      var res = await sb.auth.getUser();
      var u = res && res.data && res.data.user;
      if (!u) return null;
      saveSessionFromUser(u);
      var s = getSession() || {};
      return {
        id: u.id,
        username: s.username || usernameFromEmail(u.email),
        displayName: s.displayName || s.username || "Player",
        birthdate: s.birthdate || "",
        role: s.role || "",
        studyingBook: s.studyingBook || "",
        activeTitle: s.activeTitle || "",
        createdAt: u.created_at || null,
      };
    } catch (e) {
      return getSession();
    }
  }

  global.LAAuth = {
    register: register,
    login: login,
    upgradeLegacy: upgradeLegacy,
    updateDisplayName: updateDisplayName,
    updateProfile: updateProfile,
    changePassword: changePassword,
    getAccountDetails: getAccountDetails,
    logout: logout,
    logoutAsync: logoutAsync,
    verify: verify,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    getSession: getSession,
    getUserId: getUserId,
    getClient: getClient,
    hasCompletedOnboarding: hasCompletedOnboarding,
    validateBirthdate: validateBirthdate,
    getRoleInfo: getRoleInfo,
    getBookInfo: getBookInfo,
    ROLES: ROLES,
    BOOKS: BOOKS,
    MIN_PASSWORD: MIN_PASSWORD,
  };

  if (getSession()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        verify();
      });
    } else {
      verify();
    }
  }
})(window);
