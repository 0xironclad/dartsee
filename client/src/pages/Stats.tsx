import { useEffect, useMemo, useState } from "react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { api, GameTypeStat, HeatmapPoint } from "@/lib/api"

const chartColors = [
  "hsl(158 64% 52%)",
  "hsl(174 62% 41%)",
  "hsl(190 62% 38%)",
  "hsl(206 65% 45%)",
  "hsl(222 60% 50%)",
]

const formatType = (type: string | null) => type ?? "Unknown"

const Stats = () => {
  const [types, setTypes] = useState<GameTypeStat[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.gameTypeStats(), api.heatmap()])
      .then(([typesData, heatmapData]) => {
        setTypes(typesData)
        setHeatmap(heatmapData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load stats")
        setLoading(false)
      })
  }, [])

  const totalGames = useMemo(
    () => types.reduce((sum, item) => sum + item.count, 0),
    [types]
  )

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Game Popularity</h1>
        <p className="text-sm text-muted-foreground">
          Game type distribution and throw heatmap overview.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border p-6">Loading stats…</div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <div className="rounded-lg border border-border p-4">
            <div className="text-sm font-medium">Game Types</div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={types}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {types.map((_, index) => (
                      <Cell
                        key={index}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}`, "Games"]}
                    labelFormatter={(label) => formatType(label as string | null)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Total games: {totalGames}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="text-sm font-medium">Throw Heatmap</div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/20">
              <svg
                viewBox="0 0 800 800"
                className="h-80 w-full"
                aria-label="Throw heatmap"
              >
                <rect x="0" y="0" width="800" height="800" fill="transparent" />
                <circle
                  cx="400"
                  cy="400"
                  r="300"
                  fill="none"
                  stroke="hsl(215 20% 50% / 0.4)"
                  strokeWidth="2"
                />
                {heatmap.slice(0, 6000).map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={3}
                    fill="hsl(158 64% 52% / 0.25)"
                  />
                ))}
              </svg>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Showing {Math.min(heatmap.length, 6000)} throws. Board radius = 300.
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Stats
