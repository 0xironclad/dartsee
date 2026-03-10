import { Request, Response } from "express";
import { db } from "../db.js";
import type { GameTypeCount, HeatmapData, ThrowCoordinate } from "../types/index.js";

// ─── GET /api/stats/game-types ────────────────────────────────────────────────

export function getGameTypeStats(_req: Request, res: Response) {
  const rows = db
    .prepare(
      `
      SELECT type, COUNT(*) AS count
      FROM games
      GROUP BY type
      ORDER BY count DESC
      `,
    )
    .all() as Array<{ type: string; count: number }>;

  const result: GameTypeCount[] = rows.map((r) => ({
    type: r.type,
    count: r.count,
  }));

  res.json(result);
}

// ─── GET /api/stats/heatmap?gameType=x01 (bonus) ─────────────────────────────
// Returns x,y coordinates of all throws, optionally filtered by game type.
// Coordinates range 0–800. The dartboard is a circle centered at (400, 400)
// with radius 300. Points outside that circle are misses / out-of-board.

export function getHeatmap(req: Request, res: Response) {
  const gameType = (req.query.gameType as string | undefined) ?? null;

  let rows: Array<{ x: number; y: number; score: number; modifier: number }>;

  if (gameType) {
    // Validate that the game type actually exists to avoid empty-result confusion
    const exists = db
      .prepare("SELECT 1 FROM games WHERE type = ? LIMIT 1")
      .get(gameType);

    if (!exists) {
      res.status(404).json({ error: `Unknown game type: ${gameType}` });
      return;
    }

    rows = db
      .prepare(
        `
        SELECT t.x, t.y, t.score, t.modifier
        FROM throws t
        JOIN games g ON g.id = t.game_id
        WHERE g.type = ?
          AND t.game_id IS NOT NULL
          AND t.x IS NOT NULL
          AND t.y IS NOT NULL
        `,
      )
      .all(gameType) as typeof rows;
  } else {
    rows = db
      .prepare(
        `
        SELECT x, y, score, modifier
        FROM throws
        WHERE game_id IS NOT NULL
          AND x IS NOT NULL
          AND y IS NOT NULL
        `,
      )
      .all() as typeof rows;
  }

  const throws: ThrowCoordinate[] = rows.map((r) => ({
    x: r.x,
    y: r.y,
    score: r.score,
    modifier: r.modifier,
  }));

  const result: HeatmapData = {
    gameType,
    throws,
  };

  res.json(result);
}
