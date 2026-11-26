import { verifyAccessToken } from "./auth/verifyPlayer.js";
import { roomManager } from "./rooms/roomManager.js";
import { privatePenaltyState } from "./games/penaltyShootout.js";

/**
 * Phase 3 socket API
 *
 * Client must connect with:
 *   io(url, { auth: { token: supabaseAccessToken } })
 *
 * Lobby events (client → server):
 *   room:create
 *   room:join       { code }
 *   room:leave
 *   room:setReady   { ready: boolean }
 *   room:sync
 *   client:ping
 *
 * Game events (client → server):
 *   game:start      (host only)  optional { questionCount, timePerQuestion }
 *   game:answer     { answer: "a" | "an" }
 *   game:next       (host only — force next question, mainly for testing)
 *   game:backToLobby (host only)
 *
 * Events (server → client):
 *   server:hello
 *   room:update
 *   room:error      { error }
 *   game:question   { index, total, word, timeLimit, startedAt }
 *   game:answerResult { playerId, correct, points, article, word, scoreboard }
 *   game:scoreboard
 *   game:end        { scoreboard }
 *   server:pong
 */

function roomChannel(code) {
  return `room:${code}`;
}

function emitRoom(io, room) {
  if (!room) return;
  io.to(roomChannel(room.code)).emit("room:update", room);
}

