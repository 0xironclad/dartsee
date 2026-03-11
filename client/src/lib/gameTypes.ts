export type GameTypeConfig = {
  label: string
  color: string        
  chartColor: string   
  bg: string           
  text: string         
  border: string       
}

export const GAME_TYPE_CONFIG: Record<string, GameTypeConfig> = {
  x01: {
    label: "X01",
    color: "#3b82f6",
    chartColor: "var(--color-chart-1)",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  cricket: {
    label: "Cricket",
    color: "#22c55e",
    chartColor: "var(--color-chart-2)",
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/30",
  },
  killer: {
    label: "Killer",
    color: "#ef4444",
    chartColor: "var(--color-chart-3)",
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  golf: {
    label: "Golf",
    color: "#84cc16",
    chartColor: "var(--color-chart-4)",
    bg: "bg-lime-500/15",
    text: "text-lime-400",
    border: "border-lime-500/30",
  },
  cannon: {
    label: "Cannon",
    color: "#f97316",
    chartColor: "var(--color-chart-5)",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  moon: {
    label: "Moon",
    color: "#a855f7",
    chartColor: "var(--color-chart-1)",
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  football: {
    label: "Football",
    color: "#06b6d4",
    chartColor: "var(--color-chart-2)",
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  radar: {
    label: "Radar",
    color: "#ec4899",
    chartColor: "var(--color-chart-3)",
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    border: "border-pink-500/30",
  },
  conqueror: {
    label: "Conqueror",
    color: "#eab308",
    chartColor: "var(--color-chart-4)",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  shanghai: {
    label: "Shanghai",
    color: "#14b8a6",
    chartColor: "var(--color-chart-5)",
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
  },
  practice: {
    label: "Practice",
    color: "#94a3b8",
    chartColor: "var(--color-chart-1)",
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    border: "border-slate-500/30",
  },
  expo: {
    label: "Expo",
    color: "#6366f1",
    chartColor: "var(--color-chart-2)",
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
  },
  fight: {
    label: "Fight",
    color: "#f43f5e",
    chartColor: "var(--color-chart-3)",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
  beer: {
    label: "Beer",
    color: "#f59e0b",
    chartColor: "var(--color-chart-4)",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
}

/** Fallback config for unknown game types */
export const FALLBACK_CONFIG: GameTypeConfig = {
  label: "Unknown",
  color: "#71717a",
  chartColor: "var(--color-chart-5)",
  bg: "bg-zinc-500/15",
  text: "text-zinc-400",
  border: "border-zinc-500/30",
}

export function getGameTypeConfig(type: string | null | undefined): GameTypeConfig {
  if (!type) return FALLBACK_CONFIG
  return GAME_TYPE_CONFIG[type.toLowerCase()] ?? FALLBACK_CONFIG
}
