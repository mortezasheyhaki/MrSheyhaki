import { generateRoomCode, normalizeRoomCode } from "./roomCodes.js";
import { config } from "../config.js";
import {
  createGameState,
  publicQuestion,
  publicScoreboard,
  ensureScores,
  submitAnswer,
  advanceQuestion,
  allAnswered,
} from "../games/aAnSwipe.js";

/** @type {Map<string, object>} */
const rooms = new Map();

function publicPlayer(p) {
  return {
    id: p.id,
    username: p.username,
    displayName: p.displayName,
    ready: !!p.ready,
    isHost: !!p.isHost,
    connected: p.connected !== false,
  };
}

function publicRoom(room) {
  const base = {
    code: room.code,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers,
    players: room.players.map(publicPlayer),
    status: room.status, // lobby | playing | ended
    createdAt: room.createdAt,
  };

  if (room.game && room.status === "playing") {
    base.game = {
      type: room.game.type,
      index: room.game.index,
      total: room.game.questions.length,
      question: publicQuestion(room.game),
      scoreboard: publicScoreboard(room.game, room.players),
    };
  }

  if (room.game && room.status === "ended") {
    base.game = {
      type: room.game.type,
      finished: true,
      scoreboard: publicScoreboard(room.game, room.players),
    };
  }

  return base;
}

function findRoomByPlayerId(playerId) {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.id === playerId)) return room;
  }
  return null;
}

function removePlayerFromRoom(room, playerId) {
  const idx = room.players.findIndex((p) => p.id === playerId);
  if (idx === -1) return;
  room.players.splice(idx, 1);

  if (room.players.length === 0) {
    rooms.delete(room.code);
    return null;
  }

  // Transfer host if needed
  if (room.hostId === playerId) {
    const next = room.players.find((p) => p.connected !== false) || room.players[0];
    room.hostId = next.id;
    room.players.forEach((p) => {
      p.isHost = p.id === next.id;
    });
  }
  return room;
}

function connectedIds(room) {
  return room.players.filter((p) => p.connected !== false).map((p) => p.id);
}

