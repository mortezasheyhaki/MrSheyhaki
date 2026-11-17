import dotenv from "dotenv";
dotenv.config();

function parseOrigins(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS ||
      "http://localhost:5500,http://127.0.0.1:5500,https://mrsheyhaki.ir,https://www.mrsheyhaki.ir"
  ),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  maxPlayersPerRoom: 10,
  roomCodeLength: 6,
};
