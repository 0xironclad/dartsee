import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import env from "./utils/env.js";
import gamesRouter from "./routes/games.routes.js";
import statsRouter from "./routes/stats.routes.js";

const app: express.Express = express();
const port = Number(env.PORT) || 3001;
const corsOrigin = env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

initDb();

app.use("/api/games", gamesRouter);
app.use("/api/stats", statsRouter);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
