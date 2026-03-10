import { Request, Response } from "express";
import { db } from "../db.js";
import type { GameListItem, GameDetail, PlayerStat } from "../types/index.js";

// ─── GET /api/games ───────────────────────────────────────────────────────────

export function listGames(_req: Request, res: Response) {
  const games = db
    .prepare(
      `
      SELECT
        g.id,
        g.type,
        COUNT(gp.player_id) AS playerCount
      FROM games g
      LEFT JOIN game_players gp ON gp.game_id = g.id
      GROUP BY g.id
      ORDER BY g.id ASC
      `,
    )
    .all() as Array<{ id: number; type: string; playerCount: number }>;

  const result: GameListItem[] = games.map((g) => ({
    id: g.id,
    type: g.type,
    playerCount: g.playerCount,
  }));

  res.json(result);
}

// ─── GET /api/games/:id ───────────────────────────────────────────────────────

export function getGame(req: Request, res: Response) {
  const gameId = Number(req.params.id);

  if (isNaN(gameId)) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }

  const game = db
    .prepare("SELECT id, type FROM games WHERE id = ?")
    .get(gameId) as { id: number; type: string } | undefined;

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  // All players who participated in this game
  const players = db
    .prepare(
      `
      SELECT p.id AS playerId, p.name
      FROM game_players gp
      JOIN players p ON p.id = gp.player_id
      WHERE gp.game_id = ?
      `,
    )
    .all(gameId) as Array<{ playerId: string; name: string }>;

  // All throws for this game, ordered per player then by throw id
  // (id is the insertion-order surrogate key, so ascending id = chronological)
  const throws = db
    .prepare(
      `
      SELECT player_id AS playerId, score, modifier
      FROM throws
      WHERE game_id = ?
      ORDER BY player_id, id ASC
      `,
    )
    .all(gameId) as Array<{
    playerId: string;
    score: number;
    modifier: number;
  }>;

  // Group throws by player
  const throwsByPlayer = new Map<
    string,
    Array<{ score: number; modifier: number }>
  >();

  for (const t of throws) {
    if (!throwsByPlayer.has(t.playerId)) {
      throwsByPlayer.set(t.playerId, []);
    }
    throwsByPlayer.get(t.playerId)!.push({ score: t.score, modifier: t.modifier });
  }

  const playerStats: PlayerStat[] = players.map(({ playerId, name }) => {
    const playerThrows = throwsByPlayer.get(playerId) ?? [];

    // Miss count: modifier === 0 means the dart missed the board entirely
    const missCount = playerThrows.filter((t) => t.modifier === 0).length;

    // Average score per round: a round is every 3 consecutive throws
    // We sum each complete group of 3 and average across all rounds
    let totalRoundScore = 0;
    let roundCount = 0;

    for (let i = 0; i + 2 < playerThrows.length; i += 3) {
      const roundScore =
        playerThrows[i].score +
        playerThrows[i + 1].score +
        playerThrows[i + 2].score;
      totalRoundScore += roundScore;
      roundCount++;
    }

    const avgScorePerRound =
      roundCount > 0
        ? Math.round((totalRoundScore / roundCount) * 100) / 100
        : 0;

    return {
      playerId,
      name,
      avgScorePerRound,
      missCount,
    };
  });

  const result: GameDetail = {
    id: game.id,
    type: game.type,
    players: playerStats,
  };

  res.json(result);
}
