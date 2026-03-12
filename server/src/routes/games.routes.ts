import { Router } from "express";
import { listGames, getGame } from "../controllers/games.controller.js";

const router = Router();

router.get("/", listGames);
router.get("/:id", getGame);

export default router;
