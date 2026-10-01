// One-time setup of the two progress tables (run on YOUR computer, never commit the key).
//
//   npm install node-appwrite
//   APPWRITE_API_KEY=xxxxx node tools/appwrite-setup.mjs
//
// API key scopes needed: databases.read/write, tables.read/write, columns.read/write,
// indexes.read/write.  Safe to re-run: existing tables/columns are skipped.
import { Client, TablesDB, Permission, Role } from "node-appwrite";

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "6aafc5370019ebd5da7c";
const DATABASE_ID = "6aafc5ce0007461d09d3";
if (!process.env.APPWRITE_API_KEY) { console.error("Set APPWRITE_API_KEY first."); process.exit(1); }

const db = new TablesDB(new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(process.env.APPWRITE_API_KEY));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (e) => e && (e.code === 409);

const S = (key, size, required = false) => ({ t: "s", key, size, required });
const I = (key) => ({ t: "i", key });
const B = (key) => ({ t: "b", key });

const TABLES = {
  progress: [
    S("userId", 36, true), S("gameId", 128, true), S("gameName", 128), S("category", 64), S("unit", 128),
    I("attempts"), I("completions"), I("totalTimeSeconds"), I("bestTimeSeconds"), I("bestStars"),
    I("bestScore"), I("bestMaxScore"), I("bestAccuracy"),
    I("latestScore"), I("latestMaxScore"), I("latestAccuracy"),
    I("firstPlayedAt"), I("lastPlayedAt"),
  ],
  attempts: [
    S("userId", 36, true), S("gameId", 128, true), S("gameName", 128), S("category", 64), S("unit", 128),
    I("score"), I("maxScore"), I("accuracy"), B("completed"), I("timeSeconds"), I("stars"), I("at"),
  ],
};

async function ensureTable(tableId) {
  try {
    await db.createTable({
      databaseId: DATABASE_ID, tableId, name: tableId,
      // Table level: signed-in users may CREATE rows. Nobody can read/update/delete at table level.
      permissions: [Permission.create(Role.users())],
      rowSecurity: true, // reading/updating is decided per row (owner only) — set by progress.js
    });
    console.log("created table", tableId);
  } catch (e) { if (!exists(e)) throw e; console.log("table exists:", tableId); }
}

async function ensureColumn(tableId, c) {
  const base = { databaseId: DATABASE_ID, tableId, key: c.key };
  try {
    if (c.t === "s") await db.createStringColumn({ ...base, size: c.size, required: c.required });
    if (c.t === "i") await db.createIntegerColumn({ ...base, required: false });
    if (c.t === "b") await db.createBooleanColumn({ ...base, required: false });
    console.log("  + column", tableId + "." + c.key);
  } catch (e) { if (!exists(e)) throw e; }
}

async function ensureIndex(tableId, key, columns, type = "key") {
  for (let i = 0; i < 20; i++) {
    try { await db.createIndex({ databaseId: DATABASE_ID, tableId, key, type, columns }); console.log("  + index", tableId + "." + key); return; }
    catch (e) { if (exists(e)) return; await sleep(1500); } // columns are created asynchronously
  }
  console.warn("  ! could not create index", tableId + "." + key, "— add it in the console (Indexes tab).");
}

for (const [tableId, cols] of Object.entries(TABLES)) {
  await ensureTable(tableId);
  for (const c of cols) await ensureColumn(tableId, c);
}
await sleep(3000);
await ensureIndex("progress", "idx_user", ["userId"]);
await ensureIndex("attempts", "idx_user", ["userId"]);
await ensureIndex("attempts", "idx_user_game", ["userId", "gameId"]);
console.log("\nDone. Now follow APPWRITE-SETUP.md steps 2–4 (Auth, Web platform, test).");
