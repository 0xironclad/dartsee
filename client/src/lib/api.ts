export type GameListItem = {
  id: number
  type: string | null
  playerCount: number
}

export type PlayerStats = {
  playerId: string
  name: string | null
  avgScorePerRound: number
  missCount: number
}

export type GameDetail = {
  id: number
  type: string | null
  players: PlayerStats[]
}

export type GameTypeStat = {
  type: string
  count: number
}

export type HeatmapPoint = {
  x: number
  y: number
  score: number
  modifier: number
}

export type HeatmapResponse = {
  gameType: string | null
  throws: HeatmapPoint[]
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
  heatmap: (gameType?: string) =>
    apiFetch<HeatmapResponse>(
      gameType
        ? `/api/stats/heatmap?gameType=${encodeURIComponent(gameType)}`
        : "/api/stats/heatmap"
    ),
}
