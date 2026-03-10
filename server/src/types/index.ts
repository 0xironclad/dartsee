export interface Game {
  id: number;
  type: string;
}

export interface GameListItem {
  id: number;
  type: string;
  playerCount: number;
}

export interface PlayerStat {
  playerId: string;
  name: string;
  avgScorePerRound: number;
  missCount: number;
}

export interface GameDetail {
  id: number;
  type: string;
  players: PlayerStat[];
}

export interface GameTypeCount {
  type: string;
  count: number;
}

export interface ThrowCoordinate {
  x: number;
  y: number;
  score: number;
  modifier: number;
}

export interface HeatmapData {
  gameType: string | null;
  throws: ThrowCoordinate[];
}

export interface ApiError {
  error: string;
}
