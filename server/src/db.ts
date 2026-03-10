import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import env from "./utils/env.js";

const dbPath = env.DB_PATH ?? "data/app.db"
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

export const db = new Database(dbPath)

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}
