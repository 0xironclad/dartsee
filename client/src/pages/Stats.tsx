import { useEffect, useMemo, useState } from "react"
import { Layers, Target, Zap, CircleAlert } from "lucide-react"
import { api, type GameTypeStat, type HeatmapPoint } from "@/lib/api"
import { getGameTypeConfig, GAME_TYPE_CONFIG } from "@/lib/gameTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"


const BOARD_CX = 400
const BOARD_CY = 400
const R_DOUBLE_OUT = 300
const R_DOUBLE_IN = 286
const R_TREBLE_OUT = 189
const R_TREBLE_IN = 175
const R_BULL = 56
const R_BULLSEYE = 12


function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
            {sub && (
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


function GameTypeDonut({ types }: { types: GameTypeStat[] }) {
  const total = useMemo(() => types.reduce((s, t) => s + t.count, 0), [types])

  const chartConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        types.map((t) => [
          t.type,
          {
            label: getGameTypeConfig(t.type).label,
            color: getGameTypeConfig(t.type).color,
          },
        ])
      ),
    [types]
  )

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Game Type Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {total.toLocaleString()} games across {types.length} game types
        </p>
      </CardHeader>
      <CardContent>
        {/* Donut */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-52 w-full max-w-xs"
        >
          <PieChart>
            <Pie
              data={types}
              dataKey="count"
              nameKey="type"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={0}
            >
              {types.map((t) => (
                <Cell key={t.type} fill={getGameTypeConfig(t.type).color} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const pct = ((Number(value) / total) * 100).toFixed(1)
                    return (
                      <span className="font-medium">
                        {value} games{" "}
                        <span className="text-muted-foreground">({pct}%)</span>
                      </span>
                    )
                  }}
                  nameKey="type"
                />
              }
            />
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {types.map((t) => {
            const cfg = getGameTypeConfig(t.type)
            const pct = ((t.count / total) * 100).toFixed(1)
            return (
              <div key={t.type} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="min-w-0 truncate text-muted-foreground">
                  {cfg.label}
                </span>
                <span className="ml-auto shrink-0 font-medium tabular-nums">
                  {t.count}
                </span>
                <span className="w-8 shrink-0 text-right text-muted-foreground tabular-nums">
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


function DartboardHeatmap({
  throws,
  loading,
}: {
  throws: HeatmapPoint[]
  loading: boolean
}) {
  const inBoard = throws.filter((p) => {
    const dx = p.x - BOARD_CX
    const dy = p.y - BOARD_CY
    return dx * dx + dy * dy <= R_DOUBLE_OUT * R_DOUBLE_OUT
  })
  const outBoard = throws.filter((p) => {
    const dx = p.x - BOARD_CX
    const dy = p.y - BOARD_CY
    return dx * dx + dy * dy > R_DOUBLE_OUT * R_DOUBLE_OUT
  })

  // Cap renders for perf (SVG dots)
  const MAX_DOTS = 8000
  const visibleIn = inBoard.slice(
    0,
    Math.round((inBoard.length / throws.length) * MAX_DOTS) || MAX_DOTS
  )
  const visibleOut = outBoard.slice(
    0,
    Math.round((outBoard.length / throws.length) * MAX_DOTS) || 0
  )

  return (
    <div className="space-y-3">
      {loading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-zinc-950">
          <svg
            viewBox="0 0 800 800"
            className="h-80 w-full"
            aria-label="Throw heatmap dartboard"
          >
            {/* Board background */}
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_DOUBLE_OUT}
              fill="#18181b"
            />

            {/* Ring zones - subtle fills */}
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_DOUBLE_OUT}
              fill="none"
              stroke="#3f3f46"
              strokeWidth={R_DOUBLE_OUT - R_DOUBLE_IN}
              strokeOpacity={0.6}
            />
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={(R_DOUBLE_OUT + R_DOUBLE_IN) / 2}
              fill="none"
              stroke="#3f3f46"
              strokeWidth={R_DOUBLE_OUT - R_DOUBLE_IN}
            />
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_TREBLE_OUT}
              fill="none"
              stroke="#27272a"
              strokeWidth={R_TREBLE_OUT - R_TREBLE_IN}
              strokeOpacity={0.9}
            />
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={(R_TREBLE_OUT + R_TREBLE_IN) / 2}
              fill="none"
              stroke="#27272a"
              strokeWidth={R_TREBLE_OUT - R_TREBLE_IN}
            />

            {/* Ring dividers */}
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_DOUBLE_OUT}
              fill="none"
              stroke="#52525b"
              strokeWidth="1.5"
            />
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_DOUBLE_IN}
              fill="none"
              stroke="#52525b"
              strokeWidth="1"
              strokeOpacity={0.5}
            />
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_TREBLE_OUT}
              fill="none"
              stroke="#52525b"
              strokeWidth="1"
              strokeOpacity={0.5}
            />
            <circle
              cx={BOARD_CX}
              cy={BOARD_CY}
              r={R_TREBLE_IN}
              fill="none"
              stroke="#52525b"
              strokeWidth="1"
              strokeOpacity={0.5}
            />
            <circle cx={BOARD_CX} cy={BOARD_CY} r={R_BULL} fill="#166534" />
            <circle cx={BOARD_CX} cy={BOARD_CY} r={R_BULLSEYE} fill="#991b1b" />

            {/* Out-of-board misses — red-ish */}
            {visibleOut.map((p, i) => (
              <circle
                key={`out-${i}`}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill="#ef4444"
                fillOpacity={0.18}
              />
            ))}

            {/* In-board hits — green/teal */}
            {visibleIn.map((p, i) => (
              <circle
                key={`in-${i}`}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill="#10b981"
                fillOpacity={0.22}
              />
            ))}

            {/* Crosshair at center */}
            <line
              x1={BOARD_CX - 8}
              y1={BOARD_CY}
              x2={BOARD_CX + 8}
              y2={BOARD_CY}
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity={0.3}
            />
            <line
              x1={BOARD_CX}
              y1={BOARD_CY - 8}
              x2={BOARD_CX}
              y2={BOARD_CY + 8}
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity={0.3}
            />
          </svg>
        </div>
      )}

      {/* Legend */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-70" />
            On board ({inBoard.length.toLocaleString()})
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 opacity-70" />
            Out of board ({outBoard.length.toLocaleString()})
          </div>
          {throws.length > MAX_DOTS && (
            <span className="text-muted-foreground/60">
              Showing {Math.min(throws.length, MAX_DOTS).toLocaleString()} of{" "}
              {throws.length.toLocaleString()} throws
            </span>
          )}
        </div>
      )}
    </div>
  )
}


