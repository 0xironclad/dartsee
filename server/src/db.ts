import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import env from "./utils/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../");

const dbPath = path.resolve(rootDir, env.DB_PATH ?? "data/app.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function isSeeded(): boolean {
  try {
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='games'",
      )
      .get();
    if (!row) return false;
    const count = db.prepare("SELECT COUNT(*) as c FROM games").get() as {
      c: number;
    };
    return count.c > 0;
  } catch {
    return false;
  }
}

function applySchema() {
  const schemaPath = path.resolve(rootDir, "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.warn("[db] schema.sql not found, skipping schema apply.");
    return;
  }
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  console.log("[db] Schema applied.");
}

function seedData() {
  const dataPath = path.resolve(rootDir, "data.sql");
  if (!fs.existsSync(dataPath)) {
    console.warn("[db] data.sql not found, skipping seed.");
    return;
  }

  console.log("[db] Seeding database from data.sql...");

  const sql = fs.readFileSync(dataPath, "utf-8");

  const statements = sql
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 && !line.startsWith("#") && !line.startsWith("--"),
    );

  const seed = db.transaction(() => {
    for (const stmt of statements) {
      try {
        db.prepare(stmt).run();
      } catch (err) {
        const msg = (err as Error).message;
        if (
          !msg.includes("UNIQUE constraint") &&
          !msg.includes("already exists")
        ) {
          console.warn("[db] Seed warning:", msg, "\n  →", stmt.slice(0, 80));
        }
      }
    }
  });

  seed();
  console.log("[db] Seeding complete.");
}

export function initDb() {
  applySchema();

  if (!isSeeded()) {
    seedData();
  } else {
    console.log("[db] Database already seeded, skipping.");
  }
}
