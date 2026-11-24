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
import {
  createFamilyState,
  publicQuestion as fwPublicQuestion,
  publicScoreboard as fwPublicScoreboard,
  submitAnswer as fwSubmitAnswer,
  allAnswered as fwAllAnswered,
  advanceQuestion as fwAdvance,
  finishGame as fwFinish,
  normalizeTimeLimit,
  FW_DEFAULT_SECONDS,
} from "../games/familyWords.js";
import {
  createPluralState,
  publicQuestion as plPublicQuestion,
  submitAnswer as plSubmitAnswer,
  advanceQuestion as plAdvance,
  finishGame as plFinish,
} from "../games/pluralForms.js";
import {
  createSnakesLaddersState,
  publicSlState,
  rollDice as slRollDice,
  pickQuestion as slPickQuestion,
  answerQuestion as slAnswerQuestion,
} from "../games/snakesLadders.js";

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
    gameType: room.gameType || null,
    familySettings: room.familySettings || { timeLimit: FW_DEFAULT_SECONDS, gameType: "family-words" },
    familyGames: FAMILY_GAME_CHOICES,
  };

  if (isFamilyGame(room.game)) {
    base.game = publicFamilyState(room.game, room.players);
    if (room.status !== "playing") base.status = room.status;
    return base;
  }

  if (room.game && room.status === "playing") {
    if (room.game.type === "snakes-ladders") {
      base.game = publicSlState(room.game, room.players);
    } else {
      base.game = {
        type: room.game.type,
        index: room.game.index,
        total: room.game.questions.length,
        question: publicQuestion(room.game),
        scoreboard: publicScoreboard(room.game, room.players),
      };
    }
  }

  if (room.game && (room.status === "ended" || room.game.status === "finished")) {
    if (room.game.type === "snakes-ladders") {
      base.game = publicSlState(room.game, room.players);
      base.status = room.status === "ended" ? "ended" : room.status;
    } else {
      base.game = {
        type: room.game.type,
        finished: true,
        scoreboard: publicScoreboard(room.game, room.players),
      };
    }
  }

  return base;
}

const FAMILY_GAMES = ["family-words", "plural-forms"];
const FAMILY_GAME_CHOICES = [
  { id: "family-words", title: "Picture Match" },
  { id: "plural-forms", title: "Singular & Plural" },
];

function isFamilyGame(game) {
  return !!game && FAMILY_GAMES.includes(game.type);
}

/** The engine functions for whichever Family Words game is running. */
function familyEngine(game) {
  if (game.type === "plural-forms") {
    return { question: plPublicQuestion, submit: plSubmitAnswer, advance: plAdvance, finish: plFinish };
  }
  return { question: fwPublicQuestion, submit: fwSubmitAnswer, advance: fwAdvance, finish: fwFinish };
}

