import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
  }
  if (config.supabaseAnonKey.includes("your_anon")) {
    throw new Error("Replace SUPABASE_ANON_KEY in .env with your real anon key");
  }
  supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabase;
}

/**
 * Verify a Supabase access token and return a safe player object.
 * Never trust client-supplied userId / username without this.
 */
export async function verifyAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== "string") {
    return { ok: false, error: "Missing access token" };
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb.auth.getUser(accessToken);

    if (error || !data?.user) {
      return {
        ok: false,
        error: error?.message || "Invalid or expired session",
      };
    }

    const user = data.user;
    const meta = user.user_metadata || {};
    const username =
      meta.username ||
      (user.email ? String(user.email).split("@")[0] : "") ||
      "player";
    const displayName =
      meta.display_name || meta.displayName || username;

    return {
      ok: true,
      player: {
        id: user.id,
        username: String(username).slice(0, 32),
        displayName: String(displayName).slice(0, 48),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Auth verification failed",
    };
  }
}