export const roomManager = {
  createRoom(player, socketId) {
    const existing = findRoomByPlayerId(player.id);
    if (existing) {
      return { ok: false, error: "Already in a room. Leave first." };
    }

    let code = generateRoomCode(config.roomCodeLength);
    while (rooms.has(code)) {
      code = generateRoomCode(config.roomCodeLength);
    }

    const host = {
      id: player.id,
      username: player.username,
      displayName: player.displayName,
      socketId,
      ready: false,
      isHost: true,
      connected: true,
    };

    const room = {
      code,
      hostId: player.id,
      maxPlayers: config.maxPlayersPerRoom,
      players: [host],
      status: "lobby",
      createdAt: Date.now(),
      game: null,
    };

    rooms.set(code, room);
    return { ok: true, room: publicRoom(room) };
  },

  joinRoom(rawCode, player, socketId) {
    const code = normalizeRoomCode(rawCode);
    if (code.length < 4) {
      return { ok: false, error: "Invalid room code" };
    }

    const existing = findRoomByPlayerId(player.id);
    if (existing) {
      if (existing.code === code) {
        const p = existing.players.find((x) => x.id === player.id);
        if (p) {
          p.socketId = socketId;
          p.connected = true;
          return { ok: true, room: publicRoom(existing), rejoined: true };
        }
      }
      return { ok: false, error: "Already in another room. Leave first." };
    }

    const room = rooms.get(code);
    if (!room) return { ok: false, error: "Room not found" };
    if (room.status !== "lobby") {
      return { ok: false, error: "Game already started" };
    }
    if (room.players.length >= room.maxPlayers) {
      return { ok: false, error: "Room is full" };
    }

    room.players.push({
      id: player.id,
      username: player.username,
      displayName: player.displayName,
      socketId,
      ready: false,
      isHost: false,
      connected: true,
    });

    return { ok: true, room: publicRoom(room) };
  },

  leaveRoom(playerId) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: true, room: null };
    const code = room.code;
    const updated = removePlayerFromRoom(room, playerId);
    return {
      ok: true,
      room: updated ? publicRoom(updated) : null,
      leftCode: code,
      roomClosed: !updated,
    };
  },

  setReady(playerId, ready) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (room.status !== "lobby") {
      return { ok: false, error: "Cannot change ready during a game" };
    }
    const p = room.players.find((x) => x.id === playerId);
    if (!p) return { ok: false, error: "Not in a room" };
    p.ready = !!ready;
    return { ok: true, room: publicRoom(room) };
  },

  getRoomForPlayer(playerId) {
    const room = findRoomByPlayerId(playerId);
    return room ? publicRoom(room) : null;
  },

  getRoomByCode(code) {
    const room = rooms.get(normalizeRoomCode(code));
    return room ? publicRoom(room) : null;
  },

  /** Internal: get raw room object (for game logic). */
  getRawRoomForPlayer(playerId) {
    return findRoomByPlayerId(playerId);
  },

  markDisconnected(socketId) {
    for (const room of rooms.values()) {
      const p = room.players.find((x) => x.socketId === socketId);
      if (!p) continue;
      p.connected = false;
      p.socketId = null;
      return { room: publicRoom(room), playerId: p.id, code: room.code };
    }
    return null;
  },

  reconnect(player, socketId) {
    const room = findRoomByPlayerId(player.id);
    if (!room) return { ok: false, error: "Not in a room" };
    const p = room.players.find((x) => x.id === player.id);
    if (!p) return { ok: false, error: "Not in a room" };
    p.socketId = socketId;
    p.connected = true;
    return { ok: true, room: publicRoom(room) };
  },

  // ─── Phase 3: Game ───────────────────────────────────────────────

  /**
   * Host starts the A or An Swipe game.
   * Requires at least 1 other player (or allow solo for testing).
   */
  startGame(playerId, settings = {}) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (room.hostId !== playerId) {
      return { ok: false, error: "Only the host can start the game" };
    }
    if (room.status !== "lobby") {
      return { ok: false, error: "Game already in progress or finished" };
    }
    if (room.players.length < 1) {
      return { ok: false, error: "Need at least one player" };
    }

    const game = createGameState(settings);
    ensureScores(
      game,
      room.players.map((p) => p.id)
    );

    room.game = game;
    room.status = "playing";
    // Reset ready flags for next lobby
    room.players.forEach((p) => {
      p.ready = false;
    });

    return {
      ok: true,
      room: publicRoom(room),
      question: publicQuestion(game),
      scoreboard: publicScoreboard(game, room.players),
    };
  },

  /**
   * Player submits an answer for the current question.
   */
  answer(playerId, answer) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (room.status !== "playing" || !room.game) {
      return { ok: false, error: "No active game" };
    }

    const result = submitAnswer(room.game, playerId, answer);
    if (!result.ok) return result;

    const scoreboard = publicScoreboard(room.game, room.players);
    const connected = connectedIds(room);
    const everyoneAnswered = allAnswered(room.game, connected);

    return {
      ok: true,
      ...result,
      scoreboard,
      everyoneAnswered,
      room: publicRoom(room),
    };
  },

  /**
   * Advance to the next question (or end the game).
   * Called by the server when time runs out or all players answered.
   */
  nextQuestion(roomCode) {
    const room = rooms.get(normalizeRoomCode(roomCode));
    if (!room || !room.game || room.status !== "playing") {
      return { ok: false, error: "No active game" };
    }

    const adv = advanceQuestion(room.game);

    if (adv.done) {
      room.status = "ended";
      return {
        ok: true,
        finished: true,
        scoreboard: publicScoreboard(room.game, room.players),
        room: publicRoom(room),
      };
    }

    return {
      ok: true,
      finished: false,
      question: adv.question,
      scoreboard: publicScoreboard(room.game, room.players),
      room: publicRoom(room),
    };
  },

  /**
   * Return to lobby after a finished game (host only).
   */
  backToLobby(playerId) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (room.hostId !== playerId) {
      return { ok: false, error: "Only the host can reset the room" };
    }
    room.status = "lobby";
    room.game = null;
    room.players.forEach((p) => {
      p.ready = false;
    });
    return { ok: true, room: publicRoom(room) };
  },

  stats() {
    return { rooms: rooms.size };
  },
};