function publicFamilyState(game, players) {
  return {
    type: game.type,
    status: game.status,
    timeLimit: game.timeLimit,
    endsAt: game.endsAt,
    index: game.index,
    total: game.questions.length,
    question: game.status === "playing" ? familyEngine(game).question(game) : null,
    scoreboard: fwPublicScoreboard(game, players),
  };
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
      gameType: "a-an-swipe",
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
  setGameType(playerId, gameType) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (room.hostId !== playerId) return { ok: false, error: "Only host can set game type" };
    if (room.status !== "lobby") return { ok: false, error: "Game already started" };
    room.gameType = gameType || "a-an-swipe";
    if (gameType === "snakes-ladders") room.maxPlayers = 4;
    else room.maxPlayers = config.maxPlayersPerRoom;
    return { ok: true, room: publicRoom(room) };
  },

  /** Host sets the Family Words time limit (seconds) in the lobby. */
  setFamilySettings(playerId, settings = {}) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (room.hostId !== playerId) return { ok: false, error: "Only the host can change the game settings" };
    if (room.status !== "lobby") return { ok: false, error: "Game already started" };
    const current = room.familySettings || { timeLimit: FW_DEFAULT_SECONDS, gameType: "family-words" };
    const gameType = FAMILY_GAMES.includes(settings.gameType) ? settings.gameType : current.gameType;
    const timeLimit = settings.timeLimit != null ? normalizeTimeLimit(settings.timeLimit) : current.timeLimit;
    room.familySettings = { timeLimit, gameType };
    return { ok: true, room: publicRoom(room) };
  },

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

    const gameType = settings.gameType || room.gameType || "a-an-swipe";

    if (FAMILY_GAMES.includes(gameType)) {
      const timeLimit = normalizeTimeLimit(
        settings.timeLimit || (room.familySettings && room.familySettings.timeLimit) || FW_DEFAULT_SECONDS
      );
      const ids = room.players.map((p) => p.id);
      const game = gameType === "plural-forms"
        ? createPluralState(ids, { timeLimit })
        : createFamilyState(ids, { timeLimit });
      room.game = game;
      room.gameType = gameType;
      room.status = "playing";
      room.players.forEach((p) => { p.ready = false; });
      return {
        ok: true,
        room: publicRoom(room),
        question: familyEngine(game).question(game),
        scoreboard: fwPublicScoreboard(game, room.players),
        endsAt: game.endsAt,
        timeLimit: game.timeLimit,
      };
    }

    if (gameType === "snakes-ladders") {
      if (room.players.length < 2) {
        return { ok: false, error: "Snakes & Ladders needs 2 to 4 players" };
      }
      const ids = room.players.slice(0, 4).map((p) => p.id);
      const game = createSnakesLaddersState(ids, settings.level);
      room.game = game;
      room.gameType = "snakes-ladders";
      room.maxPlayers = 4;
      room.status = "playing";
      room.players.forEach((p) => { p.ready = false; });
      return {
        ok: true,
        room: publicRoom(room),
        sl: publicSlState(game, room.players),
      };
    }

    const game = createGameState(settings);
    ensureScores(
      game,
      room.players.map((p) => p.id)
    );

    room.game = game;
    room.gameType = "a-an-swipe";
    room.status = "playing";
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

  /** Snakes & Ladders actions */
  slRoll(playerId) {
    const room = findRoomByPlayerId(playerId);
    if (!room || !room.game || room.game.type !== "snakes-ladders") {
      return { ok: false, error: "No snakes-ladders game" };
    }
    const result = slRollDice(room.game, playerId);
    if (!result.ok) return result;
    if (room.game.status === "finished") room.status = "ended";
    return {
      ok: true,
      room: publicRoom(room),
      events: result.events,
      sl: publicSlState(room.game, room.players),
    };
  },

  slPick(playerId, questionId) {
    const room = findRoomByPlayerId(playerId);
    if (!room || !room.game || room.game.type !== "snakes-ladders") {
      return { ok: false, error: "No snakes-ladders game" };
    }
    const result = slPickQuestion(room.game, playerId, questionId);
    if (!result.ok) return result;
    return {
      ok: true,
      room: publicRoom(room),
      sl: publicSlState(room.game, room.players),
    };
  },

  slAnswer(playerId, payload) {
    const room = findRoomByPlayerId(playerId);
    if (!room || !room.game || room.game.type !== "snakes-ladders") {
      return { ok: false, error: "No snakes-ladders game" };
    }
    const result = slAnswerQuestion(room.game, playerId, payload);
    if (!result.ok) return result;
    return {
      ok: true,
      room: publicRoom(room),
      correct: result.correct,
      answer: result.answer,
      sl: publicSlState(room.game, room.players),
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

  // ─── Family Words ────────────────────────────────────────────────

  fwAnswer(playerId, choice) {
    const room = findRoomByPlayerId(playerId);
    if (!room) return { ok: false, error: "Not in a room" };
    if (!isFamilyGame(room.game) || room.status !== "playing") {
      return { ok: false, error: "No Family Words game running" };
    }
    const result = familyEngine(room.game).submit(room.game, playerId, choice);
    if (!result.ok) return result;
    return {
      ok: true,
      ...result,
      scoreboard: fwPublicScoreboard(room.game, room.players),
      everyoneAnswered: fwAllAnswered(room.game, connectedIds(room)),
      room: publicRoom(room),
      roomCode: room.code,
    };
  },

  /** Show the next picture, or finish. Called when everyone answered or the timer runs out. */
  fwNext(roomCode) {
    const room = rooms.get(normalizeRoomCode(roomCode));
    if (!room || !isFamilyGame(room.game) || room.status !== "playing") {
      return { ok: false, error: "No Family Words game running" };
    }
    const adv = familyEngine(room.game).advance(room.game);
    if (adv.done) {
      room.status = "ended";
      return {
        ok: true,
        finished: true,
        scoreboard: fwPublicScoreboard(room.game, room.players),
        room: publicRoom(room),
      };
    }
    return {
      ok: true,
      finished: false,
      question: adv.question,
      scoreboard: fwPublicScoreboard(room.game, room.players),
      room: publicRoom(room),
    };
  },

  /** Time is up: finish the game now. */
  fwForceEnd(roomCode) {
    const room = rooms.get(normalizeRoomCode(roomCode));
    if (!room || !isFamilyGame(room.game) || room.status !== "playing") {
      return { ok: false, error: "No Family Words game running" };
    }
    familyEngine(room.game).finish(room.game);
    room.status = "ended";
    return {
      ok: true,
      finished: true,
      scoreboard: fwPublicScoreboard(room.game, room.players),
      room: publicRoom(room),
    };
  },

  stats() {
    return { rooms: rooms.size };
  },
};
