import { Router } from "express";
import { getGameTypeStats, getHeatmap } from "../controllers/stats.controller.js";

const router = Router();

router.get("/game-types", getGameTypeStats);
router.get("/heatmap", getHeatmap);

export default router;
