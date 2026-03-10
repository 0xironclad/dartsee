import { Router } from "express";
import { getGameTypeStats, getHeatmap } from "../controllers/stats.controller.js";

const router = Router();

// GET /api/stats/game-types
router.get("/game-types", getGameTypeStats);

// GET /api/stats/heatmap?gameType=x01
router.get("/heatmap", getHeatmap);

export default router;
