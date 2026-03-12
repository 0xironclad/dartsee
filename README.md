# Dartsee

A full-stack darts analytics application. The server exposes a REST API backed by a SQLite database; the client is a React single-page application that visualises game and throw data.
<img width="1789" height="1081" alt="Untitled" src="https://github.com/user-attachments/assets/fe9f3155-ae1e-42d0-8df5-2ad52089246f" />


---

## Repository structure

```
dartsee/
├── client/          # React + TypeScript + Vite frontend
└── server/          # Node.js + Express + TypeScript + SQLite backend
```

Both packages are managed as a pnpm workspace.

---

## Prerequisites

- Node.js 18+
- pnpm

> If you use npm, replace `pnpm install` with `npm install` and `pnpm dev` with `npm run dev` in all commands below. Note that the pnpm workspace setup (`pnpm-workspace.yaml`) is not used when running npm directly — each package must be installed and run from its own directory, which is how the steps below are already structured.

---

## Server

**Stack:** Node.js, Express, better-sqlite3, Zod, TypeScript (ESM)

**Database:** SQLite. Schema is applied from `server/schema.sql` on startup; seed data is loaded from `server/data.sql` on first run.

**Schema overview**

| Table | Purpose |
|---|---|
| `games` | One row per game, stores game type (e.g. `x01`) |
| `players` | Player registry |
| `game_players` | Junction table linking players to games |
| `throws` | Individual throws: score, modifier, and x/y board coordinates |

**Environment variables** (copy `.env.example` to `.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the server listens on |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `DB_PATH` | `data/app.db` | Path to the SQLite database file |

**Setup**

```bash
cd server
pnpm install
cp .env.example .env
pnpm dev
```

Server runs on `http://localhost:3001`.

**API endpoints**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/games` | List all games with player count |
| `GET` | `/api/games/:id` | Game detail with per-player stats (avg score per round, miss count) |
| `GET` | `/api/stats/game-types` | Game count grouped by type |
| `GET` | `/api/stats/heatmap` | Throw coordinates for all games; filter by `?gameType=x01` |
| `GET` | `/health` | Health check — returns `{ ok: true }` |

---

## Client

**Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts, React Router v6

**Setup**

```bash
cd client
pnpm install
pnpm dev
```

Vite dev server runs on `http://localhost:5173`. All `/api` requests are proxied to `http://localhost:3001`.

**Pages**

| Route | Description |
|---|---|
| `/` | Paginated list of all games |
| `/games/:id` | Game detail — players, average score per round, miss count |
| `/stats` | Pie chart of games by type; interactive dartboard heatmap of throw coordinates, filterable by game type |

The heatmap renders up to 8,000 SVG data points and distinguishes on-board throws (green) from out-of-board throws (red). Throw coordinates use a 0–800 grid with the board centred at (400, 400) and a double-ring radius of 300.

---

## Development scripts

| Location | Command | Action |
|---|---|---|
| `server/` | `pnpm dev` | Start server with hot reload via tsx |
| `server/` | `pnpm build` | Compile TypeScript to `dist/` |
| `server/` | `pnpm start` | Run compiled output |
| `server/` | `pnpm type-check` | Type-check without emitting |
| `client/` | `pnpm dev` | Start Vite dev server |
| `client/` | `pnpm build` | Type-check and produce production bundle |
| `client/` | `pnpm lint` | Run ESLint |
| `client/` | `pnpm format` | Format source files with Prettier |
| `client/` | `pnpm typecheck` | Type-check without emitting |
