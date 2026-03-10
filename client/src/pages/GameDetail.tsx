import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { api, GameDetail as GameDetailType } from "@/lib/api"

const formatType = (type: string | null) => type ?? "Unknown"

const GameDetail = () => {
  const params = useParams()
  const gameId = useMemo(() => Number(params.id), [params.id])
  const [game, setGame] = useState<GameDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(gameId)) {
      setError("Invalid game id")
      setLoading(false)
      return
    }

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
  }, [gameId])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Game Details</h1>
          <p className="text-sm text-muted-foreground">
            Round averages are calculated per 3 consecutive throws.
          </p>
        </div>
        <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Back to games
        </Link>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border p-6">Loading game…</div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : game ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <div className="text-xs uppercase text-muted-foreground">Game</div>
            <div className="text-lg font-semibold">
              #{game.id} · {formatType(game.type)}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Player</th>
                  <th className="px-4 py-2 font-medium">Avg Round Score</th>
                  <th className="px-4 py-2 font-medium">Misses</th>
                </tr>
              </thead>
              <tbody>
                {game.players.map((player) => (
                  <tr key={player.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {player.name ?? "Unknown player"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">{player.avgRoundScore}</td>
                    <td className="px-4 py-3">{player.missCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default GameDetail
