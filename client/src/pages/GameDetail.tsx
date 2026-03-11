import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Target, CircleAlert, Trophy, Crosshair } from "lucide-react"
import { api, type GameDetail as GameDetailType } from "@/lib/api"
import { getGameTypeConfig } from "@/lib/gameTypes"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"


function stringToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

function PlayerAvatar({ name }: { name: string | null }) {
  const initials = name
    ? name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  const hue = stringToHue(name ?? "?")
  const bg = `hsl(${hue} 55% 38%)`
  const fg = `hsl(${hue} 30% 92%)`

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{ backgroundColor: bg, color: fg }}
      aria-label={name ?? "Unknown player"}
    >
      {initials}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border px-4 py-3",
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30"
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "text-2xl font-semibold tabular-nums",
          highlight && "text-primary"
        )}
      >
        {value}
      </div>
    </div>
  )
}

export default function GameDetail() {
  const params = useParams()
  const gameId = useMemo(() => Number(params.id), [params.id])
  const isValidId = Number.isFinite(gameId) && gameId > 0

  const [game, setGame] = useState<GameDetailType | null>(null)
  const [loading, setLoading] = useState(isValidId)
  const [error, setError] = useState<string | null>(
    isValidId ? null : "Invalid game id"
  )

  useEffect(() => {
    if (!isValidId) return

    api
      .getGame(gameId)
      .then((data) => {
        setGame(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load game")
        setLoading(false)
      })
  }, [gameId, isValidId])

  const maxAvg = useMemo(
    () =>
      game ? Math.max(...game.players.map((p) => p.avgScorePerRound), 1) : 1,
    [game]
  )

  const cfg = useMemo(() => getGameTypeConfig(game?.type), [game?.type])

  return (
    <section className="space-y-6">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Games
      </Link>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-28 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : game ? (
        <>
          {/* Hero */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
            {/* Faint background type label */}
            <div
              className="pointer-events-none absolute -right-4 -bottom-6 text-[6rem] leading-none font-black tracking-tighter uppercase opacity-[0.04] select-none"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </div>

            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    cfg.bg,
                    cfg.text,
                    cfg.border
                  )}
                >
                  {cfg.label}
                </Badge>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums">
                    #{game.id}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {game.players.length}{" "}
                    {game.players.length === 1 ? "player" : "players"}
                  </span>
                </div>
              </div>

              {/* Quick summary stats */}
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Best avg</div>
                  <div className="text-lg font-semibold tabular-nums">
                    {game.players.length > 0
                      ? Math.max(
                          ...game.players.map((p) => p.avgScorePerRound)
                        ).toFixed(1)
                      : "—"}
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    Total misses
                  </div>
                  <div className="text-lg font-semibold tabular-nums">
                    {game.players.reduce((s, p) => s + p.missCount, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Players */}
          {game.players.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-muted-foreground">
              <Target className="h-8 w-8 opacity-30" />
              <p className="text-sm">No player data for this game.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  Players
                </h2>
                <span className="text-xs text-muted-foreground">
                  Round = 3 consecutive throws
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...game.players]
                  .sort((a, b) => b.avgScorePerRound - a.avgScorePerRound)
                  .map((player, rank) => {
                    const performancePct =
                      maxAvg > 0
                        ? Math.round((player.avgScorePerRound / maxAvg) * 100)
                        : 0
                    const isTop = rank === 0 && game.players.length > 1

                    return (
                      <Card
                        key={player.playerId}
                        className={cn(
                          "relative overflow-hidden transition-shadow hover:shadow-md",
                          isTop && "ring-1 ring-primary/30"
                        )}
                      >
                        {isTop && (
                          <div className="absolute top-0 right-0 rounded-bl-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <Trophy className="mr-0.5 inline h-3 w-3" />
                            Top
                          </div>
                        )}

                        <CardContent className="space-y-4 p-5">
                          {/* Player identity */}
                          <div className="flex items-center gap-3">
                            <PlayerAvatar name={player.name} />
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {player.name ?? "Unknown Player"}
                              </div>
                              <div className="truncate font-mono text-xs text-muted-foreground">
                                {player.playerId.slice(0, 8)}…
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Stats row */}
                          <div className="grid grid-cols-2 gap-3">
                            <StatCard
                              icon={<Crosshair className="h-3 w-3" />}
                              label="Avg / round"
                              value={player.avgScorePerRound.toFixed(1)}
                              highlight={isTop}
                            />
                            <StatCard
                              icon={<Target className="h-3 w-3" />}
                              label="Misses"
                              value={player.missCount}
                            />
                          </div>

                          {/* Performance bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Performance</span>
                              <span className="tabular-nums">
                                {performancePct}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${performancePct}%`,
                                  backgroundColor: cfg.color,
                                  opacity: 0.8,
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </>
          )}
        </>
      ) : null}
    </section>
  )
}