export default function Stats() {
  const [types, setTypes] = useState<GameTypeStat[]>([])
  const [heatmapThrows, setHeatmapThrows] = useState<HeatmapPoint[]>([])
  const [heatmapLoading, setHeatmapLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setHeatmapLoading(true)
  }

  // Load game type stats once
  useEffect(() => {
    api
      .gameTypeStats()
      .then((data) => {
        setTypes(data)
        setStatsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load stats")
        setStatsLoading(false)
      })
  }, [])

  // Load heatmap whenever filter changes
  useEffect(() => {
    const gameType = selectedType === "all" ? undefined : selectedType
    api
      .heatmap(gameType)
      .then((data) => {
        setHeatmapThrows(data.throws)
        setHeatmapLoading(false)
      })
      .catch(() => {
        setHeatmapLoading(false)
      })
  }, [selectedType])

  const totalGames = useMemo(
    () => types.reduce((s, t) => s + t.count, 0),
    [types]
  )
  const totalThrows = useMemo(() => heatmapThrows.length, [heatmapThrows])
  const missRate = useMemo(() => {
    if (heatmapThrows.length === 0) return "—"
    const misses = heatmapThrows.filter((p) => p.modifier === 0).length
    return `${((misses / heatmapThrows.length) * 100).toFixed(1)}%`
  }, [heatmapThrows])

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        {error}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Statistics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Game popularity breakdown and throw heatmap.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {statsLoading ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : (
          <>
            <SummaryCard
              icon={<Layers className="h-4 w-4" />}
              label="Total Games"
              value={totalGames.toLocaleString()}
            />
            <SummaryCard
              icon={<Target className="h-4 w-4" />}
              label="Game Types"
              value={types.length}
              sub="unique variants"
            />
            <SummaryCard
              icon={<Zap className="h-4 w-4" />}
              label="Most Popular"
              value={types[0] ? getGameTypeConfig(types[0].type).label : "—"}
              sub={types[0] ? `${types[0].count} games` : undefined}
            />
          </>
        )}
      </div>

      {/* Main content: Donut + Heatmap */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Donut chart */}
        {statsLoading ? (
          <Skeleton className="h-[480px] rounded-xl" />
        ) : (
          <GameTypeDonut types={types} />
        )}

        {/* Heatmap */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-medium">
                  Throw Heatmap
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Where darts land on the board
                </p>
              </div>

              {/* Game type filter */}
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(GAME_TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Active filter badge */}
            {selectedType !== "all" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filtered:</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getGameTypeConfig(selectedType).bg,
                    getGameTypeConfig(selectedType).text,
                    getGameTypeConfig(selectedType).border
                  )}
                >
                  {getGameTypeConfig(selectedType).label}
                </Badge>
              </div>
            )}

            <DartboardHeatmap throws={heatmapThrows} loading={heatmapLoading} />

            {/* Throw stats row */}
            {!heatmapLoading && (
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total throws</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {totalThrows.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Miss rate</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {missRate}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
