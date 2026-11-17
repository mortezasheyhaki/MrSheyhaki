import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { attachSocket } from "./socket.js";
import { roomManager } from "./rooms/roomManager.js";

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (config.corsOrigins.includes(origin)) return cb(null, true);
      console.warn(`[cors] blocked origin: ${origin}`);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  })
);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    phase: 3,
    service: "mrsheyhaki-multiplayer",
    time: new Date().toISOString(),
    rooms: roomManager.stats().rooms,
    supabaseConfigured: !!(config.supabaseUrl && config.supabaseAnonKey && !config.supabaseAnonKey.includes("your_anon")),
  });
});

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Multiplayer server</title></head>
<body style="font-family:system-ui;padding:2rem">
  <h1>MrSheyhaki multiplayer server</h1>
  <p>Phase 3 — A or An Swipe. <a href="/health">/health</a></p>
</body></html>`);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(config.port, () => {
  console.log(`[server] phase 3 listening on :${config.port} (env=${config.nodeEnv})`);
  console.log(`[server] CORS: ${config.corsOrigins.join(", ")}`);
  console.log(
    `[server] Supabase: ${config.supabaseUrl ? "URL set" : "MISSING URL"} / key ${
      config.supabaseAnonKey && !config.supabaseAnonKey.includes("your_anon") ? "set" : "MISSING"
    }`
  );
});
