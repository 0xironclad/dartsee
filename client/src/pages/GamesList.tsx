import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react"
import { api, type GameListItem } from "@/lib/api"
import { getGameTypeConfig } from "@/lib/gameTypes"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 24

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "...")[] = []
  const delta = 2
  pages.push(1)
  if (current - delta > 2) pages.push("...")
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    pages.push(i)
  }
  if (current + delta < total - 1) pages.push("...")
  pages.push(total)
  return pages
}

export default function GamesList() {
  const [games, setGames] = useState<GameListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type)
    setPage(1)
  }

  const handleSearchChange = (q: string) => {
    setSearch(q)
    setPage(1)
  }

  useEffect(() => {
    api
      .listGames()
      .then((data) => {
        setGames(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load games")
        setLoading(false)
      })
  }, [])

  const types = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const g of games) {
      if (g.type) counts[g.type] = (counts[g.type] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)
  }, [games])

  const filtered = useMemo(() => {
    let result = games
    if (selectedType) result = result.filter((g) => g.type === selectedType)
    const q = search.trim()
    if (q) result = result.filter((g) => String(g.id).includes(q))
    return result
  }, [games, selectedType, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const startItem = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, filtered.length)

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">Games</h1>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {games.length.toLocaleString()} total
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Browse all recorded games and drill into player stats.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by game ID…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        {!loading && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleTypeChange(null)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedType === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {types.map((type) => {
              const cfg = getGameTypeConfig(type)
              const active = selectedType === type
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(active ? null : type)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? cn(cfg.bg, cfg.text, cfg.border)
                      : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Subtle result count when filtering */}
      {!loading && (selectedType || search.trim()) && (
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "No games match your filters."
            : `${filtered.length.toLocaleString()} game${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-22 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-muted-foreground">
          <Gamepad2 className="h-8 w-8 opacity-30" />
          <p className="text-sm">No games found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((game) => {
            const cfg = getGameTypeConfig(game.type)
            return (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="group block"
              >
                <Card
                  className={cn(
                    "relative overflow-hidden border transition-all duration-150",
                    "group-hover:-translate-y-0.5 group-hover:shadow-md"
                  )}
                >
                  {/* Colored top stripe */}
                  <div
                    className="absolute inset-x-0 top-0 h-0.5"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "mb-2 text-xs font-medium",
                            cfg.bg,
                            cfg.text,
                            cfg.border
                          )}
                        >
                          {cfg.label}
                        </Badge>
                        <div className="text-xl font-semibold tabular-nums">
                          #{game.id}
                        </div>
                      </div>
                      <div className="mt-0.5 flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="tabular-nums">{game.playerCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {startItem}–{endItem} of {filtered.length.toLocaleString()}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`e-${i}`}
                  className="px-1 text-xs text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
