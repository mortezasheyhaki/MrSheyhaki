import dotenv from "dotenv";
dotenv.config();

function parseOrigins(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEFAULT_SUPABASE_URL = "https://ezlcrygimvceusmnojgk.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bGNyeWdpbXZjZXVzbW5vamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNjU4NjQsImV4cCI6MjEwOTk0MTg2NH0.R3a0dMRDCHaAbDKRGhLssvYfg8HzcEb5ODF5xfUt_Ys";

function validEnv(val) {
  const s = String(val || "").trim();
  if (!s) return "";
  const low = s.toLowerCase();
  if (low.includes("your_") || low.includes("your-")) return "";
  return s;
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS ||
      "http://localhost:5500,http://127.0.0.1:5500,https://mrsheyhaki.ir,https://www.mrsheyhaki.ir"
  ),
  supabaseUrl: validEnv(process.env.SUPABASE_URL) || DEFAULT_SUPABASE_URL,
  supabaseAnonKey: validEnv(process.env.SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY,
  maxPlayersPerRoom: 10,
  roomCodeLength: 6,
};
