# Dartsee Full-Stack Demo

## Prerequisites
- Node.js 18+
- `pnpm`

## Backend
```bash
cd server
pnpm install
pnpm db:seed
pnpm dev
```
Server runs on `http://localhost:3001`.

## Frontend
```bash
cd client
pnpm install
pnpm dev
```
Vite dev server runs on `http://localhost:5173` and proxies `/api` to the backend.

## Routes
- `/` Games list
- `/games/:id` Game detail
- `/stats` Game type pie chart + throw heatmap
