import { verifyAccessToken } from "./auth/verifyPlayer.js";
import { roomManager } from "./rooms/roomManager.js";

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
    }

    socket.emit("server:hello", {
      ok: true,
      phase: 3,
      message: "Authenticated multiplayer server — A or An Swipe ready",
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

    socket.on("room:create", (_payload, ack) => {
      const result = roomManager.createRoom(player, socket.id);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
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

    socket.on("game:start", (payload, ack) => {
      const settings = {};
      if (payload?.questionCount) settings.questionCount = Number(payload.questionCount);
      if (payload?.timePerQuestion) settings.timePerQuestion = Number(payload.timePerQuestion);

      const result = roomManager.startGame(player.id, settings);
      if (!result.ok) {
        socket.emit("room:error", { error: result.error });
        if (typeof ack === "function") ack(result);
        return;
      }

      const room = result.room;
      emitRoom(io, room);

      // Broadcast first question to the whole room
      io.to(roomChannel(room.code)).emit("game:question", result.question);
      io.to(roomChannel(room.code)).emit("game:scoreboard", result.scoreboard);

      console.log(`[game] ${brief} started A/An in ${room.code}`);
      if (typeof ack === "function") ack(result);

      // Auto-advance when time is up
      scheduleQuestionTimer(io, room.code, result.question.timeLimit);
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
      emitRoom(io, result.room);
      if (typeof ack === "function") ack(result);
      console.log(`[game] ${brief} returned room ${result.room.code} to lobby`);
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
