import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb, db } from "./db.js";
import env from "./utils/env.js";

const app: express.Express = express();
const port = Number(env.PORT);
const corsOrigin = env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

initDb();
app.get("/", (_req, res) => {
  res.json({ message: "Hello, World!" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
