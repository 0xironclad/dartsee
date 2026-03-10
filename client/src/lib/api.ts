export type GameListItem = {
  id: number
  type: string | null
  playerCount: number
}

export type GameDetail = {
  id: number
  type: string | null
  players: PlayerStats[]
}

export type PlayerStats = {
  id: string
  name: string | null
  avgRoundScore: number
  missCount: number
}

export type GameTypeStat = {
  type: string | null
  count: number
}

export type HeatmapPoint = {
  x: number
  y: number
}

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export const api = {
  listGames: () => apiFetch<GameListItem[]>("/api/games"),
  getGame: (id: number) => apiFetch<GameDetail>(`/api/games/${id}`),
  gameTypeStats: () => apiFetch<GameTypeStat[]>("/api/stats/game-types"),
  heatmap: (gameId?: number) =>
    apiFetch<HeatmapPoint[]>(
      gameId ? `/api/stats/heatmap?gameId=${gameId}` : "/api/stats/heatmap"
    ),
}
