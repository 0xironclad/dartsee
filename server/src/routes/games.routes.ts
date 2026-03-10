import { Router } from "express";
import { listGames, getGame } from "../controllers/games.controller.js";

const router = Router();

// GET /api/games
router.get("/", listGames);

// GET /api/games/:id
router.get("/:id", getGame);

export default router;
