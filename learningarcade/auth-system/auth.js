/**
 * Learning Arcade — Auth (username + password) on Supabase Auth
 * Public API: window.LAAuth  (same shape as the old Appwrite version)
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
  var SUPABASE_ANON_KEY = "sb_publishable_aPyfAl2ErhMN5awDrQTZnQ_gR0-0sDr";
  // =======================================

  var EMAIL_DOMAIN = "players.mrsheyhaki.ir";
  var MIN_PASSWORD = 8;
  var SESSION_KEY = "laAuthSession";

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
      initError = "Supabase SDK not loaded";
      console.warn("[LAAuth]", initError);
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

  function saveSessionFromUser(user) {
    notifyAccountChanged();
    if (!user) return;
    var meta = user.user_metadata || {};
    var username =
      meta.username || usernameFromEmail(user.email) || "";
    var displayName =
      meta.display_name || meta.displayName || user.email && usernameFromEmail(user.email) || username;
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: user.id,
          username: username,
          displayName: displayName,
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
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
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

  async function register(username, password, displayName) {
    if (!init()) return { ok: false, error: initError || "Not ready" };
    var clean = sanitizeUsername(username);
    if (clean.length < 3) return { ok: false, error: "Username must be at least 3 characters" };
    if (!password || password.length < MIN_PASSWORD) {
      return { ok: false, error: "Password must be at least " + MIN_PASSWORD + " characters" };
    }
    var name = String(displayName || clean).trim().slice(0, 32) || clean;
    try {
      var res = await sb.auth.signUp({
        email: emailFor(clean),
        password: password,
        options: {
          data: {
            username: clean,
            display_name: name,
          },
        },
      });
      if (res.error) return { ok: false, error: mapAuthError(res.error) };
      var user = res.data && res.data.user;
      // If email confirm is still ON, session may be null
      if (res.data && res.data.session && user) {
        saveSessionFromUser(user);
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
        return { ok: true, player: getSession() };
      }
      return { ok: false, error: "Could not create account. Try again." };
    } catch (e) {
      console.warn("[LAAuth] register error", e);
      return { ok: false, error: mapAuthError(e) };
    }
  }

  async function login(username, password) {
    if (!init()) return { ok: false, error: initError || "Not ready" };
    var clean = sanitizeUsername(username);
    if (!clean || !password) return { ok: false, error: "Please enter username and password" };
    try {
      var res = await sb.auth.signInWithPassword({
        email: emailFor(clean),
        password: password,
      });
      if (res.error) return { ok: false, error: mapAuthError(res.error) };
      saveSessionFromUser(res.data.user);
      return { ok: true, player: getSession() };
    } catch (e) {
      console.warn("[LAAuth] login error", e);
      return { ok: false, error: mapAuthError(e) };
    }
  }

  /** Kept for login.html compatibility — no Appwrite legacy table on Supabase. */
  async function upgradeLegacy(username, oldPassword, newPassword) {
    if (!newPassword || newPassword.length < MIN_PASSWORD) {
      return { ok: false, error: "New password must be at least " + MIN_PASSWORD + " characters" };
    }
    // Try login with old password then update — only works if account already exists on Supabase
    var logged = await login(username, oldPassword);
    if (!logged.ok) {
      return {
        ok: false,
        error: "This old Appwrite account is not on Supabase yet. Please Register a new account.",
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
      done = sb.auth.signOut().catch(function () {});
    }
    clearSession();
    notifyAccountChanged();
    return { ok: true, done: done };
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

  global.LAAuth = {
    register: register,
    login: login,
    upgradeLegacy: upgradeLegacy,
    logout: logout,
    verify: verify,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    getSession: getSession,
    getUserId: getUserId,
    getClient: getClient,
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
