import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./multiplayer-server/src/config.js";
import { attachSocket } from "./multiplayer-server/src/socket.js";
import { roomManager } from "./multiplayer-server/src/rooms/roomManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.DEFAULT_APP_PORT) || 3000;

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / non-browser / AI Studio preview requests
      if (!origin) return cb(null, true);
      if (
        config.corsOrigins.includes(origin) ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".run.app")
      ) {
        return cb(null, true);
      }
      return cb(null, true);
    },
    methods: ["GET", "POST"],
  })
);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    phase: 4,
    service: "mrsheyhaki-web",
    time: new Date().toISOString(),
    rooms: roomManager.stats().rooms,
    supabaseConfigured: !!(
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !config.supabaseAnonKey.includes("your_anon")
    ),
  });
});

// Room metadata lookup so /j/:code and /multiplayer/ quick-join route to the right game
app.get("/api/rooms/:code", (req, res) => {
  const room = roomManager.getRoomByCode(req.params.code);
  if (!room) {
    return res.status(404).json({ ok: false, error: "Room not found" });
  }
  res.json({
    ok: true,
    code: room.code,
    gameType: room.gameType || "a-an-swipe",
    status: room.status,
    playerCount: Array.isArray(room.players) ? room.players.length : 0,
    maxPlayers: room.maxPlayers,
  });
});

// Apache rewrite equivalent for /j/<roomCode>
app.get("/j/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});

// Block direct web access to server/config internals
app.use((req, res, next) => {
  const rel = req.path.toLowerCase();
  if (
    rel.startsWith("/.env") ||
    rel.startsWith("/.git") ||
    rel.startsWith("/node_modules") ||
    rel.startsWith("/multiplayer-server/src") ||
    rel === "/server.js" ||
    rel === "/package.json" ||
    rel === "/package-lock.json"
  ) {
    return res.status(404).send("Not found");
  }
  next();
});

app.use(
  express.static(__dirname, {
    extensions: ["html"],
    index: ["index.html"],
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(PORT, () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT} (env=${config.nodeEnv})`);
});
