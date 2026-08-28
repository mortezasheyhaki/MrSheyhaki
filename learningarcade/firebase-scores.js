/**
 * Learning Arcade — Firebase scoreboard helper
 * Anonymous Auth + Realtime Database
 *
 * Load BEFORE this file:
 *   firebase-app-compat.js
 *   firebase-auth-compat.js
 *   firebase-database-compat.js
 */
(function (global) {
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyCfi-KNp1JLIpD_V4-t0Zx5uumDuQcgC38',
    authDomain: 'mr-sheyhaki-learning-arcade.firebaseapp.com',
    databaseURL: 'https://mr-sheyhaki-learning-arcade-default-rtdb.firebaseio.com',
    projectId: 'mr-sheyhaki-learning-arcade',
    storageBucket: 'mr-sheyhaki-learning-arcade.firebasestorage.app',
    messagingSenderId: '756007337544',
    appId: '1:756007337544:web:26d42564530b5d4535a27d',
    measurementId: 'G-VH1NZ42VM9'
  };

  var NAME_KEY = 'laPlayerName';
  var app = null;
  var db = null;
  var auth = null;
  var ready = false;
  var initError = null;
  var authPromise = null;

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (typeof firebase === 'undefined') {
      initError = 'Firebase SDK not loaded';
      return false;
    }
    try {
      if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
      } else {
        app = firebase.app();
      }
      db = firebase.database();
      auth = firebase.auth();
      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      console.warn('[LAScores]', initError);
      return false;
    }
  }

  /** Ensure anonymous user is signed in. Returns Promise<User|null> */
  function ensureAuth() {
    if (!init()) {
      return Promise.reject(new Error(initError || 'Firebase not ready'));
    }
    if (auth.currentUser) {
      return Promise.resolve(auth.currentUser);
    }
    if (authPromise) return authPromise;

    authPromise = auth
      .signInAnonymously()
      .then(function (cred) {
        authPromise = null;
        return cred.user;
      })
      .catch(function (err) {
        authPromise = null;
        console.warn('[LAScores] anonymous sign-in failed', err);
        throw err;
      });

    return authPromise;
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

  /**
   * Submit a score (signs in anonymously if needed).
   * Returns Promise<{ ok, error?, key?, data? }>
   */
  function submit(opts) {
    opts = opts || {};

    var name = (opts.name != null ? String(opts.name) : getPlayerName()).trim().slice(0, 32);
    if (!name) {
      return Promise.resolve({ ok: false, error: 'Please enter a name' });
    }
    setPlayerName(name);

    var gameId = sanitizeGameId(opts.gameId);
    var score = Number(opts.score);
    if (!isFinite(score)) score = 0;
    score = Math.max(0, Math.round(score));

    return ensureAuth()
      .then(function (user) {
        var payload = {
          name: name,
          score: score,
          maxScore: opts.maxScore != null ? Number(opts.maxScore) : null,
          gameName: opts.gameName || gameId,
          uid: user && user.uid ? user.uid : null,
          at: Date.now(),
          iso: new Date().toISOString()
        };

        var ref = db.ref('scores/' + gameId).push();
        return ref.set(payload).then(function () {
          return { ok: true, key: ref.key, data: payload };
        });
      })
      .catch(function (err) {
        console.warn('[LAScores] submit failed', err);
        var msg = err && err.message ? err.message : String(err);
        if (err && err.code === 'auth/admin-restricted-operation') {
          msg = 'Anonymous sign-in is disabled in Firebase Console.';
        }
        if (err && (err.code === 'PERMISSION_DENIED' || /permission/i.test(msg))) {
          msg = 'Database permission denied. Update Realtime Database rules.';
        }
        return { ok: false, error: msg };
      });
  }

  function top(gameId, limit) {
    if (!init()) return Promise.resolve([]);
    limit = limit || 20;
    var id = sanitizeGameId(gameId);

    // Read can work without auth if rules allow; still try auth for consistency
    return ensureAuth()
      .catch(function () { return null; })
      .then(function () {
        return db
          .ref('scores/' + id)
          .orderByChild('score')
          .limitToLast(limit)
          .once('value');
      })
      .then(function (snap) {
        var rows = [];
        if (!snap) return rows;
        snap.forEach(function (child) {
          var v = child.val() || {};
          rows.push({
            key: child.key,
            name: v.name || 'Player',
            score: Number(v.score) || 0,
            maxScore: v.maxScore,
            gameName: v.gameName,
            uid: v.uid || null,
            at: v.at || 0,
            iso: v.iso || ''
          });
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
    return ensureAuth()
      .catch(function () { return null; })
      .then(function () {
        return db.ref('scores').once('value');
      })
      .then(function (snap) {
        var ids = [];
        if (!snap) return ids;
        snap.forEach(function (child) {
          ids.push(child.key);
        });
        return ids;
      })
      .catch(function () {
        return [];
      });
  }


  /**
   * All scores for the current anonymous user (or by display name fallback).
   * Returns Promise<Array<{gameId, name, score, maxScore, gameName, at, uid}>>
   */
  function myScores() {
    if (!init()) return Promise.resolve([]);
    return ensureAuth()
      .then(function (user) {
        var uid = user && user.uid ? user.uid : null;
        var name = getPlayerName().toLowerCase();
        return db.ref('scores').once('value').then(function (snap) {
          var rows = [];
          if (!snap) return rows;
          snap.forEach(function (gameSnap) {
            var gameId = gameSnap.key;
            gameSnap.forEach(function (child) {
              var v = child.val() || {};
              var matchUid = uid && v.uid === uid;
              var matchName = name && String(v.name || '').toLowerCase() === name;
              if (matchUid || matchName) {
                rows.push({
                  key: child.key,
                  gameId: gameId,
                  name: v.name || 'Player',
                  score: Number(v.score) || 0,
                  maxScore: v.maxScore,
                  gameName: v.gameName || gameId,
                  uid: v.uid || null,
                  at: v.at || 0,
                  iso: v.iso || ''
                });
              }
            });
          });
          rows.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
          return rows;
        });
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