export function attachSocket(io) {
  // Authenticate every connection
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

      const result = await verifyAccessToken(token);
      if (!result.ok) {
        return next(new Error(result.error || "Unauthorized"));
      }
      socket.data.player = result.player;
      return next();
    } catch (e) {
      return next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    const player = socket.data.player;
    const brief = player.username || socket.id.slice(0, 8);
    console.log(`[socket] ${brief} connected (${socket.id.slice(0, 8)})`);

    // Auto-reconnect into existing room if any
    const recon = roomManager.reconnect(player, socket.id);
    if (recon.ok) {
      socket.join(roomChannel(recon.room.code));
      socket.emit("room:update", recon.room);
      emitRoom(io, recon.room);
      syncPenaltyForPlayer(socket, recon.room.code, player.id);
    }

    socket.emit("server:hello", {
      ok: true,
      phase: 4,
      features: ["family-words", "tictactoe-should", "penalty-shootout"],
      message: "Authenticated multiplayer server — A or An + Snakes & Ladders + Family Words + Tic-Tac-Toe ready",
      player: {
        id: player.id,
        username: player.username,
        displayName: player.displayName,
      },
    });

    socket.on("client:ping", (payload, ack) => {
      const pong = { ok: true, echo: payload ?? null, serverTime: Date.now() };
      if (typeof ack === "function") ack(pong);
      else socket.emit("server:pong", pong);
    });

    // ── Lobby ──────────────────────────────────────────────────────

    socket.on("room:create", (payload, ack) => {
      const result = roomManager.createRoom(player, socket.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      if (payload?.gameType) {
        const gt = roomManager.setGameType(player.id, payload.gameType);
        if (gt.ok) result.room = gt.room;
      }
      if (payload?.topic) {
        const tp = roomManager.setSlTopic(player.id, payload.topic);
        if (tp.ok) result.room = tp.room;
      }
      socket.join(roomChannel(result.room.code));
      socket.emit("room:update", result.room);
      if (typeof ack === "function") ack(result);
      console.log(`[room] ${brief} created ${result.room.code}`);
    });

    socket.on("room:join", (payload, ack) => {
      const code = payload?.code;
      const result = roomManager.joinRoom(code, player, socket.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      socket.join(roomChannel(result.room.code));
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
      console.log(`[room] ${brief} joined ${result.room.code}`);
    });

    socket.on("room:leave", (_payload, ack) => {
      const result = roomManager.leaveRoom(player.id);
      if (result.leftCode) {
        socket.leave(roomChannel(result.leftCode));
        clearTttTimer(result.leftCode);
        clearPenaltyTimer(result.leftCode);
        if (result.room) emitRoom(io, result.room);
      }
      if (typeof ack === "function") ack(result);
      console.log(`[room] ${brief} left`);
    });

    socket.on("room:setReady", (payload, ack) => {
      const result = roomManager.setReady(player.id, !!payload?.ready);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("room:sync", (_payload, ack) => {
      const room = roomManager.getRoomForPlayer(player.id);
      if (room) socket.emit("room:update", room);
      if (typeof ack === "function") ack({ ok: true, room });
    });

    // ── Game (Phase 3) ─────────────────────────────────────────────

    
    // Dedicated Snakes & Ladders start (avoids A/An path entirely)
    socket.on("sl:start", (payload, ack) => {
      const result = roomManager.startGame(player.id, {
        gameType: "snakes-ladders",
        level: payload?.level,
        topic: payload?.topic,
      });
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      const room = result.room;
      emitRoom(io, room);
      io.to(roomChannel(room.code)).emit("sl:update", { sl: result.sl || room.game });
      console.log(`[game] ${brief} started Snakes & Ladders (sl:start) in ${room.code}`);
      if (typeof ack === "function") ack(result);
    });

socket.on("game:start", (payload, ack) => {
      const settings = {};
      if (payload?.questionCount) settings.questionCount = Number(payload.questionCount);
      if (payload?.timePerQuestion) settings.timePerQuestion = Number(payload.timePerQuestion);
      if (payload?.gameType) settings.gameType = payload.gameType;

      const result = roomManager.startGame(player.id, settings);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }

      const room = result.room;
      emitRoom(io, room);

      // Snakes & Ladders — no question timer / A-An events
      if (room.game && room.game.type === "snakes-ladders") {
        io.to(roomChannel(room.code)).emit("sl:update", { sl: result.sl || room.game });
        console.log(`[game] ${brief} started Snakes & Ladders in ${room.code}`);
        if (typeof ack === "function") ack(result);
        return;
      }

      // A or An Swipe
      io.to(roomChannel(room.code)).emit("game:question", result.question);
      io.to(roomChannel(room.code)).emit("game:scoreboard", result.scoreboard);

      console.log(`[game] ${brief} started A/An in ${room.code}`);
      if (typeof ack === "function") ack(result);

      if (result.question && result.question.timeLimit) {
        scheduleQuestionTimer(io, room.code, result.question.timeLimit);
      }
    });

    socket.on("game:answer", (payload, ack) => {
      const result = roomManager.answer(player.id, payload?.answer);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }

      // Tell the answering player their result immediately
      socket.emit("game:answerResult", {
        playerId: player.id,
        correct: result.correct,
        points: result.points,
        article: result.article,
        word: result.word,
        scoreboard: result.scoreboard,
      });

      // Update scoreboard for everyone
      const room = result.room;
      io.to(roomChannel(room.code)).emit("game:scoreboard", result.scoreboard);

      if (typeof ack === "function") ack(result);

      // If everyone answered → advance early
      if (result.everyoneAnswered) {
        clearQuestionTimer(room.code);
        doNextQuestion(io, room.code);
      }
    });

    socket.on("game:next", (_payload, ack) => {
      // Host can force next (useful for testing)
      const room = roomManager.getRoomForPlayer(player.id);
      if (!room || room.hostId !== player.id) {
        const err = { ok: false, error: "Only host can force next" };
        socket.emit("room:error", { error: err.error });
        if (typeof ack === "function") ack(err);
        return;
      }
      clearQuestionTimer(room.code);
      const result = doNextQuestion(io, room.code);
      if (typeof ack === "function") ack(result);
    });

    socket.on("game:backToLobby", (_payload, ack) => {
      const result = roomManager.backToLobby(player.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      clearPenaltyTimer(result.room.code);
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
      console.log(`[game] ${brief} returned room ${result.room.code} to lobby`);
    });

    
    // ── Snakes & Ladders ───────────────────────────────────────────
    socket.on("room:setGameType", (payload, ack) => {
      const result = roomManager.setGameType(player.id, payload?.gameType);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("sl:setTopic", (payload, ack) => {
      const result = roomManager.setSlTopic(player.id, payload?.topic);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("sl:roll", (_payload, ack) => {
      const result = roomManager.slRoll(player.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      io.to(roomChannel(result.room.code)).emit("sl:update", {
        sl: result.sl,
        events: result.events || [],
      });
      if (typeof ack === "function") ack(result);
    });

    socket.on("sl:pick", (payload, ack) => {
      const result = roomManager.slPick(player.id, payload?.questionId);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      io.to(roomChannel(result.room.code)).emit("sl:update", { sl: result.sl });
      if (typeof ack === "function") ack(result);
    });

    socket.on("sl:answer", (payload, ack) => {
      const result = roomManager.slAnswer(player.id, payload);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      io.to(roomChannel(result.room.code)).emit("sl:update", {
        sl: result.sl,
        correct: result.correct,
        answer: result.answer,
      });
      if (typeof ack === "function") ack(result);
    });


    // ── Family Words (Picture Match) ───────────────────────────────

    socket.on("fw:settings", (payload, ack) => {
      // payload: { timeLimit?, gameType? } — the host picks the game and the time
      const result = roomManager.setFamilySettings(player.id, payload || {});
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("fw:start", (_payload, ack) => {
      const raw = roomManager.getRawRoomForPlayer(player.id);
      const gameType = (raw && raw.familySettings && raw.familySettings.gameType) || "family-words";
      const result = roomManager.startGame(player.id, { gameType });
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      const room = result.room;
      emitRoom(io, room);
      io.to(roomChannel(room.code)).emit("fw:question", {
        question: result.question,
        endsAt: result.endsAt,
        timeLimit: result.timeLimit,
      });
      io.to(roomChannel(room.code)).emit("fw:scoreboard", { scoreboard: result.scoreboard });
      scheduleFamilyEnd(io, room.code, result.timeLimit);
      console.log(`[game] ${brief} started ${gameType} in ${room.code} (${result.timeLimit}s)`);
      if (typeof ack === "function") ack(result);
    });

    socket.on("fw:answer", (payload, ack) => {
      const result = roomManager.fwAnswer(player.id, payload?.choice);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      // the player who answered gets their own result straight away
      socket.emit("fw:result", {
        correct: result.correct,
        points: result.points,
        label: result.label,
        audio: result.audio,
        ms: result.ms,
      });
      io.to(roomChannel(result.roomCode)).emit("fw:scoreboard", { scoreboard: result.scoreboard });
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
      // everyone answered: show the next picture after a short pause
      if (result.everyoneAnswered) scheduleFamilyNext(io, result.roomCode, 1200);
    });

    // ── Tic-Tac-Toe (Should) ───────────────────────────────────────

    socket.on("ttt:start", (_payload, ack) => {
      const result = roomManager.tttStart(player.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      clearTttTimer(result.room.code);
      emitRoom(io, result.room);
      console.log(`[game] ${brief} started Tic-Tac-Toe (Should) in ${result.room.code}`);
      if (typeof ack === "function") ack(result);
    });

    socket.on("ttt:rps", (payload, ack) => {
      const result = roomManager.tttRps(player.id, payload?.choice);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
      if (result.resolved && !result.tie) {
        scheduleTttTurnStart(io, result.roomCode, 1600);
      }
    });

    socket.on("ttt:answer", (payload, ack) => {
      const result = roomManager.tttAnswer(player.id, payload || {});
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("ttt:cant", (_payload, ack) => {
      const result = roomManager.tttCant(player.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("ttt:mark", (payload, ack) => {
      const result = roomManager.tttMark(player.id, payload?.cell);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("ttt:rematch", (_payload, ack) => {
      const result = roomManager.tttRematch(player.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      clearTttTimer(result.room.code);
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    // ── Penalty Shootout (online) ──────────────────────────────────
    socket.on("ps:settings", (payload, ack) => {
      const result = roomManager.penaltySettings(player.id, payload || {});
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
    });

    socket.on("ps:start", (_payload, ack) => {
      const result = roomManager.penaltyStart(player.id, Date.now());
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      const code = result.room.code;
      emitRoom(io, result.room);
      emitPenalty(io, code);
      console.log(`[game] ${brief} started Penalty Shootout in ${code}`);
      if (typeof ack === "function") ack(result);
    });

    socket.on("ps:answer", (payload, ack) => {
      const result = roomManager.penaltyAnswer(player.id, payload?.answer, Date.now());
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitPenalty(io, result.code);
      if (typeof ack === "function") ack({ ok: true, correct: result.correct });
    });

    socket.on("ps:pick", (payload, ack) => {
      const result = roomManager.penaltyPick(player.id, payload?.zone, Date.now());
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }
      emitPenalty(io, result.code);
      if (typeof ack === "function") ack({ ok: true });
    });

    socket.on("ps:sync", (_payload, ack) => {
      const code = roomManager.penaltyPlayerRoomCode(player.id);
      if (code) syncPenaltyForPlayer(socket, code, player.id);
      if (typeof ack === "function") ack({ ok: true });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] ${brief} disconnected (${reason})`);
      const info = roomManager.markDisconnected(socket.id);
      if (info?.room) emitRoom(io, info.room);
    });
  });
}

// ── Question timers (in-memory) ────────────────────────────────────
const questionTimers = new Map();

function scheduleQuestionTimer(io, roomCode, seconds) {
  clearQuestionTimer(roomCode);
  const ms = Math.max(3, Number(seconds) || 8) * 1000;
  const t = setTimeout(() => {
    questionTimers.delete(roomCode);
    doNextQuestion(io, roomCode);
  }, ms);
  questionTimers.set(roomCode, t);
}

function clearQuestionTimer(roomCode) {
  const t = questionTimers.get(roomCode);
  if (t) {
    clearTimeout(t);
    questionTimers.delete(roomCode);
  }
}

function doNextQuestion(io, roomCode) {
  const result = roomManager.nextQuestion(roomCode);
  if (!result.ok) return result;

  if (result.finished) {
    io.to(roomChannel(roomCode)).emit("game:end", {
      scoreboard: result.scoreboard,
    });
    io.to(roomChannel(roomCode)).emit("room:update", result.room);
    console.log(`[game] room ${roomCode} finished`);
    return result;
  }

  io.to(roomChannel(roomCode)).emit("game:question", result.question);
  io.to(roomChannel(roomCode)).emit("game:scoreboard", result.scoreboard);
  io.to(roomChannel(roomCode)).emit("room:update", result.room);

  scheduleQuestionTimer(io, roomCode, result.question.timeLimit);
  return result;
}

// ── Family Words timers (in-memory) ───────────────────────────────
const familyTimers = new Map(); // room code -> { end, next }

function familyEntry(code) {
  if (!familyTimers.has(code)) familyTimers.set(code, {});
  return familyTimers.get(code);
}

function scheduleFamilyEnd(io, roomCode, seconds) {
  const entry = familyEntry(roomCode);
  if (entry.end) clearTimeout(entry.end);
  entry.end = setTimeout(() => endFamily(io, roomCode), Math.max(1, Number(seconds) || 90) * 1000 + 300);
}

function scheduleFamilyNext(io, roomCode, ms) {
  const entry = familyEntry(roomCode);
  if (entry.next) clearTimeout(entry.next);
  entry.next = setTimeout(() => doFamilyNext(io, roomCode), ms);
}

function clearFamilyTimers(roomCode) {
  const entry = familyTimers.get(roomCode);
  if (!entry) return;
  if (entry.end) clearTimeout(entry.end);
  if (entry.next) clearTimeout(entry.next);
  familyTimers.delete(roomCode);
}

function endFamily(io, roomCode) {
  clearFamilyTimers(roomCode);
  const r = roomManager.fwForceEnd(roomCode);
  if (!r.ok) return;
  io.to(roomChannel(roomCode)).emit("fw:end", { scoreboard: r.scoreboard });
  io.to(roomChannel(roomCode)).emit("room:update", r.room);
  console.log(`[game] Family Words in ${roomCode} finished (time)`);
}

function doFamilyNext(io, roomCode) {
  const entry = familyTimers.get(roomCode);
  if (entry && entry.next) { clearTimeout(entry.next); entry.next = null; }
  const r = roomManager.fwNext(roomCode);
  if (!r.ok) return;
  if (r.finished) {
    clearFamilyTimers(roomCode);
    io.to(roomChannel(roomCode)).emit("fw:end", { scoreboard: r.scoreboard });
    io.to(roomChannel(roomCode)).emit("room:update", r.room);
    console.log(`[game] Family Words in ${roomCode} finished (all pictures)`);
    return;
  }
  io.to(roomChannel(roomCode)).emit("fw:question", { question: r.question });
  io.to(roomChannel(roomCode)).emit("fw:scoreboard", { scoreboard: r.scoreboard });
  io.to(roomChannel(roomCode)).emit("room:update", r.room);
}

// ── Tic-Tac-Toe RPS reveal timers (in-memory) ──────────────────────
const tttTimers = new Map();

function clearTttTimer(roomCode) {
  const t = tttTimers.get(roomCode);
  if (t) {
    clearTimeout(t);
    tttTimers.delete(roomCode);
  }
}

function scheduleTttTurnStart(io, roomCode, ms = 1600) {
  clearTttTimer(roomCode);
  const t = setTimeout(() => {
    tttTimers.delete(roomCode);
    const res = roomManager.tttEnterTurns(roomCode);
    if (res.ok && res.room) {
      emitRoom(io, res.room);
    }
  }, ms);
  tttTimers.set(roomCode, t);
}

// ── Penalty Shootout timers and private views (in-memory) ──────────
const penaltyTimers = new Map();

function clearPenaltyTimer(roomCode) {
  const t = penaltyTimers.get(roomCode);
  if (t) {
    clearTimeout(t);
    penaltyTimers.delete(roomCode);
  }
}

// Send the room view to everyone, and each player their own question.
function emitPenalty(io, roomCode) {
  const room = roomManager.getRoomByCode(roomCode);
  if (room) io.to(roomChannel(roomCode)).emit("room:update", room);
  const now = Date.now();
  for (const t of roomManager.penaltyPrivateTargets(roomCode)) {
    io.to(t.socketId).emit("ps:private", privatePenaltyState(t.game, t.playerId, now));
  }
  schedulePenaltyTimer(io, roomCode);
}

// Wake up at the next deadline (question or corner timeout, or the next kick).
function schedulePenaltyTimer(io, roomCode) {
  clearPenaltyTimer(roomCode);
  const at = roomManager.penaltyNextDeadline(roomCode);
  if (!at) return;
  const t = setTimeout(() => {
    penaltyTimers.delete(roomCode);
    roomManager.penaltyAdvance(roomCode, Date.now());
    emitPenalty(io, roomCode);
  }, Math.max(0, at - Date.now()) + 15);
  penaltyTimers.set(roomCode, t);
}

function syncPenaltyForPlayer(socket, roomCode, playerId) {
  const target = roomManager.penaltyPrivateTargets(roomCode).find((t) => t.playerId === playerId);
  if (!target) return;
  socket.emit("ps:private", privatePenaltyState(target.game, playerId, Date.now()));
}
